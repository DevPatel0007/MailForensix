import { GoogleGenAI, Type } from "@google/genai";

/**
 * Layer 3: NLP Content Analysis — LLM-based semantic judge.
 *
 * Lifecycle:
 * 1. `buildPrompt` assembles a forensic analysis prompt from the email fields.
 * 2. `analyzeLayer3` calls the Gemini model via the Google AI SDK using
 *    `responseSchema` to guarantee structured JSON output — no free-text
 *    parsing required downstream.
 * 3. The returned `Layer3Result` is persisted to MongoDB and fed into the
 *    scoring aggregator alongside Layers 1 and 2.
 *
 * Why an LLM here: BEC and executive-impersonation emails are often
 * well-written and short — they don't trip classical spam heuristics. Gemini
 * catches semantic impersonation patterns (e.g. "CFO asking for a wire
 * transfer") that bag-of-words models miss entirely.
 *
 * Example:
 * ```ts
 * const result = await analyzeLayer3({
 *   subject: "Urgent wire transfer needed",
 *   bodyText: "Please transfer $50,000 to the following account...",
 *   from: "ceo@company.com",
 * });
 * ```
 */

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type BecPattern =
  | "payment_diversion"
  | "fake_invoice"
  | "credential_harvest"
  | "executive_impersonation"
  | "none";

export interface Layer3Signal {
  code: Layer3SignalCode;
  score: number;
  explanation: string;
}

export type Layer3SignalCode =
  | "high_urgency_detected"
  | "bec_pattern_detected"
  | "impersonation_detected"
  | "credential_harvest_detected"
  | "low_confidence_clean";

export interface Layer3LlmJudgement {
  /** Brand, role, or person being impersonated, or null if none detected. */
  impersonation_target: string | null;
  /** Perceived urgency of the email content, 0–100. */
  urgency_score: number;
  /** The dominant BEC pattern detected, or "none". */
  bec_pattern: BecPattern;
  /** Brief human-readable tone/intent summary for the forensic report. */
  tone_analysis: string;
  /** Model's own confidence in this assessment, 0–100. */
  confidence: number;
}

export interface Layer3Result {
  /** Normalised 0–100 risk score derived from the LLM judgement. */
  score: number;
  /** Raw structured output from the Gemini model. */
  judgement: Layer3LlmJudgement;
  /** Discrete signals that fired, mirroring the Layer 1/2 pattern. */
  signals: Layer3Signal[];
  /** ISO timestamp recorded at analysis time. */
  analyzedAt: Date;
  /** Gemini model identifier used for this analysis. */
  model: string;
}

export interface Layer3Input {
  subject: string;
  bodyText: string;
  bodyHtml?: string;
  from: string;
  to?: string;
  /** Optional context from earlier layers to focus the LLM's attention. */
  priorSignals?: string[];
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const MODEL_ID = "gemini-2.5-flash";
const MAX_GENERATION_ATTEMPTS = 3;

/**
 * JSON Schema passed to the Gemini API as `responseSchema`.  The SDK enforces
 * this at the API level, so the response is always valid JSON matching this
 * shape — no try/catch parsing needed.
 */
const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    impersonation_target: {
      type: Type.STRING,
      nullable: true,
      description:
        "Brand, executive role, or person being impersonated (e.g. 'PayPal', 'CFO', 'IT Department'), or null if no impersonation detected.",
    },
    urgency_score: {
      type: Type.INTEGER,
      description: "Perceived urgency level of the email content from 0 (none) to 100 (extreme).",
    },
    bec_pattern: {
      type: Type.STRING,
      enum: [
        "payment_diversion",
        "fake_invoice",
        "credential_harvest",
        "executive_impersonation",
        "none",
      ],
      description: "The dominant Business Email Compromise pattern detected.",
    },
    tone_analysis: {
      type: Type.STRING,
      description:
        "Brief human-readable summary of the email's tone and apparent intent for the forensic report (1–3 sentences).",
    },
    confidence: {
      type: Type.INTEGER,
      description: "Model's confidence in the overall assessment from 0 to 100.",
    },
  },
  required: ["impersonation_target", "urgency_score", "bec_pattern", "tone_analysis", "confidence"],
};

function buildPrompt(input: Layer3Input): string {
  const priorContext =
    input.priorSignals && input.priorSignals.length > 0
      ? `\nPrior forensic signals from earlier analysis layers:\n${input.priorSignals.map((s) => `- ${s}`).join("\n")}\n`
      : "";

  // Truncate body to avoid blowing the context window on very large emails
  const bodyText =
    input.bodyText.length > 4000 ? input.bodyText.slice(0, 4000) + "\n[... truncated ...]" : input.bodyText;

  return `You are a forensic email security analyst. Analyze the following email for phishing, Business Email Compromise (BEC), impersonation, and social-engineering indicators.

Respond ONLY with valid JSON matching the provided schema. Do not include any explanatory text outside the JSON object.
${priorContext}
--- EMAIL ---
From: ${input.from}
${input.to ? `To: ${input.to}` : ""}
Subject: ${input.subject}

Body:
${bodyText}
--- END EMAIL ---

Evaluate the email and return a structured assessment.`;
}

function deriveSignalsAndScore(judgement: Layer3LlmJudgement): {
  signals: Layer3Signal[];
  score: number;
} {
  const signals: Layer3Signal[] = [];

  if (judgement.urgency_score >= 60) {
    signals.push({
      code: "high_urgency_detected",
      score: Math.round(judgement.urgency_score * 0.3), // up to 30 pts
      explanation: `High urgency language detected (urgency score: ${judgement.urgency_score}/100).`,
    });
  }

  if (judgement.bec_pattern !== "none") {
    const becScore =
      judgement.bec_pattern === "payment_diversion" || judgement.bec_pattern === "fake_invoice"
        ? 40
        : 35;
    signals.push({
      code: "bec_pattern_detected",
      score: becScore,
      explanation: `BEC pattern identified: ${judgement.bec_pattern.replace(/_/g, " ")}.`,
    });
  }

  if (judgement.impersonation_target !== null) {
    const impersonationScore =
      judgement.bec_pattern === "executive_impersonation" ? 35 : 25;
    signals.push({
      code: "impersonation_detected",
      score: impersonationScore,
      explanation: `Impersonation of "${judgement.impersonation_target}" detected.`,
    });
  }

  if (judgement.bec_pattern === "credential_harvest") {
    signals.push({
      code: "credential_harvest_detected",
      score: 40,
      explanation: "Credential harvesting pattern detected (login/password request or fake portal link).",
    });
  }

  if (signals.length === 0 && judgement.confidence >= 70) {
    signals.push({
      code: "low_confidence_clean",
      score: 0,
      explanation: "No phishing or BEC indicators detected with high confidence.",
    });
  }

  // Confidence scaling: dampen the score when model confidence is low
  const rawScore = Math.min(100, signals.reduce((total, s) => total + s.score, 0));
  const confidenceMultiplier = judgement.confidence / 100;
  const score = Math.round(rawScore * confidenceMultiplier);

  return { signals, score };
}

function isRetryableModelError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /\b(429|500|502|503|504)\b|UNAVAILABLE|RESOURCE_EXHAUSTED|high demand/i.test(message);
}

function unavailableResult(): Layer3Result {
  return {
    score: 0,
    judgement: {
      impersonation_target: null,
      urgency_score: 0,
      bec_pattern: "none",
      tone_analysis: "Layer 3 analysis was unavailable after temporary model capacity errors.",
      confidence: 0,
    },
    signals: [],
    analyzedAt: new Date(),
    model: `${MODEL_ID}:unavailable`,
  };
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

/**
 * Analyzes email content using Gemini as an LLM-based semantic judge.
 *
 * Requires the `GOOGLE_AI_API_KEY` environment variable to be set.
 * The model is called with `responseMimeType: "application/json"` and a
 * `responseSchema` so the output is always structured — no free-text parsing.
 */
export async function analyzeLayer3(input: Layer3Input): Promise<Layer3Result> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_AI_API_KEY environment variable is not set.");
  }

  const ai = new GoogleGenAI({ apiKey });

  let response;
  for (let attempt = 1; attempt <= MAX_GENERATION_ATTEMPTS; attempt += 1) {
    try {
      response = await ai.models.generateContent({
        model: MODEL_ID,
        contents: buildPrompt(input),
        config: {
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
          temperature: 0.1,
        },
      });
      break;
    } catch (error) {
      if (!isRetryableModelError(error) || attempt === MAX_GENERATION_ATTEMPTS) return unavailableResult();
      await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** (attempt - 1)));
    }
  }

  if (!response) return unavailableResult();

  const rawText = response.text ?? "";
  const judgement = JSON.parse(rawText) as Layer3LlmJudgement;

  const { signals, score } = deriveSignalsAndScore(judgement);

  return {
    score,
    judgement,
    signals,
    analyzedAt: new Date(),
    model: MODEL_ID,
  };
}
