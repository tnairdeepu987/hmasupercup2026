import { Link } from 'react-router-dom'
import { useData } from '../../context/DataContext.jsx'

function Stat({ label, value, icon }) {
  return (
    <div className="card p-5">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="font-display text-3xl">{value}</div>
      <div className="text-white/50 text-sm">{label}</div>
    </div>
  )
}

export default function AdminDashboard() {
  const { teams, players, matches, goals } = useData()

  const live = matches.filter((m) => m.status === 'live').length
  const finished = matches.filter((m) => m.status === 'finished').length
  const scheduled = matches.filter((m) => m.status === 'scheduled').length

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Stat label="Teams" value={teams.length} icon="🛡️" />
        <Stat label="Players" value={players.length} icon="👤" />
        <Stat label="Matches" value={matches.length} icon="⚽" />
        <Stat label="Goals" value={goals.length} icon="🥅" />
      </div>

      <div className="grid gap-4 grid-cols-3">
        <Stat label="Live now" value={live} icon="🔴" />
        <Stat label="Played" value={finished} icon="✅" />
        <Stat label="Upcoming" value={scheduled} icon="🗓️" />
      </div>

      <div className="card p-6">
        <h3 className="font-display text-xl mb-3">Quick actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/teams" className="btn-primary">Manage Teams</Link>
          <Link to="/admin/players" className="btn-ghost">Manage Players</Link>
          <Link to="/admin/matches" className="btn-ghost">Schedule & Score Matches</Link>
        </div>
        <p className="text-white/40 text-sm mt-4">
          Every change you make here is saved to Supabase and pushed live to fans instantly.
        </p>
      </div>
    </div>
  )
}
