# Architecture Research

**Domain:** Sales performance gamification platform (real-time leaderboard + XP system)
**Researched:** 2026-04-01
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
+------------------------------------------------------------------+
|                     Presentation Layer                             |
|  +-------------+  +-------------+  +-------------+  +---------+  |
|  | Scoreboard  |  | Battles &   |  | Manager     |  | Admin   |  |
|  | (Rep View)  |  | Challenges  |  | Command Ctr |  | Config  |  |
|  +------+------+  +------+------+  +------+------+  +----+----+  |
|         |                |                |              |        |
+---------+----------------+----------------+--------------+--------+
|                     Shared UI Layer                                |
|  +----------+  +-----------+  +-----------+  +---------------+    |
|  | Position |  | Activity  |  | Deal Bell |  | Animations &  |    |
|  | Banner   |  | Logger    |  | Feed      |  | Transitions   |    |
|  +----------+  +-----------+  +-----------+  +---------------+    |
+---------+----------------+----------------+--------------+--------+
|                     Server Actions / API Layer                     |
|  +----------------+  +----------------+  +------------------+     |
|  | Activity       |  | Leaderboard    |  | Challenge/SPIFF  |     |
|  | Actions        |  | Queries        |  | Actions          |     |
|  +-------+--------+  +-------+--------+  +--------+---------+    |
+---------+------------------------+---------------------+----------+
|                     Domain Logic Layer                             |
|  +----------+  +----------+  +---------+  +--------+  +-------+  |
|  | XP       |  | Rank     |  | Streak  |  | Team   |  | Tier  |  |
|  | Engine   |  | Calc     |  | Tracker |  | Battle |  | Promo |  |
|  +----------+  +----------+  +---------+  +--------+  +-------+  |
+---------+------------------------+---------------------+----------+
|                     Data Layer (Drizzle ORM + Neon Postgres)       |
|  +------------+  +------------+  +------------+                   |
|  | Users &    |  | Activities |  | Challenges |                   |
|  | Teams      |  | & XP       |  | & Battles  |                   |
|  +------------+  +------------+  +------------+                   |
+------------------------------------------------------------------+
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Scoreboard View | Full-width ranked list with live feel, position banner | Next.js Server Component with client islands for animations |
| Activity Logger | Quick-log panel (slide-up, not modal) for calls/meetings/demos/deals | Client Component with Server Actions for mutation |
| XP Engine | Calculate XP from activity type, apply multipliers (battle bonus) | Pure function in domain layer, called by Server Actions |
| Rank Calculator | Compute rankings from XP totals with time period filters | SQL query with window functions (RANK() OVER) |
| Streak Tracker | Track consecutive days of minimum activity threshold | DB trigger or Server Action check on activity log |
| Team Battle | Aggregate team XP for battle period, determine winner | Computed view/query, not materialized unless perf requires it |
| Tier Promotion | Monthly evaluation of XP thresholds for tier changes | Scheduled logic or on-demand calculation |
| Deal Bell Feed | Team-wide notification when a deal closes | Database-backed feed, polled by client |
| Manager Command Center | Team heatmap, coaching indicators, SPIFF creation | Server Component with role-gated data |
| Admin Config | Point values, tier thresholds, team management | Standard CRUD with Server Actions |
| Auth | Cookie-based sessions, role-based access (rep/manager/admin) | Middleware + session cookie, not JWT |

## Recommended Project Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── (auth)/                 # Auth group (login page)
│   │   └── login/
│   ├── (app)/                  # Authenticated app group
│   │   ├── layout.tsx          # Top bar nav, auth check, position banner
│   │   ├── page.tsx            # Live Board (default/home)
│   │   ├── battles/
│   │   │   └── page.tsx        # Battles & Challenges view
│   │   ├── manager/
│   │   │   └── page.tsx        # Manager command center (role-gated)
│   │   └── admin/
│   │       ├── page.tsx        # Admin analytics
│   │       └── settings/
│   │           └── page.tsx    # Point config, tier rules, teams
│   └── api/                    # API routes (polling endpoints)
│       ├── feed/route.ts       # Deal bell feed polling
│       └── leaderboard/route.ts # Live rank data for client refresh
├── components/                 # Shared UI components
│   ├── scoreboard/             # Scoreboard row, position banner, rank list
│   ├── activity/               # Activity logger panel, XP counter
│   ├── battle/                 # Battle card, vs layout, countdown
│   ├── challenge/              # SPIFF card, progress ring
│   ├── notifications/          # Deal bell, toast system
│   └── ui/                     # Base components (tier badge, streak badge, etc.)
├── lib/                        # Core logic
│   ├── db/                     # Database layer
│   │   ├── schema.ts           # Drizzle schema definitions
│   │   ├── index.ts            # DB connection (Neon serverless driver)
│   │   └── seed.ts             # Demo data seeding
│   ├── actions/                # Server Actions
│   │   ├── activities.ts       # Log activity, earn XP
│   │   ├── challenges.ts       # Create/manage SPIFFs
│   │   ├── auth.ts             # Login/logout/session
│   │   └── admin.ts            # Config mutations
│   ├── queries/                # Read-only data fetching
│   │   ├── leaderboard.ts      # Ranked lists with filters
│   │   ├── battles.ts          # Team battle state
│   │   ├── streaks.ts          # Streak data
│   │   ├── feed.ts             # Deal bell events
│   │   └── analytics.ts        # Manager/admin analytics
│   ├── domain/                 # Pure business logic
│   │   ├── xp.ts               # XP calculation, multipliers
│   │   ├── tiers.ts            # Tier thresholds, promotion logic
│   │   └── streaks.ts          # Streak rules (min activity, reset)
│   ├── auth.ts                 # Session management, middleware helpers
│   └── utils.ts                # Formatting, time helpers
└── styles/                     # Global styles, design tokens
    └── globals.css             # Tailwind config with custom design tokens
```

### Structure Rationale

- **app/(app)/:** Route grouping keeps authenticated routes under one layout with shared top bar and auth middleware. Flat page structure matches the thin top-bar navigation (3-4 tabs max).
- **lib/actions/ vs lib/queries/:** Explicit separation of mutations (Server Actions) from reads (query functions). Server Actions handle validation, XP calculation, and side effects. Queries are pure data fetching used by Server Components.
- **lib/domain/:** Pure functions with no database dependency. XP calculation, tier thresholds, streak rules. Testable in isolation, reusable across actions and queries.
- **components/scoreboard/:** The scoreboard row is the atomic unit of this app. It deserves its own folder because it has complex sub-components (rank number, movement arrow, XP bar, streak badge, tier badge).

## Architectural Patterns

### Pattern 1: Server Components with Client Islands

**What:** Render the scoreboard list as a Server Component (data fetching at the edge, zero JS for the static structure). Wrap animated elements (XP counter, rank shift, deal bell) in Client Components.

**When to use:** Every page in this app. The scoreboard rows are mostly static display with isolated interactive/animated parts.

**Trade-offs:** Excellent initial load performance and SEO. Slightly more complex component boundaries. The "live feel" comes from client islands refreshing via polling, not from the whole page being client-rendered.

**Example:**
```typescript
// app/(app)/page.tsx — Server Component
async function LiveBoard() {
  const rankings = await getLeaderboard({ period: 'week' });
  const userPosition = await getUserPosition();
  return (
    <>
      <PositionBanner position={userPosition} />
      <RankList rankings={rankings} />
      <ActivityLogger />  {/* Client Component */}
      <DealBellFeed />     {/* Client Component — polls for new events */}
    </>
  );
}
```

### Pattern 2: Optimistic Activity Logging

**What:** When a rep logs an activity, immediately update the UI (XP counter ticks, position potentially shifts) before the server confirms. The Server Action persists and recalculates, then the next poll cycle corrects any drift.

**When to use:** Every activity log action. The "instant feedback" requirement is critical to the gamification psychology.

**Trade-offs:** More engaging UX. Rare edge case where optimistic rank change gets corrected on next refresh (acceptable for a demo). Simpler than WebSockets.

**Example:**
```typescript
// Optimistic update in activity logger
function logActivity(type: ActivityType) {
  // Immediately show XP gain animation
  startTransition(() => {
    optimisticAddXp(XP_VALUES[type]);
  });
  // Server Action persists and recalculates
  await createActivity({ type });
  // Router refresh pulls fresh rankings
  router.refresh();
}
```

### Pattern 3: SQL-Driven Rankings (Window Functions)

**What:** Compute rankings in SQL using `RANK() OVER (ORDER BY ...)` rather than fetching all data and sorting in application code. Filter by time period, team, and tier at the query level.

**When to use:** All leaderboard queries. This is the core read path of the app.

**Trade-offs:** Extremely efficient — Postgres handles ranking natively. The query is the single source of truth for position. Avoids complex application-level sorting and pagination. Requires well-designed indexes on the activities table.

**Example:**
```sql
SELECT
  u.id, u.name, u.team_id, u.tier,
  SUM(a.xp_earned) as total_xp,
  SUM(CASE WHEN a.created_at > CURRENT_DATE THEN a.xp_earned ELSE 0 END) as today_xp,
  RANK() OVER (ORDER BY SUM(a.xp_earned) DESC) as rank
FROM users u
LEFT JOIN activities a ON a.user_id = u.id
  AND a.created_at >= date_trunc('week', CURRENT_DATE)
WHERE u.role = 'rep'
GROUP BY u.id
ORDER BY rank;
```

### Pattern 4: Polling with staleTime for "Live" Feel

**What:** Client components poll the leaderboard API every 15-30 seconds. Use a stale-while-revalidate pattern so the UI never shows loading states — it just silently updates when new data arrives.

**When to use:** The live board, deal bell feed, and battle progress. These create the "live scoreboard" feel without WebSocket complexity.

**Trade-offs:** Not truly real-time (15-30s delay), but perfectly adequate for a sales activity platform where events happen minutes apart, not milliseconds. Far simpler to implement and deploy on Vercel's serverless infrastructure.

## Data Flow

### Activity Logging Flow (Primary Write Path)

```
[Rep taps "Log Call"]
    |
    v
[Client: Optimistic XP update + animation]
    |
    v
[Server Action: createActivity()]
    |
    +--> [Domain: calculateXP(type, multipliers)]
    |        |
    |        v
    +--> [DB: INSERT activity, UPDATE user XP total]
    |        |
    |        v
    +--> [Domain: checkStreak(userId, today)]
    |        |
    |        v
    +--> [DB: UPDATE streak if maintained]
    |
    v
[revalidatePath('/') — triggers Server Component re-render]
    |
    v
[Client: Fresh scoreboard data replaces optimistic state]
```

### Leaderboard Read Flow (Primary Read Path)

```
[Page load or poll interval]
    |
    v
[Server Component / API Route]
    |
    v
[Query: getLeaderboard({ period, team, tier })]
    |
    v
[SQL: Window function ranking query with filters]
    |
    v
[Return: Array of { rank, userId, name, tier, totalXp, todayXp, streak, movement }]
    |
    v
[Server Component renders rows, Client islands animate changes]
```

### Deal Bell Flow (Event Propagation)

```
[Rep logs "Deal Closed"]
    |
    v
[Server Action: createActivity(type='deal')]
    |
    +--> [DB: INSERT activity]
    +--> [DB: INSERT deal_event (bell feed)]
    |
    v
[Other clients poll /api/feed every 10s]
    |
    v
[New event detected → Deal Bell notification slides down]
    |
    v
[Auto-dismiss after 8 seconds]
```

### Key Data Flows

1. **Activity -> XP -> Rank:** The core loop. Every logged activity triggers XP calculation, persists to DB, and on next read the ranking query reflects the new position. Optimistic UI bridges the gap.
2. **Activity -> Streak Check:** Each activity log checks if the user has met the daily minimum threshold. If yes and no prior check today, the streak counter increments. If end-of-day with no threshold met, streak resets.
3. **Team Battle Aggregation:** Team battle scores are computed queries (SUM of team member XP within battle period), not materialized. Queried on page load and poll for the battles tab.
4. **SPIFF Progress:** Individual progress against a SPIFF goal is a filtered COUNT/SUM query (e.g., "meetings booked this week where challenge is active"). Computed on read.

## Database Schema Outline

The key tables and their relationships:

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `users` | Reps, managers, admins | id, name, email, password_hash, role, team_id, tier, current_xp, streak_days, streak_last_date |
| `teams` | Sales pods | id, name, manager_id |
| `activities` | Every logged action | id, user_id, type (enum), xp_earned, revenue (for deals), created_at |
| `challenges` | SPIFFs created by managers | id, title, description, type, goal_value, start_date, end_date, created_by |
| `challenge_progress` | Per-user progress on challenges | id, challenge_id, user_id, current_value |
| `team_battles` | Pod vs pod competitions | id, team_a_id, team_b_id, start_date, end_date, winner_id |
| `deal_events` | Feed of deal closings for bell | id, user_id, activity_id, deal_name, revenue, created_at |
| `activity_config` | Point values per activity type | type, xp_value, is_active |

**Critical indexes:**
- `activities(user_id, created_at)` — leaderboard time-period queries
- `activities(user_id, type, created_at)` — SPIFF progress queries
- `activities(created_at)` — deal bell feed (recent events)
- `users(team_id, role)` — team filtering

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-100 users (this demo) | Monolith is perfect. Polling every 15-30s. No caching needed. Direct SQL queries. |
| 100-1k users | Add indexes if not already present. Consider caching leaderboard results for 5-10s (computed rankings don't change every request). |
| 1k-10k users | Materialized leaderboard view refreshed every 30s. Move polling to SSE. Redis cache for hot path (current rankings). |
| 10k+ users | Separate read replicas. Event-driven XP calculation (queue + worker). WebSocket for live updates. Partition activities table by month. |

### Scaling Priorities

1. **First bottleneck: Leaderboard query.** The ranking query with window functions over the activities table is the hottest path. Proper indexes on `activities(user_id, created_at)` handle this well up to thousands of users. Beyond that, pre-compute and cache.
2. **Second bottleneck: Polling frequency.** 15 reps polling every 15 seconds = trivial. 1000 users polling = consider SSE or longer intervals with smart invalidation.

## Anti-Patterns

### Anti-Pattern 1: Storing Rank in the Database

**What people do:** Add a `rank` column to the users table and update it every time XP changes.
**Why it's wrong:** Every activity log triggers N updates (one per user whose rank might shift). Creates race conditions, stale ranks, and write amplification.
**Do this instead:** Compute rank at query time using SQL window functions. It's a read, not a write. Postgres handles this efficiently.

### Anti-Pattern 2: Client-Side Sorting for Rankings

**What people do:** Fetch all users with their XP and sort in JavaScript.
**Why it's wrong:** Sends too much data to the client. Can't efficiently filter by time period, team, or tier. Breaks with pagination.
**Do this instead:** Let Postgres do the ranking with `RANK() OVER()`. Return only the rows needed, already in order.

### Anti-Pattern 3: Real-Time Everything (WebSockets from Day 1)

**What people do:** Set up WebSocket infrastructure for "live" updates before the core app works.
**Why it's wrong:** Massive complexity increase for a demo app. WebSockets on Vercel require additional infrastructure (Pusher, Ably, etc.). Polling every 15s is indistinguishable from "real-time" for sales activity that happens minutes apart.
**Do this instead:** Polling + optimistic UI. If you log a call, YOUR screen updates instantly (optimistic). Others see it within 15-30 seconds. Nobody notices the difference.

### Anti-Pattern 4: Separate Gamification Microservice

**What people do:** Build the XP/rank/streak logic as a separate service that the main app calls via API.
**Why it's wrong:** Adds network latency, deployment complexity, and operational burden for no benefit at this scale. The gamification logic IS the app.
**Do this instead:** Domain logic in `lib/domain/` as pure functions. Same process, zero network overhead, easy to test. Extract to a service only if you have multiple consumers (you don't).

### Anti-Pattern 5: Over-Normalized Activity Schema

**What people do:** Create separate tables for calls, meetings, demos, proposals, and deals with different columns.
**Why it's wrong:** Makes the leaderboard query a 5-table UNION. Adds complexity for adding new activity types. XP aggregation becomes painful.
**Do this instead:** Single `activities` table with a `type` enum column. Optional columns (like `revenue` for deals, `deal_name` for the bell) are nullable. One table, one index, one query.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Neon Postgres | Neon serverless driver (`@neondatabase/serverless`) | Use connection pooling via `neonConfig`. Works great on Vercel Edge/Serverless. |
| Vercel | Deploy target | App Router + Server Actions deploy cleanly. No special config needed. |
| Google Fonts | Barlow Condensed + JetBrains Mono | Load via `next/font/google` for optimal performance. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Client Components <-> Server | Server Actions (mutations), fetch/poll (reads) | Server Actions for activity logging. Polling API routes for live data refresh. |
| Server Components <-> DB | Direct Drizzle queries | No API layer needed. Server Components call query functions directly. |
| Domain Logic <-> DB Layer | Function calls (same process) | Domain functions are pure. DB layer calls them, not the reverse. |
| Auth <-> All Routes | Middleware + session check | Middleware validates cookie on every request. Role check at page/action level. |

## Build Order (Dependency Chain)

The architecture implies this build sequence:

1. **Database schema + auth** — Everything depends on users, teams, and the session system. Seed script for demo data.
2. **Activity logging + XP engine** — The core write path. Without activities, there's no data for anything else.
3. **Leaderboard queries + scoreboard UI** — The core read path and primary screen. Depends on activities existing.
4. **Streaks + tiers** — Computed from activity data. Enhance the scoreboard display.
5. **Team battles + SPIFFs** — Higher-level features that layer on top of the activity/XP foundation.
6. **Deal bell + notifications** — Event-driven features that depend on activity logging working.
7. **Manager/admin views** — Role-gated views that consume the same data through different lenses.
8. **Animations + polish** — The "live feel" layer (rank shift animation, XP counter tick, deal bell drop). Requires all data flows working first.

## Sources

- Next.js App Router architecture: established patterns for Server Components + Client islands (HIGH confidence, well-documented)
- Neon serverless driver: official documentation for Vercel deployment (HIGH confidence)
- Drizzle ORM: schema definition and query builder patterns (HIGH confidence)
- SQL window functions for ranking: standard PostgreSQL pattern (HIGH confidence)
- Optimistic UI with Server Actions: Next.js documented pattern using `useOptimistic` (HIGH confidence)
- Gamification system architecture: synthesized from domain knowledge of XP/rank/streak systems in gaming and sales platforms (MEDIUM confidence)

---
*Architecture research for: Sales performance gamification platform (RankUp)*
*Researched: 2026-04-01*
