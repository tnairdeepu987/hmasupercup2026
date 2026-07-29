import { Link } from 'react-router-dom'
import { StatusChip, TeamBadge, formatKickoff } from './ui.jsx'
import { STAGE_LABELS } from '../lib/stats.js'

export default function MatchCard({ match, teamMap, cautions = [] }) {
  const home = teamMap.get(match.home_team_id)
  const away = teamMap.get(match.away_team_id)
  const matchCautions = cautions.filter((c) => c.match_id === match.id)
  const yellowCount = matchCautions.filter((c) => c.card_type === 'yellow').length
  const redCount = matchCautions.filter((c) => c.card_type === 'red').length
  const showScore = match.status !== 'scheduled'
  const stageText =
    match.stage === 'group'
      ? `Group ${match.group_label || ''}`.trim()
      : STAGE_LABELS[match.stage] || match.stage

  return (
    <Link
      to={`/match/${match.id}`}
      className="card p-4 hover:border-gold/40 transition block"
    >
      <div className="flex items-center justify-between text-xs text-white/50 mb-3">
        <span className="uppercase tracking-wide font-semibold text-white/60">{stageText}</span>
        <StatusChip status={match.status} />
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="justify-self-start">
          <TeamBadge team={home} />
        </div>

        <div className="px-3 text-center">
          {showScore ? (
            <div className="font-display text-2xl tabular-nums">
              {match.home_score}<span className="text-white/40 mx-1">-</span>{match.away_score}
            </div>
          ) : (
            <div className="text-white/40 font-semibold text-sm">vs</div>
          )}
        </div>

        <div className="justify-self-end">
          <TeamBadge team={away} align="right" />
        </div>
      </div>

      <div className="mt-3 text-xs text-white/40 flex items-center justify-between gap-2">
        <span>🗓️ {formatKickoff(match.match_date)}</span>
        <div className="flex items-center gap-2 text-right">
          {matchCautions.length > 0 && (
            <span className="text-white/60">
              {yellowCount > 0 && <span className="mr-2">🟨 {yellowCount}</span>}
              {redCount > 0 && <span>🟥 {redCount}</span>}
            </span>
          )}
          {match.venue && <span className="truncate max-w-[55%]">📍 {match.venue}</span>}
        </div>
      </div>
    </Link>
  )
}
