import { useEffect, useRef } from 'react';
import { ScanlineOverlay } from './ScanlineOverlay';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface PageBackdropProps {
  /** Gros texte/numéro fantôme en fond (ex. "04", "PARTNERS"). */
  ghost?: string;
}

/**
 * Fond graphique en PROFONDEUR pour les pages intérieures : parallaxe au
 * SCROLL **et** au pointeur (chaque couche `data-depth` dérive à sa propre
 * vitesse), halftone, bande béton, numéro fantôme, croix de visée, scanlines.
 * Fixé derrière le contenu. Reduced-motion → statique.
 */
export function PageBackdrop({ ghost = '00' }: PageBackdropProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const root = ref.current;
    if (!root || reduced) return;
    const fine = window.matchMedia('(pointer: fine)').matches;

    const layers = Array.from(root.querySelectorAll<HTMLElement>('[data-depth]')).map((el) => ({
      el,
      depth: parseFloat(el.dataset.depth || '0'),
    }));
    if (layers.length === 0) return;

    let px = 0;
    let py = 0;
    let tpx = 0;
    let tpy = 0;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      tpx = e.clientX / window.innerWidth - 0.5;
      tpy = e.clientY / window.innerHeight - 0.5;
    };

    const tick = () => {
      px += (tpx - px) * 0.08;
      py += (tpy - py) * 0.08;
      const sy = window.scrollY;
      for (const { el, depth } of layers) {
        const tx = -px * depth;
        const ty = -py * depth - sy * (depth / 60); // ← dérive au scroll
        el.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };

    if (fine) window.addEventListener('pointermove', onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
    };
  }, [reduced]);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* vignette de profondeur (statique) */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(130% 100% at 75% 0%, transparent 45%, var(--base-900) 100%)' }}
      />

      {/* halftone accent (coin haut-droit) */}
      <div
        data-depth="14"
        className="halftone absolute -right-24 -top-24 h-[55vh] w-[55vh] text-[color:var(--accent)] opacity-[0.14]"
        style={{ maskImage: 'radial-gradient(circle at 70% 30%, #000, transparent 70%)' }}
      />

      {/* lueur accent qui dérive */}
      <div
        data-depth="26"
        className="absolute left-[60%] top-[10%] h-[40vh] w-[40vh] animate-drift rounded-full blur-[110px]"
        style={{ background: 'color-mix(in srgb, var(--accent) 12%, transparent)' }}
      />

      {/* gros mot fantôme en contour fin (façon "ZERO" de l'accueil) */}
      <div
        data-depth="10"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap font-display text-[24vw] font-bold uppercase leading-none tracking-tighter"
        style={{ color: 'transparent', WebkitTextStroke: '1px var(--line-strong)', opacity: 0.45 }}
      >
        {ghost}
      </div>

      {/* hazard vertical bord gauche (statique : pas de data-depth) */}
      <div className="hazard absolute bottom-0 left-0 top-0 w-2.5 opacity-60" />

      {/* croix de visée */}
      <div data-depth="40" className="absolute right-[14%] top-[34%] h-24 w-24 opacity-50">
        <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-line-bright" />
        <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-line-bright" />
        <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 border border-accent" />
      </div>

      <ScanlineOverlay opacity={0.04} />
    </div>
  );
}
