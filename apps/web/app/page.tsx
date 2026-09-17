import { Evidence } from "~/components/landing/evidence";
import { Footer } from "~/components/landing/footer";
import { Hero } from "~/components/landing/hero";
import { Nav } from "~/components/landing/nav";
import { Pipeline } from "~/components/landing/pipeline";
import { CTA, Report } from "~/components/landing/report";

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Pipeline />
        <Evidence />
        <Report />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
