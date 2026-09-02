import { createHash, randomBytes } from "node:crypto";
import { jwtVerify, SignJWT } from "jose";
import { env } from "../env";

const encoder = new TextEncoder();

export const AUTH_COOKIE_NAME = "mailforensix_session";
export const OAUTH_STATE_COOKIE_NAME = "mailforensix_oauth";
export const GMAIL_OAUTH_STATE_COOKIE_NAME = "mailforensix_gmail_oauth";
export const AUTH_COOKIE_MAX_AGE_SECONDS = 15 * 60;
export const OAUTH_TRANSACTION_MAX_AGE_SECONDS = 10 * 60;

export function createOAuthState() {
  return randomBytes(32).toString("base64url");
}

export function createPkceVerifier() {
  return randomBytes(32).toString("base64url");
}

export function createPkceChallenge(verifier: string) {
  return createHash("sha256").update(verifier).digest("base64url");
}

export function createOAuthTransaction() {
  const state = createOAuthState();
  const verifier = createPkceVerifier();
  const value = Buffer.from(JSON.stringify({ state, verifier })).toString("base64url");
  return { state, verifier, value };
}

export function parseOAuthTransaction(value: string) {
  const parsed = JSON.parse(Buffer.from(value, "base64url").toString()) as {
    state?: string;
    verifier?: string;
  };
  if (!parsed.state || !parsed.verifier) throw new Error("Invalid OAuth transaction");
  return { state: parsed.state, verifier: parsed.verifier };
}

export async function createSessionToken(userId: string) {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(userId)
    .setIssuer(env.AUTH_JWT_ISSUER)
    .setAudience(env.AUTH_JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${AUTH_COOKIE_MAX_AGE_SECONDS}s`)
    .sign(encoder.encode(env.AUTH_JWT_SECRET));
}

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, encoder.encode(env.AUTH_JWT_SECRET), {
    issuer: env.AUTH_JWT_ISSUER,
    audience: env.AUTH_JWT_AUDIENCE,
  });
  return payload.sub ?? null;
}
