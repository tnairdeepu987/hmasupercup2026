import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'
import { teamMap as buildTeamMap, playerMap as buildPlayerMap, goalsForMatch, cautionsForMatch, STAGE_LABELS } from '../lib/stats.js'
import { Loader, StatusChip, EmptyState, formatKickoff, TeamBadge } from '../components/ui.jsx'

export default function MatchDetail() {
  const { id } = useParams()
  const { matches, teams, players, goals, cautions, loading } = useData()

  const tMap = useMemo(() => buildTeamMap(teams), [teams])
  const pMap = useMemo(() => buildPlayerMap(players), [players])

  const match = matches.find((m) => m.id === id)
  const matchGoals = useMemo(() => (match ? goalsForMatch(goals, match.id) : []), [goals, match])
  const matchCautions = useMemo(() => (match ? cautionsForMatch(cautions, match.id) : []), [cautions, match])

  if (loading) return <Loader />
  if (!match) return <EmptyState icon="❓" title="Match not found"><Link to="/fixtures" className="text-gold hover:underline">Back to fixtures</Link></EmptyState>

  const home = tMap.get(match.home_team_id)
  const away = tMap.get(match.away_team_id)
  const stageText = match.stage === 'group' ? `Group ${match.group_label || ''}`.trim() : STAGE_LABELS[match.stage] || match.stage

  const homeGoals = matchGoals.filter((g) => g.team_id === match.home_team_id)
  const awayGoals = matchGoals.filter((g) => g.team_id === match.away_team_id)
  const homeCautions = matchCautions.filter((c) => c.team_id === match.home_team_id)
  const awayCautions = matchCautions.filter((c) => c.team_id === match.away_team_id)

  const goalLine = (g) => {
    const scorer = pMap.get(g.scorer_id)
    const assist = pMap.get(g.assist_id)
    return (
      <div key={g.id} className="text-sm py-1">
        <span className="font-semibold">{scorer?.name || 'Unknown'}</span>
        <span className="text-white/40"> {g.minute}'</span>
        {g.is_penalty && <span className="text-gold text-xs ml-1">(pen)</span>}
        {g.is_own_goal && <span className="text-red-300 text-xs ml-1">(OG)</span>}
        {assist && <span className="text-white/40 text-xs block">assist: {assist.name}</span>}
      </div>
    )
  }

  const cautionLine = (c) => {
    const player = pMap.get(c.player_id)
    return (
      <div key={c.id} className="text-sm py-1">
        <span className="font-semibold">{player?.name || 'Unknown'}</span>
        <span className="text-white/40"> {c.minute}'</span>
        <span className={c.card_type === 'red' ? 'text-red-300 text-xs ml-1' : 'text-yellow-300 text-xs ml-1'}>
          {c.card_type === 'red' ? 'Red card' : 'Yellow card'}
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Link to="/fixtures" className="text-sm text-white/50 hover:text-white">← Back to fixtures</Link>

      <div className="card p-6">
        <div className="flex items-center justify-between text-xs text-white/50 mb-6">
          <span className="uppercase tracking-wide font-semibold">{stageText}</span>
          <StatusChip status={match.status} />
        </div>

        <div className="grid grid-cols-3 items-center gap-4">
          <div className="text-center">
            <div className="flex justify-center">
              <TeamBadge team={home} big />
            </div>
          </div>
          <div className="text-center">
            {match.status !== 'scheduled' ? (
              <div className="font-display text-5xl tabular-nums">
                {match.home_score}<span className="text-white/30 mx-2">-</span>{match.away_score}
              </div>
            ) : (
              <div className="text-white/40 font-display text-2xl">VS</div>
            )}
          </div>
          <div className="text-center">
            <div className="flex justify-center">
              <TeamBadge team={away} big />
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 text-center text-sm text-white/50 space-y-1">
          <div>🗓️ {formatKickoff(match.match_date)}</div>
          {match.venue && <div>📍 {match.venue}</div>}
        </div>
      </div>

      {/* Scorers */}
      <div className="card p-6">
        <h3 className="font-display text-xl mb-4">⚽ Goal Scorers</h3>
        {matchGoals.length === 0 ? (
          <p className="text-white/40 text-sm">
            {match.status === 'scheduled' ? 'Match not played yet.' : 'No goals recorded.'}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            <div>{homeGoals.map(goalLine)}</div>
            <div className="text-right">{awayGoals.map(goalLine)}</div>
          </div>
        )}
      </div>

      <div className="card p-6">
        <h3 className="font-display text-xl mb-4">🟨 Cautions</h3>
        {matchCautions.length === 0 ? (
          <p className="text-white/40 text-sm">
            {match.status === 'scheduled' ? 'No cautions recorded yet.' : 'No cautions recorded.'}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            <div>{homeCautions.map(cautionLine)}</div>
            <div className="text-right">{awayCautions.map(cautionLine)}</div>
          </div>
        )}
      </div>
    </div>
  )
}
