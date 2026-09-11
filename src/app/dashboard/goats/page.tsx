import { db } from '@/db'
import { goats, profiles } from '@/db/schema'
import { eq, and, inArray, ilike, desc } from 'drizzle-orm'
import { auth } from '@/auth'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'
import { GoatSearch } from './GoatSearch'
import { GoatFilter } from './GoatFilter'
import { formatCurrency, formatDate } from '@/utils/format'
import { SmartImage } from '@/components/SmartImage'

export default async function GoatsPage(props: {
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

  const conditions = userId ? [eq(goats.userId, userId)] : []

  if (searchParams.q) {
    conditions.push(ilike(goats.nameOrTag, `%${searchParams.q}%`))
  }

  if (currentStatus === 'current') {
    conditions.push(inArray(goats.status, ['active', 'sick']))
  } else if (currentStatus === 'archived') {
    conditions.push(inArray(goats.status, ['sold', 'dead', 'archived']))
  } else if (currentStatus !== 'all') {
    conditions.push(eq(goats.status, currentStatus as any))
  }

  const goatsList = userId
    ? await db.select().from(goats).where(and(...conditions)).orderBy(desc(goats.createdAt))
    : []

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-display mb-1">Goat Roster</h1>
          <p className="text-(--color-on-surface-variant) text-sm">Manage your goats, track status, and view details.</p>
        </div>
        <Link 
          href="/dashboard/goats/add" 
          className="bg-gradient-primary text-(--color-on-primary) px-4 py-2 rounded-full font-semibold flex items-center gap-2 shadow-ambient hover:opacity-90 transition-opacity"
        >
          <PlusCircle className="w-5 h-5" />
          Add Goat
        </Link>
      </header>

      <div className="flex flex-col gap-4">
        <div className="bg-(--color-surface-lowest) p-2 rounded-md shadow-ambient">
          <GoatSearch />
        </div>
        <GoatFilter />
      </div>

      {goatsList.length === 0 ? (
        <div className="bg-(--color-surface-lowest) rounded-md shadow-ambient p-12 text-center flex flex-col items-center gap-4 mt-4">
          <div className="w-16 h-16 bg-(--color-surface-high) rounded-full flex items-center justify-center">
            <PlusCircle className="w-8 h-8 text-(--color-on-surface-variant)" />
          </div>
          <div>
            <h3 className="font-bold text-lg">No goats found</h3>
            <p className="text-(--color-on-surface-variant) text-sm">Try adjusting your search or filters, or add a new goat.</p>
          </div>
          {(searchParams.q || searchParams.status) && (
             <Link href="/dashboard/goats" className="text-primary font-semibold hover:underline text-sm">
               Clear all filters
             </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
          {goatsList.map((goat) => (
            <Link href={`/dashboard/goats/${goat.id}`} key={goat.id} className="bg-(--color-surface-lowest) rounded-md shadow-ambient overflow-hidden hover:shadow-lg transition-shadow group flex flex-col border border-transparent hover:border-primary/20">
              <div className="aspect-[4/3] bg-(--color-surface-high) relative overflow-hidden">
                {goat.imageUrl ? (
                  <SmartImage 
                    src={goat.imageUrl} 
                    alt={goat.nameOrTag} 
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
                  goat.status === 'active' ? 'bg-green-600' :
                  goat.status === 'sold' ? 'bg-blue-600' :
                  goat.status === 'sick' ? 'bg-amber-500' :
                  goat.status === 'archived' ? 'bg-gray-600' :
                  'bg-red-600'
                }`}>
                  {goat.status}
                </div>
              </div>
              <div className="p-4 flex flex-col gap-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg text-(--color-on-background)">{goat.nameOrTag}</h3>
                  <span className="text-xs text-(--color-on-surface-variant) bg-(--color-surface-high) px-2 py-0.5 rounded">
                    {goat.gender}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-(--color-on-surface-variant)">
                  <p>{goat.breed || 'Unknown breed'}</p>
                  <p>{formatDate(goat.purchaseDate)}</p>
                </div>
                <div className="mt-3 pt-3 border-t border-(--color-surface-high) flex justify-between items-center">
                  <span className="text-[10px] text-(--color-on-surface-variant) uppercase tracking-widest font-bold">Cost</span>
                  <span className="font-bold text-(--color-on-background)">{formatCurrency(Number(goat.purchasePrice), currencyCode)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
