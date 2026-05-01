'use client'

import { useState } from 'react'
import { Lock, ShieldCheck, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react'
import { changePassword } from './actions'
import { SubmitButton } from '@/components/SubmitButton'

export function ChangePasswordSection() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleAction = async (formData: FormData) => {
    setError(null)
    setSuccess(false)
    
    const newPassword = formData.get('new_password') as string
    const confirmPassword = formData.get('confirm_password') as string

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    try {
      const result = await changePassword(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        // Reset form
        const form = document.getElementById('change-password-form') as HTMLFormElement
        form?.reset()
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {success && (
        <div className="p-4 bg-primary/10 text-primary rounded-xl flex items-center gap-3 border border-primary/20">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">Your password has been updated successfully!</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-error/10 text-error rounded-xl flex items-center gap-3 border border-error/20">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <form id="change-password-form" action={handleAction} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="text-sm font-bold text-(--color-on-surface-variant) flex items-center gap-2" htmlFor="current_password">
            <KeyRound className="w-4 h-4 text-primary" />
            Current Password
          </label>
          <input
            className="rounded-xl px-4 py-3 bg-(--color-surface-high)/30 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all"
            type="password"
            name="current_password"
            id="current_password"
            placeholder="••••••••"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-(--color-on-surface-variant) flex items-center gap-2" htmlFor="new_password">
            <Lock className="w-4 h-4 text-primary" />
            New Password
          </label>
          <input
            className="rounded-xl px-4 py-3 bg-(--color-surface-high)/30 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all"
            type="password"
            name="new_password"
            id="new_password"
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
            className="rounded-xl px-4 py-3 bg-(--color-surface-high)/30 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all"
            type="password"
            name="confirm_password"
            id="confirm_password"
            placeholder="••••••••"
            required
          />
        </div>

        <div className="md:col-span-2 flex justify-end mt-2">
          <SubmitButton
            loadingText="UPDATING..."
            className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-primary/20 flex items-center gap-2"
          >
            Save Password
          </SubmitButton>
        </div>
      </form>
    </div>
  )
}
