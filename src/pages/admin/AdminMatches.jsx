import { useMemo, useState } from 'react'
import { useData } from '../../context/DataContext.jsx'
import { insertRow, updateRow, deleteRow, clean } from '../../lib/db.js'
import { teamMap as buildTeamMap, goalsForMatch, STAGE_LABELS } from '../../lib/stats.js'
import GoalManager from './GoalManager.jsx'
import CautionManager from './CautionManager.jsx'

const STAGES = ['group', 'round16', 'quarter', 'semi', 'third_place', 'final']
const STATUSES = ['scheduled', 'live', 'finished']

const EMPTY = {
  stage: 'group', group_label: '', round_order: '',
  home_team_id: '', away_team_id: '',
  match_date: '', venue: '', status: 'scheduled',
  home_score: '', away_score: '',
}

// ISO <-> datetime-local helpers
function isoToLocalInput(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
function localInputToIso(local) {
  if (!local) return null
  return new Date(local).toISOString()
}

export default function AdminMatches() {
  const { teams, matches, goals, cautions, players, refresh } = useData()
  const tMap = useMemo(() => buildTeamMap(teams), [teams])
  const [form, setForm] = useState(EMPTY)
  const [editingId, setEditingId] = useState(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const resetForm = () => { setForm(EMPTY); setEditingId(null) }

  const startEdit = (m) => {
    setEditingId(m.id)
    setForm({
      stage: m.stage || 'group',
      group_label: m.group_label || '',
      round_order: m.round_order ?? '',
      home_team_id: m.home_team_id || '',
      away_team_id: m.away_team_id || '',
      match_date: isoToLocalInput(m.match_date),
      venue: m.venue || '',
      status: m.status || 'scheduled',
      home_score: m.home_score ?? '',
      away_score: m.away_score ?? '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const submit = async (e) => {
    e.preventDefault()
    if (form.home_team_id && form.home_team_id === form.away_team_id) {
      setMsg('Home and away team must be different.')
      return
    }
    setBusy(true); setMsg('')
    try {
      const payload = clean(
        { ...form, match_date: localInputToIso(form.match_date) },
        ['round_order', 'home_score', 'away_score']
      )
      // default scores to 0 so standings math stays clean
      if (payload.home_score === null) payload.home_score = 0
      if (payload.away_score === null) payload.away_score = 0
      if (payload.round_order === null) payload.round_order = 0

      if (editingId) await updateRow('matches', editingId, payload)
      else await insertRow('matches', payload)
      await refresh()
      resetForm()
      setMsg('Saved ✓')
    } catch (err) {
      setMsg('Error: ' + err.message)
    } finally {
      setBusy(false)
    }
  }

  const remove = async (m) => {
    if (!window.confirm('Delete this match and its goals?')) return
    try { await deleteRow('matches', m.id); await refresh() }
    catch (err) { setMsg('Error: ' + err.message) }
  }

  const isGroup = form.stage === 'group'

  return (
    <div className="space-y-6">
      {/* Match form */}
      <form onSubmit={submit} className="card p-5 space-y-4">
        <h3 className="font-display text-xl">{editingId ? 'Edit match' : 'Schedule a match'}</h3>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="label">Stage</label>
            <select className="input" value={form.stage} onChange={set('stage')}>
              {STAGES.map((s) => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
            </select>
          </div>
          {isGroup ? (
            <div>
              <label className="label">Group</label>
              <input className="input" value={form.group_label} onChange={set('group_label')} placeholder="A" maxLength={2} />
            </div>
          ) : (
            <div>
              <label className="label">Round order</label>
              <input className="input" type="number" value={form.round_order} onChange={set('round_order')} placeholder="1" />
            </div>
          )}
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={set('status')}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Kick-off</label>
            <input className="input" type="datetime-local" value={form.match_date} onChange={set('match_date')} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Home team</label>
            <select className="input" value={form.home_team_id} onChange={set('home_team_id')}>
              <option value="">TBD</option>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.flag_emoji} {t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Away team</label>
            <select className="input" value={form.away_team_id} onChange={set('away_team_id')}>
              <option value="">TBD</option>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.flag_emoji} {t.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-end">
          <div>
            <label className="label">Home score</label>
            <input className="input" type="number" min="0" value={form.home_score} onChange={set('home_score')} placeholder="0" />
          </div>
          <div>
            <label className="label">Away score</label>
            <input className="input" type="number" min="0" value={form.away_score} onChange={set('away_score')} placeholder="0" />
          </div>
          <div className="lg:col-span-2">
            <label className="label">Venue</label>
            <input className="input" value={form.venue} onChange={set('venue')} placeholder="MetLife Stadium, New Jersey" />
          </div>
        </div>

        <p className="text-white/40 text-xs">
          Tip: the scoreline shown to fans comes from these score fields. Add individual scorers below
          (in the match list) to power the golden boot and score card.
        </p>

        <div className="flex gap-2">
          <button className="btn-primary" disabled={busy}>
            {busy ? 'Saving…' : editingId ? 'Update match' : 'Add match'}
          </button>
          {editingId && <button type="button" className="btn-ghost" onClick={resetForm}>Cancel</button>}
          {msg && <span className="text-sm text-white/60 self-center">{msg}</span>}
        </div>
      </form>

      {/* Match list */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10 font-semibold">{matches.length} matches</div>
        <div className="divide-y divide-white/5">
          {matches.length === 0 && <p className="px-4 py-6 text-white/40 text-sm">No matches yet.</p>}
          {matches.map((m) => {
            const home = tMap.get(m.home_team_id)
            const away = tMap.get(m.away_team_id)
            const stageText = m.stage === 'group' ? `Group ${m.group_label || ''}`.trim() : STAGE_LABELS[m.stage]
            const mGoals = goalsForMatch(goals, m.id)
            const mCautions = cautions.filter((c) => c.match_id === m.id)
            const expanded = expandedId === m.id
            return (
              <div key={m.id}>
                <div className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs text-white/40 uppercase tracking-wide">
                      {stageText} · <span className={m.status === 'live' ? 'text-red-400' : ''}>{m.status}</span>
                    </div>
                    <div className="font-semibold truncate">
                      {home?.flag_emoji} {home?.name || 'TBD'}
                      <span className="text-gold mx-2 tabular-nums">{m.home_score} - {m.away_score}</span>
                      {away?.name || 'TBD'} {away?.flag_emoji}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button className="btn-ghost py-1 px-3 text-sm" onClick={() => setExpandedId(expanded ? null : m.id)}>
                      ⚽ Goals ({mGoals.length}) · 🟨 {mCautions.length}
                    </button>
                    <button className="btn-ghost py-1 px-3 text-sm" onClick={() => startEdit(m)}>Edit</button>
                    <button className="btn-danger py-1 px-3 text-sm" onClick={() => remove(m)}>Delete</button>
                  </div>
                </div>
                {expanded && (
                  <div className="px-4 pb-4 bg-black/20">
                    <div className="space-y-4">
                      <GoalManager match={m} homeTeam={home} awayTeam={away} players={players} goals={mGoals} refresh={refresh} />
                      <div className="border-t border-white/10 pt-3">
                        <CautionManager match={m} homeTeam={home} awayTeam={away} players={players} cautions={mCautions} refresh={refresh} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
