import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'

export default async function BoardPage() {
  const session = await getSession()
  if (!session.isLoggedIn) redirect('/login')

  return (
    <div className="p-8">
      <h1 className="font-heading text-4xl text-accent-cyan mb-4">LIVE BOARD</h1>
      <p className="font-data text-text-secondary">
        Welcome, {session.name} ({session.role})
      </p>
      <p className="font-data text-text-muted mt-2">
        Scoreboard content coming in Phase 2
      </p>
    </div>
  )
}
