import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthShell } from '@/components/auth/auth-shell'
import { AuthForm } from '@/components/auth/auth-form'

export const metadata: Metadata = {
  title: 'Sign in — MailForensix',
  description: 'Sign in to your MailForensix workspace.',
}

export default function SignInPage() {
  return (
    <AuthShell
      title="Sign in to MailForensix"
      subtitle={
        <>
          Don&apos;t have an account?{' '}
          <Link href="/sign-up" className="text-foreground underline underline-offset-2">
            Get started
          </Link>
        </>
      }
      footerAction="By signing in, you agree to the"
    >
      <AuthForm mode="sign-in" />
    </AuthShell>
  )
}
