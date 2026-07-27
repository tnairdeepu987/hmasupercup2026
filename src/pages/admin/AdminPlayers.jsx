import { useMemo, useState } from 'react'
import { useData } from '../../context/DataContext.jsx'
import { insertRow, updateRow, deleteRow, clean } from '../../lib/db.js'

const POSITIONS = ['GK', 'DEF', 'MID', 'FWD']
const EMPTY = { team_id: '', name: '', position: 'FWD', jersey_number: '' }

export default function AdminPlayers() {
  const { teams, players, refresh } = useData()
  const [form, setForm] = useState(EMPTY)
  const [editingId, setEditingId] = useState(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [teamFilter, setTeamFilter] = useState('all')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const resetForm = () => { setForm((f) => ({ ...EMPTY, team_id: f.team_id })); setEditingId(null) }

  const teamName = (id) => teams.find((t) => t.id === id)?.name || 'Unknown'

  const visible = useMemo(
    () => players.filter((p) => (teamFilter === 'all' ? true : p.team_id === teamFilter)),
    [players, teamFilter]
  )

  const startEdit = (p) => {
    setEditingId(p.id)
    setForm({
      team_id: p.team_id || '',
      name: p.name || '',
      position: p.position || 'FWD',
      jersey_number: p.jersey_number ?? '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setMsg('')
    try {
      const payload = clean(form, ['jersey_number'])
      if (editingId) await updateRow('players', editingId, payload)
      else await insertRow('players', payload)
      await refresh()
      resetForm()
      setMsg('Saved ✓')
    } catch (err) {
      setMsg('Error: ' + err.message)
    } finally {
      setBusy(false)
    }
  }

  const remove = async (p) => {
    if (!window.confirm(`Delete ${p.name}?`)) return
    try { await deleteRow('players', p.id); await refresh() }
    catch (err) { setMsg('Error: ' + err.message) }
  }

  const noTeams = teams.length === 0

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <form onSubmit={submit} className="card p-5 h-fit space-y-4">
        <h3 className="font-display text-xl">{editingId ? 'Edit player' : 'Add a player'}</h3>
        {noTeams && <p className="text-gold text-sm">Add a team first.</p>}
        <div>
          <label className="label">Team *</label>
          <select className="input" value={form.team_id} onChange={set('team_id')} required disabled={noTeams}>
            <option value="">Select team…</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.flag_emoji} {t.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Player name *</label>
          <input className="input" value={form.name} onChange={set('name')} required placeholder="Vinicius Jr" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Position</label>
            <select className="input" value={form.position} onChange={set('position')}>
              {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Jersey #</label>
            <input className="input" type="number" min="0" value={form.jersey_number} onChange={set('jersey_number')} placeholder="7" />
          </div>
        </div>

        <div className="flex gap-2">
          <button className="btn-primary flex-1" disabled={busy || noTeams}>
            {busy ? 'Saving…' : editingId ? 'Update player' : 'Add player'}
          </button>
          {editingId && <button type="button" className="btn-ghost" onClick={resetForm}>Cancel</button>}
        </div>
        {msg && <p className="text-sm text-white/60">{msg}</p>}
      </form>

      <div className="card overflow-hidden h-fit">
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between gap-3">
          <span className="font-semibold">{visible.length} players</span>
          <select className="input max-w-[180px] py-1" value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)}>
            <option value="all">All teams</option>
            {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div className="divide-y divide-white/5 max-h-[70vh] overflow-y-auto">
          {visible.length === 0 && <p className="px-4 py-6 text-white/40 text-sm">No players.</p>}
          {visible.map((p) => (
            <div key={p.id} className="px-4 py-3 flex items-center justify-between gap-3">
              <span className="min-w-0">
                <span className="font-semibold">
                  <span className="text-white/40 tabular-nums mr-2">#{p.jersey_number ?? '–'}</span>
                  {p.name}
                </span>
                <span className="text-white/40 text-xs block">{p.position} · {teamName(p.team_id)}</span>
              </span>
              <span className="flex gap-2 shrink-0">
                <button className="btn-ghost py-1 px-3 text-sm" onClick={() => startEdit(p)}>Edit</button>
                <button className="btn-danger py-1 px-3 text-sm" onClick={() => remove(p)}>Delete</button>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
