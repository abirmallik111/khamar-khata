import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, TrendingUp, AlertTriangle, FileText, Image as ImageIcon, Activity, Syringe, StickyNote, Calendar } from 'lucide-react'
import { HealthRecordModal } from './HealthRecordModal'
import { NoteModal } from './NoteModal'
import { HealthRecordItem } from './HealthRecordItem'
import { NoteItem } from './NoteItem'
import { DeleteGoatButton } from './DeleteGoatButton'
import { ProjectedROICalculator } from '@/components/ProjectedROICalculator'
import { FamilyTree } from './FamilyTree'
import { GrowthTimeline } from './GrowthTimeline'
import { SmartImage } from '@/components/SmartImage'
import { notFound } from 'next/navigation'
import { formatCurrency, formatDate } from '@/utils/format'

export default async function GoatProfilePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient()

  // Fetch goat details
  const { data: goat, error: goatError } = await supabase
    .from('goats')
    .select(`
      *,
      sales (sale_price, sale_date, note),
      goat_health_records (*),
      goat_notes (*),
      goat_images (*),
      mother:mother_id (id, name_or_tag),
      father:father_id (id, name_or_tag),
      offspring_as_mother:goats!mother_id (id, name_or_tag, gender, status),
      offspring_as_father:goats!father_id (id, name_or_tag, gender, status)
    `)
    .eq('id', params.id)
    .single()

  // Fetch User's Currency Preference
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('currency')
    .eq('id', user!.id)
    .single()
  
  const currencyCode = (profile?.currency || 'BDT') as any

  if (goatError || !goat) {
    notFound()
  }

  // Fetch expenses related to this goat
  const { data: goatExpenses } = await supabase
    .from('expense_goat_map')
    .select(`
      expenses (
        amount, 
        expense_date, 
        note, 
        expense_categories(name),
        expense_goat_map(count)
      )
    `)
    .eq('goat_id', goat.id)

  // Calculate individual ROI
  let totalAssociatedExpense = 0
  
  const mappedExpenses = goatExpenses?.map(mapping => {
    const exp = mapping.expenses as { amount: number; expense_date: string; note: string | null; expense_categories: { name: string } | null; expense_goat_map: { count: number }[] }
    // If an expense is mapped to multiple goats, we divide the cost equally
    const mapCount = exp.expense_goat_map?.[0]?.count || 1
    const allocatedCost = exp.amount / mapCount
    totalAssociatedExpense += allocatedCost
    
    return {
      date: exp.expense_date,
      category: exp.expense_categories?.name || 'Uncategorized',
      totalAmount: exp.amount,
      allocatedCost: allocatedCost,
      mapCount: mapCount,
      note: exp.note
    }
  }) || []

  // Sort expenses by date desc
  mappedExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const sale = goat.sales as { sale_price: number; sale_date: string; note: string | null } | null
  const isSold = goat.status === 'sold' && sale
  const totalCost = goat.purchase_price + totalAssociatedExpense
  const revenue = isSold ? sale.sale_price : 0
  const profit = revenue - totalCost
  const roi = totalCost > 0 ? ((profit / totalCost) * 100).toFixed(1) : 0

  // Group health records
  const healthRecords = (goat.goat_health_records || []) as any[]
  // Sort records by date descending
  healthRecords.sort((a, b) => new Date(b.record_date).getTime() - new Date(a.record_date).getTime())
  
  const vaccines = healthRecords.filter(r => r.record_type === 'vaccine')
  const generalHealth = healthRecords.filter(r => r.record_type !== 'vaccine')

  // Sort notes by date descending
  const notes = (goat.goat_notes || []) as any[]
  notes.sort((a, b) => new Date(b.note_date).getTime() - new Date(a.note_date).getTime())

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-4 items-start">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4 w-full">
          <Link href="/dashboard/goats" className="mt-1 sm:mt-0 p-2 shrink-0 rounded-full hover:bg-(--color-surface-high) transition-colors text-(--color-on-surface-variant)">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-display mb-1 truncate">{goat.name_or_tag}</h1>
            <p className="text-(--color-on-surface-variant) text-sm uppercase tracking-wider font-semibold">
              Status: <span className={goat.status === 'active' ? 'text-primary' : goat.status === 'sold' ? 'text-blue-500' : 'text-error'}>{goat.status}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto pl-12 sm:pl-0">
          <Link 
            href={`/dashboard/goats/${goat.id}/edit`}
            className="flex-1 sm:flex-none text-center bg-(--color-surface-lowest) border border-primary text-primary px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary hover:text-white transition-all shadow-sm flex justify-center"
          >
            Edit Profile
          </Link>
          <DeleteGoatButton goatId={goat.id} className="flex-1 sm:flex-none" />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Image and Basic Details */}
        <div className="flex flex-col gap-6 md:col-span-1">
          <div className="bg-(--color-surface-lowest) rounded-md shadow-ambient overflow-hidden flex flex-col">
            <div className="aspect-square bg-(--color-surface-high) flex items-center justify-center relative">
              {goat.image_url ? (
                <SmartImage src={goat.image_url} alt={goat.name_or_tag} fill className="object-cover" sizes="(max-width: 768px) 100vw, 300px" />
              ) : (
                <ImageIcon className="w-12 h-12 text-(--color-on-surface-variant) opacity-50" />
              )}
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div>
                <p className="text-xs text-(--color-on-surface-variant) font-medium uppercase tracking-wider">Source</p>
                <p className="font-bold capitalize">{(goat as any).source || 'Purchased'}</p>
              </div>
              {(goat as any).mother && (
                <div>
                  <p className="text-xs text-(--color-on-surface-variant) font-medium uppercase tracking-wider">Mother (Dam)</p>
                  <Link href={`/dashboard/goats/${(goat as any).mother.id}`} className="font-bold text-primary hover:underline">
                    {(goat as any).mother.name_or_tag}
                  </Link>
                </div>
              )}
              {(goat as any).father && (
                <div>
                  <p className="text-xs text-(--color-on-surface-variant) font-medium uppercase tracking-wider">Father (Sire)</p>
                  <Link href={`/dashboard/goats/${(goat as any).father.id}`} className="font-bold text-primary hover:underline">
                    {(goat as any).father.name_or_tag}
                  </Link>
                </div>
              )}
              <div>
                <p className="text-xs text-(--color-on-surface-variant) font-medium uppercase tracking-wider">Breed</p>
                <p className="font-bold">{goat.breed || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-xs text-(--color-on-surface-variant) font-medium uppercase tracking-wider">Gender</p>
                <p className="font-bold">{goat.gender || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-xs text-(--color-on-surface-variant) font-medium uppercase tracking-wider">
                  {(goat as any).source === 'born' ? 'Birth Date' : 'Purchase Date'}
                </p>
                <p className="font-bold">{formatDate(goat.purchase_date)}</p>
              </div>
              <div>
                <p className="text-xs text-(--color-on-surface-variant) font-medium uppercase tracking-wider">
                  {(goat as any).source === 'born' ? 'Initial Value' : 'Purchase Cost'}
                </p>
                <p className="font-bold text-xl font-display">{formatCurrency(goat.purchase_price, currencyCode)}</p>
              </div>
            </div>
          </div>

          {/* Offspring Section */}
          {((goat as any).offspring_as_mother?.length > 0 || (goat as any).offspring_as_father?.length > 0) && (
            <div className="bg-(--color-surface-lowest) rounded-md shadow-ambient p-6 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-(--color-on-surface-variant) uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Offspring ({((goat as any).offspring_as_mother?.length || 0) + ((goat as any).offspring_as_father?.length || 0)})
              </h3>
              <div className="flex flex-col gap-3">
                {[...(goat as any).offspring_as_mother || [], ...(goat as any).offspring_as_father || []].map((child: any) => (
                  <Link 
                    key={child.id} 
                    href={`/dashboard/goats/${child.id}`}
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

        {/* Right Column: ROI and Timeline */}
        <div className="flex flex-col gap-6 md:col-span-2">
          
          {/* ROI Card */}
          <div className="bg-(--color-surface-lowest) p-6 rounded-md shadow-ambient border-t-4 border-primary">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Return on Investment
            </h2>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6 mb-6">
              <div>
                <p className="text-xs text-(--color-on-surface-variant) font-medium">Purchase</p>
                <p className="font-bold">{formatCurrency(goat.purchase_price, currencyCode)}</p>
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
                <p className="text-xs text-(--color-on-surface-variant) font-medium">Revenue</p>
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
                  <p className="text-xs text-(--color-on-surface-variant) font-medium uppercase tracking-wider">ROI Margin</p>
                  <p className={`text-xl font-bold ${profit >= 0 ? 'text-primary' : 'text-error'}`}>
                    {roi}%
                  </p>
                </div>
              )}
            </div>
            
            {!isSold && (goat.status === 'active' || goat.status === 'sick') ? (
              <ProjectedROICalculator 
                purchasePrice={goat.purchase_price}
                totalExpenses={totalAssociatedExpense}
                currency={currencyCode}
                status={goat.status as any}
              />
            ) : (
              !isSold && (
                <div className="mt-4 flex items-start gap-3 p-3 bg-blue-500/10 text-blue-500 rounded-md text-sm">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <p>To realize profit, you must record a sale for this goat from the <Link href="/dashboard/sales/add" className="font-bold underline">Sales page</Link>.</p>
                </div>
              )
            )}
          </div>

          {/* Timeline */}
          <div className="bg-(--color-surface-lowest) p-6 rounded-md shadow-ambient">
            <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-(--color-on-surface-variant)" />
              Expense Timeline
            </h2>

            {mappedExpenses.length === 0 ? (
              <p className="text-sm text-(--color-on-surface-variant) italic text-center py-4">No expenses have been allocated to this goat yet.</p>
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
      <GrowthTimeline goatId={goat.id} images={(goat as any).goat_images || []} />

      {/* Genetic Lineage Visualization */}
      <FamilyTree 
        goat={{ id: goat.id, name_or_tag: goat.name_or_tag, gender: goat.gender }}
        mother={(goat as any).mother}
        father={(goat as any).father}
        offspring={[...(goat as any).offspring_as_mother || [], ...(goat as any).offspring_as_father || []]}
      />

      {/* Health & Medical Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
        
        {/* Vaccines */}
        <div className="bg-(--color-surface-lowest) p-6 rounded-md shadow-ambient">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Syringe className="w-5 h-5 text-emerald-500" />
              Vaccination Records
            </h2>
          </div>

          {vaccines.length === 0 ? (
            <p className="text-sm text-(--color-on-surface-variant) italic pb-4">No vaccination records found.</p>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
              {vaccines.map(record => (
                <HealthRecordItem key={record.id} record={record} goatId={goat.id} />
              ))}
            </div>
          )}
        </div>

        {/* General Health & Medicine */}
        <div className="bg-(--color-surface-lowest) p-6 rounded-md shadow-ambient">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-500" />
              Health & Medicine
            </h2>
          </div>

          {generalHealth.length === 0 ? (
            <p className="text-sm text-(--color-on-surface-variant) italic pb-4">No health or medicine records found.</p>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
              {generalHealth.map(record => (
                <HealthRecordItem key={record.id} record={record} goatId={goat.id} />
              ))}
            </div>
          )}
        </div>

      </div>

      <div className="flex justify-center -mt-2 mb-2">
         <HealthRecordModal goatId={goat.id} />
      </div>

      {/* Notes Section */}
      <div className="bg-(--color-surface-lowest) p-6 rounded-md shadow-ambient mb-8">
        <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
          <StickyNote className="w-5 h-5 text-(--color-on-surface-variant)" />
          Notes & Reminders
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <NoteModal goatId={goat.id} />
          
          {notes.map(note => (
            <NoteItem key={note.id} note={note} goatId={goat.id} />
          ))}
        </div>
      </div>
    </div>
  )
}
