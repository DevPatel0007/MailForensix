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

    const margin = 48;
    const mutedColor = "#6b7280";
    const borderColor = "#d1d5db";
    const sectionColor = "#111827";
    const statusColor = summary.threatLevel === "flagged" ? "#dc2626" : summary.threatLevel === "suspicious" ? "#d97706" : "#059669";
    const contentWidth = document.page.width - margin * 2;
    let cursorY = margin;

    const ensureSpace = (height: number) => {
      if (cursorY + height <= document.page.height - margin) return;
      document.addPage();
      cursorY = margin;
    };

    const addSectionHeader = (label: string) => {
      ensureSpace(30);
      document.font("Helvetica-Bold").fontSize(9).fillColor(mutedColor).text(label.toUpperCase(), margin, cursorY);
      document.strokeColor(borderColor).moveTo(margin, cursorY + 16).lineTo(document.page.width - margin, cursorY + 16).stroke();
      cursorY += 26;
    };

    const addText = (text: string, options: PDFKit.Mixins.TextOptions & { font?: string; fontSize?: number; fillColor?: string; lineGap?: number; x?: number; width?: number } = {}) => {
      const x = options.x ?? margin;
      const width = options.width ?? contentWidth;
      const textOptions = { ...options, width };
      const height = document.heightOfString(text, textOptions);
      ensureSpace(height);
      document.text(text, x, cursorY, textOptions);
      cursorY += height;
      return height;
    };

    document.fontSize(22).fillColor(sectionColor).text("MailForensix", margin, cursorY);
    cursorY += 27;
    document.fontSize(10).fillColor(mutedColor).text("Email forensic summary", margin, cursorY);
    document.fontSize(9).fillColor(mutedColor).text(new Date(summary.generatedAt).toLocaleString(), margin, cursorY, { width: contentWidth, align: "right" });
    cursorY += 21;

    document.font("Helvetica-Bold").fontSize(18);
    const headlineHeight = document.heightOfString(headline, { width: contentWidth - 32 });
    document.font("Helvetica").fontSize(11);
    const narrativeHeight = document.heightOfString(narrative, { width: contentWidth - 32, lineGap: 4 });
    const summaryBoxHeight = 30 + headlineHeight + narrativeHeight + 22;
    ensureSpace(summaryBoxHeight);
    document.fillColor("#ecfdf5").roundedRect(margin, cursorY, contentWidth, summaryBoxHeight, 10).fill();
    document.fillColor("#064e3b").font("Helvetica-Bold").fontSize(11).text("Executive summary", margin + 16, cursorY + 16);
    document.fillColor(sectionColor).font("Helvetica-Bold").fontSize(18).text(headline, margin + 16, cursorY + 36, { width: contentWidth - 32 });
    document.fillColor(sectionColor).font("Helvetica").fontSize(11).text(narrative, margin + 16, cursorY + 36 + headlineHeight + 6, { width: contentWidth - 32, lineGap: 4 });
    cursorY += summaryBoxHeight + 20;

    addSectionHeader("Risk overview");
    ensureSpace(24);
    document.fontSize(10).fillColor(mutedColor).text("Status", margin + 16, cursorY);
    document.fontSize(16).fillColor(statusColor).text(summary.threatLevel.toUpperCase(), margin + 112, cursorY - 2);
    document.fontSize(10).fillColor(mutedColor).text("Risk score", margin + 212, cursorY);
    document.fontSize(16).fillColor(sectionColor).text(`${summary.riskScore}/100`, margin + 292, cursorY - 2);
    cursorY += 30;

    const addMetadataRow = (label: string, value: string) => {
      const valueWidth = contentWidth - 112;
      document.font("Helvetica").fontSize(11);
      const height = document.heightOfString(value, { width: valueWidth });
      ensureSpace(Math.max(20, height));
      document.fontSize(10).fillColor(mutedColor).text(label, margin + 16, cursorY);
      document.fontSize(11).fillColor(sectionColor).text(value, margin + 112, cursorY, { width: valueWidth });
      cursorY += Math.max(20, height) + 4;
    };

    addMetadataRow("Subject", summary.subject ?? "Untitled email");
    addMetadataRow("Sender", summary.sender ?? "Unknown sender");

    addSectionHeader("Key findings");
    for (const point of summary.keyPoints.slice(0, 4)) {
      document.font("Helvetica").fontSize(10);
      const height = document.heightOfString(`• ${point}`, { width: contentWidth - 32, lineGap: 4 });
      ensureSpace(height + 4);
      document.fillColor(sectionColor).text(`• ${point}`, margin + 16, cursorY, { width: contentWidth - 32, lineGap: 4 });
      cursorY += height + 4;
    }

    if (summary.geolocation) {
      addSectionHeader("Geolocation");
      addMetadataRow("Location", `${summary.geolocation.city ?? "Unknown city"}, ${summary.geolocation.country ?? "Unknown country"}`);
      addMetadataRow("Coordinates", `${summary.geolocation.latitude}, ${summary.geolocation.longitude}`);
    }

    if (summary.indicators.length) {
      addSectionHeader("Indicators");
      for (const indicator of summary.indicators.slice(0, 6)) {
        document.font("Helvetica").fontSize(10);
        const value = `${indicator.label}: ${indicator.value}`;
        const height = document.heightOfString(value, { width: contentWidth - 72, lineGap: 3 });
        ensureSpace(height + 6);
        document.fillColor(statusColor).fontSize(8).text(indicator.severity.toUpperCase(), margin + 16, cursorY, { width: 50 });
        document.fillColor(sectionColor).fontSize(10).text(value, margin + 72, cursorY, { width: contentWidth - 72, lineGap: 3 });
        cursorY += height + 6;
      }
      cursorY += 10;
    }

    addSectionHeader("Detailed assessment");
    addText(summary.summary, { font: "Helvetica", fontSize: 11, fillColor: sectionColor, lineGap: 6 });
    cursorY += 18;
    addSectionHeader("Signals and context");
    for (const point of summary.keyPoints.slice(0, 8)) {
      addText(`• ${point}`, { font: "Helvetica", fontSize: 10, fillColor: sectionColor, lineGap: 4 });
      cursorY += 4;
    }

    if (summary.indicators.length > 6) {
      addSectionHeader("Additional indicators");
      for (const indicator of summary.indicators.slice(6)) {
        document.font("Helvetica").fontSize(10);
        const value = `${indicator.label}: ${indicator.value}`;
        const height = document.heightOfString(value, { width: contentWidth - 62, lineGap: 3 });
        ensureSpace(height + 6);
        document.fillColor(statusColor).fontSize(8).text(indicator.severity.toUpperCase(), margin, cursorY, { width: 50 });
        document.fillColor(sectionColor).fontSize(10).text(value, margin + 62, cursorY, { width: contentWidth - 62, lineGap: 3 });
        cursorY += height + 6;
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
