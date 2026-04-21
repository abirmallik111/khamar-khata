'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function addSale(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const goatId = formData.get('goat_id') as string
  const salePrice = parseFloat(formData.get('sale_price') as string)
  const saleDate = formData.get('sale_date') as string
  const note = formData.get('note') as string

  const { error } = await supabase.rpc('add_sale_and_update_goat', {
    p_user_id: user.id,
    p_goat_id: goatId,
    p_sale_price: salePrice,
    p_sale_date: saleDate,
    p_note: note || ''
  })

  if (error) {
    console.error('Error recording sale via RPC:', error)
    if (error.code === '23505') {
      throw new Error('This goat has already been sold.')
    }
    throw new Error('Failed to record sale: ' + error.message)
  }

  revalidatePath('/dashboard/sales')
  revalidatePath('/dashboard/goats')
  revalidatePath(`/dashboard/goats/${goatId}`)
  revalidatePath('/dashboard')
  redirect('/dashboard/sales')
}

export async function updateSale(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const salePrice = parseFloat(formData.get('sale_price') as string)
  const saleDate = formData.get('sale_date') as string
  const note = formData.get('note') as string

  const { error } = await supabase.from('sales').update({
    sale_price: salePrice,
    sale_date: saleDate,
    note: note || null
  }).eq('id', id).eq('user_id', user.id)

  if (error) {
    console.error('Error updating sale:', error)
    throw new Error('Failed to update sale')
  }

  revalidatePath('/dashboard/sales')
  revalidatePath('/dashboard/goats')
  revalidatePath('/dashboard')
  redirect('/dashboard/sales')
}

export async function deleteSale(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.rpc('delete_sale_and_revert_goat', {
    p_sale_id: id,
    p_user_id: user.id
  })

  if (error) {
    console.error('Error deleting sale via RPC:', error)
    throw new Error('Failed to delete sale')
  }

  revalidatePath('/dashboard/sales')
  revalidatePath('/dashboard/goats')
  revalidatePath('/dashboard')
}
