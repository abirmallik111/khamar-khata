'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, List, PlusCircle, TrendingUp, BarChart3, Settings } from 'lucide-react'

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/goats', label: 'Goats', icon: List },
  { href: '/dashboard/expenses', label: 'Expenses', icon: PlusCircle },
  { href: '/dashboard/sales', label: 'Sales', icon: TrendingUp },
  { href: '/dashboard/reports', label: 'Reports', icon: BarChart3 },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export function SidebarLinks() {
  const pathname = usePathname()

  return (
    <nav className="flex-1 flex flex-col gap-1">
      {navLinks.map(({ href, label, icon: Icon }) => {
        const isActive = href === '/dashboard' 
          ? pathname === '/dashboard' 
          : pathname.startsWith(href)

        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-3 rounded-md transition-colors font-medium ${
              isActive 
                ? 'bg-(--color-surface-low) text-(--color-primary) shadow-sm' 
                : 'text-(--color-on-surface-variant) hover:bg-(--color-surface-low)'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-(--color-primary)' : ''}`} />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export function BottomNav() {
  const pathname = usePathname()

  return (
    <div className="flex items-center justify-around px-2 py-2 safe-area-bottom">
      {navLinks.map(({ href, label, icon: Icon }) => {
        const isActive = href === '/dashboard' 
          ? pathname === '/dashboard' 
          : pathname.startsWith(href)

        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-md transition-colors min-w-[56px] ${
              isActive 
                ? 'text-(--color-primary) bg-(--color-surface-low)' 
                : 'text-(--color-on-surface-variant) hover:text-(--color-primary)'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-semibold">{label}</span>
          </Link>
        )
      })}
    </div>
  )
}
