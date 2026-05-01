import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Settings2, Users, Tag, Database, Lock } from 'lucide-react'
import { SettingsClientActions } from './SettingsClientActions'
import { BackupRestoreSection } from './BackupRestoreSection'
import { deleteCategory } from './actions'
import { DeleteCategoryButton } from '@/components/DeleteCategoryButton'
import { ChangePasswordSection } from './ChangePasswordSection'

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('expense_categories')
    .select('*')
    .order('name')

  const { data: owners } = await supabase
    .from('owners')
    .select('id, name, share_percentage')
    .order('created_at')

  const totalShare = owners?.reduce((s, o) => s + Number(o.share_percentage), 0) || 0

  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto w-full">
      <header>
        <h1 className="text-3xl font-bold tracking-tight font-display mb-1">Settings</h1>
        <p className="text-(--color-on-surface-variant) text-sm">Manage your farm preferences and configurations.</p>
      </header>

      {/* Simple Mode Toggle */}
      <section className="bg-(--color-surface-lowest) rounded-md shadow-ambient overflow-hidden">
        <div className="p-6 bg-(--color-surface-high)/30 border-b border-(--color-surface-high) flex items-center gap-3">
          <Settings2 className="w-5 h-5 text-(--color-primary)" />
          <h2 className="font-bold text-lg">Display Preferences</h2>
        </div>
        <div className="p-6">
          <SettingsClientActions />
        </div>
      </section>

      {/* Backup & Restore */}
      <section className="bg-(--color-surface-lowest) rounded-md shadow-ambient overflow-hidden">
        <div className="p-6 bg-(--color-surface-high)/30 border-b border-(--color-surface-high) flex items-center gap-3">
          <Database className="w-5 h-5 text-(--color-primary)" />
          <h2 className="font-bold text-lg">Backup & Restore</h2>
        </div>
        <div className="p-6">
          <BackupRestoreSection />
        </div>
      </section>

      {/* Expense Categories */}
      <section className="bg-(--color-surface-lowest) rounded-md shadow-ambient overflow-hidden">
        <div className="p-6 bg-(--color-surface-high)/30 border-b border-(--color-surface-high) flex items-center gap-3">
          <Tag className="w-5 h-5 text-(--color-primary)" />
          <h2 className="font-bold text-lg">Expense Categories</h2>
        </div>
        <div className="p-2">
          {categories && categories.length > 0 ? (
            <ul className="divide-y divide-(--color-surface-high)">
              {categories.map(cat => (
                <li key={cat.id} className="flex items-center justify-between px-4 py-3">
                  <span className="font-medium">{cat.name}</span>
                  <form action={async () => {
                    'use server'
                    await deleteCategory(cat.id)
                  }}>
                    <DeleteCategoryButton />
                  </form>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-6 py-4 text-sm text-(--color-on-surface-variant) italic">
              No categories yet. Add them when recording an expense.
            </p>
          )}
          <div className="px-4 py-3 border-t border-(--color-surface-high)">
            <Link href="/dashboard/expenses/add" className="text-sm text-primary hover:underline font-medium">
              + Add a category via the expense form
            </Link>
          </div>
        </div>
      </section>

      {/* Security & Password */}
      <section className="bg-(--color-surface-lowest) rounded-md shadow-ambient overflow-hidden">
        <div className="p-6 bg-(--color-surface-high)/30 border-b border-(--color-surface-high) flex items-center gap-3">
          <Lock className="w-5 h-5 text-(--color-primary)" />
          <h2 className="font-bold text-lg">Security & Password</h2>
        </div>
        <div className="p-6">
          <ChangePasswordSection />
        </div>
      </section>

      {/* Owner Management */}
      <section className="bg-(--color-surface-lowest) rounded-md shadow-ambient overflow-hidden">
        <div className="p-6 bg-(--color-surface-high)/30 border-b border-(--color-surface-high) flex items-center gap-3">
          <Users className="w-5 h-5 text-(--color-primary)" />
          <h2 className="font-bold text-lg">Farm Partners</h2>
        </div>
        <div className="p-6 flex flex-col gap-4">
          {owners && owners.length > 0 ? (
            <>
              <ul className="flex flex-col gap-2">
                {owners.map(o => (
                  <li key={o.id} className="flex justify-between items-center py-2 border-b border-(--color-surface-high)">
                    <span className="font-medium">{o.name}</span>
                    <span className="font-bold text-primary">{o.share_percentage}%</span>
                  </li>
                ))}
              </ul>
              <div className={`text-sm font-medium px-3 py-2 rounded-md ${totalShare === 100 ? 'bg-primary/10 text-primary' : 'bg-yellow-500/10 text-yellow-600'}`}>
                Total allocated: {totalShare}% {totalShare < 100 ? `(${100 - totalShare}% unallocated)` : '✓'}
              </div>
            </>
          ) : (
            <p className="text-sm text-(--color-on-surface-variant) italic">No partners added yet.</p>
          )}
          <Link href="/dashboard/settings/owners" className="self-start bg-(--color-surface-high) hover:bg-primary hover:text-white text-(--color-on-surface-variant) px-4 py-2 rounded-full text-sm font-semibold transition-colors">
            Manage Partners →
          </Link>
        </div>
      </section>
    </div>
  )
}
