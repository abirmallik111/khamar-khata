/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Upload, Info, AlertTriangle } from 'lucide-react'
import { useFormat } from '@/hooks/useFormat'
import Link from 'next/link'
import imageCompression from 'browser-image-compression'
import { addGoat, checkInbreeding } from '../actions'
import { Owner } from '@/types'
import { SubmitButton } from '@/components/SubmitButton'

export function AddGoatForm({ 
  owners, 
  goats 
}: { 
  owners: Pick<Owner, 'id' | 'name' | 'share_percentage'>[],
  goats: { id: string, name_or_tag: string, gender: string | null }[]
}) {
  const { currencySymbol, formatCurrency } = useFormat()
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  
  // New States
  const [source, setSource] = useState<'purchased' | 'born'>('purchased')
  const [purchasePrice, setPurchasePrice] = useState<string>('')
  const [ownerContributions, setOwnerContributions] = useState<Record<string, string>>({})
  const [motherId, setMotherId] = useState('')
  const [fatherId, setFatherId] = useState('')
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
    const reader = new FileReader()
    reader.onloadend = () => setPreviewUrl(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleContributionChange = (ownerId: string, value: string) => {
    setOwnerContributions(prev => ({ ...prev, [ownerId]: value }))
  }

  const calculatePaidTotal = () => {
    return Object.values(ownerContributions).reduce((sum, val) => sum + (parseFloat(val) || 0), 0)
  }

  const paidAmount = calculatePaidTotal()
  const totalToPay = parseFloat(purchasePrice) || 0
  const isBalanced = source === 'born' || Math.abs(paidAmount - totalToPay) < 0.01

  const handleAction = async (formData: FormData) => {
    if (source === 'purchased' && !isBalanced) {
      setError(`Total paid (${formatCurrency(paidAmount)}) does not match purchase price (${formatCurrency(totalToPay)})`)
      return
    }

    setError(null)

    try {
      formData.set('source', source)
      
      if (source === 'born') {
        formData.set('purchase_price', '0')
      }

      const contributions = Object.entries(ownerContributions)
        .filter(([, val]) => parseFloat(val) > 0)
        .map(([id, val]) => ({ owner_id: id, amount: parseFloat(val) }))
      
      formData.set('owner_contributions', JSON.stringify(contributions))

      if (imageFile) {
        const options = { maxSizeMB: 1, maxWidthOrHeight: 1024, useWebWorker: true }
        try {
          const compressedFile = await imageCompression(imageFile, options)
          formData.set('image', compressedFile, compressedFile.name)
        } catch {
          formData.set('image', imageFile)
        }
      }

      await addGoat(formData)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred while adding the goat.')
    }
  }

  return (
    <>
      <header className="flex items-center gap-4">
        <Link href="/dashboard/goats" className="p-2 rounded-full hover:bg-(--color-surface-high) transition-colors text-(--color-on-surface-variant)">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-display mb-1">Add New Goat</h1>
          <p className="text-(--color-on-surface-variant) text-sm">Register a new addition to your herd.</p>
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
              className="rounded-md px-4 py-3 bg-surface-high border-b-2 border-transparent focus:border-primary outline-none transition-all appearance-none"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
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
              defaultValue={new Date().toISOString().split('T')[0]}
              className="rounded-md px-4 py-3 bg-surface-high border-b-2 border-transparent focus:border-primary outline-none transition-all"
            />
          </div>
        </div>

        {source === 'purchased' && (
          <>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-(--color-on-surface-variant)" htmlFor="purchase_price">
                Purchase Price ({currencySymbol}) *
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
                className="rounded-md px-4 py-4 bg-surface-high border-b-2 border-transparent focus:border-primary outline-none transition-all font-display text-2xl font-bold text-primary"
                placeholder="0.00"
              />
            </div>

            {/* Split UI */}
            <div className="flex flex-col gap-4 p-4 rounded-md border-2 border-dashed border-(--color-surface-high) bg-(--color-surface-low)/30">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm uppercase tracking-wider text-(--color-on-surface-variant)">Who Paid?</h3>
                <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${isBalanced ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                  {isBalanced ? 'Balanced' : `Remaining: ${formatCurrency(totalToPay - paidAmount)}`}
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
          </>
        )}

        {source === 'born' && (
          <div className="p-4 rounded-md bg-primary/5 border border-primary/20 flex items-start gap-3">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-(--color-on-surface-variant)">
              Goats born on the farm are recorded with a <strong>{currencySymbol}0 purchase price</strong> and will not affect initial investment calculations for partners.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-(--color-on-surface-variant)">
            Goat Image
          </label>
          <div className="relative">
            <input type="file" id="image" accept="image/*" onChange={handleImageChange} className="hidden" />
            <label 
              htmlFor="image" 
              className={`flex flex-col items-center justify-center w-full aspect-video sm:aspect-[21/9] border-2 border-dashed rounded-md cursor-pointer transition-colors ${previewUrl ? 'border-primary bg-primary/5' : 'border-(--color-surface-high) bg-(--color-surface-low) hover:bg-(--color-surface-high)'} overflow-hidden`}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-(--color-on-surface-variant)">
                  <Upload className="w-8 h-8" />
                  <span className="text-sm font-medium">Click to upload an image</span>
                </div>
              )}
            </label>
          </div>
        </div>

        <div className="mt-4 pt-6 border-t border-(--color-surface-high) flex justify-end gap-4">
          <Link href="/dashboard/goats" className="px-6 py-3 rounded-full font-semibold text-primary hover:bg-(--color-surface-high) transition-colors">Cancel</Link>
          <SubmitButton
            loadingText="Saving..."
            disabled={source === 'purchased' && !isBalanced}
            className="bg-gradient-primary text-white px-8 py-3 rounded-full font-semibold shadow-ambient hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Register Goat
          </SubmitButton>
        </div>
      </form>
    </>
  )
}
