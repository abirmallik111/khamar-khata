'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { login, signup } from './actions'
import { User, Mail, Lock, ShieldCheck } from 'lucide-react'
import { SubmitButton } from '@/components/SubmitButton'

export function AuthForm({ message }: { message?: string }) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [localError, setLocalError] = useState<string | null>(null)

  const handleAction = async (formData: FormData) => {
    setLocalError(null)

    if (activeTab === 'register') {
      const password = formData.get('password') as string
      const confirmPassword = formData.get('confirm_password') as string

      if (password !== confirmPassword) {
        setLocalError('Passwords do not match')
        return
      }
      await signup(formData)
    } else {
      await login(formData)
    }
  }

  return (
    <div className="w-full">
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
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-black tracking-tight font-display text-primary">Khamar</h1>
          <h1 className="text-4xl font-black tracking-tight font-display text-amber-900 -mt-2">Khata</h1>
        </div>
      </div>

      <div className="bg-(--color-surface-lowest) rounded-3xl shadow-ambient overflow-hidden border border-(--color-surface-high)/50">
        {/* Tabs */}
        <div className="flex border-b border-(--color-surface-high)">
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setLocalError(null); }}
            className={`flex-1 py-5 font-bold transition-all ${
              activeTab === 'login'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-(--color-on-surface-variant) hover:bg-(--color-surface-high)/30'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setLocalError(null); }}
            className={`flex-1 py-5 font-bold transition-all ${
              activeTab === 'register'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-(--color-on-surface-variant) hover:bg-(--color-surface-high)/30'
            }`}
          >
            Register
          </button>
        </div>

        <form action={handleAction} className="p-8 flex flex-col gap-6">
          {activeTab === 'register' && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-(--color-on-surface-variant) flex items-center gap-2" htmlFor="name">
                <User className="w-4 h-4 text-primary" />
                Full Name
              </label>
              <input
                className="rounded-xl px-4 py-4 bg-(--color-surface-high)/50 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all shadow-inner"
                name="name"
                placeholder="Rahim Miah"
                required
              />
            </div>
          )}

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

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-(--color-on-surface-variant) flex items-center gap-2" htmlFor="password">
              <Lock className="w-4 h-4 text-primary" />
              Password
            </label>
            <input
              className="rounded-xl px-4 py-4 bg-(--color-surface-high)/50 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all shadow-inner"
              type="password"
              name="password"
              placeholder="••••••••"
              required
            />
            {activeTab === 'login' && (
              <div className="flex justify-end">
                <Link 
                  href="/forgot-password" 
                  className="text-xs font-bold text-primary hover:underline transition-all relative z-20"
                >
                  Forgot Password?
                </Link>
              </div>
            )}
          </div>

          {activeTab === 'register' && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-(--color-on-surface-variant) flex items-center gap-2" htmlFor="confirm_password">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Confirm Password
              </label>
              <input
                className="rounded-xl px-4 py-4 bg-(--color-surface-high)/50 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all shadow-inner"
                type="password"
                name="confirm_password"
                placeholder="••••••••"
                required
              />
            </div>
          )}

          {(localError || message) && (
            <div className="p-4 bg-error/10 text-error text-center rounded-xl font-medium border border-error/20 animate-shake">
              {localError || message}
            </div>
          )}

          <SubmitButton
            loadingText=""
            className="mt-4 bg-gradient-primary rounded-2xl py-4 text-white font-black text-lg shadow-lg hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {activeTab === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
          </SubmitButton>
        </form>
      </div>
      
      <p className="text-center mt-10 text-(--color-on-surface-variant) text-sm font-medium">
        Secure authentication powered by <span className="text-primary font-bold">Supabase</span>
      </p>
    </div>
  )
}
