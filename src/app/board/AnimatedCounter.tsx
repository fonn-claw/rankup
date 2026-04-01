'use client'

import { useMotionValue, animate } from 'motion/react'
import { useEffect, useState, useRef } from 'react'

interface AnimatedCounterProps {
  value: number
  className?: string
  duration?: number
}

export function AnimatedCounter({ value, className, duration = 0.4 }: AnimatedCounterProps) {
  const motionValue = useMotionValue(value)
  const [display, setDisplay] = useState(value)
  const isFirst = useRef(true)

  useEffect(() => {
    // Don't animate on first render
    if (isFirst.current) {
      isFirst.current = false
      setDisplay(value)
      motionValue.set(value)
      return
    }

    const controls = animate(motionValue, value, {
      duration,
      onUpdate: (v) => setDisplay(Math.round(v)),
    })
    return () => controls.stop()
  }, [value, motionValue, duration])

  return <span className={className}>{display.toLocaleString()}</span>
}
