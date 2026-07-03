import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Feedback, Match, Objective, VideoAnnotation, VideoReview } from '@lignezero/types';
import { db } from '@/lib/supabase';
import { useAuth } from '@/auth/AuthProvider';
import { Panel, Spinner, Badge } from '@/components/ui';
import { formatTimestamp } from '@/lib/video';

/** Accueil JOUEUR : prochain match, objectifs, dernier feedback, CTA dispos, moments à revoir. */
export function PlayerDashboard() {
  const { playerId, profile } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [annotations, setAnnotations] = useState<VideoAnnotation[]>([]);
  const [reviews, setReviews] = useState<VideoReview[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const [ms, os, fs, as_, rs] = await Promise.all([
        db.listMatches(),
        db.listObjectives(),
        db.listFeedback(),
        db.listVideoAnnotations(),
        db.listVideoReviews(),
      ]);
      setMatches(ms);
      setObjectives(os);
      setFeedback(fs);
      setAnnotations(as_);
      setReviews(rs);
      setReady(true);
    })();
  }, []);

  if (!ready) return <Spinner label="Chargement de ton espace…" />;

  const now = Date.now();
  const nextMatch = matches.filter((m) => new Date(m.dateISO).getTime() >= now).sort((a, b) => +new Date(a.dateISO) - +new Date(b.dateISO))[0];
  const mine = objectives.filter((o) => o.scope === 'team' || o.playerId === playerId);
  const lastFeedback = feedback[0];
  const myMoments = annotations
    .filter((a) => a.playerId === playerId)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 5);
  const reviewTitle = (id: string) => reviews.find((r) => r.id === id)?.title ?? 'Revue vidéo';

  return (
    <div>
      <header className="mb-6">
        <p className="hud-label text-[11px]">Mon espace</p>
        <h1 className="font-display text-3xl font-bold uppercase tracking-hud">Salut {profile?.displayName ?? ''}</h1>
      </header>

      {!playerId && (
        <p className="mb-6 border border-[color:var(--signal-warn)] px-3 py-2 font-mono text-xs text-[color:var(--signal-warn)]">
          &gt; Ton compte n'est pas encore lié à une fiche joueur. Un admin doit faire la liaison (Comptes &amp; rôles).
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel title="Prochain match">
          {nextMatch ? (
            <div>
              <p className="font-display text-2xl font-bold uppercase">vs {nextMatch.opponent.name}</p>
              <p className="mt-1 font-mono text-sm text-[color:var(--text-dim)]">
                {new Date(nextMatch.dateISO).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })}
              </p>
              <p className="mt-1 font-mono text-xs text-[color:var(--text-mute)]">{nextMatch.competition}</p>
            </div>
          ) : (
            <p className="font-mono text-sm text-[color:var(--text-mute)]">Aucun match à venir.</p>
          )}
        </Panel>

        <Panel title="Mes disponibilités" right={<Link to="/me/dispos" className="font-mono text-[11px] uppercase tracking-hud text-accent">Remplir →</Link>}>
          <p className="font-mono text-sm text-[color:var(--text-dim)]">Indique tes créneaux de la semaine pour le staff.</p>
        </Panel>

        <Panel title="Objectifs">
          {mine.length === 0 ? (
            <p className="font-mono text-sm text-[color:var(--text-mute)]">Aucun objectif défini.</p>
          ) : (
            <ul className="space-y-2">
              {mine.slice(0, 5).map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 font-mono text-sm">
                  <span className="text-[color:var(--text)]">
                    {o.scope === 'team' && <span className="text-accent">[ÉQUIPE] </span>}
                    {o.title}
                  </span>
                  <Badge tone={o.status === 'done' ? 'ok' : o.status === 'doing' ? 'warn' : 'mute'}>{o.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Dernier feedback" right={<Link to="/feedback" className="font-mono text-[11px] uppercase tracking-hud text-accent">Tout voir →</Link>}>
          {lastFeedback ? (
            <div>
              <p className="font-mono text-sm text-[color:var(--text-dim)]">{lastFeedback.body}</p>
              {!lastFeedback.acknowledged && <p className="mt-2"><Badge tone="live">non lu</Badge></p>}
            </div>
          ) : (
            <p className="font-mono text-sm text-[color:var(--text-mute)]">Aucun feedback pour l'instant.</p>
          )}
        </Panel>

        <Panel title="Mes moments à revoir" right={<Link to="/review" className="font-mono text-[11px] uppercase tracking-hud text-accent">Tout voir →</Link>}>
          {myMoments.length === 0 ? (
            <p className="font-mono text-sm text-[color:var(--text-mute)]">Aucun checkpoint coach pour l'instant.</p>
          ) : (
            <ul className="space-y-2">
              {myMoments.map((a) => (
                <li key={a.id}>
                  <Link
                    to={`/review?open=${a.reviewId}&t=${a.timestampSec}`}
                    className="flex items-center justify-between gap-3 font-mono text-sm text-[color:var(--text-dim)] hover:text-accent"
                  >
                    <span className="min-w-0 truncate">
                      <span className="text-accent">▶ {formatTimestamp(a.timestampSec)}</span> — {a.tag}
                    </span>
                    <span className="shrink-0 font-mono text-[10px] uppercase tracking-hud text-[color:var(--text-mute)]">
                      {reviewTitle(a.reviewId)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
