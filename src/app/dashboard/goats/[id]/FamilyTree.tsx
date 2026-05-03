'use client'

import React from 'react'
import Link from 'next/link'
import { GitBranch, User, ChevronRight } from 'lucide-react'

interface FamilyMember {
  id: string
  name_or_tag: string
  gender: string | null
  status?: string
}

interface FamilyTreeProps {
  goat: FamilyMember
  mother?: FamilyMember
  father?: FamilyMember
  offspring: FamilyMember[]
}

export function FamilyTree({ goat, mother, father, offspring }: FamilyTreeProps) {
  return (
    <div className="bg-(--color-surface-lowest) rounded-md shadow-ambient p-6">
      <h3 className="text-lg font-bold mb-8 flex items-center gap-2 border-b border-(--color-surface-high) pb-4">
        <GitBranch className="w-5 h-5 text-primary" />
        Genetic Lineage (Immediate Family)
      </h3>

      <div className="flex flex-col items-center gap-8">
        {/* Parents Level */}
        <div className="flex gap-12 sm:gap-24 relative">
          {/* Father */}
          <div className="flex flex-col items-center gap-2">
            <div className="text-[10px] font-bold uppercase text-(--color-on-surface-variant)">Sire (Father)</div>
            {father ? (
              <Link 
                href={`/dashboard/goats/${father.id}`}
                className="w-24 h-24 rounded-full border-2 border-blue-500/30 bg-blue-500/5 flex flex-col items-center justify-center gap-1 hover:border-blue-500 hover:bg-blue-500/10 transition-all group"
              >
                <User className="w-8 h-8 text-blue-500" />
                <span className="text-xs font-bold text-blue-700 truncate w-20 text-center">{father.name_or_tag}</span>
              </Link>
            ) : (
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-(--color-surface-high) bg-(--color-surface-low)/30 flex items-center justify-center">
                <span className="text-[10px] text-(--color-on-surface-variant) italic">Unknown</span>
              </div>
            )}
          </div>

          {/* Connection Lines (Simulated with absolute positioning if needed, or just layout) */}
          
          {/* Mother */}
          <div className="flex flex-col items-center gap-2">
            <div className="text-[10px] font-bold uppercase text-(--color-on-surface-variant)">Dam (Mother)</div>
            {mother ? (
              <Link 
                href={`/dashboard/goats/${mother.id}`}
                className="w-24 h-24 rounded-full border-2 border-pink-500/30 bg-pink-500/5 flex flex-col items-center justify-center gap-1 hover:border-pink-500 hover:bg-pink-500/10 transition-all group"
              >
                <User className="w-8 h-8 text-pink-500" />
                <span className="text-xs font-bold text-pink-700 truncate w-20 text-center">{mother.name_or_tag}</span>
              </Link>
            ) : (
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-(--color-surface-high) bg-(--color-surface-low)/30 flex items-center justify-center">
                <span className="text-[10px] text-(--color-on-surface-variant) italic">Unknown</span>
              </div>
            )}
          </div>
        </div>

        {/* Vertical Connector */}
        <div className="w-0.5 h-8 bg-(--color-surface-high) relative">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-0.5 bg-(--color-surface-high) -translate-y-8"></div>
        </div>

        {/* Current Goat Level */}
        <div className="flex flex-col items-center gap-2 relative">
          <div className="text-[10px] font-bold uppercase text-primary">Current Goat</div>
          <div className="w-32 h-32 rounded-full border-4 border-primary bg-primary/5 flex flex-col items-center justify-center gap-1 shadow-ambient animate-pulse-subtle">
            <User className="w-12 h-12 text-primary" />
            <span className="text-sm font-bold text-primary truncate w-28 text-center">{goat.name_or_tag}</span>
          </div>
        </div>

        {/* Offspring Connector */}
        {offspring.length > 0 && (
          <>
            <div className="w-0.5 h-8 bg-(--color-surface-high)"></div>
            <div className="text-[10px] font-bold uppercase text-(--color-on-surface-variant) -mb-4">Offspring ({offspring.length})</div>
            <div className="flex flex-wrap justify-center gap-4 max-w-lg">
              {offspring.map((child) => (
                <Link 
                  key={child.id}
                  href={`/dashboard/goats/${child.id}`}
                  className="px-4 py-2 rounded-full border border-(--color-surface-high) bg-(--color-surface-low) hover:bg-primary/5 hover:border-primary/20 transition-all flex items-center gap-2 group"
                >
                  <span className={`w-2 h-2 rounded-full ${child.gender === 'Male' ? 'bg-blue-400' : 'bg-pink-400'}`}></span>
                  <span className="text-xs font-bold group-hover:text-primary transition-colors">{child.name_or_tag}</span>
                  <ChevronRight className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-all" />
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
