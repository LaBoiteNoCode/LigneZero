import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import type { Game, Match, Player } from '@lignezero/types';
import { db } from '@/lib/supabase';
import { Button, Panel, Spinner } from '@/components/ui';
import { FORMATS, type FormatId } from '@/social/formats';
import {
  SocialVisual,
  TEMPLATES,
  DEFAULT_HEADLINE,
  type SocialContent,
  type TemplateId,
} from '@/social/templates';
import { buildCaption } from '@/social/caption';

const BRAND = '__BRAND__';

function hostOf(url: string | undefined): string {
  if (!url) return '';
  try {
    return new URL(url).host.replace(/^www\./, '') + '/…';
  } catch {
    return '';
  }
}

/** Champs joueur (silhouette si pas de photo). */
function playerFields(p: Player | undefined) {
  return {
    playerName: p?.pseudo ?? 'JOUEUR',
    playerRole: p?.role ?? '',
    playerPhoto: p?.photo,
    playerColor: p?.color ?? '#f23127',
    playerStats: (p?.stats ?? []).slice(0, 3).map((s) => ({ label: s.label, value: s.value })),
  };
}

/** Contenu du visuel depuis un match + son jeu + un joueur mis en avant. */
function contentFromMatch(m: Match, g: Game | undefined, player: Player | undefined, template: TemplateId): SocialContent {
  const d = new Date(m.dateISO);
  return {
    template,
    headline: DEFAULT_HEADLINE[template],
    gameTag: g?.tag ?? '—',
    brand: BRAND,
    opponent: m.opponent.name,
    competition: m.competition,
    dateLabel: d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' }),
    timeLabel: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    scoreUs: m.score?.us?.toString() ?? '',
    scoreThem: m.score?.them?.toString() ?? '',
    streamLabel: hostOf(m.streamUrl ?? m.vodUrl),
    ...playerFields(player),
  };
}

function suggestTemplate(m: Match): TemplateId {
  if (m.status === 'finished' && m.score) return m.score.us >= m.score.them ? 'victoire' : 'defaite';
  return 'matchday';
}

export function SocialStudioPage() {
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matchId, setMatchId] = useState<string>('');
  const [playerId, setPlayerId] = useState<string>('');
  const [format, setFormat] = useState<FormatId>('x');
  const [content, setContent] = useState<SocialContent | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nodeRef = useRef<HTMLDivElement>(null);
  const [boxW, setBoxW] = useState(0);
  const roRef = useRef<ResizeObserver | null>(null);
  const setBoxRef = useCallback((el: HTMLDivElement | null) => {
    roRef.current?.disconnect();
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBoxW(e.contentRect.width));
    ro.observe(el);
    roRef.current = ro;
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [ms, gs, ps] = await Promise.all([db.listMatches(), db.listGames(), db.listPlayers()]);
        setMatches(ms);
        setGames(gs);
        setPlayers(ps);
        if (ms.length) selectMatch(ms[0], gs, ps);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erreur');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function selectMatch(m: Match, gs: Game[], ps: Player[]) {
    setMatchId(m.id);
    const g = gs.find((x) => x.id === m.gameId);
    const roster = ps.filter((p) => p.gameId === m.gameId);
    const p = roster[0];
    setPlayerId(p?.id ?? '');
    setContent(contentFromMatch(m, g, p, suggestTemplate(m)));
  }

  const currentMatch = matches?.find((m) => m.id === matchId);
  const roster = useMemo(
    () => (currentMatch ? players.filter((p) => p.gameId === currentMatch.gameId) : players),
    [players, currentMatch],
  );

  const fmt = useMemo(() => FORMATS.find((f) => f.id === format)!, [format]);
  const scale = boxW ? Math.min(boxW / fmt.w, 620 / fmt.h) : 0;

  const set = <K extends keyof SocialContent>(k: K, v: SocialContent[K]) =>
    setContent((c) => (c ? { ...c, [k]: v } : c));

  function pickTemplate(t: TemplateId) {
    setContent((c) => (c ? { ...c, template: t, headline: DEFAULT_HEADLINE[t] } : c));
  }
  function pickPlayer(id: string) {
    setPlayerId(id);
    const p = players.find((x) => x.id === id);
    setContent((c) => (c ? { ...c, ...playerFields(p) } : c));
  }

  async function download() {
    if (!nodeRef.current || !content) return;
    setBusy(true);
    setError(null);
    try {
      const url = await toPng(nodeRef.current, { width: fmt.w, height: fmt.h, pixelRatio: 1, cacheBust: true });
      const a = document.createElement('a');
      a.download = `lignezero_${content.template}_${format}.png`;
      a.href = url;
      a.click();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec de l'export");
    } finally {
      setBusy(false);
    }
  }

  async function copyCaption() {
    if (content) await navigator.clipboard.writeText(buildCaption(content));
  }

  if (error && !content) {
    return <p className="border border-[color:var(--accent)] px-3 py-2 font-mono text-xs text-accent">{error}</p>;
  }
  if (!matches || !content) return <Spinner label="Chargement…" />;

  return (
    <div>
      <header className="mb-6">
        <p className="hud-label text-[11px]">SOC // Studio réseaux</p>
        <h1 className="font-display text-3xl font-bold uppercase tracking-hud">Studio réseaux</h1>
        <p className="mt-1 font-mono text-xs text-[color:var(--text-dim)]">
          &gt; Carte joueur générée depuis un match. Export PNG + légende.
        </p>
      </header>

      {error && (
        <p className="mb-4 border border-[color:var(--accent)] px-3 py-2 font-mono text-xs text-accent">{error}</p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
        {/* ── Contrôles ── */}
        <div className="space-y-5">
          <Panel title="Source">
            <label className="label">Match</label>
            <select
              className="field mb-3"
              value={matchId}
              onChange={(e) => {
                const m = matches.find((x) => x.id === e.target.value);
                if (m) selectMatch(m, games, players);
              }}
            >
              {matches.map((m) => (
                <option key={m.id} value={m.id}>
                  {new Date(m.dateISO).toLocaleDateString('fr-FR')} · vs {m.opponent.name} ({m.status})
                </option>
              ))}
            </select>
            <label className="label">Joueur mis en avant</label>
            <select className="field" value={playerId} onChange={(e) => pickPlayer(e.target.value)}>
              {roster.length === 0 && <option value="">— aucun joueur —</option>}
              {roster.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.pseudo} · {p.role}
                </option>
              ))}
            </select>
            {!content.playerPhoto && (
              <p className="mt-2 font-mono text-[10px] text-[color:var(--text-mute)]">
                &gt; Silhouette affichée : ajoute une photo au joueur (champ photo) pour la remplacer.
              </p>
            )}
          </Panel>

          <Panel title="Template">
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => pickTemplate(t.id)}
                  className={`border px-3 py-1.5 font-mono text-[11px] uppercase tracking-hud transition-colors ${
                    content.template === t.id
                      ? 'border-accent bg-accent text-ink'
                      : 'border-line-strong text-[color:var(--text-dim)] hover:border-line-bright'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Format">
            <div className="flex flex-wrap gap-2">
              {FORMATS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className={`border px-3 py-1.5 font-mono text-[11px] uppercase tracking-hud transition-colors ${
                    format === f.id
                      ? 'border-accent bg-accent text-ink'
                      : 'border-line-strong text-[color:var(--text-dim)] hover:border-line-bright'
                  }`}
                >
                  {f.label} <span className="opacity-60">{f.note}</span>
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Contenu (éditable)">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Field label="Accroche (cône)" value={content.headline} onChange={(v) => set('headline', v)} />
              </div>
              <Field label="Sigle jeu" value={content.gameTag} onChange={(v) => set('gameTag', v)} />
              <Field label="Adversaire" value={content.opponent} onChange={(v) => set('opponent', v)} />
              <Field label="Date" value={content.dateLabel} onChange={(v) => set('dateLabel', v)} />
              <Field label="Heure" value={content.timeLabel} onChange={(v) => set('timeLabel', v)} />
              <Field label="Score nous" value={content.scoreUs} onChange={(v) => set('scoreUs', v)} />
              <Field label="Score eux" value={content.scoreThem} onChange={(v) => set('scoreThem', v)} />
              <Field label="Couleur joueur" value={content.playerColor} onChange={(v) => set('playerColor', v)} />
              <Field label="Photo joueur (URL)" value={content.playerPhoto ?? ''} onChange={(v) => set('playerPhoto', v || undefined)} />
              <div className="col-span-2">
                <Field label="Compétition" value={content.competition} onChange={(v) => set('competition', v)} />
              </div>
              <div className="col-span-2">
                <Field label="Stream (label)" value={content.streamLabel} onChange={(v) => set('streamLabel', v)} />
              </div>
            </div>
          </Panel>
        </div>

        {/* ── Aperçu + export ── */}
        <div className="space-y-4">
          <Panel
            title={`Aperçu · ${fmt.w}×${fmt.h}`}
            right={
              <div className="flex gap-2">
                <Button variant="ghost" onClick={copyCaption}>Copier légende</Button>
                <Button onClick={download} disabled={busy}>{busy ? 'Export…' : '↓ PNG'}</Button>
              </div>
            }
          >
            <div ref={setBoxRef} className="flex justify-center bg-base-900 p-4">
              <div style={{ width: fmt.w * scale, height: fmt.h * scale, overflow: 'hidden' }}>
                <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
                  <SocialVisual ref={nodeRef} content={content} w={fmt.w} h={fmt.h} />
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="Légende générée">
            <textarea className="field h-40" readOnly value={buildCaption(content)} />
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input className="field" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
