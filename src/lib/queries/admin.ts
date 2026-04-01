import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

export interface TeamStat {
  id: number
  name: string
  repCount: number
  totalXp: number
  avgXp: number
  inActiveBattle: boolean
}

export async function getTeamStats(): Promise<TeamStat[]> {
  const result = await db.execute<{
    id: number
    name: string
    repCount: number
    totalXp: number
    avgXp: number
    inActiveBattle: boolean
  }>(sql`
    SELECT
      t.id,
      t.name,
      COUNT(DISTINCT u.id)::int AS "repCount",
      COALESCE(SUM(a.xp_earned), 0)::int AS "totalXp",
      COALESCE(
        SUM(a.xp_earned) / NULLIF(COUNT(DISTINCT u.id), 0),
        0
      )::int AS "avgXp",
      EXISTS(
        SELECT 1 FROM battles b
        WHERE (b.team1_id = t.id OR b.team2_id = t.id)
          AND b.status = 'active'
          AND b.start_date <= NOW()
          AND b.end_date >= NOW()
      ) AS "inActiveBattle"
    FROM teams t
    LEFT JOIN users u ON u.team_id = t.id AND u.role = 'rep'
    LEFT JOIN activities a ON a.user_id = u.id
    GROUP BY t.id, t.name
    ORDER BY "totalXp" DESC
  `)

  return result.rows
}

export interface EngagementDay {
  day: string
  activeReps: number
  totalActivities: number
}

export async function getEngagementData(days: number = 30): Promise<EngagementDay[]> {
  const result = await db.execute<{
    day: string
    activeReps: number
    totalActivities: number
  }>(sql`
    SELECT
      date_trunc('day', a.created_at)::date::text AS "day",
      COUNT(DISTINCT a.user_id)::int AS "activeReps",
      COUNT(*)::int AS "totalActivities"
    FROM activities a
    WHERE a.created_at >= NOW() - make_interval(days => ${days})
    GROUP BY date_trunc('day', a.created_at)::date
    ORDER BY "day" ASC
  `)

  return result.rows
}

export async function getSettings(): Promise<Map<string, string>> {
  const result = await db.execute<{ key: string; value: string }>(sql`
    SELECT key, value FROM settings
  `)

  const map = new Map<string, string>()
  for (const row of result.rows) {
    map.set(row.key, row.value)
  }
  return map
}
