import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js'

const DataContext = createContext(null)

const TABLES = ['teams', 'players', 'matches', 'goals']

export function DataProvider({ children }) {
  const [teams, setTeams] = useState([])
  const [players, setPlayers] = useState([])
  const [matches, setMatches] = useState([])
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      setError('not-configured')
      return
    }
    try {
      const [t, p, m, g] = await Promise.all([
        supabase.from('teams').select('*').order('group_label').order('name'),
        supabase.from('players').select('*').order('jersey_number'),
        supabase.from('matches').select('*').order('match_date'),
        supabase.from('goals').select('*').order('minute'),
      ])
      const firstErr = t.error || p.error || m.error || g.error
      if (firstErr) throw firstErr
      setTeams(t.data ?? [])
      setPlayers(p.data ?? [])
      setMatches(m.data ?? [])
      setGoals(g.data ?? [])
      setError(null)
    } catch (err) {
      console.error('[HMA Super Cup] data load failed:', err)
      setError(err.message || 'load-failed')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()

    if (!isSupabaseConfigured) return

    // One realtime channel for all tables -> live updates everywhere.
    const channel = supabase.channel('hma-super-cup-live')
    TABLES.forEach((table) => {
      channel.on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        refresh()
      })
    })
    channel.subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [refresh])

  return (
    <DataContext.Provider
      value={{ teams, players, matches, goals, loading, error, refresh }}
    >
      {children}
    </DataContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useData = () => {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
