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
  
  const actualMax = Math.max(...chartData.map(d => Math.max(d.total_expense, d.total_sale)));
  const maxVal = actualMax > 0 ? actualMax * 1.1 : 100; // Add 10% headroom

  return (
    <div className="bg-(--color-surface-lowest) p-6 rounded-md shadow-ambient">
      <div className="flex justify-between items-center mb-12">
        <h2 className="font-bold text-xl font-display">Monthly Profit Trends</h2>
        <div className="flex gap-6 text-xs font-medium">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-primary shadow-sm"></div>
            <span className="text-(--color-on-surface-variant)">Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-(--color-surface-high) shadow-sm"></div>
            <span className="text-(--color-on-surface-variant)">Expenses</span>
          </div>
        </div>
      </div>

      <div className="h-72 flex items-end justify-between gap-4 px-2">
        {chartData.map((d, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center group relative h-full">
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 hidden group-hover:block z-20 bg-(--color-surface-lowest) text-(--color-on-surface) text-[11px] p-3 rounded-xl shadow-xl border border-(--color-surface-high) whitespace-nowrap transition-all scale-in">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between gap-4">
                  <span className="text-(--color-on-surface-variant)">Revenue:</span>
                  <span className="font-bold text-primary">{formatCurrency(d.total_sale)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-(--color-on-surface-variant)">Expenses:</span>
                  <span className="font-bold text-error">{formatCurrency(d.total_expense)}</span>
                </div>
                <div className="mt-1 pt-1 border-t border-(--color-surface-high) flex justify-between gap-4">
                  <span className="font-bold text-(--color-on-surface)">Profit:</span>
                  <span className="font-bold text-primary">{formatCurrency(d.monthly_profit)}</span>
                </div>
              </div>
            </div>

            {/* Bars Container */}
            <div className="w-full flex items-end justify-center gap-1.5 flex-1 mb-4">
              {/* Expense Bar */}
              <div 
                className="w-1/3 bg-(--color-surface-high) rounded-t-lg transition-all duration-500 ease-out group-hover:brightness-95 shadow-sm"
                style={{ height: `${(d.total_expense / maxVal) * 100}%`, minHeight: d.total_expense > 0 ? '4px' : '0' }}
              ></div>
              {/* Sale Bar */}
              <div 
                className="w-1/3 bg-primary rounded-t-lg transition-all duration-500 ease-out group-hover:brightness-110 shadow-md"
                style={{ height: `${(d.total_sale / maxVal) * 100}%`, minHeight: d.total_sale > 0 ? '4px' : '0' }}
              ></div>
            </div>
            
            {/* Month Label */}
            <div className="h-6 flex items-center">
              <span className="text-[11px] text-(--color-on-surface-variant) font-black uppercase tracking-wider">{d.month_label.split(' ')[0]}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
