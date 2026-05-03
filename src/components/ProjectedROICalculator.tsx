'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, AlertCircle, Info } from 'lucide-react'
import { formatCurrency } from '@/utils/format'
import { CurrencyCode } from '@/contexts/SettingsContext'
import { GoatStatus } from '@/types'

interface ProjectedROICalculatorProps {
  purchasePrice: number
  totalExpenses: number
  currency: CurrencyCode
  status: GoatStatus
}

export function ProjectedROICalculator({ 
  purchasePrice, 
  totalExpenses, 
  currency, 
  status 
}: ProjectedROICalculatorProps) {
  const totalCost = purchasePrice + totalExpenses
  
  // Suggested sale price logic
  // Healthy: 20% margin suggested
  // Sick: 10% loss or lower margin suggested due to health penalty
  const healthPenalty = status === 'sick' ? 0.7 : 1.0
  const initialProjected = totalCost * 1.25 * healthPenalty
  
  const [projectedPrice, setProjectedPrice] = useState(initialProjected)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const profit = projectedPrice - totalCost
  const roi = totalCost > 0 ? ((profit / totalCost) * 100).toFixed(1) : '0'
  const isProfit = profit >= 0

  return (
    <div className="mt-8 bg-(--color-surface-low) p-6 rounded-md border border-(--color-surface-high) flex flex-col gap-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Profit Simulator
          </h3>
          <p className="text-xs text-(--color-on-surface-variant) mt-1">
            Slide to project your return based on health and market price.
          </p>
        </div>
        {status === 'sick' && (
          <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Health Risk Impact
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-end mb-2">
          <span className="text-xs font-bold text-(--color-on-surface-variant) uppercase tracking-widest">Expected Sale Price</span>
          <span className="text-2xl font-display font-bold text-primary">
            {formatCurrency(projectedPrice, currency)}
          </span>
        </div>
        <input
          type="range"
          min={totalCost * 0.5}
          max={totalCost * 2.5}
          step={500}
          value={projectedPrice}
          onChange={(e) => setProjectedPrice(Number(e.target.value))}
          className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-primary ${status === 'sick' ? 'bg-amber-200' : 'bg-(--color-surface-high)'}`}
        />
        <div className="flex justify-between text-[10px] text-(--color-on-surface-variant) font-medium mt-1">
          <span>Minimum ({formatCurrency(totalCost * 0.5, currency)})</span>
          <span>Maximum ({formatCurrency(totalCost * 2.5, currency)})</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-(--color-surface-high)">
        <div className={`p-4 rounded-md flex flex-col gap-1 ${isProfit ? 'bg-green-50' : 'bg-red-50'}`}>
          <span className="text-[10px] font-bold uppercase tracking-wider text-(--color-on-surface-variant)">Projected Profit</span>
          <span className={`text-xl font-display font-bold ${isProfit ? 'text-primary' : 'text-error'}`}>
            {isProfit ? '+' : ''}{formatCurrency(profit, currency)}
          </span>
        </div>
        <div className={`p-4 rounded-md flex flex-col gap-1 ${isProfit ? 'bg-green-50' : 'bg-red-50'}`}>
          <span className="text-[10px] font-bold uppercase tracking-wider text-(--color-on-surface-variant)">Projected ROI</span>
          <span className={`text-xl font-display font-bold ${isProfit ? 'text-primary' : 'text-error'}`}>
            {roi}%
          </span>
        </div>
      </div>

      {status === 'sick' ? (
        <div className="flex items-start gap-3 p-3 bg-amber-500/10 text-amber-700 rounded-md text-[11px] border border-amber-500/20">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>
            <strong>Note:</strong> Sick goats typically fetch a 20-30% lower market price. The simulator has been adjusted to reflect health risks and increased medical overhead.
          </p>
        </div>
      ) : (
        <div className="flex items-start gap-3 p-3 bg-primary/5 text-primary rounded-md text-[11px] border border-primary/10">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>
            This is a projection based on your current investment of <strong>{formatCurrency(totalCost, currency)}</strong>. Realized profit may vary based on market demand.
          </p>
        </div>
      )}
    </div>
  )
}
