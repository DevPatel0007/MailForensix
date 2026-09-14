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
  layer2: {
    score?: number;
    domain?: string | null;
    mxRecords?: string[];
    hasSpf?: boolean;
    hasDmarc?: boolean;
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
      domain: String,
      mxRecords: [String],
      hasSpf: Boolean,
      hasDmarc: Boolean,
      signals: [{ code: String, score: Number, explanation: String }],
      analyzedAt: { type: Date, default: Date.now },
    },
  },
  { timestamps: true },
);

export const EmailAnalysis: Model<IEmailAnalysis> =
  mongoose.models.EmailAnalysis || mongoose.model<IEmailAnalysis>("EmailAnalysis", EmailAnalysisSchema);