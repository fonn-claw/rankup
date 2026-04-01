'use client'

import { motion, AnimatePresence } from 'motion/react'

interface FloatingXpProps {
  xp: number | null
  id: number
}

export function FloatingXp({ xp, id }: FloatingXpProps) {
  return (
    <AnimatePresence>
      {xp !== null && (
        <motion.span
          key={id}
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 0, y: -30 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute -top-2 right-0 font-data text-sm text-accent-cyan font-bold pointer-events-none"
        >
          +{xp} XP
        </motion.span>
      )}
    </AnimatePresence>
  )
}
