'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Mail, ArrowLeft, Loader2 } from 'lucide-react'
import { forgotPassword } from '../login/actions'
import { SubmitButton } from '@/components/SubmitButton'

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleAction = async (formData: FormData) => {
    setError(null)
    try {
      const result = await forgotPassword(formData)
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
              src="/logo-final.png" 
              alt="Khamar Khata Logo" 
              fill
              className="object-cover"
              sizes="96px"
              priority
            />
          </div>
          <div className="flex flex-col items-center text-center">
            <h1 className="text-3xl font-black tracking-tight font-display text-primary">Forgot Password?</h1>
            <p className="text-(--color-on-surface-variant) text-sm font-medium mt-1">No worries, we'll send you reset instructions.</p>
          </div>
        </div>

        <div className="bg-(--color-surface-lowest) rounded-3xl shadow-ambient overflow-hidden border border-(--color-surface-high)/50">
          {success ? (
            <div className="p-10 text-center flex flex-col items-center gap-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Check your email</h2>
                <p className="text-(--color-on-surface-variant)">We've sent a password reset link to your email address.</p>
              </div>
              <Link 
                href="/login" 
                className="w-full bg-gradient-primary rounded-2xl py-4 text-white font-black text-lg shadow-lg hover:shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <form action={handleAction} className="p-8 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-(--color-on-surface-variant) flex items-center gap-2" htmlFor="email">
                  <Mail className="w-4 h-4 text-primary" />
                  Email Address
                </label>
                <input
                  className="rounded-xl px-4 py-4 bg-(--color-surface-high)/50 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all shadow-inner"
                  type="email"
                  name="email"
                  placeholder="farmer@example.com"
                  required
                />
              </div>

              {error && (
                <div className="p-4 bg-error/10 text-error text-center rounded-xl font-medium border border-error/20">
                  {error}
                </div>
              )}

              <SubmitButton
                loadingText="SENDING..."
                className="mt-2 bg-gradient-primary rounded-2xl py-4 text-white font-black text-lg shadow-lg hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                SEND RESET LINK
              </SubmitButton>

              <Link 
                href="/login" 
                className="flex items-center justify-center gap-2 text-(--color-on-surface-variant) hover:text-primary transition-colors text-sm font-bold mt-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </form>
          )}
        </div>
        
        <p className="text-center mt-10 text-(--color-on-surface-variant) text-sm font-medium">
          Secure authentication powered by <span className="text-primary font-bold">Supabase</span>
        </p>
      </div>
    </main>
  )
}
