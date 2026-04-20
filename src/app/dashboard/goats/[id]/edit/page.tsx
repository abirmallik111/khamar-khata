import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { EditGoatForm } from './EditGoatForm'

export default async function EditGoatPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient()

  const { data: goat, error } = await supabase
    .from('goats')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !goat) {
    notFound()
  }

  const { data: owners } = await supabase
    .from('owners')
    .select('id, name, share_percentage')
    .order('name')

  const { data: contributions } = await supabase
    .from('owner_contributions')
    .select('owner_id, amount')
    .eq('goat_id', params.id)

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      <EditGoatForm 
        goat={goat} 
        owners={owners || []} 
        initialContributions={contributions || []}
      />
    </div>
  )
}
