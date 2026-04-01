# Requirements: RankUp

**Defined:** 2026-04-01
**Core Value:** Sales reps can see their live rank and know exactly what activity it takes to move up

## v1 Requirements

### Authentication

- [ ] **AUTH-01**: User can log in with email and password (3 demo accounts: rep, manager, admin)
- [ ] **AUTH-02**: User session persists across browser refresh via secure cookies
- [ ] **AUTH-03**: User can log out from any page
- [ ] **AUTH-04**: Role-based access control routes users to appropriate views (rep, manager, admin)

### Leaderboard

- [ ] **LEAD-01**: Rep sees live ranked list of all reps with rank number, name, tier badge, XP, daily change, and streak
- [ ] **LEAD-02**: Rep sees their own position pinned at top with gap-to-next-rank ("2 calls to pass #6")
- [ ] **LEAD-03**: Leaderboard supports time period filtering (Today, This Week, This Month, All Time)
- [ ] **LEAD-04**: Leaderboard supports team filtering (All, Alpha, Beta, Gamma)
- [ ] **LEAD-05**: Top 3 rows have visual emphasis (left-border glow in tier color)
- [ ] **LEAD-06**: Rank movement arrows show position changes (up/down/stable)

### Activity & XP

- [ ] **ACTV-01**: Rep can log activities via floating action button (Call, Meeting, Demo, Proposal, Deal)
- [ ] **ACTV-02**: Each activity type awards correct XP (Call:10, Meeting:50, Demo:75, Proposal:100, Deal:500)
- [ ] **ACTV-03**: XP is calculated and displayed in real-time after activity is logged
- [ ] **ACTV-04**: Deal closing includes revenue amount for bonus XP calculation
- [ ] **ACTV-05**: Activity log panel shows XP values for each action type

### Tiers

- [ ] **TIER-01**: Reps are assigned tiers based on XP (Bronze: 0-5000, Silver: 5000-15000, Gold: 15000+)
- [ ] **TIER-02**: Tier badges display on scoreboard rows using pre-generated SVG assets
- [ ] **TIER-03**: Tier promotion is visible and celebrated when thresholds are crossed

### Streaks

- [ ] **STRK-01**: System tracks consecutive days of hitting minimum activity threshold (15+ calls)
- [ ] **STRK-02**: Active streak displays flame icon with day count on scoreboard
- [ ] **STRK-03**: Broken streak displays muted/strikethrough indicator
- [ ] **STRK-04**: Streak at risk (end of day, no qualifying activity) shows pulsing amber indicator

### Team Battles

- [ ] **BTTL-01**: Weekly team battles show two teams in versus layout with XP totals
- [ ] **BTTL-02**: Battle displays countdown timer for time remaining
- [ ] **BTTL-03**: Battle shows per-member XP contributions
- [ ] **BTTL-04**: Leading team has visual emphasis (glow effect)

### Challenges/SPIFFs

- [ ] **SPFF-01**: Active challenges display with title, description, progress bar, and countdown timer
- [ ] **SPFF-02**: Manager can create time-limited SPIFF challenges with goals and rewards
- [ ] **SPFF-03**: Rep sees their progress vs challenge goal

### Deal Bell

- [ ] **BELL-01**: When a deal closes, a notification bar slides down visible to all users
- [ ] **BELL-02**: Deal bell shows rep name, deal name, amount, and XP earned
- [ ] **BELL-03**: Deal bell auto-dismisses after 8 seconds, stacks if multiple fire

### Manager View

- [ ] **MGMT-01**: Manager sees team activity heatmap strip (green=active, amber=idle, red=no activity)
- [ ] **MGMT-02**: Manager sees scoreboard with additional conversion rate column
- [ ] **MGMT-03**: Reps with high activity but low conversion are flagged (coaching opportunity)
- [ ] **MGMT-04**: Manager can create SPIFFs from the command center

### Admin View

- [ ] **ADMN-01**: Admin can view cross-team performance comparison
- [ ] **ADMN-02**: Admin can configure point values for activity types
- [ ] **ADMN-03**: Admin can manage tier thresholds and promotion rules
- [ ] **ADMN-04**: Admin sees engagement analytics (activity trends, gamification impact)

### Conversion Funnel

- [ ] **FUNL-01**: Per-rep conversion visibility: calls -> meetings -> demos -> deals with ratios

### Layout & Design

- [ ] **DSGN-01**: Dark scoreboard theme (bg: #0A0E17) with neon cyan accents (#06D6F2)
- [ ] **DSGN-02**: Full-width stacked ticker layout with NO sidebar navigation
- [ ] **DSGN-03**: Thin top bar (48px) with tab navigation (Live Board, Battles, Challenges)
- [ ] **DSGN-04**: Typography: Barlow Condensed for headings/ranks, JetBrains Mono for data
- [ ] **DSGN-05**: All 24 pre-generated SVG/PNG assets used as documented in DESIGN-SPEC.md
- [ ] **DSGN-06**: Responsive design for desktop and tablet viewports

### Animations

- [ ] **ANIM-01**: Rank shift animation -- rows physically slide to new position (600ms ease-in-out with cyan glow)
- [ ] **ANIM-02**: XP counter tick -- numbers count up from old to new value (400ms) with floating "+XP" indicator
- [ ] **ANIM-03**: Deal bell drop -- notification slides down with slight bounce

### Demo Data

- [ ] **SEED-01**: 15 sales reps across 3 pods (Alpha, Beta, Gamma -- 5 each) for "Velocity SaaS"
- [ ] **SEED-02**: 2 months of historical activity data with realistic distribution
- [ ] **SEED-03**: Specific scenario: 1 rep on 22-day streak (Gold), 1 rep who broke streak yesterday
- [ ] **SEED-04**: Active team battle: Alpha vs Beta (close race)
- [ ] **SEED-05**: Active SPIFF: "March Madness -- most meetings booked this week"
- [ ] **SEED-06**: Tier distribution: 2 Gold, 5 Silver, 8 Bronze
- [ ] **SEED-07**: Current day has live morning activity from some reps

## v2 Requirements

### Real-time

- **RT-01**: WebSocket-based live updates instead of polling
- **RT-02**: Real-time deal bell push notifications

### Notifications

- **NOTF-01**: Email notifications for milestone achievements
- **NOTF-02**: Configurable notification preferences

### Integrations

- **INTG-01**: Salesforce activity sync
- **INTG-02**: HubSpot activity sync
- **INTG-03**: Slack notifications for deal closings

## Out of Scope

| Feature | Reason |
|---------|--------|
| CRM integration | Demo app -- standalone, no external API dependencies |
| OAuth/SSO | Email/password sufficient for 3 demo accounts |
| Mobile native app | Responsive web covers demo needs |
| Real-time WebSockets | Polling + optimistic UI sufficient for demo |
| Email notifications | In-app only for demo |
| Payment/billing | No commercial features in demo |
| Multi-tenancy | Single demo org ("Velocity SaaS") |
| TV/big-screen display mode | Desktop browser is primary demo surface |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Pending |
| DSGN-01 | Phase 1 | Pending |
| DSGN-02 | Phase 1 | Pending |
| DSGN-03 | Phase 1 | Pending |
| DSGN-04 | Phase 1 | Pending |
| DSGN-05 | Phase 1 | Pending |
| DSGN-06 | Phase 1 | Pending |
| LEAD-01 | Phase 2 | Pending |
| LEAD-02 | Phase 2 | Pending |
| LEAD-03 | Phase 2 | Pending |
| LEAD-04 | Phase 2 | Pending |
| LEAD-05 | Phase 2 | Pending |
| LEAD-06 | Phase 2 | Pending |
| ACTV-01 | Phase 2 | Pending |
| ACTV-02 | Phase 2 | Pending |
| ACTV-03 | Phase 2 | Pending |
| ACTV-04 | Phase 2 | Pending |
| ACTV-05 | Phase 2 | Pending |
| TIER-01 | Phase 2 | Pending |
| TIER-02 | Phase 2 | Pending |
| TIER-03 | Phase 2 | Pending |
| STRK-01 | Phase 2 | Pending |
| STRK-02 | Phase 2 | Pending |
| STRK-03 | Phase 2 | Pending |
| STRK-04 | Phase 2 | Pending |
| BELL-01 | Phase 2 | Pending |
| BELL-02 | Phase 2 | Pending |
| BELL-03 | Phase 2 | Pending |
| FUNL-01 | Phase 2 | Pending |
| BTTL-01 | Phase 3 | Pending |
| BTTL-02 | Phase 3 | Pending |
| BTTL-03 | Phase 3 | Pending |
| BTTL-04 | Phase 3 | Pending |
| SPFF-01 | Phase 3 | Pending |
| SPFF-02 | Phase 3 | Pending |
| SPFF-03 | Phase 3 | Pending |
| MGMT-01 | Phase 3 | Pending |
| MGMT-02 | Phase 3 | Pending |
| MGMT-03 | Phase 3 | Pending |
| MGMT-04 | Phase 3 | Pending |
| ADMN-01 | Phase 3 | Pending |
| ADMN-02 | Phase 3 | Pending |
| ADMN-03 | Phase 3 | Pending |
| ADMN-04 | Phase 3 | Pending |
| SEED-01 | Phase 4 | Pending |
| SEED-02 | Phase 4 | Pending |
| SEED-03 | Phase 4 | Pending |
| SEED-04 | Phase 4 | Pending |
| SEED-05 | Phase 4 | Pending |
| SEED-06 | Phase 4 | Pending |
| SEED-07 | Phase 4 | Pending |
| ANIM-01 | Phase 4 | Pending |
| ANIM-02 | Phase 4 | Pending |
| ANIM-03 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 57 total
- Mapped to phases: 57
- Unmapped: 0

---
*Requirements defined: 2026-04-01*
*Last updated: 2026-04-01 after roadmap creation*
