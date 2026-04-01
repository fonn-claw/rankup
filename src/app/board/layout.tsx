import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { TopBar } from '@/components/TopBar'

export default async function BoardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session.isLoggedIn) redirect('/login')

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <TopBar activePath="/board" />
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  )
}
