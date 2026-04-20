import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { EditSaleForm } from './EditSaleForm'
import { Sale, Goat } from '@/types'

export default async function EditSalePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient()

  const { data: sale, error } = await supabase
    .from('sales')
    .select(`
      *,
      goats (name_or_tag)
    `)
    .eq('id', params.id)
    .single()

  if (error || !sale) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      <EditSaleForm sale={sale as Sale & { goats: Pick<Goat, 'name_or_tag'> | null }} />
    </div>
  )
}
