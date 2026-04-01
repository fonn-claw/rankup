import { getSession } from '@/lib/auth/session'
import { logout } from '@/lib/auth/actions'
import { Logo } from '@/components/Logo'
import Link from 'next/link'

const TABS = [
  { label: 'LIVE BOARD', href: '/board' },
  { label: 'BATTLES', href: '/board/battles' },
  { label: 'CHALLENGES', href: '/board/challenges' },
] as const

export async function TopBar({ activePath }: { activePath: string }) {
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
      <nav className="flex-1 flex items-center justify-center gap-1 md:gap-4">
        {TABS.map((tab) => {
          const isActive = activePath === tab.href || (tab.href === '/board' && activePath === '/board')
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`font-heading text-xs md:text-sm font-semibold tracking-wider uppercase px-2 py-1 border-b-2 transition-colors ${
                isActive
                  ? 'text-accent-cyan border-accent-cyan'
                  : 'text-text-secondary hover:text-text-primary border-transparent'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
        {/* LIVE indicator */}
        <div className="flex items-center gap-1.5 ml-2 md:ml-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-green" />
          </span>
          <span className="hidden md:inline text-accent-green text-xs font-heading font-semibold">
            LIVE
          </span>
        </div>
      </nav>

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
