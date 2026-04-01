'use client'

import { useOptimistic, startTransition, useState } from 'react'
import { usePolling } from '@/lib/hooks/usePolling'
import { getTier } from '@/lib/queries/leaderboard'
import { ScoreboardRow } from './ScoreboardRow'
import { FilterBar } from './FilterBar'
import { DealBellStack } from './DealBellStack'
import { ManagerHeatmap } from './ManagerHeatmap'
import { CreateSpiffPanel } from './CreateSpiffPanel'
import type { BoardRow } from './BoardClient'
import type { FunnelResult } from '@/lib/queries/funnel'
import type { HeatmapEntry } from '@/lib/queries/heatmap'

interface ManagerBoardClientProps {
  initialRows: BoardRow[]
  currentUserId: number
  currentUserName: string
  teams: { id: number; name: string; slug: string }[]
  funnelData: FunnelResult[]
  currentPeriod: string
  currentTeamId: number | null
  heatmapData: HeatmapEntry[]
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

export function ManagerBoardClient({
  initialRows,
  currentUserId,
  teams,
  funnelData,
  currentPeriod,
  currentTeamId,
  heatmapData,
}: ManagerBoardClientProps) {
  usePolling(15000)

  const [optimisticRows] = useOptimistic(initialRows, reducer)
  const [showSpiffPanel, setShowSpiffPanel] = useState(false)

  // Build funnel lookup
  const funnelMap = new Map(funnelData.map((f) => [f.userId, f]))

  // Max XP for bar percentages
  const maxXp = optimisticRows.length > 0 ? Math.max(...optimisticRows.map((r) => r.totalXp)) : 1

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-4 space-y-3">
      <DealBellStack />

      {/* Filter bar + CREATE SPIFF button */}
      <div className="flex items-center justify-between gap-4">
        <FilterBar
          currentPeriod={currentPeriod}
          currentTeamId={currentTeamId}
          teams={teams}
        />
        <button
          onClick={() => setShowSpiffPanel(true)}
          className="bg-accent-cyan text-bg-primary font-heading text-xs font-semibold px-3 py-1.5 rounded whitespace-nowrap hover:bg-accent-cyan/90 transition-colors"
        >
          CREATE SPIFF
        </button>
      </div>

      {/* Heatmap */}
      <ManagerHeatmap heatmapData={heatmapData} />

      {/* Scoreboard rows with conversion column */}
      <div className="space-y-0">
        {optimisticRows.map((row) => {
          const funnel = funnelMap.get(row.userId)
          let conversionRate: number | null = null
          let coachingFlag = false

          if (funnel) {
            if (funnel.calls > 0) {
              conversionRate = (funnel.meetings / funnel.calls) * 100
              coachingFlag = funnel.calls >= 15 && conversionRate < 5
            }
          }

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
              streakAtRisk={false}
              conversionRate={conversionRate}
              coachingFlag={coachingFlag}
            />
          )
        })}
      </div>

      {/* SPIFF creation panel */}
      <CreateSpiffPanel
        isOpen={showSpiffPanel}
        onClose={() => setShowSpiffPanel(false)}
      />
    </div>
  )
}
