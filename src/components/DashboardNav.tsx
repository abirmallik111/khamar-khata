'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, PlusCircle, TrendingUp, BarChart3, Settings } from 'lucide-react'
import { GoatIcon, CowIcon } from '@/components/icons/AnimalIcons'

export const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/goats', label: 'Goats', icon: GoatIcon },
  { href: '/dashboard/cows', label: 'Cows', icon: CowIcon },
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
