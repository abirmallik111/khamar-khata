'use client'

import React, { useState, useTransition } from 'react'
import { Camera, Plus, Trash2, Calendar, X, ImageIcon, Loader2 } from 'lucide-react'
import { formatDate } from '@/utils/format'
import { addCowTimelineImage, deleteCowTimelineImage } from '../actions'
import imageCompression from 'browser-image-compression'
import { SmartImage } from '@/components/SmartImage'

interface GrowthTimelineProps {
  cowId: string
  images: any[]
}

export function GrowthTimeline({ cowId, images }: GrowthTimelineProps) {
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
        
        await addCowTimelineImage(cowId, formData)
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
        await deleteCowTimelineImage(deleteConfirmId, cowId)
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
          Growth Timeline / Photo Gallery
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
          <p className="text-xs text-(--color-on-surface-variant) opacity-70 mt-1">Capture key moments as this cattle grows.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedImages.map((img) => (
            <div key={img.id} className="group relative aspect-square rounded-lg overflow-hidden shadow-sm border border-(--color-surface-high) bg-(--color-surface-high)">
              <SmartImage 
                src={img.image_url} 
                alt={img.caption || 'Cow Photo'} 
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                <div className="flex justify-end">
                  <button
                    onClick={() => setDeleteConfirmId(img.id)}
                    className="p-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-full transition-colors shadow-sm"
                    title="Delete Image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div>
                  {img.caption && (
                    <p className="text-white text-xs font-semibold line-clamp-2 leading-tight mb-1">
                      {img.caption}
                    </p>
                  )}
                  {img.created_at && (
                    <div className="flex items-center gap-1 text-[10px] text-gray-300 font-medium">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(img.created_at)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-(--color-surface-lowest) rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-(--color-surface-high)">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Camera className="w-4 h-4 text-primary" />
                Add Growth Photo
              </h3>
              <button 
                onClick={() => { setIsModalOpen(false); setPreview(null); }}
                className="p-1 rounded-full hover:bg-(--color-surface-high) text-(--color-on-surface-variant)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-(--color-on-surface-variant) uppercase">Photo</label>
                <div className="relative aspect-video rounded-lg border-2 border-dashed border-(--color-surface-high) bg-(--color-surface-low)/50 overflow-hidden flex flex-col items-center justify-center hover:border-primary/50 transition-colors">
                  {preview ? (
                    <SmartImage src={preview} alt="Preview" fill className="object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 pointer-events-none text-(--color-on-surface-variant)">
                      <ImageIcon className="w-8 h-8 opacity-40" />
                      <span className="text-xs font-medium">Click to select photo</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    name="image" 
                    accept="image/*" 
                    required 
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-(--color-on-surface-variant) uppercase">Caption (Optional)</label>
                <input 
                  type="text" 
                  name="caption" 
                  placeholder="e.g. 6 Months Milestone, Weight Check"
                  className="w-full px-3 py-2 bg-(--color-surface-high) rounded-md text-sm outline-none border border-transparent focus:border-primary transition-colors"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setPreview(null); }}
                  className="px-4 py-2 text-sm font-semibold rounded-lg hover:bg-(--color-surface-high) text-(--color-on-surface-variant)"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 text-sm font-semibold rounded-lg bg-primary text-white hover:opacity-90 disabled:opacity-50 flex items-center gap-2 shadow-sm"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Upload Photo'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-(--color-surface-lowest) rounded-xl shadow-2xl w-full max-w-sm overflow-hidden p-6 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-lg mb-2">Delete this photo?</h4>
            <p className="text-xs text-(--color-on-surface-variant) mb-6">
              This photo will be permanently deleted from the growth timeline.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg border border-(--color-surface-high) hover:bg-(--color-surface-high)"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isPending}
                className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
