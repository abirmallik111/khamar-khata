import { db } from '@/db'
import { cows, profiles } from '@/db/schema'
import { eq, and, inArray, ilike, desc } from 'drizzle-orm'
import { auth } from '@/auth'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'
import { CowIcon } from '@/components/icons/AnimalIcons'
import { CowSearch } from './CowSearch'
import { CowFilter } from './CowFilter'
import { formatCurrency, formatDate } from '@/utils/format'
import { SmartImage } from '@/components/SmartImage'

export default async function CowsPage(props: {
  searchParams: Promise<{ q?: string; status?: string }>
}) {
  const searchParams = await props.searchParams
  const session = await auth()
  let userId = session?.user?.id

  if (!userId) {
    const [firstUser] = await db.select().from(profiles).limit(1)
    if (firstUser) userId = firstUser.id
  }

  const [profile] = userId ? await db.select({ currency: profiles.currency }).from(profiles).where(eq(profiles.id, userId)).limit(1) : []
  const currencyCode = (profile?.currency || 'BDT') as any

  const currentStatus = searchParams.status || 'current'

  const conditions = userId ? [eq(cows.userId, userId)] : []

  if (searchParams.q) {
    conditions.push(ilike(cows.nameOrTag, `%${searchParams.q}%`))
  }

  if (currentStatus === 'current') {
    conditions.push(inArray(cows.status, ['active', 'sick']))
  } else if (currentStatus === 'archived') {
    conditions.push(inArray(cows.status, ['sold', 'dead', 'archived']))
  } else if (currentStatus !== 'all') {
    conditions.push(eq(cows.status, currentStatus as any))
  }

  const cowsList = userId
    ? await db.select().from(cows).where(and(...conditions)).orderBy(desc(cows.createdAt))
    : []

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CowIcon size={28} className="text-primary" />
            <h1 className="text-3xl font-bold tracking-tight font-display">Cows</h1>
          </div>
          <p className="text-(--color-on-surface-variant) text-sm">Manage your cows, see details, and track growth.</p>
        </div>
        <Link 
          href="/dashboard/cows/add" 
          className="bg-gradient-primary text-(--color-on-primary) px-4 py-2 rounded-full font-semibold flex items-center gap-2 shadow-ambient hover:opacity-90 transition-opacity"
        >
          <PlusCircle className="w-5 h-5" />
          Add Cow
        </Link>
      </header>

      <div className="flex flex-col gap-4">
        <div className="bg-(--color-surface-lowest) p-2 rounded-md shadow-ambient">
          <CowSearch />
        </div>
        <CowFilter />
      </div>

      {cowsList.length === 0 ? (
        <div className="bg-(--color-surface-lowest) rounded-md shadow-ambient p-12 text-center flex flex-col items-center gap-4 mt-4">
          <div className="w-16 h-16 bg-(--color-surface-high) rounded-full flex items-center justify-center">
            <CowIcon size={32} className="text-(--color-on-surface-variant)" />
          </div>
          <div>
            <h3 className="font-bold text-lg">No cows found</h3>
            <p className="text-(--color-on-surface-variant) text-sm">Try adjusting your search or filters, or add a new cow.</p>
          </div>
          {(searchParams.q || searchParams.status) && (
             <Link href="/dashboard/cows" className="text-primary font-semibold hover:underline text-sm">
               Clear all filters
             </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
          {cowsList.map((cow) => (
            <Link href={`/dashboard/cows/${cow.id}`} key={cow.id} className="bg-(--color-surface-lowest) rounded-md shadow-ambient overflow-hidden hover:shadow-lg transition-shadow group flex flex-col border border-transparent hover:border-primary/20">
              <div className="aspect-[4/3] bg-(--color-surface-high) relative overflow-hidden">
                {cow.imageUrl ? (
                  <SmartImage 
                    src={cow.imageUrl} 
                    alt={cow.nameOrTag} 
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-(--color-on-surface-variant) font-medium italic">
                    No Image
                  </div>
                )}
                <div className={`absolute top-5 -right-10 w-40 rotate-45 text-center text-[10px] font-bold uppercase shadow-md py-1.5 text-white z-10 ${
                  cow.status === 'active' ? 'bg-green-600' :
                  cow.status === 'sold' ? 'bg-blue-600' :
                  cow.status === 'sick' ? 'bg-amber-500' :
                  cow.status === 'archived' ? 'bg-gray-600' :
                  'bg-red-600'
                }`}>
                  {cow.status}
                </div>
              </div>
              <div className="p-4 flex flex-col gap-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg text-(--color-on-background)">{cow.nameOrTag}</h3>
                  <span className="text-xs text-(--color-on-surface-variant) bg-(--color-surface-high) px-2 py-0.5 rounded font-medium">
                    {cow.gender || 'Not specified'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-(--color-on-surface-variant)">
                  <p>{cow.breed || 'Unknown breed'}</p>
                  <p>{formatDate(cow.purchaseDate)}</p>
                </div>
                <div className="mt-3 pt-3 border-t border-(--color-surface-high) flex justify-between items-center">
                  <span className="text-[10px] text-(--color-on-surface-variant) uppercase tracking-widest font-bold">Cost</span>
                  <span className="font-bold text-(--color-on-background)">{formatCurrency(Number(cow.purchasePrice), currencyCode)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
