'use client'

import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { formatCurrency } from '@/utils/format'
import { CurrencyCode } from '@/contexts/SettingsContext'

interface DataItem {
  name: string
  value: number
}

interface ExpensePieChartProps {
  data: DataItem[]
  currency: CurrencyCode
}

const COLORS = ['#0d631b', '#2e7d32', '#126d27', '#6b4f45', '#ba1a1a', '#f59e0b', '#3b82f6', '#8b5cf6']

export function ExpensePieChart({ data, currency }: ExpensePieChartProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <div className="w-full h-full min-h-[300px] bg-(--color-surface-low) animate-pulse rounded-md" />

  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-(--color-on-surface-variant) italic p-8">
        No expense data to visualize.
      </div>
    )
  }

  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={50}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: any) => formatCurrency(Number(value), currency)}
            contentStyle={{ 
              backgroundColor: 'var(--color-surface-lowest)', 
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-surface-high)',
              boxShadow: 'var(--shadow-ambient)'
            }}
          />
          <Legend verticalAlign="bottom" height={36}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
