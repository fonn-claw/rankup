export function Logo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 32" height="32" className={className} style={{ width: 'auto' }}>
      <text x="0" y="25" fontFamily="var(--font-heading), sans-serif" fontWeight="700" fontSize="26" fill="currentColor" letterSpacing="1">RANK</text>
      <text x="80" y="25" fontFamily="var(--font-heading), sans-serif" fontWeight="700" fontSize="26" fill="#06D6F2" letterSpacing="1" transform="rotate(-4, 80, 25)">UP</text>
      <line x1="79" y1="28" x2="112" y2="24" stroke="#06D6F2" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}
