# Phase 3: Competitions and Role Views - Research

**Researched:** 2026-04-01
**Domain:** Team battles, SPIFF challenges, role-conditional views, admin configuration
**Confidence:** HIGH

## Summary

Phase 3 adds four feature clusters on top of the existing scoreboard: (1) team battles with versus layout, (2) SPIFF/challenge system with manager creation, (3) manager command center with heatmap and coaching flags, and (4) admin configuration panel with cross-team comparison, point/tier config, and engagement analytics.

The existing codebase provides strong patterns to follow. Server components fetch data, pass to client components with `usePolling(15000)` + `useOptimistic`. Raw SQL via `db.execute(sql\`...\`)` handles complex queries with CTEs and window functions. Server actions handle mutations. URL searchParams drive filter/tab state. The slide-up ActivityFAB panel provides the interaction pattern for the manager SPIFF creation slide-out. All 13 icon components (including LightningIcon, TargetIcon, UsersIcon, TrophyIcon) already exist.

**Primary recommendation:** Build in three waves: (1) schema additions + battle/challenge queries + battle page, (2) manager role-conditional view on /board + SPIFF creation, (3) admin configuration panel. Each wave delivers testable functionality.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- Side-by-side versus layout with lightning bolt divider for team battles
- bg-battle.png as background texture for versus section
- Battles accessed via BATTLES tab at /board/battles
- SPIFF cards stacked below battle section on Battles & Challenges page
- Progress ring/bar using accent-cyan fill
- "Create SPIFF" button visible only for manager role
- Slide-out panel from right side for SPIFF creation form
- challenge_participants join table for per-rep progress tracking
- Manager command center replaces "Your Position Banner" with heatmap strip
- Heatmap colors: green (#10B981) active now, amber (#F59E0B) idle today, red (#EF4444) no activity
- Clicking heatmap cell scrolls to that rep in scoreboard
- Manager scoreboard adds conversion rate column
- Coaching flags: amber TargetIcon for high activity (15+ calls) but low conversion (<5% calls-to-meetings)
- Manager view at same /board route with role-conditional rendering
- Admin at /admin route with existing layout.tsx role check
- Admin tabs: "Teams" | "Configuration" | "Analytics"
- Teams tab: cross-team comparison table
- Configuration tab: editable point values, tier thresholds, save via server action
- Analytics tab: daily active reps, activities per day, CSS-based bars or minimal Recharts
- Schema: challenge_participants join table, battles needs winner_team_id + status enum, settings table for admin config
- UsersIcon for team indicators

### Claude's Discretion
- Exact heatmap cell sizing and responsive behavior
- Chart library choice for admin analytics (CSS-only bars vs Recharts)
- Countdown timer implementation (client-side interval vs computed display)
- Exact slide-out panel animation timing
- How to structure the admin tabbed layout (URL-based tabs vs client state)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| BTTL-01 | Weekly team battles show two teams in versus layout with XP totals | Battle query aggregating team XP for battle period + VersusLayout component |
| BTTL-02 | Battle displays countdown timer for time remaining | Client-side useCountdown hook computing days/hours/min from endDate |
| BTTL-03 | Battle shows per-member XP contributions | Battle member query joining users + activities within battle period |
| BTTL-04 | Leading team has visual emphasis (glow effect) | Conditional neon-glow class on leading team's side |
| SPFF-01 | Active challenges display with title, description, progress bar, countdown | Challenge query + challenge_participants progress + countdown timer |
| SPFF-02 | Manager can create time-limited SPIFF challenges | Server action createChallenge + slide-out form panel |
| SPFF-03 | Rep sees their progress vs challenge goal | challenge_participants.progress vs challenge.goalValue |
| MGMT-01 | Manager sees team activity heatmap strip | Heatmap query: last activity time per rep + status derivation |
| MGMT-02 | Manager sees scoreboard with conversion rate column | Extended ScoreboardRow with optional conversionRate prop |
| MGMT-03 | High activity low conversion reps flagged | Funnel data: calls >= 15, meetings/calls < 0.05 = coaching flag |
| MGMT-04 | Manager can create SPIFFs from command center | Same createChallenge action, button in manager view |
| ADMN-01 | Admin views cross-team performance comparison | Team aggregation query: total XP, avg XP per rep, active battle |
| ADMN-02 | Admin configures point values for activity types | Settings table read/write + server action |
| ADMN-03 | Admin manages tier thresholds and promotion rules | Settings table for tier min values + server action |
| ADMN-04 | Admin sees engagement analytics | Activity count by day query + CSS bar chart rendering |

</phase_requirements>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.2.2 | App Router, server components, server actions | Project foundation |
| react | 19.2.4 | UI rendering, useOptimistic, startTransition | Project foundation |
| drizzle-orm | 0.45.2 | Database queries, raw SQL via sql template tag | Project foundation |
| @neondatabase/serverless | 1.0.2 | Neon Postgres HTTP driver | Project foundation |
| iron-session | 8.0.4 | Cookie-based session with role field | Auth/role checks |
| tailwindcss | 4.x | Styling with custom design tokens | Project foundation |

### Supporting (No New Dependencies Needed)
This phase requires NO new npm packages. All functionality is achievable with existing dependencies.

- Countdown timers: pure client-side `setInterval` with date math
- Charts for admin analytics: CSS-based bar charts using Tailwind div heights
- Slide-out panel: CSS transitions (same pattern as ActivityFAB)
- Heatmap: pure div grid with conditional background colors

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS bar charts | Recharts | Recharts adds ~45KB gzipped; CSS bars sufficient for 2-3 simple charts |
| setInterval countdown | date-fns/temporal | Overkill; simple Date arithmetic covers days/hours/minutes |

**Installation:** None required. All dependencies already in place.

## Architecture Patterns

### New File Structure
```
src/
├── app/
│   ├── board/
│   │   ├── battles/
│   │   │   └── page.tsx            # Battles & Challenges page (server component)
│   │   ├── challenges/
│   │   │   └── page.tsx            # Redirect or alias to battles (tabs linked separately in TopBar)
│   │   ├── BattleVersus.tsx        # Versus layout client component
│   │   ├── ChallengeCard.tsx       # SPIFF card with progress + countdown
│   │   ├── CreateSpiffPanel.tsx    # Slide-out panel for SPIFF creation
│   │   ├── ManagerHeatmap.tsx      # Team activity heatmap strip
│   │   ├── ManagerBoardClient.tsx  # Extended BoardClient with conversion + coaching
│   │   └── page.tsx                # Modified: role-conditional (rep vs manager view)
│   ├── admin/
│   │   └── page.tsx                # Replace placeholder with tabbed config
│   └── api/
│       └── deal-bell/route.ts      # Existing
├── lib/
│   ├── queries/
│   │   ├── battles.ts              # Battle XP aggregation, member contributions
│   │   ├── challenges.ts           # Active challenges, participant progress
│   │   ├── heatmap.ts              # Per-rep last activity time
│   │   └── admin.ts                # Cross-team stats, engagement data, settings
│   └── actions/
│       ├── challenges.ts           # createChallenge server action
│       └── admin.ts                # savePointValues, saveTierThresholds server actions
```

### Pattern 1: Role-Conditional Server Component
**What:** The /board page.tsx checks session.role and renders different component trees
**When to use:** Manager sees heatmap + extended scoreboard; rep sees standard BoardClient
**Example:**
```typescript
// src/app/board/page.tsx (modified)
const session = await getSession()

if (session.role === 'manager') {
  const [rows, heatmapData, funnelData, ...] = await Promise.all([...])
  return <ManagerBoardClient ... />
} else {
  // existing rep view
  return <BoardClient ... />
}
```

### Pattern 2: Battle XP Aggregation Query
**What:** Raw SQL CTE aggregating activities within battle date range, grouped by team
**When to use:** Battle versus display needs team totals and per-member breakdowns
**Example:**
```typescript
// src/lib/queries/battles.ts
const result = await db.execute(sql`
  WITH battle_xp AS (
    SELECT
      u.id AS user_id,
      u.name,
      u.team_id,
      COALESCE(SUM(a.xp_earned), 0)::int AS xp
    FROM users u
    LEFT JOIN activities a ON a.user_id = u.id
      AND a.created_at >= ${battle.startDate}
      AND a.created_at <= ${battle.endDate}
    WHERE u.team_id IN (${battle.team1Id}, ${battle.team2Id})
      AND u.role = 'rep'
    GROUP BY u.id, u.name, u.team_id
  )
  SELECT
    team_id,
    SUM(xp)::int AS team_total,
    json_agg(json_build_object('userId', user_id, 'name', name, 'xp', xp) ORDER BY xp DESC) AS members
  FROM battle_xp
  GROUP BY team_id
`)
```

### Pattern 3: Settings Key-Value Store
**What:** Simple key-value settings table for admin-configurable values
**When to use:** Point values and tier thresholds that admin can edit
**Example:**
```typescript
// Schema
export const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  updatedBy: integer('updated_by').references(() => users.id),
})
```
Settings keys: `xp.call`, `xp.meeting`, `xp.demo`, `xp.proposal`, `xp.deal`, `tier.silver.min`, `tier.gold.min`

### Pattern 4: Client-Side Countdown Hook
**What:** Custom hook that computes remaining time and updates every second/minute
**When to use:** Battle timers and SPIFF countdown displays
**Example:**
```typescript
function useCountdown(endDate: string) {
  const [remaining, setRemaining] = useState(() => computeRemaining(endDate))
  useEffect(() => {
    const id = setInterval(() => setRemaining(computeRemaining(endDate)), 60_000)
    return () => clearInterval(id)
  }, [endDate])
  return remaining // { days, hours, minutes }
}
```
Update interval: 60 seconds is sufficient (no need for per-second updates unless under 1 hour remaining).

### Pattern 5: URL-Based Admin Tabs
**What:** Admin tabs driven by searchParams (?tab=teams|config|analytics)
**When to use:** Admin page with 3 content sections
**Why:** Consistent with existing FilterBar pattern. Bookmarkable. Server component can conditionally fetch only needed data.

### Anti-Patterns to Avoid
- **Separate manager route:** Manager sees /board with role-conditional rendering, NOT a separate /manager route. Same URL, different component tree based on session.role.
- **Heavy charting library:** Do not install Recharts or chart.js for 2-3 simple bar charts. CSS div heights with Tailwind classes are sufficient.
- **Modal for SPIFF creation:** Use slide-out panel from right, consistent with ActivityFAB slide-up pattern. Not a modal.
- **Real-time countdown:** Do not update countdown every second. Update every 60 seconds; sub-minute precision only when < 1 hour remains.
- **Separate settings per field:** Use key-value settings table, not one column per setting. Extensible without schema changes.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Date arithmetic for countdown | Custom date parsing | `new Date(endDate).getTime() - Date.now()` then divide | Built-in Date is sufficient for days/hours/minutes |
| Heatmap activity detection | Complex query with joins | Simple `MAX(created_at)` per user query | One query, derive status in app code |
| Admin config persistence | Custom config file or env vars | settings table with key-value pairs | Database-backed, auditable, no restart needed |
| Scroll to rep in scoreboard | Custom scroll library | `document.querySelector('[data-user-id="X"]')?.scrollIntoView()` | Native API, data-user-id already on ScoreboardRow |

**Key insight:** This phase is feature-dense but architecturally simple. Every new feature follows established patterns from Phase 2. No new libraries, no new architectural concepts.

## Common Pitfalls

### Pitfall 1: Battle Date Range Off-by-One
**What goes wrong:** Activities at exactly startDate or endDate excluded from XP aggregation
**Why it happens:** Using `>` instead of `>=` or timestamps at midnight boundary
**How to avoid:** Use `>=` for startDate and `<=` for endDate. Store battle dates as full timestamps, not date-only.
**Warning signs:** Battle XP totals don't match manual count of activities

### Pitfall 2: Challenge Progress Counting Wrong Activity Type
**What goes wrong:** SPIFF tracking "meetings booked" but counting all activities
**Why it happens:** Forgetting to filter by challenge.goalType in the progress query
**How to avoid:** Always `WHERE a.type = ${challenge.goalType}` in challenge progress queries
**Warning signs:** Progress jumps unexpectedly when any activity is logged

### Pitfall 3: Settings Not Reflected in XP Calculations
**What goes wrong:** Admin changes point values but existing XP_VALUES constant still used
**Why it happens:** Constants are imported statically; settings table values ignored
**How to avoid:** When admin config exists, read from settings table and fall back to constants. Use a `getXpValues()` async function that checks settings first.
**Warning signs:** Admin saves new values but scoreboard XP doesn't change

### Pitfall 4: Manager View Breaking Rep View
**What goes wrong:** Adding manager-specific props to BoardClient breaks the rep rendering path
**Why it happens:** Shared component with optional props that become undefined
**How to avoid:** Either create ManagerBoardClient as a separate component, or add very clear optional typing. The separate component approach is safer since the manager view has meaningfully different UI (heatmap, conversion column, coaching flags).
**Warning signs:** TypeScript errors, undefined prop access, broken rep view

### Pitfall 5: Heatmap Status Derived at Wrong Time
**What goes wrong:** A rep who logged activity 31 minutes ago shows as "active now" or "no activity"
**Why it happens:** Server-side timestamp vs client-side "now" mismatch after polling
**How to avoid:** Return the raw `lastActivityAt` timestamp from the query. Derive green/amber/red status in the client component where `Date.now()` is current.
**Warning signs:** Heatmap status doesn't match reality after a few minutes

### Pitfall 6: TopBar Active Tab Not Highlighting on Battles Page
**What goes wrong:** BATTLES tab doesn't highlight when viewing /board/battles
**Why it happens:** BoardLayout passes `activePath="/board"` hardcoded
**How to avoid:** Pass the actual path segment to TopBar. The layout needs to detect the current route segment and pass it.
**Warning signs:** Tab always shows "LIVE BOARD" as active regardless of page

## Code Examples

### Battle Query with Team Totals and Members
```typescript
// src/lib/queries/battles.ts
export async function getActiveBattle() {
  const now = new Date()
  const result = await db.execute(sql`
    SELECT b.id, b.team1_id AS "team1Id", b.team2_id AS "team2Id",
           b.start_date AS "startDate", b.end_date AS "endDate",
           b.status, b.winner_team_id AS "winnerTeamId",
           t1.name AS "team1Name", t2.name AS "team2Name"
    FROM battles b
    JOIN teams t1 ON t1.id = b.team1_id
    JOIN teams t2 ON t2.id = b.team2_id
    WHERE b.start_date <= ${now} AND b.end_date >= ${now}
      AND (b.status IS NULL OR b.status = 'active')
    ORDER BY b.start_date DESC
    LIMIT 1
  `)
  if (result.rows.length === 0) return null
  return result.rows[0]
}

export async function getBattleXp(battleId: number, team1Id: number, team2Id: number, startDate: Date, endDate: Date) {
  return db.execute(sql`
    SELECT
      u.team_id AS "teamId",
      SUM(a.xp_earned)::int AS "teamTotal",
      json_agg(
        json_build_object('userId', u.id, 'name', u.name, 'xp', COALESCE(SUM(a.xp_earned), 0)::int)
        ORDER BY COALESCE(SUM(a.xp_earned), 0) DESC
      ) AS members
    FROM users u
    LEFT JOIN activities a ON a.user_id = u.id
      AND a.created_at >= ${startDate}
      AND a.created_at <= ${endDate}
    WHERE u.team_id IN (${team1Id}, ${team2Id}) AND u.role = 'rep'
    GROUP BY u.team_id
  `)
}
```

### Heatmap Activity Query
```typescript
// src/lib/queries/heatmap.ts
export async function getTeamHeatmap(managerId?: number) {
  return db.execute(sql`
    SELECT
      u.id AS "userId",
      u.name,
      u.team_id AS "teamId",
      MAX(a.created_at) AS "lastActivityAt"
    FROM users u
    LEFT JOIN activities a ON a.user_id = u.id
      AND a.created_at >= date_trunc('day', NOW() AT TIME ZONE 'UTC')
    WHERE u.role = 'rep'
    GROUP BY u.id, u.name, u.team_id
    ORDER BY u.name
  `)
}
```
Status derivation in client: `lastActivityAt` within 30 min = green, same day = amber, null = red.

### Challenge Progress Query
```typescript
// src/lib/queries/challenges.ts
export async function getActiveChallenges(userId: number) {
  return db.execute(sql`
    SELECT
      c.id, c.title, c.description, c.goal_type AS "goalType",
      c.goal_value AS "goalValue", c.end_date AS "endDate",
      COALESCE(cp.progress, 0)::int AS progress
    FROM challenges c
    LEFT JOIN challenge_participants cp
      ON cp.challenge_id = c.id AND cp.user_id = ${userId}
    WHERE c.start_date <= NOW() AND c.end_date >= NOW()
    ORDER BY c.end_date ASC
  `)
}
```

### SPIFF Creation Server Action
```typescript
// src/lib/actions/challenges.ts
'use server'
export async function createChallenge(formData: FormData) {
  const session = await getSession()
  if (!session.isLoggedIn || session.role !== 'manager') throw new Error('Unauthorized')

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const goalType = formData.get('goalType') as string
  const goalValue = parseInt(formData.get('goalValue') as string, 10)
  const startDate = new Date(formData.get('startDate') as string)
  const endDate = new Date(formData.get('endDate') as string)

  await db.insert(challenges).values({
    title, description, goalType, goalValue, startDate, endDate,
    createdBy: session.userId,
  })

  revalidatePath('/board/battles')
}
```

### Admin Settings Save
```typescript
// src/lib/actions/admin.ts
'use server'
export async function saveSettings(entries: { key: string; value: string }[]) {
  const session = await getSession()
  if (!session.isLoggedIn || session.role !== 'admin') throw new Error('Unauthorized')

  for (const { key, value } of entries) {
    await db.execute(sql`
      INSERT INTO settings (key, value, updated_at, updated_by)
      VALUES (${key}, ${value}, NOW(), ${session.userId})
      ON CONFLICT (key)
      DO UPDATE SET value = ${value}, updated_at = NOW(), updated_by = ${session.userId}
    `)
  }

  revalidatePath('/admin')
}
```

### CSS Bar Chart for Admin Analytics
```typescript
// Simple CSS bar chart - no library needed
function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="flex items-end gap-1 h-40">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-accent-cyan/60 rounded-t"
            style={{ height: `${(d.value / max) * 100}%` }}
          />
          <span className="font-data text-[10px] text-text-muted truncate w-full text-center">
            {d.label}
          </span>
        </div>
      ))}
    </div>
  )
}
```

## Schema Additions

### New Tables
```typescript
// challenge_participants - tracks per-rep progress on SPIFFs
export const challengeParticipants = pgTable('challenge_participants', {
  id: serial('id').primaryKey(),
  challengeId: integer('challenge_id').references(() => challenges.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  progress: integer('progress').notNull().default(0),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
})

// settings - admin-configurable key-value pairs
export const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  updatedBy: integer('updated_by').references(() => users.id),
})
```

### Modified Tables
```typescript
// battles - add status and winner
export const battleStatusEnum = pgEnum('battle_status', ['active', 'completed'])

export const battles = pgTable('battles', {
  // ... existing columns ...
  status: battleStatusEnum('status').default('active'),
  winnerTeamId: integer('winner_team_id').references(() => teams.id),
})
```

**Migration strategy:** Use `drizzle-kit push` (project convention from package.json scripts). No manual migration files.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Drizzle query builder for complex queries | Raw SQL via `db.execute(sql\`...\`)` | Phase 2 decision | Drizzle ORM lacks window functions; raw SQL with template tags is the project standard |
| Client-side routing for tabs | URL searchParams with server component re-fetch | Phase 2 decision | Bookmarkable, SSR-friendly, consistent with FilterBar |
| Modal dialogs | Slide-up/slide-out panels | Design spec decision | Keeps scoreboard visible, matches platform feel |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None currently installed |
| Config file | none -- see Wave 0 |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BTTL-01 | Battle versus layout renders with XP totals | manual-only | Visual inspection at /board/battles | N/A |
| BTTL-02 | Countdown timer displays remaining time | manual-only | Visual inspection | N/A |
| BTTL-03 | Per-member contributions shown | manual-only | Visual inspection | N/A |
| BTTL-04 | Leading team glow effect | manual-only | Visual inspection | N/A |
| SPFF-01 | Challenge cards display correctly | manual-only | Visual inspection | N/A |
| SPFF-02 | Manager creates SPIFF | manual-only | Login as manager, create SPIFF | N/A |
| SPFF-03 | Rep progress vs goal shown | manual-only | Login as rep, view challenge | N/A |
| MGMT-01 | Heatmap strip renders with colors | manual-only | Login as manager, view /board | N/A |
| MGMT-02 | Conversion rate column visible | manual-only | Login as manager, view scoreboard | N/A |
| MGMT-03 | Coaching flags on correct reps | manual-only | Visual inspection | N/A |
| MGMT-04 | Manager SPIFF creation button | manual-only | Login as manager | N/A |
| ADMN-01 | Cross-team comparison table | manual-only | Login as admin, view /admin | N/A |
| ADMN-02 | Point value configuration saves | manual-only | Edit values, save, verify | N/A |
| ADMN-03 | Tier threshold management | manual-only | Edit thresholds, save, verify | N/A |
| ADMN-04 | Engagement analytics charts | manual-only | Login as admin, view analytics tab | N/A |

**Justification for manual-only:** This is a demo app with no existing test infrastructure. All requirements are UI-rendering and form-interaction features. The build verification is `next build` succeeding + visual inspection of each role view.

### Sampling Rate
- **Per task commit:** `npm run build` (catches TypeScript errors and import issues)
- **Per wave merge:** `npm run build` + manual smoke test of each role
- **Phase gate:** Full build green + all 3 role views inspected

### Wave 0 Gaps
- No test framework needed for this demo app -- `npm run build` is the verification gate
- Schema push needed after adding new tables: `npm run db:push`

## Open Questions

1. **Challenge progress auto-tracking vs manual**
   - What we know: challenge_participants has a progress field, challenges have goalType matching activity types
   - What's unclear: Should progress auto-increment when a matching activity is logged, or does the rep manually join/update?
   - Recommendation: Auto-track. When logActivity runs, check active challenges matching that activity type and increment challenge_participants.progress. Auto-create the participant row if not exists. This is seamless and matches the "instant feedback" philosophy.

2. **Admin settings affecting live XP calculations**
   - What we know: XP_VALUES is a static constant imported everywhere
   - What's unclear: Should admin-configured values immediately affect all XP calculations?
   - Recommendation: For demo purposes, keep XP_VALUES as the default. Admin config saves to settings table but does not dynamically override the constant in Phase 3. Phase 4 seed data can use whatever values are configured. This avoids runtime settings-fetch on every activity log.

3. **TopBar activePath for sub-routes**
   - What we know: BoardLayout passes `activePath="/board"` hardcoded. TopBar tab matching uses strict equality.
   - What's unclear: How to highlight BATTLES tab when on /board/battles
   - Recommendation: Modify BoardLayout to detect the current route segment (use `headers()` to read the pathname, or pass it from the page). Or change TopBar tab matching to use `startsWith` for the active check.

## Sources

### Primary (HIGH confidence)
- Existing codebase: `src/lib/db/schema.ts`, `src/app/board/BoardClient.tsx`, `src/app/board/page.tsx`, `src/lib/queries/leaderboard.ts`, `src/lib/actions/activities.ts` -- established patterns
- `DESIGN-SPEC.md` -- Battles & Challenges screen spec, Manager Command Center spec
- `BRIEF.md` -- Business rules for battles, SPIFFs, tiers, activity types

### Secondary (MEDIUM confidence)
- Drizzle ORM raw SQL patterns -- verified against existing working code in leaderboard.ts
- Next.js App Router server component patterns -- verified against existing page.tsx files

### Tertiary (LOW confidence)
- None -- all patterns verified against existing codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new dependencies, all patterns proven in Phase 2
- Architecture: HIGH -- extends existing patterns (role-conditional rendering, raw SQL queries, server actions)
- Pitfalls: HIGH -- derived from actual codebase analysis (hardcoded activePath, settings vs constants, date range boundaries)

**Research date:** 2026-04-01
**Valid until:** 2026-05-01 (stable -- no external dependency changes expected)
