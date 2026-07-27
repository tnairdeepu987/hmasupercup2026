import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { useData } from '../context/DataContext.jsx'
import { teamMap as buildTeamMap, goldenBoot } from '../lib/stats.js'
import MatchCard from '../components/MatchCard.jsx'
import { Loader, SectionTitle, EmptyState } from '../components/ui.jsx'

export default function Home() {
  const { teams, matches, players, goals, loading, error } = useData()
  const tMap = useMemo(() => buildTeamMap(teams), [teams])

  const live = matches.filter((m) => m.status === 'live')
  const upcoming = matches
    .filter((m) => m.status === 'scheduled')
    .slice(0, 3)
  const topScorer = goldenBoot(goals, players, teams)[0]

  if (loading) return <Loader label="Loading the tournament…" />

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-stadium pitch-stripes border border-white/10">
        <div className="relative px-6 py-14 md:py-20 text-center">
          <p className="text-gold font-bold tracking-[0.3em] uppercase text-sm mb-3">
            World Cup 2026 · The Road to Glory
          </p>
          <h1 className="font-display text-4xl md:text-6xl leading-tight drop-shadow">
            HMA <span className="text-gold">Super Cup</span>
          </h1>
          <p className="mt-4 text-white/70 max-w-xl mx-auto">
            Follow every goal, every fixture and every twist of the tournament — live.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link to="/fixtures" className="btn-primary">View Fixtures</Link>
            <Link to="/standings" className="btn-ghost">Standings</Link>
            <Link to="/bracket" className="btn-ghost">Knockout Bracket</Link>
          </div>
        </div>
      </section>

      {error === 'not-configured' && (
        <EmptyState icon="⚙️" title="Connect your Supabase project">
          The app is running, but no database is connected yet. Follow <code>SETUP.md</code> to
          add your Supabase keys and load the schema.
        </EmptyState>
      )}

      {/* Live now */}
      {live.length > 0 && (
        <section>
          <SectionTitle eyebrow="Happening now" title="Live Matches" />
          <div className="grid gap-4 sm:grid-cols-2">
            {live.map((m) => (
              <MatchCard key={m.id} match={m} teamMap={tMap} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming + Top scorer */}
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <SectionTitle eyebrow="Coming up" title="Next Fixtures">
            <Link to="/fixtures" className="text-sm text-gold hover:underline">All fixtures →</Link>
          </SectionTitle>
          {upcoming.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {upcoming.map((m) => (
                <MatchCard key={m.id} match={m} teamMap={tMap} />
              ))}
            </div>
          ) : (
            <EmptyState icon="🗓️" title="No upcoming fixtures scheduled" />
          )}
        </section>

        <section>
          <SectionTitle eyebrow="Race for the" title="Golden Boot" />
          {topScorer ? (
            <div className="card p-6 text-center">
              <div className="text-5xl mb-2">👟</div>
              <div className="text-3xl">{topScorer.team?.flag_emoji}</div>
              <div className="font-display text-xl mt-1">{topScorer.player.name}</div>
              <div className="text-white/50 text-sm">{topScorer.team?.name}</div>
              <div className="mt-4 inline-flex items-baseline gap-1">
                <span className="font-display text-4xl text-gold">{topScorer.goals}</span>
                <span className="text-white/50">goals</span>
              </div>
              <div className="mt-4">
                <Link to="/stats" className="text-sm text-gold hover:underline">Full leaderboard →</Link>
              </div>
            </div>
          ) : (
            <EmptyState icon="👟" title="No goals scored yet" />
          )}
        </section>
      </div>
    </div>
  )
}
