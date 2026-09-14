import type { AuthenticateResult } from "mailauth";

import type { Layer1Signal } from "./layer1";

type ReceivedHop = {
  from?: { comment?: string; value?: string };
  by?: { comment?: string; value?: string };
};

type IpQualityScoreResponse = {
  success?: boolean;
  proxy?: boolean;
  vpn?: boolean;
  hosting?: boolean;
  ISP?: string;
  ASN?: number;
};

const TOR_EXIT_LIST_URL = "https://check.torproject.org/torbulkexitlist";
const TOR_CACHE_TTL_MS = 60 * 60 * 1000;
const IP_PATTERN = /\b(?:\d{1,3}\.){3}\d{1,3}\b|(?<![\w:])[0-9a-f:]{2,39}(?![\w:])/gi;
const IPV4_PRIVATE = [
  /^10\./,
  /^127\./,
  /^169\.254\./,
  /^172\.(?:1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
];
const RECIPIENT_PROVIDER_HOST = /(?:^|\.)(?:google|gmail|googlemail|outlook|hotmail|microsoft|office365|yahoo|protonmail)\./i;

let torCache: { expiresAt: number; ips: Set<string> } | undefined;

function normalizeIp(ip: string): string | undefined {
  const normalized = ip.replace(/^\[|\]$/g, "").toLowerCase();
  if (normalized.includes(".") && normalized.split(".").some((part) => Number(part) > 255)) {
    return undefined;
  }
  if (normalized.includes(":")) {
    const sections = normalized.split("::");
    if (sections.length > 2 || sections.some((section) => section.split(":").some((part) => part.length > 4))) {
      return undefined;
    }
  }
  return normalized;
}

function isExternalIp(ip: string): boolean {
  return !IPV4_PRIVATE.some((pattern) => pattern.test(ip)) &&
    ip !== "::1" &&
    !ip.startsWith("fc") &&
    !ip.startsWith("fd") &&
    !ip.startsWith("fe80:");
}

function extractIps(value: unknown): string[] {
  return typeof value === "string"
    ? value.match(IP_PATTERN)?.map(normalizeIp).filter((ip): ip is string => Boolean(ip)) ?? []
    : [];
}

function hopIps(hop: ReceivedHop): string[] {
  const hopText = [hop.from?.comment, hop.from?.value, hop.by?.comment, hop.by?.value].filter(Boolean).join(" ");
  if (RECIPIENT_PROVIDER_HOST.test(hopText)) return [];
  return [...extractIps(hop.from?.comment), ...extractIps(hop.from?.value), ...extractIps(hop.by?.comment), ...extractIps(hop.by?.value)];
}

async function torExitIps(): Promise<Set<string>> {
  if (torCache && torCache.expiresAt > Date.now()) return torCache.ips;

  try {
    const response = await fetch(TOR_EXIT_LIST_URL);
    if (!response.ok) throw new Error(`Tor list returned ${response.status}`);
    const ips = new Set(
      (await response.text()).split(/\s+/).map(normalizeIp).filter((ip): ip is string => Boolean(ip)),
    );
    torCache = { expiresAt: Date.now() + TOR_CACHE_TTL_MS, ips };
    return ips;
  } catch (error) {
    console.warn("Unable to refresh Tor exit list; skipping Tor detection.", error);
    torCache = { expiresAt: Date.now() + TOR_CACHE_TTL_MS, ips: torCache?.ips ?? new Set() };
    return torCache?.ips ?? new Set();
  }
}

async function lookupIpQualityScore(ip: string): Promise<IpQualityScoreResponse | undefined> {
  const key = process.env.IPQUALITYSCORE_API_KEY;
  if (!key) return undefined;

  try {
    const response = await fetch(`https://ipqualityscore.com/api/json/ip/${key}/${ip}?strictness=1`);
    if (!response.ok) throw new Error(`IPQualityScore returned ${response.status}`);
    return (await response.json()) as IpQualityScoreResponse;
  } catch (error) {
    console.warn(`Unable to query IP intelligence for ${ip}; skipping lookup.`, error);
    return undefined;
  }
}

export async function detectAnonymizer(
  receivedChain: readonly ReceivedHop[] = [],
  mailauth: Pick<AuthenticateResult, "spf">,
): Promise<Layer1Signal[]> {
  const candidates = new Map<string, number>();
  receivedChain.forEach((hop, hopIndex) => {
    if (candidates.size > 0) return;
    for (const ip of hopIps(hop)) {
      if (isExternalIp(ip)) {
        candidates.set(ip, hopIndex);
        break;
      }
    }
  });

  if (candidates.size === 0 && mailauth.spf !== false) {
    const clientIp = mailauth.spf["client-ip"];
    for (const ip of extractIps(clientIp)) {
      if (isExternalIp(ip)) candidates.set(ip, -1);
    }
  }

  const [torIps, intelligence] = await Promise.all([
    torExitIps(),
    Promise.all([...candidates.keys()].map(async (ip) => [ip, await lookupIpQualityScore(ip)] as const)),
  ]);
  const signals: Layer1Signal[] = [];

  for (const [ip, hopIndex] of candidates) {
    if (torIps.has(ip)) {
      signals.push({
        code: "tor_exit_node_detected",
        score: 25,
        explanation: `Originating IP ${ip} matches a known Tor exit node (source: Tor Project exit list, checked ${new Date().toISOString().slice(0, 10)}). Presence raises risk; absence does not rule out Tor because webmail commonly masks client IPs.`,
        ip,
        ...(hopIndex >= 0 ? { hopIndex } : {}),
      });
    }

    const result = intelligence.find(([candidate]) => candidate === ip)?.[1];
    if (result?.success && (result.proxy || result.vpn || result.hosting)) {
      const provider = result.ISP ?? "an IP intelligence provider";
      const asn = result.ASN ? `AS${result.ASN}` : "an unknown ASN";
      signals.push({
        code: "vpn_or_proxy_ip_detected",
        score: 15,
        explanation: `Originating IP ${ip} is registered to ${provider} (${asn}), associated with VPN, proxy, or hosting infrastructure. Presence raises risk; absence does not rule out usage because webmail commonly masks client IPs.`,
        ip,
        provider,
        ...(result.ASN ? { asn } : {}),
        ...(hopIndex >= 0 ? { hopIndex } : {}),
      });
    }
  }

  if (candidates.size === 0) {
    signals.push({
      code: "originating_ip_unavailable",
      score: 5,
      explanation: "No external originating IP was recovered; consumer webmail commonly masks the true client IP, so this does not rule out Tor or VPN usage.",
    });
  }

  return signals;
}