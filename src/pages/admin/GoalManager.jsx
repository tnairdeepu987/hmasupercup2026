import { useMemo, useState } from 'react'
import { insertRow, deleteRow, clean } from '../../lib/db.js'

const EMPTY = { team_id: '', scorer_id: '', assist_id: '', minute: '', is_penalty: false, is_own_goal: false }

export default function GoalManager({ match, homeTeam, awayTeam, players, goals, refresh }) {
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
    setForm((f) => ({ ...f, [k]: v, ...(k === 'team_id' ? { scorer_id: '', assist_id: '' } : {}) }))
  }

  const addGoal = async (e) => {
    e.preventDefault()
    if (!form.team_id) { setMsg('Pick a team.'); return }
    setBusy(true); setMsg('')
    try {
      const payload = clean(
        { ...form, match_id: match.id },
        ['minute']
      )
      // keep booleans as booleans (clean turns false into false, fine)
      payload.is_penalty = !!form.is_penalty
      payload.is_own_goal = !!form.is_own_goal
      await insertRow('goals', payload)
      await refresh()
      setForm((f) => ({ ...EMPTY, team_id: f.team_id }))
      setMsg('Goal added ✓')
    } catch (err) {
      setMsg('Error: ' + err.message)
    } finally {
      setBusy(false)
    }
  }

  const removeGoal = async (g) => {
    try { await deleteRow('goals', g.id); await refresh() }
    catch (err) { setMsg('Error: ' + err.message) }
  }

  if (teamOptions.length < 2) {
    return <p className="text-white/40 text-sm py-3">Assign both teams to this match before adding goals.</p>
  }

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_1fr] pt-3">
      {/* existing goals */}
      <div>
        <h4 className="text-white/60 text-sm font-semibold mb-2">Recorded goals</h4>
        {goals.length === 0 ? (
          <p className="text-white/40 text-sm">None yet.</p>
        ) : (
          <div className="space-y-1">
            {goals.map((g) => (
              <div key={g.id} className="flex items-center justify-between gap-2 text-sm bg-white/5 rounded-lg px-3 py-1.5">
                <span>
                  <span className="mr-1">{teamFlag(g.team_id)}</span>
                  <span className="font-semibold">{playerName(g.scorer_id)}</span>
                  <span className="text-white/40"> {g.minute}'</span>
                  {g.is_penalty && <span className="text-gold text-xs ml-1">(pen)</span>}
                  {g.is_own_goal && <span className="text-red-300 text-xs ml-1">(OG)</span>}
                  {g.assist_id && <span className="text-white/40 text-xs ml-1">· assist {playerName(g.assist_id)}</span>}
                </span>
                <button className="text-red-300 hover:text-red-200 text-xs" onClick={() => removeGoal(g)}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* add goal */}
      <form onSubmit={addGoal} className="space-y-2">
        <h4 className="text-white/60 text-sm font-semibold mb-2">Add a goal</h4>
        <select className="input py-1.5" value={form.team_id} onChange={set('team_id')} required>
          <option value="">Scoring team…</option>
          {teamOptions.map((t) => <option key={t.id} value={t.id}>{t.flag_emoji} {t.name}</option>)}
        </select>
        <select className="input py-1.5" value={form.scorer_id} onChange={set('scorer_id')} disabled={!form.team_id}>
          <option value="">Scorer…</option>
          {squad.map((p) => <option key={p.id} value={p.id}>#{p.jersey_number ?? '–'} {p.name}</option>)}
        </select>
        <select className="input py-1.5" value={form.assist_id} onChange={set('assist_id')} disabled={!form.team_id}>
          <option value="">Assist (optional)…</option>
          {squad.map((p) => <option key={p.id} value={p.id}>#{p.jersey_number ?? '–'} {p.name}</option>)}
        </select>
        <div className="flex items-center gap-3">
          <input className="input py-1.5 max-w-[90px]" type="number" min="0" max="130" placeholder="min'" value={form.minute} onChange={set('minute')} />
          <label className="flex items-center gap-1 text-xs text-white/70">
            <input type="checkbox" checked={form.is_penalty} onChange={set('is_penalty')} /> Penalty
          </label>
          <label className="flex items-center gap-1 text-xs text-white/70">
            <input type="checkbox" checked={form.is_own_goal} onChange={set('is_own_goal')} /> Own goal
          </label>
        </div>
        <button className="btn-primary py-1.5 text-sm w-full" disabled={busy}>
          {busy ? 'Adding…' : 'Add goal'}
        </button>
        {msg && <p className="text-xs text-white/50">{msg}</p>}
        <p className="text-white/30 text-[11px]">
          Note: adding a goal here does not change the scoreline automatically — set the final score
          in the match form so it stays accurate even with own goals.
        </p>
      </form>
    </div>
  )
}
