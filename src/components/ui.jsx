export function StatusChip({ status }) {
  if (status === 'live') {
    return (
      <span className="chip-live">
        <span className="live-dot h-1.5 w-1.5 rounded-full bg-red-400" /> LIVE
      </span>
    )
  }
  if (status === 'finished') return <span className="chip-finished">FT</span>
  return <span className="chip-scheduled">Upcoming</span>
}

export function TeamBadge({ team, align = 'left', big = false }) {
  if (!team) {
    return (
      <span className={`text-white/40 italic ${big ? 'text-lg' : 'text-sm'}`}>TBD</span>
    )
  }
  const flag = team.flag_emoji || '🏳️'
  const content = (
    <>
      <span className={big ? 'text-2xl' : 'text-xl'}>{flag}</span>
      <span className={`font-semibold ${big ? 'text-lg' : ''}`}>{team.name}</span>
    </>
  )
  return (
    <span
      className={`inline-flex items-center gap-2 ${
        align === 'right' ? 'flex-row-reverse text-right' : ''
      }`}
    >
      {content}
    </span>
  )
}

export function Loader({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center py-20 text-white/50 gap-3">
      <span className="h-4 w-4 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      {label}
    </div>
  )
}

export function EmptyState({ icon = '📭', title, children }) {
  return (
    <div className="card p-10 text-center text-white/60">
      <div className="text-4xl mb-2">{icon}</div>
      <h3 className="text-white font-semibold text-lg">{title}</h3>
      {children && <p className="mt-1 text-sm">{children}</p>}
    </div>
  )
}

export function SectionTitle({ eyebrow, title, children }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-4">
      <div>
        {eyebrow && (
          <p className="text-gold text-xs font-bold uppercase tracking-widest">{eyebrow}</p>
        )}
        <h2 className="font-display text-2xl md:text-3xl">{title}</h2>
      </div>
      {children}
    </div>
  )
}

export function formatKickoff(iso) {
  if (!iso) return 'TBD'
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
