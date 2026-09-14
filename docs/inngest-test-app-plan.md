# Inngest Test App Plan

## Purpose

Use `/test/inngest` to exercise the real Gmail scan path:

1. The browser calls `gmail.scan` through tRPC.
2. The API fetches the selected Gmail message in `full` and `raw` formats.
3. The API sends `mail.received` to Inngest.
4. Inngest runs and persists Layer 1 analysis.
5. Inngest runs Layer 2 domain infrastructure checks automatically.
6. Inngest persists Layer 2 in the same MongoDB `EmailAnalysis` document.

## Test event JSON

```json
{
  "name": "mail.received",
  "data": {
    "gmailMessageId": "<real-gmail-message-id>",
    "userId": "<authenticated-user-id>",
    "accountId": "<connected-google-account-id>",
    "message": "<raw-rfc822-email>",
    "senderIp": "0.0.0.0",
    "helo": "",
    "from": "sender@example.com",
    "to": "recipient@example.com",
    "subject": "Example message",
    "date": "2026-09-09T12:00:00.000Z"
  }
}
```

## Run

```powershell
pnpm install
pnpm check-types
pnpm dev
pnpm --filter @repo/inngest dev
```

Open `http://localhost:3000/test/inngest`, sign in, connect Gmail, enter a message ID, and submit.

## Verify

- Inngest shows `authenticate-and-inspect-headers` as completed.
- Inngest shows `persist-layer1-result` as completed.
- Inngest shows `inspect-domain-infrastructure` as completed.
- Inngest shows `persist-layer2-result` as completed.
- MongoDB contains one `EmailAnalysis` document for the Gmail ID.
- Repeating the same scan updates that document instead of creating a duplicate.
- The UI displays the submitted state or the backend error.