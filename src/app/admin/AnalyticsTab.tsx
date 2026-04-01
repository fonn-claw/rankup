interface EngagementDay {
  day: string
  activeReps: number
  totalActivities: number
}

function BarChart({
  data,
  valueKey,
  color,
}: {
  data: EngagementDay[]
  valueKey: 'activeReps' | 'totalActivities'
  color: string
}) {
  const max = Math.max(...data.map((d) => d[valueKey]), 1)

  return (
    <div className="flex items-end gap-1 h-40">
      {data.map((d) => {
        const pct = (d[valueKey] / max) * 100
        return (
          <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-t"
              style={{
                height: `${pct}%`,
                backgroundColor: color,
                minHeight: d[valueKey] > 0 ? '2px' : '0px',
              }}
              title={`${d.day}: ${d[valueKey]}`}
            />
            <span className="font-data text-[10px] text-text-muted leading-none">
              {formatDay(d.day)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function formatDay(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getMonth() + 1}/${String(d.getDate()).padStart(2, '0')}`
}

export function AnalyticsTab({ data }: { data: EngagementDay[] }) {
  const recent = data.slice(-14)

  if (recent.length === 0) {
    return (
      <p className="font-data text-sm text-text-muted py-8">No activity data yet</p>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <section>
        <h3 className="font-heading text-sm text-text-secondary tracking-wider uppercase mb-4">
          Daily Active Reps
        </h3>
        <BarChart data={recent} valueKey="activeReps" color="rgba(6, 214, 242, 0.6)" />
      </section>
      <section>
        <h3 className="font-heading text-sm text-text-secondary tracking-wider uppercase mb-4">
          Total Activities
        </h3>
        <BarChart data={recent} valueKey="totalActivities" color="rgba(6, 214, 242, 0.6)" />
      </section>
    </div>
  )
}
