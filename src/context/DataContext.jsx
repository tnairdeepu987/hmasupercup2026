import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js'

const DataContext = createContext(null)

const TABLES = ['teams', 'players', 'matches', 'goals', 'cautions']

export function DataProvider({ children }) {
  const [teams, setTeams] = useState([])
  const [players, setPlayers] = useState([])
  const [matches, setMatches] = useState([])
  const [goals, setGoals] = useState([])
  const [cautions, setCautions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      setError('not-configured')
      return
    }
    try {
      const [t, p, m, g, c] = await Promise.allSettled([
        supabase.from('teams').select('*').order('group_label').order('name'),
        supabase.from('players').select('*').order('jersey_number'),
        supabase.from('matches').select('*').order('match_date'),
        supabase.from('goals').select('*').order('minute'),
        supabase.from('cautions').select('*').order('minute'),
      ])

      const teamData = t.status === 'fulfilled' ? (t.value.data ?? []) : []
      const playerData = p.status === 'fulfilled' ? (p.value.data ?? []) : []
      const matchData = m.status === 'fulfilled' ? (m.value.data ?? []) : []
      const goalData = g.status === 'fulfilled' ? (g.value.data ?? []) : []
      const cautionData = c.status === 'fulfilled' ? (c.value.data ?? []) : []

      const firstError = [t, p, m, g, c].find((r) => r.status === 'rejected')?.reason
      const hasAnyData = teamData.length || playerData.length || matchData.length || goalData.length

      setTeams(teamData)
      setPlayers(playerData)
      setMatches(matchData)
      setGoals(goalData)
      setCautions(cautionData)
      setError(firstError && !hasAnyData ? (firstError.message || 'load-failed') : null)

      if (firstError) {
        console.warn('[HMA Super Cup] one or more tables were unavailable, continuing with the rest of the data:', firstError)
      }
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
      value={{ teams, players, matches, goals, cautions, loading, error, refresh }}
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
