'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Printer, Calendar, ChevronDown, Package, DollarSign, Activity, Users } from 'lucide-react'
import { SummaryCard } from './components/SummaryCards'
import { formatCompactNumber } from '@/utils/format'
import { useSettings } from '@/contexts/SettingsContext'
import { ProfitTrendsChart } from './components/ProfitTrendsChart'
import { TopPerformingLivestock } from './components/TopPerformingLivestock'
import { FinancialStatementTable } from './components/FinancialStatementTable'
import { EmptyState } from './components/EmptyState'
import { EquityReport } from './components/EquityReport'

interface EquityData {
  owner_id: string
  owner_name: string
  share_percentage: number
  total_investment: number
  realized_profit: number
  active_asset_cost: number
}

interface GoatROI {
  id: string
  name_or_tag: string
  breed: string
  total_cost: number
  sale_price: number | null
  profit: number | null
  roi_percentage: number | null
  status: string
  image_url: string | null
}

interface MonthlyStat {
  month_label: string
  total_expense: number
  total_sale: number
  monthly_profit: number
}

interface CategoryStat {
  category_name: string
  total_amount: number
}

interface ReportData {
  overview: {
    total_goats: number
    total_investment: number
    total_revenue: number
  }
  goat_roi: GoatROI[]
  monthly_stats: MonthlyStat[]
  category_stats: CategoryStat[]
}

interface ReportsUIProps {
  initialData: ReportData
  equityData: EquityData[]
}

export function ReportsUI({ initialData, equityData }: ReportsUIProps) {
  const { currency } = useSettings()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'main' | 'equity'>('main')

  const currentRange = searchParams.get('range') || 'all'
  
  const handleRangeChange = (range: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('range', range)
    
    // Set start/end dates based on range
    const now = new Date()
    let start: Date | null = null
    
    if (range === '7d') {
      start = new Date(now.setDate(now.getDate() - 7))
    } else if (range === '30d') {
      start = new Date(now.setDate(now.getDate() - 30))
    } else if (range === '1y') {
      start = new Date(now.setFullYear(now.getFullYear() - 1))
    }

    if (start) {
      params.set('start', start.toISOString().split('T')[0])
    } else {
      params.delete('start')
    }
    
    params.delete('end') // Reset end for presets
    router.push(`?${params.toString()}`)
    setIsFilterOpen(false)
  }

  const handlePrint = () => {
    window.print()
  }

  const { overview, goat_roi, monthly_stats, category_stats } = initialData

  const hasData = overview.total_goats > 0 || overview.total_investment > 0

  if (!hasData) {
    return <EmptyState />
  }

  const netProfit = overview.total_revenue - overview.total_investment

  return (
    <>
      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          .shadow-ambient { box-shadow: none !important; border: 1px solid #eee !important; }
          main { overflow: visible !important; height: auto !important; padding: 0 !important; }
          .max-w-5xl { max-width: 100% !important; }
          header, nav, footer { display: none !important; }
          .bg-(--color-background) { background-color: white !important; }
        }
      `}</style>

      {/* Control Bar */}
      <div className="flex items-center justify-between gap-4 mb-6 print:hidden">
        <div className="relative">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 bg-(--color-surface-lowest) px-4 py-2 rounded-md shadow-sm border border-(--color-surface-high) text-sm font-bold hover:bg-(--color-surface-low) transition-all"
          >
            <Calendar className="w-4 h-4 text-(--color-primary)" />
            <span>
              {currentRange === 'all' ? 'All Time' : 
               currentRange === '7d' ? 'Last 7 Days' : 
               currentRange === '30d' ? 'Last 30 Days' : 'Last 12 Months'}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isFilterOpen && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-(--color-surface-lowest) rounded-md shadow-xl border border-(--color-surface-high) z-30 py-2">
              {[
                { id: 'all', label: 'All Time' },
                { id: '7d', label: 'Last 7 Days' },
                { id: '30d', label: 'Last 30 Days' },
                { id: '1y', label: 'Last 12 Months' }
              ].map((range) => (
                <button
                  key={range.id}
                  onClick={() => handleRangeChange(range.id)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-(--color-surface-low) transition-colors ${currentRange === range.id ? 'font-bold text-primary bg-(--color-surface-low)' : ''}`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-md font-bold shadow-sm hover:brightness-110 transition-all text-sm"
        >
          <Printer className="w-4 h-4" />
          Export PDF
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 mb-8 bg-(--color-surface-low)/30 p-1 rounded-lg w-fit print:hidden">
        <button
          onClick={() => setActiveTab('main')}
          className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'main' ? 'bg-white shadow-sm text-primary' : 'text-(--color-on-surface-variant) hover:text-primary'}`}
        >
          Overview & Performance
        </button>
        <button
          onClick={() => setActiveTab('equity')}
          className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'equity' ? 'bg-white shadow-sm text-primary' : 'text-(--color-on-surface-variant) hover:text-primary'}`}
        >
          Partner Equity & Dividends
        </button>
      </div>

      <div className="flex flex-col gap-8">
        {activeTab === 'main' ? (
          <>
            {/* Summary Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryCard 
            title="Net Profit" 
            value={formatCompactNumber(netProfit, currency)} 
            icon={DollarSign} 
            colorClass="bg-green-100 text-green-700"
            trend={{ value: '12.4%', positive: netProfit >= 0 }}
          />
          <SummaryCard 
            title="Operating Expenses" 
            value={formatCompactNumber(overview.total_investment, currency)} 
            icon={Package} 
            colorClass="bg-orange-100 text-orange-700"
            subtitle="Steady"
          />
          <SummaryCard 
            title="Avg ROI / Goat" 
            value={`${(netProfit / (overview.total_investment || 1) * 100).toFixed(1)}%`} 
            icon={Activity} 
            colorClass="bg-blue-100 text-blue-700"
            trend={{ value: 'New', positive: true }}
          />
          <SummaryCard 
            title="Active Livestock" 
            value={overview.total_goats} 
            icon={Users} 
            colorClass="bg-purple-100 text-purple-700"
            trend={{ value: '-2.1%', positive: false }}
          />
        </div>

        {/* Chart and Top Performers Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <ProfitTrendsChart data={monthly_stats || []} />
          </div>
          <div className="lg:col-span-1">
            <TopPerformingLivestock data={goat_roi || []} />
          </div>
        </div>

        {/* Financial Statement Row */}
        <div className="w-full">
          <FinancialStatementTable 
            categories={category_stats || []} 
            totalRevenue={overview.total_revenue}
            totalInvestment={overview.total_investment}
          />
        </div>

        {/* Custom Report CTA */}
        <div className="bg-orange-100 p-8 rounded-md text-center flex flex-col items-center gap-4 print:hidden">
          <div className="max-w-md">
            <h3 className="font-bold text-xl mb-2">Need a custom report?</h3>
            <p className="text-sm text-orange-800 opacity-80">
              Our agronomists can help you build specialized reports for breeding cycles and genetic tracking.
            </p>
          </div>
          <button className="bg-orange-800 text-white px-8 py-3 rounded-full font-bold hover:brightness-110 transition-all shadow-md">
            Contact Advisor
          </button>
        </div>
      </>
    ) : (
      <EquityReport data={equityData} currency={currency} />
    )}
  </div>
</>
  )
}
