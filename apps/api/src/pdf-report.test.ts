import test from "node:test";
import assert from "node:assert/strict";

import { buildExecutiveSummary } from "./pdf-report";

test("buildExecutiveSummary prioritizes high-risk findings in the executive summary", () => {
  const execSummary = buildExecutiveSummary({
    threatLevel: "flagged",
    riskScore: 88,
    subject: "Urgent invoice verification required",
    sender: "billing@secure-payments.example",
    keyPoints: [
      "Sender mismatch detected across authentication checks.",
      "Domain and geolocation indicators suggest a suspicious origin.",
    ],
  });

  assert.match(execSummary.headline, /high risk/i);
  assert.match(execSummary.narrative, /critical/i);
  assert.match(execSummary.narrative, /invoice verification required/i);
});
