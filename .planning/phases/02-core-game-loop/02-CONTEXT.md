# Phase 2: Core Game Loop - Context

**Gathered:** 2026-04-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Activity logging via floating action button, XP engine with correct point values, live leaderboard with ranked rows (rank, movement, name, tier badge, XP bar, daily change, streak), pinned position banner with gap-to-next-rank, time/team filtering, tier assignment, streak tracking (business days only), deal bell notifications, and conversion funnel visibility. This is the core product — the scoreboard that makes reps compete.

</domain>

<decisions>
## Implementation Decisions

### Scoreboard row structure
- Full-width 64px rows, alternating bg-surface / bg-primary per DESIGN-SPEC
- Each row: [Rank#] [Movement Arrow] [Name] [Tier Badge] [XP Bar + Number] [Today's Change] [Streak Icon]
- Avatar placeholder (colored circle with initials) — no image upload in demo
- Rank number: Barlow Condensed 700, 28px, left-aligned 48px column
- XP bar: 120px wide, accent-cyan fill on bg-primary track
- Today's change: accent-green if positive, monospaced, right-aligned
- Top 3 rows get subtle left-border glow in their tier color
- Rankings computed via SQL window function (RANK() OVER ORDER BY xp DESC) — never store rank

### Pinned position banner
- 96px tall expanded row pinned at top of scoreboard
- Shows: rank, XP total, gap to next rank ("2 calls to pass #6"), streak badge, daily challenge progress
- Gap-to-rank calculates the specific activity needed based on XP difference and lowest-XP activity type
- Background: subtle gradient from bg-surface to transparent

### Activity logging
- Fixed bottom-right floating action button: 56px cyan circle
- Opens slide-up panel covering bottom 40% of screen (NOT a modal — scoreboard visible above)
- Panel shows 5 quick-log buttons: Call (10 XP), Meeting (50 XP), Demo (75 XP), Proposal (100 XP), Deal (500 XP)
- Each button shows activity icon + XP value
- Deal option includes revenue amount input field
- After logging: panel stays open briefly, XP counter updates optimistically, success indicator shown
- Panel auto-closes after 1.5 seconds on successful log

### Leaderboard filtering
- Time period: pill toggles in top area — Today | This Week | This Month | All Time
- Team filter: pill toggles — All | Alpha | Beta | Gamma
- Filters are inline above scoreboard, not in dropdowns
- Default view: This Week + All teams

### Streak tracking
- Consecutive business days (Mon-Fri) of hitting 15+ calls
- Active streak: amber flame icon + day count (FlameIcon component from Phase 1)
- Broken streak: muted flame with strikethrough on count
- At-risk: pulsing amber flame if past 12:00 noon and no qualifying activity today
- Weekends don't break streaks — they're simply not counted

### Deal bell notifications
- Full-width notification bar slides down from below top bar
- Dark background with accent-green left border, BellIcon
- Content: "[Name] closed [Deal Name] — $XX,000 — [XP earned]"
- Auto-dismisses after 8 seconds
- Stacks if multiple fire (newest on top)
- Triggered by polling: check for new deal activities every 15 seconds, show bell for any in last 30s
- Uses bg-deal-bell.png as subtle background texture

### Conversion funnel
- Per-rep breakdown: calls → meetings → demos → deals with conversion ratios
- Displayed as a compact inline stat when viewing individual rep details
- Ratios calculated from All Time activity counts

### Polling & data freshness
- Leaderboard data refreshes every 15 seconds via client-side polling
- Optimistic updates when current user logs activity (immediate XP/rank change before server confirms)
- No WebSocket — polling + optimistic UI per PROJECT.md decision

### Claude's Discretion
- Exact polling implementation (SWR, React Query, or custom useEffect)
- Loading skeleton design for leaderboard
- Error handling for failed activity logs
- Exact animation timing for panel open/close
- How to calculate "gap to next" in the most user-friendly way

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Visual design
- `DESIGN-SPEC.md` — Scoreboard row structure (§ Key Components), position banner spec, FAB spec, deal bell spec, motion specs
- `DESIGN-SPEC.md` § Screens — Live Board (Rep View) screen description, Manager Command Center description

### Domain
- `BRIEF.md` — XP values, tier thresholds, streak rules, team structure, activity types

### Existing code
- `src/lib/constants.ts` — XP_VALUES, TIER_THRESHOLDS, ACTIVITY_STREAK_THRESHOLD already defined
- `src/lib/db/schema.ts` — activities, users, teams tables with current column structure
- `src/components/TierBadge.tsx` — Tier badge component ready to use
- `src/components/icons/` — All activity and UI icons ready (FlameIcon, BellIcon, PhoneIcon, etc.)
- `src/components/TopBar.tsx` — Top bar with tab navigation (needs streak badge wired in)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `TierBadge` component: pill-shaped badge with tier colors, accepts tier name prop
- 13 SVG icon components in `src/components/icons/`: FlameIcon, BellIcon, PhoneIcon, CalendarIcon, PresentationIcon, DocumentIcon, HandshakeIcon, LightningIcon, TargetIcon, TrophyIcon, ArrowUpIcon, ArrowDownIcon, UsersIcon
- `Logo` component: RANK+UP wordmark
- `TopBar` component: 48px navigation bar with 3 tabs, LIVE dot, logout — needs streak badge connected
- `XP_VALUES` constant: { call: 10, meeting: 50, demo: 75, proposal: 100, deal: 500 }
- `TIER_THRESHOLDS` constant: Bronze 0-4999, Silver 5000-14999, Gold 15000+
- `ACTIVITY_STREAK_THRESHOLD`: 15 calls minimum

### Established Patterns
- Server Actions for mutations (login/logout pattern in `src/lib/auth/actions.ts`)
- iron-session for user identification (`getSession()` helper)
- Drizzle ORM queries with `db.select().from(table)` pattern
- Tailwind v4 with @theme tokens in globals.css
- proxy.ts for route protection

### Integration Points
- `src/app/board/page.tsx` — Currently placeholder, will become the live scoreboard
- `src/app/board/layout.tsx` — Authenticated layout wrapping board content
- `src/lib/db/schema.ts` — activities table exists but may need schema additions (deal name, revenue amount)
- `TopBar` right section — needs streak badge and user XP display connected
- `src/lib/db/seed.ts` — Will need expansion for Phase 4 demo data (but NOT this phase)

</code_context>

<specifics>
## Specific Ideas

- The leaderboard should feel like watching a live sports broadcast — high information density but scannable because every row follows the same structure
- Gap-to-next-rank should be actionable: "2 calls to pass #6" not just "180 XP behind"
- The FAB should feel instant — log a call, see XP tick up, maybe rank shifts — all within 1-2 seconds
- Deal bell should feel like ringing the bell on a sales floor — everyone notices
- Rankings via SQL RANK() OVER, never stored — per architecture research recommendation

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-core-game-loop*
*Context gathered: 2026-04-01*
