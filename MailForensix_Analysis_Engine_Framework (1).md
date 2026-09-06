# MailForensix — Email Analysis Engine Framework

**Scope:** This covers the actual **analysis engine** — the component that takes a normalized `RawEmailPayload` (from the ingestion doc) and decides: is this email legitimate, suspicious, impersonated, phishing, or fraud (BEC)? This is the "Fraudulent Email Detection Engine" + "Identity Correlation" pieces of your FRD.

---

## 1. Architecture — Multi-Layer Analysis Pipeline

Don't build one monolithic classifier. Use a **layered ensemble**: each layer produces an independent signal/score (all normalized to a common **0–100 risk scale**), and a final aggregator combines them into one fraud confidence score (also 0–100) + classification label. This is both more accurate and much easier to explain in your dashboard/forensic report (analysts want to see *why*, not just a number).

```
RawEmailPayload
      │
      ├──▶ Layer 1: Authentication & Header Forensics   (rule-based, deterministic)
      ├──▶ Layer 2: Domain & Infrastructure Reputation   (lookup-based)
      ├──▶ Layer 3: NLP Content Analysis                 (ML/LLM-based)
      ├──▶ Layer 4: URL/Link Analysis                    (rule + reputation)
      └──▶ Layer 5: Behavioral/Historical Correlation    (graph-based)
                          │
                          ▼
              Aggregator / Scoring Engine
                          │
                          ▼
          Final classification + confidence + explanation
```

Each layer is a separate module/microservice-style function so you can build, test, and demo them independently — good for hackathon incremental progress too.

---

## 2. Layer 1 — Authentication & Header Forensics (deterministic, no ML needed)

**Framework:** `mailauth` (Node.js) does SPF, DKIM, and DMARC verification in one call.

```js
const { authenticate } = require('mailauth');
const result = await authenticate(rawEmlBuffer, {
  ip: senderIp,
  helo: heloName,
  mta: 'yourorg.in'
});
// result.spf.status.result, result.dkim.results, result.dmarc.status.result
```

**Rule-based scoring (no ML — pure logic table):**

| Signal | Weight | Trigger |
|---|---|---|
| SPF fail | High | `result.spf.status.result === 'fail'` |
| DKIM missing/invalid | High | no valid DKIM signature or signature verification fails |
| DMARC fail + policy=reject | Critical | sender domain says "reject on fail" but it wasn't rejected |
| `From:` domain ≠ `Return-Path` domain (no valid forwarding reason) | Medium | mismatch check |
| `Reply-To:` domain ≠ `From:` domain | Medium | common BEC pattern |
| Display-name spoofing (`"PayPal Support" <random123@gmail.com>`) | High | regex: known brand name in display name, but domain not owned by that brand |
| Missing/malformed `Message-ID` | Low | format check |
| Header count anomalies (duplicate `Received:` inconsistencies, out-of-order timestamps) | Medium | timestamp monotonicity check across relay chain |

This layer alone should produce a **deterministic sub-score (0–100)** — it's your most reliable signal and needs zero training data, so build/demo it first.

---

## 3. Layer 2 — Domain & Infrastructure Reputation

**Frameworks/data sources:**
- `whois-json` — domain age (new domains <30 days old are a strong phishing signal)
- Node `dns/promises` — verify MX/SPF/DMARC DNS records actually match what the email claims
- `MaxMind GeoLite2` (local MMDB) — IP geolocation, ASN, hosting-provider type
- Blacklist cross-reference: **Spamhaus DBL/ZEN**, **URLhaus**, **PhishTank** — all offer free DNSBL/API lookups you can query per-domain/IP

**Scoring inputs (all normalized to 0–100):**
- Domain age (younger = higher risk, sigmoid-style decay, e.g. `score = 100 / (1 + age_days/30)`)
- Hosting type: datacenter/cloud (higher risk for a "bank" claiming to email from a residential-looking or bulk-hosting IP) vs known corporate infra
- Blacklist hit = near-automatic high score (e.g. flat 90+)
- ASN reputation history (has this ASN sent flagged mail before, per your own historical DB — this feeds Layer 5 too)

---

## 4. Layer 3 — NLP Content Analysis (this is your "AI" centerpiece)

Two complementary approaches — use both, they catch different things:

### 4.1 Classical NLP feature-based model (fast, explainable, good baseline)
**Framework:** `scikit-learn` (Python microservice) or `natural`/`compromise` (Node, if you want single-stack).
- **Features:** TF-IDF or bag-of-words on subject+body, urgency-word count (`"immediately"`, `"urgent"`, `"suspended"`, `"verify now"`), presence of financial terms + request-for-action patterns, second-person imperative density, punctuation/caps-lock ratio (shouty subject lines).
- **Model:** Start with **Logistic Regression** or **LightGBM/XGBoost** trained on a labeled phishing dataset (e.g. the public **Nazario phishing corpus**, **SpamAssassin public corpus**, or **Enron + injected phishing samples** for BEC-style). This is fast to train, fast to run, and gives you a clean probability score — good hackathon MVP.

### 4.2 LLM-based semantic judge (the piece you already planned to store in MongoDB)
**Framework:** Call your chosen LLM (Claude via Anthropic API, or open-weight model) with **structured/schema-constrained output** — force it to return JSON matching a fixed schema so it's directly usable downstream, not free text you have to re-parse.

```json
// Prompt the model to return exactly this shape:
{
  "impersonation_target": "string or null (e.g. 'PayPal', 'CEO', 'IT Department')",
  "urgency_score": "0-100",
  "bec_pattern": "one of: payment_diversion | fake_invoice | credential_harvest | executive_impersonation | none",
  "tone_analysis": "string, brief",
  "confidence": "0-100"
}
```
- Why an LLM here and not just classical ML: BEC and impersonation emails are often **well-written, grammatically clean, and short** — they don't trip classic spam heuristics. An LLM catches semantic impersonation ("this reads like it's pretending to be the CFO asking for a wire transfer") that a bag-of-words model misses entirely.
- Use **function calling / tool-use** on the API call so the output is guaranteed structured (this is exactly the pattern in your `anthropic_api_in_artifacts` reference if you're prototyping this in an Artifact).

### 4.3 Combine 4.1 + 4.2
Weighted average or simple max — if either flags high-confidence phishing, escalate. Classical model is your fast-path filter (cheap, runs on every email); LLM judge is your deep-path (runs on emails that already look borderline from Layers 1–2, to control API cost).

---

## 5. Layer 4 — URL/Link Analysis + Attachment Verification

### 5.1 URL/Link Analysis

**Frameworks:**
- `cheerio` — extract all `<a href>` from `bodyHtml`
- `punycode` (Node built-in) + `confusables` npm package — detect homograph attacks (`paypa1.com`, Cyrillic lookalike characters)
- Levenshtein distance (`fast-levenshtein` npm) against a list of commonly-impersonated brand domains — flag domains within edit-distance 1-2 of known brands
- Unshorten redirects: `HEAD` request following (`axios` with `maxRedirects`) to reveal the true destination behind shortened/obfuscated links
- Cross-check final destination against **Google Safe Browsing API** (free tier) or **URLhaus**
- **VirusTotal API v3** (`/api/v3/urls`) — submit the *unshortened, final* URL for an additional reputation vote aggregated across 70+ engines; use this as a second opinion alongside Safe Browsing/URLhaus rather than a replacement (different vendors flag different things, and VT's community/vendor consensus score is a good explainability signal on its own — "34/94 vendors flagged this URL as malicious")

**Output:** list of flagged URLs with `type: homograph_domain | known_malicious | shortened_obfuscated | mismatched_display_text` (e.g. link text says "paypal.com" but `href` points elsewhere — classic phishing tell, trivially checkable via `cheerio`).

### 5.2 Attachment Verification (VirusTotal)

Emails with attachments need their own sub-check — attachments are a completely separate attack surface from links (malicious macros, disguised executables, weaponized PDFs), and this is exactly what VirusTotal's **file-scanning** endpoints are built for.

**Framework:** VirusTotal API v3, file endpoints — free tier is rate-limited (~4 requests/min, 500/day) but fine for a hackathon demo; get an API key from your VT account.

**Flow per attachment:**
1. **Hash-first lookup (fast, no upload needed):** compute SHA-256 of the attachment locally, then `GET /api/v3/files/{hash}`. If VT already has a verdict on file (which it usually does for anything even mildly widespread), you get results instantly with zero upload.
2. **Upload-if-unknown (fallback):** if the hash returns 404 (VT has never seen this exact file), `POST /api/v3/files` to upload and scan it fresh. This is slower (analysis can take 30s–2min) — for the hackathon demo, show a "scanning…" state in the UI rather than blocking the pipeline synchronously; poll `GET /api/v3/analyses/{id}` for the result.
3. **Parse the verdict:** `last_analysis_stats` gives you `{malicious, suspicious, undetected, harmless, timeout}` counts across all AV engines — use `malicious + suspicious` count as your sub-score input, scaled to 0–100 (e.g. `score = min(100, (malicious + suspicious) * 10)`, so 10+ engines flagging it saturates at 100).
4. **Extra signals worth pulling from the same response:** `type_description` (does the claimed file type match actual content — e.g. a `.pdf` that's actually a `.exe` is an instant high-risk flag), `names` (has this exact hash previously been distributed under a different, more innocuous filename — a common social-engineering trick), and `creation_date`/`first_submission_date` (brand-new file hash = higher risk, same logic as domain-age scoring in Layer 2).

**Suggested library:** no official first-party Node SDK — either raw `axios`/`fetch` calls against the REST endpoints (simplest, most control) or a community wrapper like `virustotal-api` on npm if you want less boilerplate.

**Output:** for each attachment, `{filename, sha256, vt_malicious_count, vt_suspicious_count, type_mismatch: bool, verdict: clean | suspicious | malicious}` — feed `verdict` into the aggregator alongside the URL flags below.

---

## 6. Layer 5 — Behavioral/Historical Correlation (graph-based)

This is your "Identity Correlation and Attribution Support" FRD section.

**Framework:** Model as a graph — nodes = {sender domains, IPs, display names, recipient orgs}, edges = {"sent from", "claims to be", "linked infrastructure"}. 
- For a hackathon timeline, you don't need a full Neo4j deployment — you can model this as adjacency tables in PostgreSQL + resolve relationships through your GraphQL layer (which you've already planned for this exact purpose).
- **Clustering logic:** group emails into the same `campaignClusterId` when they share ≥2 of: sender IP/ASN, domain registration pattern (same registrar+creation-date window), near-identical body text (fuzzy match via `fast-levenshtein` or cosine similarity on TF-IDF vectors), or identical impersonation target from Layer 3.
- This lets your dashboard show "this email is part of a 14-email campaign targeting your finance team over the past 3 days" — a high-value forensic output.

---

## 7. Aggregator / Final Scoring Engine

Every layer now emits a sub-score on **0–100** (100 = maximum risk). The aggregator is a simple weighted sum where the weights are fractions of 100, so the final score naturally lands on 0–100 too — no separate rescaling step needed downstream (dashboard, API response, alert thresholds all speak the same units).

```
finalScore = (w1*authScore + w2*domainScore + w3*nlpScore + w4*urlScore + w5*behavioralScore) / 100
```
*(weights below are already expressed as percentages that sum to 100, so this division just keeps `finalScore` itself on 0–100 rather than 0–10000.)*

Start with **hand-tuned weights** (hackathon-appropriate, explainable) rather than a trained meta-model:

| Layer | Suggested weight | Sub-score range |
|---|---|---|
| Auth/Header forensics | 30 | 0–100 |
| Domain/Infra reputation | 20 | 0–100 |
| NLP content | 25 | 0–100 |
| URL + attachment analysis (incl. VirusTotal) | 15 | 0–100 |
| Behavioral correlation | 10 | 0–100 |

**Worked example:** authScore=80, domainScore=60, nlpScore=90, urlScore=40, behavioralScore=20
`finalScore = (30*80 + 20*60 + 25*90 + 15*40 + 10*20) / 100 = (2400+1200+2250+600+200)/100 = 66.5`

**Classification thresholds** (tune during testing, all on the 0–100 scale):
- `0–29` → legitimate
- `30–59` → suspicious (flag for review, don't auto-block)
- `60–84` → likely phishing/impersonation
- `85–100` → high-confidence fraud/phishing → real-time alert

**Explainability output** — for every email, store *which* signals fired, not just the number. This is what makes the forensic report usable by a human investigator:
```json
"explanation": [
  "DMARC policy is 'reject' but message passed through — spoofing likely",
  "Domain registered 5 days ago",
  "LLM judge flagged CEO impersonation with payment-diversion pattern",
  "Link text 'paypal.com' points to different actual domain"
]
```

---

## 8. Suggested Tech Stack Summary for This Component

| Purpose | Library/Service |
|---|---|
| SPF/DKIM/DMARC | `mailauth` |
| Domain WHOIS | `whois-json` |
| DNS verification | Node `dns/promises` |
| Geolocation | MaxMind GeoLite2 (local MMDB) |
| Blacklist checks | Spamhaus DBL/ZEN, URLhaus, PhishTank |
| Classical NLP/ML | `scikit-learn` + `LightGBM` (Python microservice) or `natural` (Node) |
| LLM semantic judge | Anthropic API (Claude), structured/tool-use output |
| HTML/link parsing | `cheerio` |
| Homograph detection | `punycode`, `confusables` |
| Fuzzy/similarity matching | `fast-levenshtein`, or TF-IDF cosine similarity |
| Redirect resolution | `axios` with `maxRedirects` |
| URL reputation (2nd opinion) | VirusTotal API v3 (`/api/v3/urls`) |
| Attachment/file scanning | VirusTotal API v3 (`/api/v3/files`, hash lookup + upload fallback) |
| Graph correlation | PostgreSQL adjacency tables + your existing GraphQL layer (or Neo4j if you have bandwidth) |

---

## 9. Suggested Build Order (for your hackathon timeline)

1. **Layer 1** (auth/header) — fully deterministic, no training data needed, build and demo first.
2. **Layer 2** (domain/IP reputation) — mostly API/lookup wiring.
3. **Layer 4** (URL analysis + VirusTotal URL/attachment checks) — self-contained, high demo value (visually flag "this link is fake" and "this attachment is malware" with a real vendor-consensus score behind it).
4. **Layer 3.1** (classical NLP baseline) — needs a labeled dataset; use a public phishing corpus to get moving fast.
5. **Layer 3.2** (LLM judge) — highest "wow factor" for judges, do this once the pipeline skeleton works end-to-end.
6. **Layer 5** (behavioral/graph correlation) — do last, it depends on having enough ingested emails to correlate against.

Want me to draft the actual scoring/aggregator function in TypeScript, or the labeled-dataset + training script for the classical NLP model (Layer 3.1)?
