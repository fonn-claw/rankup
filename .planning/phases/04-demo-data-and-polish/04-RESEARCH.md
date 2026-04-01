# Phase 4: Demo Data and Polish - Research

**Researched:** 2026-04-01
**Domain:** Seed data generation, React animation (motion library), responsive CSS
**Confidence:** HIGH

## Summary

This phase has two distinct workstreams: (1) a comprehensive narrative-driven seed script that populates the database with 15 reps, 3 pods, 2 months of activity history, specific streak/battle/SPIFF scenarios, and correct tier distribution, and (2) adding motion animations to three existing components (scoreboard rank shifts, XP counter ticks, deal bell bounce).

The seed script is a pure data engineering task against a known schema (Drizzle + Neon Postgres). The animation work uses the `motion` package (v12+, formerly framer-motion) with its React-specific imports from `motion/react`. Both workstreams build on existing code -- the seed file already has team/user creation scaffolding, and the components already have the right `key` props and structure for animation wrapping.

**Primary recommendation:** Build the seed script first (it enables all demo scenarios), then layer animations on the existing components. The seed script must be deterministic and idempotent (truncate-then-insert).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Seed data is narrative-driven with hard-coded story beats, NOT random
- 15 reps across 3 pods (Alpha 5, Beta 5, Gamma 5) for "Velocity SaaS"
- 2 months of historical weekday-only activity data
- Tier distribution: exactly 2 Gold, 5 Silver, 8 Bronze
- Marcus Webb: 22-day streak, Gold tier; Taylor Brooks: broke streak yesterday
- Active battle: Alpha vs Beta, within 500 XP, ~3 days remaining
- Active SPIFF: "March Madness -- most meetings booked this week"
- Today has morning activity from 5-8 reps
- Rep account = Sarah Chen, Silver tier, 12-day streak, rank ~#7
- Manager account manages Alpha pod; Admin is VP Sales
- Revenue: $5,000-$75,000 B2B SaaS range
- Seed runs via `npx tsx src/lib/db/seed.ts` (script already in package.json as `db:seed`)
- Post-seed verification output with counts and key metrics
- `motion` package v12+ with `motion/react` imports
- Rank shift: `motion.div layout` with `layoutId`, 600ms ease-in-out, cyan glow trail
- Wrap scoreboard list in `AnimatePresence`
- XP counter: 400ms count-up with floating "+XP" indicator
- Deal bell: spring animation with 120ms overshoot, 80ms settle
- Only animate rows that actually changed position
- Desktop-first responsive: 768px tablet, <640px mobile
- Mobile scoreboard: essential columns only (rank, name, XP)
- Battle layout stacks vertically on mobile
- Admin table scrolls horizontally on mobile

### Claude's Discretion
- Exact XP accumulation formula for each rep over 2 months
- requestAnimationFrame vs motion/useMotionValue for counter tick
- Exact responsive breakpoints beyond 768px and 640px
- Loading state improvements during seed
- Whether to add "seed database" button in admin or keep CLI-only

### Deferred Ideas (OUT OF SCOPE)
None
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SEED-01 | 15 sales reps across 3 pods (Alpha, Beta, Gamma -- 5 each) for "Velocity SaaS" | Existing seed.ts has team/user scaffolding; expand with 12 additional reps |
| SEED-02 | 2 months of historical activity data with realistic distribution | Insert into `activities` table with dates spanning ~60 weekdays back |
| SEED-03 | 1 rep on 22-day streak (Gold), 1 rep who broke streak yesterday | Streak computed from activities -- seed must ensure 22 consecutive days of 15+ calls for Marcus Webb, and gap yesterday for Taylor Brooks |
| SEED-04 | Active team battle: Alpha vs Beta (close race) | Insert into `battles` table with startDate ~4 days ago, endDate ~3 days from now, status='active' |
| SEED-05 | Active SPIFF: "March Madness -- most meetings booked this week" | Insert into `challenges` + `challengeParticipants` tables |
| SEED-06 | Tier distribution: 2 Gold, 5 Silver, 8 Bronze | XP accumulation math -- Gold needs 15000+, Silver 5000-14999, Bronze <5000 |
| SEED-07 | Current day has live morning activity from some reps | Insert today's activities with timestamps from earlier today |
| ANIM-01 | Rank shift -- rows slide to new position (600ms, cyan glow) | `motion.div layout` with `layoutId` in BoardClient, cyan box-shadow transition on ScoreboardRow |
| ANIM-02 | XP counter tick (400ms) with floating "+XP" | useMotionValue + useTransform or requestAnimationFrame in ScoreboardRow/PinnedPosition |
| ANIM-03 | Deal bell drop with bounce | motion spring animation on DealBellStack entry |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| motion | 12.38.0 | React animations (layout, spring, presence) | Renamed from framer-motion; the standard React animation library |
| drizzle-orm | 0.45.2 (installed) | Database inserts for seed script | Already in project |
| bcryptjs | 3.0.3 (installed) | Password hashing for demo accounts | Already in project |
| dotenv | 17.3.1 (installed) | Load DATABASE_URL in seed script | Already in project |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| tsx | (dev) | Run seed TypeScript directly | Already used via `npx tsx` in db:seed script |

**Installation:**
```bash
npm install motion
```

No other new dependencies needed. Everything else is already installed.

## Architecture Patterns

### Seed Script Structure
```
src/lib/db/seed.ts
├── truncateAll()          # Clear tables in FK-safe order
├── createTeams()          # 3 pods
├── createUsers()          # 15 reps + manager + admin (17 total)
├── generateActivities()   # 2 months of history per rep
├── createBattle()         # Alpha vs Beta active battle
├── createChallenge()      # March Madness SPIFF
├── addTodayActivity()     # Morning activities for 5-8 reps
├── verify()               # Output counts and tier distribution
└── main()                 # Orchestrate in order
```

### Pattern 1: Narrative Seed Data
**What:** Hard-code rep profiles with target XP ranges, then generate activities that produce those XP totals deterministically.
**When to use:** When seed data must tell a specific story with exact tier distribution.
**Example:**
```typescript
// Define rep profiles with target outcomes
const REP_PROFILES = [
  { name: 'Marcus Webb', email: 'marcus@velocity.io', teamSlug: 'alpha',
    targetXp: 18200, tier: 'gold', streakDays: 22, dailyCalls: 25, dailyMeetings: 3 },
  { name: 'Sarah Chen', email: 'rep@rankup.app', teamSlug: 'alpha',
    targetXp: 12450, tier: 'silver', streakDays: 12, dailyCalls: 18, dailyMeetings: 2 },
  // ... 13 more
]

// Generate activities per rep to hit target XP
function generateActivitiesForRep(rep: RepProfile, userId: number): ActivityInsert[] {
  const workdays = getWorkdays(startDate, endDate)
  const activities: ActivityInsert[] = []
  let accumulatedXp = 0

  for (const day of workdays) {
    // Vary daily volume with some randomness around the rep's baseline
    const callCount = rep.dailyCalls + Math.floor(Math.random() * 6) - 3
    for (let i = 0; i < callCount; i++) {
      activities.push({
        userId,
        type: 'call',
        xpEarned: 10,
        createdAt: randomTimeOnDay(day),
      })
      accumulatedXp += 10
    }
    // Add meetings, demos, deals at rep's rate...
  }
  return activities
}
```

### Pattern 2: Layout Animation with motion
**What:** Wrap list items in `motion.div` with `layout` prop to auto-animate position changes.
**When to use:** When list items reorder and should visually slide to new positions.
**Example:**
```typescript
import { motion, AnimatePresence } from 'motion/react'

// In BoardClient -- wrap the scoreboard list
<AnimatePresence mode="popLayout">
  {optimisticRows.map((row) => (
    <motion.div
      key={row.userId}
      layout
      layoutId={`row-${row.userId}`}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      <ScoreboardRow {...props} />
    </motion.div>
  ))}
</AnimatePresence>
```

### Pattern 3: Spring Animation for Entry
**What:** Use motion's spring physics for bouncy entry animations.
**When to use:** Deal bell notification entry.
**Example:**
```typescript
import { motion } from 'motion/react'

<motion.div
  initial={{ y: -100, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  exit={{ y: -100, opacity: 0 }}
  transition={{
    type: 'spring',
    stiffness: 500,
    damping: 25,  // Controls overshoot -- lower = more bounce
    mass: 0.8,
  }}
>
  {/* Deal bell content */}
</motion.div>
```

### Pattern 4: Animated Counter
**What:** Count up a number from old value to new value over a duration.
**When to use:** XP counter tick animation.
**Example:**
```typescript
import { useMotionValue, useTransform, animate } from 'motion/react'
import { useEffect, useState } from 'react'

function AnimatedCounter({ value }: { value: number }) {
  const motionValue = useMotionValue(0)
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 0.4,
      onUpdate: (v) => setDisplay(Math.round(v)),
    })
    return () => controls.stop()
  }, [value, motionValue])

  return <span>{display.toLocaleString()}</span>
}
```

### Anti-Patterns to Avoid
- **Random seed data:** Do NOT use Math.random() to determine rep count, team assignment, or tier outcomes. The narrative requires exact profiles.
- **Animating all rows on poll:** Only rows whose rank actually changed should get the glow effect. Use a prev-rank comparison.
- **Heavy layout animations on mobile:** `layout` animations can be expensive on mobile. Consider reducing or disabling on small screens.
- **Inserting activities one-by-one:** Batch insert activities in chunks (500-1000 per insert) to avoid timeout with Neon serverless.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Layout reorder animation | Manual position tracking + CSS transforms | `motion.div layout` + `layoutId` | Handles enter/exit, interruptions, and FLIP automatically |
| Spring physics | Manual easing calculations | `motion` spring transition | Spring math is non-trivial; motion handles damping/stiffness correctly |
| Number interpolation | Manual requestAnimationFrame loop | `motion`'s `animate()` utility | Handles cancellation, easing, and cleanup automatically |
| Workday calculation | Manual day-by-day loop skipping weekends | Simple filter: `day.getDay() !== 0 && day.getDay() !== 6` | Straightforward but easy to get wrong with off-by-one |

## Common Pitfalls

### Pitfall 1: XP Totals Don't Match Tier Targets
**What goes wrong:** Activity generation produces XP that doesn't land in the right tier bracket.
**Why it happens:** Random variation in daily activity counts accumulates unpredictably over 2 months.
**How to avoid:** Calculate total XP from activities AFTER generation, then adjust the last few days to hit the target range. Or: pre-calculate exact activity counts needed and distribute deterministically.
**Warning signs:** Verify step shows wrong tier distribution.

### Pitfall 2: Streak Calculation Mismatch
**What goes wrong:** Seed generates activities for streak, but the streak query doesn't count them.
**Why it happens:** Streaks are computed from activities with type='call' on consecutive weekdays. If the seed inserts calls at wrong times or the query uses different date boundaries, counts diverge.
**How to avoid:** Use the same date-flooring logic in seed as in the streak query. Verify streaks in the post-seed check.
**Warning signs:** Marcus Webb shows streak != 22 after seeding.

### Pitfall 3: Layout Animation Flickers on Initial Render
**What goes wrong:** All rows animate in from a stacked position on first page load.
**Why it happens:** `motion.div layout` animates from the element's initial DOM position to its computed position.
**How to avoid:** Use `layout` only after initial render, or set `initial={false}` on the `motion.div` to skip the first animation.
**Warning signs:** Page load shows all rows sliding into place from the same position.

### Pitfall 4: AnimatePresence Mode Conflicts
**What goes wrong:** Exit animations don't play, or new items render before old ones exit.
**Why it happens:** Wrong `mode` prop on AnimatePresence. Default mode waits for exit before enter.
**How to avoid:** Use `mode="popLayout"` for the scoreboard (items move simultaneously). Use `mode="sync"` or default for deal bells.
**Warning signs:** Rows disappear/appear instantly instead of sliding.

### Pitfall 5: Neon Serverless Timeout on Large Inserts
**What goes wrong:** Seed script times out inserting 2 months of activities for 15 reps.
**Why it happens:** Neon serverless has connection limits and query timeouts. Inserting 10,000+ rows in one query can hit limits.
**How to avoid:** Batch inserts in chunks of 500-1000 rows. Use `db.insert(activities).values(batch)` per chunk.
**Warning signs:** Seed script hangs or errors with "connection timeout."

### Pitfall 6: Cyan Glow Applied to All Rows
**What goes wrong:** Every row gets the cyan glow trail, not just the one that moved.
**Why it happens:** No tracking of which rows actually changed rank.
**How to avoid:** Store previous ranks in a ref, compare on each render, only apply glow class to rows where `prevRank !== currentRank`. Use a timeout to remove the glow after 1-2 seconds.
**Warning signs:** Entire scoreboard glows cyan on every poll refresh.

## Code Examples

### Truncate Tables in FK-Safe Order
```typescript
// Truncate in reverse dependency order
import { sql } from 'drizzle-orm'

async function truncateAll() {
  await db.execute(sql`TRUNCATE TABLE challenge_participants, challenges, battles, activities, settings, users, teams RESTART IDENTITY CASCADE`)
}
```

### Batch Insert Activities
```typescript
async function insertActivitiesBatch(allActivities: ActivityInsert[]) {
  const BATCH_SIZE = 500
  for (let i = 0; i < allActivities.length; i += BATCH_SIZE) {
    const batch = allActivities.slice(i, i + BATCH_SIZE)
    await db.insert(activities).values(batch)
  }
  console.log(`Inserted ${allActivities.length} activities in ${Math.ceil(allActivities.length / BATCH_SIZE)} batches`)
}
```

### Workday Generator
```typescript
function getWorkdays(start: Date, end: Date): Date[] {
  const days: Date[] = []
  const current = new Date(start)
  while (current <= end) {
    const dow = current.getDay()
    if (dow !== 0 && dow !== 6) {
      days.push(new Date(current))
    }
    current.setDate(current.getDate() + 1)
  }
  return days
}
```

### Rank Change Detection for Glow Effect
```typescript
// In BoardClient -- track previous ranks
const prevRanksRef = useRef<Map<number, number>>(new Map())

useEffect(() => {
  // After render, store current ranks for next comparison
  const newMap = new Map<number, number>()
  optimisticRows.forEach((r) => newMap.set(r.userId, r.rank))
  prevRanksRef.current = newMap
}, [optimisticRows])

// Pass rankChanged boolean to ScoreboardRow
const prevRank = prevRanksRef.current.get(row.userId)
const rankChanged = prevRank !== undefined && prevRank !== row.rank
```

### Floating XP Indicator
```typescript
import { motion, AnimatePresence } from 'motion/react'

function FloatingXp({ xp, show }: { xp: number; show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.span
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 0, y: -30 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute -top-2 right-0 font-data text-sm text-accent-cyan font-bold pointer-events-none"
        >
          +{xp} XP
        </motion.span>
      )}
    </AnimatePresence>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `framer-motion` package | `motion` package (v12+) | 2024 | Import from `motion/react` instead of `framer-motion` |
| `motion.div layout` with `layoutId` string | Same API, stable in v12 | Stable | No change -- pattern is mature |
| `AnimatePresence exitBeforeEnter` | `AnimatePresence mode="wait"` | framer-motion v7+ | Old prop removed; use `mode` prop |
| `useAnimation` for orchestration | `animate()` utility function | motion v11+ | Simpler API for programmatic animations |

## Open Questions

1. **Exact activity volume per rep over 2 months**
   - What we know: 500+ calls per rep total, Gold reps have more deals, Bronze reps mostly calls
   - What's unclear: Exact daily distribution formula to hit tier targets precisely
   - Recommendation: Define target XP per rep, work backward to activity counts, adjust final days to hit target

2. **requestAnimationFrame vs useMotionValue for XP counter**
   - What we know: Both work; motion's `animate()` handles cleanup and cancellation better
   - Recommendation: Use `animate()` from motion -- simpler, handles edge cases, consistent with rest of animation stack

## Sources

### Primary (HIGH confidence)
- Project codebase: schema.ts, BoardClient.tsx, ScoreboardRow.tsx, DealBellStack.tsx, ActivityFAB.tsx, constants.ts, seed.ts
- npm registry: motion v12.38.0 verified current

### Secondary (MEDIUM confidence)
- motion library API patterns from training data (layout animations, spring physics, AnimatePresence) -- these are stable APIs that haven't changed significantly

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - motion v12.38.0 verified, all other deps already installed
- Architecture: HIGH - seed script pattern is straightforward Drizzle inserts; animation patterns are well-documented motion APIs
- Pitfalls: HIGH - based on real project constraints (Neon timeout, layout animation quirks, XP math)

**Research date:** 2026-04-01
**Valid until:** 2026-05-01 (stable domain, no fast-moving dependencies)
