import { cn } from '@/lib/utils'
import { Container, Eyebrow } from './primitives'
import { Reveal } from './reveal'

const STEPS = [
  {
    id: 'ingest',
    title: 'Suspicious email',
    body: 'Drop in a .eml, paste raw headers, or connect a mailbox. Nothing is altered — the original is preserved as evidence.',
    data: ['MESSAGE-ID', 'RAW HEADERS', 'BODY / HTML', 'ATTACHMENTS'],
  },
  {
    id: 'headers',
    title: 'Header analysis',
    body: 'Every Received hop is parsed and ordered. SPF, DKIM and DMARC are evaluated against the claimed sender.',
    data: ['SPF FAIL', 'DKIM NONE', 'DMARC REJECT', '6 HOPS'],
  },
  {
    id: 'domain',
    title: 'Domain analysis',
    body: 'Registration age, registrar, nameservers and lookalike scoring against the brands the email impersonates.',
    data: ['secure-payments.co', 'AGE 3D', 'LOOKALIKE 0.91'],
  },
  {
    id: 'ip',
    title: 'IP trace',
    body: 'The originating IP is resolved to its ASN, hosting provider and reputation history across prior campaigns.',
    data: ['185.142.xxx.xxx', 'AS9009', 'ABUSE 87'],
  },
  {
    id: 'geo',
    title: 'Geolocation',
    body: 'Infrastructure is mapped and compared against the sender’s claimed location and your organisation’s footprint.',
    data: ['47.01°N 28.86°E', 'CHIȘINĂU, MD', 'MISMATCH'],
  },
  {
    id: 'correlate',
    title: 'Threat correlation',
    body: 'Indicators are matched against threat intelligence feeds and previous investigations in your workspace.',
    data: ['THR-2291', '4 IOC MATCHES', 'CAMPAIGN LINKED'],
  },
  {
    id: 'verdict',
    title: 'Forensic verdict',
    body: 'A confidence-scored verdict with a full evidence chain — every conclusion links back to the data that produced it.',
    data: ['HIGH', 'CONFIDENCE 96.4%', 'CREDENTIAL PHISHING'],
    final: true,
  },
]

export function Pipeline() {
  return (
    <section id="pipeline" className="border-t border-hairline">
      <Container className="py-24 lg:py-32">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <Eyebrow>The investigation</Eyebrow>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="text-display-lg mt-5 text-balance">From message to forensic intelligence.</h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-5 max-w-md text-base leading-relaxed text-pretty text-muted-foreground">
                Detection is the first step, not the last. MailForensix runs each message through a fixed chain of
                analysis so the verdict is explainable, repeatable and defensible.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <p className="mt-8 font-mono text-[12px] leading-loose text-steel">
                EMAIL → ANALYZE → TRACE → CORRELATE → UNDERSTAND
              </p>
            </Reveal>
          </div>

          <ol className="relative flex flex-col">
            <div className="mf-flow-line absolute top-4 bottom-4 left-[11px] w-px" aria-hidden />
            {STEPS.map((step, i) => (
              <Reveal as="li" key={step.id} delay={i * 60} className="relative flex gap-6 pb-10 last:pb-0">
                <span
                  className={cn(
                    'relative z-10 mt-1 flex size-[23px] shrink-0 items-center justify-center rounded-full border bg-background',
                    step.final ? 'border-mint' : 'border-hairline',
                  )}
                  aria-hidden
                >
                  <span className={cn('size-1.5 rounded-full', step.final ? 'bg-mint' : 'bg-steel')} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="text-lg font-semibold tracking-tight">{step.title}</h3>
                    <span className="font-mono text-[11px] text-steel">
                      {String(i + 1).padStart(2, '0')} / {String(STEPS.length).padStart(2, '0')}
                    </span>
                  </div>
                  <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {step.data.map((d) => (
                      <span
                        key={d}
                        className={cn(
                          'rounded-xs border px-1.5 py-0.5 font-mono text-[11px]',
                          step.final ? 'border-mint/30 text-mint' : 'border-hairline text-muted-foreground',
                        )}
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  )
}
