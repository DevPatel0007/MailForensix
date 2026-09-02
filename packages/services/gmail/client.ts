import { OAuth2Client } from "google-auth-library";
import { env } from "../env";

const GMAIL_API = "https://gmail.googleapis.com/gmail/v1/users/me";
const ALLOWED_LABELS = new Set(["INBOX", "SENT", "DRAFT", "STARRED", "SPAM", "TRASH", "IMPORTANT"]);

type GmailPart = {
  mimeType?: string;
  filename?: string;
  body?: { attachmentId?: string; size?: number; data?: string };
  parts?: GmailPart[];
};

type GmailPayload = { headers?: Array<{ name: string; value: string }>; body?: { data?: string }; parts?: GmailPart[]; mimeType?: string };
type GmailMessage = { id: string; threadId: string; snippet?: string; labelIds?: string[]; payload?: GmailPayload };

export type GmailAccountCredentials = {
  accessToken: string | null;
  refreshToken: string;
  tokenExpiresAt: Date | null;
};

function clientFor(credentials: GmailAccountCredentials) {
  const client = new OAuth2Client({
    client_id: env.GOOGLE_OAUTH_CLIENT_ID,
    client_secret: env.GOOGLE_OAUTH_CLIENT_SECRET,
  });
  client.setCredentials({
    access_token: credentials.accessToken ?? undefined,
    refresh_token: credentials.refreshToken,
    expiry_date: credentials.tokenExpiresAt?.getTime(),
  });
  return client;
}

async function request<T>(credentials: GmailAccountCredentials, path: string, params?: Record<string, string | number>) {
  return clientFor(credentials).request<T>({ url: `${GMAIL_API}${path}`, params });
}

function headers(payload?: GmailPayload) {
  return Object.fromEntries((payload?.headers ?? []).map(({ name, value }) => [name.toLowerCase(), value]));
}

function decodeBody(data?: string) {
  if (!data) return "";
  return Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
}

function bodyParts(payload?: GmailPayload) {
  let text = "";
  let html = "";
  const walk = (part?: GmailPart) => {
    if (!part) return;
    if (part.mimeType === "text/plain") text += decodeBody(part.body?.data);
    if (part.mimeType === "text/html") html += decodeBody(part.body?.data);
    part.parts?.forEach(walk);
  };
  walk(payload);
  return { text, html };
}

function attachmentParts(payload?: GmailPayload) {
  const attachments: Array<{ id: string; filename: string; mimeType: string; size: number }> = [];
  const walk = (part?: GmailPart) => {
    if (!part) return;
    if (part.filename && part.body?.attachmentId) {
      attachments.push({ id: part.body.attachmentId, filename: part.filename, mimeType: part.mimeType ?? "application/octet-stream", size: part.body.size ?? 0 });
    }
    part.parts?.forEach(walk);
  };
  walk(payload);
  return attachments;
}

export async function listGmailLabels(credentials: GmailAccountCredentials) {
  const result = await request<{ labels?: Array<{ id: string; name: string; messagesTotal?: number; messagesUnread?: number }> }>(credentials, "/labels");
  return (result.data.labels ?? []).filter((label) => ALLOWED_LABELS.has(label.id)).map((label) => ({
    id: label.id,
    name: label.name,
    total: label.messagesTotal ?? 0,
    unread: label.messagesUnread ?? 0,
  }));
}

export async function listGmailMessages(credentials: GmailAccountCredentials, labelId: string, maxResults: number, pageToken?: string) {
  if (!ALLOWED_LABELS.has(labelId)) throw new Error("Unsupported Gmail label");
  const result = await request<{ messages?: Array<{ id: string }>; nextPageToken?: string }>(credentials, "/messages", { labelIds: labelId, maxResults, ...(pageToken ? { pageToken } : {}) });
  const messages = await Promise.all((result.data.messages ?? []).map(async ({ id }) => {
    const message = await request<GmailMessage>(credentials, `/messages/${id}`, { format: "metadata", metadataHeaders: "From,To,Subject,Date" });
    const values = headers(message.data.payload);
    return { id: message.data.id, threadId: message.data.threadId, from: values.from ?? "", to: values.to ?? "", subject: values.subject ?? "(no subject)", date: values.date ?? "", snippet: message.data.snippet ?? "", labels: message.data.labelIds ?? [] };
  }));
  return { messages, nextPageToken: result.data.nextPageToken ?? null };
}

export async function getGmailMessage(credentials: GmailAccountCredentials, id: string) {
  const message = await request<GmailMessage>(credentials, `/messages/${encodeURIComponent(id)}`, { format: "full" });
  const values = headers(message.data.payload);
  const body = bodyParts(message.data.payload);
  return { id: message.data.id, threadId: message.data.threadId, from: values.from ?? "", to: values.to ?? "", subject: values.subject ?? "(no subject)", date: values.date ?? "", snippet: message.data.snippet ?? "", labels: message.data.labelIds ?? [], bodyText: body.text, bodyHtml: body.html, attachments: attachmentParts(message.data.payload) };
}
