import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

const tabs = [
  { to: '/admin', label: 'Dashboard', end: true, icon: '📊' },
  { to: '/admin/teams', label: 'Teams', icon: '🛡️' },
  { to: '/admin/players', label: 'Players', icon: '👤' },
  { to: '/admin/matches', label: 'Matches & Goals', icon: '⚽' },
]

export default function AdminLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const tabClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
      isActive ? 'bg-gold text-ink' : 'text-white/70 hover:bg-white/10'
    }`

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-gold text-xs font-bold uppercase tracking-widest">Control room</p>
          <h1 className="font-display text-3xl">Admin Panel</h1>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-white/50 hidden sm:inline">{user?.email}</span>
          <button onClick={handleSignOut} className="btn-ghost py-1.5">Sign out</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
        {tabs.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.end} className={tabClass}>
            <span>{t.icon}</span> {t.label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  )
}
