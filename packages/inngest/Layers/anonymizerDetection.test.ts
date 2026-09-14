import assert from "node:assert/strict";
import test from "node:test";

import { detectAnonymizer } from "./anonymizerDetection";

const originalFetch = globalThis.fetch;

test.afterEach(() => {
  globalThis.fetch = originalFetch;
  delete process.env.IPQUALITYSCORE_API_KEY;
});

test("detects a Tor exit IP from the earliest external hop", async () => {
  globalThis.fetch = async (input) => {
    assert.equal(String(input), "https://check.torproject.org/torbulkexitlist");
    return new Response("185.220.101.1\n", { status: 200 });
  };

  const signals = await detectAnonymizer([
    { from: { comment: "[192.168.1.2]" } },
    { from: { comment: "[185.220.101.1]" }, by: { value: "mx.example.test" } },
  ], { spf: false } as never);

  assert.equal(signals[0]?.code, "tor_exit_node_detected");
  assert.equal(signals[0]?.hopIndex, 1);
});

test("detects a VPN or hosting provider from IPQS", async () => {
  process.env.IPQUALITYSCORE_API_KEY = "test-key";
  globalThis.fetch = async (input) => {
    if (String(input).includes("torbulkexitlist")) return new Response("", { status: 200 });
    return Response.json({ success: true, vpn: true, ISP: "Example VPN", ASN: 20473 });
  };

  const signals = await detectAnonymizer([
    { from: { comment: "[2001:db8::42]" } },
  ], { spf: false } as never);

  assert.equal(signals[0]?.code, "vpn_or_proxy_ip_detected");
  assert.equal(signals[0]?.ip, "2001:db8::42");
  assert.equal(signals[0]?.asn, "AS20473");
});

test("does not flag a clean residential IP", async () => {
  globalThis.fetch = async () => new Response("", { status: 200 });

  const signals = await detectAnonymizer([
    { from: { comment: "[203.0.113.10]" } },
  ], { spf: false } as never);

  assert.deepEqual(signals, []);
});

test("reports unavailable when only internal hops are present", async () => {
  globalThis.fetch = async () => new Response("", { status: 200 });

  const signals = await detectAnonymizer([
    { from: { comment: "[8.8.8.8]" }, by: { value: "mx.google.com" } },
    { from: { comment: "[::1]" } },
  ], { spf: false } as never);

  assert.equal(signals[0]?.code, "originating_ip_unavailable");
});