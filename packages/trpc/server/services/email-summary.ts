import { z } from "zod";
import { connectMongo, EmailAnalysis } from "@repo/mongodb";

export const emailSummarySchema = z.object({
  id: z.string(),
  subject: z.string().nullable(),
  sender: z.string().nullable(),
  summary: z.string(),
  keyPoints: z.array(z.string()),
  threatLevel: z.enum(["safe", "suspicious", "flagged"]),
  riskScore: z.number(),
  indicators: z.array(z.object({
    type: z.enum(["url", "attachment", "authentication", "sender", "content"]),
    label: z.string(),
    value: z.string(),
    severity: z.enum(["low", "medium", "high"]),
  })),
  geolocation: z.object({
    country: z.string().nullable(),
    city: z.string().nullable(),
    latitude: z.number(),
    longitude: z.number(),
  }).nullable(),
  generatedAt: z.string(),
});

export type EmailSummary = z.infer<typeof emailSummarySchema>;

type Signal = { code?: string; explanation?: string; score?: number };

type ScanLike = {
  gmailMessageId?: string;
  from?: string;
  subject?: string;
  layer1?: { authentication?: Record<string, { result?: string } | undefined>; signals?: Signal[] };
  layer2?: {
    score?: number;
    senderIp?: string | null;
    geolocation?: { country?: string | null; city?: string | null; latitude?: number | null; longitude?: number | null };
    signals?: Signal[];
  };
  layer3?: { judgement?: { tone_analysis?: string; bec_pattern?: string; urgency_score?: number; impersonation_target?: string | null }; signals?: Signal[] };
  layer4?: { urls?: Array<{ url?: string; verdict?: string }>; attachments?: Array<{ filename?: string; verdict?: string }>; signals?: Signal[] };
};

function indicatorSeverity(score: number | undefined): "low" | "medium" | "high" {
  if ((score ?? 0) >= 35) return "high";
  if ((score ?? 0) >= 15) return "medium";
  return "low";
}

export async function getEmailSummary(userId: string, gmailMessageId: string): Promise<EmailSummary | null> {
  await connectMongo();
  const scan = await EmailAnalysis.findOne({ userId, gmailMessageId }).lean() as ScanLike | null;
  if (!scan) return null;

  const riskScore = scan.layer2?.score ?? 0;
  const threatLevel = riskScore > 50 ? "flagged" : riskScore > 25 ? "suspicious" : "safe";
  const judgement = scan.layer3?.judgement;
  const signalGroups = [scan.layer1?.signals, scan.layer2?.signals, scan.layer3?.signals, scan.layer4?.signals];
  const keyPoints = signalGroups.flatMap((signals) => signals ?? []).map((signal) => signal.explanation).filter((value): value is string => Boolean(value)).slice(0, 8);
  const summary = judgement?.tone_analysis || (threatLevel === "flagged"
    ? "This email contains elevated forensic risk signals and should be reviewed before any action is taken."
    : "No high-confidence threat summary is available for this scan.");
  const indicators: EmailSummary["indicators"] = [];

  if (judgement?.bec_pattern && judgement.bec_pattern !== "none") {
    indicators.push({ type: "content", label: "BEC pattern", value: judgement.bec_pattern.replaceAll("_", " "), severity: "high" });
  }
  if (judgement?.impersonation_target) {
    indicators.push({ type: "sender", label: "Impersonation target", value: judgement.impersonation_target, severity: "high" });
  }
  for (const url of scan.layer4?.urls ?? []) {
    indicators.push({ type: "url", label: "URL verdict", value: `${url.verdict ?? "unknown"}: ${url.url ?? "unavailable"}`, severity: url.verdict === "malicious" ? "high" : "medium" });
  }
  for (const attachment of scan.layer4?.attachments ?? []) {
    indicators.push({ type: "attachment", label: "Attachment verdict", value: `${attachment.verdict ?? "unknown"}: ${attachment.filename ?? "unnamed"}`, severity: attachment.verdict === "malicious" ? "high" : "medium" });
  }

  const geo = scan.layer2?.geolocation;
  return emailSummarySchema.parse({
    id: scan.gmailMessageId ?? gmailMessageId,
    subject: scan.subject ?? null,
    sender: scan.from ?? null,
    summary,
    keyPoints,
    threatLevel,
    riskScore,
    indicators: indicators.slice(0, 20),
    geolocation: typeof geo?.latitude === "number" && typeof geo.longitude === "number"
      ? { country: geo.country ?? null, city: geo.city ?? null, latitude: geo.latitude, longitude: geo.longitude }
      : null,
    generatedAt: new Date().toISOString(),
  });
}
