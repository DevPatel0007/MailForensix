import { z } from "zod";
import {
  AUTH_COOKIE_MAX_AGE_SECONDS,
  AUTH_COOKIE_NAME,
  OAUTH_STATE_COOKIE_NAME,
  OAUTH_TRANSACTION_MAX_AGE_SECONDS,
  createOAuthTransaction,
  createPkceChallenge,
  createSessionToken,
  parseOAuthTransaction,
} from "@repo/services/auth";
import { getGoogleAuthorizationUrl, verifyGoogleAuthorizationCode } from "@repo/services/clients/google-oauth";
import { env as servicesEnv } from "@repo/services/env";
import { protectedProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import {createUserWithEmailAndPasswordInputModel , createUserWithEmailAndPasswordOutputModel } from "./model";
import { userService } from '../../services';


const TAGS = ["Authentication"];
const getPath = generatePath("/authentication");
const cookieFlags = `Path=/; HttpOnly; SameSite=Lax${servicesEnv.AUTH_COOKIE_SECURE ? "; Secure" : ""}`;

function setCookie(ctx: { res?: { append: (field: string, value: string) => void } }, name: string, value: string, maxAge: number) {
  ctx.res?.append("Set-Cookie", `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; ${cookieFlags}`);
}

function clearCookie(ctx: { res?: { append: (field: string, value: string) => void } }, name: string) {
  setCookie(ctx, name, "", 0);
}

export const authRouter = router({
  createUserWithEmailAndPassword: publicProcedure
  .meta({openapi: { method: "POST", path: getPath('/createUserWithEmailAndPassword'), tags: TAGS }})
  .input(createUserWithEmailAndPasswordInputModel)
  .output(createUserWithEmailAndPasswordOutputModel)
  .mutation(async ({ input }) => {
    const { fullName, email, password } = input;
    const { id } = await userService.createUserWithEmailAndPassword({
      fullName,
      email,
      password,
    });
    return { id };
  }),

  googleAuthorizationUrl: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/google"), tags: TAGS } })
    .input(z.object({}))
    .output(z.object({ url: z.url() }))
    .query(({ ctx }) => {
      const transaction = createOAuthTransaction();
      setCookie(ctx, OAUTH_STATE_COOKIE_NAME, transaction.value, OAUTH_TRANSACTION_MAX_AGE_SECONDS);
      return { url: getGoogleAuthorizationUrl(transaction.state, createPkceChallenge(transaction.verifier)) };
    }),

  googleCallback: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/google/callback"), tags: TAGS } })
    .input(z.object({ code: z.string().min(1), state: z.string().min(1) }))
    .output(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const cookie = ctx.req?.headers?.cookie;
      const entry = cookie?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${OAUTH_STATE_COOKIE_NAME}=`));
      if (!entry) throw new Error("OAuth transaction missing");
      const transaction = parseOAuthTransaction(decodeURIComponent(entry.slice(OAUTH_STATE_COOKIE_NAME.length + 1)));
      clearCookie(ctx, OAUTH_STATE_COOKIE_NAME);
      if (transaction.state !== input.state) throw new Error("OAuth state mismatch");

      const identity = await verifyGoogleAuthorizationCode(input.code, transaction.verifier);
      const user = await userService.upsertGoogleUser(identity);
      setCookie(ctx, AUTH_COOKIE_NAME, await createSessionToken(String(user.id)), AUTH_COOKIE_MAX_AGE_SECONDS);
      return { id: String(user.id) };
    }),

  me: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/me"), tags: TAGS } })
    .output(z.object({ id: z.string(), fullName: z.string(), email: z.email() }))
    .query(({ ctx }) => ({
      id: String(ctx.user.id),
      fullName: ctx.user.fullName,
      email: ctx.user.email,
    })),

  logout: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/logout"), tags: TAGS } })
    .input(z.object({}))
    .output(z.object({ success: z.boolean() }))
    .mutation(({ ctx }) => {
      clearCookie(ctx, AUTH_COOKIE_NAME);
      clearCookie(ctx, OAUTH_STATE_COOKIE_NAME);
      return { success: true };
    }),


});

