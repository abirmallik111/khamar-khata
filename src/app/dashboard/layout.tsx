import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Home, List, PlusCircle, LogOut, Settings, TrendingUp, BarChart3 } from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const signOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/dashboard/goats', label: 'Goats', icon: List },
    { href: '/dashboard/expenses', label: 'Expenses', icon: PlusCircle },
    { href: '/dashboard/sales', label: 'Sales', icon: TrendingUp },
    { href: '/dashboard/reports', label: 'Reports', icon: BarChart3 },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="flex h-screen bg-(--color-background) overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-(--color-surface-lowest) border-r border-(--color-surface-high) p-4">
        <Link href="/dashboard" className="flex items-center gap-3 mb-8 px-2 hover:opacity-80 transition-opacity">
          <div className="relative w-12 h-12 overflow-hidden rounded-full border-2 border-(--color-primary)/20 shadow-sm">
            <Image 
              src="/logo.jpg" 
              alt="Khamar Khata Logo" 
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-col">
            <h2 className="font-bold text-lg leading-tight tracking-tight text-(--color-primary) font-display">Khamar</h2>
            <h2 className="font-bold text-lg leading-tight tracking-tight text-amber-900 font-display">Khata</h2>
          </div>
        </Link>

        <nav className="flex-1 flex flex-col gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-3 rounded-md hover:bg-(--color-surface-low) transition-colors text-(--color-on-surface-variant) font-medium"
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <form action={signOut} className="mt-auto">
          <button className="flex items-center gap-3 px-3 py-3 w-full rounded-md hover:bg-[var(--color-error)]/10 text-[var(--color-error)] transition-colors font-medium">
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </form>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto relative pb-20 md:pb-0">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 py-2 bg-(--color-surface-lowest) sticky top-0 z-10 shadow-ambient border-b border-(--color-surface-high)">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="relative w-10 h-10 overflow-hidden rounded-full border border-(--color-primary)/20">
              <Image 
                src="/logo.jpg" 
                alt="Logo" 
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm leading-none text-(--color-primary) font-display">Khamar</span>
              <span className="font-bold text-sm leading-none text-amber-900 font-display">Khata</span>
            </div>
          </Link>
          <form action={signOut}>
            <button className="text-[var(--color-error)] p-2 rounded-full hover:bg-[var(--color-error)]/10 transition-colors" aria-label="Sign out">
              <LogOut className="w-5 h-5" />
            </button>
          </form>
        </header>

        <div className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden glass-panel fixed bottom-0 w-full z-50 border-t border-(--color-surface-high)">
        <div className="flex items-center justify-around px-2 py-2 safe-area-bottom">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-md text-(--color-on-surface-variant) hover:text-(--color-primary) transition-colors min-w-[56px]"
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-semibold">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
