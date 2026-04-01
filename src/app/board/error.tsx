'use client'

export default function BoardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={{ padding: '2rem', color: 'red' }}>
      <h2>Board Error</h2>
      <pre style={{ whiteSpace: 'pre-wrap' }}>
        {error.message}
        {'\n\nDigest: ' + (error.digest ?? 'none')}
        {error.stack ? '\n\nStack:\n' + error.stack : ''}
      </pre>
      <button onClick={reset}>Retry</button>
    </div>
  )
}
