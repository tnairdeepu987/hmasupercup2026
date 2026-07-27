import { useState } from 'react'
import { useData } from '../../context/DataContext.jsx'
import { insertRow, updateRow, deleteRow, clean } from '../../lib/db.js'

const EMPTY = { name: '', short_name: '', group_label: '', flag_emoji: '', logo_url: '' }

export default function AdminTeams() {
  const { teams, refresh } = useData()
  const [form, setForm] = useState(EMPTY)
  const [editingId, setEditingId] = useState(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const resetForm = () => { setForm(EMPTY); setEditingId(null) }

  const startEdit = (team) => {
    setEditingId(team.id)
    setForm({
      name: team.name || '',
      short_name: team.short_name || '',
      group_label: team.group_label || '',
      flag_emoji: team.flag_emoji || '',
      logo_url: team.logo_url || '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setMsg('')
    try {
      const payload = clean(form)
      if (editingId) await updateRow('teams', editingId, payload)
      else await insertRow('teams', payload)
      await refresh()
      resetForm()
      setMsg('Saved ✓')
    } catch (err) {
      setMsg('Error: ' + err.message)
    } finally {
      setBusy(false)
    }
  }

  const remove = async (team) => {
    if (!window.confirm(`Delete ${team.name}? This also removes its players and goals.`)) return
    try {
      await deleteRow('teams', team.id)
      await refresh()
    } catch (err) {
      setMsg('Error: ' + err.message)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <form onSubmit={submit} className="card p-5 h-fit space-y-4">
        <h3 className="font-display text-xl">{editingId ? 'Edit team' : 'Add a team'}</h3>
        <div>
          <label className="label">Team name *</label>
          <input className="input" value={form.name} onChange={set('name')} required placeholder="Brazil" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Short code</label>
            <input className="input" value={form.short_name} onChange={set('short_name')} placeholder="BRA" maxLength={4} />
          </div>
          <div>
            <label className="label">Group</label>
            <input className="input" value={form.group_label} onChange={set('group_label')} placeholder="A" maxLength={2} />
          </div>
        </div>
        <div>
          <label className="label">Flag emoji</label>
          <input className="input" value={form.flag_emoji} onChange={set('flag_emoji')} placeholder="🇧🇷" />
        </div>
        <div>
          <label className="label">Logo URL (optional)</label>
          <input className="input" value={form.logo_url} onChange={set('logo_url')} placeholder="https://…" />
        </div>

        <div className="flex gap-2">
          <button className="btn-primary flex-1" disabled={busy}>
            {busy ? 'Saving…' : editingId ? 'Update team' : 'Add team'}
          </button>
          {editingId && (
            <button type="button" className="btn-ghost" onClick={resetForm}>Cancel</button>
          )}
        </div>
        {msg && <p className="text-sm text-white/60">{msg}</p>}
      </form>

      <div className="card overflow-hidden h-fit">
        <div className="px-4 py-3 border-b border-white/10 font-semibold">
          {teams.length} teams
        </div>
        <div className="divide-y divide-white/5">
          {teams.length === 0 && <p className="px-4 py-6 text-white/40 text-sm">No teams yet.</p>}
          {teams.map((t) => (
            <div key={t.id} className="px-4 py-3 flex items-center justify-between gap-3">
              <span className="flex items-center gap-3 min-w-0">
                <span className="text-2xl">{t.flag_emoji || '🏳️'}</span>
                <span className="min-w-0">
                  <span className="font-semibold block truncate">{t.name}</span>
                  <span className="text-white/40 text-xs">
                    {t.short_name || '—'} · Group {t.group_label || '—'}
                  </span>
                </span>
              </span>
              <span className="flex gap-2 shrink-0">
                <button className="btn-ghost py-1 px-3 text-sm" onClick={() => startEdit(t)}>Edit</button>
                <button className="btn-danger py-1 px-3 text-sm" onClick={() => remove(t)}>Delete</button>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
