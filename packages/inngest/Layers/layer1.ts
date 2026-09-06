import {
  authenticate,
  type AuthenticateOptions,
  type AuthenticateResult,
  type AuthStatus,
  type MessageInput,
} from "mailauth";

/**
 * Layer 1: Authentication and header forensics.
 *
 * Lifecycle:
 * 1. `verifyMailAuthentication` delegates SPF, DKIM, and DMARC verification
 *    to MailAuth using the SMTP envelope context supplied by ingestion.
 * 2. `evaluateHeaderSignals` applies deterministic checks to the verified
 *    result and parsed message headers. It has no network or mutation side
 *    effects, so it is straightforward to test with fixtures.
 * 3. `analyzeLayer1` assembles the stable API result consumed by the scoring
 *    aggregator and forensic report.
 *
 * The layer deliberately does not classify the entire email. Its only concern
 * is authentication evidence and header anomalies; content, URL, and behavior
 * signals belong to later layers.
 *
 * Example:
 * ```ts
 * const analysis = await analyzeLayer1({
 *   message: rawEmlBuffer,
 *   senderIp: "203.0.113.10",
 *   helo: "mail.example.test",
 *   envelopeSender: "sender@example.test",
 *   brandDomains: { PayPal: ["paypal.com"] },
 * });
 * ```
 */

export type Layer1Message = MessageInput;

export interface Layer1Input {
  message: Layer1Message;
  senderIp: string;
  helo: string;
  envelopeSender?: string;
  mta?: string;
  brandDomains?: Readonly<Record<string, readonly string[]>>;
}

export type Layer1SignalCode =
  | "spf_fail"
  | "dkim_missing_or_invalid"
  | "dmarc_reject_failed"
  | "return_path_mismatch"
  | "reply_to_mismatch"
  | "display_name_spoofing"
  | "message_id_missing_or_malformed"
  | "received_chain_anomaly";

export interface Layer1Signal {
  code: Layer1SignalCode;
  score: number;
  explanation: string;
}

export interface Layer1Result {
  score: number;
  signals: Layer1Signal[];
  authentication: {
    spf: AuthenticationStatus;
    dkim: AuthenticationStatus;
    dmarc: AuthenticationStatus;
  };
  receivedHopCount: number;
  mailauth: AuthenticateResult;
}

export interface AuthenticationStatus {
  result: AuthStatus["result"] | "unavailable";
  comment?: string;
}

const SIGNAL_WEIGHTS: Record<Layer1SignalCode, number> = {
  spf_fail: 25,
  dkim_missing_or_invalid: 25,
  dmarc_reject_failed: 30,
  return_path_mismatch: 10,
  reply_to_mismatch: 10,
  display_name_spoofing: 20,
  message_id_missing_or_malformed: 5,
  received_chain_anomaly: 10,
};

/** Runs the single external authentication operation for this layer. */
async function verifyMailAuthentication(input: Layer1Input): Promise<AuthenticateResult> {
  const options: AuthenticateOptions = {
    ip: input.senderIp,
    helo: input.helo,
    sender: input.envelopeSender,
    mta: input.mta,
  };

  return authenticate(input.message, options);
}

function authenticationStatus(status: AuthStatus | undefined): AuthenticationStatus {
  if (!status) {
    return { result: "unavailable" };
  }

  return {
    result: status.result,
    ...(status.comment ? { comment: status.comment } : {}),
  };
}

function headerValue(result: AuthenticateResult, name: string): string | undefined {
  const header = result.dkim.headers?.parsed.find(
    (entry) => entry.key.toLowerCase() === name.toLowerCase(),
  );

  if (!header) {
    return undefined;
  }

  const line =
    typeof header.line === "string" ? header.line : Buffer.from(header.line).toString("utf8");

  return line.slice(header.key.length + 1).trim();
}

function addressDomain(address: string | undefined): string | undefined {
  if (!address) {
    return undefined;
  }

  const normalized = address.trim().toLowerCase();
  const angleAddress = normalized.match(/<([^>]+)>/)?.[1] ?? normalized;
  const atIndex = angleAddress.lastIndexOf("@");

  return atIndex > -1 ? angleAddress.slice(atIndex + 1).trim() : undefined;
}

function sameDomain(first: string | undefined, second: string | undefined): boolean {
  return Boolean(first && second && first === second);
}

function hasValidDkim(result: AuthenticateResult): boolean {
  return result.dkim.results.some((signature) => signature.status.result === "pass");
}

function hasReceivedChainAnomaly(result: AuthenticateResult): boolean {
  const receivedChain = result.receivedChain ?? [];

  for (let index = 1; index < receivedChain.length; index += 1) {
    const previousDate = receivedChain[index - 1]?.date;
    const currentDate = receivedChain[index]?.date;

    if (previousDate && currentDate && previousDate < currentDate) {
      return true;
    }
  }

  return (
    new Set(
      receivedChain
        .map((entry) => entry.by?.value?.toLowerCase())
        .filter((value): value is string => Boolean(value)),
    ).size < receivedChain.filter((entry) => entry.by?.value).length
  );
}

function isBrandDisplayNameSpoof(
  fromHeader: string | undefined,
  brandDomains: Layer1Input["brandDomains"],
): boolean {
  if (!fromHeader || !brandDomains) {
    return false;
  }

  const displayName = fromHeader.match(/^\s*"?([^"<]+?)"?\s*</)?.[1]?.toLowerCase();
  const fromDomain = addressDomain(fromHeader);

  if (!displayName || !fromDomain) {
    return false;
  }

  return Object.entries(brandDomains).some(([brand, domains]) => {
    return displayName.includes(brand.toLowerCase()) && !domains.includes(fromDomain);
  });
}

function signal(code: Layer1SignalCode, explanation: string): Layer1Signal {
  return { code, score: SIGNAL_WEIGHTS[code], explanation };
}

/** Evaluates only deterministic evidence exposed by MailAuth and message headers. */
function evaluateHeaderSignals(
  result: AuthenticateResult,
  brandDomains: Layer1Input["brandDomains"],
): Layer1Signal[] {
  const signals: Layer1Signal[] = [];
  const fromDomain = addressDomain(headerValue(result, "from"));
  const returnPathDomain = addressDomain(headerValue(result, "return-path"));
  const replyToDomain = addressDomain(headerValue(result, "reply-to"));
  const dmarcFailedWithReject =
    result.dmarc !== false &&
    result.dmarc.status.result === "fail" &&
    result.dmarc.policy === "reject";

  if (result.spf !== false && result.spf.status.result === "fail") {
    signals.push(signal("spf_fail", "SPF authentication failed for the envelope sender."));
  }

  if (!hasValidDkim(result)) {
    signals.push(signal("dkim_missing_or_invalid", "No valid DKIM signature was verified."));
  }

  if (dmarcFailedWithReject) {
    signals.push(signal("dmarc_reject_failed", "DMARC failed while the sender policy is reject."));
  }

  if (returnPathDomain && fromDomain && !sameDomain(returnPathDomain, fromDomain)) {
    signals.push(signal("return_path_mismatch", "From and Return-Path domains do not align."));
  }

  if (replyToDomain && fromDomain && !sameDomain(replyToDomain, fromDomain)) {
    signals.push(signal("reply_to_mismatch", "Reply-To and From domains do not align."));
  }

  if (isBrandDisplayNameSpoof(headerValue(result, "from"), brandDomains)) {
    signals.push(
      signal(
        "display_name_spoofing",
        "Display name resembles a configured brand but uses another domain.",
      ),
    );
  }

  const messageId = headerValue(result, "message-id");
  if (!messageId || !/^<[^<>@\s]+@[^<>@\s]+>$/.test(messageId)) {
    signals.push(signal("message_id_missing_or_malformed", "Message-ID is missing or malformed."));
  }

  if (hasReceivedChainAnomaly(result)) {
    signals.push(
      signal(
        "received_chain_anomaly",
        "Received headers contain inconsistent relay ordering or hops.",
      ),
    );
  }

  return signals;
}

function capScore(signals: readonly Layer1Signal[]): number {
  return Math.min(
    100,
    signals.reduce((total, current) => total + current.score, 0),
  );
}

/** Public entry point used by the pipeline and easy to replace with a test double. */
export async function analyzeLayer1(input: Layer1Input): Promise<Layer1Result> {
  const mailauth = await verifyMailAuthentication(input);
  const signals = evaluateHeaderSignals(mailauth, input.brandDomains);

  return {
    score: capScore(signals),
    signals,
    authentication: {
      spf: authenticationStatus(mailauth.spf === false ? undefined : mailauth.spf.status),
      dkim: authenticationStatus(
        hasValidDkim(mailauth) ? { result: "pass" } : mailauth.dkim.results[0]?.status,
      ),
      dmarc: authenticationStatus(mailauth.dmarc === false ? undefined : mailauth.dmarc.status),
    },
    receivedHopCount: mailauth.receivedChain?.length ?? 0,
    mailauth,
  };
}
