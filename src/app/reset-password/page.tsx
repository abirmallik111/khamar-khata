'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Lock, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { resetPassword } from '../login/actions'
import { SubmitButton } from '@/components/SubmitButton'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleAction = async (formData: FormData) => {
    setError(null)
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirm_password') as string

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      const result = await resetPassword(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-(--color-surface-low)">
      <div className="w-full max-w-lg">
        <div className="flex flex-col items-center justify-center gap-4 mb-10">
          <div className="relative w-24 h-24 overflow-hidden rounded-full border-4 border-primary/20 shadow-xl bg-white">
            <Image 
              src="/logo.png" 
              alt="Khamar Khata Logo" 
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-col items-center text-center">
            <h1 className="text-3xl font-black tracking-tight font-display text-primary">Reset Password</h1>
            <p className="text-(--color-on-surface-variant) text-sm font-medium mt-1">Please enter your new password below.</p>
          </div>
        </div>

        <div className="bg-(--color-surface-lowest) rounded-3xl shadow-ambient overflow-hidden border border-(--color-surface-high)/50">
          {success ? (
            <div className="p-10 text-center flex flex-col items-center gap-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Password Reset!</h2>
                <p className="text-(--color-on-surface-variant)">Your password has been successfully updated. You can now access your dashboard.</p>
              </div>
              <Link 
                href="/dashboard" 
                className="w-full bg-gradient-primary rounded-2xl py-4 text-white font-black text-lg shadow-lg hover:shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <form action={handleAction} className="p-8 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-(--color-on-surface-variant) flex items-center gap-2" htmlFor="password">
                  <Lock className="w-4 h-4 text-primary" />
                  New Password
                </label>
                <input
                  className="rounded-xl px-4 py-4 bg-(--color-surface-high)/50 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all shadow-inner"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-(--color-on-surface-variant) flex items-center gap-2" htmlFor="confirm_password">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  Confirm New Password
                </label>
                <input
                  className="rounded-xl px-4 py-4 bg-(--color-surface-high)/50 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all shadow-inner"
                  type="password"
                  name="confirm_password"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <div className="p-4 bg-error/10 text-error text-center rounded-xl font-medium border border-error/20">
                  {error}
                </div>
              )}

              <SubmitButton
                loadingText="UPDATING..."
                className="mt-2 bg-gradient-primary rounded-2xl py-4 text-white font-black text-lg shadow-lg hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                UPDATE PASSWORD
              </SubmitButton>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
