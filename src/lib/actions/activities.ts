'use server'

import { db } from '@/lib/db'
import { activities } from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { XP_VALUES } from '@/lib/constants'
import { revalidatePath } from 'next/cache'

export type ActivityType = keyof typeof XP_VALUES

export async function logActivity(
  type: ActivityType,
  metadata?: string
): Promise<{ success: true; xp: number; type: ActivityType }> {
  const session = await getSession()
  if (!session.isLoggedIn) {
    throw new Error('Not authenticated')
  }

  let totalXp = XP_VALUES[type]

  // Deal revenue bonus: $1 bonus XP per $1,000 revenue
  if (type === 'deal' && metadata) {
    try {
      const parsed = JSON.parse(metadata) as { dealName?: string; revenue?: number }
      if (parsed.revenue && parsed.revenue > 0) {
        totalXp += Math.floor(parsed.revenue / 1000)
      }
    } catch {
      // Invalid JSON metadata -- use base XP only
    }
  }

  await db.insert(activities).values({
    userId: session.userId,
    type,
    xpEarned: totalXp,
    metadata: metadata ?? null,
  })

  revalidatePath('/board')
  return { success: true, xp: totalXp, type }
}
