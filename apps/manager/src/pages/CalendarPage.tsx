import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Game, Match, RsvpStatus, Session, SessionRsvp } from '@lignezero/types';
import { db } from '@/lib/supabase';
import { useAuth } from '@/auth/AuthProvider';
import { Button, Spinner } from '@/components/ui';
import { ResourceForm } from '@/resources/engine';
import { matchesConfig } from '@/resources/configs';
import { SessionForm } from '@/pages/SessionsPage';
import {
  type CalEvent,
  KIND_META,
  addDays,
  buildEvents,
  mondayOf,
  sameDay,
  weekLabel,
} from '@/lib/calendar';

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const RSVPS: { id: RsvpStatus; label: string; tone: string }[] = [
  { id: 'yes', label: 'Présent', tone: 'var(--signal-ok)' },
  { id: 'maybe', label: '?', tone: 'var(--signal-warn)' },
  { id: 'no', label: 'Absent', tone: 'var(--accent)' },
];

export function CalendarPage() {
  const { isPerf, playerId } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [rsvp, setRsvp] = useState<SessionRsvp[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [weekStart, setWeekStart] = useState<Date>(() => mondayOf(new Date()));
  const [editSession, setEditSession] = useState<Partial<Session> | null>(null);
  const [editMatch, setEditMatch] = useState<{ draft: Record<string, string>; isNew: boolean } | null>(null);
  const [matchCtx, setMatchCtx] = useState<Record<string, unknown>>({});

  async function refresh() {
    setError(null);
    try {
      const [ms, ss, gs, rs, ctx] = await Promise.all([
        db.listMatches(),
        db.listSessions(),
        db.listGames(),
        db.listRsvp(),
        matchesConfig.loadContext ? matchesConfig.loadContext() : Promise.resolve({}),
      ]);
      setMatches(ms);
      setSessions(ss);
      setGames(gs);
      setRsvp(rs);
      setMatchCtx(ctx);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLoaded(true);
    }
  }
  useEffect(() => {
    refresh();
  }, []);

  const events = useMemo(() => buildEvents(matches, sessions, games), [matches, sessions, games]);
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const today = useMemo(() => new Date(), []);

  const eventsOfDay = (day: Date) => events.filter((e) => sameDay(e.start, day));
  const weekCount = events.filter((e) => e.start >= weekStart && e.start < addDays(weekStart, 7)).length;

  const myStatus = (sid: string) => rsvp.find((r) => r.sessionId === sid && r.playerId === playerId)?.status;
  const counts = (sid: string) => {
    const r = rsvp.filter((x) => x.sessionId === sid);
    return { yes: r.filter((x) => x.status === 'yes').length, maybe: r.filter((x) => x.status === 'maybe').length };
  };

  async function setMyRsvp(sid: string, status: RsvpStatus) {
    if (!playerId) return;
    await db.setRsvp({ sessionId: sid, playerId, status });
    refresh();
  }

  function openEdit(e: CalEvent) {
    if (!isPerf) return;
    if (e.source === 'session') setEditSession(e.raw as Session);
    else setEditMatch({ draft: matchesConfig.toDraft(e.raw as Match), isNew: false });
  }

  function addSession(day?: Date) {
    const base = day ? new Date(day) : new Date();
    if (day) base.setHours(19, 0, 0, 0);
    setEditSession({ kind: 'practice', startsAt: base.toISOString().slice(0, 16) });
  }

  if (!loaded) return <Spinner label="Chargement du calendrier…" />;

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="hud-label text-[11px]">MTC // Calendrier</p>
          <h1 className="font-display text-3xl font-bold uppercase tracking-hud">Calendrier</h1>
          <p className="mt-1 font-mono text-xs text-[color:var(--text-dim)]">
            &gt; {weekLabel(weekStart)} · {weekCount} événement{weekCount > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex">
            <button onClick={() => setWeekStart((d) => addDays(d, -7))} className="border border-line-strong px-3 py-2 font-mono text-xs text-[color:var(--text-dim)] hover:border-line-bright">←</button>
            <button onClick={() => setWeekStart(mondayOf(new Date()))} className="border-y border-line-strong px-3 py-2 font-mono text-[11px] uppercase tracking-hud text-[color:var(--text-dim)] hover:border-line-bright">Cette semaine</button>
            <button onClick={() => setWeekStart((d) => addDays(d, 7))} className="border border-line-strong px-3 py-2 font-mono text-xs text-[color:var(--text-dim)] hover:border-line-bright">→</button>
          </div>
          {isPerf && (
            <>
              <Button variant="ghost" onClick={() => addSession()}>+ Événement</Button>
              <Button onClick={() => setEditMatch({ draft: { ...matchesConfig.emptyDraft }, isNew: true })}>+ Match</Button>
            </>
          )}
        </div>
      </header>

      {error && <p className="mb-4 border border-[color:var(--accent)] px-3 py-2 font-mono text-xs text-accent">{error}</p>}

      {/* Légende */}
      <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1.5">
        {Object.entries(KIND_META).map(([k, meta]) => (
          <span key={k} className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-hud text-[color:var(--text-mute)]">
            <span className="inline-block h-2.5 w-2.5" style={{ background: meta.color }} />
            {meta.label}
          </span>
        ))}
      </div>

      {/* Grille semaine */}
      <div className="overflow-x-auto">
        <div className="grid min-w-[900px] grid-cols-7 gap-2">
          {days.map((day) => {
            const dayEvents = eventsOfDay(day);
            const isToday = sameDay(day, today);
            return (
              <div key={day.toISOString()} className={`min-h-[420px] border ${isToday ? 'border-accent' : 'border-line-strong'} bg-base-800/40`}>
                <div className={`flex items-baseline justify-between border-b px-2.5 py-2 ${isToday ? 'border-accent bg-accent/10' : 'border-line-strong'}`}>
                  <span className="font-mono text-[11px] uppercase tracking-hud text-[color:var(--text-dim)]">
                    {DAY_LABELS[(day.getDay() + 6) % 7]}
                  </span>
                  <span className={`font-display text-lg font-bold ${isToday ? 'text-accent' : 'text-[color:var(--text)]'}`}>{day.getDate()}</span>
                </div>

                <div className="space-y-2 p-2">
                  {dayEvents.length === 0 && (
                    <button
                      onClick={() => isPerf && addSession(day)}
                      className={`w-full py-6 text-center font-mono text-[10px] text-[color:var(--text-mute)] ${isPerf ? 'hover:text-accent' : 'cursor-default'}`}
                    >
                      {isPerf ? '+ ajouter' : '—'}
                    </button>
                  )}
                  {dayEvents.map((e) => (
                    <EventCard
                      key={e.id}
                      e={e}
                      canEdit={isPerf}
                      onEdit={() => openEdit(e)}
                      playerId={playerId}
                      myStatus={e.source === 'session' ? myStatus((e.raw as Session).id) : undefined}
                      counts={e.source === 'session' ? counts((e.raw as Session).id) : undefined}
                      onRsvp={(status) => setMyRsvp((e.raw as Session).id, status)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {editSession && (
        <SessionForm
          draft={editSession}
          games={games}
          onClose={() => setEditSession(null)}
          onSaved={() => {
            setEditSession(null);
            refresh();
          }}
        />
      )}
      {editMatch && (
        <ResourceForm
          config={matchesConfig}
          ctx={matchCtx}
          draft={editMatch.draft}
          isNew={editMatch.isNew}
          onClose={() => setEditMatch(null)}
          onSaved={() => {
            setEditMatch(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}

function EventCard({
  e,
  canEdit,
  onEdit,
  playerId,
  myStatus,
  counts,
  onRsvp,
}: {
  e: CalEvent;
  canEdit: boolean;
  onEdit: () => void;
  playerId: string | null;
  myStatus?: RsvpStatus;
  counts?: { yes: number; maybe: number };
  onRsvp: (status: RsvpStatus) => void;
}) {
  const meta = KIND_META[e.type];
  const time = e.start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const isSession = e.source === 'session';
  const isMatch = e.source === 'match';

  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] uppercase tracking-hud" style={{ color: meta.color }}>{time} · {meta.label}</span>
        {e.gameTag && <span className="font-mono text-[9px] text-[color:var(--text-mute)]">{e.gameTag}</span>}
      </div>
      <p className="mt-0.5 truncate font-display text-sm font-bold uppercase text-[color:var(--text)]">{e.title}</p>
      {e.sub && e.sub !== meta.label && <p className="truncate font-mono text-[10px] text-[color:var(--text-mute)]">{e.sub}</p>}
      {e.location && <p className="truncate font-mono text-[10px] text-[color:var(--text-dim)]">📍 {e.location}</p>}
    </>
  );

  return (
    <div className="bg-base-900/70 shadow-ink" style={{ borderLeft: `3px solid ${meta.color}` }}>
      {isMatch ? (
        <div className="relative">
          <Link to={`/matches/${(e.raw as Match).id}`} className="block w-full px-2.5 py-2 text-left hover:bg-base-700/50">
            {body}
          </Link>
          {canEdit && (
            <button
              type="button"
              onClick={onEdit}
              title="Éditer le match"
              className="absolute right-1.5 top-1.5 font-mono text-[10px] text-[color:var(--text-mute)] hover:text-accent"
            >
              ✎
            </button>
          )}
        </div>
      ) : (
        <button onClick={onEdit} disabled={!canEdit} className={`block w-full px-2.5 py-2 text-left ${canEdit ? 'hover:bg-base-700/50' : 'cursor-default'}`}>
          {body}
        </button>
      )}

      {isSession && playerId && (
        <div className="flex items-center gap-1 border-t border-line px-2 py-1.5">
          {RSVPS.map((r) => (
            <button
              key={r.id}
              onClick={() => onRsvp(r.id)}
              className="flex-1 py-1 font-mono text-[10px] uppercase transition-colors"
              style={myStatus === r.id ? { background: r.tone, color: '#0d0d0b' } : { color: 'var(--text-mute)', border: '1px solid var(--line)' }}
              title={r.label}
            >
              {r.id === 'yes' ? '✓' : r.id === 'maybe' ? '?' : '✕'}
            </button>
          ))}
          {counts && (
            <span className="ml-1 shrink-0 font-mono text-[9px] text-[color:var(--text-mute)]">
              {counts.yes}✓{counts.maybe ? ` ${counts.maybe}?` : ''}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
