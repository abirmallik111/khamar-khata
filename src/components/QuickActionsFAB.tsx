'use client'

import React, { useState, useEffect } from 'react'
import { Plus, X, DollarSign, Activity, ShoppingBag, PlusCircle, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function QuickActionsFAB() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Close menu when navigating
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const actions = [
    { 
      label: 'Add New Goat', 
      icon: PlusCircle, 
      href: '/dashboard/goats/add',
      color: 'bg-emerald-500',
      delay: 'delay-0'
    },
    { 
      label: 'Record Expense', 
      icon: DollarSign, 
      href: '/dashboard/expenses/add',
      color: 'bg-orange-500',
      delay: 'delay-75'
    },
    { 
      label: 'Log New Sale', 
      icon: ShoppingBag, 
      href: '/dashboard/sales/add',
      color: 'bg-blue-500',
      delay: 'delay-100'
    },
    { 
      label: 'Health Record', 
      icon: Activity, 
      href: '/dashboard/goats', // Direct to list to pick a goat
      color: 'bg-rose-500',
      delay: 'delay-150'
    }
  ]

  return (
    <div className="fixed bottom-24 right-6 sm:bottom-8 sm:right-10 z-[60] print:hidden pointer-events-none">
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-all duration-300 pointer-events-auto"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Action Menu */}
      <div className={`flex flex-col items-end gap-4 mb-4 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
        {actions.map((action, idx) => (
          <div key={idx} className={`flex items-center gap-3 transition-transform duration-300 ${isOpen ? 'scale-100' : 'scale-0'}`}>
            <span className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold shadow-ambient text-gray-800 border border-gray-200">
              {action.label}
            </span>
            <Link
              href={action.href}
              className={`w-12 h-12 rounded-full ${action.color} text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all pointer-events-auto`}
            >
              <action.icon className="w-5 h-5" />
            </Link>
          </div>
        ))}
      </div>

      {/* Main Toggle Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 pointer-events-auto ${isOpen ? 'bg-gray-900 rotate-90' : 'bg-gradient-to-br from-emerald-500 to-emerald-700 hover:scale-110 active:scale-95'}`}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <Plus className="w-7 h-7 text-white" />
          )}
        </button>
      </div>
    </div>
  )
}
