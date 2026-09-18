import {z} from 'zod'


export const  createUserWithEmailAndPasswordInput = z.object({
    fullName: z.string().describe('The full name of the user'),
    email: z.email().describe('The email address of the user'),
    password: z.string().min(6).max(100).describe('The password of the user'),
    
})

export type CreateUserWithEmailAndPasswordInputType = z.infer<typeof createUserWithEmailAndPasswordInput>

export const loginWithEmailAndPasswordInput = z.object({
  email: z.string().email().describe("The email address of the user"),
  password: z.string().describe("The password for the account"),
});

export type LoginWithEmailAndPasswordInputType = z.infer<
  typeof loginWithEmailAndPasswordInput
>;

export const requestPasswordResetInput = z.object({
  email: z.string().email().describe("The email address of the user"),
});

export type RequestPasswordResetInputType = z.infer<
  typeof requestPasswordResetInput
>;

export const resetPasswordInput = z.object({
  token: z.string().describe("The password reset token"),
  newPassword: z.string().min(6).max(100).describe("The new password for the account"),
});

export type ResetPasswordInputType = z.infer<
  typeof resetPasswordInput
>;