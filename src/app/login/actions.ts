'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { signIn } from '@/auth'
import { db } from '@/db'
import { profiles } from '@/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: '/dashboard'
    })
  } catch (error: any) {
    if (error?.type === 'CredentialsSignin' || error?.message?.includes('CredentialsSignin')) {
      redirect('/login?message=' + encodeURIComponent('Invalid email or password'))
    }
    // Next.js redirect throws error intentionally
    throw error
  }
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = (formData.get('name') as string) || 'Farm Owner'

  const [existingUser] = await db.select().from(profiles).where(eq(profiles.email, email)).limit(1)

  if (existingUser) {
    redirect('/login?message=' + encodeURIComponent('An account with this email already exists.'))
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  await db.insert(profiles).values({
    email,
    name,
    currency: 'BDT',
    passwordHash: hashedPassword
  })

  await signIn('credentials', {
    email,
    password,
    redirectTo: '/dashboard'
  })
}

export async function forgotPassword(formData: FormData) {
  return { error: 'Password reset links require an SMTP configuration on your home server.' }
}

export async function resetPassword(formData: FormData) {
  return { error: 'Password reset disabled for self-hosted mode.' }
}
