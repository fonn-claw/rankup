---
phase: 02-core-game-loop
plan: 01
subsystem: api
tags: [drizzle, postgres, sql-window-functions, server-actions, polling, next-api-routes]

requires:
  - phase: 01-foundation
    provides: Database schema (activities, users, teams), auth session, XP/tier constants
provides:
  - Ranked leaderboard query with time/team filtering and rank movement
  - Activity logging server action with XP calculation and deal revenue bonus
  - Business-day streak calculation via gap-and-island SQL
  - Conversion funnel aggregation per rep
  - Deal bell polling endpoint returning recent deals
  - usePolling client hook for 15s data refresh
affects: [02-core-game-loop, 03-management-layer, 04-polish-and-delight]

tech-stack:
  added: []
  patterns: [raw-sql-via-drizzle-sql-template, server-action-with-revalidation, route-handler-polling]

key-files:
  created:
    - src/lib/queries/leaderboard.ts
    - src/lib/queries/streaks.ts
    - src/lib/queries/funnel.ts
    - src/lib/actions/activities.ts
    - src/app/api/deal-bell/route.ts
    - src/lib/hooks/usePolling.ts
  modified: []

key-decisions:
  - "Used db.execute with raw SQL CTEs for leaderboard ranking -- Drizzle ORM query builder lacks window function support"
  - "Previous-period ranks computed via separate query and diffed in app code -- simpler than storing snapshots"
  - "Deal revenue bonus calculated as Math.floor(revenue / 1000) added to base 500 XP"
  - "Streak query includes Saturday (DOW=6) check for CURRENT_DATE edge case"

patterns-established:
  - "Raw SQL pattern: db.execute<T>(sql`...`) with typed result interface for complex queries"
  - "Server action pattern: 'use server' + getSession() + db.insert + revalidatePath"
  - "Polling pattern: usePolling(intervalMs) hook calling router.refresh()"

requirements-completed: [LEAD-01, LEAD-02, LEAD-03, LEAD-04, LEAD-06, ACTV-01, ACTV-02, ACTV-03, ACTV-04, ACTV-05, TIER-01, STRK-01, BELL-01, BELL-02, FUNL-01]

duration: 2min
completed: 2026-04-01
---

# Phase 2 Plan 1: Core Game Loop Data Layer Summary

**Leaderboard ranking with SQL RANK() OVER window functions, activity logging server action with deal revenue bonus, business-day streak calculation, funnel aggregation, deal bell endpoint, and usePolling hook**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-01T09:32:09Z
- **Completed:** 2026-04-01T09:34:09Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Leaderboard query with CTE-based ranking, time period filtering (today/week/month/all), team filtering, and previous-period rank comparison for movement arrows
- Activity logging server action with per-type XP from constants and deal revenue bonus calculation
- Business-day streak tracking using gap-and-island SQL with weekend exclusion and active-streak detection
- Deal bell polling endpoint returning parsed deal metadata with rep names

## Task Commits

Each task was committed atomically:

1. **Task 1: Leaderboard queries, streak query, and funnel query** - `0d36a23` (feat)
2. **Task 2: Activity server action, deal bell API route, and usePolling hook** - `914d6d6` (feat)

## Files Created/Modified
- `src/lib/queries/leaderboard.ts` - Ranked leaderboard with RANK() OVER, time/team filtering, gap-to-next helper, getTier helper
- `src/lib/queries/streaks.ts` - Business-day consecutive streak calculation via gap-and-island SQL
- `src/lib/queries/funnel.ts` - Per-rep activity type counts for conversion funnel
- `src/lib/actions/activities.ts` - Server action for logging activities with XP calculation and deal bonus
- `src/app/api/deal-bell/route.ts` - GET endpoint returning recent deal activities with parsed metadata
- `src/lib/hooks/usePolling.ts` - Custom hook using router.refresh() at configurable intervals

## Decisions Made
- Used db.execute with raw SQL CTEs for leaderboard -- Drizzle ORM query builder lacks window function support
- Previous-period ranks computed via separate query and diffed in application code -- simpler than storing snapshots
- Deal revenue bonus: Math.floor(revenue / 1000) added to base 500 XP deal value
- Streak streakActive check accounts for Saturday (DOW=6) edge case on CURRENT_DATE

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All data layer contracts ready for Plan 02-02 (UI components)
- Exported TypeScript interfaces provide typed contracts: LeaderboardRow, StreakResult, FunnelResult, ActivityType
- getLeaderboard, getPreviousRanks, getStreaks, getFunnel queries ready for Server Component consumption
- logActivity server action ready for Client Component form binding
- usePolling hook ready for 15s leaderboard refresh
- Deal bell endpoint ready for client-side polling

---
## Self-Check: PASSED

- All 6 created files verified on disk
- Commit 0d36a23 verified (Task 1)
- Commit 914d6d6 verified (Task 2)
- TypeScript compilation: zero errors

---
*Phase: 02-core-game-loop*
*Completed: 2026-04-01*
