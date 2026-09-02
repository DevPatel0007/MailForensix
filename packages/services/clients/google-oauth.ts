import { CodeChallengeMethod, OAuth2Client } from "google-auth-library";
import { env } from "../env";

export const googleOAuth2Client = new OAuth2Client({
  client_id: env.GOOGLE_OAUTH_CLIENT_ID,
  client_secret: env.GOOGLE_OAUTH_CLIENT_SECRET,
  redirectUri: env.GOOGLE_OAUTH_REDIRECT_URI,
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
