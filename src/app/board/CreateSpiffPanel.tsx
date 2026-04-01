'use client'

import { useState, useRef } from 'react'
import { createChallenge } from '@/lib/actions/challenges'

const GOAL_TYPES = [
  { value: 'call', label: 'Call' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'demo', label: 'Demo' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'deal', label: 'Deal' },
]

interface CreateSpiffPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateSpiffPanel({ isOpen, onClose }: CreateSpiffPanelProps) {
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setSubmitting(true)
    try {
      await createChallenge(formData)
      formRef.current?.reset()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create SPIFF')
    } finally {
      setSubmitting(false)
    }
  }

  // Default start date to today
  const today = new Date().toISOString().split('T')[0]

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-80 bg-bg-elevated z-50 transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-5 h-full flex flex-col overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-lg text-text-primary font-semibold">
              CREATE SPIFF
            </h2>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              &times;
            </button>
          </div>

          <form ref={formRef} action={handleSubmit} className="flex flex-col gap-4 flex-1">
            {/* Title */}
            <div>
              <label className="font-data text-xs text-text-secondary block mb-1">Title</label>
              <input
                name="title"
                type="text"
                required
                className="w-full bg-bg-surface border border-bg-surface-hover text-text-primary font-data text-sm px-3 py-2 rounded outline-none focus:border-accent-cyan"
                placeholder="March Madness"
              />
            </div>

            {/* Description */}
            <div>
              <label className="font-data text-xs text-text-secondary block mb-1">Description</label>
              <textarea
                name="description"
                rows={3}
                className="w-full bg-bg-surface border border-bg-surface-hover text-text-primary font-data text-sm px-3 py-2 rounded outline-none focus:border-accent-cyan resize-none"
                placeholder="Most meetings booked this week wins"
              />
            </div>

            {/* Goal Type */}
            <div>
              <label className="font-data text-xs text-text-secondary block mb-1">Goal Type</label>
              <select
                name="goalType"
                defaultValue="call"
                className="w-full bg-bg-surface border border-bg-surface-hover text-text-primary font-data text-sm px-3 py-2 rounded outline-none focus:border-accent-cyan"
              >
                {GOAL_TYPES.map((gt) => (
                  <option key={gt.value} value={gt.value}>
                    {gt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Goal Value */}
            <div>
              <label className="font-data text-xs text-text-secondary block mb-1">Goal Value</label>
              <input
                name="goalValue"
                type="number"
                required
                min={1}
                className="w-full bg-bg-surface border border-bg-surface-hover text-text-primary font-data text-sm px-3 py-2 rounded outline-none focus:border-accent-cyan"
                placeholder="15"
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="font-data text-xs text-text-secondary block mb-1">Start Date</label>
              <input
                name="startDate"
                type="date"
                required
                defaultValue={today}
                className="w-full bg-bg-surface border border-bg-surface-hover text-text-primary font-data text-sm px-3 py-2 rounded outline-none focus:border-accent-cyan"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="font-data text-xs text-text-secondary block mb-1">End Date</label>
              <input
                name="endDate"
                type="date"
                required
                className="w-full bg-bg-surface border border-bg-surface-hover text-text-primary font-data text-sm px-3 py-2 rounded outline-none focus:border-accent-cyan"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="font-data text-xs text-accent-red">{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="mt-auto bg-accent-cyan text-bg-primary font-heading font-semibold text-sm px-4 py-3 rounded transition-colors hover:bg-accent-cyan/90 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'CREATE SPIFF'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
