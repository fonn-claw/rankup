import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { XP_VALUES, TIER_THRESHOLDS } from '@/lib/constants'

export interface LeaderboardRow {
  userId: number
  name: string
  teamId: number | null
  teamSlug: string | null
  totalXp: number
  todayXp: number
  rank: number
  prevRank: number | null
}

export async function getLeaderboard(opts: {
  period: 'today' | 'week' | 'month' | 'all'
  teamId: number | null
}): Promise<LeaderboardRow[]> {
  const periodFilter = {
    today: sql`AND a.created_at >= date_trunc('day', NOW() AT TIME ZONE 'UTC')`,
    week: sql`AND a.created_at >= date_trunc('week', NOW() AT TIME ZONE 'UTC')`,
    month: sql`AND a.created_at >= date_trunc('month', NOW() AT TIME ZONE 'UTC')`,
    all: sql``,
  }[opts.period]

  const teamFilter = opts.teamId
    ? sql`AND u.team_id = ${opts.teamId}`
    : sql``

  const result = await db.execute<{
    userId: number
    name: string
    teamId: number | null
    teamSlug: string | null
    totalXp: number
    todayXp: number
    rank: number
  }>(sql`
    WITH period_xp AS (
      SELECT
        u.id AS "userId",
        u.name,
        u.team_id AS "teamId",
        t.slug AS "teamSlug",
        COALESCE(SUM(a.xp_earned), 0)::int AS "totalXp",
        COALESCE(SUM(CASE
          WHEN a.created_at >= date_trunc('day', NOW() AT TIME ZONE 'UTC')
          THEN a.xp_earned ELSE 0
        END), 0)::int AS "todayXp"
      FROM users u
      LEFT JOIN teams t ON t.id = u.team_id
      LEFT JOIN activities a ON a.user_id = u.id
        ${periodFilter}
      WHERE u.role = 'rep' ${teamFilter}
      GROUP BY u.id, u.name, u.team_id, t.slug
    )
    SELECT
      *,
      RANK() OVER (ORDER BY "totalXp" DESC)::int AS rank
    FROM period_xp
    ORDER BY rank ASC
  `)

  return result.rows.map((row) => ({
    ...row,
    prevRank: null,
  }))
}

export async function getPreviousRanks(opts: {
  period: 'today' | 'week' | 'month' | 'all'
  teamId: number | null
}): Promise<Map<number, number>> {
  if (opts.period === 'all') return new Map()

  const periodRange = {
    today: {
      start: sql`date_trunc('day', NOW() AT TIME ZONE 'UTC') - interval '1 day'`,
      end: sql`date_trunc('day', NOW() AT TIME ZONE 'UTC')`,
    },
    week: {
      start: sql`date_trunc('week', NOW() AT TIME ZONE 'UTC') - interval '1 week'`,
      end: sql`date_trunc('week', NOW() AT TIME ZONE 'UTC')`,
    },
    month: {
      start: sql`date_trunc('month', NOW() AT TIME ZONE 'UTC') - interval '1 month'`,
      end: sql`date_trunc('month', NOW() AT TIME ZONE 'UTC')`,
    },
  }[opts.period]

  const teamFilter = opts.teamId
    ? sql`AND u.team_id = ${opts.teamId}`
    : sql``

  const result = await db.execute<{ userId: number; rank: number }>(sql`
    WITH prev_xp AS (
      SELECT
        u.id AS "userId",
        COALESCE(SUM(a.xp_earned), 0)::int AS "totalXp"
      FROM users u
      LEFT JOIN activities a ON a.user_id = u.id
        AND a.created_at >= ${periodRange.start}
        AND a.created_at < ${periodRange.end}
      WHERE u.role = 'rep' ${teamFilter}
      GROUP BY u.id
    )
    SELECT
      "userId",
      RANK() OVER (ORDER BY "totalXp" DESC)::int AS rank
    FROM prev_xp
  `)

  const map = new Map<number, number>()
  for (const row of result.rows) {
    map.set(row.userId, row.rank)
  }
  return map
}

export function getGapMessage(
  currentXP: number,
  nextRankXP: number,
  nextRankPosition: number
): string {
  const gap = nextRankXP - currentXP + 1
  if (gap <= 0) return ''

  const callsNeeded = Math.ceil(gap / XP_VALUES.call)
  if (callsNeeded <= 5) {
    return `${callsNeeded} call${callsNeeded > 1 ? 's' : ''} to pass #${nextRankPosition}`
  }

  const meetingsNeeded = Math.ceil(gap / XP_VALUES.meeting)
  if (meetingsNeeded <= 3) {
    return `${meetingsNeeded} meeting${meetingsNeeded > 1 ? 's' : ''} to pass #${nextRankPosition}`
  }

  return `${gap} XP to pass #${nextRankPosition}`
}

export function getTier(xp: number): 'gold' | 'silver' | 'bronze' {
  if (xp >= TIER_THRESHOLDS.gold.min) return 'gold'
  if (xp >= TIER_THRESHOLDS.silver.min) return 'silver'
  return 'bronze'
}
