import { auth, signOut as authSignOut } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { LogOut } from 'lucide-react'
import { SidebarLinks } from '@/components/DashboardNav'
import { MobileNav } from '@/components/MobileNav'
import { QuickActionsFAB } from '@/components/QuickActionsFAB'
import logoImg from '../../../public/logo-final.png'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const handleSignOut = async () => {
    'use server'
    await authSignOut({ redirectTo: '/login' })
  }

  return (
    <div className="flex h-screen bg-(--color-background) overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-(--color-surface-lowest) border-r border-(--color-surface-high) p-4">
        <Link href="/dashboard" className="flex items-center gap-3 mb-8 px-2 hover:opacity-80 transition-opacity">
          <div className="relative w-12 h-12 overflow-hidden rounded-full border-2 border-(--color-primary)/20 shadow-sm">
            <Image 
              src={logoImg} 
              alt="Khamar Khata Logo" 
              fill
              className="object-cover"
              sizes="48px"
              priority
            />
          </div>
          <div className="flex flex-col">
            <h2 className="font-bold text-lg leading-tight tracking-tight text-(--color-primary) font-display">Khamar</h2>
            <h2 className="font-bold text-lg leading-tight tracking-tight text-amber-900 font-display">Khata</h2>
          </div>
        </Link>

        <SidebarLinks />

        <form action={handleSignOut} className="mt-auto">
          <button className="flex items-center gap-3 px-3 py-3 w-full rounded-md hover:bg-error/10 text-error transition-colors font-medium">
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </form>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto relative pb-8 md:pb-0">
        {/* Mobile Header & Slide-out Hamburger Side Menu */}
        <MobileNav 
          user={{
            name: session.user.name,
            email: session.user.email,
          }}
          signOutAction={handleSignOut}
        />

        <div className="flex-1 p-3.5 sm:p-6 md:p-8 max-w-5xl mx-auto w-full">
          {children}
        </div>

        {/* Global Quick Actions FAB */}
        <QuickActionsFAB />
      </main>
    </div>
  )
}
