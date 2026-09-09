import { resolveMx, resolveTxt } from "node:dns/promises";

export interface Layer2Input {
  from: string;
}

export interface Layer2Signal {
  code: "sender_domain_missing" | "no_mx_record" | "no_spf_record" | "no_dmarc_record";
  score: number;
  explanation: string;
}

export interface Layer2Result {
  score: number;
  domain: string | null;
  mxRecords: string[];
  hasSpf: boolean;
  hasDmarc: boolean;
  signals: Layer2Signal[];
  analyzedAt: Date;
}

function domainFromAddress(from: string): string | null {
  const address = from.match(/<\s*([^>]+?)\s*>/)?.[1] ?? from.match(/[\w.!#$%&'*+/=?^`{|}~-]+@[\w.-]+/)?.[0];
  const domain = address?.trim().toLowerCase().split("@").pop();
  return domain && /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/.test(domain)
    ? domain
    : null;
}

async function hasTxtRecord(name: string, prefix: string): Promise<boolean> {
  try {
    const records = await resolveTxt(name);
    return records.flat().some((record) => record.toLowerCase().startsWith(prefix));
  } catch {
    return false;
  }
}

export async function analyzeLayer2(input: Layer2Input): Promise<Layer2Result> {
  const domain = domainFromAddress(input.from);
  if (!domain) {
    return {
      score: 70,
      domain: null,
      mxRecords: [],
      hasSpf: false,
      hasDmarc: false,
      signals: [{ code: "sender_domain_missing", score: 70, explanation: "The sender address has no usable domain." }],
      analyzedAt: new Date(),
    };
  }

  let mxRecords: string[] = [];
  try {
    mxRecords = (await resolveMx(domain)).map((record) => record.exchange);
  } catch {
    // A missing MX record is retained as a signal below.
  }

  const [hasSpf, hasDmarc] = await Promise.all([
    hasTxtRecord(domain, "v=spf1"),
    hasTxtRecord(`_dmarc.${domain}`, "v=dmarc1"),
  ]);
  const signals: Layer2Signal[] = [];
  if (mxRecords.length === 0) signals.push({ code: "no_mx_record", score: 35, explanation: "The sender domain has no MX record." });
  if (!hasSpf) signals.push({ code: "no_spf_record", score: 20, explanation: "The sender domain has no SPF TXT record." });
  if (!hasDmarc) signals.push({ code: "no_dmarc_record", score: 20, explanation: "The sender domain has no DMARC TXT record." });

  return {
    score: Math.min(100, signals.reduce((total, signal) => total + signal.score, 0)),
    domain,
    mxRecords,
    hasSpf,
    hasDmarc,
    signals,
    analyzedAt: new Date(),
  };
}