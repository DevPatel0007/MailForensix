import assert from "node:assert/strict";
import test from "node:test";

import { prepareAttachmentsForInngest } from "../index";
import { analyzeLayer4 } from "./layer4";

test("flags mismatched and suspicious links without attachment bytes", async () => {
  const result = await analyzeLayer4({
    bodyHtml: '<a href="https://evil.example/login">https://paypal.com</a><a href="http://192.0.2.10/login">login</a>',
    attachments: [{ filename: "invoice.pdf", mimeType: "application/pdf", size: 10 }],
  });

  assert.equal(result.urls.length, 2);
  assert.equal(result.urls[0]?.flags.includes("mismatched_link_text"), true);
  assert.equal(result.urls[1]?.flags.includes("suspicious_url"), true);
  assert.equal(result.attachments[0]?.verdict, "unavailable");
  assert.equal(result.signals.some((signal) => signal.code === "attachment_scan_unavailable"), true);
});

test("strips oversized attachment blobs before they are sent to Inngest", () => {
  const small = Buffer.from("small-payload").toString("base64");
  const large = "A".repeat(180_000);

  const result = prepareAttachmentsForInngest([
    { filename: "safe.txt", mimeType: "text/plain", size: 14, contentBase64: small },
    { filename: "huge.pdf", mimeType: "application/pdf", size: 180_000, contentBase64: large },
  ]);

  assert.equal(result[0]?.contentBase64, small);
  assert.equal(result[1]?.contentBase64, undefined);
  assert.equal(result[1]?.filename, "huge.pdf");
});
