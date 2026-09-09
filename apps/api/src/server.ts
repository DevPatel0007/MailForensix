import express from "express";
import { logger } from "@repo/logger";
import cors from "cors";

import * as trpcExpress from "@trpc/server/adapters/express";
import { generateOpenApiDocument, createOpenApiExpressMiddleware } from "trpc-to-openapi";
import { apiReference } from "@scalar/express-api-reference";

import { functions, inngest } from "@repo/inngest";
import { serverRouter, createContext } from "@repo/trpc/server";
import { serve } from "inngest/express";

import { env } from "./env";

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
