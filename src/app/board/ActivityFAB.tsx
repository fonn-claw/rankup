'use client'

import { useState } from 'react'
import { logActivity, type ActivityType } from '@/lib/actions/activities'
import { XP_VALUES } from '@/lib/constants'
import {
  LightningIcon,
  PhoneIcon,
  CalendarIcon,
  PresentationIcon,
  DocumentIcon,
  HandshakeIcon,
} from '@/components/icons'

const ACTIVITY_BUTTONS: {
  type: ActivityType
  label: string
  icon: React.ComponentType<{ className?: string }>
  xp: number
  special?: boolean
}[] = [
  { type: 'call', label: 'Call', icon: PhoneIcon, xp: XP_VALUES.call },
  { type: 'meeting', label: 'Meeting', icon: CalendarIcon, xp: XP_VALUES.meeting },
  { type: 'demo', label: 'Demo', icon: PresentationIcon, xp: XP_VALUES.demo },
  { type: 'proposal', label: 'Proposal', icon: DocumentIcon, xp: XP_VALUES.proposal },
  { type: 'deal', label: 'Deal', icon: HandshakeIcon, xp: XP_VALUES.deal, special: true },
]

interface ActivityFABProps {
  currentUserId: number
  currentXp: number
  onOptimisticUpdate: (xpGain: number) => void
}

export function ActivityFAB({ currentUserId, currentXp, onOptimisticUpdate }: ActivityFABProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLogging, setIsLogging] = useState(false)
  const [lastLogged, setLastLogged] = useState<{ type: string; xp: number } | null>(null)
  const [dealForm, setDealForm] = useState(false)
  const [dealName, setDealName] = useState('')
  const [dealRevenue, setDealRevenue] = useState('')

  async function handleLog(type: ActivityType) {
    if (type === 'deal' && !dealForm) {
      setDealForm(true)
      return
    }

    setIsLogging(true)
    const metadata =
      type === 'deal'
        ? JSON.stringify({ dealName: dealName || 'Deal', revenue: parseInt(dealRevenue, 10) || 0 })
        : undefined

    onOptimisticUpdate(XP_VALUES[type])

    try {
      const result = await logActivity(type, metadata)
      setLastLogged({ type: result.type, xp: result.xp })
      setDealForm(false)
      setDealName('')
      setDealRevenue('')
      setTimeout(() => {
        setLastLogged(null)
        setIsOpen(false)
      }, 1500)
    } catch {
      // Optimistic update will revert on next poll
    } finally {
      setIsLogging(false)
    }
  }

  return (
    <>
      {/* FAB button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-accent-cyan flex items-center justify-center z-40 shadow-lg hover:scale-105 transition-transform"
      >
        <LightningIcon className="w-6 h-6 text-bg-primary" />
      </button>

      {/* Slide-up panel */}
      <div
        className={`fixed bottom-0 left-0 right-0 h-[40vh] bg-bg-elevated rounded-t-2xl z-30 transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="p-4 h-full flex flex-col">
          <h3 className="font-heading text-sm text-text-secondary tracking-wider mb-4">
            LOG ACTIVITY
          </h3>

          {lastLogged ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <span className="text-accent-green text-3xl">&#10003;</span>
                <p className="font-data text-lg text-accent-green mt-2">
                  +{lastLogged.xp} XP
                </p>
              </div>
            </div>
          ) : dealForm ? (
            <div className="flex-1 flex flex-col gap-3">
              <input
                type="text"
                placeholder="Deal name"
                value={dealName}
                onChange={(e) => setDealName(e.target.value)}
                className="bg-bg-surface text-text-primary font-data text-sm px-3 py-2 rounded border border-bg-surface-hover focus:border-accent-cyan outline-none"
              />
              <input
                type="number"
                placeholder="Revenue ($)"
                value={dealRevenue}
                onChange={(e) => setDealRevenue(e.target.value)}
                className="bg-bg-surface text-text-primary font-data text-sm px-3 py-2 rounded border border-bg-surface-hover focus:border-accent-cyan outline-none"
              />
              <button
                onClick={() => handleLog('deal')}
                disabled={isLogging}
                className="bg-accent-green/20 border border-accent-green/30 text-accent-green font-heading font-semibold text-sm px-4 py-3 rounded transition-colors hover:bg-accent-green/30 disabled:opacity-50"
              >
                {isLogging ? 'Logging...' : 'Close Deal +500 XP'}
              </button>
              <button
                onClick={() => setDealForm(false)}
                className="text-text-muted font-data text-xs"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 flex-1">
              {ACTIVITY_BUTTONS.map((btn) => {
                const Icon = btn.icon
                return (
                  <button
                    key={btn.type}
                    onClick={() => handleLog(btn.type)}
                    disabled={isLogging}
                    className={`flex flex-col items-center justify-center gap-1 rounded-lg p-3 transition-colors disabled:opacity-50 ${
                      btn.special
                        ? 'bg-accent-green/10 border border-accent-green/30 col-span-2'
                        : 'bg-bg-surface hover:bg-bg-surface-hover'
                    }`}
                  >
                    <Icon className="w-6 h-6 text-text-primary" />
                    <span className="font-data text-sm text-text-primary">{btn.label}</span>
                    <span className="font-data text-xs text-accent-cyan">+{btn.xp} XP</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20"
          onClick={() => {
            setIsOpen(false)
            setDealForm(false)
          }}
        />
      )}
    </>
  )
}
