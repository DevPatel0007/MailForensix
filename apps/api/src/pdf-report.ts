type ExecutiveSummaryInput = {
  threatLevel: "safe" | "suspicious" | "flagged";
  riskScore: number;
  subject?: string | null;
  sender?: string | null;
  keyPoints?: string[];
};

export function buildExecutiveSummary(input: ExecutiveSummaryInput) {
  const subjectText = input.subject ? `"${input.subject}"` : "this email";
  const senderText = input.sender ? ` from ${input.sender}` : "";

  const headline =
    input.threatLevel === "flagged"
      ? `High risk — score ${input.riskScore}/100`
      : input.threatLevel === "suspicious"
        ? `Elevated risk — score ${input.riskScore}/100`
        : `Low risk — score ${input.riskScore}/100`;

  const primarySignal = input.keyPoints?.[0]
    ? input.keyPoints[0]
    : "No individual signal was flagged above the baseline threshold.";

  const narrative =
    input.threatLevel === "flagged"
      ? `Critical indicators suggest that ${subjectText}${senderText} requires immediate review. ${primarySignal} The message should be handled with caution until a verified sender and content check are complete.`
      : input.threatLevel === "suspicious"
        ? `The email ${subjectText}${senderText} shows warning signs that merit investigation. ${primarySignal} Review the sender context and suspicious content before taking any action.`
        : `The email ${subjectText}${senderText} appears low risk from a forensic perspective. ${primarySignal} Continue with routine handling and keep the message monitored for any changes.`;

  return { headline, narrative };
}
