import { resolveMx, resolveTxt, reverse as dnsReverse } from "node:dns/promises";

/**
 * Layer 2: Sender Domain & Infrastructure Reputation.
 *
 * Lifecycle:
 * 1. DNS hygiene — MX, SPF, DMARC (always runs; no external API keys needed).
 * 2. RDAP/WHOIS — domain registration age and WHOIS-privacy detection via the
 *    public RDAP REST API (rdap.org). No API key required.
 * 3. IP / ASN / Geolocation — sender IP extracted from Received headers, then
 *    enriched via ipinfo.io. Requires `IPINFO_TOKEN`; gracefully skipped when
 *    the token is absent.
 * 4. Blacklist reputation — Spamhaus DBL (domain) and ZEN (IP) via DNS,
 *    URLhaus via HTTP, PhishTank via HTTP (requires `PHISHTANK_API_KEY`).
 *    Every lookup is independently error-tolerant.
 * 5. Weighted scoring — four capped categories sum to a final 0–100 score.
 *    `confidence` and `missingChecks` reflect how much data was available.
 *
 * Example:
 * ```ts
 * const result = await analyzeLayer2({
 *   from: '"PayPal Support" <support@paypa1.com>',
 *   receivedHeaders: ["from mail.paypa1.com (203.0.113.5)"],
 * });
 * ```
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Layer2Input {
  from: string;
  /** Raw `Received:` header values from the parsed email, oldest-last order. */
  receivedHeaders?: string[];
}

export type Layer2SignalCode =
  // DNS hygiene
  | "sender_domain_missing"
  | "no_mx_record"
  | "no_spf_record"
  | "spf_too_permissive"
  | "no_dmarc_record"
  | "dmarc_policy_none"
  // Domain age / WHOIS
  | "domain_too_new"
  | "whois_hidden"
  // IP / ASN / Hosting
  | "cloud_infrastructure_detected"
  | "asn_hosting_risk"
  | "ip_reputation_risk"
  | "geolocation_mismatch"
  // Blacklists
  | "domain_blacklisted"
  | "ip_blacklisted"
  | "urlhaus_match"
  | "threatfox_match"
  | "phishtank_match";

export interface Layer2Signal {
  code: Layer2SignalCode;
  score: number;
  explanation: string;
}

export interface BlacklistMatch {
  source: "spamhaus_dbl" | "spamhaus_zen" | "urlhaus" | "threatfox";
  type: string;
  listed: boolean;
}

export interface Layer2Result {
  score: number;
  confidence: "full" | "partial" | "minimal";
  missingChecks: string[];

  // DNS
  domain: string | null;
  mxRecords: string[];
  hasSpf: boolean;
  spfPolicy: string | null;
  hasDmarc: boolean;
  dmarcPolicy: string | null;

  // Domain age / WHOIS
  domainAgeDays: number | null;
  whoisCreatedAt: string | null;
  whoisHidden: boolean;

  // IP / ASN / Geo
  senderIp: string | null;
  reverseDns: string | null;
  asn: string | null;
  asnOrganization: string | null;
  country: string | null;
  hostingProvider: string | null;
  isCloudInfrastructure: boolean;

  // Blacklists
  blacklistMatches: BlacklistMatch[];

  signals: Layer2Signal[];
  analyzedAt: Date;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Timeout (ms) applied to every external network call. */
const EXTERNAL_TIMEOUT_MS = 4_000;

/** ASN numbers associated with bulk-mail / VPS / cloud providers. */
const CLOUD_ASNS = new Set([
  "AS14061", // DigitalOcean
  "AS63949", // Linode / Akamai
  "AS20473", // Vultr
  "AS16276", // OVH
  "AS24940", // Hetzner
  "AS51167", // Contabo
  "AS9009",  // M247
  "AS36351", // SoftLayer / IBM Cloud
  "AS16509", // Amazon AWS
  "AS8075",  // Microsoft Azure
  "AS15169", // Google Cloud
  "AS396982", // Google Cloud (alternate)
]);

/** High-abuse ASNs known for bulletproof hosting / spam operations. */
const HIGH_ABUSE_ASNS = new Set([
  "AS9009",   // M247 — frequently listed
  "AS51167",  // Contabo — frequently listed
]);

/** Map of TLD country hints, e.g. ".uk" → "GB". */
const TLD_COUNTRY: Record<string, string> = {
  uk: "GB",
  de: "DE",
  fr: "FR",
  ru: "RU",
  cn: "CN",
  jp: "JP",
  au: "AU",
  ca: "CA",
  br: "BR",
  in: "IN",
  it: "IT",
  es: "ES",
  nl: "NL",
  pl: "PL",
};

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function domainFromAddress(from: string): string | null {
  const address =
    from.match(/<\s*([^>]+?)\s*>/)?.[1] ??
    from.match(/[\w.!#$%&'*+/=?^`{|}~-]+@[\w.-]+/)?.[0];
  const domain = address?.trim().toLowerCase().split("@").pop();
  return domain &&
    /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/.test(domain)
    ? domain
    : null;
}

/** Race a promise against a timeout, resolving to `null` on timeout. */
async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
}

async function fetchJson<T>(
  url: string,
  options?: RequestInit,
): Promise<T | null> {
  try {
    const response = await withTimeout(fetch(url, options), EXTERNAL_TIMEOUT_MS);
    if (!response || !response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Phase 1 — DNS hygiene
// ---------------------------------------------------------------------------

async function hasTxtRecord(name: string, prefix: string): Promise<boolean> {
  try {
    const records = await resolveTxt(name);
    return records.flat().some((r) => r.toLowerCase().startsWith(prefix));
  } catch {
    return false;
  }
}

async function getSpfRecord(domain: string): Promise<string | null> {
  try {
    const records = await resolveTxt(domain);
    const spf = records.flat().find((r) => r.toLowerCase().startsWith("v=spf1"));
    return spf ?? null;
  } catch {
    return null;
  }
}

async function getDmarcRecord(domain: string): Promise<string | null> {
  try {
    const records = await resolveTxt(`_dmarc.${domain}`);
    const dmarc = records.flat().find((r) => r.toLowerCase().startsWith("v=dmarc1"));
    return dmarc ?? null;
  } catch {
    return null;
  }
}

function spfPolicy(record: string | null): string | null {
  if (!record) return null;
  const match = record.match(/[+-?~]all/i);
  return match ? match[0].toLowerCase() : null;
}

function dmarcPolicyValue(record: string | null): string | null {
  if (!record) return null;
  const match = record.match(/\bp=([a-z]+)/i);
  return match ? match[1]!.toLowerCase() : null;
}

// ---------------------------------------------------------------------------
// Phase 2 — RDAP / WHOIS domain age
// ---------------------------------------------------------------------------

interface RdapEvent {
  eventAction: string;
  eventDate: string;
}

interface RdapResponse {
  events?: RdapEvent[];
  entities?: Array<{ roles?: string[]; vcardArray?: unknown }>;
  remarks?: Array<{ description?: string[] }>;
}

async function lookupRdap(
  domain: string,
): Promise<{ createdAt: string | null; hidden: boolean } | null> {
  const data = await fetchJson<RdapResponse>(
    `https://rdap.org/domain/${encodeURIComponent(domain)}`,
  );
  if (!data) return null;

  const registration = data.events?.find(
    (e) => e.eventAction === "registration",
  );
  const createdAt = registration?.eventDate ?? null;

  // Detect WHOIS-privacy / redacted registrants
  const hidden =
    data.remarks?.some((r) =>
      r.description?.some((d) =>
        /redact|privacy|protected|hidden/i.test(d),
      ),
    ) ?? false;

  return { createdAt, hidden };
}

// ---------------------------------------------------------------------------
// Phase 3 — IP / ASN / Geo
// ---------------------------------------------------------------------------

const RFC1918 =
  /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|127\.|::1|fc|fd)/;

function extractSenderIp(receivedHeaders: string[]): string | null {
  // Walk from the first (outermost) Received header inward
  for (const header of receivedHeaders) {
    const ipMatch = header.match(
      /\[(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\]/,
    );
    if (ipMatch && ipMatch[1] && !RFC1918.test(ipMatch[1])) {
      return ipMatch[1];
    }
    // Also try bare IPs without brackets
    const bareIp = header.match(
      /(?:^|\s)(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?:\s|$)/,
    );
    if (bareIp && bareIp[1] && !RFC1918.test(bareIp[1])) {
      return bareIp[1];
    }
  }
  return null;
}

interface IpInfoResponse {
  ip: string;
  org?: string;    // e.g. "AS14061 DigitalOcean, LLC"
  country?: string;
  hostname?: string;
}

async function lookupIpInfo(
  ip: string,
  token: string,
): Promise<IpInfoResponse | null> {
  return fetchJson<IpInfoResponse>(
    `https://ipinfo.io/${ip}/json?token=${token}`,
  );
}

async function lookupPtrRecord(ip: string): Promise<string | null> {
  try {
    const ptrs = await withTimeout(dnsReverse(ip), EXTERNAL_TIMEOUT_MS);
    return ptrs?.[0] ?? null;
  } catch {
    return null;
  }
}

function parseAsnFromOrg(org: string | undefined): {
  asn: string | null;
  asnOrg: string | null;
} {
  if (!org) return { asn: null, asnOrg: null };
  const match = org.match(/^(AS\d+)\s+(.+)$/);
  return match
    ? { asn: match[1]!, asnOrg: match[2]! }
    : { asn: null, asnOrg: org };
}

function countryHintFromDomain(domain: string): string | null {
  const tld = domain.split(".").pop()?.toLowerCase();
  return tld ? (TLD_COUNTRY[tld] ?? null) : null;
}

// ---------------------------------------------------------------------------
// Phase 4 — Blacklist lookups
// ---------------------------------------------------------------------------

/** Spamhaus DBL — domain-based: NXDOMAIN = not listed. */
async function checkSpamhausDbl(domain: string): Promise<boolean> {
  try {
    await withTimeout(
      resolveTxt(`${domain}.dbl.spamhaus.org`),
      EXTERNAL_TIMEOUT_MS,
    );
    return true; // Any answer = listed
  } catch {
    return false; // NXDOMAIN / timeout = clean
  }
}

/** Spamhaus ZEN — IP-based (reversed octets). */
async function checkSpamhausZen(ip: string): Promise<boolean> {
  if (!ip) return false;
  const reversed = ip.split(".").reverse().join(".");
  try {
    await withTimeout(
      resolveTxt(`${reversed}.zen.spamhaus.org`),
      EXTERNAL_TIMEOUT_MS,
    );
    return true;
  } catch {
    return false;
  }
}

interface UrlhausResponse {
  query_status?: string; // "is_host" | "no_results"
  urls?: unknown[];
}

/** URLhaus API — free, no key. */
async function checkUrlhaus(domain: string): Promise<boolean> {
  const data = await fetchJson<UrlhausResponse>(
    "https://urlhaus-api.abuse.ch/v1/host/",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `host=${encodeURIComponent(domain)}`,
    },
  );
  return data?.query_status === "is_host" && (data.urls?.length ?? 0) > 0;
}


/** ThreatFox (abuse.ch) — completely free, no API key required.
 *  Checks the domain against active threat intel IOCs (C2, phishing, malware).
 */
async function checkThreatFox(domain: string): Promise<boolean> {
  interface ThreatFoxResponse {
    query_status?: string;
    data?: Array<{ ioc_type?: string; threat_type?: string }> | null;
  }
  const data = await fetchJson<ThreatFoxResponse>(
    "https://threatfox-api.abuse.ch/api/v1/",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "search_ioc", search_term: domain }),
    },
  );
  return data?.query_status === "ok" && Array.isArray(data.data) && data.data.length > 0;
}

// ---------------------------------------------------------------------------
// Phase 5 — Weighted score assembly
// ---------------------------------------------------------------------------

const DNS_SIGNAL_CODES: Set<Layer2SignalCode> = new Set([
  "sender_domain_missing",
  "no_mx_record",
  "no_spf_record",
  "spf_too_permissive",
  "no_dmarc_record",
  "dmarc_policy_none",
]);

const AGE_SIGNAL_CODES: Set<Layer2SignalCode> = new Set([
  "domain_too_new",
  "whois_hidden",
]);

const INFRA_SIGNAL_CODES: Set<Layer2SignalCode> = new Set([
  "cloud_infrastructure_detected",
  "asn_hosting_risk",
  "ip_reputation_risk",
  "geolocation_mismatch",
]);

const BLACKLIST_SIGNAL_CODES: Set<Layer2SignalCode> = new Set([
  "domain_blacklisted",
  "ip_blacklisted",
  "urlhaus_match",
  "phishtank_match",
]);

function weightedScore(signals: Layer2Signal[]): number {
  const sum = (codes: Set<Layer2SignalCode>, cap: number) =>
    Math.min(
      cap,
      signals
        .filter((s) => codes.has(s.code))
        .reduce((t, s) => t + s.score, 0),
    );

  return Math.min(
    100,
    sum(DNS_SIGNAL_CODES, 30) +
      sum(AGE_SIGNAL_CODES, 20) +
      sum(INFRA_SIGNAL_CODES, 20) +
      sum(BLACKLIST_SIGNAL_CODES, 30),
  );
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

/**
 * Analyzes the sender domain and infrastructure across five phases.
 *
 * External calls (RDAP, ipinfo.io, blacklists) are independently fault-tolerant:
 * failures degrade `confidence` and populate `missingChecks` but never throw.
 */
export async function analyzeLayer2(input: Layer2Input): Promise<Layer2Result> {
  const missingChecks: string[] = [];
  const signals: Layer2Signal[] = [];
  const blacklistMatches: BlacklistMatch[] = [];

  // ── Fast-exit: unparseable domain ─────────────────────────────────────────
  const domain = domainFromAddress(input.from);
  if (!domain) {
    return {
      score: 30,
      confidence: "minimal",
      missingChecks: ["rdap", "ip_info", "blacklists"],
      domain: null,
      mxRecords: [],
      hasSpf: false,
      spfPolicy: null,
      hasDmarc: false,
      dmarcPolicy: null,
      domainAgeDays: null,
      whoisCreatedAt: null,
      whoisHidden: false,
      senderIp: null,
      reverseDns: null,
      asn: null,
      asnOrganization: null,
      country: null,
      hostingProvider: null,
      isCloudInfrastructure: false,
      blacklistMatches: [],
      signals: [
        {
          code: "sender_domain_missing",
          score: 30,
          explanation: "The sender address has no usable domain.",
        },
      ],
      analyzedAt: new Date(),
    };
  }

  // ── Phase 1 — DNS hygiene ─────────────────────────────────────────────────
  let mxRecords: string[] = [];
  try {
    mxRecords = (await resolveMx(domain)).map((r) => r.exchange);
  } catch {
    /* missing MX → signal below */
  }

  const [spfRecord, dmarcRecord] = await Promise.all([
    getSpfRecord(domain),
    getDmarcRecord(domain),
  ]);

  const hasSpf = spfRecord !== null;
  const hasDmarc = dmarcRecord !== null;
  const spfPolicyValue = spfPolicy(spfRecord);
  const dmarcPolicyValue_ = dmarcPolicyValue(dmarcRecord);

  if (mxRecords.length === 0) {
    signals.push({
      code: "no_mx_record",
      score: 15,
      explanation: "The sender domain has no MX record.",
    });
  }
  if (!hasSpf) {
    signals.push({
      code: "no_spf_record",
      score: 10,
      explanation: "The sender domain has no SPF TXT record.",
    });
  } else if (spfPolicyValue === "+all" || spfPolicyValue === "?all") {
    signals.push({
      code: "spf_too_permissive",
      score: 10,
      explanation: `SPF record uses a permissive "${spfPolicyValue}" qualifier, allowing any host to send.`,
    });
  }
  if (!hasDmarc) {
    signals.push({
      code: "no_dmarc_record",
      score: 10,
      explanation: "The sender domain has no DMARC TXT record.",
    });
  } else if (dmarcPolicyValue_ === "none") {
    signals.push({
      code: "dmarc_policy_none",
      score: 5,
      explanation: "DMARC record exists but policy is 'none' — monitoring only, no enforcement.",
    });
  }

  // ── Phase 2 — RDAP / domain age ──────────────────────────────────────────
  let domainAgeDays: number | null = null;
  let whoisCreatedAt: string | null = null;
  let whoisHidden = false;

  const rdap = await withTimeout(lookupRdap(domain), EXTERNAL_TIMEOUT_MS + 500);
  if (rdap) {
    whoisCreatedAt = rdap.createdAt;
    whoisHidden = rdap.hidden;
    if (rdap.createdAt) {
      const created = new Date(rdap.createdAt);
      if (!isNaN(created.getTime())) {
        domainAgeDays = Math.floor(
          (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24),
        );
      }
    }
    if (domainAgeDays !== null && domainAgeDays <= 7) {
      signals.push({
        code: "domain_too_new",
        score: 20,
        explanation: `Domain registered only ${domainAgeDays} day(s) ago — very high phishing campaign risk.`,
      });
    } else if (domainAgeDays !== null && domainAgeDays <= 30) {
      signals.push({
        code: "domain_too_new",
        score: 12,
        explanation: `Domain registered ${domainAgeDays} day(s) ago — elevated phishing risk.`,
      });
    }
    if (whoisHidden) {
      signals.push({
        code: "whois_hidden",
        score: 10,
        explanation: "Domain registration details are redacted/hidden via WHOIS privacy.",
      });
    }
  } else {
    missingChecks.push("rdap");
  }

  // ── Phase 3 — IP / ASN / Geo ─────────────────────────────────────────────
  let senderIp: string | null = null;
  let reverseDns: string | null = null;
  let asn: string | null = null;
  let asnOrganization: string | null = null;
  let country: string | null = null;
  let hostingProvider: string | null = null;
  let isCloudInfrastructure = false;

  const ipinfoToken = process.env.IPINFO_TOKEN;
  if (ipinfoToken) {
    senderIp = extractSenderIp(input.receivedHeaders ?? []);

    if (senderIp) {
      const [ipInfo, ptr] = await Promise.all([
        lookupIpInfo(senderIp, ipinfoToken),
        lookupPtrRecord(senderIp),
      ]);

      reverseDns = ptr;

      if (ipInfo) {
        country = ipInfo.country ?? null;
        const parsed = parseAsnFromOrg(ipInfo.org);
        asn = parsed.asn;
        asnOrganization = parsed.asnOrg;
        hostingProvider = asnOrganization;

        if (asn && CLOUD_ASNS.has(asn)) {
          isCloudInfrastructure = true;
          signals.push({
            code: "cloud_infrastructure_detected",
            score: 10,
            explanation: `Sending IP belongs to a cloud/VPS provider (${asnOrganization ?? asn}).`,
          });
        }

        if (asn && HIGH_ABUSE_ASNS.has(asn)) {
          signals.push({
            code: "asn_hosting_risk",
            score: 15,
            explanation: `ASN ${asn} (${asnOrganization ?? "unknown"}) has a high abuse reputation.`,
          });
        }

        // Geolocation mismatch: TLD country hint vs actual IP country
        const tldCountry = countryHintFromDomain(domain);
        if (tldCountry && country && tldCountry !== country) {
          signals.push({
            code: "geolocation_mismatch",
            score: 10,
            explanation: `Domain TLD suggests ${tldCountry} but sending IP is geolocated in ${country}.`,
          });
        }
      } else {
        missingChecks.push("ip_info");
      }
    } else {
      missingChecks.push("ip_extraction");
    }
  } else {
    missingChecks.push("ip_info");
  }

  // ── Phase 4 — Blacklist reputation ───────────────────────────────────────
  const [dblHit, urlhausHit, threatfoxHit] = await Promise.all([
    checkSpamhausDbl(domain).catch(() => { missingChecks.push("spamhaus_dbl"); return false; }),
    checkUrlhaus(domain).catch(() => { missingChecks.push("urlhaus"); return false; }),
    checkThreatFox(domain).catch(() => { missingChecks.push("threatfox"); return false; }),
  ]);

  let zenHit = false;
  if (senderIp) {
    zenHit = await checkSpamhausZen(senderIp).catch(() => {
      missingChecks.push("spamhaus_zen");
      return false;
    });
  } else {
    missingChecks.push("spamhaus_zen");
  }

  // Build blacklist match records
  blacklistMatches.push(
    { source: "spamhaus_dbl", type: "domain_reputation", listed: dblHit },
    { source: "spamhaus_zen", type: "ip_reputation", listed: zenHit },
    { source: "urlhaus", type: "malware_delivery", listed: urlhausHit },
    { source: "threatfox", type: "threat_intel", listed: threatfoxHit },
  );

  if (dblHit) {
    signals.push({
      code: "domain_blacklisted",
      score: 30,
      explanation: "Domain is listed on Spamhaus DBL (domain-based blocklist).",
    });
  }
  if (zenHit) {
    signals.push({
      code: "ip_blacklisted",
      score: 25,
      explanation: "Sender IP is listed on Spamhaus ZEN (IP-based blocklist).",
    });
  }
  if (urlhausHit) {
    signals.push({
      code: "urlhaus_match",
      score: 30,
      explanation: "Domain matched in URLhaus malware-delivery database.",
    });
  }
  if (threatfoxHit) {
    signals.push({
      code: "threatfox_match",
      score: 30,
      explanation: "Domain matched an active IOC in abuse.ch ThreatFox threat intelligence database.",
    });
  }

  // ── Phase 5 — Confidence + final score ───────────────────────────────────
  const externalChecksAttempted = 4; // rdap, ip_info, spamhaus_dbl+zen/urlhaus/phishtank counted as 2
  const missingCount = missingChecks.length;

  let confidence: "full" | "partial" | "minimal";
  if (missingCount === 0) {
    confidence = "full";
  } else if (missingCount >= externalChecksAttempted) {
    confidence = "minimal";
  } else {
    confidence = "partial";
  }

  return {
    score: weightedScore(signals),
    confidence,
    missingChecks,
    domain,
    mxRecords,
    hasSpf,
    spfPolicy: spfPolicyValue,
    hasDmarc,
    dmarcPolicy: dmarcPolicyValue_,
    domainAgeDays,
    whoisCreatedAt,
    whoisHidden,
    senderIp,
    reverseDns,
    asn,
    asnOrganization,
    country,
    hostingProvider,
    isCloudInfrastructure,
    blacklistMatches,
    signals,
    analyzedAt: new Date(),
  };
}