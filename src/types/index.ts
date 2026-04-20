import { Database } from './database.types'

export type GoatStatus = Database['public']['Enums']['goat_status']
export type Owner = Database['public']['Tables']['owners']['Row']
export type Expense = Database['public']['Tables']['expenses']['Row']
export type Category = Database['public']['Tables']['expense_categories']['Row']
export type Sale = Database['public']['Tables']['sales']['Row']
export type Goat = Database['public']['Tables']['goats']['Row']
export type OwnerContribution = Database['public']['Tables']['owner_contributions']['Row']
