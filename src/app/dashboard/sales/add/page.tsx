import { createClient } from '@/utils/supabase/server'
import { AddSaleForm } from './AddSaleForm'

export default async function AddSalePage() {
  const supabase = await createClient()

  // Fetch only active/sick goats that can be sold
  const { data: goats } = await supabase
    .from('goats')
    .select('id, name_or_tag, purchase_price')
    .in('status', ['active', 'sick'])
    .order('name_or_tag')

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      <AddSaleForm goats={goats || []} />
    </div>
  )
}
