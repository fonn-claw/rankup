export function FlameIcon({ className = '', size = 24 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2C12 2 7 8 7 13a5 5 0 0 0 10 0c0-5-5-11-5-11z" stroke="currentColor" fill="currentColor" fillOpacity="0.2"/>
      <path d="M12 10c0 0-2 2.5-2 4.5a2 2 0 0 0 4 0c0-2-2-4.5-2-4.5z" stroke="currentColor" fill="currentColor" fillOpacity="0.5"/>
    </svg>
  )
}
