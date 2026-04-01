import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

export interface ActiveChallenge {
  id: number
  title: string
  description: string | null
  goalType: string
  goalValue: number
  endDate: string
  progress: number
}

export async function getActiveChallenges(userId: number): Promise<ActiveChallenge[]> {
  const result = await db.execute<{
    id: number
    title: string
    description: string | null
    goalType: string
    goalValue: number
    endDate: string
    progress: number
  }>(sql`
    SELECT
      c.id,
      c.title,
      c.description,
      c.goal_type AS "goalType",
      c.goal_value AS "goalValue",
      c.end_date AS "endDate",
      COALESCE(cp.progress, 0)::int AS progress
    FROM challenges c
    LEFT JOIN challenge_participants cp
      ON cp.challenge_id = c.id AND cp.user_id = ${userId}
    WHERE c.start_date <= NOW() AND c.end_date >= NOW()
    ORDER BY c.end_date ASC
  `)

  return result.rows
}
