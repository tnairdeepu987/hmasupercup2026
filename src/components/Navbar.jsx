import { NavLink, Link } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/fixtures', label: 'Fixtures' },
  { to: '/standings', label: 'Standings' },
  { to: '/bracket', label: 'Bracket' },
  { to: '/stats', label: 'Golden Boot' },
  { to: '/teams', label: 'Teams' },
]

export default function Navbar() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-semibold transition ${
      isActive ? 'bg-gold text-ink' : 'text-white/70 hover:text-white hover:bg-white/10'
    }`

  return (
    <header className="sticky top-0 z-40 bg-ink/90 backdrop-blur border-b border-white/10">
      <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl">⚽</span>
          <span className="font-display text-lg leading-none">
            HMA <span className="text-gold">Super Cup</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <NavLink to={user ? '/admin' : '/login'} className="btn-ghost text-sm py-1.5">
            {user ? 'Admin Panel' : 'Admin Login'}
          </NavLink>
        </div>

        <button
          className="md:hidden btn-ghost py-1.5 px-3"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </nav>

      {open && (
        <div className="md:hidden border-t border-white/10 px-4 py-3 flex flex-col gap-1 bg-ink">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass} onClick={() => setOpen(false)}>
              {l.label}
            </NavLink>
          ))}
          <NavLink to={user ? '/admin' : '/login'} className={linkClass} onClick={() => setOpen(false)}>
            {user ? 'Admin Panel' : 'Admin Login'}
          </NavLink>
        </div>
      )}
    </header>
  )
}
