export function HandshakeIcon({ className = '', size = 24 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2 14l4-4 4 2 4-4 4 2 4-4"/>
      <path d="M6 10L2 14l3 3 4-4"/>
      <path d="M18 10l4-4-3-3-4 4"/>
      <path d="M10 12l2 2 2-2"/>
    </svg>
  )
}
