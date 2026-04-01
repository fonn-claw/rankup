# RankUp — Sales Performance Gamification Platform

## The Problem
Sales teams live on numbers — calls made, meetings booked, deals closed, revenue generated. But the tools they use (Salesforce, HubSpot, spreadsheets) present this data in static tables and reports that nobody looks at until the quarterly review. By then it's too late.

The best sales floors have a culture of competition — ringing a bell when a deal closes, daily standups where top performers are called out, weekly SPIFFs that create urgency. But remote and hybrid teams lose all of that. The energy disappears into Slack messages nobody reads.

From the research: "Sales reps motivated by money, not always other incentives — need visibility + competition + fairness." And: "Sales reps with leaderboards hit 23% more quota."

What doesn't work: "Mandatory CRM logging that feels like surveillance." "Leaderboards that only reward the top 3 — everyone else stops trying." "Monthly contests that are decided by week 2."

What works: real-time visibility into activity AND results, tiered competition (compete against your own level, not just the top closers), streak rewards for consistent daily activity, team-vs-team battles, and instant recognition when something happens.

## The Domain
B2B sales team performance — specifically the gamification layer that sits on top of existing tools. This isn't a CRM. It's the motivation and visibility engine.

A sales rep's day with RankUp:
1. Open the app in the morning — see their rank, daily streak, today's challenges
2. Log a call → XP earned, activity counter ticks up, position shifts on the live board
3. Book a meeting → bigger XP, notification pops for the team, maybe jumps a rank
4. Close a deal → bell animation, team notification, massive XP, weekly challenge progress
5. Check the leaderboard — see who's hot today, this week, this month
6. Weekly team battle: their pod vs another pod — collective activity drives the score
7. End of week: MVP awarded, streaks maintained, SPIFF winners announced

The psychology: real-time rank changes create urgency ("I'm only 2 calls behind Sarah"), streaks prevent coasting ("I can't break my 15-day activity streak"), team battles create peer accountability ("My team needs me to log 5 more calls"), and tiered competition prevents demoralization ("I'm #1 in the Silver tier, about to promote to Gold").

## Visual Identity — IMPORTANT
This should feel like a LIVE SPORTS SCOREBOARD. Think ESPN Bottom Line, fantasy football draft boards, stock trading floors. High energy. Big numbers. Movement.

Not a quiet dashboard — a scoreboard that makes you want to compete. Dark background with bright accent colors for ranks. Numbers should feel alive — counters ticking, ranks shifting, notifications popping. When someone closes a deal, the whole team should feel it.

Bold, high-contrast. Neon accents on dark backgrounds. Think sports bar meets trading floor.

## Users & What They Need

### Sales Rep
- Needs to see their rank and know EXACTLY what it takes to move up
- Needs instant feedback when they do something — log a call, XP appears immediately
- Needs to feel like their activity matters even if they're not the top closer
- Needs to see team performance — am I pulling my weight?
- Needs achievable daily/weekly challenges — not just "close 10 deals" but "make 20 calls today"
- Needs streak motivation — consecutive days of hitting activity targets

### Sales Manager
- Needs a live view of team activity — who's working, who's coasting, who's on fire
- Needs to create SPIFFs/contests — time-bound challenges with defined rewards
- Needs to see activity trends — is the team's call volume declining before it hits pipeline?
- Needs to identify coaching opportunities — who's making calls but not booking meetings?
- Needs to configure point values — what activities matter most for THIS team

### VP Sales / Admin
- Needs cross-team comparison — which pod is performing best
- Needs to manage tiers and promotion rules
- Needs engagement analytics — is gamification actually driving more activity?

## Demo Data
A SaaS sales org called "Velocity SaaS" with 3 sales pods.

Active scenario:
- 15 sales reps across 3 pods (Alpha, Beta, Gamma — 5 reps each)
- Current week is active — reps at various activity levels
- 1 rep on a 22-day activity streak (top performer, Gold tier)
- 1 rep who just broke their streak yesterday
- An active weekly team battle: Alpha vs Beta (close race)
- A SPIFF running: "March Madness — most meetings booked this week wins"
- Activity data going back 2 months showing trends
- Mix of activities: calls (500+ per rep), meetings booked, demos given, deals closed, revenue
- Tier distribution: 2 Gold, 5 Silver, 8 Bronze
- Current day has live activity — some reps already logging calls this morning

### Demo Accounts
- rep@rankup.app / demo1234 — Active sales rep (Silver tier, 12-day streak, mid-pack)
- manager@rankup.app / demo1234 — Sales manager (team view, SPIFF creation, coaching alerts)
- admin@rankup.app / demo1234 — VP Sales (cross-team, analytics, configuration)

## Tech Stack
- Next.js with App Router
- Neon Postgres (NOT SQLite)
- Drizzle ORM
- Deploy to Vercel

## Notes
- The live leaderboard should feel dynamic — position changes should be visually dramatic
- Activity types with different point values: Call (10 XP), Meeting Booked (50 XP), Demo Given (75 XP), Proposal Sent (100 XP), Deal Closed (500 XP + revenue bonus)
- Tiers: Bronze (0-5000 XP), Silver (5000-15000 XP), Gold (15000+ XP) — promotes monthly
- Team battles: sum of team XP for the week, winning team gets bonus multiplier next week
- SPIFFs: time-limited challenges created by managers, visible countdown timer
- "Deal bell" — when someone closes a deal, everyone should see it (a notification/animation)
- Activity streaks: consecutive days of hitting minimum activity threshold (e.g., 15+ calls)
- Conversion funnel visibility: calls → meetings → demos → deals (per rep, shows efficiency)
