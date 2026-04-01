# Feature Research

**Domain:** Sales performance gamification
**Researched:** 2026-04-01
**Confidence:** MEDIUM (based on training data knowledge of Ambition, Spinify, SalesScreen, Hoopla, LevelEleven; no live web verification available)

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Live leaderboard with rank ordering | THE core feature of any gamification platform. Every competitor has this. Without it, you have a dashboard, not a gamification tool. | MEDIUM | Must support multiple time windows (today, week, month, all-time). Real-time feel is critical even if not true WebSocket. |
| XP/points system with configurable values | Managers need to weight activities differently per team. Ambition, Spinify, SalesScreen all let admins configure point values per activity type. | LOW | Map activity types to point values. Store in a config table so managers can adjust. |
| Activity logging | Reps need to record calls, meetings, demos, proposals, deals. This is the data input that drives everything else. | LOW | Quick-entry UX is critical. If logging feels like CRM data entry, adoption dies. |
| Role-based views (rep, manager, admin) | Every sales tool separates what a rep sees from what a manager sees. Reps see their rank; managers see team health; admins configure the system. | MEDIUM | Three distinct view modes sharing the same core scoreboard. Auth + role-based routing. |
| Team/pod grouping | Sales orgs are organized into pods/teams. Leaderboards without team context are useless for managers with 50+ reps. | LOW | Filter leaderboard by team. Show team-level aggregates. |
| Activity streak tracking | Streaks are a proven engagement mechanic (Duolingo, Snapchat). In sales, consecutive days of hitting activity minimums prevent coasting. Every modern gamification tool includes them. | MEDIUM | Track daily activity against threshold. Consecutive day counter. Visual badge. Streak-at-risk warnings. |
| Tier/level system | Tiered competition (Bronze/Silver/Gold) solves the "only top 3 matter" problem. Reps compete within their tier, so mid-performers stay engaged. Ambition and SalesScreen both use tiers. | MEDIUM | XP thresholds per tier. Monthly promotion cycles. Tier badges and visual differentiation on the board. |
| Deal close notifications | The "bell ringing" moment when someone closes a deal. This is the single most emotionally resonant feature in sales gamification. Hoopla built their entire brand around TV displays showing deal closes. | LOW | Broadcast notification to all users. Animation/sound. Show deal value and XP earned. |
| Time period filtering | Users need to see performance across different windows: today (urgency), this week (sprint), this month (trend), all-time (career). | LOW | Query-level filtering on activity timestamps. Toggle UI in the leaderboard header. |
| Demo/seed data | For this specific project: realistic seeded data is table stakes for a demo app. Without it, the scoreboard is empty and the product is meaningless. | MEDIUM | 15 reps, 3 teams, 2 months of history, active streaks, ongoing battles and SPIFFs. Requires careful seed script. |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Scoreboard-first UI (not dashboard-first) | Most competitors (Ambition, Spinify) default to a dashboard with widgets/cards. RankUp's ESPN-style ranked list as THE primary view is genuinely different. The rank IS the app. | MEDIUM | This is a design differentiator, not a feature differentiator. The full-width stacked ticker layout with pinned personal banner is the key UX innovation. |
| "Gap to next rank" visibility | Showing "2 calls to pass #6" is more motivating than showing raw XP. Reps think in terms of actions, not points. Most competitors show rank + XP but not the actionable gap. | LOW | Calculate XP difference to next rank, divide by lowest-value activity to show concrete action count. |
| Team vs team battles with countdown | Pod-vs-pod competition with visible countdown timers creates urgency beyond individual rank. Ambition has team goals but not the head-to-head "versus" framing that RankUp uses. | HIGH | Requires: battle creation, team XP aggregation for battle period, countdown timer, winner determination, bonus multiplier for winners. |
| SPIFF/challenge system with manager creation | Time-bound challenges with specific goals. Managers can create "Book 15 meetings this week" with a reward. The countdown timer and progress bar create urgency. | HIGH | Full CRUD for challenges. Progress tracking per rep. Countdown timers. Winner determination. Most complex feature after core leaderboard. |
| Manager heatmap strip | At-a-glance "who's working right now" as a color-coded row. Green = active, amber = idle, red = no activity. This answers the manager's #1 question without scrolling the full board. | MEDIUM | Requires tracking last-activity timestamp per rep and rendering a compact visual strip. |
| Conversion funnel per rep | Calls-to-meetings ratio, meetings-to-demos, etc. Identifies coaching opportunities: high activity but low conversion means the rep needs help, not more calls. | MEDIUM | Ratio calculations across activity types. Visual funnel or ratio column on manager view. Amber flagging for low conversion. |
| Animated rank shifts | When rank changes, rows physically slide to new positions. This is the "whoa" moment. Most competitor leaderboards are static page refreshes. ESPN-style live movement is the visual signature. | MEDIUM | CSS/Framer Motion animations for list reordering. 600ms transitions. Glow trail on moving rows. Requires optimistic UI updates. |
| XP counter tick-up animation | Numbers count up from old to new value instead of jumping. "+50 XP" floats up and fades. Makes every logged activity feel rewarding. | LOW | Simple number animation with requestAnimationFrame or a counter library. Floating text CSS animation. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| CRM integration (Salesforce, HubSpot) | "Auto-sync activities so reps don't double-log" | Massive complexity (OAuth, webhook handling, field mapping, sync conflicts). For a demo app, it's months of work that doesn't prove the gamification concept. | Manual activity logging with quick-entry UX. Note: production version would need this, but demo doesn't. |
| Real-time WebSocket updates | "Leaderboard should update instantly for all users" | WebSocket infrastructure adds significant complexity (connection management, reconnection, state sync). For a demo with simulated data, it's over-engineering. | Polling every 30 seconds + optimistic UI on local actions. Feels live without the infrastructure cost. |
| Granular permissions system | "Different managers should see different teams, admins should have fine-grained role permissions" | RBAC systems are a rabbit hole. Three roles (rep, manager, admin) cover 90% of use cases. Complex permissions add UI/UX burden. | Three fixed roles with clear boundaries. Manager sees their pod; admin sees everything. |
| Detailed analytics/reporting | "Export CSVs, custom date ranges, pivot tables, trend charts" | This is a BI tool, not a gamification platform. Building reporting pulls focus from the scoreboard experience. Managers already have Salesforce reports. | Simple trend lines on the manager view. Activity counts by period. No export, no custom reporting. |
| Public TV display mode | "Put the leaderboard on a sales floor TV" | Hoopla owns this space. Building a separate TV-optimized layout with auto-rotation and large fonts is a full feature. Not needed for a demo. | The leaderboard already works on a big screen. Full-width layout is TV-friendly by default. |
| Badges/achievements system | "Award badges for milestones: first deal, 100 calls, etc." | Badges are a second gamification system on top of XP/tiers/streaks. They add schema complexity and UI surface area without adding competitive urgency. Badges are static trophies; ranks are live competition. | Tiers (Bronze/Silver/Gold) serve as the achievement progression. Streaks serve as the consistency achievement. Keep it simple. |
| Leaderboard opt-out | "Some reps feel anxious about public ranking" | Opt-out defeats the entire purpose. If half the team opts out, the leaderboard is meaningless. The brief explicitly says visibility drives performance. | Tiered competition addresses this: you're not compared to top closers, you're compared to your tier. Everyone has a winnable competition. |
| Notification preferences / email digests | "Let users configure when and how they get notified" | Notification preference UIs are complex and distract from the in-app experience. The product is meant to be open all day like a stock ticker. | In-app notifications only (deal bells, rank changes). No email, no push, no preferences. Keep attention in the app. |

## Feature Dependencies

```
[Authentication & Roles]
    |
    +--requires--> [User/Team Schema]
    |                  |
    |                  +--requires--> [Activity Logging]
    |                  |                  |
    |                  |                  +--enables--> [XP Calculation]
    |                  |                                   |
    |                  |                                   +--enables--> [Live Leaderboard]
    |                  |                                   |                 |
    |                  |                                   |                 +--enhances--> [Rank Shift Animations]
    |                  |                                   |                 +--enhances--> [Gap-to-Next Visibility]
    |                  |                                   |
    |                  |                                   +--enables--> [Tier System]
    |                  |                                   +--enables--> [Streak Tracking]
    |                  |                                   +--enables--> [Team Battles]
    |                  |                                   +--enables--> [SPIFFs/Challenges]
    |                  |
    |                  +--enables--> [Manager Heatmap]
    |                  +--enables--> [Conversion Funnel]
    |
    +--enables--> [Deal Bell Notifications]

[Demo Seed Data] --requires--> [All Schema Tables]
```

### Dependency Notes

- **Leaderboard requires XP Calculation:** Can't rank without points. XP system must be built first.
- **XP Calculation requires Activity Logging:** Points come from logged activities. Activity logging is the data input layer.
- **Team Battles require XP + Team Schema:** Battles aggregate team XP over a time period. Both must exist.
- **SPIFFs require Activity Logging + Time-based queries:** Challenges track specific activity counts within a date range.
- **Tier System requires XP totals:** Tier placement is based on cumulative XP.
- **Streak Tracking requires Activity Logging + daily aggregation:** Must count activities per day per rep.
- **Manager Heatmap requires Activity timestamps:** Shows recency of last activity per rep.
- **Conversion Funnel requires Activity type differentiation:** Must distinguish calls from meetings from demos.
- **Demo Seed Data must be built LAST:** It depends on all schema tables existing.
- **Animations enhance but don't block:** Rank animations, XP ticks, and deal bell effects can be layered on after core functionality works.

## MVP Definition

### Launch With (v1)

Minimum viable product -- what's needed to validate the gamification concept.

- [ ] Authentication with three demo accounts (rep, manager, admin)
- [ ] User and team schema (15 reps, 3 pods)
- [ ] Activity logging with XP calculation (5 activity types with configurable values)
- [ ] Live leaderboard with rank, XP, tier badge, today's change
- [ ] Time period filtering (today, week, month, all-time)
- [ ] Team filtering
- [ ] Your Position Banner (pinned, shows gap to next rank)
- [ ] Tier system (Bronze, Silver, Gold) with visual badges
- [ ] Activity streak tracking with flame badge
- [ ] Deal bell notification (team-wide)
- [ ] Realistic seed data (2 months of history, active scenario)

### Add After Validation (v1.x)

Features to add once core scoreboard is working and feels alive.

- [ ] Team vs team battles with countdown timer and versus layout
- [ ] SPIFF/challenge system with manager creation
- [ ] Manager heatmap strip (who's active now)
- [ ] Conversion funnel column on manager view
- [ ] Rank shift animations (row sliding)
- [ ] XP counter tick-up animation
- [ ] Admin configuration panel (point values, tier thresholds)

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] CRM auto-sync (Salesforce, HubSpot) -- only if going to production
- [ ] Real-time WebSocket updates -- only if polling feels too slow
- [ ] TV display mode -- only if sales floor use case is validated
- [ ] Achievement badges -- only if tier/streak system isn't engaging enough

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Live leaderboard with rankings | HIGH | MEDIUM | P1 |
| Activity logging with XP | HIGH | LOW | P1 |
| Authentication & roles | HIGH | MEDIUM | P1 |
| Your Position Banner + gap-to-next | HIGH | LOW | P1 |
| Tier system (Bronze/Silver/Gold) | HIGH | MEDIUM | P1 |
| Activity streaks | HIGH | MEDIUM | P1 |
| Deal bell notifications | HIGH | LOW | P1 |
| Time period & team filtering | MEDIUM | LOW | P1 |
| Seed data (demo scenario) | HIGH | MEDIUM | P1 |
| Team battles | HIGH | HIGH | P2 |
| SPIFF/challenge system | HIGH | HIGH | P2 |
| Manager heatmap | MEDIUM | MEDIUM | P2 |
| Rank shift animations | MEDIUM | MEDIUM | P2 |
| XP counter animations | MEDIUM | LOW | P2 |
| Conversion funnel | MEDIUM | MEDIUM | P2 |
| Admin config panel | LOW | MEDIUM | P2 |
| CRM integration | HIGH (prod) | HIGH | P3 |
| WebSocket real-time | LOW | HIGH | P3 |
| TV display mode | LOW | MEDIUM | P3 |
| Badge/achievement system | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Must have for launch -- the scoreboard must work with data
- P2: Should have, add when core is solid -- battles, challenges, polish
- P3: Nice to have, future consideration -- production features not needed for demo

## Competitor Feature Analysis

| Feature | Ambition | Spinify | SalesScreen | Hoopla | RankUp Approach |
|---------|----------|---------|-------------|--------|-----------------|
| Leaderboard | Dashboard widget with leaderboard card | Standalone leaderboard with themes | TV-optimized board with celebrations | TV display focused | Scoreboard IS the app. Full-width, not a widget. |
| Points/XP | "Ambition Score" composite metric | Points per activity, customizable | Points + levels | Simple points | XP per activity type, configurable by admin |
| Tiers/Levels | Coaching tiers based on composite score | Levels with progression | Levels with badges | N/A | Bronze/Silver/Gold with monthly promotion. Compete within tier. |
| Streaks | N/A (not a focus) | Streak tracking | Streak badges | N/A | Core feature: consecutive days of minimum activity |
| Team competitions | Team goals | Team vs team battles | Team challenges | Team leaderboards | Pod vs pod battles with versus layout and countdown |
| Challenges/SPIFFs | Manager-created goals | Competitions with templates | Challenges with rewards | Competitions | SPIFF system with countdown timer, progress bar |
| Notifications | In-app + Slack | TV celebrations + Slack | TV + mobile push | TV celebrations + chime | Deal bell: full-width notification bar, in-app only |
| Manager tools | Coaching scorecards, 1:1 templates | Activity dashboards | Performance analytics | Reporting | Heatmap strip + coaching indicators (high activity/low conversion) |
| CRM integration | Deep (Salesforce, HubSpot, etc.) | Deep (Salesforce, HubSpot, etc.) | Deep (multiple CRMs) | Salesforce, Slack | None (demo app). Manual logging with fast UX. |
| Visual identity | Enterprise SaaS (clean, muted) | Colorful, themed (space, sports) | Modern, celebration-focused | TV display focused | Dark + neon, ESPN scoreboard, high energy |

**Key competitive insight:** Existing tools treat the leaderboard as one widget among many in a dashboard. RankUp's differentiator is making the ranked list the ENTIRE interface. This is the ESPN Bottom Line philosophy -- the score IS the show. No KPI cards, no widget grid, no sidebar. Just rank, movement, and urgency.

## Sources

- Training data knowledge of Ambition (ambition.com), Spinify (spinify.com), SalesScreen (salesscreen.com), Hoopla (hoopla.net) product features and positioning
- Brief-specified domain research quotes on sales gamification effectiveness
- General knowledge of gamification mechanics (streaks from Duolingo/Snapchat patterns, tier competition from competitive gaming ELO systems, SPIFF mechanics from sales operations practice)

**Confidence note:** Web search was unavailable during this research session. All competitor feature comparisons are based on training data (knowledge cutoff May 2025). Specific feature availability may have changed. The core patterns (leaderboards, points, streaks, team competition, manager tools) are well-established in this space and unlikely to have shifted significantly.

---
*Feature research for: Sales performance gamification*
*Researched: 2026-04-01*
