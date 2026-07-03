import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Feedback, Game, Match, MatchPlayerStat, Player, PlayerStat, VideoAnnotation, VideoReview } from '@lignezero/types';
import { db } from '@/lib/supabase';
import { useAuth } from '@/auth/AuthProvider';
import { Badge, Button, Modal, Panel, Spinner } from '@/components/ui';
import { VideoEmbed, type VideoEmbedHandle } from '@/components/VideoEmbed';
import { formatTimestamp } from '@/lib/video';

/** Hub d'un match : stats par joueur, feedback lié, revues vidéo + checkpoints — tout au même endroit. */
export function MatchHubPage() {
  const { matchId } = useParams();
  const { isPerf } = useAuth();
  const [match, setMatch] = useState<Match | null | undefined>(undefined);
  const [games, setGames] = useState<Game[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [stats, setStats] = useState<MatchPlayerStat[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [reviews, setReviews] = useState<VideoReview[]>([]);
  const [annotationsByReview, setAnnotationsByReview] = useState<Record<string, VideoAnnotation[]>>({});
  const [editingStat, setEditingStat] = useState<Player | null>(null);

  async function refresh() {
    if (!matchId) return;
    const [matches, gs, ps, st, fb, rv] = await Promise.all([
      db.listMatches(),
      db.listGames(),
      db.listPlayers(),
      db.listMatchStats(matchId),
      db.listFeedback(),
      db.listVideoReviews(),
    ]);
    setMatch(matches.find((m) => m.id === matchId) ?? null);
    setGames(gs);
    setPlayers(ps);
    setStats(st);
    setFeedback(fb.filter((f) => f.matchId === matchId));
    const linked = rv.filter((r) => r.matchId === matchId);
    setReviews(linked);
    const lists = await Promise.all(linked.map((r) => db.listVideoAnnotations(r.id)));
    setAnnotationsByReview(Object.fromEntries(linked.map((r, i) => [r.id, lists[i]])));
  }
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  if (match === undefined) return <Spinner label="Chargement du hub…" />;
  if (match === null) {
    return (
      <div>
        <p className="font-mono text-sm text-accent">Match introuvable.</p>
        <Link to="/matches" className="font-mono text-xs text-[color:var(--text-dim)] hover:text-accent">← calendrier</Link>
      </div>
    );
  }

  const game = games.find((g) => g.id === match.gameId);
  const roster = players.filter((p) => p.gameId === match.gameId);
  const statFor = (playerId: string) => stats.find((s) => s.playerId === playerId);
  const playerName = (id: string) => players.find((p) => p.id === id)?.pseudo ?? id;

  return (
    <div>
      <Link to="/matches" className="mb-4 inline-block font-mono text-xs uppercase tracking-hud text-[color:var(--text-dim)] hover:text-accent">
        ← calendrier
      </Link>

      <header className="mb-6">
        <div className="flex items-center gap-2">
          {game && <Badge tone="mute">{game.name}</Badge>}
          <span className="font-mono text-[10px] uppercase tracking-hud text-[color:var(--text-mute)]">
            {new Date(match.dateISO).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })}
          </span>
        </div>
        <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-hud">vs {match.opponent.name}</h1>
        <p className="font-mono text-sm text-[color:var(--text-dim)]">
          {match.competition}
          {match.score && (
            <span className="ml-2 font-bold text-[color:var(--text)]">{match.score.us}–{match.score.them}</span>
          )}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel title={`Stats par joueur (${roster.length})`}>
          {roster.length === 0 ? (
            <p className="font-mono text-sm text-[color:var(--text-mute)]">Aucun joueur sur ce jeu.</p>
          ) : (
            <ul className="space-y-2">
              {roster.map((p) => {
                const s = statFor(p.id);
                return (
                  <li key={p.id} className="flex items-center justify-between gap-3 border-b border-line pb-2 last:border-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="font-mono text-sm font-bold text-[color:var(--text)]">{p.pseudo}</p>
                      <p className="truncate font-mono text-xs text-[color:var(--text-mute)]">
                        {s && s.stats.length > 0 ? s.stats.map((x) => `${x.label} ${x.value}`).join(' · ') : '—'}
                      </p>
                    </div>
                    {isPerf && (
                      <button
                        type="button"
                        onClick={() => setEditingStat(p)}
                        className="shrink-0 font-mono text-[11px] text-[color:var(--text-dim)] hover:text-accent"
                      >
                        éditer
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel
          title={`Feedback (${feedback.length})`}
          right={<Link to="/feedback" className="font-mono text-[11px] uppercase tracking-hud text-accent">Tout voir →</Link>}
        >
          {feedback.length === 0 ? (
            <p className="font-mono text-sm text-[color:var(--text-mute)]">Aucun feedback lié à ce match.</p>
          ) : (
            <ul className="space-y-3">
              {feedback.map((f) => (
                <li key={f.id} className="border-b border-line pb-2 last:border-0 last:pb-0">
                  <p className="font-mono text-[10px] uppercase tracking-hud text-[color:var(--text-mute)]">Pour {playerName(f.playerId)}</p>
                  <p className="font-mono text-sm text-[color:var(--text-dim)]">{f.body}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="hud-label text-[11px]">Revues vidéo liées</p>
          <Link to="/review" className="font-mono text-[11px] uppercase tracking-hud text-accent">Gérer →</Link>
        </div>
        {reviews.length === 0 ? (
          <Panel>
            <p className="font-mono text-sm text-[color:var(--text-mute)]">
              Aucune revue vidéo liée à ce match. Lie-en une depuis « Revue vidéo ».
            </p>
          </Panel>
        ) : (
          <div className="space-y-5">
            {reviews.map((r) => (
              <ReviewBlock key={r.id} review={r} annotations={annotationsByReview[r.id] ?? []} players={players} />
            ))}
          </div>
        )}
      </div>

      {editingStat && matchId && (
        <MatchStatForm
          matchId={matchId}
          player={editingStat}
          existing={statFor(editingStat.id)}
          onClose={() => setEditingStat(null)}
          onSaved={() => {
            setEditingStat(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}

function ReviewBlock({
  review,
  annotations,
  players,
}: {
  review: VideoReview;
  annotations: VideoAnnotation[];
  players: Player[];
}) {
  const playerRef = useRef<VideoEmbedHandle>(null);
  const playerName = (id?: string) => players.find((p) => p.id === id)?.pseudo;

  return (
    <div className="panel p-4">
      <p className="mb-2 font-display text-lg font-bold uppercase">{review.title}</p>
      <VideoEmbed ref={playerRef} url={review.videoUrl} />
      {annotations.length > 0 && (
        <ul className="mt-3 space-y-2">
          {annotations.map((a) => (
            <li key={a.id} className="flex items-center gap-2 font-mono text-sm">
              <button
                type="button"
                onClick={() => playerRef.current?.seek(a.timestampSec)}
                className="shrink-0 border border-line-strong px-2 py-0.5 font-mono text-[11px] text-accent hover:border-accent"
              >
                ▶ {formatTimestamp(a.timestampSec)}
              </button>
              <Badge>{a.tag}</Badge>
              <span className="min-w-0 flex-1 truncate text-[color:var(--text-dim)]">{a.description}</span>
              {a.playerId && (
                <span className="shrink-0 font-mono text-[10px] uppercase tracking-hud text-[color:var(--text-mute)]">
                  {playerName(a.playerId)}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MatchStatForm({
  matchId,
  player,
  existing,
  onClose,
  onSaved,
}: {
  matchId: string;
  player: Player;
  existing?: MatchPlayerStat;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [text, setText] = useState(existing ? existing.stats.map((s) => `${s.label} | ${s.value}`).join('\n') : '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function parse(): PlayerStat[] {
    return text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        const [label, value] = l.split('|').map((x) => x.trim());
        return { label: label ?? '', value: value ?? '' };
      });
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await db.upsertMatchStat({ id: existing?.id, matchId, playerId: player.id, stats: parse() });
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
      setBusy(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={`Stats · ${player.pseudo}`}>
      <div>
        <label className="label">Stats (label | valeur, un par ligne)</label>
        <textarea className="field h-32" value={text} onChange={(e) => setText(e.target.value)} placeholder="ACS | 264" />
      </div>
      {error && <p className="mt-4 border border-[color:var(--accent)] px-3 py-2 font-mono text-xs text-accent">{error}</p>}
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>Annuler</Button>
        <Button onClick={save} disabled={busy}>{busy ? '…' : 'Enregistrer'}</Button>
      </div>
    </Modal>
  );
}
