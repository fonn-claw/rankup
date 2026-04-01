import { getSession } from '@/lib/auth/session'
import { logout } from '@/lib/auth/actions'
import { Logo } from '@/components/Logo'
import Link from 'next/link'
import { TopBarNav } from './TopBarNav'

export async function TopBar() {
  const session = await getSession()

  return (
    <header className="h-12 w-full bg-bg-surface border-b border-bg-surface-hover flex items-center px-4 shrink-0">
      {/* Left: Logo */}
      <div className="flex items-center shrink-0">
        <Link href="/board">
          <Logo className="h-6 text-text-primary" />
        </Link>
      </div>

      {/* Center: Tabs + LIVE indicator */}
      <TopBarNav />

      {/* Right: User info + logout */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Streak badge placeholder */}
        <span />
        {session.isLoggedIn && (
          <>
            <span className="font-data text-xs md:text-sm text-text-secondary hidden sm:inline">
              {session.name}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="text-text-muted hover:text-text-primary text-xs font-data transition-colors"
              >
                Logout
              </button>
            </form>
          </>
        )}
      </div>
    </header>
  )
}
