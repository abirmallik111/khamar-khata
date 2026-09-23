import { AuthForm } from './AuthForm'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string; code?: string }>
}) {
  const session = await auth()
  if (session?.user) {
    redirect('/dashboard')
  }

  const resolvedSearchParams = await searchParams;

  // If we land here with a reset code, redirect to the actual reset page
  if (resolvedSearchParams.code) {
    redirect('/reset-password?code=' + resolvedSearchParams.code)
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-(--color-surface-low)">
      <div className="w-full max-w-lg">
        <AuthForm message={resolvedSearchParams?.message} />
      </div>
    </main>
  )
}
