export function ConversionFunnel({
  calls,
  meetings,
  demos,
  deals,
}: {
  calls: number
  meetings: number
  demos: number
  deals: number
}) {
  const pct = (num: number, denom: number) =>
    denom > 0 ? `${Math.round((num / denom) * 100)}%` : '\u2014'

  return (
    <span className="font-data text-xs text-text-secondary">
      {calls}C &rarr; {meetings}M ({pct(meetings, calls)}) &rarr; {demos}D (
      {pct(demos, meetings)}) &rarr; {deals}W ({pct(deals, demos)})
    </span>
  )
}
