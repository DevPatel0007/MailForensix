import test from "node:test";
import assert from "node:assert/strict";
import { extractIpIntelligence } from "./layer2";

test("extracts public IPs and records private IPs from Received headers", () => {
  const result = extractIpIntelligence([
    "from internal (10.0.0.5) by relay ([2001:4860:4860::8888])",
    "from relay (185.220.101.45) by receiver",
  ]);

  assert.equal(result.status, "public_ip_found");
  assert.deepEqual(result.privateIps, ["10.0.0.5"]);
  assert.deepEqual(result.candidateIps, ["185.220.101.45", "2001:4860:4860::8888"]);
  assert.deepEqual(result.ipsFound, ["10.0.0.5", "2001:4860:4860::8888", "185.220.101.45"]);
});

test("prefers a routable IPv4 over a 6to4 IPv6 address", () => {
  const result = extractIpIntelligence([
    "from relay [2002:a05:6359:4423:b0:2af:ffe8:747a]",
    "from mail.example [54.240.65.16]",
  ]);

  assert.deepEqual(result.candidateIps, ["54.240.65.16"]);
  assert.deepEqual(result.privateIps, ["2002:a05:6359:4423:b0:2af:ffe8:747a"]);
});
