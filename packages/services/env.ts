import { z } from "zod";

const envSchema = z.object({
  GOOGLE_OAUTH_CLIENT_ID: z.string(),
  GOOGLE_OAUTH_CLIENT_SECRET: z.string(),
  GOOGLE_OAUTH_REDIRECT_URI: z.string(),
  GOOGLE_GMAIL_OAUTH_REDIRECT_URI: z.string().url(),
  AUTH_JWT_SECRET: z.string().min(32),
  AUTH_JWT_ISSUER: z.string().default("mailforensix-api"),
  AUTH_JWT_AUDIENCE: z.string().default("mailforensix-web"),
  AUTH_COOKIE_SECURE: z.coerce.boolean().default(false),
  GMAIL_TOKEN_ENCRYPTION_KEY: z.string().min(32),
});

function createEnv(env: NodeJS.ProcessEnv) {
  const safeParseResult = envSchema.safeParse(env);
  if (!safeParseResult.success) throw new Error(safeParseResult.error.message);
  return safeParseResult.data;
}

export const env = createEnv(process.env);
