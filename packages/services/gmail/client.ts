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
type GmailMessage = { id: string; threadId: string; snippet?: string; labelIds?: string[]; raw?: string; payload?: GmailPayload };
type GmailLabel = { id: string; name: string; messagesTotal?: number; messagesUnread?: number; threadsTotal?: number };
type GmailMessageList = { messages?: Array<{ id: string }>; nextPageToken?: string };

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

async function request<T>(credentials: GmailAccountCredentials, path: string, params?: Record<string, string | number | string[]>) {
  return clientFor(credentials).request<T>({
    url: `${GMAIL_API}${path}`,
    params,
    paramsSerializer: (values) => {
      const searchParams = new URLSearchParams();
      Object.entries(values ?? {}).forEach(([key, value]) => {
        if (Array.isArray(value)) value.forEach((item) => searchParams.append(key, item));
        else if (value !== undefined) searchParams.append(key, String(value));
      });
      return searchParams.toString();
    },
  });
}

function headers(payload?: GmailPayload) {
  return Object.fromEntries((payload?.headers ?? []).map(({ name, value }) => [name.trim().toLowerCase(), value.trim()]));
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
  const result = await request<{ labels?: GmailLabel[] }>(credentials, "/labels");
  return Promise.all((result.data.labels ?? []).filter((label) => ALLOWED_LABELS.has(label.id)).map(async (label) => ({
    id: label.id,
    name: label.name,
    total: label.messagesTotal && label.messagesTotal > 0 ? label.messagesTotal : await countGmailMessages(credentials, label.id),
    unread: label.messagesUnread ?? 0,
  })));
}

async function countGmailMessages(credentials: GmailAccountCredentials, labelId: string) {
  let count = 0;
  let pageToken: string | undefined;
  do {
    const result = await request<GmailMessageList>(credentials, "/messages", { labelIds: labelId, maxResults: 500, ...(pageToken ? { pageToken } : {}) });
    count += result.data.messages?.length ?? 0;
    pageToken = result.data.nextPageToken;
  } while (pageToken);
  return count;
}

export async function listGmailMessages(credentials: GmailAccountCredentials, labelId: string, maxResults: number, pageToken?: string) {
  if (!ALLOWED_LABELS.has(labelId)) throw new Error("Unsupported Gmail label");
  const result = await request<GmailMessageList>(credentials, "/messages", { labelIds: labelId, maxResults, ...(pageToken ? { pageToken } : {}) });
  const messages = await Promise.all((result.data.messages ?? []).map(async ({ id }) => {
    const message = await request<GmailMessage>(credentials, `/messages/${encodeURIComponent(id)}`, { format: "metadata", metadataHeaders: ["From", "To", "Subject", "Date"] });
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

export async function getGmailRawMessage(credentials: GmailAccountCredentials, id: string) {
  const message = await request<GmailMessage>(credentials, `/messages/${encodeURIComponent(id)}`, { format: "raw" });
  const raw = message.data.raw ?? "";
  return Buffer.from(raw.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
}
