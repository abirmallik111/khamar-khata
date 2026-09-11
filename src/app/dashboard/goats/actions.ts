'use server'

import { db } from '@/db'
import { goats, goatHealthRecords, goatNotes, goatImages, profiles } from '@/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

async function getAuthUser(): Promise<{ id: string }> {
  const session = await auth()
  if (session?.user?.id) {
    return { id: session.user.id }
  }
  const [firstUser] = await db.select().from(profiles).limit(1)
  if (firstUser) return { id: firstUser.id }
  throw new Error('Not authenticated')
}

async function saveLocalImage(imageFile: File, userId: string): Promise<string> {
  const bytes = await imageFile.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const timestamp = Date.now()
  const safeName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const filename = `${userId}_${timestamp}_${safeName}`

  const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadDir, { recursive: true })
  const filePath = path.join(uploadDir, filename)
  await writeFile(filePath, buffer)

  return `/uploads/${filename}`
}

export async function addGoat(formData: FormData) {
  const user = await getAuthUser()

  const nameOrTag = formData.get('name_or_tag') as string
  const breed = formData.get('breed') as string
  const gender = formData.get('gender') as string
  const source = (formData.get('source') || 'purchased') as string
  const purchasePrice = source === 'born' ? 0 : parseFloat(formData.get('purchase_price') as string || '0')
  const purchaseDate = formData.get('purchase_date') as string
  const imageFile = formData.get('image') as File | null
  const ownerContributions = JSON.parse(formData.get('owner_contributions') as string || '[]')

  let imageUrl: string | null = null

  if (imageFile && imageFile.size > 0) {
    imageUrl = await saveLocalImage(imageFile, user.id)
  }

  const motherId = (formData.get('mother_id') as string) || null
  const fatherId = (formData.get('father_id') as string) || null

  const result = await db.execute(sql`
    SELECT add_goat_with_contributions(
      ${user.id}::uuid,
      ${nameOrTag},
      ${breed || null},
      ${gender || null},
      ${purchasePrice}::numeric,
      ${purchaseDate}::date,
      ${source},
      ${imageUrl},
      ${JSON.stringify(ownerContributions)}::jsonb,
      ${motherId ? sql`${motherId}::uuid` : null},
      ${fatherId ? sql`${fatherId}::uuid` : null}
    ) as id
  `)

  revalidatePath('/dashboard/goats')
  redirect('/dashboard/goats')
}

export async function updateGoat(id: string, formData: FormData) {
  const user = await getAuthUser()

  const nameOrTag = formData.get('name_or_tag') as string
  const breed = formData.get('breed') as string
  const gender = formData.get('gender') as string
  const source = (formData.get('source') || 'purchased') as string
  const purchasePrice = source === 'born' ? 0 : parseFloat(formData.get('purchase_price') as string || '0')
  const purchaseDate = formData.get('purchase_date') as string
  const status = formData.get('status') as string
  const imageFile = formData.get('image') as File | null
  const removeImage = formData.get('remove_image') === 'true'

  const [existingGoat] = await db.select({ imageUrl: goats.imageUrl }).from(goats).where(eq(goats.id, id)).limit(1)

  let finalImageUrl: string | null = existingGoat?.imageUrl || null

  if (removeImage) {
    finalImageUrl = null
  } else if (imageFile && imageFile.size > 0) {
    finalImageUrl = await saveLocalImage(imageFile, user.id)
  }

  const contributionsJson = formData.get('owner_contributions') as string
  const contributions = contributionsJson ? JSON.parse(contributionsJson) : []

  const motherId = (formData.get('mother_id') as string) || null
  const fatherId = (formData.get('father_id') as string) || null

  await db.execute(sql`
    SELECT update_goat_with_contributions(
      ${id}::uuid,
      ${user.id}::uuid,
      ${nameOrTag},
      ${breed || null},
      ${gender || null},
      ${purchasePrice}::numeric,
      ${purchaseDate}::date,
      ${source},
      ${status},
      ${finalImageUrl},
      ${JSON.stringify(contributions)}::jsonb,
      ${motherId ? sql`${motherId}::uuid` : null},
      ${fatherId ? sql`${fatherId}::uuid` : null}
    )
  `)

  revalidatePath('/dashboard/goats')
  revalidatePath(`/dashboard/goats/${id}`)
  redirect(`/dashboard/goats/${id}`)
}

export async function deleteGoat(id: string) {
  const user = await getAuthUser()

  await db.delete(goats).where(and(eq(goats.id, id), eq(goats.userId, user.id)))

  revalidatePath('/dashboard/goats')
  redirect('/dashboard/goats')
}

export async function addHealthRecord(goatId: string, formData: FormData) {
  const user = await getAuthUser()

  const recordType = formData.get('record_type') as string
  const recordDate = formData.get('record_date') as string
  const name = (formData.get('name') as string) || null
  const notes = (formData.get('notes') as string) || null
  const nextDate = (formData.get('next_date') as string) || null

  await db.insert(goatHealthRecords).values({
    userId: user.id,
    goatId,
    recordType,
    recordDate,
    name,
    notes,
    nextDate
  })

  revalidatePath(`/dashboard/goats/${goatId}`)
}

export async function addGoatNote(goatId: string, formData: FormData) {
  const user = await getAuthUser()

  const note = formData.get('note') as string
  const noteDate = formData.get('note_date') as string

  if (!note || note.trim() === '') {
    throw new Error('Note content cannot be empty')
  }

  await db.insert(goatNotes).values({
    userId: user.id,
    goatId,
    note: note.trim(),
    noteDate
  })

  revalidatePath(`/dashboard/goats/${goatId}`)
}

export async function deleteHealthRecord(id: string, goatId: string) {
  const user = await getAuthUser()
  await db.delete(goatHealthRecords).where(and(eq(goatHealthRecords.id, id), eq(goatHealthRecords.userId, user.id)))
  revalidatePath(`/dashboard/goats/${goatId}`)
}

export async function editHealthRecord(id: string, goatId: string, formData: FormData) {
  const user = await getAuthUser()

  const recordType = formData.get('record_type') as string
  const recordDate = formData.get('record_date') as string
  const name = (formData.get('name') as string) || null
  const notes = (formData.get('notes') as string) || null
  const nextDate = (formData.get('next_date') as string) || null

  await db.update(goatHealthRecords).set({
    recordType,
    recordDate,
    name,
    notes,
    nextDate
  }).where(and(eq(goatHealthRecords.id, id), eq(goatHealthRecords.userId, user.id)))

  revalidatePath(`/dashboard/goats/${goatId}`)
}

export async function deleteGoatNote(id: string, goatId: string) {
  const user = await getAuthUser()
  await db.delete(goatNotes).where(and(eq(goatNotes.id, id), eq(goatNotes.userId, user.id)))
  revalidatePath(`/dashboard/goats/${goatId}`)
}

export async function editGoatNote(id: string, goatId: string, formData: FormData) {
  const user = await getAuthUser()

  const note = formData.get('note') as string
  const noteDate = formData.get('note_date') as string

  if (!note || note.trim() === '') throw new Error('Note cannot be empty')

  await db.update(goatNotes).set({
    note: note.trim(),
    noteDate
  }).where(and(eq(goatNotes.id, id), eq(goatNotes.userId, user.id)))

  revalidatePath(`/dashboard/goats/${goatId}`)
}

export async function checkInbreeding(motherId: string, fatherId: string) {
  if (!motherId || !fatherId) return { is_at_risk: false }

  const result: any = await db.execute(sql`
    SELECT * FROM check_inbreeding_risk(${motherId}::uuid, ${fatherId}::uuid)
  `)

  if (result && result.length > 0) {
    return result[0]
  }

  return { is_at_risk: false }
}

export async function addGoatTimelineImage(goatId: string, formData: FormData) {
  const user = await getAuthUser()

  const imageFile = formData.get('image') as File
  const caption = (formData.get('caption') as string) || null

  if (!imageFile || imageFile.size === 0) {
    throw new Error('Image file is required')
  }

  const imageUrl = await saveLocalImage(imageFile, user.id)

  await db.insert(goatImages).values({
    userId: user.id,
    goatId,
    imageUrl,
    caption
  })

  revalidatePath(`/dashboard/goats/${goatId}`)
}

export async function deleteGoatTimelineImage(id: string, goatId: string) {
  const user = await getAuthUser()
  await db.delete(goatImages).where(and(eq(goatImages.id, id), eq(goatImages.userId, user.id)))
  revalidatePath(`/dashboard/goats/${goatId}`)
}
