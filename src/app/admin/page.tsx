export default function AdminPage() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Page heading */}
      <h1 className="font-heading text-4xl font-bold text-accent-cyan tracking-wider">ADMIN</h1>
      <p className="font-data text-text-muted">Cross-team configuration coming in Phase 3</p>

      {/* Placeholder cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'TEAMS', desc: 'Manage sales pods and team assignments' },
          { title: 'ACTIVITY CONFIG', desc: 'Configure point values and activity types' },
          { title: 'ENGAGEMENT', desc: 'Gamification analytics and engagement metrics' },
        ].map((card) => (
          <div key={card.title} className="bg-bg-surface rounded-lg p-6">
            <h3 className="font-heading text-lg font-semibold text-text-primary tracking-wider mb-2">
              {card.title}
            </h3>
            <p className="font-data text-sm text-text-muted">{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
