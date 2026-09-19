import { Inngest } from "inngest";

import { analyzeLayer1, type Layer1Input } from "./Layers/layer1";
import { analyzeLayer2 } from "./Layers/layer2";
import { analyzeLayer3 } from "./Layers/layer3";
import { analyzeLayer4, type Layer4AttachmentInput } from "./Layers/layer4";
import { analyzeLayer5, getCampaignCluster } from "./Layers/layer5";
import { connectMongo, EmailAnalysis } from "@repo/mongodb";

export const inngest = new Inngest({ id: "trpc-monorepo" });

type MailReceivedEventData = Omit<Layer1Input, "message"> & {
  /** RFC822/EML content is transported as a JSON-safe string in the event. */
  message: string;
  gmailMessageId: string;
  userId: string;
  accountId: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  bodyText?: string;
  bodyHtml?: string;
  attachments?: Layer4AttachmentInput[];
  /** Raw `Received:` headers forwarded from the Gmail message for Layer 2 IP extraction. */
  receivedHeaders?: string[];
};

const helloWorld = inngest.createFunction(
  { id: "hello-world", triggers: [{ event: "test/hello.world" }] },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");

    return { message: `Hello ${event.data.email}!` };
  },
);

const analyzeLayer1ThenLayer2 = inngest.createFunction(
  {
    id: "layer-1-authentication-header-forensics",
    triggers: [{ event: "mail.received" }],
  },
  async ({ event, step }) => {
    const input = event.data as MailReceivedEventData;

    // Step 1: Run the analysis
    const layer1Result = await step.run(
      "authenticate-and-inspect-headers",
      () => analyzeLayer1(input),
    );

    // Step 2: Persist to MongoDB (separately retryable)
    await step.run("persist-layer1-result", async () => {
      await connectMongo();
      await EmailAnalysis.findOneAndUpdate(
        { gmailMessageId: input.gmailMessageId },
        {
          $set: {
            userId: input.userId,
            accountId: input.accountId,
            from: input.from,
            to: input.to,
            subject: input.subject,
            date: input.date,
            layer1: {
              ...layer1Result,
              analyzedAt: new Date(),
            },
          },
        },
        { upsert: true, new: true },
      );
    });

    const layer2Result = await step.run("inspect-domain-infrastructure", () =>
      analyzeLayer2({
        from: input.from,
        receivedHeaders: input.receivedHeaders ?? (layer1Result.mailauth.receivedChain ?? []).map((hop) =>
          [hop.from?.comment, hop.from?.value, hop.by?.comment, hop.by?.value].filter(Boolean).join(" "),
        ),
        anonymization: {
          tor: layer1Result.signals.some((signal) => signal.code === "tor_exit_node_detected"),
          vpnOrProxy: layer1Result.signals.some((signal) => signal.code === "vpn_or_proxy_ip_detected"),
        },
      }),
    );

    const layer3Result = await step.run("nlp-llm-content-analysis", () =>
      analyzeLayer3({
        subject: input.subject,
        bodyText: input.bodyText ?? input.message,
        bodyHtml: input.bodyHtml,
        from: input.from,
        to: input.to,
        priorSignals: [
          ...layer1Result.signals.map((s) => s.explanation),
          ...layer2Result.signals.map((s) => s.explanation),
        ],
      }),
    );

    await step.run("persist-layer3-result", async () => {
      await connectMongo();
      const persistedLayer3 = {
        ...layer3Result,
        analyzedAt: new Date(layer3Result.analyzedAt),
      };
      await EmailAnalysis.findOneAndUpdate(
        { gmailMessageId: input.gmailMessageId },
        { $set: { layer3: persistedLayer3 } },
        { upsert: true, new: true },
      );
    });

    const layer4Result = await step.run("inspect-links-and-attachments", () =>
      analyzeLayer4({
        bodyHtml: input.bodyHtml,
        bodyText: input.bodyText,
        attachments: input.attachments,
      }),
    );

    await step.run("persist-layer4-result", async () => {
      await connectMongo();
      await EmailAnalysis.findOneAndUpdate(
        { gmailMessageId: input.gmailMessageId },
        { $set: { layer4: { ...layer4Result, analyzedAt: new Date() } } },
        { upsert: true, new: true },
      );
    });

    const layer5Result = await step.run("persist-layer5-graph", async () => {
      const result = await analyzeLayer5({
        gmailMessageId: input.gmailMessageId,
        from: input.from,
        to: input.to,
        subject: input.subject,
        date: input.date,
        senderIp: layer2Result.senderIp ?? undefined,
        domain: layer2Result.domain ?? undefined,
      });

      const cluster = await getCampaignCluster(input.gmailMessageId);

      await connectMongo();
      await EmailAnalysis.findOneAndUpdate(
        { gmailMessageId: input.gmailMessageId },
        { $set: { layer5: { cluster, recordsCreated: result.recordsCreated, analyzedAt: new Date() } } },
        { upsert: true, new: true },
      );

      return { ...result, cluster };
    });

    return { layer1: layer1Result, layer2: layer2Result, layer3: layer3Result, layer4: layer4Result, layer5: layer5Result };
  },
);

export const functions = [helloWorld, analyzeLayer1ThenLayer2];
