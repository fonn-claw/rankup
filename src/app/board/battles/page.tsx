import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { getActiveBattle, getBattleXp } from '@/lib/queries/battles'
import { getActiveChallenges } from '@/lib/queries/challenges'
import { BattleVersus } from '../BattleVersus'
import { ChallengeCard } from '../ChallengeCard'
import { BattlesPoller } from './BattlesPoller'
import { LightningIcon } from '@/components/icons'
import Image from 'next/image'

export default async function BattlesPage() {
  const session = await getSession()
  if (!session.isLoggedIn) redirect('/login')

  const [battle, challenges] = await Promise.all([
    getActiveBattle(),
    getActiveChallenges(session.userId),
  ])

  let team1Xp = 0
  let team2Xp = 0
  let team1Members: { userId: number; name: string; xp: number }[] = []
  let team2Members: { userId: number; name: string; xp: number }[] = []

  if (battle) {
    const xpData = await getBattleXp(
      battle.team1Id,
      battle.team2Id,
      new Date(battle.startDate),
      new Date(battle.endDate)
    )
    const t1 = xpData.find((t) => t.teamId === battle.team1Id)
    const t2 = xpData.find((t) => t.teamId === battle.team2Id)
    team1Xp = t1?.teamTotal ?? 0
    team2Xp = t2?.teamTotal ?? 0
    team1Members = t1?.members ?? []
    team2Members = t2?.members ?? []
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-4 space-y-6">
      <BattlesPoller />

      {/* Battle Section */}
      {battle ? (
        <BattleVersus
          team1Name={battle.team1Name}
          team2Name={battle.team2Name}
          team1Xp={team1Xp}
          team2Xp={team2Xp}
          team1Members={team1Members}
          team2Members={team2Members}
          endDate={battle.endDate}
        />
      ) : (
        <div className="bg-bg-surface rounded-xl p-8 text-center">
          <LightningIcon className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <p className="font-heading text-lg text-text-secondary">No active battle</p>
          <p className="font-data text-sm text-text-muted mt-1">
            Check back when the next team battle starts
          </p>
        </div>
      )}

      {/* Challenges Section */}
      <div>
        <h2 className="font-heading text-sm font-semibold text-text-muted uppercase tracking-widest mb-3">
          ACTIVE CHALLENGES
        </h2>

        {challenges.length > 0 ? (
          <div className="space-y-3">
            {challenges.map((c) => (
              <ChallengeCard
                key={c.id}
                title={c.title}
                description={c.description}
                goalType={c.goalType}
                goalValue={c.goalValue}
                progress={c.progress}
                endDate={c.endDate}
              />
            ))}
          </div>
        ) : (
          <div className="bg-bg-surface rounded-xl p-8 text-center">
            <Image
              src="/assets/empty-challenges.svg"
              alt="No challenges"
              width={240}
              height={160}
              className="mx-auto mb-3 opacity-50"
            />
            <p className="font-heading text-lg text-text-secondary">No active challenges</p>
            <p className="font-data text-sm text-text-muted mt-1">
              Challenges will appear here when created by your manager
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
