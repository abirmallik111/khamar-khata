import { createClient } from '@/utils/supabase/server'
import { OwnerClientPage } from './OwnerClientPage'

export default async function OwnersPage() {
  const supabase = await createClient()

  // Fetch owners
  const { data: owners } = await supabase
    .from('owners')
    .select('*')
    .order('created_at')

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
      <OwnerClientPage owners={owners || []} />
    </div>
  )
}
