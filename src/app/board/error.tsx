'use client'

export default function BoardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
      <h2 className="text-2xl font-heading text-text-primary">Something went wrong</h2>
      <p className="text-text-secondary font-data text-sm">
        The leaderboard couldn&apos;t load. Try again in a moment.
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-accent-cyan text-bg-primary font-heading text-sm font-semibold rounded hover:opacity-90 transition-opacity"
      >
        Retry
      </button>
    </div>
  )
}
