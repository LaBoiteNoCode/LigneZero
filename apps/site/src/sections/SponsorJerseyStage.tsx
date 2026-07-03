import { Component, lazy, Suspense, useMemo, useState, type ReactNode } from 'react';
import { HudFrame } from '@/components/ui/HudFrame';
import { KeycapButton } from '@/components/ui/KeycapButton';
import { useData } from '@/data/DataProvider';
import { placeSponsors, type PlacedSponsor } from '@/lib/jerseyAnchors';

const SponsorJersey = lazy(() => import('@/components/3d/SponsorJersey'));

/* ── Fallbacks 3D (chargement + WebGL indisponible) ─────────────── */
function Loader3D() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3">
      <p className="hud-label text-[10px]">
        [ 3D ] <span className="text-accent">&gt;</span> chargement du maillot…
      </p>
      <div className="flex gap-1">
        {Array.from({ length: 12 }).map((_, i) => (
          <span
            key={i}
            className="h-3 w-2 bg-accent"
            style={{ animation: `blink 1.1s steps(1) ${i * 0.08}s infinite`, opacity: 0.3 }}
          />
        ))}
      </div>
    </div>
  );
}

class GLBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/** Repli sans WebGL : la liste des sponsors + emplacements, en dur. */
function StaticFallback({ placed }: { placed: PlacedSponsor[] }) {
  return (
    <div className="grid h-full grid-cols-1 content-center gap-2 p-6 sm:grid-cols-2">
      {placed.map(({ sponsor, anchor }) => (
        <a
          key={sponsor.id}
          href={sponsor.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between border-2 border-line-strong bg-base-900/70 px-4 py-3 transition-colors hover:border-accent"
        >
          <span className="hud-title text-lg font-bold">{sponsor.name}</span>
          <span className="hud-label text-[9px]">{anchor.label}</span>
        </a>
      ))}
    </div>
  );
}

/* ── Composition ────────────────────────────────────────────────── */
export function SponsorJerseyStage() {
  const { sponsors } = useData();
  const placed = useMemo(() => placeSponsors(sponsors), [sponsors]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (placed.length === 0) return null;

  return (
    <div className="mt-10">
      {/* ── SCÈNE 3D ── */}
      <HudFrame label="JERSEY // PARTENAIRES" corner="CLICK A SPONSOR" tone="accent" className="cut-panel">
        <div
          className="relative h-[460px] w-full sm:h-[600px]"
          style={{
            background:
              'radial-gradient(70% 60% at 50% 40%, #3a352e 0%, #201d18 45%, var(--base-900) 100%)',
          }}
        >
          <GLBoundary fallback={<StaticFallback placed={placed} />}>
            <Suspense fallback={<Loader3D />}>
              <SponsorJersey placed={placed} selectedId={selectedId} onSelect={setSelectedId} />
            </Suspense>
          </GLBoundary>

          {/* HUD flottant : reset caméra */}
          {selectedId && (
            <div className="absolute right-3 top-3 z-10">
              <KeycapButton size="sm" variant="secondary" onClick={() => setSelectedId(null)}>
                ✕ vue d'ensemble
              </KeycapButton>
            </div>
          )}
        </div>
      </HudFrame>

      {/* ── CARROUSEL PARTENAIRES — clic = focus caméra sur le patch ── */}
      <div className="mt-6 flex gap-3 overflow-x-auto pb-2">
        {placed.map((p) => {
          const active = p.sponsor.id === selectedId;
          const col = p.sponsor.color ?? 'var(--accent)';
          return (
            <button
              key={p.sponsor.id}
              type="button"
              onClick={() => setSelectedId(active ? null : p.sponsor.id)}
              aria-pressed={active}
              className={[
                'shrink-0 border-2 px-5 py-3 text-left transition-all duration-snap',
                active
                  ? '-translate-y-0.5 bg-base-800 shadow-ink-sm'
                  : 'border-line-strong bg-base-900/60 hover:border-line-bright',
              ].join(' ')}
              style={{ borderColor: active ? col : undefined }}
            >
              <span
                className="hud-title block whitespace-nowrap text-sm font-bold"
                style={{ color: active ? col : 'var(--text-dim)' }}
              >
                {p.sponsor.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
