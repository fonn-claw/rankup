export function LightningIcon({ className = '', size = 24 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" fill="currentColor" fillOpacity="0.2" stroke="currentColor"/>
    </svg>
  )
}
