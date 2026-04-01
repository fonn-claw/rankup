'use client'

import { TierBadge } from '@/components/TierBadge'
import { FlameIcon } from '@/components/icons'
import { ConversionFunnel } from './ConversionFunnel'

interface PinnedPositionProps {
  rank: number
  name: string
  totalXp: number
  todayXp: number
  tier: 'gold' | 'silver' | 'bronze'
  streak: { count: number; active: boolean } | null
  gapMessage: string | null
  funnelData: { calls: number; meetings: number; demos: number; deals: number } | null
  tierPromotion: string | null
}

export function PinnedPosition({
  rank,
  name,
  totalXp,
  todayXp,
  tier,
  streak,
  gapMessage,
  funnelData,
  tierPromotion,
}: PinnedPositionProps) {
  return (
    <div className="h-24 bg-bg-surface border-l-4 border-accent-cyan px-4 flex flex-col justify-center bg-gradient-to-b from-bg-surface to-transparent">
      {/* Top row */}
      <div className="flex items-center gap-3">
        <span className="font-heading text-3xl font-bold text-text-primary">
          #{rank}
        </span>
        <span className="font-data text-sm text-text-primary">{name}</span>
        <TierBadge tier={tier} />
        <span className="font-data text-lg text-text-primary ml-auto">
          {totalXp.toLocaleString()} XP
        </span>
        {todayXp > 0 && (
          <span className="font-data text-sm text-accent-green">
            +{todayXp} today
          </span>
        )}
      </div>

      {/* Bottom row */}
      <div className="flex items-center gap-4 mt-1">
        {gapMessage && (
          <span className="font-data text-sm text-accent-amber">
            {gapMessage}
          </span>
        )}
        {tierPromotion && (
          <span className="font-data text-sm text-accent-cyan animate-pulse">
            {tierPromotion}
          </span>
        )}
        {streak && streak.active && (
          <div className="flex items-center gap-1">
            <FlameIcon className="w-4 h-4 text-accent-amber" />
            <span className="font-data text-xs text-accent-amber">
              {streak.count}d streak
            </span>
          </div>
        )}
        {funnelData && (
          <div className="ml-auto">
            <ConversionFunnel {...funnelData} />
          </div>
        )}
      </div>
    </div>
  )
}
