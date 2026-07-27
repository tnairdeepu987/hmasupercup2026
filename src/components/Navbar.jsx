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
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/95 backdrop-blur-sm">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-3 rounded-full px-2 py-1 transition hover:bg-white/5">
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-white/10">
            <img
              src="/hma.png"
              alt="HMA Super Cup"
              className="h-7 w-7 object-contain"
            />
          </div>
          <span className="font-display text-lg leading-none tracking-wide">
            HMA <span className="text-gold">Super Cup</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </div>

        {/* <div className="hidden items-center gap-2 md:flex">
          <NavLink to={user ? '/admin' : '/login'} className="btn-ghost rounded-full px-4 py-1.5 text-sm">
            {user ? 'Admin Panel' : 'Admin Login'}
          </NavLink>
        </div> */}

        <button
          className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-lg text-white transition hover:bg-white/10 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/10 bg-ink/95 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={linkClass} onClick={() => setOpen(false)}>
                {l.label}
              </NavLink>
            ))}
            {/* <NavLink to={user ? '/admin' : '/login'} className={linkClass} onClick={() => setOpen(false)}>
              {user ? 'Admin Panel' : 'Admin Login'}
            </NavLink> */}
          </div>
        </div>
      )}
    </header>
  )
}
