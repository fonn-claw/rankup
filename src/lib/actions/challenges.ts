'use server'

import { db } from '@/lib/db'
import { challenges } from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'

export async function createChallenge(formData: FormData): Promise<{ success: true }> {
  const session = await getSession()
  if (!session.isLoggedIn || session.role !== 'manager') {
    throw new Error('Unauthorized')
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const goalType = formData.get('goalType') as string
  const goalValue = parseInt(formData.get('goalValue') as string, 10)
  const startDate = new Date(formData.get('startDate') as string)
  const endDate = new Date(formData.get('endDate') as string)

  // Validation
  if (!title || title.trim().length === 0) {
    throw new Error('Title is required')
  }
  if (!goalValue || goalValue <= 0) {
    throw new Error('Goal value must be greater than 0')
  }
  if (isNaN(endDate.getTime()) || isNaN(startDate.getTime())) {
    throw new Error('Valid start and end dates are required')
  }
  if (endDate <= startDate) {
    throw new Error('End date must be after start date')
  }

  await db.insert(challenges).values({
    title: title.trim(),
    description: description?.trim() || null,
    goalType,
    goalValue,
    startDate,
    endDate,
    createdBy: session.userId,
  })

  revalidatePath('/board/battles')
  return { success: true }
}
