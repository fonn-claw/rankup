import 'dotenv/config'
import { db } from './index'
import { users, teams } from './schema'
import bcrypt from 'bcryptjs'

async function seed() {
  console.log('Seeding database...')

  // Create teams
  const [alpha, beta, gamma] = await db.insert(teams).values([
    { name: 'Alpha Pack', slug: 'alpha' },
    { name: 'Beta Squad', slug: 'beta' },
    { name: 'Gamma Force', slug: 'gamma' },
  ]).returning()

  console.log(`Created teams: ${alpha.name}, ${beta.name}, ${gamma.name}`)

  // Create demo accounts
  const hash = await bcrypt.hash('demo1234', 10)
  await db.insert(users).values([
    { email: 'rep@rankup.app', passwordHash: hash, name: 'Sarah Chen', role: 'rep' as const, teamId: alpha.id },
    { email: 'manager@rankup.app', passwordHash: hash, name: 'Mike Torres', role: 'manager' as const, teamId: alpha.id },
    { email: 'admin@rankup.app', passwordHash: hash, name: 'Dana Wright', role: 'admin' as const, teamId: null },
  ])

  console.log('Created demo accounts: rep@rankup.app, manager@rankup.app, admin@rankup.app')
  console.log('Seed complete!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
