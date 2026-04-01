import { getSession } from '@/lib/auth/session'
import { getLeaderboard, getPreviousRanks, getTier } from '@/lib/queries/leaderboard'
import { getStreaks } from '@/lib/queries/streaks'
import { getFunnel } from '@/lib/queries/funnel'
import { db } from '@/lib/db'
import { teams } from '@/lib/db/schema'
import { BoardClient } from './BoardClient'
import type { BoardRow } from './BoardClient'

export default async function BoardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; team?: string }>
}) {
  const params = await searchParams
  const period = (['today', 'week', 'month', 'all'].includes(params.period ?? '')
    ? params.period
    : 'week') as 'today' | 'week' | 'month' | 'all'
  const teamId = params.team ? parseInt(params.team, 10) || null : null

  const session = await getSession()

  const [leaderboardRows, previousRanks, streaks, funnelData, teamsList] = await Promise.all([
    getLeaderboard({ period, teamId }),
    getPreviousRanks({ period, teamId }),
    getStreaks(),
    getFunnel(),
    db.select({ id: teams.id, name: teams.name, slug: teams.slug }).from(teams),
  ])

  // Merge previous ranks and streaks into rows
  const streakMap = new Map(streaks.map((s) => [s.userId, { count: s.currentStreak, active: s.streakActive }]))

  const rows: BoardRow[] = leaderboardRows.map((row) => ({
    ...row,
    prevRank: previousRanks.get(row.userId) ?? null,
    streak: streakMap.get(row.userId) ?? null,
  }))

  return (
    <BoardClient
      initialRows={rows}
      currentUserId={session.userId}
      currentUserName={session.name}
      teams={teamsList}
      funnelData={funnelData}
      currentPeriod={period}
      currentTeamId={teamId}
    />
  )
}
