import express from "express";
import { logger } from "@repo/logger";
import cors from "cors";
import PDFDocument from "pdfkit";
import { z } from "zod";

import * as trpcExpress from "@trpc/server/adapters/express";
import { generateOpenApiDocument, createOpenApiExpressMiddleware } from "trpc-to-openapi";
import { apiReference } from "@scalar/express-api-reference";

import { functions, inngest } from "@repo/inngest";
import { serverRouter, createContext } from "@repo/trpc/server";
import { serve } from "inngest/express";

import { env } from "./env";
import { getEmailSummary } from "@repo/trpc/server/services/email-summary";

export const app = express();
const openApiDocument = generateOpenApiDocument(serverRouter, {
  title: "Streamyst OpenAPI",
  version: "1.0.0",
  baseUrl: env.BASE_URL.concat("/api"),
});

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  }),
);

app.use(express.json({ limit: "25mb" }));

app.use("/api/inngest", serve({ client: inngest, functions }));

app.get("/", (req, res) => {
  return res.json({ message: "Streamyst is up and running..." });
});

app.get("/health", (req, res) => {
  return res.json({ message: "Streamyst server is healthy", healthy: true });
});

app.get("/api/hello", async (req, res, next) => {
  try {
    await inngest.send({
      name: "test/hello.world",
      data: { email: "testUser@example.com" },
    });

    return res.json({ message: "Event sent!" });
  } catch (error) {
    return next(error);
  }
});

const pdfRequestSchema = z.object({ scanId: z.string().min(1).max(256) });

function pdfToBuffer(document: PDFKit.PDFDocument) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    document.on("data", (chunk: Buffer) => chunks.push(chunk));
    document.on("end", () => resolve(Buffer.concat(chunks)));
    document.on("error", reject);
  });
}

app.post("/api/gmail/summary/pdf", async (req, res, next) => {
  try {
    const context = await createContext({
      req: { headers: { cookie: req.headers.cookie } },
      res: { append: (field, value) => res.append(field, value) },
    });
    if (!context.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const { scanId } = pdfRequestSchema.parse(req.body);
    const summary = await getEmailSummary(String(context.user.id), scanId);
    if (!summary) {
      res.status(404).json({ error: "Scan summary not found" });
      return;
    }

    const document = new PDFDocument({
      size: "A4",
      margin: 48,
      info: { Title: "MailForensix Email Summary", Author: "MailForensix" },
    });
    document.fontSize(22).fillColor("#111827").text("MailForensix");
    document.fontSize(11).fillColor("#6b7280").text("Email forensic summary");
    document.moveDown().strokeColor("#d1d5db").moveTo(48, 92).lineTo(547, 92).stroke();
    document.moveDown(2).fontSize(10).fillColor("#6b7280").text("Risk status");
    document.fontSize(16).fillColor(summary.threatLevel === "flagged" ? "#dc2626" : summary.threatLevel === "suspicious" ? "#d97706" : "#059669").text(`${summary.threatLevel.toUpperCase()} · Score ${summary.riskScore}`);
    document.moveDown().fontSize(10).fillColor("#6b7280").text("Subject");
    document.fontSize(12).fillColor("#111827").text(summary.subject ?? "Untitled email");
    document.moveDown().fontSize(10).fillColor("#6b7280").text("Summary");
    document.fontSize(12).fillColor("#111827").text(summary.summary);
    document.moveDown().fontSize(10).fillColor("#6b7280").text("Key points");
    for (const point of summary.keyPoints) document.fontSize(11).fillColor("#111827").text(`• ${point}`, { indent: 12 });
    if (summary.geolocation) {
      document.moveDown().fontSize(10).fillColor("#6b7280").text("Geolocation");
      document.fontSize(11).fillColor("#111827").text(`${summary.geolocation.city ?? "Unknown city"}, ${summary.geolocation.country ?? "Unknown country"} · ${summary.geolocation.latitude}, ${summary.geolocation.longitude}`);
    }
    if (summary.indicators.length) {
      document.moveDown().fontSize(10).fillColor("#6b7280").text("Indicators");
      for (const indicator of summary.indicators) document.fontSize(11).fillColor("#111827").text(`${indicator.severity.toUpperCase()} · ${indicator.label}: ${indicator.value}`);
    }
    document.end();
    const buffer = await pdfToBuffer(document);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="mailforensix-summary-${summary.id}.pdf"`);
    res.send(buffer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "scanId is required" });
      return;
    }
    next(error);
  }
});

logger.debug(`openapi.json: ${env.BASE_URL}/openapi.json`);
app.get("/openapi.json", (req, res) => {
  return res.json(openApiDocument);
});

logger.debug(`docs: ${env.BASE_URL}/docs`);
app.use("/docs", apiReference({ url: "/openapi.json" }));

app.use(
  "/api",
  createOpenApiExpressMiddleware({
    router: serverRouter,
    createContext,
  }),
);

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: serverRouter,
    createContext,
  }),
);

export default app;
