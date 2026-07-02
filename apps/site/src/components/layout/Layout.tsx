import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { PageTransition } from '@/components/animation/PageTransition';
import { BootSequence } from '@/components/animation/BootSequence';
import { CockpitOverlay } from '@/components/ui/CockpitOverlay';
import { GrainOverlay } from '@/components/ui/GrainOverlay';
import { HudCursor } from '@/components/ui/HudCursor';
import { LiveBar } from '@/components/ui/LiveBar';
import { ThemeTweaker } from '@/components/ui/ThemeTweaker';
import { useLenis } from '@/hooks/useLenis';

/** Coquille globale : boot initial → smooth scroll + header + page + footer. */
export function Layout() {
  useLenis();
  const [booted, setBooted] = useState(false);

  return (
    <div className="flex min-h-dvh flex-col">
      {!booted && <BootSequence onComplete={() => setBooted(true)} />}

      {/* Transitions de route (jouées dès la 1re navigation). */}
      <PageTransition />

      {/* Habillage HUD cockpit fixe (non interactif). */}
      <CockpitOverlay />

      {/* Grain film global (matière par-dessus tout). */}
      <GrainOverlay />

      {/* Curseur réticule HUD (desktop, pointeur fin). */}
      <HudCursor />

      {/* Tweaker de couleurs (overlay global). */}
      <ThemeTweaker />

      <Header />
      <main id="content" className="flex-1 pt-16">
        {/* Bandeau LIVE si un match est en cours (sticky sous le header). */}
        <LiveBar />
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
