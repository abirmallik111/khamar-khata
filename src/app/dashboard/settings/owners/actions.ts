'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addOwner(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const name = formData.get('name') as string
  const sharePercentage = parseFloat(formData.get('share_percentage') as string)

  if (sharePercentage <= 0 || sharePercentage > 100) {
    throw new Error('Share percentage must be between 0 and 100.')
  }

  // Fetch existing owners to validate total share
  const { data: existingOwners } = await supabase
    .from('owners')
    .select('share_percentage')

  const currentTotal = existingOwners?.reduce((sum, o) => sum + Number(o.share_percentage), 0) || 0

  if (currentTotal + sharePercentage > 100) {
    throw new Error(`Total share cannot exceed 100%. Current total is ${currentTotal}%, you can add at most ${100 - currentTotal}%.`)
  }

  const { error } = await supabase.from('owners').insert({
    user_id: user.id,
    name: name.trim(),
    share_percentage: sharePercentage
  })

  if (error) {
    console.error('Error adding owner:', error)
    throw new Error('Failed to add owner.')
  }

  revalidatePath('/dashboard/settings/owners')
}

export async function deleteOwner(id: string) {
  const supabase = await createClient()

  // First check if owner has contributions. If so, restrict deletion or handle it.
  // For MVP, just attempt delete, Supabase will throw foreign key error if contributions exist.
  const { error } = await supabase.from('owners').delete().eq('id', id)

  if (error) {
    console.error('Error deleting owner:', error)
    throw new Error('Cannot delete owner. They may have associated contributions.')
  }

  revalidatePath('/dashboard/settings/owners')
}
