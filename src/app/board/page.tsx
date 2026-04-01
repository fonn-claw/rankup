import { getSession } from '@/lib/auth/session'
import Image from 'next/image'

export default async function BoardPage() {
  const session = await getSession()

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Page heading */}
      <h1 className="font-heading text-4xl font-bold text-accent-cyan tracking-wider">LIVE BOARD</h1>

      {/* Your Position Banner */}
      <div className="bg-bg-surface rounded-lg p-6 border-l-4 border-accent-cyan">
        <div className="flex items-center gap-4">
          <div>
            <p className="font-heading text-2xl font-bold text-text-primary">{session.name}</p>
            <p className="font-data text-sm text-text-secondary capitalize">{session.role}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="font-data text-sm text-text-muted">Scoreboard coming in Phase 2</p>
          </div>
        </div>
      </div>

      {/* Rankings placeholder */}
      <div>
        <h2 className="font-heading text-xl font-semibold text-text-secondary tracking-wider mb-3">RANKINGS</h2>
        <div className="space-y-0">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-16 flex items-center justify-center ${
                i % 2 === 0 ? 'bg-bg-primary' : 'bg-bg-surface'
              }`}
            >
              {i === 3 && (
                <Image
                  src="/assets/empty-board.svg"
                  alt="No activity yet"
                  width={240}
                  height={160}
                  className="opacity-30"
                />
              )}
            </div>
          ))}
        </div>
        <p className="text-center font-data text-sm text-text-muted mt-4">
          Live rankings will appear here once activity data is loaded
        </p>
      </div>
    </div>
  )
}
