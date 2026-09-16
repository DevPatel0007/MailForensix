import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  GMAIL_OAUTH_STATE_COOKIE_NAME,
  OAUTH_TRANSACTION_MAX_AGE_SECONDS,
  createOAuthTransaction,
  createPkceChallenge,
  parseOAuthTransaction,
} from "@repo/services/auth";
import { exchangeGmailAuthorizationCode, getGmailAuthorizationUrl } from "@repo/services/clients/google-oauth";
import { listGmailLabels, listGmailMessages, getGmailMessage, getGmailRawMessage } from "@repo/services/gmail/client";
import { inngest } from "@repo/inngest";
import { protectedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { userService } from "../../services";

const getPath = generatePath("/gmail");
const cookieFlags = "Path=/; HttpOnly; SameSite=Lax";

type ContextWithResponse = { req?: { headers?: { cookie?: string } }; res?: { append: (field: string, value: string) => void } };

function setCookie(ctx: ContextWithResponse, name: string, value: string, maxAge: number) {
  ctx.res?.append("Set-Cookie", `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; ${cookieFlags}`);
}

function clearCookie(ctx: ContextWithResponse, name: string) {
  setCookie(ctx, name, "", 0);
}

function getCookie(ctx: ContextWithResponse, name: string) {
  const entry = ctx.req?.headers?.cookie?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : null;
}

function gmailError(error: unknown): never {
  const message = error instanceof Error ? error.message : "Gmail request failed";
  if (/invalid_grant|revoked|unauthorized/i.test(message)) throw new TRPCError({ code: "UNAUTHORIZED", message: "Gmail access expired. Please reconnect Gmail." });
  if (/scope|permission/i.test(message)) throw new TRPCError({ code: "FORBIDDEN", message: "Gmail read permission is required." });
  throw new TRPCError({ code: "BAD_REQUEST", message });
}

async function credentialsFor(userId: string) {
  const credentials = await userService.getGmailCredentials(userId);
  if (!credentials) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Connect Gmail before opening your mailbox." });
  return {
    accessToken: credentials.account.gmailAccessToken,
    refreshToken: credentials.refreshToken,
    tokenExpiresAt: credentials.account.gmailTokenExpiresAt,
  };
}

export const gmailRouter = router({
  connection: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/connection"), tags: ["Gmail"] } })
    .output(z.object({ connected: z.boolean(), email: z.email().optional() }))
    .query(async ({ ctx }) => {
      const account = await userService.getGoogleAccountForUser(String(ctx.user.id));
      return { connected: Boolean(account?.gmailRefreshToken), email: account?.gmailRefreshToken ? account.providerEmail ?? undefined : undefined };
    }),

  connectUrl: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/connect"), tags: ["Gmail"] } })
    .output(z.object({ url: z.url() }))
    .query(({ ctx }) => {
      const transaction = createOAuthTransaction();
      setCookie(ctx, GMAIL_OAUTH_STATE_COOKIE_NAME, transaction.value, OAUTH_TRANSACTION_MAX_AGE_SECONDS);
      return { url: getGmailAuthorizationUrl(transaction.state, createPkceChallenge(transaction.verifier)) };
    }),

  callback: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/callback"), tags: ["Gmail"] } })
    .input(z.object({ code: z.string().min(1), state: z.string().min(1) }))
    .output(z.object({ connected: z.boolean(), email: z.email() }))
    .mutation(async ({ ctx, input }) => {
      const cookie = getCookie(ctx, GMAIL_OAUTH_STATE_COOKIE_NAME);
      if (!cookie) throw new TRPCError({ code: "BAD_REQUEST", message: "Gmail OAuth transaction is missing or expired." });
      let transaction;
      try { transaction = parseOAuthTransaction(cookie); } catch { throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid Gmail OAuth transaction." }); }
      clearCookie(ctx, GMAIL_OAUTH_STATE_COOKIE_NAME);
      if (transaction.state !== input.state) throw new TRPCError({ code: "BAD_REQUEST", message: "Gmail OAuth state mismatch." });
      try {
        const credentials = await exchangeGmailAuthorizationCode(input.code, transaction.verifier);
        await userService.saveGmailCredentials(String(ctx.user.id), credentials);
        return { connected: true, email: credentials.email };
      } catch (error) { return gmailError(error); }
    }),

  disconnect: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/disconnect"), tags: ["Gmail"] } })
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx }) => {
      await userService.disconnectGmail(String(ctx.user.id));
      return { success: true };
    }),

  labels: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/labels"), tags: ["Gmail"] } })
    .output(z.object({ labels: z.array(z.object({ id: z.string(), name: z.string(), total: z.number(), unread: z.number() })) }))
    .query(async ({ ctx }) => {
      try { return { labels: await listGmailLabels(await credentialsFor(String(ctx.user.id))) }; } catch (error) { return gmailError(error); }
    }),

  messages: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/messages"), tags: ["Gmail"] } })
    .input(z.object({ labelId: z.string().min(1), maxResults: z.number().int().min(1).max(50).default(20), pageToken: z.string().max(2048).optional() }))
    .output(z.object({ messages: z.array(z.object({ id: z.string(), threadId: z.string(), from: z.string(), to: z.string(), subject: z.string(), date: z.string(), snippet: z.string(), labels: z.array(z.string()) })), nextPageToken: z.string().nullable() }))
    .query(async ({ ctx, input }) => {
      try { return await listGmailMessages(await credentialsFor(String(ctx.user.id)), input.labelId, input.maxResults, input.pageToken); } catch (error) { return gmailError(error); }
    }),

  message: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/message"), tags: ["Gmail"] } })
    .input(z.object({ id: z.string().min(1).max(256) }))
    .output(z.object({ id: z.string(), threadId: z.string(), from: z.string(), to: z.string(), subject: z.string(), date: z.string(), snippet: z.string(), labels: z.array(z.string()), bodyText: z.string(), bodyHtml: z.string(), attachments: z.array(z.object({ id: z.string(), filename: z.string(), mimeType: z.string(), size: z.number() })) }))
    .query(async ({ ctx, input }) => {
      try { return await getGmailMessage(await credentialsFor(String(ctx.user.id)), input.id); } catch (error) { return gmailError(error); }
    }),

  scan: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/scan"), tags: ["Gmail"] } })
    .input(z.object({ id: z.string().min(1).max(256) }))
    .output(z.object({ submitted: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const credentials = await credentialsFor(String(ctx.user.id));
      const message = await getGmailMessage(credentials, input.id);
      const raw = await getGmailRawMessage(credentials, input.id);
      const account = await userService.getGoogleAccountForUser(String(ctx.user.id));

      await inngest.send({
        name: "mail.received",
        data: {
          gmailMessageId: message.id,
          userId: String(ctx.user.id),
          accountId: String(account?.id),
          message: raw,
          senderIp: "0.0.0.0",
          helo: "",
          from: message.from,
          to: message.to,
          subject: message.subject,
          date: message.date,
        },
      });

      return { submitted: true };
    }),

});
