# Phase 3: Competitions and Role Views - Context

**Gathered:** 2026-04-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Team battles (pod vs pod weekly XP competition with versus layout), SPIFF/challenge system (manager-created time-limited challenges with progress tracking), manager command center (team heatmap, coaching indicators, SPIFF creation), and admin configuration (cross-team comparison, point value config, tier threshold management). This phase adds competitive features and role-specific views on top of the existing scoreboard.

</domain>

<decisions>
## Implementation Decisions

### Team battle display
- Side-by-side versus layout borrowing from fighting game / sports broadcast aesthetic
- Two team names facing off with lightning bolt divider (LightningIcon component)
- Each side shows: team name, total XP for the battle period, progress bar racing toward opponent
- Per-member contribution list (compact: avatar initials + name + XP contributed)
- Countdown timer showing days/hours remaining
- Leading team's side has subtle neon glow in accent-cyan
- bg-battle.png as subtle background texture behind the versus section
- Accessed via BATTLES tab in TopBar (route: /board/battles)

### SPIFF/Challenge cards
- Stacked vertically below the team battle section on the Battles & Challenges page
- Each card shows: title, description, progress bar (user's progress vs goal), countdown timer, reward description
- Progress ring or bar using accent-cyan fill
- empty-challenges.svg for no active challenges state
- Active challenges visible to all reps, creation is manager-only

### Manager SPIFF creation
- "Create SPIFF" button visible only for manager role in the TopBar or command center
- Opens slide-out panel (consistent with FAB slide-up pattern — panel from right side)
- Form fields: title, description, goal type (dropdown: calls, meetings, demos, proposals, deals), goal value (number), start date, end date
- Server action for creation, optimistic addition to challenge list
- challenge_participants join table to track per-rep progress

### Manager command center
- Replaces the "Your Position Banner" with a horizontal team activity heatmap strip
- Each rep is a cell: green (#10B981) = active now (activity in last 30 min), amber (#F59E0B) = active today but idle now, red (#EF4444) = no activity today
- Clicking a heatmap cell scrolls to that rep in the scoreboard below
- Same scoreboard as rep view, but with additional conversion rate column
- Reps with high activity (15+ calls) but low conversion (< 5% calls-to-meetings) get amber coaching flag (TargetIcon)
- Manager sees SPIFF creation button
- Route: /board (same route, role-conditional rendering)

### Admin configuration panel
- Dedicated /admin route (already has layout.tsx with role check from Phase 1)
- Tabbed sections: "Teams" | "Configuration" | "Analytics"
- **Teams tab**: Cross-team comparison table — team name, total XP, avg XP per rep, active battle status
- **Configuration tab**: Editable point values for each activity type, editable tier thresholds (Bronze/Silver/Gold min XP), save button with server action
- **Analytics tab**: Engagement trends — daily active reps over time, total activities per day (simple bar/line charts), gamification impact (activity before vs after, if data exists)
- Use simple CSS-based charts (bar charts via div heights) or minimal Recharts — no heavy charting library for a few simple visualizations
- UsersIcon for team indicators

### Schema additions
- `challenge_participants` join table: challenge_id, user_id, progress (integer), joined_at
- `battles` table already exists — may need a `winner_team_id` column and `status` enum (active, completed)
- `settings` table for admin-configurable values: key (varchar), value (text), updated_at, updated_by

### Claude's Discretion
- Exact heatmap cell sizing and responsive behavior
- Chart library choice for admin analytics (CSS-only bars vs Recharts)
- Countdown timer implementation (client-side interval vs computed display)
- Exact slide-out panel animation timing
- How to structure the admin tabbed layout (URL-based tabs vs client state)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Visual design
- `DESIGN-SPEC.md` — Battle versus layout (§ Screens > Battles & Challenges), Manager Command Center screen, component specs for Deal Bell pattern (reuse for notifications)
- `DESIGN-SPEC.md` § Key Components — Scoreboard Row (manager view adds conversion column), Activity Log Button pattern
- `DESIGN-SPEC.md` § Asset Manifest — bg-battle.png, empty-challenges.svg, icon-trophy.svg, icon-target.svg, icon-users.svg, icon-lightning.svg

### Domain
- `BRIEF.md` — Team battle rules (weekly, pod vs pod, winning team bonus multiplier), SPIFF rules (time-limited, manager-created), manager needs (heatmap, coaching, conversion funnel), admin needs (cross-team, config, analytics)

### Existing code
- `src/lib/db/schema.ts` — battles and challenges tables (existing), need additions
- `src/app/board/BoardClient.tsx` — Pattern for client component with polling + optimistic updates
- `src/app/board/FilterBar.tsx` — Pill toggle pattern for tab-like selection
- `src/components/TopBar.tsx` — Tab navigation (BATTLES and CHALLENGES tabs already linked to /board/battles and /board/challenges)
- `src/app/board/ScoreboardRow.tsx` — Row component to extend with conversion column for manager view
- `src/app/admin/layout.tsx` — Admin layout with role check (existing from Phase 1)
- `src/app/admin/page.tsx` — Admin placeholder to replace

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `BoardClient` pattern: Server component fetches data → passes to client component with usePolling(15000) + useOptimistic. Reuse for battles page.
- `FilterBar` pill toggle pattern: Can be adapted for admin tab navigation
- `ScoreboardRow`: Can accept additional columns (conversion rate) via optional props
- `TopBar`: Already has BATTLES (/board/battles) and CHALLENGES (/board/challenges) tab links wired
- `TierBadge`, all 13 icon components, `Logo` — all reusable
- `DealBellStack` pattern: Polling + auto-dismiss — reuse pattern for battle/SPIFF notifications
- `ActivityFAB` slide-up panel: Reference for slide-out panel interaction pattern

### Established Patterns
- Server Actions for mutations (logActivity in activities.ts) — reuse for SPIFF creation, admin config saves
- Drizzle `sql` template tag for complex queries — reuse for battle XP aggregation, heatmap queries
- URL searchParams for filtering (FilterBar pattern) — reuse for admin tabs
- iron-session getSession() with role check — already in layouts

### Integration Points
- `/board/battles` — New page under board layout (TopBar tab already links here)
- `/board/challenges` — New page or combine with battles page
- `/board` page.tsx — Needs role-conditional rendering for manager heatmap banner
- `/admin` page.tsx — Replace placeholder with configuration panel
- `src/lib/db/schema.ts` — Add challenge_participants, settings tables; extend battles
- `src/lib/queries/` — Add battles.ts, challenges.ts, heatmap.ts query modules
- `src/lib/actions/` — Add challenges.ts (SPIFF creation), admin.ts (config saves)

</code_context>

<specifics>
## Specific Ideas

- The versus layout should feel like a fighting game matchup screen — two opposing forces, electric energy at the collision point
- Heatmap strip should answer the #1 manager question at a glance: "Who's working right now?"
- Coaching flags should be subtle (amber indicator) not alarming — this is motivation, not surveillance
- Admin panel is secondary to the scoreboard — keep it functional but don't over-invest in visual polish
- SPIFF countdown timers create real urgency — the time pressure is the feature

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-competitions-and-role-views*
*Context gathered: 2026-04-01*
