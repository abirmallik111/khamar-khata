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

  // @ts-ignore - Custom RPC function not yet in generated types
  const { error: insertError } = await supabase.rpc('add_goat_with_contributions', {
    p_user_id: user.id,
    p_name_or_tag: nameOrTag,
    p_breed: breed || null,
    p_gender: gender || null,
    p_purchase_price: purchasePrice,
    p_purchase_date: purchaseDate,
    p_source: source,
    p_image_url: imageUrl,
    p_owner_contributions: ownerContributions
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

  // @ts-ignore - Custom RPC function not yet in generated types
  const { error: updateError } = await supabase.rpc('update_goat_with_contributions', {
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
    p_owner_contributions: contributions
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
}
