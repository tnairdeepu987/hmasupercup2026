import { useMemo, useState } from 'react'
import { insertRow, deleteRow, clean } from '../../lib/db.js'

const EMPTY = { team_id: '', player_id: '', card_type: 'yellow', minute: '' }

export default function CautionManager({ match, homeTeam, awayTeam, players, cautions, refresh }) {
  const [form, setForm] = useState(EMPTY)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  const teamOptions = [homeTeam, awayTeam].filter(Boolean)
  const squad = useMemo(
    () => players.filter((p) => p.team_id === form.team_id),
    [players, form.team_id]
  )

  const playerName = (id) => players.find((p) => p.id === id)?.name || 'Unknown'
  const teamFlag = (id) => teamOptions.find((t) => t.id === id)?.flag_emoji || '⚪'

  const set = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [k]: v, ...(k === 'team_id' ? { player_id: '' } : {}) }))
  }

  const addCaution = async (e) => {
    e.preventDefault()
    if (!form.team_id || !form.player_id) {
      setMsg('Pick a team and player first.')
      return
    }

    setBusy(true)
    setMsg('')
    try {
      const payload = clean({ ...form, match_id: match.id }, ['minute'])
      payload.card_type = form.card_type || 'yellow'
      await insertRow('cautions', payload)
      await refresh()
      setForm((f) => ({ ...EMPTY, team_id: f.team_id }))
      setMsg('Card added ✓')
    } catch (err) {
      setMsg('Error: ' + err.message)
    } finally {
      setBusy(false)
    }
  }

  const removeCaution = async (c) => {
    try { await deleteRow('cautions', c.id); await refresh() }
    catch (err) { setMsg('Error: ' + err.message) }
  }

  if (teamOptions.length < 2) {
    return <p className="text-white/40 text-sm py-3">Assign both teams to this match before adding cautions.</p>
  }

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_1fr] pt-3">
      <div>
        <h4 className="text-white/60 text-sm font-semibold mb-2">Recorded cautions</h4>
        {cautions.length === 0 ? (
          <p className="text-white/40 text-sm">None yet.</p>
        ) : (
          <div className="space-y-1">
            {cautions.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-2 text-sm bg-white/5 rounded-lg px-3 py-1.5">
                <span>
                  <span className="mr-1">{teamFlag(c.team_id)}</span>
                  <span className="font-semibold">{playerName(c.player_id)}</span>
                  <span className="text-white/40"> {c.minute}'</span>
                  <span className={c.card_type === 'red' ? 'text-red-300 ml-1' : 'text-yellow-300 ml-1'}>
                    {c.card_type === 'red' ? 'Red card' : 'Yellow card'}
                  </span>
                </span>
                <button className="text-red-300 hover:text-red-200 text-xs" onClick={() => removeCaution(c)}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={addCaution} className="space-y-2">
        <h4 className="text-white/60 text-sm font-semibold mb-2">Add a caution</h4>
        <select className="input py-1.5" value={form.team_id} onChange={set('team_id')} required>
          <option value="">Team…</option>
          {teamOptions.map((t) => <option key={t.id} value={t.id}>{t.flag_emoji} {t.name}</option>)}
        </select>
        <select className="input py-1.5" value={form.player_id} onChange={set('player_id')} disabled={!form.team_id} required>
          <option value="">Player…</option>
          {squad.map((p) => <option key={p.id} value={p.id}>#{p.jersey_number ?? '–'} {p.name}</option>)}
        </select>
        <select className="input py-1.5" value={form.card_type} onChange={set('card_type')}>
          <option value="yellow">Yellow card</option>
          <option value="red">Red card</option>
        </select>
        <input className="input py-1.5 max-w-[90px]" type="number" min="0" max="130" placeholder="min'" value={form.minute} onChange={set('minute')} />
        <button className="btn-primary py-1.5 text-sm w-full" disabled={busy}>
          {busy ? 'Adding…' : 'Add caution'}
        </button>
        {msg && <p className="text-xs text-white/50">{msg}</p>}
      </form>
    </div>
  )
}
