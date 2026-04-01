---
phase: 03-competitions-and-role-views
plan: 02
subsystem: ui
tags: [react, nextjs, server-actions, drizzle, gamification, manager-view]

requires:
  - phase: 03-competitions-and-role-views plan 01
    provides: challenges and challengeParticipants schema tables, battles page, challenge queries
  - phase: 02-live-scoreboard
    provides: BoardClient, ScoreboardRow, FilterBar, polling/optimistic patterns
provides:
  - Manager command center with team activity heatmap strip
  - Conversion rate column and coaching flags on scoreboard
  - SPIFF creation slide-out panel with server action
  - Role-conditional rendering at /board route
affects: [admin-configuration, future manager features]

tech-stack:
  added: []
  patterns: [role-conditional server component rendering, slide-out panel pattern, heatmap with click-to-scroll]

key-files:
  created:
    - src/lib/queries/heatmap.ts
    - src/lib/actions/challenges.ts
    - src/app/board/ManagerHeatmap.tsx
    - src/app/board/CreateSpiffPanel.tsx
    - src/app/board/ManagerBoardClient.tsx
  modified:
    - src/app/board/page.tsx
    - src/app/board/ScoreboardRow.tsx

key-decisions:
  - "FunnelResult uses plural field names (calls, meetings, demos, deals) -- conversion computed from funnel.meetings/funnel.calls"
  - "Heatmap status derived client-side from lastActivityAt timestamp comparison with Date.now()"
  - "Manager view omits PinnedPosition and ActivityFAB -- manager doesn't log activities"

patterns-established:
  - "Role-conditional rendering: server component checks session.role, renders different client component"
  - "Slide-out panel: fixed right-0 with translateX transition, backdrop overlay"

requirements-completed: [MGMT-01, MGMT-02, MGMT-03, MGMT-04, SPFF-02]

duration: 4min
completed: 2026-04-01
---

# Phase 3 Plan 02: Manager Command Center Summary

**Role-conditional /board with team activity heatmap, conversion rate column with coaching flags, and SPIFF creation slide-out panel for managers**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-01T10:09:54Z
- **Completed:** 2026-04-01T10:14:00Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Manager at /board sees team activity heatmap with green/amber/red cells showing rep status
- Scoreboard rows extended with conversion rate column and amber coaching flags for low-conversion reps
- SPIFF creation via slide-out panel with role-validated server action
- Rep view remains completely unchanged

## Task Commits

Each task was committed atomically:

1. **Task 1: Heatmap query, challenge action, manager heatmap + SPIFF panel** - `65f7c7d` (feat)
2. **Task 2: Manager board client with conversion column + coaching flags, role-conditional page** - `7c83419` (feat)

## Files Created/Modified
- `src/lib/queries/heatmap.ts` - getTeamHeatmap query returning last activity time per rep
- `src/lib/actions/challenges.ts` - createChallenge server action with manager role validation
- `src/app/board/ManagerHeatmap.tsx` - Horizontal heatmap strip with colored cells and click-to-scroll
- `src/app/board/CreateSpiffPanel.tsx` - Slide-out panel with form for SPIFF creation
- `src/app/board/ManagerBoardClient.tsx` - Manager-specific board client with conversion and coaching columns
- `src/app/board/page.tsx` - Role-conditional rendering: ManagerBoardClient for managers, BoardClient for reps
- `src/app/board/ScoreboardRow.tsx` - Extended with optional conversionRate and coachingFlag props

## Decisions Made
- Conversion rate computed as meetings/calls * 100 from FunnelResult (plural field names)
- Coaching flag triggers at 15+ calls AND <5% conversion rate
- Heatmap status thresholds: active (within 30 min), idle (same day >30 min), inactive (no activity)
- Manager view omits PinnedPosition banner and ActivityFAB (replaced by heatmap and SPIFF button)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Manager command center complete, ready for admin configuration phase
- Heatmap and conversion patterns reusable for admin analytics views

## Self-Check: PASSED

All 5 created files verified present. Both task commits (65f7c7d, 7c83419) verified in git log. Build passes with 0 errors.

---
*Phase: 03-competitions-and-role-views*
*Completed: 2026-04-01*
