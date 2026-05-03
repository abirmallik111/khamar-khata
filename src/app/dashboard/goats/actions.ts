'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function addGoat(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const nameOrTag = formData.get('name_or_tag') as string
  const breed = formData.get('breed') as string
  const gender = formData.get('gender') as string
  const source = (formData.get('source') || 'purchased') as string
  const purchasePrice = source === 'born' ? 0 : parseFloat(formData.get('purchase_price') as string || '0')
  const purchaseDate = formData.get('purchase_date') as string
  const imageFile = formData.get('image') as File | null
  const ownerContributions = JSON.parse(formData.get('owner_contributions') as string || '[]')

  let imageUrl = null

  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split('.').pop()
    const fileName = `${user.id}-${Math.random()}.${fileExt}`
    const { error: uploadError } = await supabase.storage
      .from('goat_images')
      .upload(fileName, imageFile)

    if (uploadError) {
      console.error('Image upload error:', uploadError)
      throw new Error('Failed to upload image')
    }

    const { data: publicUrlData } = supabase.storage
      .from('goat_images')
      .getPublicUrl(fileName)
      
    imageUrl = publicUrlData.publicUrl
  }

  const motherId = formData.get('mother_id') as string || null
  const fatherId = formData.get('father_id') as string || null

  const { error: insertError } = await (supabase as any).rpc('add_goat_with_contributions', {
    p_user_id: user.id,
    p_name_or_tag: nameOrTag,
    p_breed: breed || null,
    p_gender: gender || null,
    p_purchase_price: purchasePrice,
    p_purchase_date: purchaseDate,
    p_source: source,
    p_image_url: imageUrl,
    p_owner_contributions: ownerContributions,
    p_mother_id: motherId,
    p_father_id: fatherId
  })

  if (insertError) {
    console.error('Error inserting goat via RPC:', insertError)
    throw new Error('Failed to add goat: ' + insertError.message)
  }

  revalidatePath('/dashboard/goats')
  redirect('/dashboard/goats')
}

export async function updateGoat(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const nameOrTag = formData.get('name_or_tag') as string
  const breed = formData.get('breed') as string
  const gender = formData.get('gender') as string
  const source = (formData.get('source') || 'purchased') as string
  const purchasePrice = source === 'born' ? 0 : parseFloat(formData.get('purchase_price') as string || '0')
  const purchaseDate = formData.get('purchase_date') as string
  const status = formData.get('status') as string
  const imageFile = formData.get('image') as File | null
  const removeImage = formData.get('remove_image') === 'true'

  const { data: existingGoat } = await supabase.from('goats').select('image_url').eq('id', id).single()

  const updateData: Record<string, string | number | null> = {
    name_or_tag: nameOrTag,
    breed: breed || null,
    gender: gender || null,
    source: source,
    purchase_price: purchasePrice,
    purchase_date: purchaseDate,
    status: status,
  }

  if (removeImage) {
    updateData.image_url = null
  } else if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split('.').pop()
    const fileName = `${user.id}-${Math.random()}.${fileExt}`
    const { error: uploadError } = await supabase.storage
      .from('goat_images')
      .upload(fileName, imageFile)

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage
        .from('goat_images')
        .getPublicUrl(fileName)
      updateData.image_url = publicUrlData.publicUrl
    }
  }

  const contributionsJson = formData.get('owner_contributions') as string
  const contributions = contributionsJson ? JSON.parse(contributionsJson) : []

  const motherId = formData.get('mother_id') as string || null
  const fatherId = formData.get('father_id') as string || null

  const { error: updateError } = await (supabase as any).rpc('update_goat_with_contributions', {
    p_goat_id: id,
    p_user_id: user.id,
    p_name_or_tag: updateData.name_or_tag,
    p_breed: updateData.breed,
    p_gender: updateData.gender,
    p_purchase_price: updateData.purchase_price,
    p_purchase_date: updateData.purchase_date,
    p_source: updateData.source,
    p_status: updateData.status,
    p_image_url: updateData.image_url !== undefined ? updateData.image_url : (existingGoat?.image_url || null),
    p_owner_contributions: contributions,
    p_mother_id: motherId,
    p_father_id: fatherId
  })

  if (updateError) {
    console.error('Error updating goat via RPC:', updateError)
    throw new Error('Failed to update goat: ' + updateError.message)
  }

  revalidatePath('/dashboard/goats')
  revalidatePath(`/dashboard/goats/${id}`)
  redirect(`/dashboard/goats/${id}`)
}

export async function deleteGoat(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('goats').delete().eq('id', id).eq('user_id', user.id)

  if (error) {
    console.error('Error deleting goat:', error)
    throw new Error('Failed to delete goat: ' + error.message)
  }

  revalidatePath('/dashboard/goats')
  redirect('/dashboard/goats')
}

export async function addHealthRecord(goatId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const recordType = formData.get('record_type') as string
  const recordDate = formData.get('record_date') as string
  const name = formData.get('name') as string || null
  const notes = formData.get('notes') as string || null
  const nextDate = formData.get('next_date') as string || null

  const { error } = await supabase.from('goat_health_records').insert({
    user_id: user.id,
    goat_id: goatId,
    record_type: recordType,
    record_date: recordDate,
    name,
    notes,
    next_date: nextDate
  })

  if (error) {
    console.error('Error adding health record:', error)
    throw new Error('Failed to add health record: ' + error.message)
  }

  revalidatePath(`/dashboard/goats/${goatId}`)
}

export async function addGoatNote(goatId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const note = formData.get('note') as string
  const noteDate = formData.get('note_date') as string
  
  if (!note || note.trim() === '') {
    throw new Error('Note content cannot be empty')
  }

  const { error } = await supabase.from('goat_notes').insert({
    user_id: user.id,
    goat_id: goatId,
    note: note.trim(),
    note_date: noteDate
  })

  if (error) {
    console.error('Error adding goat note:', error)
    throw new Error('Failed to add note: ' + error.message)
  }

  revalidatePath(`/dashboard/goats/${goatId}`)
}

export async function deleteHealthRecord(id: string, goatId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('goat_health_records').delete().eq('id', id).eq('user_id', user.id)
  
  if (error) throw new Error('Failed to delete health record')
  revalidatePath(`/dashboard/goats/${goatId}`)
}

export async function editHealthRecord(id: string, goatId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const recordType = formData.get('record_type') as string
  const recordDate = formData.get('record_date') as string
  const name = formData.get('name') as string || null
  const notes = formData.get('notes') as string || null
  const nextDate = formData.get('next_date') as string || null

  const { error } = await supabase.from('goat_health_records').update({
    record_type: recordType,
    record_date: recordDate,
    name,
    notes,
    next_date: nextDate
  }).eq('id', id).eq('user_id', user.id)

  if (error) throw new Error('Failed to update health record')
  revalidatePath(`/dashboard/goats/${goatId}`)
}

export async function deleteGoatNote(id: string, goatId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('goat_notes').delete().eq('id', id).eq('user_id', user.id)
  
  if (error) throw new Error('Failed to delete note')
  revalidatePath(`/dashboard/goats/${goatId}`)
}

export async function editGoatNote(id: string, goatId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const note = formData.get('note') as string
  const noteDate = formData.get('note_date') as string
  
  if (!note || note.trim() === '') throw new Error('Note cannot be empty')

  const { error } = await supabase.from('goat_notes').update({
    note: note.trim(),
    note_date: noteDate
  }).eq('id', id).eq('user_id', user.id)

  if (error) throw new Error('Failed to update note')
  revalidatePath(`/dashboard/goats/${goatId}`)
}

export async function checkInbreeding(motherId: string, fatherId: string) {
  if (!motherId || !fatherId) return { is_at_risk: false }
  
  const supabase = await createClient()
  const { data, error } = await (supabase as any).rpc('check_inbreeding_risk', {
    p_mother_id: motherId,
    p_father_id: fatherId
  })

  if (error) {
    console.error('Error checking inbreeding risk:', error)
    return { is_at_risk: false }
  }

  return data[0]
}

export async function addGoatTimelineImage(goatId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const imageFile = formData.get('image') as File
  const caption = formData.get('caption') as string || null

  if (!imageFile || imageFile.size === 0) {
    throw new Error('Image file is required')
  }

  const fileExt = imageFile.name.split('.').pop()
  const fileName = `${user.id}/${goatId}/${Math.random()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('goat_images')
    .upload(fileName, imageFile)

  if (uploadError) {
    console.error('Image upload error:', uploadError)
    throw new Error('Failed to upload image')
  }

  const { data: publicUrlData } = supabase.storage
    .from('goat_images')
    .getPublicUrl(fileName)

  const { error } = await (supabase as any).from('goat_images').insert({
    goat_id: goatId,
    image_url: publicUrlData.publicUrl,
    caption
  })

  if (error) {
    console.error('Error adding timeline image record:', error)
    throw new Error('Failed to save image record')
  }

  revalidatePath(`/dashboard/goats/${goatId}`)
}

export async function deleteGoatTimelineImage(id: string, goatId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await (supabase as any).from('goat_images').delete().eq('id', id)
  
  if (error) throw new Error('Failed to delete image record')
  revalidatePath(`/dashboard/goats/${goatId}`)
}
