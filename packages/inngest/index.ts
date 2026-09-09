import { Inngest } from "inngest";

import { analyzeLayer1, type Layer1Input } from "./Layers/layer1";
import { analyzeLayer2 } from "./Layers/layer2";
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

    const layer2Result = await step.run(
      "inspect-domain-infrastructure",
      () => analyzeLayer2(input),
    );

    await step.run("persist-layer2-result", async () => {
      await connectMongo();
      await EmailAnalysis.findOneAndUpdate(
        { gmailMessageId: input.gmailMessageId },
        { $set: { layer2: layer2Result } },
        { upsert: true, new: true },
      );
    });

    return layer1Result;
  },
);

export const functions = [helloWorld, analyzeLayer1ThenLayer2];
