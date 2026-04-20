'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function addCategory(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const name = formData.get('name') as string

  const { error } = await supabase.from('expense_categories').insert({
    user_id: user.id,
    name: name.trim()
  })

  if (error) {
    console.error('Error adding category:', error)
    throw new Error('Failed to add category')
  }

  revalidatePath('/dashboard/expenses')
  revalidatePath('/dashboard/settings')
}

export async function addExpense(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const categoryId = formData.get('category_id') as string
  const amount = parseFloat(formData.get('amount') as string)
  const expenseDate = formData.get('expense_date') as string
  const note = formData.get('note') as string
  const paidAmount = parseFloat(formData.get('paid_amount') as string) || 0
  const dueAmount = parseFloat(formData.get('due_amount') as string) || 0
  const paymentStatus = formData.get('payment_status') as string
  const goatIds = formData.getAll('goat_ids') as string[]
  const ownerContributions = JSON.parse(formData.get('owner_contributions') as string || '[]')

  // @ts-ignore - Custom RPC function not yet in generated types
  const { error } = await supabase.rpc('add_expense_with_mappings', {
    p_user_id: user.id,
    p_amount: amount,
    p_category_id: categoryId,
    p_expense_date: expenseDate,
    p_note: note || null,
    p_paid_amount: paidAmount,
    p_due_amount: dueAmount,
    p_payment_status: paymentStatus,
    p_goat_ids: goatIds,
    p_owner_contributions: ownerContributions
  })

  if (error) {
    console.error('Error adding expense via RPC:', error)
    throw new Error('Failed to add expense: ' + error.message)
  }

  revalidatePath('/dashboard/expenses')
  redirect('/dashboard/expenses')
}

export async function updateExpense(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const categoryId = formData.get('category_id') as string
  const amount = parseFloat(formData.get('amount') as string)
  const expenseDate = formData.get('expense_date') as string
  const note = formData.get('note') as string
  const paidAmount = parseFloat(formData.get('paid_amount') as string) || 0
  const dueAmount = parseFloat(formData.get('due_amount') as string) || 0
  const paymentStatus = formData.get('payment_status') as string
  const goatIds = formData.getAll('goat_ids') as string[]
  const ownerContributions = JSON.parse(formData.get('owner_contributions') as string || '[]')

  // @ts-ignore - Custom RPC function not yet in generated types
  const { error } = await supabase.rpc('update_expense_with_mappings', {
    p_expense_id: id,
    p_user_id: user.id,
    p_amount: amount,
    p_category_id: categoryId,
    p_expense_date: expenseDate,
    p_note: note || null,
    p_paid_amount: paidAmount,
    p_due_amount: dueAmount,
    p_payment_status: paymentStatus,
    p_goat_ids: goatIds,
    p_owner_contributions: ownerContributions
  })

  if (error) {
    console.error('Error updating expense via RPC:', error)
    throw new Error('Failed to update expense: ' + error.message)
  }

  revalidatePath('/dashboard/expenses')
  redirect('/dashboard/expenses')
}

export async function deleteExpense(id: string) {
  const supabase = await createClient()
  
  // No complex logic needed here because DB cascade handles mappings and contributions
  const { error } = await supabase.from('expenses').delete().eq('id', id)

  if (error) {
    throw new Error('Failed to delete expense')
  }

  revalidatePath('/dashboard/expenses')
}

export async function markAsPaid(id: string, amount: number) {
  const supabase = await createClient()
  
  // When marking as fully paid, we need to:
  // 1. Update expense status to 'paid'
  // 2. Set paid_amount = amount, due_amount = 0
  // 3. BUT we need to know WHICH owner paid. 
  // For the quick action, we assume the user will handle splits properly in the Edit page.
  // This quick action is mostly for non-partnered farms or simple "Settled" markers.
  
  const { error } = await supabase.from('expenses').update({
    paid_amount: amount,
    due_amount: 0,
    payment_status: 'paid'
  } as any).eq('id', id)

  if (error) throw new Error('Failed to mark as paid')
  revalidatePath('/dashboard/expenses')
}
