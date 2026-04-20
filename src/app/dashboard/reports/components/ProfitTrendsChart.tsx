import { useFormat } from '@/hooks/useFormat'

interface TrendData {
  month_label: string
  total_expense: number
  total_sale: number
  monthly_profit: number
}

export function ProfitTrendsChart({ data }: { data: TrendData[] }) {
  const { formatCurrency } = useFormat()
  // Sort data chronologically (they come desc from SQL, so reverse for chart)
  const chartData = [...data].reverse();
  
  const maxVal = Math.max(...chartData.map(d => Math.max(d.total_expense, d.total_sale)), 1000);

  return (
    <div className="bg-(--color-surface-lowest) p-6 rounded-md shadow-ambient">
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-bold text-lg font-display">Monthly Profit Trends</h2>
        <div className="flex gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-[var(--color-primary)]"></div>
            <span>Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-(--color-surface-high)"></div>
            <span>Expenses</span>
          </div>
        </div>
      </div>

      <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 px-2">
        {chartData.map((d, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 hidden group-hover:block z-20 bg-black text-white text-[10px] p-2 rounded shadow-lg whitespace-nowrap">
              <p>Rev: {formatCurrency(d.total_sale)}</p>
              <p>Exp: {formatCurrency(d.total_expense)}</p>
              <p className="font-bold border-t border-white/20 mt-1 pt-1">Profit: {formatCurrency(d.monthly_profit)}</p>
            </div>

            <div className="w-full flex items-end justify-center gap-1 h-full max-h-[200px]">
              {/* Expense Bar */}
              <div 
                className="w-1/2 bg-(--color-surface-high) rounded-t-sm transition-all hover:opacity-80"
                style={{ height: `${(d.total_expense / maxVal) * 100}%`, minHeight: d.total_expense > 0 ? '4px' : '0' }}
              ></div>
              {/* Sale Bar */}
              <div 
                className="w-1/2 bg-[var(--color-primary)] rounded-t-sm transition-all hover:brightness-110"
                style={{ height: `${(d.total_sale / maxVal) * 100}%`, minHeight: d.total_sale > 0 ? '4px' : '0' }}
              ></div>
            </div>
            <span className="text-[10px] text-(--color-on-surface-variant) font-medium uppercase rotate-45 sm:rotate-0 mt-2">{d.month_label.split(' ')[0]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
