import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config() // fallback to .env

import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'
import { users, teams, activities, battles, challenges, challengeParticipants, settings } from './schema'
import { sql } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

// Create db connection after dotenv loads
const db = drizzle(process.env.DATABASE_URL!, { schema })

// ---------- Rep Profiles ----------

interface RepProfile {
  name: string
  email: string
  teamSlug: 'alpha' | 'beta' | 'gamma'
  targetXp: number // target total XP for tier placement
  streakDays: number // 0 = no active streak
  streakBroken: boolean
  dailyCallBaseline: number
  dailyMeetingBaseline: number
  dailyDemoRate: number // probability of a demo on any given day
  dealRate: number // probability of a deal on any given day
  proposalRate: number
  hasTodayActivity: boolean
}

const REP_PROFILES: RepProfile[] = [
  // Alpha Pack
  { name: 'Marcus Webb', email: 'marcus.webb@rankup.app', teamSlug: 'alpha', targetXp: 18500, streakDays: 22, streakBroken: false, dailyCallBaseline: 22, dailyMeetingBaseline: 3, dailyDemoRate: 0.4, dealRate: 0.08, proposalRate: 0.15, hasTodayActivity: true },
  { name: 'Sarah Chen', email: 'rep@rankup.app', teamSlug: 'alpha', targetXp: 12500, streakDays: 12, streakBroken: false, dailyCallBaseline: 18, dailyMeetingBaseline: 2, dailyDemoRate: 0.25, dealRate: 0.04, proposalRate: 0.1, hasTodayActivity: true },
  { name: 'Jordan Ellis', email: 'jordan.ellis@rankup.app', teamSlug: 'alpha', targetXp: 16500, streakDays: 8, streakBroken: false, dailyCallBaseline: 20, dailyMeetingBaseline: 3, dailyDemoRate: 0.35, dealRate: 0.07, proposalRate: 0.12, hasTodayActivity: true },
  { name: 'Priya Kapoor', email: 'priya.kapoor@rankup.app', teamSlug: 'alpha', targetXp: 9500, streakDays: 5, streakBroken: false, dailyCallBaseline: 16, dailyMeetingBaseline: 2, dailyDemoRate: 0.2, dealRate: 0.03, proposalRate: 0.08, hasTodayActivity: false },
  { name: 'Alex Rivera', email: 'alex.rivera@rankup.app', teamSlug: 'alpha', targetXp: 3500, streakDays: 0, streakBroken: false, dailyCallBaseline: 10, dailyMeetingBaseline: 1, dailyDemoRate: 0.1, dealRate: 0.01, proposalRate: 0.03, hasTodayActivity: false },

  // Beta Squad
  { name: 'Taylor Brooks', email: 'taylor.brooks@rankup.app', teamSlug: 'beta', targetXp: 8500, streakDays: 0, streakBroken: true, dailyCallBaseline: 17, dailyMeetingBaseline: 2, dailyDemoRate: 0.2, dealRate: 0.03, proposalRate: 0.08, hasTodayActivity: false },
  { name: 'Kenji Sato', email: 'kenji.sato@rankup.app', teamSlug: 'beta', targetXp: 7500, streakDays: 3, streakBroken: false, dailyCallBaseline: 15, dailyMeetingBaseline: 2, dailyDemoRate: 0.18, dealRate: 0.02, proposalRate: 0.07, hasTodayActivity: true },
  { name: 'Olivia Foster', email: 'olivia.foster@rankup.app', teamSlug: 'beta', targetXp: 4200, streakDays: 0, streakBroken: false, dailyCallBaseline: 12, dailyMeetingBaseline: 1, dailyDemoRate: 0.12, dealRate: 0.01, proposalRate: 0.04, hasTodayActivity: true },
  { name: 'Ryan Park', email: 'ryan.park@rankup.app', teamSlug: 'beta', targetXp: 3200, streakDays: 0, streakBroken: false, dailyCallBaseline: 10, dailyMeetingBaseline: 1, dailyDemoRate: 0.08, dealRate: 0.01, proposalRate: 0.03, hasTodayActivity: false },
  { name: 'Mia Gonzalez', email: 'mia.gonzalez@rankup.app', teamSlug: 'beta', targetXp: 2800, streakDays: 0, streakBroken: false, dailyCallBaseline: 9, dailyMeetingBaseline: 1, dailyDemoRate: 0.08, dealRate: 0.0, proposalRate: 0.02, hasTodayActivity: false },

  // Gamma Force
  { name: 'Liam Okonkwo', email: 'liam.okonkwo@rankup.app', teamSlug: 'gamma', targetXp: 6500, streakDays: 4, streakBroken: false, dailyCallBaseline: 14, dailyMeetingBaseline: 2, dailyDemoRate: 0.15, dealRate: 0.02, proposalRate: 0.06, hasTodayActivity: true },
  { name: 'Ava Mitchell', email: 'ava.mitchell@rankup.app', teamSlug: 'gamma', targetXp: 4500, streakDays: 0, streakBroken: false, dailyCallBaseline: 12, dailyMeetingBaseline: 1, dailyDemoRate: 0.12, dealRate: 0.01, proposalRate: 0.04, hasTodayActivity: false },
  { name: 'Ethan Patel', email: 'ethan.patel@rankup.app', teamSlug: 'gamma', targetXp: 3800, streakDays: 0, streakBroken: false, dailyCallBaseline: 11, dailyMeetingBaseline: 1, dailyDemoRate: 0.1, dealRate: 0.01, proposalRate: 0.03, hasTodayActivity: true },
  { name: 'Sophia Turner', email: 'sophia.turner@rankup.app', teamSlug: 'gamma', targetXp: 2500, streakDays: 0, streakBroken: false, dailyCallBaseline: 8, dailyMeetingBaseline: 1, dailyDemoRate: 0.06, dealRate: 0.0, proposalRate: 0.02, hasTodayActivity: false },
  { name: 'Noah Dubois', email: 'noah.dubois@rankup.app', teamSlug: 'gamma', targetXp: 2000, streakDays: 0, streakBroken: false, dailyCallBaseline: 7, dailyMeetingBaseline: 0, dailyDemoRate: 0.05, dealRate: 0.0, proposalRate: 0.01, hasTodayActivity: false },
]

// ---------- Utility ----------

const XP_VALUES = { call: 10, meeting: 50, demo: 75, proposal: 100, deal: 500 }
const BATCH_SIZE = 500

const DEAL_NAMES = [
  'Acme Corp - Enterprise Plan', 'GlobalTech - Annual License', 'NovaStar - Premium Suite',
  'Pinnacle Inc - Growth Tier', 'BlueWave - Team Package', 'Zenith Solutions - Pro Plan',
  'Catalyst IO - Startup Bundle', 'Vertex Labs - Enterprise', 'Orion Group - Annual Deal',
  'Stratos Digital - Premium', 'FuseWorks - Scale Plan', 'Atlas Corp - Multi-Seat',
  'Nimbus Cloud - Enterprise', 'Helix Analytics - Pro Tier', 'Quantum SaaS - Growth',
]

function isWeekday(d: Date): boolean {
  const day = d.getDay()
  return day !== 0 && day !== 6
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomHour(minH: number, maxH: number): number {
  return minH + Math.random() * (maxH - minH)
}

function getWeekdaysBack(n: number, fromDate: Date): Date[] {
  const days: Date[] = []
  const d = new Date(fromDate)
  d.setHours(0, 0, 0, 0)
  while (days.length < n) {
    d.setDate(d.getDate() - 1)
    if (isWeekday(d)) {
      days.unshift(new Date(d))
    }
  }
  return days
}

function getMondayOfWeek(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  date.setHours(0, 0, 0, 0)
  return date
}

function getFridayOfWeek(d: Date): Date {
  const monday = getMondayOfWeek(d)
  const friday = new Date(monday)
  friday.setDate(friday.getDate() + 4)
  friday.setHours(23, 59, 59, 999)
  return friday
}

// ---------- Activity Generation ----------

interface ActivityRow {
  userId: number
  type: string
  xpEarned: number
  metadata: string | null
  createdAt: Date
}

function generateActivitiesForRep(
  profile: RepProfile,
  userId: number,
  startDate: Date,
  endDate: Date,
  today: Date,
): ActivityRow[] {
  const acts: ActivityRow[] = []
  const d = new Date(startDate)

  while (d <= endDate) {
    if (!isWeekday(d)) {
      d.setDate(d.getDate() + 1)
      continue
    }

    const isToday = d.toDateString() === today.toDateString()
    const isYesterday = d.toDateString() === new Date(today.getTime() - 86400000).toDateString()

    // Skip today -- we handle today's activity separately
    if (isToday) {
      d.setDate(d.getDate() + 1)
      continue
    }

    // Handle Taylor Brooks broken streak: yesterday she had < 15 calls
    if (profile.streakBroken && isYesterday) {
      // She only made 5 calls yesterday -- not enough for streak
      for (let i = 0; i < 5; i++) {
        const hour = randomHour(8, 17)
        const ts = new Date(d)
        ts.setHours(Math.floor(hour), Math.floor((hour % 1) * 60), randomInt(0, 59))
        acts.push({ userId, type: 'call', xpEarned: XP_VALUES.call, metadata: null, createdAt: ts })
      }
      d.setDate(d.getDate() + 1)
      continue
    }

    // Normal day
    const callCount = Math.max(0, profile.dailyCallBaseline + randomInt(-3, 3))
    const meetingCount = Math.max(0, profile.dailyMeetingBaseline + randomInt(-1, 1))
    const hasDemo = Math.random() < profile.dailyDemoRate
    const hasProposal = Math.random() < profile.proposalRate
    const hasDeal = Math.random() < profile.dealRate

    for (let i = 0; i < callCount; i++) {
      const hour = randomHour(8, 17)
      const ts = new Date(d)
      ts.setHours(Math.floor(hour), Math.floor((hour % 1) * 60), randomInt(0, 59))
      acts.push({ userId, type: 'call', xpEarned: XP_VALUES.call, metadata: null, createdAt: ts })
    }

    for (let i = 0; i < meetingCount; i++) {
      const hour = randomHour(9, 16)
      const ts = new Date(d)
      ts.setHours(Math.floor(hour), Math.floor((hour % 1) * 60), randomInt(0, 59))
      acts.push({ userId, type: 'meeting', xpEarned: XP_VALUES.meeting, metadata: null, createdAt: ts })
    }

    if (hasDemo) {
      const hour = randomHour(10, 16)
      const ts = new Date(d)
      ts.setHours(Math.floor(hour), Math.floor((hour % 1) * 60), randomInt(0, 59))
      acts.push({ userId, type: 'demo', xpEarned: XP_VALUES.demo, metadata: null, createdAt: ts })
    }

    if (hasProposal) {
      const hour = randomHour(10, 17)
      const ts = new Date(d)
      ts.setHours(Math.floor(hour), Math.floor((hour % 1) * 60), randomInt(0, 59))
      acts.push({ userId, type: 'proposal', xpEarned: XP_VALUES.proposal, metadata: null, createdAt: ts })
    }

    if (hasDeal) {
      const hour = randomHour(11, 17)
      const ts = new Date(d)
      ts.setHours(Math.floor(hour), Math.floor((hour % 1) * 60), randomInt(0, 59))
      const revenue = randomInt(5, 75) * 1000
      const dealName = DEAL_NAMES[randomInt(0, DEAL_NAMES.length - 1)]
      acts.push({
        userId,
        type: 'deal',
        xpEarned: XP_VALUES.deal,
        metadata: JSON.stringify({ dealName, revenue }),
        createdAt: ts,
      })
    }

    d.setDate(d.getDate() + 1)
  }

  return acts
}

function enforceStreaks(
  allActivities: ActivityRow[],
  userId: number,
  streakDays: number,
  today: Date,
): void {
  if (streakDays <= 0) return

  // Get the streak weekdays (not including today -- today handled separately)
  const streakWeekdays = getWeekdaysBack(streakDays, today)

  for (const day of streakWeekdays) {
    const dayStr = day.toDateString()
    const callsOnDay = allActivities.filter(
      a => a.userId === userId && a.type === 'call' && a.createdAt.toDateString() === dayStr
    )

    const needed = 15 - callsOnDay.length
    if (needed > 0) {
      for (let i = 0; i < needed; i++) {
        const hour = randomHour(8, 17)
        const ts = new Date(day)
        ts.setHours(Math.floor(hour), Math.floor((hour % 1) * 60), randomInt(0, 59))
        allActivities.push({ userId, type: 'call', xpEarned: XP_VALUES.call, metadata: null, createdAt: ts })
      }
    }
  }
}

function adjustXpToTarget(
  allActivities: ActivityRow[],
  userId: number,
  targetXp: number,
  endDate: Date,
): void {
  const currentXp = allActivities
    .filter(a => a.userId === userId)
    .reduce((sum, a) => sum + a.xpEarned, 0)

  const diff = targetXp - currentXp

  if (Math.abs(diff) < 200) return // close enough

  if (diff > 0) {
    // Need more XP -- add calls on recent days
    const callsNeeded = Math.ceil(diff / XP_VALUES.call)
    const recentDay = new Date(endDate)
    recentDay.setDate(recentDay.getDate() - 3)
    while (!isWeekday(recentDay)) recentDay.setDate(recentDay.getDate() - 1)

    for (let i = 0; i < callsNeeded; i++) {
      const hour = randomHour(8, 17)
      const ts = new Date(recentDay)
      ts.setHours(Math.floor(hour), Math.floor((hour % 1) * 60), randomInt(0, 59))
      allActivities.push({ userId, type: 'call', xpEarned: XP_VALUES.call, metadata: null, createdAt: ts })
    }
  } else {
    // Too much XP -- remove some calls from earlier days
    const callsToRemove = Math.ceil(Math.abs(diff) / XP_VALUES.call)
    let removed = 0
    for (let i = allActivities.length - 1; i >= 0 && removed < callsToRemove; i--) {
      if (allActivities[i].userId === userId && allActivities[i].type === 'call') {
        allActivities.splice(i, 1)
        removed++
      }
    }
  }
}

// ---------- Today's Morning Activity ----------

function generateTodayActivity(
  profile: RepProfile,
  userId: number,
  today: Date,
): ActivityRow[] {
  if (!profile.hasTodayActivity) return []

  const acts: ActivityRow[] = []
  const callCount = randomInt(5, 12) // morning calls so far
  const meetingCount = Math.random() < 0.4 ? 1 : 0

  for (let i = 0; i < callCount; i++) {
    const hour = randomHour(7, 10)
    const ts = new Date(today)
    ts.setHours(Math.floor(hour), Math.floor((hour % 1) * 60), randomInt(0, 59))
    acts.push({ userId, type: 'call', xpEarned: XP_VALUES.call, metadata: null, createdAt: ts })
  }

  if (meetingCount > 0) {
    const ts = new Date(today)
    ts.setHours(9, randomInt(0, 59), randomInt(0, 59))
    acts.push({ userId, type: 'meeting', xpEarned: XP_VALUES.meeting, metadata: null, createdAt: ts })
  }

  return acts
}

// ---------- Verification ----------

function getTier(xp: number): string {
  if (xp >= 15000) return 'Gold'
  if (xp >= 5000) return 'Silver'
  return 'Bronze'
}

// ---------- Main Seed ----------

async function seed() {
  console.log('=== RankUp Seed Script ===')
  console.log('')

  const today = new Date()
  today.setHours(10, 0, 0, 0) // Simulate 10am
  const startDate = new Date(today)
  startDate.setMonth(startDate.getMonth() - 2)
  startDate.setDate(1) // Start from 1st of 2 months ago
  const endDate = new Date(today)
  endDate.setDate(endDate.getDate() - 1) // Yesterday (today handled separately)

  // 1. Truncate all tables
  console.log('Truncating tables...')
  await db.execute(sql`TRUNCATE TABLE challenge_participants, challenges, battles, activities, settings, users, teams RESTART IDENTITY CASCADE`)

  // 2. Create teams
  console.log('Creating teams...')
  const [alpha, beta, gamma] = await db.insert(teams).values([
    { name: 'Alpha Pack', slug: 'alpha' },
    { name: 'Beta Squad', slug: 'beta' },
    { name: 'Gamma Force', slug: 'gamma' },
  ]).returning()

  const teamMap: Record<string, number> = {
    alpha: alpha.id,
    beta: beta.id,
    gamma: gamma.id,
  }

  // 3. Create users
  console.log('Creating users...')
  const hash = await bcrypt.hash('demo1234', 10)

  const repInserts = REP_PROFILES.map(p => ({
    email: p.email,
    passwordHash: hash,
    name: p.name,
    role: 'rep' as const,
    teamId: teamMap[p.teamSlug],
  }))

  const insertedReps = await db.insert(users).values(repInserts).returning()

  const [manager] = await db.insert(users).values({
    email: 'manager@rankup.app',
    passwordHash: hash,
    name: 'Mike Torres',
    role: 'manager' as const,
    teamId: teamMap.alpha,
  }).returning()

  const [admin] = await db.insert(users).values({
    email: 'admin@rankup.app',
    passwordHash: hash,
    name: 'Dana Wright',
    role: 'admin' as const,
    teamId: null,
  }).returning()

  console.log(`  Created ${insertedReps.length} reps + manager + admin = ${insertedReps.length + 2} users`)

  // Build userId map
  const userMap: Record<string, number> = {}
  for (const rep of insertedReps) {
    userMap[rep.email] = rep.id
  }
  userMap['manager@rankup.app'] = manager.id
  userMap['admin@rankup.app'] = admin.id

  // 4. Generate historical activities
  console.log('Generating activity history (2 months)...')
  const allActivities: ActivityRow[] = []

  for (const profile of REP_PROFILES) {
    const userId = userMap[profile.email]
    const repActs = generateActivitiesForRep(profile, userId, startDate, endDate, today)
    allActivities.push(...repActs)
  }

  // 5. Enforce streak scenarios
  console.log('Enforcing streak scenarios...')
  for (const profile of REP_PROFILES) {
    if (profile.streakDays > 0) {
      const userId = userMap[profile.email]
      enforceStreaks(allActivities, userId, profile.streakDays, today)
    }
  }

  // 6. Generate today's morning activity
  console.log('Generating today\'s morning activity...')
  const todayActivities: ActivityRow[] = []
  for (const profile of REP_PROFILES) {
    if (profile.hasTodayActivity) {
      const userId = userMap[profile.email]
      const acts = generateTodayActivity(profile, userId, today)
      todayActivities.push(...acts)
    }
  }
  allActivities.push(...todayActivities)

  // 7. Adjust XP to target tiers
  console.log('Adjusting XP to match target tiers...')
  for (const profile of REP_PROFILES) {
    const userId = userMap[profile.email]
    adjustXpToTarget(allActivities, userId, profile.targetXp, endDate)
  }

  // 8. Ensure battle XP is close between Alpha and Beta
  // Calculate XP during battle period
  const battleStart = new Date(today)
  battleStart.setDate(battleStart.getDate() - 4)
  battleStart.setHours(0, 0, 0, 0)

  const alphaRepIds = REP_PROFILES.filter(p => p.teamSlug === 'alpha').map(p => userMap[p.email])
  const betaRepIds = REP_PROFILES.filter(p => p.teamSlug === 'beta').map(p => userMap[p.email])

  const battleActivities = allActivities.filter(a => a.createdAt >= battleStart)
  let alphaXp = battleActivities.filter(a => alphaRepIds.includes(a.userId)).reduce((s, a) => s + a.xpEarned, 0)
  let betaXp = battleActivities.filter(a => betaRepIds.includes(a.userId)).reduce((s, a) => s + a.xpEarned, 0)

  // Bring within 500 XP of each other
  const battleDiff = alphaXp - betaXp
  if (Math.abs(battleDiff) > 500) {
    const targetTeamIds = battleDiff > 0 ? betaRepIds : alphaRepIds
    const callsToAdd = Math.ceil((Math.abs(battleDiff) - 300) / XP_VALUES.call) // Bring within 300
    const recentBattleDay = new Date(today)
    recentBattleDay.setDate(recentBattleDay.getDate() - 1)
    while (!isWeekday(recentBattleDay)) recentBattleDay.setDate(recentBattleDay.getDate() - 1)

    for (let i = 0; i < callsToAdd; i++) {
      const userId = targetTeamIds[i % targetTeamIds.length]
      const hour = randomHour(8, 17)
      const ts = new Date(recentBattleDay)
      ts.setHours(Math.floor(hour), Math.floor((hour % 1) * 60), randomInt(0, 59))
      allActivities.push({ userId, type: 'call', xpEarned: XP_VALUES.call, metadata: null, createdAt: ts })
    }
  }

  // 9. Insert activities in batches
  console.log(`Inserting ${allActivities.length} activities in batches of ${BATCH_SIZE}...`)
  for (let i = 0; i < allActivities.length; i += BATCH_SIZE) {
    const batch = allActivities.slice(i, i + BATCH_SIZE)
    await db.insert(activities).values(batch)
    process.stdout.write(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(allActivities.length / BATCH_SIZE)}\r`)
  }
  console.log('')

  // 10. Create battle
  console.log('Creating Alpha vs Beta battle...')
  const battleEnd = new Date(today)
  battleEnd.setDate(battleEnd.getDate() + 3)
  battleEnd.setHours(23, 59, 59, 999)

  await db.insert(battles).values({
    team1Id: teamMap.alpha,
    team2Id: teamMap.beta,
    startDate: battleStart,
    endDate: battleEnd,
    status: 'active',
    winnerTeamId: null,
  })

  // 11. Create SPIFF challenge
  console.log('Creating March Madness SPIFF...')
  const mondayOfWeek = getMondayOfWeek(today)
  const fridayOfWeek = getFridayOfWeek(today)

  const [challenge] = await db.insert(challenges).values({
    title: 'March Madness',
    description: 'Most meetings booked this week wins a $500 bonus!',
    goalType: 'meeting',
    goalValue: 20,
    startDate: mondayOfWeek,
    endDate: fridayOfWeek,
    createdBy: manager.id,
  }).returning()

  // Calculate meeting progress for each rep this week
  const weekMeetings: Record<number, number> = {}
  for (const a of allActivities) {
    if (a.type === 'meeting' && a.createdAt >= mondayOfWeek && a.createdAt <= fridayOfWeek) {
      weekMeetings[a.userId] = (weekMeetings[a.userId] || 0) + 1
    }
  }

  const participantValues = insertedReps.map(rep => ({
    challengeId: challenge.id,
    userId: rep.id,
    progress: weekMeetings[rep.id] || 0,
  }))

  await db.insert(challengeParticipants).values(participantValues)

  // 12. Insert settings
  console.log('Inserting settings...')
  await db.insert(settings).values([
    { key: 'xp_call', value: '10', updatedBy: admin.id },
    { key: 'xp_meeting', value: '50', updatedBy: admin.id },
    { key: 'xp_demo', value: '75', updatedBy: admin.id },
    { key: 'xp_proposal', value: '100', updatedBy: admin.id },
    { key: 'xp_deal', value: '500', updatedBy: admin.id },
    { key: 'tier_bronze_max', value: '4999', updatedBy: admin.id },
    { key: 'tier_silver_max', value: '14999', updatedBy: admin.id },
  ])

  // ---------- Verification ----------
  console.log('')
  console.log('=== Verification ===')

  const dbUsers = await db.select().from(users)
  const dbTeams = await db.select().from(teams)
  console.log(`Users: ${dbUsers.length} (expected 17)`)
  console.log(`Teams: ${dbTeams.length} (expected 3)`)

  // Calculate XP per rep from actual activities
  const xpPerUser: Record<number, number> = {}
  for (const a of allActivities) {
    xpPerUser[a.userId] = (xpPerUser[a.userId] || 0) + a.xpEarned
  }

  const tierCounts = { Gold: 0, Silver: 0, Bronze: 0 }
  console.log('')
  console.log('Rep XP and Tiers:')
  for (const rep of insertedReps) {
    const xp = xpPerUser[rep.id] || 0
    const tier = getTier(xp)
    tierCounts[tier as keyof typeof tierCounts]++
    const profile = REP_PROFILES.find(p => p.email === rep.email)!
    console.log(`  ${rep.name.padEnd(20)} ${xp.toString().padStart(6)} XP  ${tier.padEnd(6)}  (target: ${profile.targetXp})`)
  }

  console.log('')
  console.log(`Tier distribution: Gold=${tierCounts.Gold} Silver=${tierCounts.Silver} Bronze=${tierCounts.Bronze} (expected 2/5/8)`)

  // Streak verification
  console.log('')
  console.log('Streak verification:')
  for (const profile of REP_PROFILES) {
    if (profile.streakDays > 0 || profile.streakBroken) {
      const userId = userMap[profile.email]
      // Count consecutive weekdays with 15+ calls going back from today
      let streak = 0
      const checkDate = new Date(today)
      // Include today if they have today activity
      if (profile.hasTodayActivity) {
        const todayCalls = allActivities.filter(
          a => a.userId === userId && a.type === 'call' && a.createdAt.toDateString() === today.toDateString()
        ).length
        if (todayCalls >= 15) streak++
      }
      // Check backwards
      const d = new Date(today)
      d.setDate(d.getDate() - 1)
      let maxLookback = 30
      while (maxLookback-- > 0) {
        if (!isWeekday(d)) { d.setDate(d.getDate() - 1); continue }
        const calls = allActivities.filter(
          a => a.userId === userId && a.type === 'call' && a.createdAt.toDateString() === d.toDateString()
        ).length
        if (calls >= 15) {
          streak++
        } else {
          break
        }
        d.setDate(d.getDate() - 1)
      }
      console.log(`  ${profile.name.padEnd(20)} streak: ${streak} days ${profile.streakBroken ? '(BROKEN)' : '(ACTIVE)'}`)
    }
  }

  // Battle verification
  const battleActs = allActivities.filter(a => a.createdAt >= battleStart)
  alphaXp = battleActs.filter(a => alphaRepIds.includes(a.userId)).reduce((s, a) => s + a.xpEarned, 0)
  betaXp = battleActs.filter(a => betaRepIds.includes(a.userId)).reduce((s, a) => s + a.xpEarned, 0)
  console.log('')
  console.log(`Battle XP: Alpha=${alphaXp} Beta=${betaXp} diff=${Math.abs(alphaXp - betaXp)} (target: <500)`)

  // Today activity
  const todayCount = allActivities.filter(a => a.createdAt.toDateString() === today.toDateString()).length
  const repsWithToday = new Set(allActivities.filter(a => a.createdAt.toDateString() === today.toDateString()).map(a => a.userId)).size
  console.log(`Today's activities: ${todayCount} from ${repsWithToday} reps (expected 5-8 reps)`)

  console.log('')
  console.log(`Total activities: ${allActivities.length}`)
  console.log('')
  console.log('=== Seed Complete ===')

  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
