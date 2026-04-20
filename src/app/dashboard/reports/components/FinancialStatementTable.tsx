import { formatCompactNumber, formatCurrency } from '@/utils/format'
import { useFormat } from '@/hooks/useFormat'

interface CategoryStat {
  category_name: string
  total_amount: number
}

interface FinancialStatementProps {
  categories: CategoryStat[]
  totalRevenue: number
  totalInvestment: number
}

export function FinancialStatementTable({ categories, totalRevenue, totalInvestment }: FinancialStatementProps) {
  const { currency, currencySymbol } = useFormat()
  
  return (
    <div className="bg-(--color-surface-lowest) rounded-md shadow-ambient overflow-hidden">
      <div className="p-4 bg-(--color-tertiary) text-white flex justify-between items-center">
        <h2 className="font-bold font-display">Financial Summary</h2>
        <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full">FY 2024-25</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="text-[10px] text-(--color-on-surface-variant) uppercase tracking-widest font-bold border-b border-(--color-surface-high)">
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4 text-right">Gross Value</th>
              <th className="px-6 py-4 text-right">Adjustment</th>
              <th className="px-6 py-4 text-right">Net Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--color-surface-high)">
            {/* Sales Row */}
            <tr className="hover:bg-(--color-surface-low) transition-colors">
              <td className="px-6 py-4 font-bold flex items-center gap-3">
                <div className="w-2 h-8 rounded-full bg-[var(--color-primary)]"></div>
                Livestock Sales
              </td>
              <td className="px-6 py-4 text-right font-medium">{formatCompactNumber(totalRevenue, currency)}</td>
              <td className="px-6 py-4 text-right text-(--color-on-surface-variant)">-{currencySymbol}0.00</td>
              <td className="px-6 py-4 text-right font-bold text-[var(--color-primary)]">{formatCompactNumber(totalRevenue, currency)}</td>
            </tr>

            {/* Expenses by Category */}
            {categories.map((cat, idx) => (
              <tr key={idx} className="hover:bg-(--color-surface-low) transition-colors">
                  <td className="px-6 py-4 font-bold flex items-center gap-3">
                    <div className="w-2 h-8 rounded-full bg-(--color-tertiary)/40"></div>
                    {cat.category_name}
                  </td>
                  <td className="px-6 py-4 text-right font-medium">{formatCompactNumber(cat.total_amount, currency)}</td>
                  <td className="px-6 py-4 text-right text-(--color-on-surface-variant)">-{currencySymbol}0.00</td>
                  <td className="px-6 py-4 text-right font-bold text-[var(--color-error)]">-{formatCompactNumber(cat.total_amount, currency)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-(--color-surface-low)/50">
              <td className="px-6 py-6 font-display text-lg font-bold">Total Operating Profit</td>
              <td colSpan={3} className="px-6 py-6 text-right font-display text-2xl font-bold text-[var(--color-primary)]">
                {formatCompactNumber(totalRevenue - totalInvestment, currency)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
