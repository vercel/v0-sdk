'use server'

import { z } from 'zod'
import { signIn, signOut } from './auth'
import { createUser, getUser } from '@/lib/db/queries'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { AuthError } from 'next-auth'

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email.'),
  password: z.string().min(1, 'Password is required.'),
})

const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
})

interface ActionResult {
  type: 'error' | 'success'
  message: string
}

export async function signInAction(
  _prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const validatedData = signInSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    })

    await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    })

    revalidatePath('/')
    redirect('/?refresh=session')
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        type: 'error',
        message: error.issues[0].message,
      }
    }

    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return {
            type: 'error',
            message: 'Invalid credentials. Please try again.',
          }
        default:
          return {
            type: 'error',
            message: 'Something went wrong. Please try again.',
          }
      }
    }

    // If it's a redirect, re-throw it
    throw error
  }
}

export async function signUpAction(
  _prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const validatedData = signUpSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    })

    const existingUsers = await getUser(validatedData.email)

    if (existingUsers.length > 0) {
      return {
        type: 'error',
        message: 'User already exists. Please sign in instead.',
      }
    }

    await createUser(validatedData.email, validatedData.password)

    const result = await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    })

    if (result?.error) {
      return {
        type: 'error',
        message:
          'Failed to sign in after registration. Please try signing in manually.',
      }
    }

    revalidatePath('/')
    redirect('/?refresh=session')
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        type: 'error',
        message: error.issues[0].message,
      }
    }

    if (error instanceof AuthError) {
      return {
        type: 'error',
        message: 'Something went wrong. Please try again.',
      }
    }

    // If it's a redirect, re-throw it
    throw error
  }
}
