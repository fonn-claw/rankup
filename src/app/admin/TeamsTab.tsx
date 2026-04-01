import { UsersIcon } from '@/components/icons'

interface TeamStat {
  id: number
  name: string
  repCount: number
  totalXp: number
  avgXp: number
  inActiveBattle: boolean
}

export function TeamsTab({ teams }: { teams: TeamStat[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-bg-surface">
            <th className="font-heading text-xs text-text-muted uppercase tracking-wider text-left px-4 py-3">
              Team
            </th>
            <th className="font-heading text-xs text-text-muted uppercase tracking-wider text-right px-4 py-3">
              Reps
            </th>
            <th className="font-heading text-xs text-text-muted uppercase tracking-wider text-right px-4 py-3">
              Total XP
            </th>
            <th className="font-heading text-xs text-text-muted uppercase tracking-wider text-right px-4 py-3">
              Avg XP/Rep
            </th>
            <th className="font-heading text-xs text-text-muted uppercase tracking-wider text-center px-4 py-3">
              Battle Status
            </th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team, i) => (
            <tr
              key={team.id}
              className={i % 2 === 0 ? 'bg-bg-primary' : 'bg-bg-surface'}
            >
              <td className="font-data text-sm text-text-primary px-4 py-3">
                <span className="inline-flex items-center gap-2">
                  <UsersIcon className="w-4 h-4 text-text-secondary" />
                  {team.name}
                </span>
              </td>
              <td className="font-data text-sm text-text-secondary text-right px-4 py-3">
                {team.repCount}
              </td>
              <td className="font-data text-sm text-text-primary text-right px-4 py-3 font-semibold">
                {team.totalXp.toLocaleString()}
              </td>
              <td className="font-data text-sm text-text-secondary text-right px-4 py-3">
                {team.avgXp.toLocaleString()}
              </td>
              <td className="font-data text-sm text-center px-4 py-3">
                {team.inActiveBattle ? (
                  <span className="text-accent-green font-semibold">ACTIVE</span>
                ) : (
                  <span className="text-text-muted">--</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
