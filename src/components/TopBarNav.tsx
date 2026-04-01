'use client'

import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'

const TABS = [
  { label: 'LIVE BOARD', href: '/board', segment: null },
  { label: 'BATTLES', href: '/board/battles', segment: 'battles' },
  { label: 'CHALLENGES', href: '/board/challenges', segment: 'challenges' },
] as const

export function TopBarNav() {
  const segment = useSelectedLayoutSegment()

  return (
    <nav className="flex-1 flex items-center justify-center gap-1 md:gap-4">
      {TABS.map((tab) => {
        const isActive = tab.segment === segment
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
  )
}
