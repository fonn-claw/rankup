export function TrophyIcon({ className = '', size = 24 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 4h12v6a6 6 0 0 1-12 0V4z"/>
      <path d="M6 6H3v2a3 3 0 0 0 3 3"/>
      <path d="M18 6h3v2a3 3 0 0 1-3 3"/>
      <line x1="12" y1="16" x2="12" y2="19"/>
      <line x1="8" y1="22" x2="16" y2="22"/>
      <line x1="8" y1="19" x2="16" y2="19"/>
    </svg>
  )
}
