# Phase 2: Core Game Loop - Research

**Researched:** 2026-04-01
**Domain:** Activity logging, XP engine, live leaderboard, streaks, deal bell notifications
**Confidence:** HIGH

## Summary

This phase builds the core product: a live scoreboard where reps log activities, earn XP, see their rank shift, track streaks, and witness deal bell notifications. The technical challenges are: (1) ranking queries with window functions in Drizzle ORM, (2) optimistic UI updates when logging activities, (3) client-side polling for leaderboard refresh, (4) business-day streak calculation in SQL, and (5) component structure that supports Phase 4 animations.

The existing codebase provides a solid foundation: schema with activities table, XP/tier constants, icon components, TierBadge, authenticated layout with TopBar, and a placeholder board page ready to fill. The neon-http driver with Drizzle ORM 0.45.2 supports raw SQL via `sql` template tag for window functions. React 19.2's `useOptimistic` hook handles optimistic updates natively. Polling uses a simple custom hook with `router.refresh()` -- no external library needed.

**Primary recommendation:** Use Drizzle's `sql` template tag with `db.execute()` for ranking queries, React 19 `useOptimistic` for activity logging feedback, a custom `usePolling` hook with `router.refresh()` for 15s leaderboard refresh, and structure scoreboard rows with stable `key={userId}` props to enable Phase 4's motion layout animations.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Scoreboard rows: 64px, alternating bg-surface/bg-primary, columns: [Rank#] [Movement Arrow] [Name] [Tier Badge] [XP Bar + Number] [Today's Change] [Streak Icon]
- Rankings via SQL RANK() OVER ORDER BY xp DESC -- never store rank
- Pinned position banner: 96px, gap-to-next-rank in actionable terms ("2 calls to pass #6")
- FAB: 56px cyan circle, slide-up panel covering bottom 40%, 5 quick-log buttons with XP shown
- Deal option includes revenue amount input field
- Filters: pill toggles inline above scoreboard (time period + team)
- Streaks: business days only (Mon-Fri), 15+ calls, weekends don't break
- Deal bell: full-width bar, slides from top, auto-dismiss 8s, stacks, poll every 15s
- Funnel: per-rep compact inline stat with conversion ratios
- Polling every 15s, optimistic updates for current user
- No WebSocket -- polling + optimistic UI

### Claude's Discretion
- Exact polling implementation (SWR, React Query, or custom useEffect)
- Loading skeleton design for leaderboard
- Error handling for failed activity logs
- Exact animation timing for panel open/close
- How to calculate "gap to next" in the most user-friendly way

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| LEAD-01 | Rep sees live ranked list with rank, name, tier badge, XP, daily change, streak | Drizzle sql template + RANK() OVER window function; usePolling for 15s refresh |
| LEAD-02 | Pinned position with gap-to-next-rank | SQL query returns gap XP, divide by lowest XP activity (call=10) for actionable message |
| LEAD-03 | Time period filtering (Today, This Week, This Month, All Time) | SQL WHERE clause with date ranges on activities.createdAt |
| LEAD-04 | Team filtering (All, Alpha, Beta, Gamma) | SQL WHERE clause joining users.teamId to teams |
| LEAD-05 | Top 3 rows visual emphasis | CSS conditional: left-border glow using tier color for rank <= 3 |
| LEAD-06 | Rank movement arrows | Compare current rank vs previous period rank via dual SQL query or stored snapshot |
| ACTV-01 | Log activities via FAB | Server Action + useOptimistic for instant feedback |
| ACTV-02 | Correct XP per activity type | XP_VALUES constant already defined, apply in server action |
| ACTV-03 | Real-time XP display after logging | useOptimistic updates XP immediately, polling confirms |
| ACTV-04 | Deal includes revenue amount | activities.metadata JSON column stores { dealName, revenue }; bonus XP calculated server-side |
| ACTV-05 | Activity log panel shows XP values | Static display from XP_VALUES constant |
| TIER-01 | Tier assignment based on XP | TIER_THRESHOLDS constant + helper function getTier(xp) |
| TIER-02 | Tier badges on scoreboard | TierBadge component already exists |
| TIER-03 | Tier promotion celebration | Client-side detection when XP crosses threshold after activity log |
| STRK-01 | Track consecutive business-day streaks | SQL gap-and-island query on activities WHERE type='call' |
| STRK-02 | Active streak flame icon + day count | FlameIcon component exists; streak count from SQL |
| STRK-03 | Broken streak muted indicator | CSS conditional styling on FlameIcon |
| STRK-04 | Streak at risk pulsing amber | Client-side check: past noon + no qualifying activity today |
| BELL-01 | Deal close notification visible to all | Route handler polling endpoint; client polls every 15s |
| BELL-02 | Deal bell shows rep name, deal, amount, XP | activities.metadata stores deal info; JOIN with users for name |
| BELL-03 | Deal bell auto-dismiss 8s, stacks | Client-side timer + array state management |
| FUNL-01 | Per-rep conversion funnel with ratios | SQL COUNT grouped by activity type per user |
</phase_requirements>

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.2.2 | App Router, Server Actions, Route Handlers | Already installed, project framework |
| react | 19.2.4 | useOptimistic, startTransition | Already installed, provides optimistic update hooks |
| drizzle-orm | 0.45.2 | SQL queries with `sql` template tag | Already installed, supports raw SQL window functions |
| @neondatabase/serverless | ^1.0.2 | Postgres driver (neon-http) | Already installed, Neon Postgres connection |
| iron-session | ^8.0.4 | Session management | Already installed, getSession() pattern established |
| tailwindcss | ^4 | Styling with @theme tokens | Already installed, design tokens defined |

### Supporting (no new dependencies needed)
This phase requires NO new npm packages. React 19's built-in `useOptimistic` replaces the need for external state management. The custom `usePolling` hook replaces the need for SWR/React Query. Drizzle's `sql` template replaces the need for raw pg drivers.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom usePolling hook | SWR refreshInterval | SWR adds a dependency for one feature; router.refresh() is simpler for this use case |
| useOptimistic (React 19) | Manual useState + revert | React 19 hook handles rollback automatically on failure |
| Drizzle sql template | Raw @neondatabase/serverless queries | sql template provides escaping and type hints while Drizzle manages the connection |

**Recommendation (Claude's Discretion):** Use a custom `usePolling` hook with `router.refresh()`. It is the simplest approach -- zero dependencies, works with Server Components natively, and 15s polling for 15 users is negligible load.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── api/
│   │   └── deal-bell/
│   │       └── route.ts          # GET handler: recent deals for bell polling
│   └── board/
│       ├── layout.tsx            # Existing authenticated layout
│       ├── page.tsx              # Server Component: fetches leaderboard data
│       ├── BoardClient.tsx       # Client Component: polling, optimistic state, FAB
│       ├── ScoreboardRow.tsx     # Row component (key=userId for future animations)
│       ├── PinnedPosition.tsx    # Pinned banner with gap-to-next
│       ├── FilterBar.tsx         # Time period + team pill toggles
│       ├── ActivityFAB.tsx       # Floating action button + slide-up panel
│       ├── DealBellStack.tsx     # Deal bell notification manager
│       └── ConversionFunnel.tsx  # Per-rep funnel stats
├── lib/
│   ├── queries/
│   │   ├── leaderboard.ts       # Ranking queries with window functions
│   │   ├── streaks.ts           # Business-day streak calculation
│   │   └── funnel.ts            # Conversion funnel aggregation
│   ├── actions/
│   │   └── activities.ts        # Server Action: logActivity
│   └── hooks/
│       └── usePolling.ts         # Custom polling hook
```

### Pattern 1: Server Component + Client Component Split
**What:** The board page is a Server Component that fetches initial data. It passes data to a Client Component that handles polling, optimistic updates, and interactivity.
**When to use:** Any page that needs both server-side data fetching AND client-side interactivity.
**Example:**
```typescript
// src/app/board/page.tsx (Server Component)
import { getLeaderboard } from '@/lib/queries/leaderboard'
import { getSession } from '@/lib/auth/session'
import { BoardClient } from './BoardClient'

export default async function BoardPage() {
  const session = await getSession()
  const data = await getLeaderboard({ period: 'week', teamId: null })
  return <BoardClient initialData={data} session={session} />
}

// src/app/board/BoardClient.tsx (Client Component)
'use client'
import { usePolling } from '@/lib/hooks/usePolling'

export function BoardClient({ initialData, session }) {
  usePolling(15000) // Refreshes server component data every 15s
  // ... render scoreboard with initialData
}
```

### Pattern 2: Server Action with useOptimistic
**What:** Activity logging uses a Server Action for the mutation. The client uses `useOptimistic` to instantly show XP gain before server confirms.
**When to use:** Any mutation where the user needs instant visual feedback.
**Example:**
```typescript
// src/lib/actions/activities.ts
'use server'
import { db } from '@/lib/db'
import { activities } from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { XP_VALUES } from '@/lib/constants'
import { revalidatePath } from 'next/cache'

export async function logActivity(type: keyof typeof XP_VALUES, metadata?: string) {
  const session = await getSession()
  if (!session.isLoggedIn) throw new Error('Not authenticated')

  const xp = XP_VALUES[type]
  await db.insert(activities).values({
    userId: session.userId,
    type,
    xpEarned: xp,
    metadata,
  })
  revalidatePath('/board')
  return { success: true, xp }
}

// In client component:
'use client'
import { useOptimistic, startTransition } from 'react'
import { logActivity } from '@/lib/actions/activities'

function ActivityFAB({ currentXP }) {
  const [optimisticXP, setOptimisticXP] = useOptimistic(currentXP)

  function handleLog(type: string) {
    const xpGain = XP_VALUES[type]
    startTransition(async () => {
      setOptimisticXP(optimisticXP + xpGain)
      await logActivity(type)
    })
  }
  // ...
}
```

### Pattern 3: Route Handler for Polling Endpoint
**What:** Deal bell notifications use a dedicated Route Handler that returns recent deals. Client polls this endpoint every 15s.
**When to use:** When client components need to fetch data independently of the page's server component refresh.
**Example:**
```typescript
// src/app/api/deal-bell/route.ts
import { db } from '@/lib/db'
import { activities, users } from '@/lib/db/schema'
import { eq, and, gte, desc } from 'drizzle-orm'
import { sql } from 'drizzle-orm'

export async function GET() {
  const thirtySecondsAgo = new Date(Date.now() - 30000)
  const deals = await db.select({
    repName: users.name,
    xpEarned: activities.xpEarned,
    metadata: activities.metadata,
    createdAt: activities.createdAt,
  })
  .from(activities)
  .innerJoin(users, eq(activities.userId, users.id))
  .where(and(
    eq(activities.type, 'deal'),
    gte(activities.createdAt, thirtySecondsAgo)
  ))
  .orderBy(desc(activities.createdAt))

  return Response.json(deals)
}
```

### Anti-Patterns to Avoid
- **Storing ranks in the database:** Ranks are computed via SQL window function on every query. Never persist them -- they go stale immediately.
- **Using a modal for activity logging:** The spec says slide-up panel covering bottom 40%, not a modal. The scoreboard must remain visible above.
- **Fetching all data client-side:** Use Server Components for initial data load; client only handles polling and optimistic updates.
- **Creating separate API routes for every query:** Use Server Components and `router.refresh()` for leaderboard data. Only the deal bell needs its own Route Handler because it polls independently.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Optimistic UI state | Manual useState + try/catch + revert | React 19 `useOptimistic` | Automatic rollback on failure, works with transitions |
| Ranking calculation | Application-level sort + index | SQL `RANK() OVER (ORDER BY sum(xp) DESC)` | Database handles ties correctly, no N+1 queries |
| Session management | Custom JWT/token system | iron-session `getSession()` | Already established in Phase 1 |
| Date filtering | Manual JS date math | SQL `date_trunc` + comparisons | Timezone-safe, handles edge cases |
| Streak calculation | Iterating days in application code | SQL gap-and-island technique | Single query, handles business days |

**Key insight:** This is a 15-user demo app. Every query can be a simple aggregate over the activities table. Don't build caching layers, materialized views, or background jobs. Direct SQL on every request is fine.

## Common Pitfalls

### Pitfall 1: Drizzle sql Template Type Safety
**What goes wrong:** Using `db.execute(sql`...`)` returns untyped rows. Developers forget to type the result or use wrong types.
**Why it happens:** `sql<T>` is a compile-time hint only -- no runtime validation.
**How to avoid:** Define explicit TypeScript interfaces for query results. Use `sql<number>` and `.mapWith(Number)` for numeric columns that Postgres returns as strings.
**Warning signs:** XP values showing as strings instead of numbers, NaN in calculations.

### Pitfall 2: Timezone Issues with Date Filtering
**What goes wrong:** "Today" filter shows wrong results because server/database timezone differs from user's timezone.
**Why it happens:** Neon Postgres defaults to UTC. Activities logged at 11pm EST appear as "tomorrow" in UTC.
**How to avoid:** For a demo app, standardize on UTC everywhere. Use `date_trunc('day', created_at AT TIME ZONE 'UTC')` for day boundaries. Document that the demo assumes UTC.
**Warning signs:** Activities logged "today" not appearing in the "Today" filter.

### Pitfall 3: Streak Weekends
**What goes wrong:** A streak breaks over the weekend because Saturday/Sunday have no activity.
**Why it happens:** Naive consecutive-day check counts calendar days, not business days.
**How to avoid:** The streak query must explicitly exclude weekends (EXTRACT(DOW FROM date) NOT IN (0, 6)) and only count Mon-Fri.
**Warning signs:** All streaks showing as 1 or 2 days after a weekend.

### Pitfall 4: Optimistic Update Drift
**What goes wrong:** After several rapid activity logs, the optimistic XP total drifts from the real value because each optimistic update is based on the previous optimistic state.
**Why it happens:** `useOptimistic` uses the reducer pattern -- if base state updates while a transition is pending, it re-runs. But rapid sequential logs can overlap.
**How to avoid:** Use the reducer form of `useOptimistic` that always adds to the current base state: `(current, addedXP) => current + addedXP`. The 15s polling corrects any drift.
**Warning signs:** XP showing different values after polling refresh.

### Pitfall 5: Deal Bell Duplication
**What goes wrong:** The same deal appears in multiple bell notifications because the polling window overlaps.
**Why it happens:** Polling every 15s for deals in the last 30s means a deal could be returned by 2-3 consecutive polls.
**How to avoid:** Track deal IDs in client state. Only show a bell for deals not already shown. Use a Set of seen activity IDs.
**Warning signs:** Same deal notification appearing 2-3 times.

### Pitfall 6: Neon Serverless Cold Starts
**What goes wrong:** First request after inactivity takes 500ms+ because Neon's serverless compute needs to wake up.
**Why it happens:** Neon suspends inactive databases to save resources.
**How to avoid:** For a demo, this is acceptable. The 15s polling keeps the connection warm after the first load.
**Warning signs:** Slow initial page load, fast subsequent loads.

## Code Examples

### Leaderboard Query with RANK() OVER
```typescript
// src/lib/queries/leaderboard.ts
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

interface LeaderboardRow {
  userId: number
  name: string
  teamId: number | null
  totalXp: number
  todayXp: number
  rank: number
}

export async function getLeaderboard(opts: {
  period: 'today' | 'week' | 'month' | 'all'
  teamId: number | null
}): Promise<LeaderboardRow[]> {
  const periodFilter = {
    today: sql`AND a.created_at >= date_trunc('day', NOW() AT TIME ZONE 'UTC')`,
    week: sql`AND a.created_at >= date_trunc('week', NOW() AT TIME ZONE 'UTC')`,
    month: sql`AND a.created_at >= date_trunc('month', NOW() AT TIME ZONE 'UTC')`,
    all: sql``,
  }[opts.period]

  const teamFilter = opts.teamId
    ? sql`AND u.team_id = ${opts.teamId}`
    : sql``

  const rows = await db.execute<LeaderboardRow>(sql`
    WITH period_xp AS (
      SELECT
        u.id AS "userId",
        u.name,
        u.team_id AS "teamId",
        COALESCE(SUM(a.xp_earned), 0)::int AS "totalXp",
        COALESCE(SUM(CASE
          WHEN a.created_at >= date_trunc('day', NOW() AT TIME ZONE 'UTC')
          THEN a.xp_earned ELSE 0
        END), 0)::int AS "todayXp"
      FROM users u
      LEFT JOIN activities a ON a.user_id = u.id
        ${periodFilter}
      WHERE u.role = 'rep' ${teamFilter}
      GROUP BY u.id, u.name, u.team_id
    )
    SELECT
      *,
      RANK() OVER (ORDER BY "totalXp" DESC)::int AS rank
    FROM period_xp
    ORDER BY rank ASC
  `)

  return rows.rows as LeaderboardRow[]
}
```

### Business-Day Streak Query (Gap-and-Island)
```typescript
// src/lib/queries/streaks.ts
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

interface StreakResult {
  userId: number
  currentStreak: number
  streakActive: boolean
}

export async function getStreaks(): Promise<StreakResult[]> {
  // For each rep, count consecutive business days with 15+ calls
  // ending on the most recent business day (today if weekday, else last Friday)
  const rows = await db.execute(sql`
    WITH daily_calls AS (
      -- Count calls per user per business day
      SELECT
        user_id,
        date_trunc('day', created_at)::date AS activity_date,
        COUNT(*) FILTER (WHERE type = 'call') AS call_count
      FROM activities
      WHERE EXTRACT(DOW FROM created_at) NOT IN (0, 6)  -- Exclude weekends
      GROUP BY user_id, date_trunc('day', created_at)::date
    ),
    qualifying_days AS (
      -- Only days with 15+ calls
      SELECT user_id, activity_date
      FROM daily_calls
      WHERE call_count >= 15
    ),
    streaks AS (
      -- Gap-and-island: subtract row_number to find consecutive groups
      SELECT
        user_id,
        activity_date,
        activity_date - (ROW_NUMBER() OVER (
          PARTITION BY user_id ORDER BY activity_date
        ))::int AS streak_group
      FROM qualifying_days
    ),
    current_streaks AS (
      -- Get the most recent streak per user
      SELECT
        user_id,
        COUNT(*) AS streak_length,
        MAX(activity_date) AS last_day
      FROM streaks
      GROUP BY user_id, streak_group
      ORDER BY user_id, last_day DESC
    )
    SELECT DISTINCT ON (user_id)
      user_id AS "userId",
      streak_length::int AS "currentStreak",
      -- Active if last qualifying day is today or last business day
      CASE
        WHEN last_day >= (
          CASE EXTRACT(DOW FROM CURRENT_DATE)
            WHEN 0 THEN CURRENT_DATE - 2  -- Sunday: check Friday
            WHEN 1 THEN CURRENT_DATE - 3  -- Monday: check Friday
            ELSE CURRENT_DATE - 1          -- Tue-Sat: check yesterday
          END
        ) THEN true
        ELSE false
      END AS "streakActive"
    FROM current_streaks
    ORDER BY user_id, last_day DESC
  `)

  return rows.rows as StreakResult[]
}
```

### Custom Polling Hook
```typescript
// src/lib/hooks/usePolling.ts
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function usePolling(intervalMs: number) {
  const router = useRouter()

  useEffect(() => {
    const id = setInterval(() => {
      router.refresh()
    }, intervalMs)

    return () => clearInterval(id)
  }, [intervalMs, router])
}
```

### Deal Bell Client Polling
```typescript
// In DealBellStack.tsx
'use client'
import { useState, useEffect, useCallback } from 'react'

interface DealBell {
  id: number
  repName: string
  dealName: string
  amount: number
  xpEarned: number
  createdAt: string
}

export function DealBellStack() {
  const [bells, setBells] = useState<DealBell[]>([])
  const [seenIds, setSeenIds] = useState<Set<number>>(new Set())

  const pollDeals = useCallback(async () => {
    const res = await fetch('/api/deal-bell')
    const deals: DealBell[] = await res.json()
    const newDeals = deals.filter(d => !seenIds.has(d.id))
    if (newDeals.length > 0) {
      setBells(prev => [...newDeals, ...prev])
      setSeenIds(prev => {
        const next = new Set(prev)
        newDeals.forEach(d => next.add(d.id))
        return next
      })
    }
  }, [seenIds])

  useEffect(() => {
    const id = setInterval(pollDeals, 15000)
    return () => clearInterval(id)
  }, [pollDeals])

  // Auto-dismiss after 8 seconds
  useEffect(() => {
    if (bells.length === 0) return
    const timer = setTimeout(() => {
      setBells(prev => prev.slice(0, -1)) // Remove oldest
    }, 8000)
    return () => clearTimeout(timer)
  }, [bells])

  return (
    <div className="fixed top-12 left-0 right-0 z-50 flex flex-col gap-1">
      {bells.map(bell => (
        <div key={bell.id} className="bg-bg-elevated border-l-4 border-accent-green px-4 py-3">
          {/* bell content */}
        </div>
      ))}
    </div>
  )
}
```

### Gap-to-Next-Rank Calculation
```typescript
// Helper function for actionable gap message
import { XP_VALUES } from '@/lib/constants'

export function getGapMessage(
  currentXP: number,
  nextRankXP: number,
  nextRankName: string,
  nextRankPosition: number
): string {
  const gap = nextRankXP - currentXP + 1 // +1 to actually pass them
  // Express in terms of cheapest activity (calls = 10 XP)
  const callsNeeded = Math.ceil(gap / XP_VALUES.call)
  if (callsNeeded <= 5) {
    return `${callsNeeded} call${callsNeeded > 1 ? 's' : ''} to pass #${nextRankPosition}`
  }
  // For larger gaps, show in meetings
  const meetingsNeeded = Math.ceil(gap / XP_VALUES.meeting)
  if (meetingsNeeded <= 3) {
    return `${meetingsNeeded} meeting${meetingsNeeded > 1 ? 's' : ''} to pass #${nextRankPosition}`
  }
  return `${gap} XP to pass #${nextRankPosition}`
}
```

### Phase 4 Animation Prep: Component Structure
```typescript
// ScoreboardRow.tsx -- key structure matters for future motion animations
// Phase 4 will wrap these with <motion.div layout layoutId={`row-${userId}`}>
// For now, use stable keys and a flat list structure

export function ScoreboardRow({ rank, userId, name, tier, xp, todayXp, streak, isTop3 }: Props) {
  return (
    <div
      // IMPORTANT: key must be userId (not rank) so Phase 4 can track identity across reorders
      data-user-id={userId}
      className={`h-16 flex items-center px-4 ${
        rank % 2 === 0 ? 'bg-bg-primary' : 'bg-bg-surface'
      } ${isTop3 ? 'border-l-2' : ''}`}
      style={isTop3 ? { borderLeftColor: getTierColor(tier) } : undefined}
    >
      {/* columns */}
    </div>
  )
}

// In the parent list, render with key={row.userId}:
// {rows.map(row => <ScoreboardRow key={row.userId} {...row} />)}
//
// Phase 4 will change this to:
// <AnimatePresence>
//   {rows.map(row => (
//     <motion.div key={row.userId} layout layoutId={`row-${row.userId}`}>
//       <ScoreboardRow {...row} />
//     </motion.div>
//   ))}
// </AnimatePresence>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| framer-motion | motion (same lib, rebranded) | 2025 | Import from `motion/react` instead of `framer-motion` (Phase 4 concern) |
| useFormState (React) | useActionState (React 19) | React 19 stable | For forms with server actions -- but we use useOptimistic instead |
| SWR/React Query for polling | router.refresh() + useEffect | Next.js 13+ App Router | Server Components make client-side data fetching libraries unnecessary for this pattern |
| middleware.ts | proxy.ts | Next.js 16 | Already handled in Phase 1 |

**Deprecated/outdated:**
- `framer-motion` package name: now `motion` (v12+). Will matter in Phase 4.
- `useFormState`: renamed to `useActionState` in React 19.

## Open Questions

1. **Rank movement arrows (LEAD-06)**
   - What we know: Need to show if rank went up, down, or stayed stable
   - What's unclear: Movement compared to WHEN? Start of day? Start of current filter period? Previous poll?
   - Recommendation: Compare to rank at start of current filter period. For "This Week", compare to rank at Monday 00:00 UTC. For "Today", compare to rank at midnight UTC. Store a snapshot or compute via two queries (current rank vs period-start rank). Simplest approach: a second query for "previous period" ranks, diff in application code. For a 15-user demo, two queries is trivial.

2. **Tier promotion celebration (TIER-03)**
   - What we know: Need visual feedback when XP crosses a tier threshold
   - What's unclear: Should this persist (show once per session) or fire every time the threshold is visible?
   - Recommendation: Client-side detection -- compare previous XP (before optimistic update) with new XP. If crosses threshold, show a brief celebration (flash the tier badge, play a sound effect placeholder). No server-side tracking needed for a demo.

3. **Deal metadata schema**
   - What we know: activities.metadata is a TEXT column, deals need dealName and revenue
   - What's unclear: Should metadata remain TEXT (JSON string) or add dedicated columns?
   - Recommendation: Keep as JSON string in metadata TEXT column. Parse with `JSON.parse()`. Adding columns would require a schema migration and is overkill for one activity type. Example: `metadata: JSON.stringify({ dealName: "Acme Corp", revenue: 25000 })`.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected -- no test framework installed |
| Config file | none -- see Wave 0 |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LEAD-01 | Leaderboard shows ranked reps | manual | Visual inspection in browser | N/A |
| LEAD-02 | Pinned position with gap | manual | Visual inspection | N/A |
| LEAD-03 | Time period filtering | manual | Click filters, verify data changes | N/A |
| LEAD-04 | Team filtering | manual | Click filters, verify data changes | N/A |
| ACTV-01 | Activity logging via FAB | manual | Click FAB, log activity, verify XP | N/A |
| ACTV-02 | Correct XP per type | manual | Log each type, verify XP value | N/A |
| STRK-01 | Streak tracking | manual | Check streak display for demo reps | N/A |
| BELL-01 | Deal bell notification | manual | Log a deal, wait 15s, verify bell appears | N/A |

### Sampling Rate
- **Per task commit:** `npm run build` (type checking + build verification)
- **Per wave merge:** `npm run build` + manual browser verification
- **Phase gate:** Build passes + all requirements visually verified in browser

### Wave 0 Gaps
- No test framework needed for this demo app -- all verification is visual/manual via browser
- `npm run build` serves as the automated quality gate (TypeScript compilation + Next.js build)

## Sources

### Primary (HIGH confidence)
- `drizzle-orm` installed v0.45.2 -- `sql` template tag, `db.execute()` pattern verified in node_modules type definitions
- [Drizzle ORM sql operator docs](https://orm.drizzle.team/docs/sql) -- template syntax, typing, mapWith, raw
- [React useOptimistic docs](https://react.dev/reference/react/useOptimistic) -- hook API, reducer pattern, automatic rollback
- Project source code -- schema.ts, constants.ts, auth patterns, TierBadge, icons, board placeholder

### Secondary (MEDIUM confidence)
- [Next.js 16 blog post](https://nextjs.org/blog/next-16) -- proxy.ts, React 19.2 features
- [usePolling pattern](https://www.davegray.codes/posts/usepolling-custom-hook-for-auto-fetching-in-nextjs) -- router.refresh() polling pattern for App Router
- [Gap-and-island SQL technique](https://www.petergundel.de/postgresql/2023/04/23/streak-calculation-in-postgresql.html) -- PostgreSQL streak calculation

### Tertiary (LOW confidence)
- Motion library rebranding (framer-motion -> motion v12+) -- relevant for Phase 4 only, verified via npm registry (both packages exist at v12.38.0)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and verified in project
- Architecture: HIGH -- patterns follow established Next.js App Router conventions with existing codebase
- Pitfalls: HIGH -- identified from direct experience with these specific libraries and patterns
- Streak SQL: MEDIUM -- gap-and-island technique is well-documented but business-day variation needs testing with actual data

**Research date:** 2026-04-01
**Valid until:** 2026-05-01 (stable stack, no fast-moving dependencies)
