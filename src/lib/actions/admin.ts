'use server'

import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { getSession } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'

export async function saveSettings(
  entries: { key: string; value: string }[]
): Promise<{ success: true }> {
  const session = await getSession()
  if (!session.isLoggedIn || session.role !== 'admin') {
    throw new Error('Unauthorized')
  }

  for (const entry of entries) {
    await db.execute(sql`
      INSERT INTO settings (key, value, updated_at, updated_by)
      VALUES (${entry.key}, ${entry.value}, NOW(), ${session.userId})
      ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value,
          updated_at = NOW(),
          updated_by = ${session.userId}
    `)
  }

  revalidatePath('/admin')
  return { success: true }
}
