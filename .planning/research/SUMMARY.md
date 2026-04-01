# Project Research Summary

**Project:** RankUp -- Sales Performance Gamification Platform
**Domain:** Sales performance gamification (leaderboard, XP, streaks, team battles)
**Researched:** 2026-04-01
**Confidence:** MEDIUM-HIGH

## Executive Summary

RankUp is a sales gamification platform built around a live ESPN-style scoreboard -- not a traditional dashboard. The core product loop is simple: reps log activities, earn XP, and compete on a ranked leaderboard with tiers (Bronze/Silver/Gold), streaks, team battles, and time-limited challenges (SPIFFs). The stack is prescribed (Next.js App Router, Neon Postgres, Drizzle ORM, Vercel), and the architecture follows a Server Components-first approach with client islands for animations and interactivity. Framer Motion is the critical addition for the rank-shift and counter-tick animations that make the scoreboard feel alive.

The recommended approach is to build bottom-up from the data model: schema and auth first, then the activity logging and XP engine (the primary write path), then the leaderboard and scoreboard UI (the primary read path), then layer on battles/SPIFFs/manager views, and finally polish with animations. The scoreboard component architecture must support animation from the start even if the actual animations are added later -- this means keyed lists with stable element identity and Framer Motion `layout` props baked into the component structure early.

The key risks are: (1) leaderboard demoralization if tier-scoped competition is not built from day one (bottom 60% of reps disengage), (2) XP inflation making tier thresholds meaningless unless monthly XP drives tier placement, (3) streak logic edge cases around timezones and weekends, and (4) demo data that must tell a coherent narrative (22-day streak, close team battle, specific tier distribution) rather than being randomly generated. All four risks are preventable with upfront design decisions in the first two phases.

## Key Findings

### Recommended Stack

The core framework is prescribed: Next.js 16 (App Router), Neon Postgres with `@neondatabase/serverless` driver, and Drizzle ORM. The key additions beyond the prescribed stack are Framer Motion for the rank-shift and counter animations that define the product's feel, Tailwind CSS v4 for the dark-theme scoreboard styling, and Recharts for the limited charting needs in manager/admin views.

**Core technologies:**
- **Next.js 16 + React 19:** Server Components for data-heavy leaderboard queries, Server Actions for activity mutations, built-in Vercel deployment
- **Neon Postgres + @neondatabase/serverless:** Serverless Postgres with WebSocket driver optimized for Vercel edge/serverless. Must use Neon's driver, not `pg`
- **Drizzle ORM 0.45:** Lightweight, SQL-like syntax ideal for the window function ranking queries (RANK() OVER). No binary engine, fast cold starts
- **Framer Motion 12:** Critical for rank-shift row animations (`layout` prop), XP counter ticks, deal bell notifications. CSS alone cannot do layout reorder animations
- **Tailwind CSS 4 + clsx + tailwind-merge:** Dark theme with neon accents. Custom `cn()` utility for conditional tier/rank styling
- **Zod 4 + date-fns 4:** Validation for Server Actions; date math for streaks, SPIFFs, and battle periods
- **bcryptjs:** Password hashing for demo accounts. No auth library needed -- custom cookie sessions for 3 demo accounts

**What NOT to use:** No WebSockets (polling + optimistic UI), no component libraries like shadcn/Chakra (conflicts with scoreboard aesthetic), no NextAuth (overkill for demo), no global state management (Server Components handle it), no Redis/caching layer (15 users).

### Expected Features

**Must have (table stakes):**
- Live leaderboard with rank, XP, tier badge, movement indicators, time-period filtering
- Activity logging with configurable XP values (Call 10, Meeting 50, Demo 75, Proposal 100, Deal 500)
- Authentication with 3 demo accounts and role-based views (rep/manager/admin)
- Tier system (Bronze/Silver/Gold) with tier-scoped competition
- Activity streak tracking with visual badges
- Deal bell notification (team-wide when a deal closes)
- "Your Position Banner" with gap-to-next-rank in concrete actions ("2 calls to pass #6")
- Realistic demo seed data with specific narrative beats

**Should have (differentiators -- build after core is solid):**
- Team vs team battles with countdown and versus layout
- SPIFF/challenge system with manager creation and progress tracking
- Manager heatmap strip (who's active right now)
- Conversion funnel per rep (coaching indicator)
- Animated rank shifts (row sliding) and XP counter tick-up
- Admin configuration panel for point values and tier thresholds

**Defer (v2+):**
- CRM integration (Salesforce/HubSpot)
- WebSocket real-time updates
- TV display mode
- Badge/achievement system

### Architecture Approach

The architecture is a standard Next.js App Router monolith with four layers: Presentation (role-based views sharing a common scoreboard), Server Actions/API (mutations and polling endpoints), Domain Logic (pure functions for XP calculation, tier rules, streak logic), and Data (Drizzle ORM + Neon). The critical pattern is Server Components with Client Islands -- the scoreboard renders server-side with zero JS for the static structure, and client components handle animations, activity logging, and polling. Rankings are computed in SQL using window functions (`RANK() OVER`), never in application code. The "live feel" comes from polling every 15-30 seconds plus optimistic UI on local actions.

**Major components:**
1. **Scoreboard View** -- Full-width ranked list, Server Component with client islands for animations. ONE component shared across roles with conditional header banner
2. **Activity Logger** -- Floating action button with one-tap activity types. Client Component with Server Actions. Optimistic XP update before server confirmation
3. **XP Engine + Rank Calculator** -- Pure domain functions for XP calculation. SQL window functions for ranking. Never store rank in the database
4. **Streak Tracker** -- Computed from activity log data, not stored as a simple counter. Must handle timezone and weekend edge cases
5. **Deal Bell Feed** -- Database-backed event feed, polled by client every 10 seconds, slide-down notification with auto-dismiss
6. **Battle/SPIFF System** -- Time-bound competitions with computed scores (aggregation queries, not materialized)
7. **Manager Command Center** -- Role-gated view with team heatmap, coaching indicators, SPIFF creation

### Critical Pitfalls

1. **Leaderboard demoralization** -- Build tier-scoped competition from Phase 1. Show "Silver #1 of 5" alongside global rank. Default view for a Silver rep must highlight Silver-tier competition
2. **XP inflation** -- Model the math before seeding. Monthly XP should drive tier placement, not all-time. Calibrate seed data to produce exactly 2 Gold / 5 Silver / 8 Bronze
3. **Streak logic complexity** -- Compute from activity logs, not a stored counter. Define timezone and weekend policy upfront. Seed data must produce exactly a 22-day streak when the calculation runs
4. **Incoherent demo data** -- Write the seed script as a narrative, not a randomizer. Hard-code key story beats (close battle, specific streaks, morning activity). Verify post-seed with queries
5. **Role view divergence** -- Build ONE scoreboard component with role-conditional slots. Do not create three separate page trees. The manager sees the same scoreboard with a different banner
6. **Animation performance** -- Use Framer Motion `layout` prop with `transform`-based animations. Only animate rows that changed position. Build the component structure to support animation from the start, even if animations are added later

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation (Schema, Auth, Layout)
**Rationale:** Everything depends on the data model and auth. The tier-scoped leaderboard design must be baked into the schema from day one. Route structure and shared component architecture must prevent role-view divergence.
**Delivers:** Database schema (all tables), Neon connection, auth with 3 demo accounts, app layout with role-based routing, shared ScoreboardRow component skeleton
**Addresses:** Authentication, role-based views, user/team schema, tier system (data model)
**Avoids:** Pitfall #1 (demoralization -- tier column in schema), Pitfall #6 (role divergence -- single scoreboard route), Pitfall (Neon connection pooling)

### Phase 2: Core Game Loop (Activity Logging, XP, Leaderboard)
**Rationale:** The primary write path (log activity -> earn XP) and primary read path (ranked leaderboard) form the core product loop. Everything else layers on top.
**Delivers:** Activity logging with XP calculation, live leaderboard with SQL-driven rankings, time-period and team filtering, Your Position Banner with gap-to-next, tier badges, streak tracking
**Addresses:** Activity logging, XP system, live leaderboard, streaks, tier display, time filtering, deal bell notifications
**Avoids:** Pitfall #2 (XP inflation -- model math during implementation), Pitfall #3 (streak logic -- build alongside activity logging), Pitfall #5 (animation prep -- keyed lists with stable identity)

### Phase 3: Competitions and Challenges
**Rationale:** Team battles and SPIFFs depend on the activity/XP foundation from Phase 2. These are the highest-value P2 features.
**Delivers:** Team vs team battles with versus layout and countdown, SPIFF/challenge system with manager creation and progress tracking
**Addresses:** Team battles, SPIFFs, manager challenge creation
**Avoids:** Building competitions before the underlying XP aggregation is proven

### Phase 4: Manager and Admin Views
**Rationale:** Role-gated views consume the same data through different lenses. The shared scoreboard from Phase 1-2 means this phase adds banners and panels, not new page trees.
**Delivers:** Manager command center (team heatmap, coaching indicators, conversion funnel), admin analytics and configuration panel
**Addresses:** Manager heatmap, conversion funnel, admin config, engagement analytics

### Phase 5: Demo Data and Seed Script
**Rationale:** Seed data depends on ALL schema tables and feature logic existing. Must be narrative-driven, not random. Treated as a product feature.
**Delivers:** Complete seed script producing the specified scenario (15 reps, 3 pods, 2 months history, 22-day streak, close battle, active SPIFF, correct tier distribution, morning activity)
**Addresses:** Pitfall #4 (incoherent demo data). Post-seed verification queries confirm all narrative requirements
**Note:** Some minimal seed data will be needed earlier for development. This phase creates the final, polished, narrative-driven seed.

### Phase 6: Animation and Polish
**Rationale:** Animations layer on top of working data flows. The component structure from Phase 2 already supports animation (keyed lists, stable identity). This phase adds the motion.
**Delivers:** Rank shift row animations (600ms slide), XP counter tick-up (400ms), deal bell drop with bounce, floating "+50 XP" indicators, responsive polish
**Addresses:** Pitfall #5 (animation performance -- transform-based, only animate changed rows)

### Phase Ordering Rationale

- **Schema first:** Tier-scoped competition and XP economy must be designed before any UI is built. Retrofitting tier filtering is costly (Pitfall #1 recovery: MEDIUM)
- **Core loop before extensions:** Activity -> XP -> Rank is the atomic loop. Battles and SPIFFs are multiplayer extensions of this loop
- **Seed data after features:** The narrative-driven seed depends on all tables and all calculation logic being finalized. Building seed early means rebuilding it when schema changes
- **Animations last:** The "live feel" is the product's signature, but it requires all data flows working first. Component architecture supports animation from Phase 2; actual motion is added in Phase 6
- **Role views share components:** By building one scoreboard with conditional slots (Phase 1 decision), manager/admin views in Phase 4 are additions, not rebuilds

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2 (streaks):** Streak calculation has timezone and weekend edge cases that need explicit policy decisions before implementation
- **Phase 3 (battles/SPIFFs):** Team battle scoring and SPIFF progress tracking involve time-bounded aggregation queries that need careful design
- **Phase 5 (seed data):** Seed script is effectively a data product -- needs careful modeling of XP accumulation rates vs tier thresholds

Phases with standard patterns (skip research-phase):
- **Phase 1 (schema/auth/layout):** Well-documented Next.js App Router patterns, standard Drizzle schema, cookie-based auth
- **Phase 4 (manager/admin views):** Standard role-gated CRUD and analytics queries
- **Phase 6 (animations):** Framer Motion `layout` animations are well-documented for list reordering

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified via npm registry. Prescribed stack with clear additions |
| Features | MEDIUM | Based on training data knowledge of competitors (Ambition, Spinify, SalesScreen, Hoopla). No live verification. Core patterns are stable |
| Architecture | HIGH | Standard Next.js App Router patterns. Server Components + Client Islands is well-documented. SQL window functions for ranking is proven |
| Pitfalls | MEDIUM | Domain-informed but not web-verified. Tech-specific claims (Neon driver, Drizzle patterns) should be verified during implementation |

**Overall confidence:** MEDIUM-HIGH -- The stack and architecture are on solid ground. Feature landscape and pitfalls are domain-informed but would benefit from live verification of competitor current state.

### Gaps to Address

- **XP economy modeling:** The brief specifies point values AND tier thresholds AND 2-month history, but these have not been mathematically reconciled. Must model during Phase 1 schema design to ensure the tier distribution is achievable
- **Streak weekend policy:** Not specified in the brief. Decision needed: do weekends break streaks? Recommendation: business days only (Mon-Fri) to avoid penalizing work-life balance
- **Polling interval tuning:** Research suggests 15-30 seconds, but the right interval depends on how the UI feels. May need adjustment during Phase 6 polish
- **Neon serverless driver compatibility:** Claimed to work with Drizzle and Vercel edge, but should be verified with a connection test in Phase 1 before building on it
- **Recharts necessity:** May not be needed if manager/admin charts are simple enough for CSS-based progress bars. Decide during Phase 4

## Sources

### Primary (HIGH confidence)
- npm registry -- all package versions verified (2026-04-01)
- Project BRIEF.md, DESIGN-SPEC.md -- domain requirements and visual identity
- Next.js App Router documentation -- Server Components, Server Actions, routing patterns
- Drizzle ORM documentation -- schema definition, query builder, Neon integration
- PostgreSQL documentation -- window functions (RANK, ROW_NUMBER), CTEs

### Secondary (MEDIUM confidence)
- Training data knowledge of Ambition, Spinify, SalesScreen, Hoopla -- competitor feature analysis
- Gamification psychology (Duolingo streaks, ELO-style tier systems) -- feature design patterns
- Framer Motion documentation -- layout animations, AnimatePresence

### Tertiary (LOW confidence)
- Neon + Vercel edge runtime compatibility -- needs verification during Phase 1
- Recharts dark theme support -- needs verification during Phase 4

---
*Research completed: 2026-04-01*
*Ready for roadmap: yes*
