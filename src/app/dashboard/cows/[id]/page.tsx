import { db } from '@/db'
import {
  cows,
  sales,
  expenses,
  expenseCowMap,
  expenseCategories,
  cowHealthRecords,
  cowNotes,
  cowImages,
  profiles
} from '@/db/schema'
import { eq, and, sql, desc } from 'drizzle-orm'
import { auth } from '@/auth'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, AlertTriangle, FileText, Image as ImageIcon, Activity, Syringe, StickyNote, Beef } from 'lucide-react'
import { HealthRecordModal } from './HealthRecordModal'
import { NoteModal } from './NoteModal'
import { HealthRecordItem } from './HealthRecordItem'
import { NoteItem } from './NoteItem'
import { DeleteCowButton } from './DeleteCowButton'
import { ProjectedROICalculator } from '@/components/ProjectedROICalculator'
import { FamilyTree } from './FamilyTree'
import { GrowthTimeline } from './GrowthTimeline'
import { SmartImage } from '@/components/SmartImage'
import { notFound } from 'next/navigation'
import { formatCurrency, formatDate } from '@/utils/format'

export default async function CowProfilePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const session = await auth()
  let userId = session?.user?.id

  if (!userId) {
    const [firstUser] = await db.select().from(profiles).limit(1)
    if (firstUser) userId = firstUser.id
  }

  const [profile] = userId ? await db.select({ currency: profiles.currency }).from(profiles).where(eq(profiles.id, userId)).limit(1) : []
  const currencyCode = (profile?.currency || 'BDT') as any

  const [cow] = await db.select().from(cows).where(eq(cows.id, params.id)).limit(1)

  if (!cow) {
    notFound()
  }

  const [sale] = await db.select().from(sales).where(eq(sales.cowId, cow.id)).limit(1)
  const healthRecs = await db.select().from(cowHealthRecords).where(eq(cowHealthRecords.cowId, cow.id)).orderBy(desc(cowHealthRecords.recordDate))
  const notesList = await db.select().from(cowNotes).where(eq(cowNotes.cowId, cow.id)).orderBy(desc(cowNotes.noteDate))
  const imagesList = await db.select().from(cowImages).where(eq(cowImages.cowId, cow.id)).orderBy(desc(cowImages.createdAt))

  const [mother] = cow.motherId ? await db.select({ id: cows.id, name_or_tag: cows.nameOrTag, gender: cows.gender }).from(cows).where(eq(cows.id, cow.motherId)).limit(1) : []
  const [father] = cow.fatherId ? await db.select({ id: cows.id, name_or_tag: cows.nameOrTag, gender: cows.gender }).from(cows).where(eq(cows.id, cow.fatherId)).limit(1) : []

  const offspringAsMother = await db.select({ id: cows.id, name_or_tag: cows.nameOrTag, gender: cows.gender, status: cows.status }).from(cows).where(eq(cows.motherId, cow.id))
  const offspringAsFather = await db.select({ id: cows.id, name_or_tag: cows.nameOrTag, gender: cows.gender, status: cows.status }).from(cows).where(eq(cows.fatherId, cow.id))

  const cowExpenseMappings = await db.select({
    expenseId: expenseCowMap.expenseId
  }).from(expenseCowMap).where(eq(expenseCowMap.cowId, cow.id))

  let totalAssociatedExpense = 0
  const mappedExpenses = []

  for (const mapping of cowExpenseMappings) {
    const [exp] = await db.select({
      amount: expenses.amount,
      expenseDate: expenses.expenseDate,
      note: expenses.note,
      categoryId: expenses.categoryId
    }).from(expenses).where(eq(expenses.id, mapping.expenseId)).limit(1)

    if (exp) {
      const [cat] = await db.select({ name: expenseCategories.name }).from(expenseCategories).where(eq(expenseCategories.id, exp.categoryId)).limit(1)
      const countRes = await db.select({ count: sql<number>`count(*)` }).from(expenseCowMap).where(eq(expenseCowMap.expenseId, mapping.expenseId))
      const mapCount = Number(countRes[0]?.count || 1)
      const allocatedCost = Number(exp.amount) / mapCount
      totalAssociatedExpense += allocatedCost

      mappedExpenses.push({
        date: exp.expenseDate,
        category: cat?.name || 'Uncategorized',
        totalAmount: Number(exp.amount),
        allocatedCost,
        mapCount,
        note: exp.note
      })
    }
  }

  mappedExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const isSold = cow.status === 'sold' && sale
  const totalCost = Number(cow.purchasePrice) + totalAssociatedExpense
  const revenue = isSold ? Number(sale.salePrice) : 0
  const profit = revenue - totalCost
  const roi = totalCost > 0 ? ((profit / totalCost) * 100).toFixed(1) : '0'

  const vaccines = healthRecs.filter(r => r.recordType === 'vaccine')
  const generalHealth = healthRecs.filter(r => r.recordType !== 'vaccine')

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-4 items-start">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4 w-full">
          <Link href="/dashboard/cows" className="mt-1 sm:mt-0 p-2 shrink-0 rounded-full hover:bg-(--color-surface-high) transition-colors text-(--color-on-surface-variant)">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-display mb-1 truncate">{cow.nameOrTag}</h1>
            <p className="text-(--color-on-surface-variant) text-sm uppercase tracking-wider font-semibold">
              Status: <span className={cow.status === 'active' ? 'text-primary' : cow.status === 'sold' ? 'text-blue-500' : 'text-error'}>{cow.status}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto pl-12 sm:pl-0">
          <Link 
            href={`/dashboard/cows/${cow.id}/edit`}
            className="flex-1 sm:flex-none text-center bg-(--color-surface-lowest) border border-primary text-primary px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary hover:text-white transition-all shadow-sm flex justify-center"
          >
            Edit Profile
          </Link>
          <DeleteCowButton cowId={cow.id} className="flex-1 sm:flex-none" />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="flex flex-col gap-6 md:col-span-1">
          <div className="bg-(--color-surface-lowest) rounded-md shadow-ambient overflow-hidden flex flex-col">
            <div className="aspect-square bg-(--color-surface-high) flex items-center justify-center relative">
              {cow.imageUrl ? (
                <SmartImage src={cow.imageUrl} alt={cow.nameOrTag} fill className="object-cover" sizes="(max-width: 768px) 100vw, 300px" />
              ) : (
                <ImageIcon className="w-12 h-12 text-(--color-on-surface-variant) opacity-50" />
              )}
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div>
                <p className="text-xs text-(--color-on-surface-variant) font-medium uppercase tracking-wider">Source</p>
                <p className="font-bold capitalize">{cow.source || 'Purchased'}</p>
              </div>
              {mother && (
                <div>
                  <p className="text-xs text-(--color-on-surface-variant) font-medium uppercase tracking-wider">Mother (মা)</p>
                  <Link href={`/dashboard/cows/${mother.id}`} className="font-bold text-primary hover:underline">
                    {mother.name_or_tag}
                  </Link>
                </div>
              )}
              {father && (
                <div>
                  <p className="text-xs text-(--color-on-surface-variant) font-medium uppercase tracking-wider">Father (বাবা)</p>
                  <Link href={`/dashboard/cows/${father.id}`} className="font-bold text-primary hover:underline">
                    {father.name_or_tag}
                  </Link>
                </div>
              )}
              <div>
                <p className="text-xs text-(--color-on-surface-variant) font-medium uppercase tracking-wider">Breed (জাত)</p>
                <p className="font-bold">{cow.breed || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-xs text-(--color-on-surface-variant) font-medium uppercase tracking-wider">Category / Gender (শ্রেণী)</p>
                <p className="font-bold">{cow.gender || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-xs text-(--color-on-surface-variant) font-medium uppercase tracking-wider">
                  {cow.source === 'born' ? 'Birth Date' : 'Purchase Date'}
                </p>
                <p className="font-bold">{formatDate(cow.purchaseDate)}</p>
              </div>
              <div>
                <p className="text-xs text-(--color-on-surface-variant) font-medium uppercase tracking-wider">
                  {cow.source === 'born' ? 'Initial Value' : 'Purchase Cost'}
                </p>
                <p className="font-bold text-xl font-display">{formatCurrency(Number(cow.purchasePrice), currencyCode)}</p>
              </div>
            </div>
          </div>

          {/* Offspring / Calves Section */}
          {(offspringAsMother.length > 0 || offspringAsFather.length > 0) && (
            <div className="bg-(--color-surface-lowest) rounded-md shadow-ambient p-6 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-(--color-on-surface-variant) uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Calves / Children ({offspringAsMother.length + offspringAsFather.length})
              </h3>
              <div className="flex flex-col gap-3">
                {[...offspringAsMother, ...offspringAsFather].map((child) => (
                  <Link 
                    key={child.id} 
                    href={`/dashboard/cows/${child.id}`}
                    className="group flex items-center justify-between p-3 rounded-md bg-(--color-surface-low)/50 hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-sm group-hover:text-primary transition-colors">{child.name_or_tag}</span>
                      <span className="text-[10px] text-(--color-on-surface-variant) uppercase font-medium">{child.gender} • {child.status}</span>
                    </div>
                    <ArrowLeft className="w-4 h-4 rotate-180 text-primary opacity-0 group-hover:opacity-100 transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: ROI & Timeline */}
        <div className="flex flex-col gap-6 md:col-span-2">
          
          {/* ROI Card */}
          <div className="bg-(--color-surface-lowest) p-6 rounded-md shadow-ambient border-t-4 border-primary">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Profit & Loss (লাভ/ক্ষতি)
            </h2>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6 mb-6">
              <div>
                <p className="text-xs text-(--color-on-surface-variant) font-medium">Purchase Cost</p>
                <p className="font-bold">{formatCurrency(Number(cow.purchasePrice), currencyCode)}</p>
              </div>
              <div>
                <p className="text-xs text-(--color-on-surface-variant) font-medium">Expenses</p>
                <p className="font-bold">{formatCurrency(totalAssociatedExpense, currencyCode)}</p>
              </div>
              <div>
                <p className="text-xs text-(--color-on-surface-variant) font-medium">Total Cost</p>
                <p className="font-bold">{formatCurrency(totalCost, currencyCode)}</p>
              </div>
              <div>
                <p className="text-xs text-(--color-on-surface-variant) font-medium">Sale Price</p>
                <p className="font-bold text-blue-500">{formatCurrency(revenue, currencyCode)}</p>
              </div>
            </div>

            <div className="p-4 rounded-md bg-(--color-surface-high) flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="text-xs text-(--color-on-surface-variant) font-medium uppercase tracking-wider">Net Profit / Loss</p>
                <p className={`text-3xl font-bold font-display ${isSold ? (profit >= 0 ? 'text-primary' : 'text-error') : 'text-(--color-on-background)'}`}>
                  {isSold ? (profit >= 0 ? '+' : '') + formatCurrency(profit, currencyCode) : 'Pending Sale'}
                </p>
              </div>
              {isSold && (
                <div className="text-right">
                  <p className="text-xs text-(--color-on-surface-variant) font-medium uppercase tracking-wider">Profit Margin</p>
                  <p className={`text-xl font-bold ${profit >= 0 ? 'text-primary' : 'text-error'}`}>
                    {roi}%
                  </p>
                </div>
              )}
            </div>
            
            {!isSold && (cow.status === 'active' || cow.status === 'sick') ? (
              <ProjectedROICalculator 
                purchasePrice={Number(cow.purchasePrice)}
                totalExpenses={totalAssociatedExpense}
                currency={currencyCode}
                status={cow.status as any}
              />
            ) : (
              !isSold && (
                <div className="mt-4 flex items-start gap-3 p-3 bg-blue-500/10 text-blue-500 rounded-md text-sm">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <p>To realize profit, you can record a sale for this cattle from the <Link href="/dashboard/sales/add" className="font-bold underline">Sales page</Link>.</p>
                </div>
              )
            )}
          </div>

          {/* Timeline */}
          <div className="bg-(--color-surface-lowest) p-6 rounded-md shadow-ambient">
            <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-(--color-on-surface-variant)" />
              Expense Timeline (খরচের বিবরণ)
            </h2>

            {mappedExpenses.length === 0 ? (
              <p className="text-sm text-(--color-on-surface-variant) italic text-center py-4">No expenses have been allocated to this cow yet.</p>
            ) : (
              <div className="relative border-l-2 border-(--color-surface-high) ml-3 flex flex-col gap-6 pb-4">
                {mappedExpenses.map((exp, idx) => (
                  <div key={idx} className="relative pl-6">
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-error border-4 border-(--color-surface-lowest)"></div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                      <div>
                        <p className="font-bold">{exp.category}</p>
                        <p className="text-xs text-(--color-on-surface-variant)">{formatDate(exp.date)}</p>
                        {exp.note && <p className="text-sm text-(--color-on-surface-variant) mt-1">{exp.note}</p>}
                      </div>
                      <div className="text-left sm:text-right mt-2 sm:mt-0">
                        <p className="font-bold text-error">-{formatCurrency(exp.allocatedCost, currencyCode)}</p>
                        {exp.mapCount > 1 && (
                          <p className="text-xs text-(--color-on-surface-variant)">
                            (Shared 1/{exp.mapCount} of {formatCurrency(exp.totalAmount, currencyCode)})
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Growth Timeline Gallery */}
      <GrowthTimeline cowId={cow.id} images={imagesList.map(img => ({ ...img, created_at: img.createdAt ? img.createdAt.toISOString() : null, image_url: img.imageUrl }))} />

      {/* Family Tree */}
      <FamilyTree 
        cow={{ id: cow.id, name_or_tag: cow.nameOrTag, gender: cow.gender }}
        mother={mother}
        father={father}
        offspring={[...offspringAsMother, ...offspringAsFather]}
      />

      {/* Health & Medical Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
        <div className="bg-(--color-surface-lowest) p-6 rounded-md shadow-ambient">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Syringe className="w-5 h-5 text-emerald-500" />
              Vaccination Records (টিকা রেকর্ড)
            </h2>
          </div>

          {vaccines.length === 0 ? (
            <p className="text-sm text-(--color-on-surface-variant) italic pb-4">No vaccination records found.</p>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
              {vaccines.map(record => (
                <HealthRecordItem key={record.id} record={{ ...record, record_type: record.recordType, record_date: record.recordDate, next_date: record.nextDate }} cowId={cow.id} />
              ))}
            </div>
          )}
        </div>

        <div className="bg-(--color-surface-lowest) p-6 rounded-md shadow-ambient">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-500" />
              Health & Medicine (চিকিৎসা ও ওষুধ)
            </h2>
          </div>

          {generalHealth.length === 0 ? (
            <p className="text-sm text-(--color-on-surface-variant) italic pb-4">No health or medicine records found.</p>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
              {generalHealth.map(record => (
                <HealthRecordItem key={record.id} record={{ ...record, record_type: record.recordType, record_date: record.recordDate, next_date: record.nextDate }} cowId={cow.id} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center -mt-2 mb-2">
         <HealthRecordModal cowId={cow.id} />
      </div>

      {/* Notes Section */}
      <div className="bg-(--color-surface-lowest) p-6 rounded-md shadow-ambient mb-8">
        <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
          <StickyNote className="w-5 h-5 text-(--color-on-surface-variant)" />
          Notes & Reminders (নোট ও রিমাইন্ডার)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <NoteModal cowId={cow.id} />
          {notesList.map(note => (
            <NoteItem key={note.id} note={{ ...note, note_date: note.noteDate }} cowId={cow.id} />
          ))}
        </div>
      </div>
    </div>
  )
}
