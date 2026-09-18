import { createHash } from "node:crypto";

const URLHAUS_TIMEOUT_MS = 4_000;
const VIRUSTOTAL_TIMEOUT_MS = 10_000;
const URL_PATTERN = /https?:\/\/[^\s"'<>]+/gi;
const SHORTENERS = new Set([
  "bit.ly",
  "goo.gl",
  "is.gd",
  "ow.ly",
  "t.co",
  "tinyurl.com",
  "rb.gy",
]);

export interface Layer4AttachmentInput {
  filename: string;
  mimeType: string;
  size: number;
  contentBase64?: string;
}

export interface Layer4Input {
  bodyHtml?: string;
  bodyText?: string;
  attachments?: Layer4AttachmentInput[];
}

export type Layer4SignalCode =
  | "mismatched_link_text"
  | "suspicious_url"
  | "urlhaus_match"
  | "attachment_malicious"
  | "attachment_suspicious"
  | "attachment_scan_pending"
  | "attachment_scan_unavailable"
  | "url_vt_malicious"
  | "url_vt_suspicious"
  | "url_scan_pending"
  | "url_scan_unavailable";

export interface Layer4Signal {
  code: Layer4SignalCode;
  score: number;
  explanation: string;
}

export interface Layer4UrlResult {
  url: string;
  hostname: string;
  flags: Array<"mismatched_link_text" | "suspicious_url" | "urlhaus_match">;
  urlhausListed: boolean;
  vtMaliciousCount: number;
  vtSuspiciousCount: number;
  verdict: "clean" | "suspicious" | "malicious" | "pending" | "unavailable";
}

export interface Layer4AttachmentResult extends Layer4AttachmentInput {
  sha256: string | null;
  vtMaliciousCount: number;
  vtSuspiciousCount: number;
  verdict: "clean" | "suspicious" | "malicious" | "pending" | "unavailable";
}

export interface Layer4Result {
  score: number;
  missingChecks: string[];
  urls: Layer4UrlResult[];
  attachments: Layer4AttachmentResult[];
  signals: Layer4Signal[];
  analyzedAt: Date;
}

function validUrl(value: string): URL | null {
  try {
    const url = new URL(value.replace(/[),.;!?]+$/, ""));
    return url.protocol === "http:" || url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

function decodeHtml(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/&(?:amp|#38);/gi, "&").replace(/\s+/g, " ").trim();
}

function extractUrls(input: Layer4Input): Array<{ url: URL; text?: string }> {
  const found = new Map<string, { url: URL; text?: string }>();
  const html = input.bodyHtml ?? "";
  const anchorPattern = /<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  for (const match of html.matchAll(anchorPattern)) {
    const url = validUrl(match[1] ?? "");
    if (url) found.set(url.href, { url, text: decodeHtml(match[2] ?? "") });
  }
  const plainHtml = html.replace(anchorPattern, " ");
  for (const value of `${plainHtml}\n${input.bodyText ?? ""}`.match(URL_PATTERN) ?? []) {
    const url = validUrl(value);
    if (url && !found.has(url.href)) found.set(url.href, { url });
  }
  return [...found.values()];
}

function urlFlags(url: URL, text?: string): Array<"mismatched_link_text" | "suspicious_url" | "urlhaus_match"> {
  const flags: Array<"mismatched_link_text" | "suspicious_url" | "urlhaus_match"> = [];
  const displayHost = text?.match(/(?:https?:\/\/)?(?:www\.)?([a-z0-9.-]+\.[a-z]{2,})/i)?.[1]?.toLowerCase();
  if (displayHost && displayHost !== url.hostname.toLowerCase() && !url.hostname.toLowerCase().endsWith(`.${displayHost}`)) {
    flags.push("mismatched_link_text");
  }
  if (
    url.hostname.startsWith("xn--") ||
    /^\d{1,3}(?:\.\d{1,3}){3}$/.test(url.hostname) ||
    url.username ||
    SHORTENERS.has(url.hostname.toLowerCase())
  ) {
    flags.push("suspicious_url");
  }
  return flags;
}

async function urlhausListed(hostname: string): Promise<boolean | null> {
  try {
    const response = await Promise.race([
      fetch("https://urlhaus-api.abuse.ch/v1/host/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `host=${encodeURIComponent(hostname)}`,
      }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), URLHAUS_TIMEOUT_MS)),
    ]);
    if (!response || !response.ok) return null;
    const data = (await response.json()) as { query_status?: string; urls?: unknown[] };
    return data.query_status === "is_host" && (data.urls?.length ?? 0) > 0;
  } catch {
    return null;
  }
}

type VirusTotalStats = { malicious?: number; suspicious?: number };

function verdict(stats: VirusTotalStats) {
  const malicious = stats.malicious ?? 0;
  const suspicious = stats.suspicious ?? 0;
  return {
    malicious,
    suspicious,
    verdict: malicious > 0 ? "malicious" as const : suspicious > 0 ? "suspicious" as const : "clean" as const,
  };
}

async function scanUrlWithVirusTotal(url: string): Promise<{ vtMaliciousCount: number, vtSuspiciousCount: number, verdict: "clean" | "suspicious" | "malicious" | "pending" | "unavailable" }> {
  const base = { vtMaliciousCount: 0, vtSuspiciousCount: 0 };
  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  if (!apiKey) return { ...base, verdict: "unavailable" as const };

  const id = Buffer.from(url).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const headers = { "x-apikey": apiKey };

  try {
    const lookup = await fetch(`https://www.virustotal.com/api/v3/urls/${id}`, { headers, signal: AbortSignal.timeout(VIRUSTOTAL_TIMEOUT_MS) });
    if (lookup.ok) {
      const data = (await lookup.json()) as { data?: { attributes?: { last_analysis_stats?: VirusTotalStats } } };
      return { ...base, ...verdict(data.data?.attributes?.last_analysis_stats ?? {}) };
    }
    if (lookup.status !== 404) return { ...base, verdict: "unavailable" as const };

    const form = new URLSearchParams();
    form.append("url", url);
    const upload = await fetch("https://www.virustotal.com/api/v3/urls", { method: "POST", headers, body: form, signal: AbortSignal.timeout(VIRUSTOTAL_TIMEOUT_MS) });
    if (!upload.ok) return { ...base, verdict: "unavailable" as const };
    return { ...base, verdict: "pending" as const };
  } catch {
    return { ...base, verdict: "unavailable" as const };
  }
}

async function scanAttachment(
  attachment: Layer4AttachmentInput,
): Promise<Layer4AttachmentResult> {
  const base = { filename: attachment.filename, mimeType: attachment.mimeType, size: attachment.size, sha256: null, vtMaliciousCount: 0, vtSuspiciousCount: 0 };
  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  if (!apiKey || !attachment.contentBase64) return { ...base, verdict: "unavailable" };

  const bytes = Buffer.from(attachment.contentBase64.replace(/-/g, "+").replace(/_/g, "/"), "base64");
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const headers = { "x-apikey": apiKey };
  try {
    const lookup = await fetch(`https://www.virustotal.com/api/v3/files/${sha256}`, { headers, signal: AbortSignal.timeout(VIRUSTOTAL_TIMEOUT_MS) });
    if (lookup.ok) {
      const data = (await lookup.json()) as { data?: { attributes?: { last_analysis_stats?: VirusTotalStats } } };
      return { ...base, sha256, ...verdict(data.data?.attributes?.last_analysis_stats ?? {}) };
    }
    if (lookup.status !== 404) return { ...base, sha256, verdict: "unavailable" };

    const form = new FormData();
    form.append("file", new Blob([bytes], { type: attachment.mimeType }), attachment.filename);
    const upload = await fetch("https://www.virustotal.com/api/v3/files", { method: "POST", headers, body: form, signal: AbortSignal.timeout(VIRUSTOTAL_TIMEOUT_MS) });
    if (!upload.ok) return { ...base, sha256, verdict: "unavailable" };
    return { ...base, sha256, verdict: "pending" };
  } catch {
    return { ...base, sha256, verdict: "unavailable" };
  }
}

export async function analyzeLayer4(input: Layer4Input): Promise<Layer4Result> {
  const missingChecks: string[] = [];
  const signals: Layer4Signal[] = [];
  const extracted = extractUrls(input);
  const reputation = await Promise.all(extracted.map(({ url }) => urlhausListed(url.hostname)));
  const vtUrls = await Promise.all(extracted.map(({ url }) => scanUrlWithVirusTotal(url.href)));
  const urls = extracted.map(({ url, text }, index) => {
    const flags = urlFlags(url, text);
    const rep = reputation[index];
    const vt = vtUrls[index]!;
    if (rep === true) flags.push("urlhaus_match");
    if (rep === null) missingChecks.push(`urlhaus:${url.hostname}`);
    if (vt.verdict === "unavailable") missingChecks.push(`url_scan:${url.hostname}`);
    return { 
      url: url.href, 
      hostname: url.hostname, 
      flags, 
      urlhausListed: rep === true,
      vtMaliciousCount: vt.vtMaliciousCount,
      vtSuspiciousCount: vt.vtSuspiciousCount,
      verdict: vt.verdict
    };
  });

  const attachments = await Promise.all((input.attachments ?? []).map(scanAttachment));
  if (attachments.some((attachment) => attachment.verdict === "unavailable")) missingChecks.push("attachment_scan");

  const mismatched = urls.filter((url) => url.flags.includes("mismatched_link_text")).length;
  const suspicious = urls.filter((url) => url.flags.includes("suspicious_url")).length;
  const listed = urls.filter((url) => url.flags.includes("urlhaus_match")).length;
  const maliciousUrls = urls.filter((url) => url.verdict === "malicious").length;
  const suspiciousUrls = urls.filter((url) => url.verdict === "suspicious").length;
  const pendingUrls = urls.filter((url) => url.verdict === "pending").length;

  const maliciousAttachments = attachments.filter((attachment) => attachment.verdict === "malicious").length;
  const suspiciousAttachments = attachments.filter((attachment) => attachment.verdict === "suspicious").length;
  const pendingAttachments = attachments.filter((attachment) => attachment.verdict === "pending").length;
  
  if (mismatched) signals.push({ code: "mismatched_link_text", score: Math.min(25, mismatched * 15), explanation: `${mismatched} link(s) display a different domain from the actual destination.` });
  if (suspicious) signals.push({ code: "suspicious_url", score: Math.min(25, suspicious * 15), explanation: `${suspicious} URL(s) use an IP address, punycode, userinfo, or a URL shortener.` });
  if (listed) signals.push({ code: "urlhaus_match", score: Math.min(50, listed * 50), explanation: `${listed} URL(s) matched URLhaus malware-delivery intelligence.` });
  
  if (maliciousUrls) signals.push({ code: "url_vt_malicious", score: Math.min(50, maliciousUrls * 50), explanation: `${maliciousUrls} URL(s) were flagged as malicious by VirusTotal.` });
  if (suspiciousUrls) signals.push({ code: "url_vt_suspicious", score: Math.min(30, suspiciousUrls * 30), explanation: `${suspiciousUrls} URL(s) were flagged as suspicious by VirusTotal.` });
  if (pendingUrls) signals.push({ code: "url_scan_pending", score: 0, explanation: `${pendingUrls} URL(s) were submitted to VirusTotal and are awaiting analysis.` });
  if (urls.some((url) => url.verdict === "unavailable")) signals.push({ code: "url_scan_unavailable", score: 0, explanation: "VirusTotal URL scanning was unavailable." });

  if (maliciousAttachments) signals.push({ code: "attachment_malicious", score: Math.min(50, maliciousAttachments * 50), explanation: `${maliciousAttachments} attachment(s) were flagged as malicious by VirusTotal.` });
  if (suspiciousAttachments) signals.push({ code: "attachment_suspicious", score: Math.min(30, suspiciousAttachments * 30), explanation: `${suspiciousAttachments} attachment(s) were flagged as suspicious by VirusTotal.` });
  if (pendingAttachments) signals.push({ code: "attachment_scan_pending", score: 0, explanation: `${pendingAttachments} new attachment(s) were uploaded to VirusTotal and are awaiting analysis.` });
  if (attachments.some((attachment) => attachment.verdict === "unavailable")) signals.push({ code: "attachment_scan_unavailable", score: 0, explanation: "VirusTotal scanning was unavailable because the API key or attachment bytes were missing." });

  return { score: Math.min(100, signals.reduce((total, signal) => total + signal.score, 0)), missingChecks, urls, attachments, signals, analyzedAt: new Date() };
}
