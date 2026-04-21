import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react'
import { formatCompactNumber as formatLakh } from '@/utils/format'

interface SummaryCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: string
    positive: boolean
  }
  icon: LucideIcon
  colorClass: string
}

export function SummaryCard({ title, value, subtitle, trend, icon: Icon, colorClass }: SummaryCardProps) {
  return (
    <div className="bg-(--color-surface-lowest) p-6 rounded-md shadow-ambient border-b-4 border-transparent hover:border-(--color-primary) transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-full ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-bold ${trend.positive ? 'text-primary' : 'text-error'}`}>
            {trend.positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {trend.value}
          </div>
        )}
      </div>
      <div>
        <p className="text-xs text-(--color-on-surface-variant) font-medium uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-3xl font-bold font-display">{value}</h3>
        {subtitle && <p className="text-xs text-(--color-on-surface-variant) mt-2">{subtitle}</p>}
      </div>
    </div>
  )
}

export { formatLakh }
