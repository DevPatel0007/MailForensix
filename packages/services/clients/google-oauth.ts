import { CodeChallengeMethod, OAuth2Client } from "google-auth-library";
import { env } from "../env";

export const GMAIL_READONLY_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";
export const googleOAuth2Client = new OAuth2Client({
  client_id: env.GOOGLE_OAUTH_CLIENT_ID,
  client_secret: env.GOOGLE_OAUTH_CLIENT_SECRET,
  redirectUri: env.GOOGLE_OAUTH_REDIRECT_URI,
});

export const gmailOAuth2Client = new OAuth2Client({
  client_id: env.GOOGLE_OAUTH_CLIENT_ID,
  client_secret: env.GOOGLE_OAUTH_CLIENT_SECRET,
  redirectUri: env.GOOGLE_GMAIL_OAUTH_REDIRECT_URI,
});

export function getGoogleAuthorizationUrl(state: string, codeChallenge: string) {
  return googleOAuth2Client.generateAuthUrl({
    access_type: "online",
    scope: ["openid", "email", "profile"],
    state,
    code_challenge: codeChallenge,
    code_challenge_method: CodeChallengeMethod.S256,
    prompt: "select_account",
  });
}

export function getGmailAuthorizationUrl(state: string, codeChallenge: string) {
  return gmailOAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["openid", "email", "profile", GMAIL_READONLY_SCOPE],
    state,
    code_challenge: codeChallenge,
    code_challenge_method: CodeChallengeMethod.S256,
    prompt: "consent",
  });
}

export async function exchangeGmailAuthorizationCode(code: string, codeVerifier: string) {
  const { tokens } = await gmailOAuth2Client.getToken({ code, codeVerifier });
  if (!tokens.id_token) throw new Error("Google did not return an ID token");
  const ticket = await gmailOAuth2Client.verifyIdToken({
    idToken: tokens.id_token,
    audience: env.GOOGLE_OAUTH_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.email || payload.email_verified !== true) {
    throw new Error("Google account email is not verified");
  }
  return {
    providerAccountId: payload.sub,
    email: payload.email.toLowerCase(),
    accessToken: tokens.access_token ?? undefined,
    refreshToken: tokens.refresh_token ?? undefined,
    tokenExpiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
    grantedScopes: tokens.scope?.split(" ").filter(Boolean) ?? [],
  };
}

export async function verifyGoogleAuthorizationCode(code: string, codeVerifier: string) {
  const { tokens } = await googleOAuth2Client.getToken({ code, codeVerifier });
  if (!tokens.id_token) throw new Error("Google did not return an ID token");

  const ticket = await googleOAuth2Client.verifyIdToken({
    idToken: tokens.id_token,
    audience: env.GOOGLE_OAUTH_CLIENT_ID,
  });
  const payload = ticket.getPayload();

  if (!payload?.sub || !payload.email || payload.email_verified !== true) {
    throw new Error("Google account email is not verified");
  }

  return {
    providerAccountId: payload.sub,
    email: payload.email.toLowerCase(),
    fullName: payload.name?.trim() || payload.email.split("@")[0] || "Google user",
    profileImageUrl: payload.picture,
  };
}
