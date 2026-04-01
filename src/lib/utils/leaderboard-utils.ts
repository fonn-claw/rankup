import { XP_VALUES, TIER_THRESHOLDS } from '@/lib/constants'

export function getGapMessage(
  currentXP: number,
  nextRankXP: number,
  nextRankPosition: number
): string {
  const gap = nextRankXP - currentXP + 1
  if (gap <= 0) return ''

  const callsNeeded = Math.ceil(gap / XP_VALUES.call)
  if (callsNeeded <= 5) {
    return `${callsNeeded} call${callsNeeded > 1 ? 's' : ''} to pass #${nextRankPosition}`
  }

  const meetingsNeeded = Math.ceil(gap / XP_VALUES.meeting)
  if (meetingsNeeded <= 3) {
    return `${meetingsNeeded} meeting${meetingsNeeded > 1 ? 's' : ''} to pass #${nextRankPosition}`
  }

  return `${gap} XP to pass #${nextRankPosition}`
}

export function getTier(xp: number): 'gold' | 'silver' | 'bronze' {
  if (xp >= TIER_THRESHOLDS.gold.min) return 'gold'
  if (xp >= TIER_THRESHOLDS.silver.min) return 'silver'
  return 'bronze'
}
