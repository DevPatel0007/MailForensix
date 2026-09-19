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
import { listGmailLabels, listGmailMessages, getGmailMessage, getGmailRawMessage, getGmailAttachment } from "@repo/services/gmail/client";
import { inngest } from "@repo/inngest";
import { protectedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { userService } from "../../services";
import { connectMongo, EmailAnalysis } from "@repo/mongodb";

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
      const attachments = await Promise.all(message.attachments.map(async (attachment) => ({
        filename: attachment.filename,
        mimeType: attachment.mimeType,
        size: attachment.size,
        contentBase64: await getGmailAttachment(credentials, input.id, attachment.id),
      })));
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
          bodyText: message.bodyText,
          bodyHtml: message.bodyHtml,
          attachments,
        },
      });

      return { submitted: true };
    }),

  analysis: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/analysis"), tags: ["Gmail"] } })
    .input(z.object({ id: z.string().min(1).max(256) }))
    .output(z.any())
    .query(async ({ input }) => {
      await connectMongo();
      const analysis = await EmailAnalysis.findOne({ gmailMessageId: input.id }).lean();
      if (!analysis) return null;
      
      // Mongoose documents often have _id, we should convert it to string if present, or just return as is
      // .lean() makes it a POJO, but _id is an ObjectId. tRPC using Zod/JSON might serialize it fine,
      // but to be safe we can stringify _id, createdAt, updatedAt
      const result = {
        ...analysis,
        _id: analysis._id?.toString(),
        createdAt: analysis.createdAt?.toISOString(),
        updatedAt: analysis.updatedAt?.toISOString(),
      };
      
      return result as any; // tRPC will infer the type, or we could explicitly type it.
    }),

  dashboardStats: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/dashboardStats"), tags: ["Gmail"] } })
    .output(z.object({ totalScans: z.number(), threatsDetected: z.number(), safeEmails: z.number(), averageScore: z.number() }))
    .query(async ({ ctx }) => {
      await connectMongo();
      const userId = String(ctx.user.id);
      const totalScans = await EmailAnalysis.countDocuments({ userId });
      
      // Threats are those with score > 50 in layer2 or something similar
      const threatsDetected = await EmailAnalysis.countDocuments({ userId, "layer2.score": { $gt: 50 } });
      const safeEmails = totalScans - threatsDetected;
      
      const avgQuery = await EmailAnalysis.aggregate([
        { $match: { userId } },
        { $group: { _id: null, avg: { $avg: "$layer2.score" } } }
      ]);
      const averageScore = avgQuery[0]?.avg || 0;

      return { totalScans, threatsDetected, safeEmails, averageScore };
    }),

  analyticsStats: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/analyticsStats"), tags: ["Gmail"] } })
    .output(
      z.object({
        totalScans: z.number(),
        threatsDetected: z.number(),
        safeEmails: z.number(),
        averageScore: z.number(),
        detectionRate: z.number(),
        cleanRate: z.number(),
        weeklyVolumeChange: z.number(),
        trafficTimeline: z.array(
          z.object({
            name: z.string(),
            date: z.string(),
            safe: z.number(),
            threats: z.number(),
            total: z.number(),
          })
        ),
        threatVectors: z.array(
          z.object({
            type: z.string(),
            count: z.number(),
            share: z.string(),
            color: z.string(),
          })
        ),
      })
    )
    .query(async ({ ctx }) => {
      await connectMongo();
      const userId = String(ctx.user.id);
      const allScans = await EmailAnalysis.find({ userId }).sort({ createdAt: -1 }).lean();

      const totalScans = allScans.length;
      let threatsDetected = 0;
      let totalScore = 0;

      let phishingCount = 0;
      let authFailCount = 0;
      let suspiciousUrlCount = 0;
      let highRiskAttachmentCount = 0;

      const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const now = new Date();
      const past7Days: { name: string; date: string; safe: number; threats: number; total: number }[] = [];

      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dayStr = d.toISOString().split("T")[0]!;
        past7Days.push({
          name: daysOfWeek[d.getDay()]!,
          date: dayStr,
          safe: 0,
          threats: 0,
          total: 0,
        });
      }

      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      let thisWeekCount = 0;
      let lastWeekCount = 0;

      allScans.forEach((scan: any) => {
        const score = scan.layer2?.score ?? scan.layer1?.score ?? (scan.layer3?.score ? scan.layer3.score * 10 : 0);
        totalScore += score;
        const isThreat = score > 50;
        if (isThreat) threatsDetected++;

        const hasPhishing = Boolean(
          scan.layer3?.judgement?.bec_pattern ||
          scan.layer3?.judgement?.impersonation_target ||
          (scan.layer3?.score && scan.layer3.score > 5) ||
          scan.layer3?.signals?.some((s: any) => s.code?.toLowerCase().includes("phish") || s.code?.toLowerCase().includes("bec"))
        );
        if (hasPhishing) phishingCount++;

        const hasAuthFail = Boolean(
          scan.layer1?.authentication?.spf?.result === "fail" ||
          scan.layer1?.authentication?.dkim?.result === "fail" ||
          scan.layer1?.authentication?.dmarc?.result === "fail" ||
          scan.layer1?.signals?.some((s: any) => s.code?.toLowerCase().includes("fail") || s.score > 30)
        );
        if (hasAuthFail) authFailCount++;

        const hasSuspiciousUrl = Boolean(
          scan.layer4?.urls?.some((u: any) => u.verdict === "malicious" || (u.vtMaliciousCount && u.vtMaliciousCount > 0) || u.urlhausListed) ||
          scan.layer4?.signals?.some((s: any) => s.code?.toLowerCase().includes("url"))
        );
        if (hasSuspiciousUrl) suspiciousUrlCount++;

        const hasHighRiskAttachment = Boolean(
          scan.layer4?.attachments?.some((a: any) => a.verdict === "malicious" || (a.vtMaliciousCount && a.vtMaliciousCount > 0)) ||
          scan.layer4?.signals?.some((s: any) => s.code?.toLowerCase().includes("attach"))
        );
        if (hasHighRiskAttachment) highRiskAttachmentCount++;

        const rawDate = scan.date || scan.createdAt;
        const scanDate = rawDate ? new Date(rawDate) : new Date();
        const scanDayStr = scanDate.toISOString().split("T")[0];
        const dayBucket = past7Days.find((d) => d.date === scanDayStr);
        if (dayBucket) {
          dayBucket.total++;
          if (isThreat) dayBucket.threats++;
          else dayBucket.safe++;
        }

        if (scanDate >= sevenDaysAgo) {
          thisWeekCount++;
        } else if (scanDate >= fourteenDaysAgo) {
          lastWeekCount++;
        }
      });

      const safeEmails = totalScans - threatsDetected;
      const averageScore = totalScans > 0 ? Number((totalScore / totalScans).toFixed(1)) : 0;
      const detectionRate = totalScans > 0 ? Number(((threatsDetected / totalScans) * 100).toFixed(1)) : 0;
      const cleanRate = totalScans > 0 ? Number(((safeEmails / totalScans) * 100).toFixed(1)) : (totalScans === 0 ? 100 : 0);

      let weeklyVolumeChange = 0;
      if (lastWeekCount > 0) {
        weeklyVolumeChange = Number((((thisWeekCount - lastWeekCount) / lastWeekCount) * 100).toFixed(1));
      } else if (thisWeekCount > 0) {
        weeklyVolumeChange = 100;
      }

      const totalVectorOccurrences = phishingCount + authFailCount + suspiciousUrlCount + highRiskAttachmentCount;
      const calcShare = (count: number) => {
        if (totalVectorOccurrences === 0) return "0%";
        return `${((count / totalVectorOccurrences) * 100).toFixed(1)}%`;
      };

      const threatVectors = [
        { type: "Phishing / BEC Pattern", count: phishingCount, share: calcShare(phishingCount), color: "bg-red-500" },
        { type: "SPF/DKIM Alignment Fail", count: authFailCount, share: calcShare(authFailCount), color: "bg-amber-500" },
        { type: "Suspicious Embedded URL", count: suspiciousUrlCount, share: calcShare(suspiciousUrlCount), color: "bg-orange-500" },
        { type: "High-Risk Attachment Extension", count: highRiskAttachmentCount, share: calcShare(highRiskAttachmentCount), color: "bg-purple-500" },
      ];

      return {
        totalScans,
        threatsDetected,
        safeEmails,
        averageScore,
        detectionRate,
        cleanRate,
        weeklyVolumeChange,
        trafficTimeline: past7Days,
        threatVectors,
      };
    }),

  pastScans: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/pastScans"), tags: ["Gmail"] } })
    .output(z.object({ scans: z.array(z.any()) }))
    .query(async ({ ctx }) => {
      await connectMongo();
      const userId = String(ctx.user.id);
      const scans = await EmailAnalysis.find({ userId }).sort({ createdAt: -1 }).limit(50).lean();
      return {
        scans: scans.map(scan => ({
          ...scan,
          _id: scan._id?.toString(),
          createdAt: scan.createdAt?.toISOString(),
          updatedAt: scan.updatedAt?.toISOString(),
        }))
      };
    }),

  geolocationData: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/geolocationData"), tags: ["Gmail"] } })
    .output(z.object({ locations: z.array(z.object({
      ip: z.string(),
      country: z.string().nullable(),
      countryCode: z.string().nullable(),
      region: z.string().nullable(),
      city: z.string().nullable(),
      lat: z.number(),
      lng: z.number(),
      score: z.number(),
      source: z.string(),
      status: z.string(),
    })) }))
    .query(async ({ ctx }) => {
      await connectMongo();
      const userId = String(ctx.user.id);
      const scans = await EmailAnalysis.find({ userId, "layer2.senderIp": { $exists: true, $ne: null } }).lean();

      const locations = scans.flatMap((scan) => {
        const layer2 = scan.layer2;
        const geo = layer2?.geolocation;
        if (!layer2?.senderIp || !geo || typeof geo.latitude !== "number" || typeof geo.longitude !== "number") return [];
        if (!Number.isFinite(geo.latitude) || !Number.isFinite(geo.longitude)) return [];
        return [{
          ip: layer2.senderIp,
          country: geo.country ?? layer2.country ?? null,
          countryCode: geo.countryCode ?? null,
          region: geo.region ?? null,
          city: geo.city ?? null,
          lat: geo.latitude,
          lng: geo.longitude,
          score: layer2.score ?? 0,
          source: geo.source ?? "unknown",
          status: geo.status,
        }];
      });

      return { locations };
    }),

});
