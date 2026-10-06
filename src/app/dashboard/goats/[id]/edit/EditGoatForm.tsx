/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Upload, Loader2, Trash2, AlertTriangle } from 'lucide-react'
import { useFormat } from '@/hooks/useFormat'
import Link from 'next/link'
import imageCompression from 'browser-image-compression'
import { updateGoat, deleteGoat, checkInbreeding } from '../../actions'
import { Goat, Owner, OwnerContribution } from '@/types'
import { SubmitButton } from '@/components/SubmitButton'

export function EditGoatForm({ 
  goat, 
  owners, 
  initialContributions,
  goats
}: { 
  goat: Goat, 
  owners: Pick<Owner, 'id' | 'name' | 'share_percentage'>[], 
  initialContributions: Pick<OwnerContribution, 'owner_id' | 'amount'>[],
  goats: { id: string, name_or_tag: string, gender: string | null }[]
}) {
  const { currencySymbol, formatCurrency } = useFormat()
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(goat.image_url)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [source, setSource] = useState<'purchased' | 'born'>((goat as Goat & { source?: 'purchased' | 'born' }).source || 'purchased')
  
  // Purchase split state
  const [showConfirm, setShowConfirm] = useState(false)
  const [purchasePrice, setPurchasePrice] = useState<string>(goat.purchase_price.toString())
  const initialContribMap: Record<string, string> = {}
  initialContributions.forEach(c => {
    initialContribMap[c.owner_id] = c.amount.toString()
  })
  const [ownerContributions, setOwnerContributions] = useState<Record<string, string>>(initialContribMap)
  const [motherId, setMotherId] = useState((goat as any).mother_id || '')
  const [fatherId, setFatherId] = useState((goat as any).father_id || '')
  const [inbreedingRisk, setInbreedingRisk] = useState<any>(null)

  useEffect(() => {
    async function verifyInbreeding() {
      if (motherId && fatherId) {
        const risk = await checkInbreeding(motherId, fatherId)
        setInbreedingRisk(risk)
      } else {
        setInbreedingRisk(null)
      }
    }
    verifyInbreeding()
  }, [motherId, fatherId])

  // Pedigree Candidates
  const mothers = goats.filter(g => g.gender === 'Female')
  const fathers = goats.filter(g => g.gender === 'Male')

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageFile(file)
    setRemoveImage(false)
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setRemoveImage(true)
    setImageFile(null)
    setPreviewUrl(null)
  }

  const handleContributionChange = (ownerId: string, value: string) => {
    setOwnerContributions(prev => ({
      ...prev,
      [ownerId]: value
    }))
  }

  const calculateTotalContributions = () => {
    return Object.values(ownerContributions).reduce((sum, val) => sum + (parseFloat(val) || 0), 0)
  }

  const totalContrib = calculateTotalContributions()
  const isBalanced = source === 'born' || Math.abs(totalContrib - (parseFloat(purchasePrice) || 0)) < 0.01

  const handleAction = async (formData: FormData) => {
    setError(null)

    try {
      if (removeImage) {
        formData.set('remove_image', 'true')
      }

      if (imageFile) {
        const options = {
          maxSizeMB: 0.6,
          maxWidthOrHeight: 1200,
          useWebWorker: true
        }
        
        try {
          const compressedFile = await imageCompression(imageFile, options)
          formData.set('image', compressedFile, compressedFile.name)
        } catch (compressionError) {
          console.error('Image compression failed', compressionError)
          formData.set('image', imageFile)
        }
      }

      const contributions = Object.entries(ownerContributions)
        .filter(([, val]) => parseFloat(val) > 0)
        .map(([owner_id, amount]) => ({ owner_id, amount: parseFloat(amount) }))

      formData.set('owner_contributions', JSON.stringify(contributions))

        await updateGoat(goat.id, formData)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating the goat.')
    }
  }

  const handleDelete = async () => {
    if (!showConfirm) {
      setShowConfirm(true)
      // Auto-reset after 3 seconds
      setTimeout(() => setShowConfirm(false), 3000)
      return
    }

    try {
      await deleteGoat(goat.id)
      window.location.href = '/dashboard/goats'
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setError(msg)
      alert('Error deleting goat: ' + msg)
      setIsDeleting(false)
      setShowConfirm(false)
    }
  }

  return (
    <>
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/goats/${goat.id}`} className="p-2 rounded-full hover:bg-(--color-surface-high) transition-colors text-(--color-on-surface-variant)">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight font-display mb-1">Edit Goat</h1>
            <p className="text-(--color-on-surface-variant) text-sm">Update details for {goat.name_or_tag}.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {showConfirm && (
            <span className="text-xs font-bold text-red-500 animate-pulse uppercase tracking-tighter">Click again to delete</span>
          )}
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`p-3 rounded-full transition-all ${showConfirm ? 'bg-red-500 text-white shadow-lg scale-110' : 'text-red-500 hover:bg-red-500/10'} disabled:opacity-50`}
            title={showConfirm ? "Confirm Delete" : "Delete Goat"}
          >
            {isDeleting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Trash2 className="w-6 h-6" />}
          </button>
        </div>
      </header>

      <form action={handleAction} className="bg-(--color-surface-lowest) rounded-md shadow-ambient p-6 sm:p-8 flex flex-col gap-6">
        
        {error && (
          <div className="p-4 bg-error/10 text-error rounded-md text-sm font-medium">
            {error}
          </div>
        )}

        {/* Source Toggle */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-(--color-on-surface-variant)">How did you get this goat?</label>
          <div className="flex gap-2 p-1 bg-(--color-surface-high) rounded-md w-fit">
            <input type="hidden" name="source" value={source} />
            <button
              type="button"
              onClick={() => setSource('purchased')}
              className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${source === 'purchased' ? 'bg-white shadow-sm text-primary' : 'text-(--color-on-surface-variant) hover:bg-white/50'}`}
            >
              Purchased
            </button>
            <button
              type="button"
              onClick={() => setSource('born')}
              className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${source === 'born' ? 'bg-white shadow-sm text-primary' : 'text-(--color-on-surface-variant) hover:bg-white/50'}`}
            >
              Born on Farm
            </button>
          </div>
        </div>

        {/* Pedigree Selection (Only for Born on Farm) */}
        {source === 'born' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-md bg-(--color-surface-low) border border-(--color-surface-high)">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-(--color-on-surface-variant) flex items-center gap-2" htmlFor="mother_id">
                Select Mother (Dam)
                <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-white/50">Optional</span>
              </label>
              <select
                id="mother_id"
                name="mother_id"
                value={motherId}
                onChange={(e) => setMotherId(e.target.value)}
                className="rounded-md px-4 py-3 bg-white border-b-2 border-transparent focus:border-primary outline-none transition-all appearance-none"
              >
                <option value="">-- No Mother Selected --</option>
                {mothers.map(mother => (
                  <option key={mother.id} value={mother.id}>{mother.name_or_tag}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-(--color-on-surface-variant) flex items-center gap-2" htmlFor="father_id">
                Select Father (Sire)
                <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-white/50">Optional</span>
              </label>
              <select
                id="father_id"
                name="father_id"
                value={fatherId}
                onChange={(e) => setFatherId(e.target.value)}
                className="rounded-md px-4 py-3 bg-white border-b-2 border-transparent focus:border-primary outline-none transition-all appearance-none"
              >
                <option value="">-- No Father Selected --</option>
                {fathers.map(father => (
                  <option key={father.id} value={father.id}>{father.name_or_tag}</option>
                ))}
              </select>
            </div>

            {inbreedingRisk?.is_at_risk && (
              <div className={`col-span-1 sm:col-span-2 p-4 rounded-md border flex items-start gap-3 transition-all ${inbreedingRisk.risk_level === 'CRITICAL' ? 'bg-error/10 border-error/20' : 'bg-orange-50 border-orange-200'}`}>
                <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${inbreedingRisk.risk_level === 'CRITICAL' ? 'text-error' : 'text-orange-500'}`} />
                <div>
                  <p className={`text-sm font-bold ${inbreedingRisk.risk_level === 'CRITICAL' ? 'text-error' : 'text-orange-700'}`}>
                    {inbreedingRisk.risk_level} Inbreeding Risk Detected
                  </p>
                  <p className="text-xs text-(--color-on-surface-variant) mt-1">
                    {inbreedingRisk.relationship_path}. Common Ancestor: <span className="font-bold">{inbreedingRisk.common_ancestor_name}</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-1 flex flex-col gap-2">
            <label className="text-sm font-medium text-(--color-on-surface-variant)" htmlFor="name_or_tag">
              Name or Tag Number *
            </label>
            <input
              required
              id="name_or_tag"
              name="name_or_tag"
              defaultValue={goat.name_or_tag}
              className="rounded-md px-4 py-3 bg-surface-high border-b-2 border-transparent focus:border-primary outline-none transition-all"
              placeholder="e.g. G-101 or Billy"
            />
          </div>

          <div className="flex-1 flex flex-col gap-2">
            <label className="text-sm font-medium text-(--color-on-surface-variant)" htmlFor="breed">
              Breed
            </label>
            <input
              id="breed"
              name="breed"
              defaultValue={goat.breed || ''}
              className="rounded-md px-4 py-3 bg-surface-high border-b-2 border-transparent focus:border-primary outline-none transition-all"
              placeholder="e.g. Black Bengal"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-1 flex flex-col gap-2">
            <label className="text-sm font-medium text-(--color-on-surface-variant)" htmlFor="gender">
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              defaultValue={goat.gender || 'Male'}
              className="rounded-md px-4 py-3 bg-surface-high border-b-2 border-transparent focus:border-primary outline-none transition-all appearance-none"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="flex-1 flex flex-col gap-2">
            <label className="text-sm font-medium text-(--color-on-surface-variant)" htmlFor="status">
              Status *
            </label>
            <select
              id="status"
              name="status"
              required
              defaultValue={goat.status}
              className="rounded-md px-4 py-3 bg-surface-high border-b-2 border-transparent focus:border-primary outline-none transition-all appearance-none"
            >
              <option value="active">Active</option>
              <option value="sick">Sick</option>
              <option value="sold">Sold</option>
              <option value="dead">Dead</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-1 flex flex-col gap-2">
            <label className="text-sm font-medium text-(--color-on-surface-variant)" htmlFor="purchase_price">
              {source === 'purchased' ? `Purchase Price (${currencySymbol}) *` : `Initial Value (${currencySymbol})`}
            </label>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              id="purchase_price"
              name="purchase_price"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              className="rounded-md px-4 py-3 bg-surface-high border-b-2 border-transparent focus:border-primary outline-none transition-all font-mono"
              placeholder="0.00"
            />
          </div>

          <div className="flex-1 flex flex-col gap-2">
            <label className="text-sm font-medium text-(--color-on-surface-variant)" htmlFor="purchase_date">
              {source === 'purchased' ? 'Purchase Date *' : 'Birth Date *'}
            </label>
            <input
              required
              type="date"
              id="purchase_date"
              name="purchase_date"
              defaultValue={goat.purchase_date}
              className="rounded-md px-4 py-3 bg-surface-high border-b-2 border-transparent focus:border-primary outline-none transition-all"
            />
          </div>
        </div>

        {/* WHO PAID SECTION */}
        {source === 'purchased' && owners.length > 0 && (
          <div className="flex flex-col gap-4 p-4 rounded-md border-2 border-dashed border-(--color-surface-high) bg-(--color-surface-low)/30">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm uppercase tracking-wider text-(--color-on-surface-variant)">Who Paid?</h3>
              <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${isBalanced ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                {isBalanced ? 'Balanced' : `Unbalanced: ${formatCurrency(Math.abs(totalContrib - (parseFloat(purchasePrice) || 0)))}`}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {owners.map(owner => (
                <div key={owner.id} className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">{owner.name}</span>
                    <span className="text-(--color-on-surface-variant)">{owner.share_percentage}%</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-(--color-on-surface-variant)">{currencySymbol}</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={ownerContributions[owner.id] || ''}
                      onChange={(e) => handleContributionChange(owner.id, e.target.value)}
                      className="w-full pl-7 pr-4 py-2 bg-(--color-surface-lowest) border border-(--color-surface-high) rounded-md text-sm focus:border-primary outline-none transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-(--color-on-surface-variant)">
            Goat Image
          </label>
          <div className="relative">
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <div className="flex flex-col gap-4">
               <label 
                htmlFor="image" 
                className={`flex flex-col items-center justify-center w-full aspect-video sm:aspect-[21/9] border-2 border-dashed rounded-md cursor-pointer transition-colors ${previewUrl ? 'border-primary bg-primary/5' : 'border-(--color-surface-high) bg-(--color-surface-low) hover:bg-(--color-surface-high)'} overflow-hidden`}
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-(--color-on-surface-variant)">
                    <Upload className="w-8 h-8" />
                    <span className="text-sm font-medium">Click to upload a new image</span>
                  </div>
                )}
              </label>
              {previewUrl && (
                <button 
                  type="button" 
                  onClick={handleRemoveImage}
                  className="text-xs text-red-500 hover:underline self-center"
                >
                  Remove current image
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-6 border-t border-(--color-surface-high) flex justify-end gap-4">
          <Link 
            href={`/dashboard/goats/${goat.id}`}
            className="px-6 py-3 rounded-full font-semibold text-primary hover:bg-(--color-surface-high) transition-colors"
          >
            Cancel
          </Link>
          <SubmitButton
            loadingText="Saving..."
            disabled={isDeleting}
            className="bg-gradient-primary text-white px-8 py-3 rounded-full font-semibold shadow-ambient hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Save Changes
          </SubmitButton>
        </div>
      </form>
    </>
  )
}
