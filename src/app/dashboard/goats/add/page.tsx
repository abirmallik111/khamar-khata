import { createClient } from '@/utils/supabase/server'
import { AddGoatForm } from './AddGoatForm'

export default async function AddGoatPage() {
  const supabase = await createClient()

  const [
    { data: owners },
    { data: goats }
  ] = await Promise.all([
    supabase.from('owners').select('id, name, share_percentage').order('name'),
    supabase.from('goats').select('id, name_or_tag, gender').in('status', ['active', 'sick']).order('name_or_tag')
  ])

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      <AddGoatForm owners={owners || []} goats={goats || []} />
    </div>
  )
}
