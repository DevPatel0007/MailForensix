import Link from 'next/link'
import type { ReactNode } from 'react'
import { Logo } from '@/components/landing/nav'

type AuthShellProps = {
  title: string
  subtitle: ReactNode
  children: ReactNode
  footerAction: ReactNode
}

export function AuthShell({ title, subtitle, children, footerAction }: AuthShellProps) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-background px-6 py-16">
      <div className="flex w-full max-w-[388px] flex-col items-center">
        <Link href="/" aria-label="MailForensix home" className="text-mint">
          <Logo className="h-9 w-9" />
        </Link>

        <div className="mt-8 flex flex-col items-center gap-1.5 text-center">
          <h1 className="text-[17px] font-semibold tracking-tight text-foreground">{title}</h1>
          <p className="text-[15px] text-muted-foreground">{subtitle}</p>
        </div>

        <div className="mt-8 w-full">{children}</div>

        <p className="mt-8 max-w-[300px] text-center text-[13px] leading-relaxed text-stone text-pretty">
          {footerAction}{' '}
          <Link href="#" className="underline underline-offset-2 transition-colors hover:text-foreground">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="#" className="underline underline-offset-2 transition-colors hover:text-foreground">
            Privacy Policy
          </Link>
          .
        </p>

        <p className="mt-6 text-[14px] text-stone">
          Need help?{' '}
          <Link href="#" className="text-foreground underline underline-offset-2">
            Contact support
          </Link>
        </p>
      </div>
    </main>
  )
}

export function Divider() {
  return (
    <div className="my-6 flex items-center gap-4" role="separator">
      <span className="h-px flex-1 bg-hairline" />
      <span className="text-[13px] text-stone">or</span>
      <span className="h-px flex-1 bg-hairline" />
    </div>
  )
}

export function ProviderButton({ children, icon }: { children: ReactNode; icon: ReactNode }) {
  return (
    <button
      type="button"
      className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-hairline bg-surface text-[14px] font-medium text-foreground transition-colors duration-200 hover:border-steel hover:bg-secondary cursor-pointer"
    >
      {icon}
      {children}
    </button>
  )
}

export function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  )
}
