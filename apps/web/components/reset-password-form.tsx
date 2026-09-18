"use client"

import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { trpc } from "~/trpc/client"
import { useForm } from "react-hook-form"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"

type ResetPasswordFormValues = {
  password: string
  confirmPassword: string
}

function ResetPasswordFormContent({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  
  const { mutateAsync: resetPasswordAsync } = trpc.auth.resetPassword.useMutation()
  const { register, handleSubmit, formState: { errors }, setError } = useForm<ResetPasswordFormValues>()

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!token) {
      setError("root", { message: "Invalid or missing token" })
      return
    }

    if (values.password !== values.confirmPassword) {
      setError("confirmPassword", { message: "Passwords do not match" })
      return
    }

    try {
      await resetPasswordAsync({ token, newPassword: values.password })
      router.push("/login?reset=success")
    } catch (error) {
      console.error(error)
      setError("root", { message: "Failed to reset password. The link might be expired." })
    }
  }

  if (!token) {
    return (
      <div className="flex flex-col gap-6 text-center">
        <h1 className="text-2xl font-bold">Invalid Link</h1>
        <p className="text-sm text-balance text-muted-foreground">
          No reset token provided. Please request a new password reset link.
        </p>
        <a href="/forgot-password">
          <Button className="w-full">Go to Forgot Password</Button>
        </a>
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
          <h1 className="text-2xl font-bold">Reset Password</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your new password below
          </p>
        </div>
        
        {errors.root && (
          <div className="text-sm font-medium text-destructive text-center">
            {errors.root.message}
          </div>
        )}

        <Field>
          <FieldLabel htmlFor="password">New Password</FieldLabel>
          <Input id="password" type="password" required minLength={8} {...register("password")} />
          <FieldDescription>Must be at least 8 characters long.</FieldDescription>
        </Field>
        
        <Field>
          <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
          <Input id="confirm-password" type="password" required minLength={8} {...register("confirmPassword")} />
          {errors.confirmPassword && (
            <div className="text-sm text-destructive">{errors.confirmPassword.message}</div>
          )}
        </Field>
        
        <Field>
          <Button type="submit">Reset Password</Button>
        </Field>
      </FieldGroup>
    </form>
  )
}

export function ResetPasswordForm(props: React.ComponentProps<"form">) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordFormContent {...props} />
    </Suspense>
  )
}
