import {z} from 'zod'


export const  createUserWithEmailAndPasswordInput = z.object({
    fullName: z.string().describe('The full name of the user'),
    email: z.email().describe('The email address of the user'),
    password: z.string().min(6).max(100).describe('The password of the user'),
    
})

export type CreateUserWithEmailAndPasswordInputType = z.infer<typeof createUserWithEmailAndPasswordInput>