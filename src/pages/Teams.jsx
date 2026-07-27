import { useMemo, useState } from 'react'
import { useData } from '../context/DataContext.jsx'
import { goldenBoot } from '../lib/stats.js'
import { Loader, SectionTitle, EmptyState } from '../components/ui.jsx'

export default function Teams() {
  const { teams, players, goals, loading } = useData()
  const [openId, setOpenId] = useState(null)

  // goals per player for quick per-squad stat
  const goalsByPlayer = useMemo(() => {
    const map = new Map()
    goldenBoot(goals, players, teams).forEach((r) => map.set(r.player.id, r.goals))
    return map
  }, [goals, players, teams])

  const playersByTeam = useMemo(() => {
    const map = new Map()
    players.forEach((p) => {
      if (!map.has(p.team_id)) map.set(p.team_id, [])
      map.get(p.team_id).push(p)
    })
    return map
  }, [players])

  if (loading) return <Loader />
  if (!teams.length) return <EmptyState icon="👥" title="No teams yet" >Add teams from the admin panel.</EmptyState>

  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="The contenders" title="Teams & Squads" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => {
          const squad = (playersByTeam.get(team.id) || []).slice().sort(
            (a, b) => (a.jersey_number ?? 99) - (b.jersey_number ?? 99)
          )
          const open = openId === team.id
          return (
            <div key={team.id} className="card overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition"
                onClick={() => setOpenId(open ? null : team.id)}
              >
                <span className="flex items-center gap-3">
                  <span className="text-2xl">{team.flag_emoji || '🏳️'}</span>
                  <span className="text-left">
                    <span className="font-semibold block">{team.name}</span>
                    <span className="text-white/40 text-xs">
                      Group {team.group_label || '—'} · {squad.length} players
                    </span>
                  </span>
                </span>
                <span className="text-white/40">{open ? '▲' : '▼'}</span>
              </button>

              {open && (
                <div className="border-t border-white/10 divide-y divide-white/5">
                  {squad.length === 0 && (
                    <p className="px-4 py-3 text-white/40 text-sm">No players added yet.</p>
                  )}
                  {squad.map((p) => (
                    <div key={p.id} className="px-4 py-2 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-3">
                        <span className="w-6 text-white/40 tabular-nums text-right">
                          {p.jersey_number ?? '–'}
                        </span>
                        <span className="font-medium">{p.name}</span>
                        <span className="text-white/40 text-xs">{p.position}</span>
                      </span>
                      {goalsByPlayer.get(p.id) > 0 && (
                        <span className="text-gold text-xs font-semibold">
                          ⚽ {goalsByPlayer.get(p.id)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
