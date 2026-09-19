'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Container } from './primitives'
import { HeroApp } from './hero-app'
import { Reveal } from './reveal'
import { Aurora } from './aurora'

export function Hero() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative overflow-hidden lg:h-[900px]">
      {/* Aurora shader — glows from the top edge, fades into the page background */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[560px] opacity-70 dark:opacity-100 transition-opacity duration-300 lg:h-[720px]" aria-hidden>
        <Aurora
          className="h-full w-full"
          colorStops={['#00b48a', '#00d4a4', '#7cebcb']}
          amplitude={1.2}
          blend={0.7}
          speed={0.6}
          lightMode={mounted && resolvedTheme === 'light'}
        />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-background to-transparent" />
      </div>

      <Container className="relative flex flex-col pt-28 pb-12 lg:h-full lg:pb-0">
        {/* Copy */}
        <div className="max-w-xl">
          
          <Reveal delay={80}>
            <h1 className="mt-7 text-[clamp(2.75rem,5.2vw,4.25rem)] leading-[1.02] font-semibold tracking-[-0.035em] text-balance">
              The forensic layer every inbox needs
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-pretty text-muted-foreground">
              AI-driven email investigation for <span className="font-semibold text-foreground">SOC teams</span>,{' '}
              <span className="font-semibold text-foreground">enterprises</span>, and{' '}
              <span className="font-semibold text-foreground">investigators</span>.
            </p>
          </Reveal>
          <Reveal delay={240} className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#cta"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-xs transition-opacity duration-200 hover:opacity-90"
            >
              Analyze an email
              <ChevronIcon />
            </a>
            <a
              href="#docs"
              className="inline-flex items-center gap-2.5 rounded-lg border border-hairline bg-surface/80 px-5 py-3 text-sm font-medium text-foreground backdrop-blur-sm transition-colors duration-200 hover:border-steel hover:bg-surface"
            >
              <GoogleIcon />
              Sign up with Google
            </a>
          </Reveal>
        </div>

        {/* App mockup — anchored bottom-right, bleeding off canvas on desktop */}
        <Reveal
          delay={360}
          className="mt-14 lg:absolute lg:top-[330px] lg:left-[43%] lg:mt-0 lg:w-[1040px]"
        >
          <HeroApp className="lg:min-h-[640px]" />
        </Reveal>
      </Container>

      {/* Bottom fade so the bleed feels intentional */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-24 bg-gradient-to-t from-background to-transparent lg:block"
        aria-hidden
      />
    </section>
  )
}

function ChevronIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C41.4 35.4 44 30.1 44 24c0-1.3-.1-2.4-.4-3.5z"
      />
    </svg>
  )
}
