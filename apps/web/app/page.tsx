import { Nav } from '@/components/landing/nav'
import { Hero } from '@/components/landing/hero'
import { Pipeline } from '@/components/landing/pipeline'
import { Evidence } from '@/components/landing/evidence'
import { Report, CTA } from '@/components/landing/report'
import { Footer } from '@/components/landing/footer'

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
  )
}
