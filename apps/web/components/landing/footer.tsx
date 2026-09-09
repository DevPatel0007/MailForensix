import { Logo } from './nav'
import { Container } from './primitives'

const columns = [
  { title: 'Product', links: ['Investigation', 'Header forensics', 'Infrastructure intel', 'Threat correlation', 'Reports'] },
  { title: 'Developers', links: ['Documentation', 'API reference', 'Connectors', 'STIX export', 'Changelog'] },
  { title: 'Company', links: ['About', 'Security', 'Trust center', 'Careers', 'Contact'] },
]

export function Footer() {
  return (
    <footer id="docs" className="border-t border-hairline">
      <Container className="py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <div className="flex items-center gap-2.5">
              <Logo />
              <span className="text-[15px] font-semibold tracking-tight">MailForensix</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              AI-powered email threat detection and forensic intelligence.
            </p>
            <p className="mt-6 font-mono text-[11px] leading-relaxed text-steel">
              SUSPICIOUS EMAIL → ANALYZE → TRACE →<br />
              CORRELATE → UNDERSTAND → INTELLIGENCE
            </p>
          </div>
          {columns.map((c) => (
            <div key={c.title}>
              <p className="text-micro text-steel">{c.title}</p>
              <ul className="mt-4 flex flex-col gap-2.5">
                {c.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-hairline pt-6 text-[13px] text-steel sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 MailForensix. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <a href="#" className="transition-colors duration-200 hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="transition-colors duration-200 hover:text-foreground">
              Terms
            </a>
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px]">
              <span className="size-1.5 rounded-full bg-mint" aria-hidden />
              All systems operational
            </span>
          </div>
        </div>
      </Container>
    </footer>
  )
}
