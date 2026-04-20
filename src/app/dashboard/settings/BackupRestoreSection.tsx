'use client'

import { useState, useTransition, useRef } from 'react'
import { Download, Upload, AlertTriangle, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { exportUserData, triggerRestore } from './actions'

export function BackupRestoreSection() {
  const [isPending, startTransition] = useTransition()
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' })
  const [uploadedData, setUploadedData] = useState<unknown>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = async () => {
    startTransition(async () => {
      try {
        const backup = await exportUserData()
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        const date = new Date().toISOString().split('T')[0]
        a.href = url
        a.download = `khamar-khata-backup-${date}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        setStatus({ type: 'success', message: 'Backup downloaded successfully!' })
      } catch {
        setStatus({ type: 'error', message: 'Failed to export data.' })
      }
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string)
        
        // Validation
        const requiredKeys = ['goats', 'expenses', 'owners', 'expense_categories']
        const hasRequiredKeys = requiredKeys.every(key => json.data && Array.isArray(json.data[key]))
        
        if (!hasRequiredKeys) {
          setStatus({ type: 'error', message: 'Invalid backup file structure.' })
          return
        }

        setUploadedData(json)
        setShowConfirmModal(true)
        setStatus({ type: null, message: '' })
      } catch {
        setStatus({ type: 'error', message: 'Failed to parse JSON file.' })
      }
    }
    reader.readAsText(file)
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleRestore = () => {
    if (confirmText !== 'RESTORE') return

    startTransition(async () => {
      try {
        await triggerRestore(uploadedData as any)
        setStatus({ type: 'success', message: 'Data restored successfully! Refreshing dashboard...' })
        setShowConfirmModal(false)
        setConfirmText('')
        setUploadedData(null)
        
        // Refresh page after a short delay
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 2000)
      } catch (error: unknown) {
        setStatus({ type: 'error', message: error instanceof Error ? error.message : 'Failed to restore data.' })
        setShowConfirmModal(false)
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Export Card */}
        <div className="p-4 rounded-xl border border-(--color-surface-high) bg-(--color-surface-high)/10 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold">Export Data</p>
              <p className="text-xs text-(--color-on-surface-variant)">Download your entire farm data as a JSON file.</p>
            </div>
          </div>
          <button
            onClick={handleExport}
            disabled={isPending}
            className="mt-2 w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Download Backup
          </button>
        </div>

        {/* Restore Card */}
        <div className="p-4 rounded-xl border border-(--color-surface-high) bg-(--color-surface-high)/10 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold">Restore Data</p>
              <p className="text-xs text-(--color-on-surface-variant)">Upload a previously exported backup file.</p>
            </div>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending}
            className="mt-2 w-full py-2 px-4 border border-orange-500/50 hover:bg-orange-500/10 text-orange-600 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Upload Backup
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>

      {/* Status Messages */}
      {status.type && (
        <div className={`p-4 rounded-lg flex items-start gap-3 ${
          status.type === 'success' ? 'bg-green-500/10 text-green-700' : 'bg-red-500/10 text-red-700'
        }`}>
          {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 mt-0.5" /> : <XCircle className="w-5 h-5 mt-0.5" />}
          <p className="text-sm font-medium">{status.message}</p>
        </div>
      )}

      {/* Double Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-(--color-surface-lowest) w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 bg-red-500/10 border-b border-red-500/20 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h3 className="text-xl font-bold text-red-900">Critical Warning</h3>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <p className="text-sm text-(--color-on-surface-variant) leading-relaxed">
                This action will <span className="font-bold text-red-600">PERMANENTLY DELETE</span> all current goats, expenses, and records for this account and replace them with the data from the backup file.
              </p>
              <div className="p-3 bg-(--color-surface-high)/30 rounded-lg">
                <p className="text-xs font-semibold uppercase tracking-wider text-(--color-on-surface-variant) mb-2">
                  Type <span className="text-red-600 font-bold">RESTORE</span> to confirm
                </p>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                  placeholder="RESTORE"
                  className="w-full bg-white border border-(--color-surface-high) rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => {
                    setShowConfirmModal(false)
                    setConfirmText('')
                    setUploadedData(null)
                  }}
                  className="flex-1 py-2 rounded-lg border border-(--color-surface-high) text-sm font-semibold hover:bg-(--color-surface-high)/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRestore}
                  disabled={confirmText !== 'RESTORE' || isPending}
                  className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Wipe & Restore
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
