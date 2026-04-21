import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { LogOut } from 'lucide-react'
import { SidebarLinks, BottomNav } from '@/components/DashboardNav'

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


  return (
    <div className="flex h-screen bg-(--color-background) overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-(--color-surface-lowest) border-r border-(--color-surface-high) p-4">
        <Link href="/dashboard" className="flex items-center gap-3 mb-8 px-2 hover:opacity-80 transition-opacity">
          <div className="relative w-12 h-12 overflow-hidden rounded-full border-2 border-(--color-primary)/20 shadow-sm">
            <Image 
              src="/logo.png" 
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

        <SidebarLinks />

        <form action={signOut} className="mt-auto">
          <button className="flex items-center gap-3 px-3 py-3 w-full rounded-md hover:bg-error/10 text-error transition-colors font-medium">
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
                src="/logo.png" 
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
            <button className="text-error p-2 rounded-full hover:bg-error/10 transition-colors" aria-label="Sign out">
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
        <BottomNav />
      </nav>
    </div>
  )
}
