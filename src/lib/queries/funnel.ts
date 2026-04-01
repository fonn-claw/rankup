import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

export interface FunnelResult {
  userId: number
  calls: number
  meetings: number
  demos: number
  deals: number
}

export async function getFunnel(userId?: number): Promise<FunnelResult[]> {
  const userFilter = userId !== undefined
    ? sql`AND a.user_id = ${userId}`
    : sql``

  const result = await db.execute<Record<string, unknown>>(sql`
    SELECT
      u.id AS "userId",
      COALESCE(COUNT(*) FILTER (WHERE a.type = 'call'), 0)::int AS calls,
      COALESCE(COUNT(*) FILTER (WHERE a.type = 'meeting'), 0)::int AS meetings,
      COALESCE(COUNT(*) FILTER (WHERE a.type = 'demo'), 0)::int AS demos,
      COALESCE(COUNT(*) FILTER (WHERE a.type = 'deal'), 0)::int AS deals
    FROM users u
    LEFT JOIN activities a ON a.user_id = u.id ${userFilter}
    WHERE u.role = 'rep'
    GROUP BY u.id
    ORDER BY u.id
  `)

  return result.rows as unknown as FunnelResult[]
}
