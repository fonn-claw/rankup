# Phase 4: Demo Data and Polish - Context

**Gathered:** 2026-04-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Narrative-driven seed data producing the exact demo scenario (15 reps, 3 pods, 2 months history, specific streaks, active battle, active SPIFF, correct tier distribution), rank/XP/bell animations using Framer Motion, and responsive polish. This phase makes the app tell a compelling demo story and feel alive.

</domain>

<decisions>
## Implementation Decisions

### Seed data narrative
- Script writes as a narrative, NOT a random generator — hard-code key story beats
- 15 reps across 3 pods (Alpha 5, Beta 5, Gamma 5) for org "Velocity SaaS"
- 2 months of historical activity data with realistic distribution (weekdays only, varying volume)
- Tier distribution: exactly 2 Gold, 5 Silver, 8 Bronze — model XP accumulation rates to hit these thresholds
- Streak scenarios: 1 rep (Marcus Webb) on 22-day active streak (Gold tier), 1 rep (Taylor Brooks) broke streak yesterday
- Active team battle: Alpha vs Beta, close race (within 500 XP difference), ~3 days remaining
- Active SPIFF: "March Madness — most meetings booked this week" — created by manager, several reps have partial progress
- Current day (today) has live morning activity from 5-8 reps who already logged calls/meetings
- Activity distribution per rep over 2 months: ~500+ calls, varying meetings/demos/deals per tier level
- Gold tier reps have deals closed; Bronze tier reps mostly calls with few meetings
- Rep account (rep@rankup.app) is Sarah Chen, Silver tier, 12-day streak, mid-pack rank ~#7
- Manager account (manager@rankup.app) manages Alpha pod
- Admin account (admin@rankup.app) is VP Sales
- Revenue amounts on deals: realistic B2B SaaS range ($5,000 - $75,000)
- Seed script runs via `npx tsx src/lib/db/seed.ts` or a package.json script
- Post-seed verification: script outputs counts and key metrics to confirm narrative integrity

### Animation implementation
- Install `motion` package (v12+, formerly framer-motion) — import from `motion/react`
- Rank shift animation: rows physically slide to new positions using `<motion.div layout>` with `layoutId={row-${userId}}`
  - Duration: 600ms ease-in-out
  - Moving row gets brief cyan glow trail (box-shadow transition)
  - Wrap scoreboard list in `<AnimatePresence>` — required for exit animations
- XP counter tick: number counts up from old to new value over 400ms
  - Use requestAnimationFrame loop or motion's `useMotionValue` + `useTransform`
  - Floating "+50 XP" indicator appears at point of change, floats up and fades out
- Deal bell drop: notification slides down from top with bounce
  - 120ms overshoot, 80ms settle (spring animation)
  - Subtle pulse of accent-green radiates outward
- Key={userId} already set on ScoreboardRow from Phase 2 — animation prep is done
- Only animate rows that actually changed position — not every row on every poll

### Responsive polish
- Desktop-first (scoreboard is primary surface)
- Tablet (768px): maintain stacked layout, reduce font sizes slightly, pill filters wrap to second line if needed
- Mobile (< 640px): scoreboard rows compact to essential columns only (rank, name, XP), hide movement arrows and streak on very small screens
- FAB remains at 56px on all sizes
- TopBar: logo and tabs already responsive from Phase 1
- Battle versus layout stacks vertically on mobile (teams on top of each other instead of side-by-side)
- Admin panel: table scrolls horizontally on mobile

### Claude's Discretion
- Exact XP accumulation formula for each rep over 2 months
- requestAnimationFrame vs motion/useMotionValue for counter tick
- Exact responsive breakpoints beyond the 768px and 640px guidelines
- Loading state improvements during seed
- Whether to add a "seed database" button in admin panel or keep CLI-only

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Visual design & animations
- `DESIGN-SPEC.md` § Motion — Rank shift animation (600ms), XP counter tick (400ms), deal bell drop (bounce) specs
- `DESIGN-SPEC.md` § Key Components — Scoreboard Row structure, Deal Bell spec, Streak Badge spec

### Domain & seed scenario
- `BRIEF.md` — Demo data scenario section: 15 reps, 3 pods, specific streaks, battle, SPIFF, tier distribution, demo accounts
- `.planning/REQUIREMENTS.md` — SEED-01 through SEED-07 (seed data), ANIM-01 through ANIM-03 (animations)

### Existing code
- `src/lib/db/schema.ts` — All tables (users, teams, activities, battles, challenges, challengeParticipants, settings)
- `src/app/board/ScoreboardRow.tsx` — Row component with key={userId}, ready for motion.div wrapper
- `src/app/board/BoardClient.tsx` — Client component with useOptimistic — animation triggers here
- `src/app/board/DealBellStack.tsx` — Bell component to add bounce animation
- `src/lib/constants.ts` — XP_VALUES for seed data calculations
- `src/lib/db/index.ts` — Database connection for seed script

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ScoreboardRow` with `key={userId}` and `data-user-id` — ready for `motion.div layout` wrapper per Phase 2 research recommendation
- `DealBellStack` with stacking logic — needs spring animation on entry
- `BoardClient` with `useOptimistic` and reducer — XP counter tick should trigger here when optimistic update fires
- `useCountdown` hook from Phase 3 — reusable for SPIFF countdown in seed verification
- All icon components, TierBadge, Logo — all in place

### Established Patterns
- Server Actions for mutations — seed script uses direct Drizzle inserts, not server actions
- Drizzle `sql` template for complex queries — seed verification queries
- `@neondatabase/serverless` driver — seed must use same connection pattern
- Tailwind v4 @theme tokens — all design colors available for animation glow effects

### Integration Points
- `src/lib/db/seed.ts` — New file for seed script (or extend if exists)
- `package.json` — Add `"seed": "tsx src/lib/db/seed.ts"` script
- `src/app/board/BoardClient.tsx` — Wrap scoreboard rows in AnimatePresence + motion.div
- `src/app/board/ScoreboardRow.tsx` — Add cyan glow transition on rank change
- `src/app/board/DealBellStack.tsx` — Add motion spring animation on entry
- `src/app/board/ActivityFAB.tsx` — Trigger floating "+XP" indicator on log

</code_context>

<specifics>
## Specific Ideas

- Seed data should tell a story: Marcus Webb is the undisputed #1 with a 22-day streak, but Jordan Ellis is closing the gap. Sarah Chen (the demo rep account) is mid-pack with momentum. Taylor Brooks just broke their streak and dropped 2 ranks.
- The morning activity should make the board feel "live" when someone first opens it — a few reps already logged calls today
- Rank shift animation is THE signature — "the one that makes people say 'whoa'" per DESIGN-SPEC
- Deal bell bounce should feel like ringing the bell on a sales floor
- XP counter tick should feel like a slot machine counting up

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-demo-data-and-polish*
*Context gathered: 2026-04-01*
