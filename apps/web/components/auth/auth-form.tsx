'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Eye, EyeOff, Mail } from 'lucide-react'
import { Divider, GoogleIcon, ProviderButton } from './auth-shell'

type AuthFormProps = {
  mode: 'sign-in' | 'sign-up'
}

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const isSignUp = mode === 'sign-up'
  const canSubmit = email.trim().length > 0 && password.length > 0 && (!isSignUp || name.trim().length > 0)

  return (
    <div>
      <div className="flex flex-col gap-2">
        <a href="/api-auth/google" className="w-full">
          <ProviderButton icon={<GoogleIcon />}>Continue with Google</ProviderButton>
        </a>
        <ProviderButton icon={<Mail className="size-4 text-stone" aria-hidden />}>Continue with email</ProviderButton>
      </div>

      <Divider />

      <form
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault()
          window.location.href = '/workspace'
        }}
      >
        {isSignUp ? (
          <Field label="Enter your name" htmlFor="name">
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </Field>
        ) : null}

        <Field label="Enter your email" htmlFor="email">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="name@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field
          label={isSignUp ? 'Create a password' : 'Enter your password'}
          htmlFor="password"
          trailing={
            isSignUp ? null : (
              <Link href="#" className="text-[13px] text-stone transition-colors hover:text-foreground">
                Forgot password?
              </Link>
            )
          }
        >
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              placeholder={isSignUp ? 'At least 8 characters' : '••••••••••••'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputClass} pr-10 tracking-wider placeholder:tracking-wider`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-stone transition-colors hover:text-foreground cursor-pointer"
            >
              {showPassword ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
            </button>
          </div>
        </Field>

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-1 h-10 w-full rounded-md bg-primary text-[14px] font-medium text-primary-foreground transition-colors duration-200 hover:bg-mint-soft disabled:cursor-not-allowed disabled:bg-steel disabled:text-background cursor-pointer"
        >
          Continue
        </button>
      </form>
    </div>
  )
}

const inputClass =
  'h-10 w-full rounded-md border border-hairline bg-surface px-3 text-[14px] text-foreground outline-none transition-colors placeholder:text-steel focus:border-mint focus:ring-2 focus:ring-mint/20'

function Field({
  label,
  htmlFor,
  trailing,
  children,
}: {
  label: string
  htmlFor: string
  trailing?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label htmlFor={htmlFor} className="text-[13px] font-semibold text-foreground">
          {label}
        </label>
        {trailing}
      </div>
      {children}
    </div>
  )
}
