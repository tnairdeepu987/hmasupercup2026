import { useMemo, useState } from 'react'
import { useData } from '../context/DataContext.jsx'
import { teamMap as buildTeamMap, STAGE_LABELS } from '../lib/stats.js'
import MatchCard from '../components/MatchCard.jsx'
import { Loader, SectionTitle, EmptyState } from '../components/ui.jsx'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'live', label: 'Live' },
  { key: 'scheduled', label: 'Upcoming' },
  { key: 'finished', label: 'Results' },
]

export default function Fixtures() {
  const { matches, teams, cautions, loading } = useData()
  const tMap = useMemo(() => buildTeamMap(teams), [teams])
  const [filter, setFilter] = useState('all')

  const filtered = matches.filter((m) => (filter === 'all' ? true : m.status === filter))

  // group by stage/group for readability
  const groups = useMemo(() => {
    const map = new Map()
    filtered.forEach((m) => {
      const key = m.stage === 'group' ? `Group ${m.group_label || ''}`.trim() : STAGE_LABELS[m.stage] || m.stage
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(m)
    })
    return [...map.entries()]
  }, [filtered])

  if (loading) return <Loader />

  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Match centre" title="Fixtures & Results" />

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
              filter === f.key ? 'bg-gold text-ink' : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {groups.length === 0 ? (
        <EmptyState icon="🗓️" title="No matches to show" >
          Try a different filter, or ask the admin to schedule some matches.
        </EmptyState>
      ) : (
        groups.map(([label, list]) => (
          <section key={label}>
            <h3 className="text-white/60 font-semibold uppercase tracking-wide text-sm mb-3">
              {label}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {list.map((m) => (
                <MatchCard key={m.id} match={m} teamMap={tMap} cautions={cautions} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  )
}
