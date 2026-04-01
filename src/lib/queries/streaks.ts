import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { ACTIVITY_STREAK_THRESHOLD } from '@/lib/constants'

export interface StreakResult {
  userId: number
  currentStreak: number
  streakActive: boolean
}

export async function getStreaks(): Promise<StreakResult[]> {
  const result = await db.execute<{
    userId: number
    currentStreak: number
    streakActive: boolean
  }>(sql`
    WITH daily_calls AS (
      SELECT
        user_id,
        date_trunc('day', created_at)::date AS activity_date,
        COUNT(*) FILTER (WHERE type = 'call') AS call_count
      FROM activities
      WHERE EXTRACT(DOW FROM created_at) NOT IN (0, 6)
      GROUP BY user_id, date_trunc('day', created_at)::date
    ),
    qualifying_days AS (
      SELECT user_id, activity_date
      FROM daily_calls
      WHERE call_count >= ${ACTIVITY_STREAK_THRESHOLD}
    ),
    business_days_numbered AS (
      SELECT
        user_id,
        activity_date,
        activity_date - (ROW_NUMBER() OVER (
          PARTITION BY user_id ORDER BY activity_date
        ))::int AS streak_group
      FROM qualifying_days
    ),
    streak_groups AS (
      SELECT
        user_id,
        COUNT(*)::int AS streak_length,
        MAX(activity_date) AS last_day
      FROM business_days_numbered
      GROUP BY user_id, streak_group
    )
    SELECT DISTINCT ON (user_id)
      user_id AS "userId",
      streak_length AS "currentStreak",
      CASE
        WHEN last_day >= (
          CASE EXTRACT(DOW FROM CURRENT_DATE)
            WHEN 0 THEN CURRENT_DATE - 2
            WHEN 1 THEN CURRENT_DATE - 3
            WHEN 6 THEN CURRENT_DATE - 1
            ELSE CURRENT_DATE - 1
          END
        ) THEN true
        ELSE false
      END AS "streakActive"
    FROM streak_groups
    ORDER BY user_id, last_day DESC
  `)

  return result.rows
}
