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
import { buildExecutiveSummary } from "./pdf-report";
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

    const { headline, narrative } = buildExecutiveSummary({
      threatLevel: summary.threatLevel,
      riskScore: summary.riskScore,
      subject: summary.subject,
      sender: summary.sender,
      keyPoints: summary.keyPoints,
    });

    const document = new PDFDocument({
      size: "A4",
      margin: 48,
      info: { Title: "MailForensix Email Summary", Author: "MailForensix" },
    });

    const pageWidth = 595.28;
    const mutedColor = "#6b7280";
    const borderColor = "#d1d5db";
    const sectionColor = "#111827";
    const statusColor = summary.threatLevel === "flagged" ? "#dc2626" : summary.threatLevel === "suspicious" ? "#d97706" : "#059669";

    const addSectionHeader = (label: string, y: number) => {
      document.font("Helvetica-Bold").fontSize(9).fillColor(mutedColor).text(label.toUpperCase(), 48, y);
      document.strokeColor(borderColor).moveTo(48, y + 16).lineTo(pageWidth - 48, y + 16).stroke();
      return y + 26;
    };

    document.fontSize(22).fillColor(sectionColor).text("MailForensix", 48, 48);
    document.fontSize(10).fillColor(mutedColor).text("Email forensic summary", 48, 75);
    document.fontSize(9).fillColor(mutedColor).text(new Date(summary.generatedAt).toLocaleString(), 420, 75, { align: "right" });

    document.fillColor("#ecfdf5").roundedRect(48, 96, pageWidth - 96, 96, 10).fill();
    document.fillColor("#064e3b").font("Helvetica-Bold").fontSize(11).text("Executive summary", 64, 112);
    document.fillColor(sectionColor).font("Helvetica-Bold").fontSize(18).text(headline, 64, 132, { width: pageWidth - 130 });
    document.fillColor(sectionColor).font("Helvetica").fontSize(11).text(narrative, 64, 164, { width: pageWidth - 130, lineGap: 4 });

    let cursorY = 214;
    cursorY = addSectionHeader("Risk overview", cursorY);
    document.fontSize(10).fillColor(mutedColor).text("Status", 64, cursorY);
    document.fontSize(16).fillColor(statusColor).text(summary.threatLevel.toUpperCase(), 160, cursorY - 2);
    document.fontSize(10).fillColor(mutedColor).text("Risk score", 260, cursorY);
    document.fontSize(16).fillColor(sectionColor).text(`${summary.riskScore}/100`, 340, cursorY - 2);

    cursorY += 30;
    document.fontSize(10).fillColor(mutedColor).text("Subject", 64, cursorY);
    document.fontSize(11).fillColor(sectionColor).text(summary.subject ?? "Untitled email", 160, cursorY, { width: 320 });
    document.fontSize(10).fillColor(mutedColor).text("Sender", 64, cursorY + 20);
    document.fontSize(11).fillColor(sectionColor).text(summary.sender ?? "Unknown sender", 160, cursorY + 20, { width: 320 });

    cursorY += 58;
    cursorY = addSectionHeader("Key findings", cursorY);
    for (const point of summary.keyPoints.slice(0, 4)) {
      document.fillColor(sectionColor).fontSize(10).text(`• ${point}`, 64, cursorY, { width: pageWidth - 140, lineGap: 4 });
      cursorY += 18;
    }

    if (summary.geolocation) {
      cursorY += 18;
      cursorY = addSectionHeader("Geolocation", cursorY);
      document.fontSize(10).fillColor(mutedColor).text("Location", 64, cursorY);
      document.fontSize(11).fillColor(sectionColor).text(`${summary.geolocation.city ?? "Unknown city"}, ${summary.geolocation.country ?? "Unknown country"}`, 160, cursorY, { width: 300 });
      document.fontSize(10).fillColor(mutedColor).text("Coordinates", 64, cursorY + 20);
      document.fontSize(11).fillColor(sectionColor).text(`${summary.geolocation.latitude}, ${summary.geolocation.longitude}`, 160, cursorY + 20);
      cursorY += 42;
    }

    if (summary.indicators.length) {
      cursorY = addSectionHeader("Indicators", cursorY);
      let indicatorY = cursorY;
      for (const indicator of summary.indicators.slice(0, 6)) {
        document.fillColor(statusColor).fontSize(8).text(indicator.severity.toUpperCase(), 64, indicatorY, { width: 50 });
        document.fillColor(sectionColor).fontSize(10).text(`${indicator.label}: ${indicator.value}`, 120, indicatorY, { width: pageWidth - 180, lineGap: 3 });
        indicatorY += 18;
      }
      cursorY = indicatorY + 10;
    }

    document.addPage();
    document.fontSize(20).fillColor(sectionColor).text("Detailed assessment", 48, 48);
    document.fontSize(10).fillColor(mutedColor).text("Narrative summary", 48, 76);
    document.fontSize(11).fillColor(sectionColor).text(summary.summary, 48, 96, { width: pageWidth - 96, lineGap: 6 });

    let detailY = 170;
    document.fontSize(10).fillColor(mutedColor).text("Signals and context", 48, detailY - 16);
    for (const point of summary.keyPoints.slice(0, 8)) {
      document.fontSize(10).fillColor(sectionColor).text(`• ${point}`, 48, detailY, { width: pageWidth - 96, lineGap: 4 });
      detailY += 18;
    }

    if (summary.indicators.length > 6) {
      document.addPage();
      document.fontSize(20).fillColor(sectionColor).text("Additional indicators", 48, 48);
      let extraY = 88;
      for (const indicator of summary.indicators.slice(6)) {
        document.fillColor(statusColor).fontSize(8).text(indicator.severity.toUpperCase(), 48, extraY, { width: 50 });
        document.fillColor(sectionColor).fontSize(10).text(`${indicator.label}: ${indicator.value}`, 110, extraY, { width: pageWidth - 150, lineGap: 3 });
        extraY += 20;
      }
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
