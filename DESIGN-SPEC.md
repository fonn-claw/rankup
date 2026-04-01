# RankUp — Design Specification

## UI Paradigm

**Scoreboard-first.** This is a live sports scoreboard — not a dashboard, not an admin panel, not a CRM. The primary surface is a vertically-stacked ranked list of players with live-updating numbers, XP bars, and rank indicators. Think ESPN Bottom Line ticker meets fantasy football draft board meets stock trading terminal.

The entire experience is built around one truth: **your rank is changing right now.** Every screen reinforces urgency, movement, and competition. Numbers tick. Positions shift. Notifications pop. The UI is never static.

## Primary Interaction

**Watching your rank move — then doing something about it.** The user's eyes go to: (1) their position, (2) the gap to the next rank, (3) what activity would close that gap. The scoreboard answers all three without a click. Secondary interactions: logging activity, checking challenges/streaks, viewing team battles.

## Layout Structure

**Stacked ticker layout — full-width, vertically scrolling.**

```
+------------------------------------------------------------------+
|  [Logo]    LIVE BOARD  |  BATTLES  |  CHALLENGES   [User/Streak] |  <- Top bar (thin, 48px)
+------------------------------------------------------------------+
|                                                                    |
|  YOUR POSITION BANNER (pinned)                                     |  <- Always visible: rank, XP, gap to next
|  #7  SARAH CHEN  ████████████░░░  12,450 XP  (+180 today)        |
|       Silver Tier  |  12-day streak  |  2 calls to pass #6        |
|                                                                    |
+------------------------------------------------------------------+
|                                                                    |
|  LIVE RANKINGS                                                     |  <- The scoreboard
|  #1  ▲  Marcus Webb     Gold    18,200 XP   +540 today   🔥22d   |
|  #2  —  Jordan Ellis    Gold    17,850 XP   +320 today   🔥15d   |
|  #3  ▼  Taylor Brooks   Silver  16,100 XP   +0 today            |
|  #4  ▲  ...                                                       |
|  ...                                                               |
|                                                                    |
+------------------------------------------------------------------+
|  DEAL BELL FEED (collapsed, expands)                               |  <- Recent deal closings, team events
+------------------------------------------------------------------+
```

**Manager view** replaces the "Your Position Banner" with a team heatmap row — who's active now, who's idle, coaching alerts. The scoreboard below shows the same rankings.

**No sidebar.** Sidebars waste horizontal space that the scoreboard needs. Navigation is a thin top bar with 3-4 tabs maximum. The scoreboard IS the app.

## Anti-patterns

- **Stat cards / KPI tiles at the top** — This isn't a BI dashboard. No "Total Calls This Month: 1,247" cards. The scoreboard already shows everything.
- **Sidebar navigation** — Wastes space. The scoreboard needs full width to show rank + name + tier + XP + daily change + streak all in one scannable row.
- **Muted/pastel colors** — This is a competition platform. Soft blues and grays signal "boring enterprise tool." We need high-contrast neon on dark.
- **Tables with sort headers** — The ranking IS the sort. There's one order: rank. No "click to sort by name" nonsense.
- **Static numbers** — Every number that changes should visually change. Counters tick up. Rank arrows animate. XP bars fill.
- **Equal visual weight** — The #1 player should look different from #8. Top positions get more visual emphasis (larger text, glow effects, tier color intensity).
- **Modals for primary actions** — Logging activity should be inline or a slide-up panel, not a modal that blocks the scoreboard.

---

## Design System

### Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `bg-primary` | `#0A0E17` | Main background — near-black with blue undertone |
| `bg-surface` | `#111827` | Card/row background |
| `bg-surface-hover` | `#1A2332` | Row hover state |
| `bg-elevated` | `#1E293B` | Modals, dropdowns, floating panels |
| `text-primary` | `#F1F5F9` | Primary text — high contrast on dark |
| `text-secondary` | `#94A3B8` | Secondary text, labels |
| `text-muted` | `#475569` | Disabled, inactive |
| `accent-cyan` | `#06D6F2` | Primary accent — XP bars, highlights, active states |
| `accent-green` | `#10B981` | Positive — rank up, deal closed, streak active |
| `accent-red` | `#EF4444` | Negative — rank down, streak broken |
| `accent-amber` | `#F59E0B` | Warning — streak at risk, close race |
| `tier-gold` | `#FFD700` | Gold tier — warm metallic |
| `tier-silver` | `#C0C0C0` | Silver tier — cool metallic |
| `tier-bronze` | `#CD7F32` | Bronze tier — warm copper |
| `neon-glow` | `#06D6F2` at 30% opacity | Glow effect behind top performers, active elements |

**Reasoning:** Dark background is non-negotiable for a scoreboard — it makes neon accents pop, reduces eye strain during all-day use, and signals "live data feed" rather than "enterprise app." Cyan is the primary accent because it reads as "electric/live" without the gaming-cliché of pure green. Tier colors use traditional metallic associations.

### Typography

| Role | Font | Weight | Size |
|------|------|--------|------|
| Headings / Rank numbers | **Barlow Condensed** | 700, 600 | 32-48px (rank), 18-24px (section headers) |
| Body / Names / Data | **JetBrains Mono** | 400, 500 | 14-16px |

**Barlow Condensed** — tall, narrow, athletic. Used on actual sports scoreboards. Dense enough to pack data into rows without shrinking font size.

**JetBrains Mono** — monospaced for data alignment. XP numbers, activity counts, and stats line up perfectly. Feels like a trading terminal. Clean and highly legible.

### Key Components

**Scoreboard Row** — The atomic unit. Full-width, 64px tall, alternating `bg-surface` / `bg-primary`. Structure:
```
[Rank#] [Movement Arrow] [Avatar] [Name] [Tier Badge] [XP Bar + Number] [Today's Change] [Streak Icon]
```
- Rank number: Barlow Condensed 700, 28px, left-aligned in 48px column
- Movement arrow: `accent-green` ▲ or `accent-red` ▼ or `text-muted` — (16px column)
- XP bar: 120px wide, `accent-cyan` fill on `bg-primary` track, rounded corners
- Today's change: `accent-green` if positive, monospaced, right-aligned
- Top 3 rows get a subtle left-border glow in their tier color

**Your Position Banner** — Pinned at top of scoreboard. Expanded version of a scoreboard row with additional context:
- Gap to next rank: "2 calls to pass #6" in `accent-amber`
- Streak badge: flame icon + day count
- Daily challenge progress: mini progress bar
- Background: subtle gradient from `bg-surface` to transparent, 96px tall

**Tier Badge** — Pill-shaped, 20px tall. Background is tier color at 20% opacity, text is tier color at full. Contains tier name: "GOLD", "SILVER", "BRONZE".

**Deal Bell** — Full-width notification bar that slides down from below the top nav. Dark background with `accent-green` left border. Shows: "[Name] closed [Deal Name] — $XX,000 — [XP earned]". Auto-dismisses after 8 seconds. Stacks if multiple fire.

**Activity Log Button** — Fixed bottom-right floating action button. Cyan circle, 56px. Tapping opens a slide-up panel (not modal) with quick-log options: Call, Meeting, Demo, Proposal, Deal. Each shows XP value. Panel covers bottom 40% of screen, scoreboard remains visible above.

**Streak Badge** — Flame icon followed by day count. Active: `accent-amber` flame with glow. Broken: `text-muted` with strikethrough on the count. At risk (last hour of day, no activity): pulsing `accent-amber`.

### Motion

**Rank Shift Animation** — When a rep's rank changes, their row physically slides up or down to the new position. Other rows shift to accommodate. Duration: 600ms, ease-in-out. The moving row gets a brief cyan glow trail. This is THE animation — the one that makes people say "whoa." It should feel like watching a live leaderboard update on a sports broadcast.

**XP Counter Tick** — When XP is earned, the number doesn't just jump — it rapidly counts up from old value to new value over 400ms. The XP bar fills simultaneously. A small "+50 XP" floats up and fades from the point of change.

**Deal Bell Drop** — Notification slides down from top with a slight bounce (120ms overshoot, 80ms settle). A subtle pulse of `accent-green` radiates outward from the notification bar.

---

## Screens

### 1. Live Board (Rep View) — THE screen

**What the user sees first:** Their rank, pinned at the top. Below it, the full ranked list of all reps. Everything is live — numbers updating, ranks potentially shifting. The top bar shows current tab (Live Board), their streak badge, and a subtle "LIVE" indicator with a pulsing dot.

**What they interact with most:** Scanning. This is primarily a read screen. Eyes go: my rank -> my gap -> who's above me -> who's hot today. The floating action button in the bottom-right lets them log activity without leaving the board. When they do, their XP ticks up and their row potentially slides up in rank.

**What makes this different:** There's no chrome, no sidebar, no widget grid. It's a single ranked list with a pinned personal banner — like checking your position in a race. The information density is high but scannable because every row follows the same structure. The dark background with tier-colored accents and cyan XP bars creates a feeling of watching a live sports broadcast, not using enterprise software.

**Filters (top bar, inline):** Time period toggle (Today | This Week | This Month | All Time). Team filter (All | Alpha | Beta | Gamma). These are small pill toggles, not dropdowns.

### 2. Battles & Challenges (Tab 2)

**What the user sees first:** Two sections stacked vertically.

**Active Team Battle** (top half): Two team names facing off with a versus divider. Each side shows the team's total XP for the period, a progress bar racing toward the goal, and a list of contributors (compact — avatar + XP contributed). A countdown timer shows time remaining. The leading team's side has a subtle glow.

```
  ALPHA PACK          vs          BETA SQUAD
   12,450 XP         ⚡            11,890 XP
  ████████████░░░░░░    ░░░░░████████████
  3d 14h remaining
```

**Active Challenges / SPIFFs** (bottom half): Cards showing each active challenge. Each card: title, description, progress bar (your progress vs. goal), time remaining (countdown), reward. "March Madness — Most Meetings Booked" with a progress ring showing 8/15 meetings.

**What makes this different:** The versus layout is borrowed from fighting games and sports broadcasts. It's not a comparison table — it's a confrontation. The countdown timers create real urgency.

### 3. Manager Command Center

**What the user sees first:** A horizontal team activity heatmap strip replaces the "Your Position Banner." Each rep is a cell — green (active now), amber (active today, idle now), red (no activity today). Clicking a cell scrolls to that rep in the scoreboard below.

**Below the heatmap:** The same live scoreboard as the rep view, but with an additional column: conversion rate (calls-to-meetings ratio). Reps with high activity but low conversion are subtly flagged with an amber indicator — coaching opportunity.

**Manager actions (top bar):** "Create SPIFF" button opens a slide-out panel. "Activity Report" exports. These are secondary — the primary view IS the scoreboard.

**What makes this different:** Managers see the same scoreboard as reps — they're not in a different app. The heatmap strip is the only addition, and it answers the #1 manager question at a glance: "Who's working right now?"

---

## Asset Manifest

### Tier 1 — Functional SVGs

| Filename | Dimensions | Description | Used In |
|----------|-----------|-------------|---------|
| `logo.svg` | 140x32 | RankUp wordmark — "RANK" in Barlow Condensed bold + "UP" with upward-angled baseline and cyan accent | Top bar, login |
| `logo-icon.svg` | 32x32 | Logomark — abstract upward chevron/arrow in cyan | Favicon source, mobile, compact spaces |
| `favicon.svg` | 32x32 | Favicon version of logomark | Browser tab |
| `icon-flame.svg` | 24x24 | Streak flame icon | Streak badges throughout |
| `icon-trophy.svg` | 24x24 | Trophy icon | Challenge/SPIFF cards, winner announcements |
| `icon-bell.svg` | 24x24 | Deal bell icon | Deal bell notifications |
| `icon-arrow-up.svg` | 24x24 | Rank up arrow (thick, bold) | Scoreboard rank changes |
| `icon-arrow-down.svg` | 24x24 | Rank down arrow (thick, bold) | Scoreboard rank changes |
| `icon-lightning.svg` | 24x24 | Lightning bolt — XP/energy | XP earned indicators, battle vs divider |
| `icon-target.svg` | 24x24 | Crosshair/target | Challenge goals |
| `icon-phone.svg` | 24x24 | Phone icon | Call activity type |
| `icon-calendar.svg` | 24x24 | Calendar icon | Meeting activity type |
| `icon-presentation.svg` | 24x24 | Screen/projector icon | Demo activity type |
| `icon-document.svg` | 24x24 | Document with checkmark | Proposal activity type |
| `icon-handshake.svg` | 24x24 | Handshake icon | Deal closed activity type |
| `icon-users.svg` | 24x24 | Group of people | Team/pod indicators |
| `tier-gold.svg` | 24x24 | Gold tier badge — shield shape with star | Tier badges |
| `tier-silver.svg` | 24x24 | Silver tier badge — shield shape with chevron | Tier badges |
| `tier-bronze.svg` | 24x24 | Bronze tier badge — shield shape with circle | Tier badges |
| `empty-board.svg` | 240x160 | Empty scoreboard state — faded scoreboard rows with "No activity yet" | Empty states |
| `empty-challenges.svg` | 240x160 | No active challenges — target with dotted outline | Empty states |

### Tier 2 — Decorative (DALL-E)

| Filename | Dimensions | Description | Used In |
|----------|-----------|-------------|---------|
| `hero-login.png` | 1024x1024 | Login/landing hero — abstract dark arena with neon cyan light beams, scoreboard shapes in background, electric energy feel | Login page background |
| `bg-deal-bell.png` | 1024x1024 | Celebration texture — abstract burst of light particles, cyan and green on dark, victory energy | Deal bell notification background (tiled/cropped) |
| `bg-battle.png` | 1024x1024 | Team battle atmosphere — two opposing forces of light (cyan vs amber) meeting in the center, dark arena background, electric sparks at collision point | Battle screen background |
