'use server'

import { redirect } from 'next/navigation'
import { signIn } from '@/auth'
import { db } from '@/db'
import { profiles } from '@/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export async function login(formData: FormData) {
  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string

  if (!email || !password) {
    redirect('/login?message=' + encodeURIComponent('Please enter email and password.'))
  }

  try {
    await signIn('credentials', {
      email,
      password,
      redirect: false
    })
  } catch (error: any) {
    if (error?.type === 'CredentialsSignin' || error?.message?.includes('CredentialsSignin')) {
      redirect('/login?message=' + encodeURIComponent('Invalid email or password.'))
    }
    throw error
  }

  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirm_password') as string
  const name = (formData.get('name') as string) || 'Farm Owner'

  if (password && confirmPassword && password !== confirmPassword) {
    redirect('/login?message=' + encodeURIComponent('Passwords do not match.'))
  }

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

  try {
    await signIn('credentials', {
      email,
      password,
      redirect: false
    })
  } catch (error) {
    redirect('/login?message=' + encodeURIComponent('Account created. Please log in.'))
  }

  redirect('/dashboard')
}

export async function forgotPassword(formData: FormData) {
  return { error: 'Password reset links require an SMTP configuration on your home server.' }
}

export async function resetPassword(formData: FormData) {
  return { error: 'Password reset disabled for self-hosted mode.' }
}
