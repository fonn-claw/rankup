'use client'

import { useState, useTransition } from 'react'
import { saveSettings } from '@/lib/actions/admin'
import { XP_VALUES, TIER_THRESHOLDS } from '@/lib/constants'

const ACTIVITY_TYPES = ['call', 'meeting', 'demo', 'proposal', 'deal'] as const

interface ConfigTabProps {
  currentSettings: Record<string, string>
}

export function ConfigTab({ currentSettings }: ConfigTabProps) {
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<'saved' | 'error' | null>(null)

  const [xpValues, setXpValues] = useState(() => {
    const values: Record<string, number> = {}
    for (const type of ACTIVITY_TYPES) {
      const key = `xp.${type}`
      values[type] = currentSettings[key]
        ? parseInt(currentSettings[key], 10)
        : XP_VALUES[type]
    }
    return values
  })

  const [tierValues, setTierValues] = useState(() => ({
    silverMin: currentSettings['tier.silver.min']
      ? parseInt(currentSettings['tier.silver.min'], 10)
      : TIER_THRESHOLDS.silver.min,
    goldMin: currentSettings['tier.gold.min']
      ? parseInt(currentSettings['tier.gold.min'], 10)
      : TIER_THRESHOLDS.gold.min,
  }))

  function handleSave() {
    const entries: { key: string; value: string }[] = []
    for (const type of ACTIVITY_TYPES) {
      entries.push({ key: `xp.${type}`, value: String(xpValues[type]) })
    }
    entries.push({ key: 'tier.silver.min', value: String(tierValues.silverMin) })
    entries.push({ key: 'tier.gold.min', value: String(tierValues.goldMin) })

    startTransition(async () => {
      try {
        await saveSettings(entries)
        setFeedback('saved')
        setTimeout(() => setFeedback(null), 2000)
      } catch {
        setFeedback('error')
        setTimeout(() => setFeedback(null), 3000)
      }
    })
  }

  return (
    <div className="space-y-8">
      {/* Point Values */}
      <section>
        <h3 className="font-heading text-sm text-text-secondary tracking-wider uppercase mb-4">
          Point Values
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ACTIVITY_TYPES.map((type) => (
            <div key={type} className="flex items-center gap-3">
              <label className="font-data text-sm text-text-primary w-24 capitalize">
                {type}
              </label>
              <input
                type="number"
                min={0}
                value={xpValues[type]}
                onChange={(e) =>
                  setXpValues((prev) => ({
                    ...prev,
                    [type]: parseInt(e.target.value, 10) || 0,
                  }))
                }
                className="bg-bg-surface border border-bg-surface-hover text-text-primary font-data w-24 px-3 py-1.5 rounded focus:outline-none focus:border-accent-cyan"
              />
              <span className="font-data text-xs text-text-muted">XP</span>
            </div>
          ))}
        </div>
      </section>

      {/* Tier Thresholds */}
      <section>
        <h3 className="font-heading text-sm text-text-secondary tracking-wider uppercase mb-4">
          Tier Thresholds
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <label className="font-data text-sm text-text-muted w-24">Bronze</label>
            <span className="font-data text-sm text-text-muted">0 XP (fixed)</span>
          </div>
          <div className="flex items-center gap-3">
            <label className="font-data text-sm text-text-primary w-24">Silver</label>
            <input
              type="number"
              min={1}
              value={tierValues.silverMin}
              onChange={(e) =>
                setTierValues((prev) => ({
                  ...prev,
                  silverMin: parseInt(e.target.value, 10) || 0,
                }))
              }
              className="bg-bg-surface border border-bg-surface-hover text-text-primary font-data w-24 px-3 py-1.5 rounded focus:outline-none focus:border-accent-cyan"
            />
            <span className="font-data text-xs text-text-muted">min XP</span>
          </div>
          <div className="flex items-center gap-3">
            <label className="font-data text-sm text-text-primary w-24">Gold</label>
            <input
              type="number"
              min={1}
              value={tierValues.goldMin}
              onChange={(e) =>
                setTierValues((prev) => ({
                  ...prev,
                  goldMin: parseInt(e.target.value, 10) || 0,
                }))
              }
              className="bg-bg-surface border border-bg-surface-hover text-text-primary font-data w-24 px-3 py-1.5 rounded focus:outline-none focus:border-accent-cyan"
            />
            <span className="font-data text-xs text-text-muted">min XP</span>
          </div>
        </div>
      </section>

      {/* Save */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="bg-accent-cyan text-bg-primary font-heading font-semibold px-4 py-2 rounded transition-opacity disabled:opacity-50"
        >
          {isPending ? 'Saving...' : 'Save Configuration'}
        </button>
        {feedback === 'saved' && (
          <span className="font-data text-sm text-accent-green">Saved!</span>
        )}
        {feedback === 'error' && (
          <span className="font-data text-sm text-accent-red">Failed to save. Try again.</span>
        )}
      </div>
    </div>
  )
}
