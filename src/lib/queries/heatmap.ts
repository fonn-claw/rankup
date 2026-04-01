import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

export interface HeatmapEntry {
  userId: number
  name: string
  teamId: number | null
  lastActivityAt: string | null
}

export async function getTeamHeatmap(): Promise<HeatmapEntry[]> {
  const result = await db.execute<{
    userId: number
    name: string
    teamId: number | null
    lastActivityAt: string | null
  }>(sql`
    SELECT
      u.id AS "userId",
      u.name,
      u.team_id AS "teamId",
      MAX(a.created_at)::text AS "lastActivityAt"
    FROM users u
    LEFT JOIN activities a ON a.user_id = u.id
      AND a.created_at >= date_trunc('day', NOW() AT TIME ZONE 'UTC')
    WHERE u.role = 'rep'
    GROUP BY u.id, u.name, u.team_id
    ORDER BY u.name
  `)

  return result.rows
}
