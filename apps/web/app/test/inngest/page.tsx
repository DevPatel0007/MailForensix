import Link from "next/link";
import { ArrowLeft, FlaskConical } from "lucide-react";
import { InngestTestPanel } from "~/components/inngest-test-panel";

export default function InngestTestPage() {
  return (
    <main className="min-h-svh bg-muted/30 p-6 md:p-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header>
          <Link href="/" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Back to mailbox</Link>
          <div className="flex items-center gap-3"><FlaskConical className="size-6 text-primary" /><h1 className="text-3xl font-semibold tracking-tight">Inngest test bench</h1></div>
          <p className="mt-2 max-w-2xl text-muted-foreground">Trigger the production scan path with a real Gmail message and verify the asynchronous persistence workflow.</p>
        </header>
        <InngestTestPanel />
      </div>
    </main>
  );
}