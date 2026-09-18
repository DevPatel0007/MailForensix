"use client"

import { useState } from "react"
import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { trpc } from "~/trpc/client"
import { useForm } from "react-hook-form"

type ForgotPasswordFormValues = {
  email: string
}

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [success, setSuccess] = useState(false)
  const { mutateAsync: requestPasswordResetAsync } = trpc.auth.requestPasswordReset.useMutation()
  const { register, handleSubmit } = useForm<ForgotPasswordFormValues>()

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      await requestPasswordResetAsync({ email: values.email })
      setSuccess(true)
    } catch (error) {
      console.error(error)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col gap-6 text-center">
        <h1 className="text-2xl font-bold">Check your email</h1>
        <p className="text-sm text-balance text-muted-foreground">
          We have sent a password reset link to your email. Check your console for the link during development.
        </p>
      </div>
    )
  }

  return (
    <form 
      className={cn("flex flex-col gap-6", className)} 
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Forgot Password</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your email to receive a password reset link
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" placeholder="m@example.com" required {...register("email")} />
        </Field>
        <Field>
          <Button type="submit">Send Reset Link</Button>
        </Field>
        <div className="text-center text-sm">
          <a href="/login" className="underline underline-offset-4">
            Back to login
          </a>
        </div>
      </FieldGroup>
    </form>
  )
}
