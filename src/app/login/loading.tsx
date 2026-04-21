import { Loader2 } from 'lucide-react'

export default function LoginLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-(--color-background) animate-in fade-in duration-500">
      <Loader2 className="w-12 h-12 animate-spin text-primary mb-6" />
      <h2 className="text-2xl font-bold font-display text-primary">Khamar Khata</h2>
      <p className="text-(--color-on-surface-variant) font-medium mt-2">Preparing secure login...</p>
    </div>
  )
}
