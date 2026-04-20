import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { EditExpenseForm } from './EditExpenseForm'

export default async function EditExpensePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient()

  // 1. Fetch the expense
  const { data: expense } = await supabase
    .from('expenses')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!expense) notFound()

  // 2. Fetch categories
  const { data: categories } = await supabase
    .from('expense_categories')
    .select('*')
    .order('name')

  // 3. Fetch goats
  const { data: goats } = await supabase
    .from('goats')
    .select('id, name_or_tag')
    .in('status', ['active', 'sick', 'archived'])
    .order('name_or_tag')

  // 4. Fetch owners
  const { data: owners } = await supabase
    .from('owners')
    .select('id, name, share_percentage')
    .order('name')

  // 5. Fetch current mappings
  const { data: currentGoatIds } = await supabase
    .from('expense_goat_map')
    .select('goat_id')
    .eq('expense_id', expense.id)

  // 6. Fetch current contributions
  const { data: currentContributions } = await supabase
    .from('owner_contributions')
    .select('owner_id, amount')
    .eq('expense_id', expense.id)

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      <EditExpenseForm 
        expense={expense}
        categories={categories || []}
        goats={goats || []}
        owners={owners || []}
        initialGoatIds={currentGoatIds?.map(m => m.goat_id) || []}
        initialContributions={currentContributions || []}
      />
    </div>
  )
}
