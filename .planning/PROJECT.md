# RankUp — Sales Performance Gamification Platform

## What This Is

A live sales performance gamification platform that turns daily sales activity into a competitive, ESPN-style scoreboard experience. Sales reps see their rank, XP, streaks, and team battles in real-time — creating the energy of a competitive sales floor for remote and hybrid teams. Built for B2B SaaS sales organizations using Next.js, Neon Postgres, and Drizzle ORM.

## Core Value

Sales reps can see their live rank and know exactly what activity it takes to move up — creating real-time competitive urgency that drives consistent daily performance.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Role-based authentication (rep, manager, admin) with demo accounts
- [ ] Live leaderboard with rank, XP, tier badges, streaks, and movement indicators
- [ ] Activity logging (calls, meetings, demos, proposals, deals) with XP rewards
- [ ] Tiered competition system (Bronze, Silver, Gold) with monthly promotions
- [ ] Activity streak tracking with consecutive day motivation
- [ ] Team battles (pod vs pod) with weekly XP competition
- [ ] SPIFFs/challenges with countdown timers and progress tracking
- [ ] Deal bell notifications visible to the whole team
- [ ] Manager command center with team heatmap and coaching indicators
- [ ] Admin cross-team analytics and configuration
- [ ] Conversion funnel visibility (calls → meetings → demos → deals per rep)
- [ ] Realistic demo data: 15 reps, 3 pods, 2 months of activity history

### Out of Scope

- CRM integration (Salesforce, HubSpot) — this is a standalone demo, not a production integration
- Real email notifications — demo app uses in-app only
- OAuth/SSO — email/password sufficient for demo
- Mobile native app — responsive web only
- Real-time WebSocket updates — simulated live feel with polling/optimistic updates
- Payment processing — no billing in demo

## Context

- Target demo org: "Velocity SaaS" with 3 sales pods (Alpha, Beta, Gamma, 5 reps each)
- Visual identity: LIVE SPORTS SCOREBOARD — dark background (#0A0E17), neon cyan accents (#06D6F2), high-energy, ESPN-style
- Typography: Barlow Condensed for headings/ranks, JetBrains Mono for data
- Layout: Full-width stacked ticker, NO sidebar, thin top bar navigation
- 24 pre-generated assets in public/assets/ (SVG icons, tier badges, decorative PNGs)
- XP values: Call (10), Meeting (50), Demo (75), Proposal (100), Deal (500 + revenue bonus)
- Tiers: Bronze (0-5000 XP), Silver (5000-15000 XP), Gold (15000+ XP)
- Demo accounts: rep@rankup.app, manager@rankup.app, admin@rankup.app (all password: demo1234)
- Design spec defines specific animations: rank shift (600ms), XP counter tick (400ms), deal bell drop with bounce

## Constraints

- **Tech Stack**: Next.js App Router + Neon Postgres + Drizzle ORM — specified in brief
- **Database**: Must be Neon Postgres, NOT SQLite
- **Deployment**: Vercel with custom domain rankup.demos.fonnit.com
- **Design**: Must follow DESIGN-SPEC.md exactly — scoreboard-first, no sidebar, dark theme with neon accents
- **Assets**: Must use all 24 pre-generated assets in public/assets/
- **Demo Data**: Seeded and realistic with specific scenario (streaks, battles, SPIFFs active)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| No WebSocket — use polling + optimistic UI | Demo app doesn't need true real-time; simulated feel sufficient | — Pending |
| Cookie-based sessions, not JWT | Simpler for demo, Next.js server components friendly | — Pending |
| Single database schema, no multi-tenancy | Demo for one org ("Velocity SaaS"), no need for tenant isolation | — Pending |

---
*Last updated: 2026-04-01 after initialization*
