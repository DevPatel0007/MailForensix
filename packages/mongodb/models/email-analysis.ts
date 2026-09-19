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
    ipExtraction?: {
      status: string;
      ipsFound: string[];
      candidateIps: string[];
      privateIps: string[];
      extractionSources: string[];
      limitations: string[];
    };
    geolocation?: { status: string; country: string | null; countryCode: string | null; region: string | null; city: string | null; latitude: number | null; longitude: number | null; accuracyRadiusKm: number | null; providerConfidence: string | null; source: string | null };
    network?: { status: string; asn: string | null; asnOrganization: string | null; isp: string | null; hostingProvider: string | null; reverseDns: string | null };
    anonymization?: {
      status: string;
      tor: { status: string; isExitNode: boolean | null; source: string | null };
      vpn: { status: string; isVpn: boolean | null; provider: string | null; source: string | null };
      proxy: { status: string; isProxy: boolean | null; source: string | null };
    };
    limitations?: string[];
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
  layer5?: {
    cluster?: Array<{ id: string; subject: string; date: string }>;
    recordsCreated?: number;
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
      ipExtraction: {
        status: String,
        ipsFound: [String],
        candidateIps: [String],
        privateIps: [String],
        extractionSources: [String],
        limitations: [String],
      },
      geolocation: { status: String, country: String, countryCode: String, region: String, city: String, latitude: Number, longitude: Number, accuracyRadiusKm: Number, providerConfidence: String, source: String },
      network: { status: String, asn: String, asnOrganization: String, isp: String, hostingProvider: String, reverseDns: String },
      anonymization: {
        status: String,
        tor: { status: String, isExitNode: Boolean, source: String },
        vpn: { status: String, isVpn: Boolean, provider: String, source: String },
        proxy: { status: String, isProxy: Boolean, source: String },
      },
      limitations: [String],
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
    layer5: {
      cluster: [{ id: String, subject: String, date: String }],
      recordsCreated: Number,
      analyzedAt: { type: Date, default: Date.now },
    },
  },
  { timestamps: true },
);

export const EmailAnalysis: Model<IEmailAnalysis> =
  mongoose.models.EmailAnalysis || mongoose.model<IEmailAnalysis>("EmailAnalysis", EmailAnalysisSchema);