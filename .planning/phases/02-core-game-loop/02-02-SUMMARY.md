---
phase: 02-core-game-loop
plan: 02
subsystem: ui
tags: [react, next.js, scoreboard, leaderboard, optimistic-ui, polling, server-components]

requires:
  - phase: 02-core-game-loop/01
    provides: "Leaderboard queries, streak queries, funnel queries, activity server action, deal bell endpoint, usePolling hook"
  - phase: 01-foundation
    provides: "Schema, auth, TierBadge, icons, TopBar, board layout, Tailwind theme tokens"
provides:
  - "Full scoreboard UI with ranked rows, pinned position, filters, FAB, deal bell, conversion funnel"
  - "Optimistic XP updates with useOptimistic and tier promotion detection"
  - "URL-driven filter state for time period and team"
  - "data-user-id attributes on rows for Phase 4 animation prep"
affects: [03-team-features, 04-polish-deploy]

tech-stack:
  added: []
  patterns: [server-component-data-fetch-with-client-optimistic, url-searchparams-for-filter-state, useOptimistic-reducer-pattern]

key-files:
  created:
    - src/app/board/BoardClient.tsx
    - src/app/board/ScoreboardRow.tsx
    - src/app/board/PinnedPosition.tsx
    - src/app/board/ConversionFunnel.tsx
    - src/app/board/FilterBar.tsx
    - src/app/board/ActivityFAB.tsx
    - src/app/board/DealBellStack.tsx
  modified:
    - src/app/board/page.tsx
    - src/lib/queries/funnel.ts

key-decisions:
  - "All components in single commit -- board page, client, and sub-components are interdependent"
  - "URL searchParams drive filter state for natural server component re-fetch"
  - "useOptimistic reducer re-sorts and re-ranks rows on optimistic XP update"
  - "Tier promotion detected client-side by comparing pre/post XP against TIER_THRESHOLDS"
  - "DealBellStack uses ref for seenIds to avoid stale closure in polling callback"

patterns-established:
  - "Server Component page.tsx fetches data, Client Component BoardClient.tsx manages interactivity"
  - "URL searchParams for filter state (period, team) -- enables deep linking and server re-fetch"
  - "useOptimistic with reducer pattern for immediate XP/rank updates"
  - "data-user-id attributes on ScoreboardRow for Phase 4 motion layout animation prep"

requirements-completed: [LEAD-01, LEAD-02, LEAD-03, LEAD-04, LEAD-05, LEAD-06, ACTV-01, ACTV-03, ACTV-05, TIER-02, TIER-03, STRK-02, STRK-03, STRK-04, BELL-01, BELL-02, BELL-03, FUNL-01]

duration: 3min
completed: 2026-04-01
---

# Phase 02 Plan 02: Scoreboard UI Summary

**Live scoreboard with ranked rows, pinned position banner, pill filters, floating activity logger with optimistic XP, deal bell notifications, streak indicators, and conversion funnel**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-01T09:36:20Z
- **Completed:** 2026-04-01T09:39:25Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Full scoreboard UI rendering real leaderboard data with 64px ranked rows showing rank, movement arrows, name, tier badge, XP bar, daily change, and streak indicators
- Pinned position banner with gap-to-next-rank in actionable terms ("2 calls to pass #6") and per-rep conversion funnel
- Floating action button with slide-up panel for logging 5 activity types with optimistic XP updates and deal form
- Deal bell notification stack polling every 15s with auto-dismiss and stacking
- URL-driven pill filter toggles for time period and team
- Client-side tier promotion detection with visual celebration
- Top 3 rows with tier-colored left border glow, streak at-risk pulsing amber indicator

## Task Commits

1. **Task 1+2: Board page, BoardClient, ScoreboardRow, PinnedPosition, ConversionFunnel, FilterBar, ActivityFAB, DealBellStack** - `4907e53` (feat)

**Plan metadata:** pending (docs: complete plan)

## Files Created/Modified
- `src/app/board/page.tsx` - Server component fetching leaderboard, streaks, funnel data via searchParams
- `src/app/board/BoardClient.tsx` - Client component with usePolling, useOptimistic, tier promotion detection
- `src/app/board/ScoreboardRow.tsx` - 64px scoreboard row with all columns and streak indicators
- `src/app/board/PinnedPosition.tsx` - 96px pinned banner with gap message and funnel
- `src/app/board/ConversionFunnel.tsx` - Compact inline conversion funnel with ratios
- `src/app/board/FilterBar.tsx` - Pill toggle filters for time period and team via URL params
- `src/app/board/ActivityFAB.tsx` - Floating action button with slide-up panel and deal form
- `src/app/board/DealBellStack.tsx` - Deal bell notification stack with polling and auto-dismiss
- `src/lib/queries/funnel.ts` - Fixed db.execute generic type constraint

## Decisions Made
- All components committed together since BoardClient imports all sub-components and page.tsx depends on BoardClient
- URL searchParams for filter state rather than client-side state -- enables server component re-fetch naturally
- useOptimistic reducer re-sorts and re-ranks all rows on XP update for immediate visual feedback
- DealBellStack uses useRef for seenIds to avoid stale closure issues in the polling callback
- Tier promotion detection is purely client-side by comparing XP before/after optimistic update

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed funnel.ts type constraint for db.execute generic**
- **Found during:** Task 1 (build verification)
- **Issue:** `FunnelResult` interface does not satisfy `Record<string, unknown>` constraint required by `db.execute<T>`
- **Fix:** Changed generic to `Record<string, unknown>` and cast result rows
- **Files modified:** src/lib/queries/funnel.ts
- **Verification:** Build passes
- **Committed in:** 4907e53

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Pre-existing type error from Plan 02-01 output. Minimal fix, no scope creep.

## Issues Encountered
None beyond the type constraint fix above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Full scoreboard UI complete and building successfully
- All data-user-id attributes set on ScoreboardRow for Phase 4 motion layout animations
- URL-based filter state enables deep linking
- Ready for Phase 03 (team features) and Phase 04 (polish/deploy)

## Self-Check: PASSED

All 8 created/modified files verified on disk. Commit 4907e53 verified in git log.

---
*Phase: 02-core-game-loop*
*Completed: 2026-04-01*
