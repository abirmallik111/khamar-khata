import { createClient } from '@/utils/supabase/server'
import { AddGoatForm } from './AddGoatForm'

export default async function AddGoatPage() {
  const supabase = await createClient()

  const { data: owners } = await supabase
    .from('owners')
    .select('id, name, share_percentage')
    .order('name')

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      <AddGoatForm owners={owners || []} />
    </div>
  )
}
