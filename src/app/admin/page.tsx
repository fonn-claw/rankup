import Link from 'next/link'
import { getTeamStats, getEngagementData, getSettings } from '@/lib/queries/admin'
import { TeamsTab } from './TeamsTab'
import { ConfigTab } from './ConfigTab'
import { AnalyticsTab } from './AnalyticsTab'

const TABS = [
  { key: 'teams', label: 'Teams', href: '/admin?tab=teams' },
  { key: 'config', label: 'Configuration', href: '/admin?tab=config' },
  { key: 'analytics', label: 'Analytics', href: '/admin?tab=analytics' },
] as const

type TabKey = (typeof TABS)[number]['key']

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const params = await searchParams
  const rawTab = params.tab
  const tab: TabKey = rawTab === 'config' || rawTab === 'analytics' ? rawTab : 'teams'

  // Fetch data conditionally based on active tab
  const teams = tab === 'teams' ? await getTeamStats() : []
  const settingsMap = tab === 'config' ? await getSettings() : new Map()
  const engagement = tab === 'analytics' ? await getEngagementData(30) : []

  // Convert Map to plain object for client component serialization
  const settingsObj: Record<string, string> = {}
  for (const [k, v] of settingsMap) {
    settingsObj[k] = v
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Page heading */}
      <h1 className="font-heading text-4xl font-bold text-accent-cyan tracking-wider">
        ADMIN
      </h1>

      {/* Tab navigation */}
      <nav className="flex flex-wrap items-center gap-2">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.href}
            className={`inline-flex px-4 py-1.5 rounded-full font-heading text-sm font-semibold tracking-wider uppercase transition-colors ${
              tab === t.key
                ? 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30'
                : 'text-text-secondary hover:text-text-primary border border-transparent'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {/* Tab content */}
      <div>
        {tab === 'teams' && <TeamsTab teams={teams} />}
        {tab === 'config' && <ConfigTab currentSettings={settingsObj} />}
        {tab === 'analytics' && <AnalyticsTab data={engagement} />}
      </div>
    </div>
  )
}
