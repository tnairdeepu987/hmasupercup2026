import { useMemo } from 'react'
import { useData } from '../context/DataContext.jsx'
import { goldenBoot, assistLeaders } from '../lib/stats.js'
import { Loader, SectionTitle, EmptyState } from '../components/ui.jsx'

function LeaderTable({ rows, valueKey, valueLabel, icon }) {
  if (!rows.length) {
    return <EmptyState icon={icon} title={`No ${valueLabel.toLowerCase()} recorded yet`} />
  }
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-white/40 text-xs uppercase">
              <th className="text-left px-4 py-3">#</th>
              <th className="text-left px-2 py-3">Player</th>
              <th className="text-left px-2 py-3">Team</th>
              <th className="px-4 py-3 text-gold">{valueLabel}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.player.id} className="border-t border-white/5">
                <td className="px-4 py-3 text-white/50">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                </td>
                <td className="px-2 py-3 font-semibold">{r.player.name}</td>
                <td className="px-2 py-3 text-white/60 whitespace-nowrap">
                  <span className="mr-1">{r.team?.flag_emoji}</span>{r.team?.name}
                </td>
                <td className="px-4 py-3 text-center font-display text-lg text-gold tabular-nums">
                  {r[valueKey]}
                  {valueKey === 'goals' && r.penalties > 0 && (
                    <span className="text-white/40 text-xs font-body ml-1">({r.penalties} pen)</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function Stats() {
  const { goals, players, teams, loading } = useData()
  const boot = useMemo(() => goldenBoot(goals, players, teams), [goals, players, teams])
  const assists = useMemo(() => assistLeaders(goals, players, teams), [goals, players, teams])

  if (loading) return <Loader />

  return (
    <div className="space-y-10">
      <section>
        <SectionTitle eyebrow="👟 Race for the" title="Golden Boot" />
        <LeaderTable rows={boot} valueKey="goals" valueLabel="Goals" icon="👟" />
      </section>

      <section>
        <SectionTitle eyebrow="🎯 Playmakers" title="Top Assists" />
        <LeaderTable rows={assists} valueKey="assists" valueLabel="Assists" icon="🎯" />
      </section>
    </div>
  )
}
