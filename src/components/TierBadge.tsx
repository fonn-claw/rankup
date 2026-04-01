const TIER_CONFIG = {
  gold: { label: 'GOLD', textColor: 'text-tier-gold', bgColor: 'bg-tier-gold/20' },
  silver: { label: 'SILVER', textColor: 'text-tier-silver', bgColor: 'bg-tier-silver/20' },
  bronze: { label: 'BRONZE', textColor: 'text-tier-bronze', bgColor: 'bg-tier-bronze/20' },
} as const

type Tier = keyof typeof TIER_CONFIG

export function TierBadge({ tier }: { tier: Tier }) {
  const config = TIER_CONFIG[tier]
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-heading font-semibold ${config.textColor} ${config.bgColor}`}>
      {config.label}
    </span>
  )
}
