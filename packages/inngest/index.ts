import { Inngest } from "inngest";

import { analyzeLayer1, type Layer1Input } from "./Layers/layer1";

export const inngest = new Inngest({ id: "trpc-monorepo" });

type MailReceivedEventData = Omit<Layer1Input, "message"> & {
  /** RFC822/EML content is transported as a JSON-safe string in the event. */
  message: string;
};

const helloWorld = inngest.createFunction(
  { id: "hello-world", triggers: [{ event: "test/hello.world" }] },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");

    return { message: `Hello ${event.data.email}!` };
  },
);

const authenticateReceivedEmail = inngest.createFunction(
  {
    id: "layer-1-authentication-header-forensics",
    triggers: [{ event: "mail.received" }],
  },
  async ({ event, step }) => {
    const input = event.data as MailReceivedEventData;

    return step.run("authenticate-and-inspect-headers", () => analyzeLayer1(input));
  },
);

export const functions = [helloWorld, authenticateReceivedEmail];
