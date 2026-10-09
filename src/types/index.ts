import { Database } from './database.types'

export type GoatStatus = Database['public']['Enums']['goat_status']
export type CowStatus = 'active' | 'sold' | 'sick' | 'dead' | 'archived'
export type Owner = Database['public']['Tables']['owners']['Row']
export type Expense = Database['public']['Tables']['expenses']['Row']
export type Category = Database['public']['Tables']['expense_categories']['Row']
export type Sale = Database['public']['Tables']['sales']['Row'] & { cow_id?: string | null }
export type Goat = Database['public']['Tables']['goats']['Row']

export type Cow = {
  id: string
  userId?: string
  user_id?: string
  nameOrTag?: string
  name_or_tag?: string
  breed: string | null
  gender: string | null
  purchasePrice?: string | number
  purchase_price?: string | number
  purchaseDate?: string
  purchase_date?: string
  status: CowStatus
  imageUrl?: string | null
  image_url?: string | null
  source: string | null
  motherId?: string | null
  mother_id?: string | null
  fatherId?: string | null
  father_id?: string | null
  createdAt?: Date | string
  created_at?: Date | string
  updatedAt?: Date | string | null
  updated_at?: Date | string | null
}

export type OwnerContribution = Database['public']['Tables']['owner_contributions']['Row'] & { cow_id?: string | null }
export type GoatHealthRecord = Database['public']['Tables']['goat_health_records']['Row']
export type CowHealthRecord = {
  id: string
  userId?: string
  user_id?: string
  cowId?: string
  cow_id?: string
  recordType?: string
  record_type?: string
  recordDate?: string
  record_date?: string
  name: string | null
  notes: string | null
  nextDate?: string | null
  next_date?: string | null
  createdAt?: Date | string
  created_at?: Date | string
}
export type GoatNote = Database['public']['Tables']['goat_notes']['Row']
export type CowNote = {
  id: string
  userId?: string
  user_id?: string
  cowId?: string
  cow_id?: string
  note: string
  noteDate?: string
  note_date?: string
  createdAt?: Date | string
  created_at?: Date | string
}
export type CowImage = {
  id: string
  userId?: string
  user_id?: string
  cowId?: string
  cow_id?: string
  imageUrl?: string
  image_url?: string
  caption: string | null
  createdAt?: Date | string | null
  created_at?: Date | string | null
}
