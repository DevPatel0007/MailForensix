import mongoose, { Schema, Model, Document } from "mongoose";

export interface IEmailAnalysis extends Document {
  gmailMessageId: string;
  userId: string;
  accountId: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  layer1: {
    score?: number;
    signals?: Array<{ code: string; score: number; explanation: string }>;
    authentication?: {
      spf?: { result: string; comment?: string };
      dkim?: { result: string; comment?: string };
      dmarc?: { result: string; comment?: string };
    };
    receivedHopCount?: number;
    mailauth?: any;
    analyzedAt?: Date;
  };
  layer2?: {
    score?: number;
    confidence?: string;
    missingChecks?: string[];
    domain?: string | null;
    mxRecords?: string[];
    hasSpf?: boolean;
    spfPolicy?: string | null;
    hasDmarc?: boolean;
    dmarcPolicy?: string | null;
    domainAgeDays?: number | null;
    whoisCreatedAt?: string | null;
    whoisHidden?: boolean;
    senderIp?: string | null;
    reverseDns?: string | null;
    asn?: string | null;
    asnOrganization?: string | null;
    country?: string | null;
    hostingProvider?: string | null;
    isCloudInfrastructure?: boolean;
    blacklistMatches?: Array<{ source: string; type: string; listed: boolean }>;
    signals?: Array<{ code: string; score: number; explanation: string }>;
    analyzedAt?: Date;
  };
  layer3?: {
    score?: number;
    judgement?: {
      impersonation_target?: string | null;
      urgency_score?: number;
      bec_pattern?: string;
      tone_analysis?: string;
      confidence?: number;
    };
    signals?: Array<{ code: string; score: number; explanation: string }>;
    analyzedAt?: Date;
    model?: string;
  };
  layer4?: {
    score?: number;
    missingChecks?: string[];
    urls?: Array<{ url: string; hostname: string; flags: string[]; urlhausListed: boolean; vtMaliciousCount: number; vtSuspiciousCount: number; verdict: string }>;
    attachments?: Array<{ filename: string; mimeType: string; size: number; sha256: string | null; vtMaliciousCount: number; vtSuspiciousCount: number; verdict: string }>;
    signals?: Array<{ code: string; score: number; explanation: string }>;
    analyzedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const EmailAnalysisSchema = new Schema(
  {
    gmailMessageId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    accountId: { type: String, required: true },
    from: String,
    to: String,
    subject: String,
    date: String,
    layer1: {
      score: Number,
      signals: [
        {
          code: String,
          score: Number,
          explanation: String,
        },
      ],
      authentication: {
        spf: { result: String, comment: String },
        dkim: { result: String, comment: String },
        dmarc: { result: String, comment: String },
      },
      receivedHopCount: Number,
      mailauth: Schema.Types.Mixed,
      analyzedAt: { type: Date, default: Date.now },
    },
    layer2: {
      score: Number,
      confidence: String,
      missingChecks: [String],
      domain: String,
      mxRecords: [String],
      hasSpf: Boolean,
      spfPolicy: String,
      hasDmarc: Boolean,
      dmarcPolicy: String,
      domainAgeDays: Number,
      whoisCreatedAt: String,
      whoisHidden: Boolean,
      senderIp: String,
      reverseDns: String,
      asn: String,
      asnOrganization: String,
      country: String,
      hostingProvider: String,
      isCloudInfrastructure: Boolean,
      blacklistMatches: [{ source: String, type: String, listed: Boolean }],
      signals: [{ code: String, score: Number, explanation: String }],
      analyzedAt: { type: Date, default: Date.now },
    },
    layer3: {
      score: Number,
      judgement: {
        impersonation_target: String,
        urgency_score: Number,
        bec_pattern: String,
        tone_analysis: String,
        confidence: Number,
      },
      signals: [{ code: String, score: Number, explanation: String }],
      analyzedAt: { type: Date, default: Date.now },
      model: String,
    },
    layer4: {
      score: Number,
      missingChecks: [String],
      urls: [{ url: String, hostname: String, flags: [String], urlhausListed: Boolean, vtMaliciousCount: Number, vtSuspiciousCount: Number, verdict: String }],
      attachments: [{ filename: String, mimeType: String, size: Number, sha256: String, vtMaliciousCount: Number, vtSuspiciousCount: Number, verdict: String }],
      signals: [{ code: String, score: Number, explanation: String }],
      analyzedAt: { type: Date, default: Date.now },
    },
  },
  { timestamps: true },
);

export const EmailAnalysis: Model<IEmailAnalysis> =
  mongoose.models.EmailAnalysis || mongoose.model<IEmailAnalysis>("EmailAnalysis", EmailAnalysisSchema);