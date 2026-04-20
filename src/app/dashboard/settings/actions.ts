'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteCategory(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('expense_categories').delete().eq('id', id)
  if (error) throw new Error('Failed to delete category. It may be used by an expense.')
  revalidatePath('/dashboard/settings')
}

export async function exportUserData() {
  const supabase = await createClient()

  const tables = [
    'owners',
    'goats',
    'expense_categories',
    'expenses',
    'expense_goat_map',
    'sales',
    'owner_contributions'
  ]

  const results = await Promise.all(
    tables.map(table => supabase.from(table as any).select('*'))
  )

  const data: Record<string, unknown> = {}
  results.forEach((result, index) => {
    if (result.error) throw new Error(`Failed to fetch ${tables[index]}`)
    data[tables[index]] = result.data
  })

  return {
    version: '1.0',
    exported_at: new Date().toISOString(),
    data
  }
}

export async function triggerRestore(backupData: { data: Record<string, unknown> }) {
  const supabase = await createClient()
  
  // Call the atomic restore RPC
  const { error } = await supabase.rpc('restore_user_data', { 
    backup_data: backupData.data as any
  })

  if (error) {
    console.error('Restore error:', error)
    throw new Error(error.message || 'Failed to restore data.')
  }

  revalidatePath('/dashboard')
  return { success: true }
}
