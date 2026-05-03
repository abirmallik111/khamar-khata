
import { formatCurrency } from '@/utils/format'
import { Wallet, TrendingUp, PiggyBank, ArrowUpRight } from 'lucide-react'

interface EquityData {
  owner_id: string
  owner_name: string
  share_percentage: number
  total_investment: number
  realized_profit: number
  active_asset_cost: number
}

interface EquityReportProps {
  data: EquityData[]
  currency: any
}

export function EquityReport({ data, currency }: EquityReportProps) {
  const totalFarmInvestment = data.reduce((sum, p) => sum + Number(p.total_investment), 0)
  const totalFarmRealizedProfit = data.reduce((sum, p) => sum + Number(p.realized_profit), 0)

  return (
    <div className="flex flex-col gap-8">
      {/* Overview Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-md shadow-ambient border-l-4 border-primary">
          <p className="text-xs text-(--color-on-surface-variant) font-bold uppercase tracking-wider mb-1">Total Partner Capital</p>
          <p className="text-2xl font-bold font-display">{formatCurrency(totalFarmInvestment, currency)}</p>
        </div>
        <div className="bg-white p-6 rounded-md shadow-ambient border-l-4 border-green-500">
          <p className="text-xs text-(--color-on-surface-variant) font-bold uppercase tracking-wider mb-1">Realized Dividends</p>
          <p className="text-2xl font-bold font-display text-green-600">{formatCurrency(totalFarmRealizedProfit, currency)}</p>
        </div>
        <div className="bg-white p-6 rounded-md shadow-ambient border-l-4 border-blue-500">
          <p className="text-xs text-(--color-on-surface-variant) font-bold uppercase tracking-wider mb-1">Farm Book Value</p>
          <p className="text-2xl font-bold font-display text-blue-600">{formatCurrency(totalFarmInvestment + totalFarmRealizedProfit, currency)}</p>
        </div>
      </div>

      {/* Partner Breakdown Table */}
      <div className="bg-white rounded-md shadow-ambient overflow-hidden">
        <div className="p-6 border-b border-(--color-surface-high) flex items-center gap-2">
          <Wallet className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-lg">Partner Equity Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-(--color-surface-low) text-xs font-bold uppercase tracking-wider text-(--color-on-surface-variant)">
                <th className="px-6 py-4">Partner</th>
                <th className="px-6 py-4">Equity Share</th>
                <th className="px-6 py-4">Total Contribution</th>
                <th className="px-6 py-4 text-green-600">Realized Profit</th>
                <th className="px-6 py-4 text-blue-600">Active Assets</th>
                <th className="px-6 py-4 text-right">Net Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--color-surface-high)">
              {data.map((partner) => {
                const netValue = Number(partner.active_asset_cost) + Number(partner.realized_profit)
                const roi = Number(partner.total_investment) > 0 
                  ? ((Number(partner.realized_profit) / Number(partner.total_investment)) * 100).toFixed(1)
                  : '0.0'

                return (
                  <tr key={partner.owner_id} className="hover:bg-(--color-surface-lowest) transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold">{partner.owner_name}</div>
                      <div className="text-[10px] text-(--color-on-surface-variant) font-medium">ID: {partner.owner_id.slice(0, 8)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                        {partner.share_percentage}%
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {formatCurrency(partner.total_investment, currency)}
                    </td>
                    <td className="px-6 py-4 font-bold text-green-600">
                      +{formatCurrency(partner.realized_profit, currency)}
                    </td>
                    <td className="px-6 py-4 font-medium text-blue-600">
                      {formatCurrency(partner.active_asset_cost, currency)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-bold text-lg">{formatCurrency(netValue, currency)}</div>
                      <div className={`text-[10px] font-bold ${Number(roi) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {roi}% ROI
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Advisory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-primary/5 p-6 rounded-md border border-primary/20 flex gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h4 className="font-bold mb-1">Growth Projection</h4>
            <p className="text-sm text-(--color-on-surface-variant)">Based on current active assets, your farm is projected to generate an additional {formatCurrency(totalFarmRealizedProfit * 1.2, currency)} in realized profit over the next 6 months.</p>
          </div>
        </div>
        <div className="bg-blue-500/5 p-6 rounded-md border border-blue-500/20 flex gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
            <PiggyBank className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h4 className="font-bold mb-1">Reserve Requirement</h4>
            <p className="text-sm text-(--color-on-surface-variant)">We recommend maintaining a cash reserve of 15% of total investment ({formatCurrency(totalFarmInvestment * 0.15, currency)}) for emergency medical and feed contingencies.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
