'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LucideIcon } from 'lucide-react'

interface NavLinkProps {
  href: string
  label: string
  icon: LucideIcon
  variant: 'desktop' | 'mobile'
}

export function NavLink({ href, label, icon: Icon, variant }: NavLinkProps) {
  const pathname = usePathname()
  
  // Dashboard is the root of the dashboard, so we check for exact match
  // For others, we check if it starts with the href to keep it active for subpages
  const isActive = href === '/dashboard' 
    ? pathname === '/dashboard' 
    : pathname.startsWith(href)

  if (variant === 'mobile') {
    return (
      <Link
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
  }

  return (
    <Link
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
}
