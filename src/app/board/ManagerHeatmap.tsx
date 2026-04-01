'use client'

import { UsersIcon } from '@/components/icons'

interface HeatmapEntry {
  userId: number
  name: string
  teamId: number | null
  lastActivityAt: string | null
}

type RepStatus = 'active' | 'idle' | 'inactive'

const STATUS_COLORS: Record<RepStatus, { bg: string; border: string; label: string }> = {
  active: { bg: 'rgba(16, 185, 129, 0.3)', border: '#10B981', label: 'Active' },
  idle: { bg: 'rgba(245, 158, 11, 0.3)', border: '#F59E0B', label: 'Idle' },
  inactive: { bg: 'rgba(239, 68, 68, 0.3)', border: '#EF4444', label: 'No Activity' },
}

function deriveStatus(lastActivityAt: string | null): RepStatus {
  if (!lastActivityAt) return 'inactive'
  const lastTime = new Date(lastActivityAt).getTime()
  const now = Date.now()
  const diffMin = (now - lastTime) / 1000 / 60
  if (diffMin <= 30) return 'active'
  return 'idle'
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function ManagerHeatmap({ heatmapData }: { heatmapData: HeatmapEntry[] }) {
  function handleCellClick(userId: number) {
    document
      .querySelector(`[data-user-id="${userId}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div className="bg-bg-surface rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <UsersIcon className="w-4 h-4 text-text-secondary" />
          <span className="font-heading text-sm text-text-secondary tracking-wider">
            TEAM ACTIVITY
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3">
          {(['active', 'idle', 'inactive'] as RepStatus[]).map((status) => (
            <div key={status} className="flex items-center gap-1">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: STATUS_COLORS[status].border }}
              />
              <span className="font-data text-[10px] text-text-secondary">
                {STATUS_COLORS[status].label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap cells */}
      <div className="flex flex-wrap gap-2">
        {heatmapData.map((rep) => {
          const status = deriveStatus(rep.lastActivityAt)
          const colors = STATUS_COLORS[status]

          return (
            <button
              key={rep.userId}
              onClick={() => handleCellClick(rep.userId)}
              title={`${rep.name} - ${colors.label}`}
              className="w-10 h-10 rounded flex items-center justify-center cursor-pointer transition-transform hover:scale-110"
              style={{
                backgroundColor: colors.bg,
                border: `1.5px solid ${colors.border}`,
              }}
            >
              <span className="font-data text-[10px] font-semibold text-text-primary">
                {getInitials(rep.name)}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
