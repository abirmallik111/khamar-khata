'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PlusCircle, List, Users, ArrowUpRight, ArrowDownRight, Layers, DollarSign } from 'lucide-react'
import { GoatIcon, CowIcon } from '@/components/icons/AnimalIcons'
import { formatCurrency, formatDate } from '@/utils/format'
import { ExpensePieChart } from '@/components/ExpensePieChart'
import { CurrencyCode } from '@/contexts/SettingsContext'

export interface OverviewStats {
  capital: number
  expenses: number
  sales: number
  profit: number
  counts: {
    total: number
    active: number
    sick: number
    sold: number
    dead: number
  }
  chartData: { name: string; value: number }[]
}

export interface ActivityItem {
  type: 'goat' | 'cow' | 'expense' | 'sale'
  animalType?: 'goat' | 'cow' | 'general'
  id: string
  label: string
  amount: number
  date: string
}

export interface OwnerItem {
  id: string
  name: string
  totalContribution: number
}

interface DashboardOverviewProps {
  currencyCode: CurrencyCode
  goatStats: OverviewStats
  cowStats: OverviewStats
  combinedStats: OverviewStats & { generalExpenses: number }
  allActivity: ActivityItem[]
  owners: OwnerItem[]
}

export function DashboardOverview({
  currencyCode,
  goatStats,
  cowStats,
  combinedStats,
  allActivity,
  owners,
}: DashboardOverviewProps) {
  const [activeTab, setActiveTab] = useState<'combined' | 'goat' | 'cow'>('combined')

  const currentStats =
    activeTab === 'goat'
      ? goatStats
      : activeTab === 'cow'
      ? cowStats
      : combinedStats

  // Filter activity based on selected tab
  const filteredActivity = allActivity.filter((item) => {
    if (activeTab === 'goat') {
      return item.animalType === 'goat' || item.type === 'goat'
    }
    if (activeTab === 'cow') {
      return item.animalType === 'cow' || item.type === 'cow'
    }
    return true
  }).slice(0, 5)

  return (
    <div className="flex flex-col gap-5 sm:gap-6 pb-10 md:pb-0">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-display mb-1 text-(--color-on-background)">
            Dashboard
          </h1>
          <p className="text-(--color-on-surface-variant) text-xs sm:text-sm">
            {activeTab === 'goat' && 'Goat costs, sales, and profit.'}
            {activeTab === 'cow' && 'Cow costs, sales, and profit.'}
            {activeTab === 'combined' && 'Total farm costs, sales, and overall profit/loss.'}
          </p>
        </div>

        {/* View / Tab Selector */}
        <div className="flex items-center p-1 bg-(--color-surface-high) rounded-xl shadow-inner border border-(--color-surface-high) w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('combined')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'combined'
                ? 'bg-(--color-surface-lowest) text-primary shadow-xs'
                : 'text-(--color-on-surface-variant) hover:text-(--color-on-surface)'
            }`}
          >
            <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span>Farm Total</span>
            <span className="text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-full bg-(--color-surface-high)">
              {combinedStats.counts.total}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('goat')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'goat'
                ? 'bg-(--color-surface-lowest) text-primary shadow-xs'
                : 'text-(--color-on-surface-variant) hover:text-(--color-on-surface)'
            }`}
          >
            <GoatIcon size={15} />
            <span>Goats</span>
            <span className="text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-full bg-(--color-surface-high)">
              {goatStats.counts.total}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cow')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'cow'
                ? 'bg-(--color-surface-lowest) text-primary shadow-xs'
                : 'text-(--color-on-surface-variant) hover:text-(--color-on-surface)'
            }`}
          >
            <CowIcon size={15} />
            <span>Cows</span>
            <span className="text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-full bg-(--color-surface-high)">
              {cowStats.counts.total}
            </span>
          </button>
        </div>
      </header>

      {/* Quick Actions */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 hide-scrollbar">
        {(activeTab === 'goat' || activeTab === 'combined') && (
          <Link
            href="/dashboard/goats/add"
            className="flex-shrink-0 bg-(--color-surface-lowest) border border-primary text-primary px-4 py-2 rounded-full font-semibold flex items-center gap-2 hover:bg-primary hover:text-white transition-colors text-sm shadow-sm"
          >
            <GoatIcon size={16} />
            Add Goat
          </Link>
        )}
        {(activeTab === 'cow' || activeTab === 'combined') && (
          <Link
            href="/dashboard/cows/add"
            className="flex-shrink-0 bg-(--color-surface-lowest) border border-emerald-600 text-emerald-700 px-4 py-2 rounded-full font-semibold flex items-center gap-2 hover:bg-emerald-600 hover:text-white transition-colors text-sm shadow-sm"
          >
            <CowIcon size={16} />
            Add Cow
          </Link>
        )}
        <Link
          href="/dashboard/expenses/add"
          className="flex-shrink-0 bg-(--color-surface-lowest) border border-error text-error px-4 py-2 rounded-full font-semibold flex items-center gap-2 hover:bg-error hover:text-white transition-colors text-sm shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Add Expense
        </Link>
        <Link
          href="/dashboard/sales/add"
          className="flex-shrink-0 bg-(--color-surface-lowest) border border-blue-600 text-blue-600 px-4 py-2 rounded-full font-semibold flex items-center gap-2 hover:bg-blue-600 hover:text-white transition-colors text-sm shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Add Sale
        </Link>
      </div>

      {/* Livestock Status Pill Bar */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold text-(--color-on-surface-variant) mr-1">
          {activeTab === 'goat' ? 'Goats:' : activeTab === 'cow' ? 'Cows:' : 'All Animals:'}
        </span>
        <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-bold">
          Active: {currentStats.counts.active}
        </span>
        {currentStats.counts.sick > 0 && (
          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 font-bold">
            Sick: {currentStats.counts.sick}
          </span>
        )}
        <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 font-bold">
          Sold: {currentStats.counts.sold}
        </span>
        {currentStats.counts.dead > 0 && (
          <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-600 font-bold">
            Dead: {currentStats.counts.dead}
          </span>
        )}
        <span className="px-2.5 py-1 rounded-full bg-(--color-surface-high) text-(--color-on-surface-variant) font-medium">
          Total: {currentStats.counts.total}
        </span>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Capital */}
        <div className="bg-(--color-surface-lowest) p-4 sm:p-6 rounded-xl shadow-ambient flex flex-col gap-1.5 sm:gap-2 border-l-4 border-primary">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-(--color-on-surface-variant)">
              {activeTab === 'goat'
                ? 'Buying Cost (Goats)'
                : activeTab === 'cow'
                ? 'Buying Cost (Cows)'
                : 'Total Buying Cost'}
            </span>
            <span className="text-[11px] sm:text-xs text-(--color-on-surface-variant) font-medium">
              {currentStats.counts.total} total
            </span>
          </div>
          <span className="text-2xl sm:text-3xl font-display font-bold text-(--color-on-background)">
            {formatCurrency(currentStats.capital, currencyCode)}
          </span>
        </div>

        {/* Expenses */}
        <div className="bg-(--color-surface-lowest) p-4 sm:p-6 rounded-xl shadow-ambient flex flex-col gap-1.5 sm:gap-2 border-l-4 border-error">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-(--color-on-surface-variant)">
              {activeTab === 'goat'
                ? 'Goat Expenses'
                : activeTab === 'cow'
                ? 'Cow Expenses'
                : 'Total Farm Expenses'}
            </span>
            {activeTab === 'combined' && combinedStats.generalExpenses > 0 && (
              <span className="text-[10px] sm:text-[11px] text-(--color-on-surface-variant)" title="General farm expenses">
                General: {formatCurrency(combinedStats.generalExpenses, currencyCode)}
              </span>
            )}
          </div>
          <span className="text-2xl sm:text-3xl font-display font-bold text-(--color-on-background)">
            {formatCurrency(currentStats.expenses, currencyCode)}
          </span>
        </div>

        {/* Sales */}
        <div className="bg-(--color-surface-lowest) p-4 sm:p-6 rounded-xl shadow-ambient flex flex-col gap-1.5 sm:gap-2 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-(--color-on-surface-variant)">
              {activeTab === 'goat'
                ? 'Goat Sales'
                : activeTab === 'cow'
                ? 'Cow Sales'
                : 'Total Sales'}
            </span>
            <span className="text-[11px] sm:text-xs text-(--color-on-surface-variant) font-medium">
              {currentStats.counts.sold} sold
            </span>
          </div>
          <span className="text-2xl sm:text-3xl font-display font-bold text-(--color-on-background)">
            {formatCurrency(currentStats.sales, currencyCode)}
          </span>
        </div>
      </div>

      {/* Net Profit / Loss Banner */}
      <div className="bg-(--color-surface-lowest) p-4 sm:p-6 rounded-xl shadow-ambient flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs sm:text-sm font-medium text-(--color-on-surface-variant)">
              {activeTab === 'goat'
                ? 'Goat Profit / Loss'
                : activeTab === 'cow'
                ? 'Cow Profit / Loss'
                : 'Farm Profit / Loss'}
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-(--color-surface-high) text-(--color-on-surface-variant)">
              Sales - (Buying Cost + Expenses)
            </span>
          </div>
          <span
            className={`text-3xl sm:text-4xl font-display font-bold flex items-center gap-1 flex-wrap ${
              currentStats.profit >= 0 ? 'text-primary' : 'text-error'
            }`}
          >
            {currentStats.profit >= 0 ? (
              <ArrowUpRight className="w-7 h-7 sm:w-8 sm:h-8 text-primary flex-shrink-0" />
            ) : (
              <ArrowDownRight className="w-7 h-7 sm:w-8 sm:h-8 text-error flex-shrink-0" />
            )}
            {currentStats.profit >= 0 && currentStats.sales > 0 ? '+' : ''}
            {formatCurrency(currentStats.profit, currencyCode)}
          </span>
          {currentStats.profit < 0 && currentStats.sales === 0 && (
            <span className="text-[11px] sm:text-xs text-(--color-on-surface-variant) mt-0.5">
              Note: No sales recorded yet. Showing money spent so far.
            </span>
          )}
        </div>

        {/* Small Breakdown Summary */}
        <div className="flex flex-col sm:items-end gap-1.5 text-xs text-(--color-on-surface-variant) border-t sm:border-t-0 pt-3 sm:pt-0 border-(--color-surface-high)">
          <div className="flex items-center gap-2">
            <span>Buying Cost:</span>
            <span className="font-semibold text-(--color-on-surface)">
              {formatCurrency(currentStats.capital, currencyCode)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>Expenses:</span>
            <span className="font-semibold text-error">
              {formatCurrency(currentStats.expenses, currencyCode)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>Sales:</span>
            <span className="font-semibold text-primary">
              {formatCurrency(currentStats.sales, currencyCode)}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Activity, Breakdown, and Owners */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 mt-1">
        {/* Recent Activity */}
        <section className="lg:col-span-1">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">Recent Activity</h2>
            <span className="text-xs text-(--color-on-surface-variant) capitalize">{activeTab} View</span>
          </div>
          <div className="bg-(--color-surface-lowest) rounded-xl shadow-ambient overflow-hidden h-[320px] sm:h-[360px] flex flex-col border border-(--color-surface-high)">
            {filteredActivity.length === 0 ? (
              <div className="p-8 text-center text-(--color-on-surface-variant) flex-1 flex items-center justify-center">
                No recent activity for this view.
              </div>
            ) : (
              <div className="flex flex-col overflow-y-auto">
                {filteredActivity.map((item, idx) => {
                  const isGoat = item.type === 'goat' || item.animalType === 'goat'
                  const isCow = item.type === 'cow' || item.animalType === 'cow'
                  const isExpense = item.type === 'expense'
                  const isSale = item.type === 'sale'

                  return (
                    <div
                      key={`${item.type}-${item.id}-${idx}`}
                      className={`p-4 flex justify-between items-center hover:bg-(--color-surface-low) transition-colors ${
                        idx !== filteredActivity.length - 1 ? 'border-b border-(--color-surface-high)' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            isSale
                              ? 'bg-blue-100 text-blue-600'
                              : isExpense
                              ? 'bg-error/10 text-error'
                              : isCow
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-primary/10 text-primary'
                          }`}
                        >
                          {isSale ? (
                            <DollarSign className="w-5 h-5" />
                          ) : isExpense ? (
                            <List className="w-5 h-5" />
                          ) : isCow ? (
                            <CowIcon size={20} />
                          ) : (
                            <GoatIcon size={20} />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-(--color-on-background) text-sm line-clamp-1">
                            {item.label}
                          </p>
                          <p className="text-[10px] text-(--color-on-surface-variant)">
                            {formatDate(item.date)}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`font-bold text-sm ${
                          isSale
                            ? 'text-primary'
                            : isExpense
                            ? 'text-error'
                            : 'text-(--color-on-background)'
                        }`}
                      >
                        {isExpense ? '-' : isSale ? '+' : ''}
                        {formatCurrency(item.amount, currencyCode)}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        {/* Expense Breakdown Chart */}
        <section className="lg:col-span-1">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">Expense Breakdown</h2>
            <span className="text-xs text-(--color-on-surface-variant) capitalize">{activeTab} Categories</span>
          </div>
          <div className="bg-(--color-surface-lowest) rounded-xl shadow-ambient p-4 h-[320px] sm:h-[360px] border border-(--color-surface-high) flex flex-col items-stretch">
            <ExpensePieChart data={currentStats.chartData} currency={currencyCode} />
          </div>
        </section>

        {/* Farm Owners Widget */}
        <section className="lg:col-span-1">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">Farm Partners</h2>
            <Link
              href="/dashboard/settings/owners"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Manage
            </Link>
          </div>
          <div className="bg-(--color-surface-lowest) rounded-xl shadow-ambient overflow-hidden h-[320px] sm:h-[360px] flex flex-col border-l-4 border-purple-500">
            {owners.length === 0 ? (
              <div className="p-8 text-center text-(--color-on-surface-variant) flex-1 flex items-center justify-center">
                No partners added yet. Go to Settings to add partners.
              </div>
            ) : (
              <div className="flex flex-col overflow-y-auto">
                {owners.map((owner, idx) => (
                  <Link
                    key={owner.id}
                    href={`/dashboard/settings/owners/${owner.id}`}
                    className={`p-4 flex justify-between items-center hover:bg-(--color-surface-low) transition-colors ${
                      idx !== owners.length - 1 ? 'border-b border-(--color-surface-high)' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-(--color-on-background) text-sm">{owner.name}</p>
                        <p className="text-[10px] text-(--color-on-surface-variant) uppercase tracking-wider font-semibold">
                          Total Invested
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-sm text-purple-600">
                        {formatCurrency(owner.totalContribution, currencyCode)}
                      </span>
                      <p className="text-[10px] text-(--color-on-surface-variant) font-medium">View Profile</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
