// Pure helpers that derive standings / leaderboards from raw rows.
// Keeping these pure makes the UI trivial and always consistent.

export function teamMap(teams) {
  const m = new Map()
  teams.forEach((t) => m.set(t.id, t))
  return m
}

export function playerMap(players) {
  const m = new Map()
  players.forEach((p) => m.set(p.id, p))
  return m
}

// Compute group standings from FINISHED group-stage matches.
export function computeStandings(teams, matches) {
  const rows = new Map()
  teams.forEach((t) => {
    rows.set(t.id, {
      team: t,
      played: 0, won: 0, drawn: 0, lost: 0,
      gf: 0, ga: 0, gd: 0, points: 0,
    })
  })

  matches
    .filter((m) => m.stage === 'group' && m.status === 'finished' && m.home_team_id && m.away_team_id)
    .forEach((m) => {
      const home = rows.get(m.home_team_id)
      const away = rows.get(m.away_team_id)
      if (!home || !away) return
      const hs = m.home_score ?? 0
      const as = m.away_score ?? 0
      home.played++; away.played++
      home.gf += hs; home.ga += as
      away.gf += as; away.ga += hs
      if (hs > as) { home.won++; home.points += 3; away.lost++ }
      else if (hs < as) { away.won++; away.points += 3; home.lost++ }
      else { home.drawn++; away.drawn++; home.points++; away.points++ }
    })

  rows.forEach((r) => { r.gd = r.gf - r.ga })

  // Group by group_label
  const byGroup = {}
  rows.forEach((r) => {
    const g = r.team.group_label || '—'
    if (!byGroup[g]) byGroup[g] = []
    byGroup[g].push(r)
  })

  Object.values(byGroup).forEach((list) => {
    list.sort((a, b) =>
      b.points - a.points ||
      b.gd - a.gd ||
      b.gf - a.gf ||
      a.team.name.localeCompare(b.team.name)
    )
  })

  return byGroup // { A: [rows...], B: [...] }
}

// Golden boot leaderboard (goals per player, excluding own goals).
export function goldenBoot(goals, players, teams) {
  const pMap = playerMap(players)
  const tMap = teamMap(teams)
  const tally = new Map()

  goals
    .filter((g) => !g.is_own_goal && g.scorer_id)
    .forEach((g) => {
      const entry = tally.get(g.scorer_id) || { goals: 0, penalties: 0 }
      entry.goals++
      if (g.is_penalty) entry.penalties++
      tally.set(g.scorer_id, entry)
    })

  return [...tally.entries()]
    .map(([playerId, e]) => {
      const player = pMap.get(playerId)
      return {
        player,
        team: player ? tMap.get(player.team_id) : null,
        goals: e.goals,
        penalties: e.penalties,
      }
    })
    .filter((r) => r.player)
    .sort((a, b) => b.goals - a.goals || a.penalties - b.penalties || a.player.name.localeCompare(b.player.name))
}

// Assists leaderboard.
export function assistLeaders(goals, players, teams) {
  const pMap = playerMap(players)
  const tMap = teamMap(teams)
  const tally = new Map()

  goals
    .filter((g) => g.assist_id)
    .forEach((g) => tally.set(g.assist_id, (tally.get(g.assist_id) || 0) + 1))

  return [...tally.entries()]
    .map(([playerId, count]) => {
      const player = pMap.get(playerId)
      return { player, team: player ? tMap.get(player.team_id) : null, assists: count }
    })
    .filter((r) => r.player)
    .sort((a, b) => b.assists - a.assists || a.player.name.localeCompare(b.player.name))
}

export const STAGE_LABELS = {
  group: 'Group Stage',
  round16: 'Round of 16',
  quarter: 'Quarter-final',
  semi: 'Semi-final',
  third_place: 'Third-place Play-off',
  final: 'Final',
}

export const KNOCKOUT_ORDER = ['round16', 'quarter', 'semi', 'third_place', 'final']

export function goalsForMatch(goals, matchId) {
  return goals
    .filter((g) => g.match_id === matchId)
    .sort((a, b) => (a.minute ?? 0) - (b.minute ?? 0))
}

export function cautionsForMatch(cautions, matchId) {
  return cautions
    .filter((c) => c.match_id === matchId)
    .sort((a, b) => (a.minute ?? 0) - (b.minute ?? 0))
}
