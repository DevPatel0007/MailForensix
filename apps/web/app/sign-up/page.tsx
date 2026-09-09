import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthShell } from '@/components/auth/auth-shell'
import { AuthForm } from '@/components/auth/auth-form'

export const metadata: Metadata = {
  title: 'Create account — MailForensix',
  description: 'Create your MailForensix account and start investigating suspicious emails.',
}

export default function SignUpPage() {
  return (
    <AuthShell
      title="Create your MailForensix account"
      subtitle={
        <>
          Already have an account?{' '}
          <Link href="/sign-in" className="text-foreground underline underline-offset-2">
            Sign in
          </Link>
        </>
      }
      footerAction="By creating an account, you agree to the"
    >
      <AuthForm mode="sign-up" />
    </AuthShell>
  )
}
