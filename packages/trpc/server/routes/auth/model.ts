import {z} from 'zod'

export const createUserWithEmailAndPasswordInputModel = z.object({
    fullName: z.string().describe('The full name of the user'),
    email: z.email().describe('The email address of the user'),
    password: z.string().min(6).max(100).describe('The password of the user'),
});

export const createUserWithEmailAndPasswordOutputModel = z.object({
    id: z.string().describe('The unique identifier of the user'),
});

export const loginWithEmailAndPasswordInputModel = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const loginWithEmailAndPasswordOutputModel = z.object({
  id: z.string(),
});

export const requestPasswordResetInputModel = z.object({
  email: z.string().email(),
});

export const requestPasswordResetOutputModel = z.object({
  success: z.boolean(),
});

export const resetPasswordInputModel = z.object({
  token: z.string(),
  newPassword: z.string().min(6).max(100),
});

export const resetPasswordOutputModel = z.object({
  success: z.boolean(),
});
