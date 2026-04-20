import { AuthForm } from './AuthForm'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-(--color-surface-low)">
      <div className="w-full max-w-lg">
        <AuthForm message={resolvedSearchParams?.message} />
      </div>
    </main>
  )
}
