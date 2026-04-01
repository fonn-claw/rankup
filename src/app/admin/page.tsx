import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const session = await getSession()
  if (!session.isLoggedIn) redirect('/login')
  if (session.role !== 'admin') redirect('/board')

  return (
    <div className="p-8">
      <h1 className="font-heading text-4xl text-accent-cyan mb-4">ADMIN</h1>
      <p className="font-data text-text-secondary">
        Welcome, {session.name}
      </p>
      <p className="font-data text-text-muted mt-2">
        Admin configuration coming in Phase 3
      </p>
    </div>
  )
}
