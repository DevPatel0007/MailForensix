'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { cn } from '~/lib/utils'
import { trpc } from '~/trpc/client'

const links = [
  { href: '#pipeline', label: 'Product' },
  { href: '#evidence', label: 'Solutions' },
  { href: '#report', label: 'Resources' },
  { href: '#cta', label: 'Pricing' },
]

const EASE = 'transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none'

export function Nav({ onGoogleLogin }: { onGoogleLogin?: () => void }) {
  const [scrolled, setScrolled] = useState(false)
  const googleAuth = trpc.auth.googleAuthorizationUrl.useQuery({}, { enabled: false })

  const handleGoogleClick = async () => {
    if (onGoogleLogin) {
      onGoogleLogin()
    } else {
      const res = await googleAuth.refetch()
      if (res.data?.url) {
        window.location.assign(res.data.url)
      }
    }
  }

  useEffect(() => {
    let frame = 0
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        setScrolled(window.scrollY > 24)
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 will-change-[padding]',
        EASE,
        scrolled ? 'px-0 pt-0' : 'px-4 pt-4 sm:px-6',
      )}
    >
      <div className={cn('mx-auto w-full will-change-[max-width]', EASE, scrolled ? 'max-w-[100vw]' : 'max-w-6xl')}>
        <div
          className={cn(
            'flex h-14 items-center justify-between border border-foreground/10 pr-2 pl-5 backdrop-blur-2xl backdrop-saturate-150 will-change-[border-radius,background-color,box-shadow]',
            EASE,
            scrolled
              ? 'rounded-none border-transparent border-b-white/10 bg-black/70 shadow-[0_1px_0_0_rgba(255,255,255,0.04),0_12px_40px_-16px_rgba(0,0,0,0.7)] sm:pr-6 sm:pl-8'
              : 'rounded-lg bg-black/35 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_8px_32px_-12px_rgba(0,0,0,0.7)]',
          )}
        >
          {/* Brand */}
          <Link href="/" className="flex items-center text-foreground" aria-label="MailForensix home">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20main-nc40an0lSlDbAo9xfuFiWkUcd0qcTy.png"
              alt="MailForensix"
              className="h-10 w-auto max-w-[180px] object-contain sm:max-w-[210px]"
            />
          </Link>

          {/* Links + action */}
          <div className="flex items-center gap-1">
            <nav aria-label="Primary" className="hidden items-center md:flex">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="rounded-lg px-3 py-1.5 text-[15px] font-medium text-foreground/55 transition-colors duration-200 hover:text-foreground"
                >
                  {l.label}
                </a>
              ))}
            </nav>
            <Link
              href="/login"
              className="hidden rounded-lg px-3 py-1.5 text-[15px] font-medium text-foreground/55 transition-colors duration-200 hover:text-foreground sm:inline-flex"
            >
              Sign in
            </Link>
            <button
              type="button"
              onClick={handleGoogleClick}
              disabled={googleAuth.isFetching}
              className="ml-2 inline-flex h-10 items-center gap-2 rounded-lg bg-foreground px-4 text-[14px] font-semibold text-background transition-opacity duration-200 hover:opacity-90 disabled:opacity-50"
            >
              <GoogleIcon />
              {googleAuth.isFetching ? 'Connecting...' : 'Sign in with Google'}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden className={className}>
      <rect x="1.5" y="4.5" width="19" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2.5 6l8.5 6 8.5-6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="16.5" cy="15.5" r="3" fill="#0a0a0a" stroke="#00d4a4" strokeWidth="1.5" />
      <path d="M18.8 17.8l1.7 1.7" stroke="#00d4a4" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 48 48" aria-hidden>
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
