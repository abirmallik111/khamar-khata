'use server'

import { db } from '@/db'
import { expenseCategories, expenses, profiles } from '@/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function getAuthUser(): Promise<{ id: string }> {
  const session = await auth()
  if (session?.user?.id) {
    return { id: session.user.id }
  }
  const [firstUser] = await db.select().from(profiles).limit(1)
  if (firstUser) return { id: firstUser.id }
  throw new Error('Not authenticated')
}

export async function addCategory(formData: FormData) {
  const user = await getAuthUser()
  const name = formData.get('name') as string

  await db.insert(expenseCategories).values({
    userId: user.id,
    name: name.trim()
  })

  revalidatePath('/dashboard/expenses')
  revalidatePath('/dashboard/settings')
}

export async function addExpense(formData: FormData) {
  const user = await getAuthUser()

  const categoryId = formData.get('category_id') as string
  const amount = parseFloat(formData.get('amount') as string)
  const expenseDate = formData.get('expense_date') as string
  const note = (formData.get('note') as string) || ''
  const paidAmount = parseFloat(formData.get('paid_amount') as string) || 0
  const dueAmount = parseFloat(formData.get('due_amount') as string) || 0
  const paymentStatus = formData.get('payment_status') as string
  const goatIds = formData.getAll('goat_ids') as string[]
  const ownerContributions = JSON.parse(formData.get('owner_contributions') as string || '[]')

  await db.execute(sql`
    SELECT add_expense_with_mappings(
      ${user.id}::uuid,
      ${amount}::numeric,
      ${categoryId}::uuid,
      ${expenseDate}::date,
      ${note},
      ${paidAmount}::numeric,
      ${dueAmount}::numeric,
      ${paymentStatus},
      ${goatIds}::uuid[],
      ${JSON.stringify(ownerContributions)}::jsonb
    )
  `)

  revalidatePath('/dashboard/expenses')
  redirect('/dashboard/expenses')
}

export async function updateExpense(id: string, formData: FormData) {
  const user = await getAuthUser()

  const categoryId = formData.get('category_id') as string
  const amount = parseFloat(formData.get('amount') as string)
  const expenseDate = formData.get('expense_date') as string
  const note = (formData.get('note') as string) || ''
  const paidAmount = parseFloat(formData.get('paid_amount') as string) || 0
  const dueAmount = parseFloat(formData.get('due_amount') as string) || 0
  const paymentStatus = formData.get('payment_status') as string
  const goatIds = formData.getAll('goat_ids') as string[]
  const ownerContributions = JSON.parse(formData.get('owner_contributions') as string || '[]')

  await db.execute(sql`
    SELECT update_expense_with_mappings(
      ${id}::uuid,
      ${user.id}::uuid,
      ${amount}::numeric,
      ${categoryId}::uuid,
      ${expenseDate}::date,
      ${note},
      ${paidAmount}::numeric,
      ${dueAmount}::numeric,
      ${paymentStatus},
      ${goatIds}::uuid[],
      ${JSON.stringify(ownerContributions)}::jsonb
    )
  `)

  revalidatePath('/dashboard/expenses')
  redirect('/dashboard/expenses')
}

export async function deleteExpense(id: string) {
  const user = await getAuthUser()
  await db.delete(expenses).where(and(eq(expenses.id, id), eq(expenses.userId, user.id)))
  revalidatePath('/dashboard/expenses')
}

export async function markAsPaid(id: string, amount: number) {
  const user = await getAuthUser()

  await db.update(expenses).set({
    paidAmount: amount.toString(),
    dueAmount: '0',
    paymentStatus: 'paid'
  }).where(and(eq(expenses.id, id), eq(expenses.userId, user.id)))

  revalidatePath('/dashboard/expenses')
}
