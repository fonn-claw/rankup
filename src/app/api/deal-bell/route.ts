import { db } from '@/lib/db'
import { activities, users } from '@/lib/db/schema'
import { eq, and, gte, desc } from 'drizzle-orm'

export async function GET(): Promise<Response> {
  const thirtySecondsAgo = new Date(Date.now() - 30_000)

  const deals = await db
    .select({
      id: activities.id,
      repName: users.name,
      xpEarned: activities.xpEarned,
      metadata: activities.metadata,
      createdAt: activities.createdAt,
    })
    .from(activities)
    .innerJoin(users, eq(activities.userId, users.id))
    .where(
      and(
        eq(activities.type, 'deal'),
        gte(activities.createdAt, thirtySecondsAgo)
      )
    )
    .orderBy(desc(activities.createdAt))

  const result = deals.map((deal) => {
    let dealName = 'Deal'
    let amount = 0
    if (deal.metadata) {
      try {
        const parsed = JSON.parse(deal.metadata) as {
          dealName?: string
          revenue?: number
        }
        dealName = parsed.dealName ?? 'Deal'
        amount = parsed.revenue ?? 0
      } catch {
        // Invalid metadata -- use defaults
      }
    }

    return {
      id: deal.id,
      repName: deal.repName,
      dealName,
      amount,
      xpEarned: deal.xpEarned,
      createdAt: deal.createdAt.toISOString(),
    }
  })

  return Response.json(result, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
