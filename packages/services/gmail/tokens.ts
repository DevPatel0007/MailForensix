import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { googleOAuth2Client } from "../clients/google-oauth";
import { env } from "../env";

const algorithm = "aes-256-gcm";
const key = createHash("sha256").update(env.GMAIL_TOKEN_ENCRYPTION_KEY).digest();

export function encryptGmailToken(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, encrypted].map((part) => part.toString("base64url")).join(".");
}

export function decryptGmailToken(value: string) {
  const [ivValue, tagValue, encryptedValue] = value.split(".");
  if (!ivValue || !tagValue || !encryptedValue) throw new Error("Invalid encrypted Gmail token");
  const decipher = createDecipheriv(algorithm, key, Buffer.from(ivValue, "base64url"));
  decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

export async function refreshGmailAccessToken(refreshToken: string) {
  googleOAuth2Client.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await googleOAuth2Client.refreshAccessToken();
  if (!credentials.access_token) throw new Error("Google did not return a Gmail access token");
  return {
    accessToken: credentials.access_token,
    expiresAt: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
  };
}

export async function revokeGmailGrant(token: string) {
  await googleOAuth2Client.revokeToken(token);
}