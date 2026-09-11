import { db } from '@/db'
import { sales, goats } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { EditSaleForm } from './EditSaleForm'

export default async function EditSalePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params

  const [sale] = await db.select({
    id: sales.id,
    sale_price: sales.salePrice,
    sale_date: sales.saleDate,
    note: sales.note,
    goatName: goats.nameOrTag
  })
    .from(sales)
    .leftJoin(goats, eq(sales.goatId, goats.id))
    .where(eq(sales.id, params.id))
    .limit(1)

  if (!sale) {
    notFound()
  }

  const mappedSale = {
    ...sale,
    sale_price: Number(sale.sale_price),
    goats: { name_or_tag: sale.goatName || 'Unknown' }
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      <EditSaleForm sale={mappedSale as any} />
    </div>
  )
}
