'use client'

import { usePolling } from '@/lib/hooks/usePolling'

export function BattlesPoller() {
  usePolling(15000)
  return null
}
