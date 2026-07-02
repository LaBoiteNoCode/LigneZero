import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DepthDive } from '@/sections/DepthDive';
import { Hero } from '@/sections/Hero';
import { KeycapCard } from '@/components/ui/KeycapCard';
import { HudFrame } from '@/components/ui/HudFrame';
import { Bracket } from '@/components/ui/Bracket';
import { FunnelStage } from '@/components/animation/FunnelStage';
import { routes } from '@/lib/routes';

const ACCESS = routes.filter((r) => r.path !== '/');

export default function HomePage() {
  useEffect(() => {
    document.title = '__BRAND__ // Accueil';
  }, []);

  return (
    <>
      <DepthDive />
      <div id="hub" />
      <Hero />

      {/* Accès rapides — grille asymétrique, cartes inclinées vers le centre */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <p className="hud-label mb-8 flex items-center gap-3 text-xs">
          <Bracket>NAVIGATION</Bracket>
          <span className="h-px flex-1 bg-line-strong" />
          <span className="text-[color:var(--text-mute)]">{ACCESS.length} MODULES</span>
        </p>

        <FunnelStage intensity={15} depth={100} perspective={1400} className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-6">
          {ACCESS.map((r, i) => (
            <Link
              key={r.path}
              to={r.path}
              data-tilt
              // hauteurs variées = rythme non-linéaire
              className={i % 5 === 0 ? 'md:row-span-2' : i % 3 === 0 ? 'md:col-span-2' : ''}
            >
              <KeycapCard interactive scanlines variant={i % 4 === 1 ? 'secondary' : 'primary'} className="h-full p-5">
                <span className="font-mono text-[10px] text-accent">{r.code}</span>
                <p className="hud-title mt-6 text-xl font-bold">{r.label}</p>
                <span className="mt-4 block font-mono text-[10px] text-[color:var(--text-mute)]">&gt; accéder ↗</span>
              </KeycapCard>
            </Link>
          ))}
        </FunnelStage>
      </section>

      {/* Bloc CTA réseaux */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <HudFrame label="UPLINK" corner="REJOINDRE LE SIGNAL" tone="accent" className="cut-panel">
          <div className="flex flex-col items-start justify-between gap-6 p-8 md:flex-row md:items-center">
            <div>
              <h2 className="hud-title text-3xl font-bold">REJOINS LA COMMU</h2>
              <p className="mt-2 font-mono text-sm text-[color:var(--text-dim)]">
                &gt; lives, drops, coulisses. tout passe par les réseaux.
              </p>
            </div>
            <div className="hazard h-10 w-40 shrink-0" aria-hidden />
          </div>
        </HudFrame>
      </section>
    </>
  );
}
