import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Canvas3D } from '@/components/3d/Canvas3D';
import { HudFrame } from '@/components/ui/HudFrame';
import { KeycapCard } from '@/components/ui/KeycapCard';
import { KeycapButton } from '@/components/ui/KeycapButton';
import { MediaFrame } from '@/components/ui/MediaFrame';
import { Bracket } from '@/components/ui/Bracket';
import { FunnelStage } from '@/components/animation/FunnelStage';
import { jerseyVariants } from '@/data/products';
import { useData } from '@/data/DataProvider';

export default function ShopPage() {
  const { products } = useData();
  const [variant, setVariant] = useState(jerseyVariants[0]);
  const [number, setNumber] = useState('00');

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <PageHeader
        code="06"
        title="Boutique"
        subtitle="Configure le maillot en 3D. Catalogue complet bientôt en ligne."
      />

      {/* ── Configurateur maillot 3D ───────────────────────────── */}
      <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <HudFrame label="JERSEY VIEWER // 3D" corner="DRAG TO ROTATE" tone="accent" className="cut-panel">
          <div
            className="h-[420px] w-full sm:h-[540px]"
            style={{
              background:
                'radial-gradient(70% 60% at 50% 40%, #3a352e 0%, #201d18 45%, var(--base-900) 100%)',
            }}
          >
            <Canvas3D base={variant.base} accent={variant.accent} number={number} />
          </div>
        </HudFrame>

        {/* panneau de configuration */}
        <HudFrame label="CONFIG" corner={variant.label.toUpperCase()} tone="accent" className="cut-panel">
          <div className="space-y-6 p-5">
            {/* variantes couleur */}
            <div>
              <p className="hud-label mb-3 text-[10px]">[ Coloris ]</p>
              <div className="flex flex-col gap-2">
                {jerseyVariants.map((v) => {
                  const active = v.id === variant.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setVariant(v)}
                      className={[
                        'flex items-center gap-3 border-2 px-3 py-2 font-mono text-xs uppercase tracking-hud transition-all duration-snap',
                        active
                          ? 'border-accent bg-accent text-[color:var(--paper)] shadow-ink-sm'
                          : 'border-line-strong text-[color:var(--text-dim)] hover:border-accent',
                      ].join(' ')}
                    >
                      <span className="h-4 w-4 border border-ink" style={{ background: v.base }} />
                      <span className="h-4 w-4 border border-ink" style={{ background: v.accent }} />
                      {v.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* numéro */}
            <div>
              <p className="hud-label mb-3 text-[10px]">[ Numéro / Flocage ]</p>
              <input
                type="text"
                maxLength={2}
                value={number}
                onChange={(e) => setNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 2) || '0')}
                onBlur={() => setNumber((n) => n.padStart(2, '0'))}
                className="w-full border-2 border-line-strong bg-base-900 px-4 py-3 text-center font-display text-3xl font-bold tracking-wide2 text-accent focus:border-accent"
                aria-label="Numéro du maillot"
              />
            </div>

            <div className="border-t border-line pt-5">
              <p className="font-mono text-xs text-[color:var(--text-dim)]">
                <span className="text-accent">&gt;</span> Maillot 2026 — 69 €
              </p>
              <KeycapButton className="mt-3 w-full" sound onClick={() => undefined}>
                &gt; Bientôt dispo
              </KeycapButton>
            </div>
          </div>
        </HudFrame>
      </section>

      {/* ── Catalogue placeholder ──────────────────────────────── */}
      <section className="mt-20">
        <p className="hud-label mb-8 flex items-center gap-3 text-xs">
          <Bracket>CATALOGUE</Bracket>
          <span className="h-px flex-1 bg-line-strong" />
          <span className="text-[color:var(--text-mute)]">DROP 2026</span>
        </p>

        <FunnelStage intensity={13} depth={80} perspective={1600} className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-3">
          {products.map((p) => (
            <div data-tilt key={p.id}>
            <KeycapCard interactive={p.status === 'available'} className="h-full p-0">
              <div className="relative">
                <MediaFrame
                  src={p.image}
                  alt={p.name}
                  ratio="1/1"
                  label={p.category}
                  className="!border-0 !shadow-none"
                />
                {p.status === 'soon' && (
                  <span className="absolute right-2 top-2 z-20 bg-base-900/85 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-hud text-[color:var(--text-dim)]">
                    BIENTÔT
                  </span>
                )}
              </div>
              <div className="flex items-end justify-between p-4">
                <div>
                  <p className="hud-title text-base font-bold leading-tight">{p.name}</p>
                  <p className="hud-label mt-1 text-[9px]">{p.category}</p>
                </div>
                {p.price && <span className="font-mono text-sm font-bold text-accent">{p.price}</span>}
              </div>
            </KeycapCard>
            </div>
          ))}
        </FunnelStage>
      </section>
    </div>
  );
}
