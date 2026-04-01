'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function usePolling(intervalMs: number): void {
  const router = useRouter()

  useEffect(() => {
    const id = setInterval(() => {
      router.refresh()
    }, intervalMs)

    return () => clearInterval(id)
  }, [intervalMs, router])
}
