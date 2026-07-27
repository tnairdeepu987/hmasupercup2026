import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'
import { teamMap as buildTeamMap, KNOCKOUT_ORDER, STAGE_LABELS } from '../lib/stats.js'
import { Loader, SectionTitle, EmptyState, formatKickoff } from '../components/ui.jsx'

function BracketMatch({ match, tMap }) {
  const home = tMap.get(match.home_team_id)
  const away = tMap.get(match.away_team_id)
  const finished = match.status === 'finished'
  const homeWin = finished && match.home_score > match.away_score
  const awayWin = finished && match.away_score > match.home_score

  const Row = ({ team, score, win }) => (
    <div className={`flex items-center justify-between gap-2 px-3 py-2 ${win ? 'text-white font-bold' : 'text-white/70'}`}>
      <span className="flex items-center gap-2 truncate">
        <span>{team?.flag_emoji || '⚪'}</span>
        <span className="truncate">{team?.name || 'TBD'}</span>
      </span>
      <span className="tabular-nums font-display">
        {match.status !== 'scheduled' ? score : ''}
      </span>
    </div>
  )

  return (
    <Link to={`/match/${match.id}`} className="card block w-56 hover:border-gold/40 transition">
      <div className="px-3 py-1 text-[10px] uppercase tracking-wide text-white/40 flex items-center justify-between border-b border-white/10">
        <span>{match.status === 'live' ? 'LIVE' : formatKickoff(match.match_date)}</span>
      </div>
      <Row team={home} score={match.home_score} win={homeWin} />
      <div className="border-t border-white/5" />
      <Row team={away} score={match.away_score} win={awayWin} />
    </Link>
  )
}

export default function Bracket() {
  const { matches, teams, loading } = useData()
  const tMap = useMemo(() => buildTeamMap(teams), [teams])

  const rounds = useMemo(() => {
    return KNOCKOUT_ORDER.filter((s) => s !== 'third_place')
      .map((stage) => ({
        stage,
        label: STAGE_LABELS[stage],
        matches: matches
          .filter((m) => m.stage === stage)
          .sort((a, b) => (a.round_order ?? 0) - (b.round_order ?? 0)),
      }))
      .filter((r) => r.matches.length)
  }, [matches])

  const thirdPlace = matches.filter((m) => m.stage === 'third_place')

  if (loading) return <Loader />
  if (!rounds.length && !thirdPlace.length) {
    return (
      <div className="space-y-6">
        <SectionTitle eyebrow="Knockout stage" title="Bracket" />
        <EmptyState icon="🏆" title="The knockout bracket isn't set yet">
          Once the group stage wraps up, the admin will schedule the knockout matches here.
        </EmptyState>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Knockout stage" title="Road to the Final" />

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-6 md:gap-10 min-w-max items-stretch">
          {rounds.map((round) => (
            <div key={round.stage} className="flex flex-col">
              <h3 className="text-center text-white/60 font-semibold uppercase tracking-wide text-xs mb-3">
                {round.label}
              </h3>
              <div className="flex-1 flex flex-col justify-around gap-4">
                {round.matches.map((m) => (
                  <BracketMatch key={m.id} match={m} tMap={tMap} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {thirdPlace.length > 0 && (
        <div>
          <h3 className="text-white/60 font-semibold uppercase tracking-wide text-xs mb-3">
            {STAGE_LABELS.third_place}
          </h3>
          <div className="flex gap-4">
            {thirdPlace.map((m) => (
              <BracketMatch key={m.id} match={m} tMap={tMap} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
