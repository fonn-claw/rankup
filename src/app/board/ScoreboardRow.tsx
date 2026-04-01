'use client'

import { TierBadge } from '@/components/TierBadge'
import { FlameIcon, ArrowUpIcon, ArrowDownIcon, TargetIcon } from '@/components/icons'

interface ScoreboardRowProps {
  rank: number
  userId: number
  name: string
  tier: 'gold' | 'silver' | 'bronze'
  totalXp: number
  todayXp: number
  prevRank: number | null
  streak: { count: number; active: boolean } | null
  isTop3: boolean
  isCurrentUser: boolean
  maxXp: number
  streakAtRisk: boolean
  conversionRate?: number | null
  coachingFlag?: boolean
}

const TIER_BORDER_COLORS: Record<string, string> = {
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
}

export function ScoreboardRow({
  rank,
  userId,
  name,
  tier,
  totalXp,
  todayXp,
  prevRank,
  streak,
  isTop3,
  isCurrentUser,
  maxXp,
  streakAtRisk,
  conversionRate,
  coachingFlag,
}: ScoreboardRowProps) {
  const bgClass =
    rank % 2 === 0 ? 'bg-bg-primary' : 'bg-bg-surface'
  const highlightClass = isCurrentUser ? 'bg-accent-cyan/5' : ''
  const xpPct = maxXp > 0 ? Math.min((totalXp / maxXp) * 100, 100) : 0

  // Movement indicator
  let movementEl: React.ReactNode
  if (prevRank === null || prevRank === rank) {
    movementEl = <span className="text-text-muted text-xs">&mdash;</span>
  } else if (rank < prevRank) {
    movementEl = <ArrowUpIcon className="w-4 h-4 text-accent-green" />
  } else {
    movementEl = <ArrowDownIcon className="w-4 h-4 text-accent-red" />
  }

  // Streak element
  let streakEl: React.ReactNode = null
  if (streak) {
    if (streakAtRisk) {
      streakEl = (
        <div className="flex items-center gap-0.5 animate-pulse">
          <FlameIcon className="w-5 h-5 text-accent-amber" />
          <span className="font-data text-xs text-accent-amber">
            {streak.count}d
          </span>
        </div>
      )
    } else if (streak.active) {
      streakEl = (
        <div className="flex items-center gap-0.5">
          <FlameIcon className="w-5 h-5 text-accent-amber" />
          <span className="font-data text-xs text-accent-amber">
            {streak.count}d
          </span>
        </div>
      )
    } else {
      streakEl = (
        <div className="flex items-center gap-0.5">
          <FlameIcon className="w-5 h-5 text-text-muted opacity-50" />
          <span className="font-data text-xs text-text-muted line-through">
            {streak.count}d
          </span>
        </div>
      )
    }
  }

  // Initial for avatar
  const initial = name.charAt(0).toUpperCase()

  return (
    <div
      data-user-id={userId}
      className={`h-16 flex items-center px-4 gap-3 ${bgClass} ${highlightClass} ${
        isTop3 ? 'border-l-2 shadow-[inset_0_0_20px_rgba(6,214,242,0.05)]' : ''
      }`}
      style={isTop3 ? { borderLeftColor: TIER_BORDER_COLORS[tier] } : undefined}
    >
      {/* Rank */}
      <div className="w-12 shrink-0 text-center">
        <span className="font-heading text-[28px] font-bold text-text-primary leading-none">
          {rank}
        </span>
      </div>

      {/* Movement arrow */}
      <div className="w-4 shrink-0 flex items-center justify-center">
        {movementEl}
      </div>

      {/* Name + avatar */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div
          className="w-7 h-7 rounded-full bg-accent-cyan/20 flex items-center justify-center shrink-0"
        >
          <span className="font-heading text-xs font-semibold text-accent-cyan">
            {initial}
          </span>
        </div>
        <span className="font-data text-sm text-text-primary truncate">
          {name}
        </span>
      </div>

      {/* Tier badge */}
      <div className="shrink-0">
        <TierBadge tier={tier} />
      </div>

      {/* XP bar + number */}
      <div className="w-[120px] shrink-0">
        <div className="bg-bg-primary rounded-full h-2 w-full overflow-hidden">
          <div
            className="bg-accent-cyan rounded-full h-2 transition-all duration-300"
            style={{ width: `${xpPct}%` }}
          />
        </div>
        <p className="font-data text-xs text-text-secondary mt-0.5">
          {totalXp.toLocaleString()} XP
        </p>
      </div>

      {/* Today's change */}
      <div className="w-16 shrink-0 text-right">
        {todayXp > 0 ? (
          <span className="font-data text-sm text-accent-green">
            +{todayXp}
          </span>
        ) : (
          <span className="font-data text-sm text-text-muted">&mdash;</span>
        )}
      </div>

      {/* Conversion rate (manager view only) */}
      {conversionRate !== undefined && (
        <div className="w-16 shrink-0 flex items-center justify-end gap-1">
          {coachingFlag && (
            <TargetIcon className="w-3.5 h-3.5 text-accent-amber" />
          )}
          <span className="font-data text-xs text-text-secondary">
            {conversionRate !== null ? `${conversionRate.toFixed(1)}%` : '\u2014'}
          </span>
        </div>
      )}

      {/* Streak */}
      <div className="w-14 shrink-0 flex items-center justify-end">
        {streakEl}
      </div>
    </div>
  )
}
