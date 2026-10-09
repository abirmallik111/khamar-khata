'use client'

import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Menu,
  X,
  Home,
  PlusCircle,
  TrendingUp,
  BarChart3,
  Settings,
  LogOut,
  User,
  ShoppingBag,
  DollarSign
} from 'lucide-react'
import { GoatIcon, CowIcon } from '@/components/icons/AnimalIcons'
import logoImg from '../../public/logo-final.png'

interface MobileNavProps {
  user?: {
    name?: string | null
    email?: string | null
  }
  signOutAction: () => Promise<void>
}

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/goats', label: 'Goats', icon: GoatIcon },
  { href: '/dashboard/cows', label: 'Cows', icon: CowIcon },
  { href: '/dashboard/expenses', label: 'Expenses', icon: PlusCircle },
  { href: '/dashboard/sales', label: 'Sales', icon: TrendingUp },
  { href: '/dashboard/reports', label: 'Reports', icon: BarChart3 },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export function MobileNav({ user, signOutAction }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Auto-close drawer on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      {/* Mobile Top App Bar (Sticky) */}
      <header className="md:hidden sticky top-0 z-30 bg-(--color-surface-lowest)/95 backdrop-blur-md border-b border-(--color-surface-high) shadow-xs px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Hamburger Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="p-2 -ml-1.5 rounded-xl text-(--color-on-background) hover:bg-(--color-surface-low) active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
            aria-label="Open navigation menu"
            aria-expanded={isOpen}
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo & Brand */}
          <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <div className="relative w-8 h-8 overflow-hidden rounded-full border border-(--color-primary)/20 shadow-xs flex-shrink-0">
              <Image
                src={logoImg}
                alt="Khamar Khata"
                fill
                className="object-cover"
                sizes="32px"
                priority
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-base leading-none text-(--color-primary) font-display">Khamar</span>
              <span className="font-bold text-base leading-none text-amber-900 font-display">Khata</span>
            </div>
          </Link>
        </div>

        {/* Right Header Action / Quick Settings or SignOut */}
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/settings"
            className="p-2 rounded-xl text-(--color-on-surface-variant) hover:bg-(--color-surface-low) transition-colors"
            title="Settings"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </Link>

          <form action={signOutAction}>
            <button
              type="submit"
              className="p-2 text-error/80 hover:text-error hover:bg-error/10 rounded-xl transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </form>
        </div>
      </header>

      {/* Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 transition-opacity duration-300 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slide-out Hamburger Side Menu Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-72 max-w-[85vw] bg-(--color-surface-lowest) z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-out md:hidden border-r border-(--color-surface-high) ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Side menu"
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-(--color-surface-high) flex items-center justify-between bg-(--color-surface-low)/40">
          <Link
            href="/dashboard"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 hover:opacity-90 transition-opacity"
          >
            <div className="relative w-10 h-10 overflow-hidden rounded-full border-2 border-(--color-primary)/20 shadow-xs flex-shrink-0">
              <Image
                src={logoImg}
                alt="Khamar Khata"
                fill
                className="object-cover"
                sizes="40px"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="font-bold text-lg leading-tight text-(--color-primary) font-display">Khamar</span>
                <span className="font-bold text-lg leading-tight text-amber-900 font-display">Khata</span>
              </div>
              <span className="text-[11px] text-(--color-on-surface-variant) font-medium">Farm Management</span>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-full hover:bg-(--color-surface-high) text-(--color-on-surface-variant) active:scale-95 transition-all"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Actions Shortcuts inside Drawer */}
        <div className="p-3 border-b border-(--color-surface-high) bg-(--color-surface-low)/20">
          <p className="text-[11px] font-semibold text-(--color-on-surface-variant) uppercase tracking-wider px-1 mb-2">
            Quick Actions
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/dashboard/goats/add"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60 hover:bg-emerald-100 transition-colors text-xs font-semibold"
            >
              <GoatIcon size={16} />
              <span>+ Add Goat</span>
            </Link>
            <Link
              href="/dashboard/cows/add"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/60 hover:bg-amber-100 transition-colors text-xs font-semibold"
            >
              <CowIcon size={16} />
              <span>+ Add Cow</span>
            </Link>
            <Link
              href="/dashboard/expenses/add"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 p-2 rounded-lg bg-rose-50 text-rose-800 border border-rose-200/60 hover:bg-rose-100 transition-colors text-xs font-semibold"
            >
              <DollarSign className="w-4 h-4" />
              <span>+ Expense</span>
            </Link>
            <Link
              href="/dashboard/sales/add"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 text-blue-800 border border-blue-200/60 hover:bg-blue-100 transition-colors text-xs font-semibold"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>+ Sale</span>
            </Link>
          </div>
        </div>

        {/* Main Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5 hide-scrollbar">
          <p className="text-[11px] font-semibold text-(--color-on-surface-variant) uppercase tracking-wider px-2 py-1">
            Menu
          </p>
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)

            return (
              <Link
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl transition-all font-medium text-sm ${
                  isActive
                    ? 'bg-primary/10 text-primary font-bold shadow-xs'
                    : 'text-(--color-on-surface-variant) hover:bg-(--color-surface-low) hover:text-(--color-on-background)'
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg transition-colors ${
                    isActive ? 'bg-primary text-white shadow-xs' : 'bg-(--color-surface-high)/50 text-(--color-on-surface-variant)'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="flex-1 text-sm">{label}</span>
                {isActive && (
                  <span className="w-1.5 h-4 rounded-full bg-primary" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Drawer Footer (User Info & Sign Out) */}
        <div className="p-4 border-t border-(--color-surface-high) bg-(--color-surface-low)/30 flex flex-col gap-3">
          {/* User Profile Info */}
          <div className="flex items-center gap-3 px-1">
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm border border-primary/20">
              {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-semibold text-sm text-(--color-on-background) truncate">
                {user?.name || 'Farm Manager'}
              </span>
              <span className="text-xs text-(--color-on-surface-variant) truncate">
                {user?.email || 'Logged in'}
              </span>
            </div>
          </div>

          {/* Sign Out Button */}
          <form action={signOutAction} className="w-full">
            <button
              type="submit"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-error hover:bg-error/10 active:bg-error/20 transition-colors text-sm font-semibold border border-error/20"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}
