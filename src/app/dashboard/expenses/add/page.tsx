import { createClient } from '@/utils/supabase/server'
import { AddExpenseForm } from './AddExpenseForm'

export default async function AddExpensePage() {
  const supabase = await createClient()

  // Fetch categories
  const { data: categories } = await supabase
    .from('expense_categories')
    .select('*')
    .order('name')

  // Fetch active goats
  const { data: goats } = await supabase
    .from('goats')
    .select('id, name_or_tag')
    .in('status', ['active', 'sick'])
    .order('name_or_tag')

  // Fetch owners
  const { data: owners } = await supabase
    .from('owners')
    .select('id, name, share_percentage')
    .order('name')

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      <AddExpenseForm 
        categories={categories || []} 
        goats={goats || []} 
        owners={owners || []}
      />
    </div>
  )
}
