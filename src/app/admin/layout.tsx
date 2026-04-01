import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { TopBar } from '@/components/TopBar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session.isLoggedIn) redirect('/login')
  if (session.role !== 'admin') redirect('/board')

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <TopBar />
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  )
}
