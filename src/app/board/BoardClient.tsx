'use client'

import { useOptimistic, startTransition, useState, useCallback } from 'react'
import { usePolling } from '@/lib/hooks/usePolling'
import { getGapMessage, getTier } from '@/lib/queries/leaderboard'
import { TIER_THRESHOLDS } from '@/lib/constants'
import { ScoreboardRow } from './ScoreboardRow'
import { PinnedPosition } from './PinnedPosition'
import { FilterBar } from './FilterBar'
import { ActivityFAB } from './ActivityFAB'
import { DealBellStack } from './DealBellStack'
import type { FunnelResult } from '@/lib/queries/funnel'

export interface BoardRow {
  userId: number
  name: string
  teamId: number | null
  teamSlug: string | null
  totalXp: number
  todayXp: number
  rank: number
  prevRank: number | null
  streak: { count: number; active: boolean } | null
}

interface BoardClientProps {
  initialRows: BoardRow[]
  currentUserId: number
  currentUserName: string
  teams: { id: number; name: string; slug: string }[]
  funnelData: FunnelResult[]
  currentPeriod: string
  currentTeamId: number | null
}

type OptimisticAction = { userId: number; xpGain: number }

function reducer(rows: BoardRow[], action: OptimisticAction): BoardRow[] {
  return rows
    .map((r) =>
      r.userId === action.userId
        ? { ...r, totalXp: r.totalXp + action.xpGain, todayXp: r.todayXp + action.xpGain }
        : r
    )
    .sort((a, b) => b.totalXp - a.totalXp)
    .map((r, i) => ({ ...r, rank: i + 1 }))
}

export function BoardClient({
  initialRows,
  currentUserId,
  currentUserName,
  teams,
  funnelData,
  currentPeriod,
  currentTeamId,
}: BoardClientProps) {
  usePolling(15000)

  const [optimisticRows, setOptimisticRows] = useOptimistic(initialRows, reducer)
  const [tierPromotion, setTierPromotion] = useState<string | null>(null)

  const handleOptimisticUpdate = useCallback(
    (xpGain: number) => {
      // Detect tier promotion
      const currentRow = initialRows.find((r) => r.userId === currentUserId)
      if (currentRow) {
        const oldTier = getTier(currentRow.totalXp)
        const newTier = getTier(currentRow.totalXp + xpGain)
        if (oldTier !== newTier) {
          const label = TIER_THRESHOLDS[newTier].label
          setTierPromotion(`Promoted to ${label}!`)
          setTimeout(() => setTierPromotion(null), 5000)
        }
      }

      startTransition(() => {
        setOptimisticRows({ userId: currentUserId, xpGain })
      })
    },
    [currentUserId, initialRows, setOptimisticRows]
  )

  // Compute data for current user
  const currentUserRow = optimisticRows.find((r) => r.userId === currentUserId)
  const currentUserFunnel = funnelData.find((f) => f.userId === currentUserId) ?? null

  // Gap message
  let gapMsg: string | null = null
  if (currentUserRow) {
    if (currentUserRow.rank === 1) {
      gapMsg = "You're #1!"
    } else {
      const rowAbove = optimisticRows.find((r) => r.rank === currentUserRow.rank - 1)
      if (rowAbove) {
        gapMsg = getGapMessage(currentUserRow.totalXp, rowAbove.totalXp, rowAbove.rank)
      }
    }
  }

  // Max XP for bar percentages
  const maxXp = optimisticRows.length > 0 ? Math.max(...optimisticRows.map((r) => r.totalXp)) : 1

  // Streak at-risk check: current user, active streak, todayXp === 0, past noon UTC
  const isAfterNoon = new Date().getUTCHours() >= 12

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-4 space-y-3 pb-24">
      <DealBellStack />

      <FilterBar
        currentPeriod={currentPeriod}
        currentTeamId={currentTeamId}
        teams={teams}
      />

      {currentUserRow && (
        <PinnedPosition
          rank={currentUserRow.rank}
          name={currentUserName}
          totalXp={currentUserRow.totalXp}
          todayXp={currentUserRow.todayXp}
          tier={getTier(currentUserRow.totalXp)}
          streak={currentUserRow.streak}
          gapMessage={gapMsg}
          funnelData={currentUserFunnel}
          tierPromotion={tierPromotion}
        />
      )}

      <div className="space-y-0">
        {optimisticRows.map((row) => {
          const streakAtRisk =
            row.userId === currentUserId &&
            row.streak !== null &&
            row.streak.active &&
            row.todayXp === 0 &&
            isAfterNoon

          return (
            <ScoreboardRow
              key={row.userId}
              rank={row.rank}
              userId={row.userId}
              name={row.name}
              tier={getTier(row.totalXp)}
              totalXp={row.totalXp}
              todayXp={row.todayXp}
              prevRank={row.prevRank}
              streak={row.streak}
              isTop3={row.rank <= 3}
              isCurrentUser={row.userId === currentUserId}
              maxXp={maxXp}
              streakAtRisk={streakAtRisk}
            />
          )
        })}
      </div>

      {currentUserRow && (
        <ActivityFAB
          currentUserId={currentUserId}
          currentXp={currentUserRow.totalXp}
          onOptimisticUpdate={handleOptimisticUpdate}
        />
      )}
    </div>
  )
}
