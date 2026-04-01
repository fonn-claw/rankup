'use client'

import { useCountdown } from '@/lib/hooks/useCountdown'
import { LightningIcon } from '@/components/icons'

interface BattleMember {
  userId: number
  name: string
  xp: number
}

interface BattleVersusProps {
  team1Name: string
  team2Name: string
  team1Xp: number
  team2Xp: number
  team1Members: BattleMember[]
  team2Members: BattleMember[]
  endDate: string
}

function TeamSide({
  name,
  totalXp,
  members,
  isLeading,
  sharePercent,
  side,
}: {
  name: string
  totalXp: number
  members: BattleMember[]
  isLeading: boolean
  sharePercent: number
  side: 'left' | 'right'
}) {
  return (
    <div
      className={`flex-1 p-4 md:p-6 rounded-lg border transition-shadow ${
        isLeading
          ? 'border-accent-cyan/50 shadow-[0_0_30px_rgba(6,214,242,0.3)]'
          : 'border-bg-surface-hover'
      }`}
    >
      <div className={`text-center ${side === 'right' ? 'md:text-center' : 'md:text-center'}`}>
        <h3 className="font-heading text-xl md:text-2xl font-bold text-text-primary uppercase tracking-wide">
          {name}
        </h3>
        <p className="font-data text-2xl md:text-3xl font-bold text-accent-cyan mt-1">
          {totalXp.toLocaleString()} <span className="text-sm text-text-secondary">XP</span>
        </p>
      </div>

      {/* XP Progress Bar */}
      <div className="mt-3 h-2 bg-bg-primary rounded-full overflow-hidden">
        <div
          className="h-full bg-accent-cyan rounded-full transition-all duration-500"
          style={{ width: `${sharePercent}%` }}
        />
      </div>

      {/* Member Contributions */}
      <div className="mt-4 space-y-1.5">
        {members.slice(0, 5).map((member) => (
          <div key={member.userId} className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-bg-surface-hover flex items-center justify-center shrink-0">
              <span className="font-data text-[10px] text-text-secondary uppercase">
                {member.name.charAt(0)}
              </span>
            </div>
            <span className="font-data text-xs text-text-secondary truncate flex-1">
              {member.name}
            </span>
            <span className="font-data text-xs text-text-primary tabular-nums">
              {member.xp.toLocaleString()}
            </span>
          </div>
        ))}
        {members.length > 5 && (
          <p className="font-data text-[10px] text-text-muted text-center">
            +{members.length - 5} more
          </p>
        )}
      </div>
    </div>
  )
}

export function BattleVersus({
  team1Name,
  team2Name,
  team1Xp,
  team2Xp,
  team1Members,
  team2Members,
  endDate,
}: BattleVersusProps) {
  const { days, hours, minutes, expired } = useCountdown(endDate)
  const totalXp = team1Xp + team2Xp || 1
  const team1Share = Math.round((team1Xp / totalXp) * 100)
  const team2Share = Math.round((team2Xp / totalXp) * 100)
  const team1Leading = team1Xp >= team2Xp
  const team2Leading = team2Xp > team1Xp

  return (
    <div
      className="relative rounded-xl overflow-hidden"
      style={{
        backgroundImage: 'url(/assets/bg-battle.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-bg-primary/85" />

      <div className="relative z-10 p-4 md:p-6">
        {/* Header */}
        <h2 className="font-heading text-sm font-semibold text-text-muted uppercase tracking-widest text-center mb-4">
          TEAM BATTLE
        </h2>

        {/* Versus Layout */}
        <div className="flex items-stretch gap-3 md:gap-6">
          <TeamSide
            name={team1Name}
            totalXp={team1Xp}
            members={team1Members}
            isLeading={team1Leading}
            sharePercent={team1Share}
            side="left"
          />

          {/* Center Divider */}
          <div className="flex flex-col items-center justify-center gap-2 shrink-0">
            <LightningIcon className="w-8 h-8 text-accent-amber" />
            {expired ? (
              <span className="font-heading text-xs font-bold text-accent-amber uppercase">
                BATTLE COMPLETE
              </span>
            ) : (
              <span className="font-data text-xs text-text-secondary whitespace-nowrap">
                {days}d {hours}h {minutes}m
              </span>
            )}
          </div>

          <TeamSide
            name={team2Name}
            totalXp={team2Xp}
            members={team2Members}
            isLeading={team2Leading}
            sharePercent={team2Share}
            side="right"
          />
        </div>
      </div>
    </div>
  )
}
