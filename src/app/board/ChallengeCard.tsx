'use client'

import { useCountdown } from '@/lib/hooks/useCountdown'
import { TrophyIcon } from '@/components/icons'

interface ChallengeCardProps {
  title: string
  description: string | null
  goalType: string
  goalValue: number
  progress: number
  endDate: string
}

export function ChallengeCard({
  title,
  description,
  goalType,
  goalValue,
  progress,
  endDate,
}: ChallengeCardProps) {
  const { days, hours, expired } = useCountdown(endDate)
  const percent = Math.min(Math.round((progress / goalValue) * 100), 100)

  return (
    <div className="bg-bg-surface rounded-lg p-4 relative">
      {/* Trophy icon top-right */}
      <TrophyIcon className="absolute top-4 right-4 w-5 h-5 text-accent-amber" />

      {/* Title + description */}
      <h3 className="font-heading text-lg font-semibold text-text-primary pr-8">{title}</h3>
      {description && (
        <p className="font-data text-sm text-text-secondary mt-1">{description}</p>
      )}

      {/* Progress bar */}
      <div className="mt-3 h-2 bg-bg-primary rounded-full overflow-hidden">
        <div
          className="h-full bg-accent-cyan rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Progress text + countdown */}
      <div className="mt-2 flex items-center justify-between">
        <span className="font-data text-sm text-text-primary">
          {progress}/{goalValue} {goalType}s
        </span>
        {expired ? (
          <span className="text-xs font-data text-accent-red uppercase">ENDED</span>
        ) : (
          <span className="text-xs font-data text-text-muted">
            {days}d {hours}h remaining
          </span>
        )}
      </div>
    </div>
  )
}
