export const XP_VALUES = {
  call: 10,
  meeting: 50,
  demo: 75,
  proposal: 100,
  deal: 500,
} as const

export const TIER_THRESHOLDS = {
  bronze: { min: 0, max: 4999, label: 'Bronze', color: '#CD7F32' },
  silver: { min: 5000, max: 14999, label: 'Silver', color: '#C0C0C0' },
  gold: { min: 15000, max: Infinity, label: 'Gold', color: '#FFD700' },
} as const

export const ACTIVITY_STREAK_THRESHOLD = 15 // minimum calls per day
