import { db } from '@/db'
import {
  goats,
  cows,
  expenses,
  expenseGoatMap,
  expenseCowMap,
  sales,
  expenseCategories,
  owners,
  ownerContributions,
  profiles
} from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { auth } from '@/auth'
import {
  DashboardOverview,
  OverviewStats,
  ActivityItem,
  OwnerItem
} from './DashboardOverview'
import { CurrencyCode } from '@/contexts/SettingsContext'

export default async function DashboardPage() {
  const session = await auth()
  let userId = session?.user?.id

  if (!userId) {
    const [firstUser] = await db.select().from(profiles).limit(1)
    if (firstUser) userId = firstUser.id
  }

  const [
    profileRes,
    goatsData,
    cowsData,
    expensesRaw,
    goatMaps,
    cowMaps,
    salesData,
    allOwners,
    contributionsData
  ] = await Promise.all([
    userId ? db.select({ currency: profiles.currency }).from(profiles).where(eq(profiles.id, userId)).limit(1) : [],
    userId
      ? db
          .select({
            id: goats.id,
            nameOrTag: goats.nameOrTag,
            purchasePrice: goats.purchasePrice,
            status: goats.status,
            createdAt: goats.createdAt
          })
          .from(goats)
          .where(eq(goats.userId, userId))
          .orderBy(desc(goats.createdAt))
      : [],
    userId
      ? db
          .select({
            id: cows.id,
            nameOrTag: cows.nameOrTag,
            purchasePrice: cows.purchasePrice,
            status: cows.status,
            createdAt: cows.createdAt
          })
          .from(cows)
          .where(eq(cows.userId, userId))
          .orderBy(desc(cows.createdAt))
      : [],
    userId
      ? db
          .select({
            id: expenses.id,
            amount: expenses.amount,
            categoryId: expenses.categoryId,
            categoryName: expenseCategories.name,
            createdAt: expenses.createdAt
          })
          .from(expenses)
          .leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
          .where(eq(expenses.userId, userId))
          .orderBy(desc(expenses.createdAt))
      : [],
    userId
      ? db
          .select({
            expenseId: expenseGoatMap.expenseId,
            goatId: expenseGoatMap.goatId
          })
          .from(expenseGoatMap)
          .where(eq(expenseGoatMap.userId, userId))
      : [],
    userId
      ? db
          .select({
            expenseId: expenseCowMap.expenseId,
            cowId: expenseCowMap.cowId
          })
          .from(expenseCowMap)
          .where(eq(expenseCowMap.userId, userId))
      : [],
    userId
      ? db
          .select({
            id: sales.id,
            goatId: sales.goatId,
            cowId: sales.cowId,
            salePrice: sales.salePrice,
            createdAt: sales.createdAt,
            goatName: goats.nameOrTag,
            cowName: cows.nameOrTag
          })
          .from(sales)
          .leftJoin(goats, eq(sales.goatId, goats.id))
          .leftJoin(cows, eq(sales.cowId, cows.id))
          .where(eq(sales.userId, userId))
          .orderBy(desc(sales.createdAt))
      : [],
    userId ? db.select({ id: owners.id, name: owners.name }).from(owners).where(eq(owners.userId, userId)) : [],
    userId
      ? db
          .select({ ownerId: ownerContributions.ownerId, amount: ownerContributions.amount })
          .from(ownerContributions)
          .where(eq(ownerContributions.userId, userId))
      : []
  ])

  const currencyCode = (profileRes?.[0]?.currency || 'BDT') as CurrencyCode

  // Calculate expense mappings
  const expenseGoatCountMap = new Map<string, number>()
  for (const m of goatMaps) {
    expenseGoatCountMap.set(m.expenseId, (expenseGoatCountMap.get(m.expenseId) || 0) + 1)
  }

  const expenseCowCountMap = new Map<string, number>()
  for (const m of cowMaps) {
    expenseCowCountMap.set(m.expenseId, (expenseCowCountMap.get(m.expenseId) || 0) + 1)
  }

  let totalGoatExpenses = 0
  let totalCowExpenses = 0
  let totalGeneralExpenses = 0

  const goatCategoryMap: Record<string, number> = {}
  const cowCategoryMap: Record<string, number> = {}
  const combinedCategoryMap: Record<string, number> = {}

  for (const exp of expensesRaw) {
    const amt = Number(exp.amount)
    const cat = exp.categoryName || 'Uncategorized'
    combinedCategoryMap[cat] = (combinedCategoryMap[cat] || 0) + amt

    const goatCount = expenseGoatCountMap.get(exp.id) || 0
    const cowCount = expenseCowCountMap.get(exp.id) || 0
    const totalMapped = goatCount + cowCount

    if (totalMapped > 0) {
      const goatPart = amt * (goatCount / totalMapped)
      const cowPart = amt * (cowCount / totalMapped)
      totalGoatExpenses += goatPart
      totalCowExpenses += cowPart

      if (goatPart > 0) {
        goatCategoryMap[cat] = (goatCategoryMap[cat] || 0) + goatPart
      }
      if (cowPart > 0) {
        cowCategoryMap[cat] = (cowCategoryMap[cat] || 0) + cowPart
      }
    } else {
      totalGeneralExpenses += amt
    }
  }

  // Capital
  const goatCapital = goatsData.reduce((sum, g) => sum + Number(g.purchasePrice), 0)
  const cowCapital = cowsData.reduce((sum, c) => sum + Number(c.purchasePrice), 0)
  const combinedCapital = goatCapital + cowCapital

  // Sales
  const goatSales = salesData.filter((s) => s.goatId !== null)
  const cowSales = salesData.filter((s) => s.cowId !== null)

  const goatSalesTotal = goatSales.reduce((sum, s) => sum + Number(s.salePrice), 0)
  const cowSalesTotal = cowSales.reduce((sum, s) => sum + Number(s.salePrice), 0)
  const combinedSalesTotal = goatSalesTotal + cowSalesTotal

  // Profit/Loss
  const goatProfit = goatSalesTotal - (goatCapital + totalGoatExpenses)
  const cowProfit = cowSalesTotal - (cowCapital + totalCowExpenses)
  const totalFarmExpenses = totalGoatExpenses + totalCowExpenses + totalGeneralExpenses
  const combinedProfit = combinedSalesTotal - (combinedCapital + totalFarmExpenses)

  // Counts
  const goatCounts = {
    total: goatsData.length,
    active: goatsData.filter((g) => g.status === 'active').length,
    sick: goatsData.filter((g) => g.status === 'sick').length,
    sold: goatsData.filter((g) => g.status === 'sold').length,
    dead: goatsData.filter((g) => g.status === 'dead').length
  }

  const cowCounts = {
    total: cowsData.length,
    active: cowsData.filter((c) => c.status === 'active').length,
    sick: cowsData.filter((c) => c.status === 'sick').length,
    sold: cowsData.filter((c) => c.status === 'sold').length,
    dead: cowsData.filter((c) => c.status === 'dead').length
  }

  const combinedCounts = {
    total: goatCounts.total + cowCounts.total,
    active: goatCounts.active + cowCounts.active,
    sick: goatCounts.sick + cowCounts.sick,
    sold: goatCounts.sold + cowCounts.sold,
    dead: goatCounts.dead + cowCounts.dead
  }

  const goatStats: OverviewStats = {
    capital: goatCapital,
    expenses: totalGoatExpenses,
    sales: goatSalesTotal,
    profit: goatProfit,
    counts: goatCounts,
    chartData: Object.entries(goatCategoryMap).map(([name, value]) => ({ name, value: Math.round(value) }))
  }

  const cowStats: OverviewStats = {
    capital: cowCapital,
    expenses: totalCowExpenses,
    sales: cowSalesTotal,
    profit: cowProfit,
    counts: cowCounts,
    chartData: Object.entries(cowCategoryMap).map(([name, value]) => ({ name, value: Math.round(value) }))
  }

  const combinedStats = {
    capital: combinedCapital,
    expenses: totalFarmExpenses,
    generalExpenses: totalGeneralExpenses,
    sales: combinedSalesTotal,
    profit: combinedProfit,
    counts: combinedCounts,
    chartData: Object.entries(combinedCategoryMap).map(([name, value]) => ({ name, value: Math.round(value) }))
  }

  // Activity
  const allActivity: ActivityItem[] = [
    ...goatsData.map((g) => ({
      type: 'goat' as const,
      animalType: 'goat' as const,
      id: g.id,
      label: `Added Goat: ${g.nameOrTag}`,
      amount: Number(g.purchasePrice),
      date: new Date(g.createdAt).toISOString()
    })),
    ...cowsData.map((c) => ({
      type: 'cow' as const,
      animalType: 'cow' as const,
      id: c.id,
      label: `Added Cow: ${c.nameOrTag}`,
      amount: Number(c.purchasePrice),
      date: new Date(c.createdAt).toISOString()
    })),
    ...expensesRaw.map((e) => {
      const gCount = expenseGoatCountMap.get(e.id) || 0
      const cCount = expenseCowCountMap.get(e.id) || 0
      const animalType: 'goat' | 'cow' | 'general' =
        gCount > 0 && cCount === 0 ? 'goat' : cCount > 0 && gCount === 0 ? 'cow' : 'general'

      return {
        type: 'expense' as const,
        animalType,
        id: e.id,
        label: `Expense: ${e.categoryName || 'Uncategorized'}`,
        amount: Number(e.amount),
        date: new Date(e.createdAt).toISOString()
      }
    }),
    ...salesData.map((s) => ({
      type: 'sale' as const,
      animalType: s.cowId ? ('cow' as const) : ('goat' as const),
      id: s.id,
      label: s.cowId ? `Sold Cow: ${s.cowName || 'Cow'}` : `Sold Goat: ${s.goatName || 'Goat'}`,
      amount: Number(s.salePrice),
      date: new Date(s.createdAt).toISOString()
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Owners
  const ownersWithTotals: OwnerItem[] = allOwners.map((owner) => {
    const totalContribution = contributionsData
      .filter((c) => c.ownerId === owner.id)
      .reduce((sum, c) => sum + Number(c.amount), 0)
    return { id: owner.id, name: owner.name, totalContribution }
  })

  return (
    <DashboardOverview
      currencyCode={currencyCode}
      goatStats={goatStats}
      cowStats={cowStats}
      combinedStats={combinedStats}
      allActivity={allActivity}
      owners={ownersWithTotals}
    />
  )
}
