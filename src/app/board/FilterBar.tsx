'use client'

import Link from 'next/link'

const PERIODS = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'All Time', value: 'all' },
] as const

interface FilterBarProps {
  currentPeriod: string
  currentTeamId: number | null
  teams: { id: number; name: string; slug: string }[]
}

export function FilterBar({ currentPeriod, currentTeamId, teams }: FilterBarProps) {
  const teamParam = currentTeamId ? `&team=${currentTeamId}` : ''
  const periodParam = (p: string) => `?period=${p}${currentTeamId ? `&team=${currentTeamId}` : ''}`
  const teamLink = (teamId: number | null) =>
    `?period=${currentPeriod}${teamId ? `&team=${teamId}` : ''}`

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Time period pills */}
      {PERIODS.map((p) => (
        <Link
          key={p.value}
          href={periodParam(p.value)}
          className={`px-3 py-1 rounded-full font-data text-xs transition-colors ${
            currentPeriod === p.value
              ? 'bg-accent-cyan text-bg-primary font-semibold'
              : 'bg-bg-surface text-text-secondary hover:bg-bg-surface-hover'
          }`}
        >
          {p.label}
        </Link>
      ))}

      {/* Divider */}
      <div className="w-px h-5 bg-bg-surface-hover mx-1" />

      {/* Team pills */}
      <Link
        href={teamLink(null)}
        className={`px-3 py-1 rounded-full font-data text-xs transition-colors ${
          currentTeamId === null
            ? 'bg-accent-cyan text-bg-primary font-semibold'
            : 'bg-bg-surface text-text-secondary hover:bg-bg-surface-hover'
        }`}
      >
        All
      </Link>
      {teams.map((t) => (
        <Link
          key={t.id}
          href={teamLink(t.id)}
          className={`px-3 py-1 rounded-full font-data text-xs transition-colors ${
            currentTeamId === t.id
              ? 'bg-accent-cyan text-bg-primary font-semibold'
              : 'bg-bg-surface text-text-secondary hover:bg-bg-surface-hover'
          }`}
        >
          {t.name}
        </Link>
      ))}
    </div>
  )
}
