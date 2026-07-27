import { useMemo } from 'react'
import { useData } from '../context/DataContext.jsx'
import { computeStandings } from '../lib/stats.js'
import { Loader, SectionTitle, EmptyState } from '../components/ui.jsx'

export default function Standings() {
  const { teams, matches, loading } = useData()
  const standings = useMemo(() => computeStandings(teams, matches), [teams, matches])
  const groups = Object.entries(standings).sort(([a], [b]) => a.localeCompare(b))

  if (loading) return <Loader />
  if (!groups.length) return <EmptyState icon="📊" title="No teams yet" >Add teams in the admin panel to see standings.</EmptyState>

  return (
    <div className="space-y-8">
      <SectionTitle eyebrow="Group stage" title="Standings" />
      <p className="text-white/50 text-sm -mt-4">
        Top two of each group qualify. Ranked by points, then goal difference, then goals scored.
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        {groups.map(([group, rows]) => (
          <div key={group} className="card overflow-hidden">
            <div className="px-4 py-3 bg-white/5 border-b border-white/10 font-display text-lg">
              Group {group}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-white/40 text-xs uppercase">
                    <th className="text-left font-semibold px-4 py-2">#</th>
                    <th className="text-left font-semibold px-2 py-2">Team</th>
                    <th className="px-2 py-2">P</th>
                    <th className="px-2 py-2">W</th>
                    <th className="px-2 py-2">D</th>
                    <th className="px-2 py-2">L</th>
                    <th className="px-2 py-2">GF</th>
                    <th className="px-2 py-2">GA</th>
                    <th className="px-2 py-2">GD</th>
                    <th className="px-3 py-2 text-gold">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr
                      key={r.team.id}
                      className={`border-t border-white/5 ${i < 2 ? 'bg-pitch/10' : ''}`}
                    >
                      <td className="px-4 py-2.5 text-white/50">
                        <span className={i < 2 ? 'text-pitch-light font-bold' : ''}>{i + 1}</span>
                      </td>
                      <td className="px-2 py-2.5 whitespace-nowrap">
                        <span className="mr-2">{r.team.flag_emoji}</span>
                        <span className="font-semibold">{r.team.name}</span>
                      </td>
                      <td className="text-center px-2 tabular-nums">{r.played}</td>
                      <td className="text-center px-2 tabular-nums">{r.won}</td>
                      <td className="text-center px-2 tabular-nums">{r.drawn}</td>
                      <td className="text-center px-2 tabular-nums">{r.lost}</td>
                      <td className="text-center px-2 tabular-nums">{r.gf}</td>
                      <td className="text-center px-2 tabular-nums">{r.ga}</td>
                      <td className="text-center px-2 tabular-nums">{r.gd > 0 ? `+${r.gd}` : r.gd}</td>
                      <td className="text-center px-3 font-display text-gold tabular-nums">{r.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
      <p className="text-white/40 text-xs">
        <span className="inline-block h-3 w-3 rounded bg-pitch/40 align-middle mr-1" /> Qualification places
      </p>
    </div>
  )
}
