# Roadmap: RankUp

## Overview

RankUp delivers a live sales gamification scoreboard in four phases: foundation (schema, auth, design system), core game loop (activity logging, XP, leaderboard, streaks, deal bell), competitions and role views (battles, SPIFFs, manager/admin panels), and demo data with animation polish. Each phase delivers a coherent, verifiable capability that builds on the previous.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [ ] **Phase 1: Foundation** - Database schema, authentication, app layout shell, and dark scoreboard design system
- [ ] **Phase 2: Core Game Loop** - Activity logging, XP engine, live leaderboard, tiers, streaks, deal bell, and conversion funnel
- [ ] **Phase 3: Competitions and Role Views** - Team battles, SPIFFs, manager command center, and admin configuration
- [ ] **Phase 4: Demo Data and Polish** - Narrative-driven seed data, rank/XP/bell animations, and responsive polish

## Phase Details

### Phase 1: Foundation
**Goal**: Users can authenticate with role-based accounts and see the dark scoreboard layout shell with proper design system
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, DSGN-01, DSGN-02, DSGN-03, DSGN-04, DSGN-05, DSGN-06
**Success Criteria** (what must be TRUE):
  1. User can log in with any of the 3 demo accounts (rep, manager, admin) and is routed to the appropriate view
  2. User session survives browser refresh and user can log out from any page
  3. App displays dark scoreboard theme with neon cyan accents, full-width layout with no sidebar, thin top bar navigation, and correct typography
  4. All 24 pre-generated SVG/PNG assets are integrated and rendering correctly
  5. Layout is responsive across desktop and tablet viewports
**Plans**: TBD

Plans:
- [ ] 01-01: TBD
- [ ] 01-02: TBD

### Phase 2: Core Game Loop
**Goal**: Reps can log activities, earn XP, see their live rank on the leaderboard, track streaks, and the whole team sees deal bell notifications
**Depends on**: Phase 1
**Requirements**: LEAD-01, LEAD-02, LEAD-03, LEAD-04, LEAD-05, LEAD-06, ACTV-01, ACTV-02, ACTV-03, ACTV-04, ACTV-05, TIER-01, TIER-02, TIER-03, STRK-01, STRK-02, STRK-03, STRK-04, BELL-01, BELL-02, BELL-03, FUNL-01
**Success Criteria** (what must be TRUE):
  1. Rep can log any activity type (call, meeting, demo, proposal, deal) via floating action button and sees XP awarded immediately
  2. Leaderboard displays all reps ranked by XP with tier badges, streak indicators, and movement arrows, filterable by time period and team
  3. Rep sees their pinned position with concrete gap-to-next-rank ("2 calls to pass #6") and top 3 rows have visual emphasis
  4. Streak tracking shows flame icon with day count for active streaks, muted indicator for broken streaks, and pulsing amber for at-risk streaks
  5. When a deal closes, a notification bar slides down showing rep name, deal details, and XP earned, visible to all users
**Plans**: TBD

Plans:
- [ ] 02-01: TBD
- [ ] 02-02: TBD
- [ ] 02-03: TBD

### Phase 3: Competitions and Role Views
**Goal**: Teams compete in weekly battles, managers run SPIFFs and monitor coaching opportunities, admins configure the system
**Depends on**: Phase 2
**Requirements**: BTTL-01, BTTL-02, BTTL-03, BTTL-04, SPFF-01, SPFF-02, SPFF-03, MGMT-01, MGMT-02, MGMT-03, MGMT-04, ADMN-01, ADMN-02, ADMN-03, ADMN-04
**Success Criteria** (what must be TRUE):
  1. Weekly team battle displays two teams in versus layout with XP totals, per-member contributions, countdown timer, and leading team glow
  2. Manager can create a time-limited SPIFF challenge and reps see it with title, progress bar, and countdown timer
  3. Manager sees team activity heatmap (green/amber/red), scoreboard with conversion rates, and coaching flags for high-activity low-conversion reps
  4. Admin can view cross-team comparison, configure point values for activity types, manage tier thresholds, and see engagement analytics
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD
- [ ] 03-03: TBD

### Phase 4: Demo Data and Polish
**Goal**: The app tells a compelling demo story with realistic data and feels alive with animations
**Depends on**: Phase 3
**Requirements**: SEED-01, SEED-02, SEED-03, SEED-04, SEED-05, SEED-06, SEED-07, ANIM-01, ANIM-02, ANIM-03
**Success Criteria** (what must be TRUE):
  1. Seed data produces 15 reps across 3 pods with 2 months of history, correct tier distribution (2 Gold, 5 Silver, 8 Bronze), specific streak scenarios, active battle, and active SPIFF
  2. Leaderboard rows physically slide to new positions with 600ms animation and cyan glow when rank changes
  3. XP counter ticks up from old to new value with 400ms animation and floating "+XP" indicator appears on activity log
  4. Deal bell notification drops in with bounce animation and auto-dismisses after 8 seconds
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/2 | Not started | - |
| 2. Core Game Loop | 0/3 | Not started | - |
| 3. Competitions and Role Views | 0/3 | Not started | - |
| 4. Demo Data and Polish | 0/2 | Not started | - |
