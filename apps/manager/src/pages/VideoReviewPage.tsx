import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Game, Match, Player, VideoAnnotation, VideoReview } from '@lignezero/types';
import { db } from '@/lib/supabase';
import { useAuth } from '@/auth/AuthProvider';
import { Badge, Button, Modal, Panel, Spinner } from '@/components/ui';
import { VideoEmbed, type VideoEmbedHandle } from '@/components/VideoEmbed';
import { formatTimestamp } from '@/lib/video';
import { uid } from '@/lib/id';

export function VideoReviewPage() {
  const { isPerf } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [reviews, setReviews] = useState<VideoReview[] | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [annotations, setAnnotations] = useState<VideoAnnotation[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const seekOnReadyRef = useRef<number | null>(null);
  const playerRef = useRef<VideoEmbedHandle>(null);

  async function refresh() {
    try {
      const [rs, gs, ps, ms] = await Promise.all([db.listVideoReviews(), db.listGames(), db.listPlayers(), db.listMatches()]);
      setReviews(rs);
      setGames(gs);
      setPlayers(ps);
      setMatches(ms);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    }
  }
  useEffect(() => {
    refresh();
  }, []);

  // Deep-link depuis "Mes moments à revoir" : /review?open=<id>&t=<sec>
  useEffect(() => {
    const open = searchParams.get('open');
    const t = searchParams.get('t');
    if (open) {
      setOpenId(open);
      seekOnReadyRef.current = t ? Number(t) : null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const review = reviews?.find((r) => r.id === openId) ?? null;

  useEffect(() => {
    if (!review) return;
    db.listVideoAnnotations(review.id).then(setAnnotations);
  }, [review?.id]);

  function openReview(id: string) {
    setOpenId(id);
    seekOnReadyRef.current = null;
  }
  function closeReview() {
    setOpenId(null);
    setSearchParams({});
  }

  async function removeReview(r: VideoReview) {
    if (!confirm(`Supprimer « ${r.title} » et ses checkpoints ?`)) return;
    await db.removeVideoReview(r.id);
    if (openId === r.id) closeReview();
    refresh();
  }

  const gameName = (id?: string) => games.find((g) => g.id === id)?.name;

  if (!reviews) return <Spinner label="Chargement…" />;

  if (review) {
    return (
      <ReviewDetail
        review={review}
        players={players}
        isPerf={isPerf}
        annotations={annotations}
        seekOnReady={seekOnReadyRef}
        playerRef={playerRef}
        onBack={closeReview}
        onAnnotationsChanged={() => db.listVideoAnnotations(review.id).then(setAnnotations)}
      />
    );
  }

  return (
    <div>
      <header className="mb-6 flex items-end justify-between">
        <div>
          <p className="hud-label text-[11px]">VOD // Revue vidéo</p>
          <h1 className="font-display text-3xl font-bold uppercase tracking-hud">Revue vidéo</h1>
        </div>
        {isPerf && <Button onClick={() => setCreating(true)}>+ Nouvelle review</Button>}
      </header>

      {error && (
        <p className="mb-4 border border-[color:var(--accent)] px-3 py-2 font-mono text-xs text-accent">{error}</p>
      )}

      {reviews.length === 0 ? (
        <Panel>
          <p className="font-mono text-sm text-[color:var(--text-mute)]">Aucune revue vidéo pour l'instant.</p>
        </Panel>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <div key={r.id} className="panel p-4">
              <div className="flex items-center gap-2">
                {gameName(r.gameId) && <Badge tone="mute">{gameName(r.gameId)}</Badge>}
                <span className="font-mono text-[10px] uppercase tracking-hud text-[color:var(--text-mute)]">
                  {new Date(r.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => openReview(r.id)}
                className="mt-2 block text-left font-display text-lg font-bold uppercase hover:text-accent"
              >
                {r.title}
              </button>
              {isPerf && (
                <button
                  type="button"
                  onClick={() => removeReview(r)}
                  className="mt-2 font-mono text-[10px] text-[color:var(--text-mute)] hover:text-accent"
                >
                  suppr.
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {creating && (
        <ReviewForm
          games={games}
          matches={matches}
          onClose={() => setCreating(false)}
          onSaved={(id) => {
            setCreating(false);
            refresh();
            openReview(id);
          }}
        />
      )}
    </div>
  );
}

function ReviewForm({
  games,
  matches,
  onClose,
  onSaved,
}: {
  games: Game[];
  matches: Match[];
  onClose: () => void;
  onSaved: (id: string) => void;
}) {
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [gameId, setGameId] = useState('');
  const [matchId, setMatchId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!title.trim() || !videoUrl.trim()) {
      setError('Titre et lien vidéo requis.');
      return;
    }
    setBusy(true);
    try {
      const id = uid();
      await db.upsertVideoReview({
        id,
        title: title.trim(),
        videoUrl: videoUrl.trim(),
        gameId: gameId || undefined,
        matchId: matchId || undefined,
      });
      onSaved(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
      setBusy(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="Nouvelle revue vidéo">
      <div className="space-y-4">
        <div>
          <label className="label">Titre</label>
          <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Scrim vs Aurora — game 2" />
        </div>
        <div>
          <label className="label">Lien vidéo (YouTube, VOD Twitch, ou autre)</label>
          <input className="field" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=…" />
        </div>
        <div>
          <label className="label">Jeu (optionnel)</label>
          <select className="field" value={gameId} onChange={(e) => setGameId(e.target.value)}>
            <option value="">—</option>
            {games.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Match lié (optionnel — pour le hub match)</label>
          <select className="field" value={matchId} onChange={(e) => setMatchId(e.target.value)}>
            <option value="">—</option>
            {matches.map((m) => (
              <option key={m.id} value={m.id}>
                {new Date(m.dateISO).toLocaleDateString('fr-FR')} vs {m.opponent.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      {error && <p className="mt-4 border border-[color:var(--accent)] px-3 py-2 font-mono text-xs text-accent">{error}</p>}
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>Annuler</Button>
        <Button onClick={save} disabled={busy}>{busy ? '…' : 'Créer'}</Button>
      </div>
    </Modal>
  );
}

function ReviewDetail({
  review,
  players,
  isPerf,
  annotations,
  seekOnReady,
  playerRef,
  onBack,
  onAnnotationsChanged,
}: {
  review: VideoReview;
  players: Player[];
  isPerf: boolean;
  annotations: VideoAnnotation[];
  seekOnReady: React.MutableRefObject<number | null>;
  playerRef: React.RefObject<VideoEmbedHandle>;
  onBack: () => void;
  onAnnotationsChanged: () => void;
}) {
  const [adding, setAdding] = useState(false);

  function handleReady() {
    if (seekOnReady.current != null) {
      playerRef.current?.seek(seekOnReady.current);
      seekOnReady.current = null;
    }
  }

  async function removeAnnotation(a: VideoAnnotation) {
    if (!confirm('Supprimer ce checkpoint ?')) return;
    await db.removeVideoAnnotation(a.id);
    onAnnotationsChanged();
  }

  const playerName = (id?: string) => players.find((p) => p.id === id)?.pseudo;

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-4 font-mono text-xs uppercase tracking-hud text-[color:var(--text-dim)] hover:text-accent"
      >
        ← toutes les revues
      </button>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
        <div>
          <VideoEmbed ref={playerRef} url={review.videoUrl} onReady={handleReady} />
          <h1 className="mt-3 font-display text-2xl font-bold uppercase tracking-hud">{review.title}</h1>
        </div>

        <Panel
          title={`Checkpoints (${annotations.length})`}
          right={isPerf && <Button onClick={() => setAdding(true)}>+ Checkpoint</Button>}
        >
          {annotations.length === 0 ? (
            <p className="font-mono text-sm text-[color:var(--text-mute)]">Aucun checkpoint pour l'instant.</p>
          ) : (
            <ul className="space-y-3">
              {annotations.map((a) => (
                <li key={a.id} className="border-b border-line pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => playerRef.current?.seek(a.timestampSec)}
                      className="border border-line-strong px-2 py-0.5 font-mono text-[11px] text-accent hover:border-accent"
                    >
                      ▶ {formatTimestamp(a.timestampSec)}
                    </button>
                    <Badge>{a.tag}</Badge>
                  </div>
                  <p className="mt-1.5 font-mono text-sm text-[color:var(--text-dim)]">{a.description}</p>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    {a.playerId && (
                      <span className="font-mono text-[10px] uppercase tracking-hud text-[color:var(--text-mute)]">
                        Pour {playerName(a.playerId) ?? a.playerId}
                      </span>
                    )}
                    {isPerf && (
                      <button
                        type="button"
                        onClick={() => removeAnnotation(a)}
                        className="ml-auto font-mono text-[10px] text-[color:var(--text-mute)] hover:text-accent"
                      >
                        suppr.
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {adding && (
        <AnnotationForm
          reviewId={review.id}
          players={players}
          getCurrentTime={() => playerRef.current?.getTime() ?? null}
          onClose={() => setAdding(false)}
          onSaved={() => {
            setAdding(false);
            onAnnotationsChanged();
          }}
        />
      )}
    </div>
  );
}

function AnnotationForm({
  reviewId,
  players,
  getCurrentTime,
  onClose,
  onSaved,
}: {
  reviewId: string;
  players: Player[];
  getCurrentTime: () => number | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [timestamp, setTimestamp] = useState('');
  const [tag, setTag] = useState('');
  const [description, setDescription] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function capture() {
    const t = getCurrentTime();
    if (t != null) setTimestamp(Math.floor(t).toString());
  }

  async function save() {
    const sec = Number(timestamp);
    if (!Number.isFinite(sec) || sec < 0 || !tag.trim() || !description.trim()) {
      setError('Instant, tag et description requis.');
      return;
    }
    setBusy(true);
    try {
      const ts = Math.floor(sec);
      await db.upsertVideoAnnotation({
        reviewId,
        timestampSec: ts,
        tag: tag.trim(),
        description: description.trim(),
        playerId: playerId || undefined,
      });
      // Checkpoint ciblant un joueur → classé automatiquement dans SON feedback,
      // avec un lien vers le checkpoint précis de la revue.
      if (playerId) {
        await db.upsertFeedback({
          playerId,
          body: `Revue vidéo — ${tag.trim()} : ${description.trim()}`,
          reviewId,
          timestampSec: ts,
        });
      }
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
      setBusy(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="Nouveau checkpoint">
      <div className="space-y-4">
        <div>
          <label className="label">Instant (secondes)</label>
          <div className="flex gap-2">
            <input
              className="field"
              type="number"
              min={0}
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              placeholder="ex. 184"
            />
            <Button variant="ghost" onClick={capture}>Capturer l'instant</Button>
          </div>
        </div>
        <div>
          <label className="label">Tag</label>
          <input className="field" value={tag} onChange={(e) => setTag(e.target.value)} placeholder="ex. Erreur de position, Bon call…" />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="field h-24" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <label className="label">Joueur concerné (optionnel — vide = toute l'équipe)</label>
          <select className="field" value={playerId} onChange={(e) => setPlayerId(e.target.value)}>
            <option value="">Toute l'équipe</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.pseudo}
              </option>
            ))}
          </select>
        </div>
      </div>
      {error && <p className="mt-4 border border-[color:var(--accent)] px-3 py-2 font-mono text-xs text-accent">{error}</p>}
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>Annuler</Button>
        <Button onClick={save} disabled={busy}>{busy ? '…' : 'Ajouter'}</Button>
      </div>
    </Modal>
  );
}
