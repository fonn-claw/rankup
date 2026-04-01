'use client'

import { useState, useEffect } from 'react'

interface CountdownResult {
  days: number
  hours: number
  minutes: number
  expired: boolean
}

function computeRemaining(endDate: string): CountdownResult {
  const diff = new Date(endDate).getTime() - Date.now()
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, expired: true }
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  return { days, hours, minutes, expired: false }
}

export function useCountdown(endDate: string): CountdownResult {
  const [remaining, setRemaining] = useState<CountdownResult>(() => computeRemaining(endDate))

  useEffect(() => {
    const update = () => setRemaining(computeRemaining(endDate))

    // Use 1-second interval when under 1 hour, otherwise 60-second
    const getInterval = () => {
      const diff = new Date(endDate).getTime() - Date.now()
      return diff > 0 && diff < 60 * 60 * 1000 ? 1_000 : 60_000
    }

    let intervalId = setInterval(update, getInterval())

    // Re-check interval speed periodically
    const checkId = setInterval(() => {
      clearInterval(intervalId)
      intervalId = setInterval(update, getInterval())
    }, 60_000)

    return () => {
      clearInterval(intervalId)
      clearInterval(checkId)
    }
  }, [endDate])

  return remaining
}
