# Technology Stack

**Project:** RankUp -- Sales Performance Gamification Platform
**Researched:** 2026-04-01

## Recommended Stack

The core framework is dictated by the project brief: Next.js + Neon Postgres + Drizzle ORM on Vercel. This section covers exact versions and all supporting libraries needed for the scoreboard-style gamification UI.

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Next.js (App Router) | 16.2.2 | Full-stack React framework | Specified in brief. Server Components for data-heavy leaderboard queries, Server Actions for activity logging, built-in API routes. Vercel-native deployment. |
| React | 19.x | UI library | Ships with Next.js 16. Server Components reduce client bundle for the data-dense scoreboard rows. |
| TypeScript | 6.0.2 | Type safety | Non-negotiable for a data model with tiers, XP calculations, role-based views. Catches point-value calculation bugs at compile time. |

**Confidence: HIGH** -- versions verified via npm registry.

### Database

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Neon Postgres | (managed service) | Primary database | Specified in brief. Serverless Postgres with auto-scaling, branching for dev. Free tier sufficient for demo. |
| @neondatabase/serverless | 1.0.2 | Neon connection driver | WebSocket-based driver optimized for serverless/edge. Works with Vercel's edge runtime. Use over `pg` or `postgres` for Neon specifically. |
| Drizzle ORM | 0.45.2 | Query builder / ORM | Specified in brief. Type-safe, lightweight, SQL-like syntax. Excellent Postgres support. No heavy runtime -- important for fast leaderboard queries. |
| drizzle-kit | 0.31.10 | Migrations & schema tooling | Companion tool for Drizzle. Handles schema push, migration generation, and Drizzle Studio for debugging. |

**Confidence: HIGH** -- versions verified via npm registry.

### Styling & Animation

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Tailwind CSS | 4.2.2 | Utility-first CSS | Fast iteration on the dark-theme scoreboard UI. Custom colors (neon cyan, tier golds) map cleanly to Tailwind config. v4 has native CSS-first config. |
| @tailwindcss/postcss | 4.2.2 | PostCSS integration | Required for Tailwind v4 with Next.js. |
| Framer Motion | 12.38.0 | Animation library | Critical for this project. Rank shift animations (600ms slide), XP counter ticks (400ms), deal bell drop with bounce -- all described in design spec. Framer Motion's `layout` animations handle the rank reordering perfectly. `AnimatePresence` for deal bell notifications. |
| clsx | 2.1.1 | Conditional classnames | Lightweight utility for building dynamic class strings (tier colors, rank states, active/idle). |
| tailwind-merge | 3.5.0 | Tailwind class merging | Prevents conflicting Tailwind classes when composing component variants. Use with clsx via a `cn()` utility. |

**Confidence: HIGH** -- Framer Motion is the clear choice for the rank-shift and counter-tick animations described in the design spec. CSS animations alone cannot handle layout reordering smoothly.

### Authentication & Security

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| bcryptjs | 3.0.3 | Password hashing | Pure JS bcrypt implementation. No native dependencies (important for Vercel serverless). Demo accounts use simple passwords but should still be hashed. |
| Iron Session (next approach) | -- | Session management | Use Next.js built-in cookies API with encrypted session tokens. For a demo app, rolling your own cookie-based sessions with `crypto.subtle` is simpler than adding a session library. Store user ID + role in an encrypted cookie. |

**Confidence: MEDIUM** -- Cookie-based sessions are the right call for this demo (PROJECT.md confirms this decision). No need for NextAuth/Auth.js complexity when we have 3 hardcoded demo accounts.

### Validation & Data

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Zod | 4.3.6 | Schema validation | Validates activity log submissions, SPIFF creation forms, config changes. Works with Server Actions for type-safe form handling. |
| date-fns | 4.1.0 | Date manipulation | Streak calculations (consecutive days), SPIFF countdown timers, "time remaining" displays, weekly battle periods. Lightweight, tree-shakeable. |

**Confidence: HIGH** -- standard choices, well-established.

### Charting (Manager/Admin Views)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Recharts | 3.8.1 | Charts for analytics views | Manager conversion funnels, admin engagement analytics, activity trend lines. React-native, composable. Only needed for manager/admin views -- the rep scoreboard uses custom components, not charts. |

**Confidence: MEDIUM** -- Recharts is adequate for the limited charting needs (funnel visualization, trend lines). If chart needs are minimal, could skip this and use simple CSS-based progress bars instead.

### Fonts

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| next/font (built-in) | -- | Font loading | Use `next/font/google` to load Barlow Condensed and JetBrains Mono as specified in DESIGN-SPEC.md. Zero layout shift, self-hosted by Next.js. |

**Confidence: HIGH** -- built into Next.js, no additional dependency.

### Dev Dependencies

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| @types/bcryptjs | 3.0.0 | TypeScript types for bcryptjs | Type safety for password hashing functions. |
| eslint | (ships with Next.js) | Linting | Next.js includes ESLint config out of the box. |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| ORM | Drizzle | Prisma | Specified in brief. Also, Drizzle is lighter -- no binary engine, faster cold starts on Vercel serverless. Better for leaderboard queries that need raw SQL control. |
| Animation | Framer Motion | CSS animations / React Spring | CSS alone cannot do layout reorder animations (rank shifts). React Spring has worse DX for the specific animations needed (layout, exit, counter). Framer Motion's `layout` prop is purpose-built for rank reordering. |
| Auth | Custom cookie sessions | NextAuth / Auth.js | Massive overkill for 3 demo accounts. NextAuth adds complexity, additional tables, and provider configuration we don't need. Simple encrypted cookie with user ID + role is sufficient. |
| Styling | Tailwind CSS | CSS Modules / Styled Components | Tailwind is fastest for iteration and the dark theme maps cleanly to utility classes. CSS Modules would work but slower to build. Styled Components adds runtime overhead. |
| DB Driver | @neondatabase/serverless | pg / postgres.js | Neon's own driver is optimized for their serverless architecture (WebSocket connections, connection pooling). Using `pg` with Neon works but misses connection optimizations. |
| Charts | Recharts | Chart.js / Nivo / Tremor | Recharts is the most React-native option. Chart.js requires a canvas wrapper. Nivo is heavy. Tremor is opinionated on styling (light theme default conflicts with our dark scoreboard). |
| Date | date-fns | dayjs / Luxon | date-fns is tree-shakeable (only import what you use), dayjs is smaller but less comprehensive for the streak/period calculations we need. |
| Validation | Zod | Yup / Valibot | Zod has the best TypeScript inference and first-class support in Server Actions. Valibot is smaller but less ecosystem support. |

## What NOT to Use

| Technology | Why Not |
|------------|---------|
| Socket.io / WebSockets | PROJECT.md explicitly scopes this out. Polling + optimistic UI is sufficient for the demo. Adding WebSockets doubles infrastructure complexity for no demo benefit. |
| Redis | No need for a caching layer. Neon Postgres handles the query load for 15 demo users. Adding Redis adds infrastructure cost and operational complexity. |
| NextAuth / Auth.js | 3 demo accounts. No OAuth. No magic links. Cookie sessions are 20 lines of code vs. a full auth library. |
| Prisma | Brief specifies Drizzle. Also heavier runtime, slower cold starts, less SQL control. |
| shadcn/ui | The design spec calls for a completely custom scoreboard UI -- not a component library aesthetic. shadcn components are designed for standard dashboards (light cards, subtle borders). This app needs neon-on-dark scoreboard rows, custom animations, and sports-broadcast styling. Building custom components is faster than fighting a component library's defaults. |
| Material UI / Chakra | Same reasoning as shadcn -- these enforce a design language that conflicts with the scoreboard aesthetic. |
| TanStack Query | For a demo app with Server Components doing data fetching, React's built-in cache + revalidation is sufficient. TanStack Query adds complexity for client-side caching we don't need. |
| Zustand / Redux | Server Components handle most state. Client state is minimal (current filters, animation triggers). React's useState/useContext is sufficient. No global state management needed. |

## Installation

```bash
# Core
npm install next@16 react react-dom

# Database
npm install @neondatabase/serverless drizzle-orm

# Styling & Animation
npm install tailwindcss@4 @tailwindcss/postcss framer-motion clsx tailwind-merge

# Auth & Security
npm install bcryptjs

# Validation & Data
npm install zod date-fns

# Charts (manager/admin views only)
npm install recharts

# Dev dependencies
npm install -D drizzle-kit @types/bcryptjs @types/react @types/react-dom typescript @types/node
```

## Environment Variables

```bash
# .env.local
DATABASE_URL=           # Neon Postgres connection string (pooled)
SESSION_SECRET=         # 32+ character random string for cookie encryption
```

## Key Architecture Decisions Driven by Stack

1. **Server Components for leaderboard data** -- The scoreboard page fetches all ranking data server-side. No loading spinners for the initial board render. Client components only for interactive elements (filters, activity logging, animations).

2. **Drizzle for complex ranking queries** -- Leaderboard queries need window functions (RANK, ROW_NUMBER), CTEs for streak calculations, and aggregations for team battles. Drizzle's SQL-like API handles this better than Prisma's abstracted query builder.

3. **Framer Motion `layoutId` for rank animations** -- Each scoreboard row gets a `layoutId` based on the rep's ID. When ranks change, Framer Motion automatically animates rows to their new positions. This is the core UX feature.

4. **Polling via `router.refresh()` or `revalidatePath`** -- Instead of WebSockets, use Next.js revalidation to refresh the leaderboard periodically (every 10-30 seconds). Combined with optimistic updates when the current user logs activity, this creates a "live" feel without WebSocket infrastructure.

5. **Custom components over component libraries** -- The scoreboard row, tier badges, deal bell, and XP counter are all bespoke components. No component library provides these. Building from scratch with Tailwind is faster than adapting a library.

## Sources

- npm registry (all versions verified via `npm view [package] version` on 2026-04-01)
- Project BRIEF.md and PROJECT.md for stack constraints
- DESIGN-SPEC.md for animation and styling requirements
