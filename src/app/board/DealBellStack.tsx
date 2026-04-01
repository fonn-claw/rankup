'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { BellIcon } from '@/components/icons'

interface DealBell {
  id: number
  repName: string
  dealName: string
  amount: number
  xpEarned: number
  createdAt: string
}

export function DealBellStack() {
  const [bells, setBells] = useState<DealBell[]>([])
  const seenIdsRef = useRef<Set<number>>(new Set())

  const pollDeals = useCallback(async () => {
    try {
      const res = await fetch('/api/deal-bell')
      if (!res.ok) return
      const deals: DealBell[] = await res.json()
      const newDeals = deals.filter((d) => !seenIdsRef.current.has(d.id))
      if (newDeals.length > 0) {
        newDeals.forEach((d) => seenIdsRef.current.add(d.id))
        setBells((prev) => [...newDeals, ...prev].slice(0, 3))
      }
    } catch {
      // Polling failure is non-critical
    }
  }, [])

  // Poll every 15 seconds
  useEffect(() => {
    pollDeals()
    const id = setInterval(pollDeals, 15000)
    return () => clearInterval(id)
  }, [pollDeals])

  // Auto-dismiss each bell after 8 seconds
  useEffect(() => {
    if (bells.length === 0) return
    const timer = setTimeout(() => {
      setBells((prev) => prev.slice(0, -1))
    }, 8000)
    return () => clearTimeout(timer)
  }, [bells])

  if (bells.length === 0) return null

  return (
    <div className="fixed top-12 left-0 right-0 z-50 flex flex-col gap-1">
      <AnimatePresence>
        {bells.map((bell) => (
          <motion.div
            key={bell.id}
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 25,
              mass: 0.8,
            }}
          >
            <div
              className="bg-bg-elevated border-l-4 border-accent-green px-4 py-3 flex items-center gap-3"
              style={{
                backgroundImage: 'url(/assets/bg-deal-bell.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="absolute inset-0 bg-bg-elevated/90" />
              <BellIcon className="w-5 h-5 text-accent-green relative z-10 shrink-0" />
              <span className="font-data text-sm text-text-primary relative z-10">
                {bell.repName} closed {bell.dealName} &mdash; $
                {bell.amount.toLocaleString()} &mdash; +{bell.xpEarned} XP
              </span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
