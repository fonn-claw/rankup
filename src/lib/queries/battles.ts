import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

export interface ActiveBattle {
  id: number
  team1Id: number
  team2Id: number
  team1Name: string
  team2Name: string
  startDate: string
  endDate: string
  status: string
}

export interface BattleTeamXp {
  teamId: number
  teamTotal: number
  members: { userId: number; name: string; xp: number }[]
}

export async function getActiveBattle(): Promise<ActiveBattle | null> {
  const now = new Date()
  const result = await db.execute<{
    id: number
    team1Id: number
    team2Id: number
    team1Name: string
    team2Name: string
    startDate: string
    endDate: string
    status: string
  }>(sql`
    SELECT
      b.id,
      b.team1_id AS "team1Id",
      b.team2_id AS "team2Id",
      t1.name AS "team1Name",
      t2.name AS "team2Name",
      b.start_date AS "startDate",
      b.end_date AS "endDate",
      COALESCE(b.status, 'active') AS status
    FROM battles b
    JOIN teams t1 ON t1.id = b.team1_id
    JOIN teams t2 ON t2.id = b.team2_id
    WHERE b.start_date <= ${now}
      AND b.end_date >= ${now}
      AND (b.status IS NULL OR b.status = 'active')
    ORDER BY b.start_date DESC
    LIMIT 1
  `)

  if (result.rows.length === 0) return null
  return result.rows[0]
}

export async function getBattleXp(
  team1Id: number,
  team2Id: number,
  startDate: Date,
  endDate: Date
): Promise<BattleTeamXp[]> {
  const result = await db.execute<{
    teamId: number
    teamTotal: number
    members: string
  }>(sql`
    WITH battle_xp AS (
      SELECT
        u.id AS user_id,
        u.name,
        u.team_id,
        COALESCE(SUM(a.xp_earned), 0)::int AS xp
      FROM users u
      LEFT JOIN activities a ON a.user_id = u.id
        AND a.created_at >= ${startDate}
        AND a.created_at <= ${endDate}
      WHERE u.team_id IN (${team1Id}, ${team2Id})
        AND u.role = 'rep'
      GROUP BY u.id, u.name, u.team_id
    )
    SELECT
      team_id AS "teamId",
      COALESCE(SUM(xp), 0)::int AS "teamTotal",
      json_agg(
        json_build_object('userId', user_id, 'name', name, 'xp', xp)
        ORDER BY xp DESC
      ) AS members
    FROM battle_xp
    GROUP BY team_id
  `)

  return result.rows.map((row) => ({
    teamId: row.teamId,
    teamTotal: row.teamTotal,
    members: typeof row.members === 'string' ? JSON.parse(row.members) : row.members,
  }))
}
