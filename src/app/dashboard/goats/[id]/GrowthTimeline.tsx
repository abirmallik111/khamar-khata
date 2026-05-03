'use client'

import React, { useState, useTransition } from 'react'
import { Camera, Plus, Trash2, Calendar, X, ImageIcon, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { formatDate } from '@/utils/format'
import { addGoatTimelineImage, deleteGoatTimelineImage } from '../actions'
import imageCompression from 'browser-image-compression'

import { SmartImage } from '@/components/SmartImage'

interface GrowthTimelineProps {
  goatId: string
  images: any[]
}

export function GrowthTimeline({ goatId, images }: GrowthTimelineProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [preview, setPreview] = useState<string | null>(null)

  const sortedImages = [...images].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    
    startTransition(async () => {
      try {
        const file = formData.get('image') as File
        if (file && file.size > 0) {
          const options = {
            maxSizeMB: 0.6,
            maxWidthOrHeight: 1200,
            useWebWorker: true
          }
          const compressedFile = await imageCompression(file, options)
          formData.set('image', compressedFile)
        }
        
        await addGoatTimelineImage(goatId, formData)
        setIsModalOpen(false)
        setPreview(null)
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to add image')
      }
    })
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  async function confirmDelete() {
    if (!deleteConfirmId) return
    
    startTransition(async () => {
      try {
        await deleteGoatTimelineImage(deleteConfirmId, goatId)
        setDeleteConfirmId(null)
      } catch (error) {
        alert('Failed to delete image')
      }
    })
  }

  return (
    <div className="bg-(--color-surface-lowest) rounded-md shadow-ambient p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg flex items-center gap-2 text-(--color-on-background)">
          <Camera className="w-5 h-5 text-primary" />
          Growth Timeline
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-bold hover:bg-primary hover:text-white transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Photo
        </button>
      </div>

      {sortedImages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-(--color-surface-high) rounded-lg bg-(--color-surface-low)/20">
          <ImageIcon className="w-10 h-10 text-(--color-on-surface-variant) opacity-30 mb-3" />
          <p className="text-sm text-(--color-on-surface-variant) font-medium">No growth photos added yet.</p>
          <p className="text-xs text-(--color-on-surface-variant) opacity-70 mt-1">Capture key moments as this goat grows.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedImages.map((img) => (
            <div key={img.id} className="group relative aspect-square rounded-lg overflow-hidden shadow-sm border border-(--color-surface-high) bg-(--color-surface-high)">
              <SmartImage 
                src={img.image_url} 
                alt={img.caption || 'Growth photo'} 
                fill 
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, 200px"
              />
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between">
                <div className="flex justify-end">
                  <button 
                    onClick={() => setDeleteConfirmId(img.id)}
                    className="p-1.5 rounded-full bg-error text-white hover:scale-110 transition-transform"
                    title="Delete photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-white text-[10px] font-bold mb-1 opacity-80 uppercase tracking-wider">
                    <Calendar className="w-3 h-3" />
                    {formatDate(img.created_at)}
                  </div>
                  {img.caption && (
                    <p className="text-white text-xs font-medium line-clamp-2 leading-tight">
                      {img.caption}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-(--color-surface-lowest) rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Delete Photo?</h3>
              <p className="text-sm text-(--color-on-surface-variant) mb-6">
                Are you sure you want to remove this memory from the growth timeline? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteConfirmId(null)}
                  disabled={isPending}
                  className="flex-1 px-4 py-3 rounded-lg font-bold border border-(--color-surface-high) hover:bg-(--color-surface-low) transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  disabled={isPending}
                  className="flex-1 px-4 py-3 rounded-lg font-bold bg-error text-white hover:bg-red-600 shadow-lg shadow-error/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-(--color-surface-lowest) rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-(--color-surface-high) flex items-center justify-between">
              <h3 className="font-bold text-lg font-display">Add Growth Photo</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-(--color-surface-high) rounded-full transition-colors">
                <X className="w-5 h-5 text-(--color-on-surface-variant)" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-(--color-on-surface-variant)">Photo</label>
                <div className="relative group aspect-video rounded-lg border-2 border-dashed border-(--color-surface-high) bg-(--color-surface-low)/20 overflow-hidden flex flex-col items-center justify-center transition-all hover:border-primary/50">
                  {preview ? (
                    <>
                      <Image src={preview} alt="Preview" fill className="object-cover" />
                      <button 
                        type="button"
                        onClick={() => setPreview(null)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-(--color-on-surface-variant) opacity-60">
                      <Camera className="w-8 h-8 mb-2" />
                      <p className="text-sm font-medium text-center px-4">Click to select photo<br/><span className="text-[10px] font-normal uppercase mt-1 block tracking-tight">JPG, PNG up to 5MB</span></p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    name="image" 
                    accept="image/*" 
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-(--color-on-surface-variant)">Caption</label>
                <input 
                  type="text" 
                  name="caption" 
                  placeholder="e.g. 6 months old, 15kg weight"
                  className="w-full bg-(--color-surface-high) border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary transition-all font-medium"
                />
              </div>

              <button 
                type="submit" 
                disabled={isPending}
                className="w-full bg-primary text-white py-3 rounded-lg font-bold shadow-lg hover:shadow-xl hover:translate-y-[-1px] active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Add to Timeline'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
