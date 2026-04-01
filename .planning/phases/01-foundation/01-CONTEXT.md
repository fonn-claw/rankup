# Phase 1: Foundation - Context

**Gathered:** 2026-04-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Database schema, authentication with 3 role-based demo accounts (rep, manager, admin), app layout shell with dark scoreboard theme, and full design system integration. This phase delivers the skeleton that all subsequent phases build on — no game logic, no leaderboard data, no animations yet.

</domain>

<decisions>
## Implementation Decisions

### Login experience
- Full-screen dark background (#0A0E17) with hero-login.png as background image
- Centered login form with email/password fields
- Inline error messages below form fields (no modals)
- RankUp logo (logo.svg) above the form
- No registration flow — demo accounts only

### Session & routing
- Cookie-based sessions (not JWT) — simpler for demo, works with Server Components
- Unauthorized access redirects to /login with return URL preserved
- Role-based routing after login:
  - Rep → /board (the live scoreboard)
  - Manager → /board (same scoreboard with manager banner replacing position banner)
  - Admin → /admin (cross-team view)
- Middleware checks session cookie and role on protected routes

### Layout shell
- Top bar: 48px height, dark background
  - Left: logo.svg
  - Center: 3 tab navigation — "LIVE BOARD" | "BATTLES" | "CHALLENGES"
  - Right: user name, streak badge area (populated in Phase 2)
  - "LIVE" indicator with pulsing dot
- No sidebar — full-width stacked layout per DESIGN-SPEC.md
- Main content area fills remaining viewport height
- Mobile responsive: stacked layout maintained, font sizes scale down, tabs remain accessible

### Asset integration
- SVG icons: Create React components for inline rendering (allows CSS color/size control)
- Decorative PNGs (hero-login.png, bg-deal-bell.png, bg-battle.png): Use next/image or CSS background
- Tier badges (tier-gold.svg, tier-silver.svg, tier-bronze.svg): Inline SVG components
- favicon.svg: Configured in app metadata
- Font loading: next/font with Google Fonts for Barlow Condensed (600, 700) and JetBrains Mono (400, 500)

### Database schema
- Neon Postgres with @neondatabase/serverless driver (not pg — required for Vercel serverless)
- Drizzle ORM for schema definition and queries
- Initial tables: users (with role enum), teams/pods, plus schema stubs for activities, battles, challenges (populated in later phases)
- Demo accounts seeded in this phase: rep@rankup.app, manager@rankup.app, admin@rankup.app (password: demo1234)
- Password hashing with bcrypt

### Design system
- Tailwind CSS with custom theme tokens matching DESIGN-SPEC.md color palette exactly
- No component library (shadcn, MUI, etc.) — fully custom components
- CSS custom properties for tier colors and neon glow effects
- Color tokens: bg-primary (#0A0E17), bg-surface (#111827), bg-surface-hover (#1A2332), accent-cyan (#06D6F2), accent-green (#10B981), accent-red (#EF4444), accent-amber (#F59E0B), tier-gold (#FFD700), tier-silver (#C0C0C0), tier-bronze (#CD7F32)

### Claude's Discretion
- Exact Tailwind config structure and utility class naming
- Loading/skeleton states for the shell
- Error boundary implementation details
- Drizzle migration strategy

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Visual design
- `DESIGN-SPEC.md` — Complete design system: colors, typography, components, layout structure, anti-patterns, animations, screen descriptions
- `BRIEF.md` — Domain context, user personas, XP values, tier thresholds, demo data scenario

### Assets
- `public/assets/` — 24 pre-generated files (21 SVG, 3 PNG). Asset manifest in DESIGN-SPEC.md § Asset Manifest

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- 24 pre-generated SVG/PNG assets in public/assets/ ready to integrate
- No existing code — greenfield project

### Established Patterns
- None yet — this phase establishes all patterns

### Integration Points
- Database connection string via DATABASE_URL environment variable
- SESSION_SECRET environment variable for cookie signing

</code_context>

<specifics>
## Specific Ideas

- Login page should feel like entering an arena — dark with the hero-login.png creating atmosphere
- The top bar should feel like a sports broadcast chyron — thin, data-dense, always present
- Typography must be exactly Barlow Condensed for headings/ranks and JetBrains Mono for data — these are non-negotiable per DESIGN-SPEC.md
- ESPN Bottom Line ticker aesthetic — not a corporate dashboard

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-04-01*
