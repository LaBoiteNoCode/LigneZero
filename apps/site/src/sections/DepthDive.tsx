import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { getLenis } from '@/lib/lenis';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { HudFrame } from '@/components/ui/HudFrame';
import { MediaFrame } from '@/components/ui/MediaFrame';
import { DataReadout } from '@/components/ui/DataReadout';
import { Bracket } from '@/components/ui/Bracket';

/**
 * "Depth dive" : intro en PROFONDEUR. Le scroll vertical pilote l'axe Z —
 * les couches foncent du fond vers la caméra. Elles sont ANCRÉES à des
 * positions variées (coins/bords, pas tout centré) et se CHEVAUCHENT en
 * profondeur. Auto-scroll lent au chargement (interruptible). Reduced-motion
 * → empilement sobre sans 3D.
 */

interface Item {
  /** Profondeur de mise au point (la caméra avance de 0 → max). */
  depth: number;
  /** Ancrage écran en % (centre de l'élément). */
  left: number;
  top: number;
  /** Largeur max. */
  w: string;
  align?: 'left' | 'center' | 'right';
  /** >1 = la carte reste affichée plus longtemps (fenêtre de visibilité élargie). */
  linger?: number;
  content: ReactNode;
}

const ITEMS: Item[] = [
  {
    depth: 0,
    left: 50,
    top: 50,
    w: 'max-w-2xl',
    content: (
      <>
        <p className="hud-label mb-3 text-xs sm:text-sm">
          <Bracket>DEEP SCAN</Bracket>
        </p>
        <p className="font-display text-3xl font-bold uppercase tracking-wide2 text-[color:var(--text-dim)] sm:text-5xl">
          Descente en profondeur
        </p>
      </>
    ),
  },
  {
    depth: 1,
    left: 40,
    top: 40,
    w: 'max-w-none',
    align: 'left',
    content: (
      <h2 className="font-display text-[16vw] font-bold uppercase leading-none tracking-tighter glow-text">LIGNE</h2>
    ),
  },
  {
    depth: 1.7,
    left: 60,
    top: 60,
    w: 'max-w-none',
    align: 'right',
    content: (
      <h2 className="font-display text-[18vw] font-bold uppercase leading-none tracking-tighter" style={{ color: 'var(--accent)' }}>
        ZERO
      </h2>
    ),
  },
  {
    depth: 2.4,
    left: 27,
    top: 30,
    w: 'w-80',
    align: 'left',
    linger: 1.8,
    content: (
      <HudFrame label="SIGNAL // ACQUIS" corner="SECTOR 07" tone="accent" className="cut-panel">
        <div className="flex items-center gap-3 p-4">
          <span className="hazard h-10 w-10 shrink-0" aria-hidden />
          <p className="text-left font-mono text-xs leading-relaxed text-[color:var(--text-dim)]">
            &gt; uplink stable. roster online. prêt au combat.
          </p>
        </div>
      </HudFrame>
    ),
  },
  {
    depth: 2.8,
    left: 76,
    top: 72,
    w: 'w-56',
    linger: 1.8,
    content: (
      <DataReadout
        label="ROSTER"
        rows={[
          { k: 'units', v: '09' },
          { k: 'status', v: 'ONLINE' },
        ]}
      />
    ),
  },
  {
    depth: 3.4,
    left: 74,
    top: 46,
    w: 'w-56',
    align: 'right',
    linger: 2,
    content: <MediaFrame ratio="4/5" label="JERSEY // 2026" corner="DROP" />,
  },
  {
    depth: 3.8,
    left: 26,
    top: 70,
    w: 'w-56',
    align: 'left',
    linger: 1.8,
    content: (
      <DataReadout
        label="NEXT MATCH"
        variant="secondary"
        rows={[
          { k: 'vs', v: 'NEMESIS' },
          { k: 'eta', v: '21:00' },
        ]}
      />
    ),
  },
  {
    depth: 4.6,
    left: 50,
    top: 50,
    w: 'max-w-2xl',
    content: (
      <>
        <p className="hud-title text-4xl font-bold uppercase glow-text sm:text-6xl">Bienvenue</p>
        <p className="mt-3 font-mono text-xs uppercase tracking-hud text-[color:var(--text-mute)] sm:text-sm">
          &gt; entrée dans le hub
        </p>
        <p className="mt-6 animate-blink font-mono text-2xl text-accent">▼</p>
      </>
    ),
  },
];

const MAX_DEPTH = Math.max(...ITEMS.map((i) => i.depth));
const SPACING = 900; // px de profondeur par unité
const SCROLL_VH = (MAX_DEPTH + 2) * 60; // longueur de scroll de la séquence

export function DepthDive() {
  const ref = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  // ── Animation de profondeur (un SEUL ScrollTrigger) ──────────
  useEffect(() => {
    if (reduced) return;
    const root = ref.current;
    if (!root) return;
    const layers = Array.from(root.querySelectorAll<HTMLElement>('[data-layer]'));

    const apply = (progress: number) => {
      const cam = -0.3 + progress * (MAX_DEPTH + 0.9);
      layers.forEach((el, i) => {
        const lg = ITEMS[i].linger ?? 1;
        const d = ITEMS[i].depth - cam; // >0 : au fond ; <0 : passée
        let z = -d * SPACING;
        if (z > 500) z = 500; // évite les couches géantes (perf)
        // FENÊTRE de visibilité ÉTROITE par défaut (les gros titres ne
        // s'affichent qu'à leur tour), élargie seulement par `linger` sur
        // les cartes → elles seules coexistent. Côté caméra court (anti-lag).
        const op = d >= 0 ? 1 - d / (1.3 * lg) : 1 + d / (0.9 * lg);
        const o = Math.max(0, Math.min(1, op));
        el.style.transform = `translate(-50%, -50%) translateZ(${z.toFixed(0)}px)`;
        el.style.opacity = o.toFixed(3);
        el.style.visibility = o <= 0.01 ? 'hidden' : 'visible';
      });
      if (barRef.current) barRef.current.style.transform = `scaleY(${progress.toFixed(3)})`;
    };

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: root,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => apply(self.progress),
      });
      apply(0);
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  // ── Auto-scroll lent au chargement (interruptible par l'utilisateur) ──
  useEffect(() => {
    if (reduced) return;
    if (window.scrollY > 10) return;
    let started = false;
    const t = setTimeout(() => {
      const lenis = getLenis();
      if (!lenis || window.scrollY > 10) return;
      started = true;
      // descente jusqu'au hub ; tout wheel/touch utilisateur l'interrompt
      lenis.scrollTo('#hub', { duration: 6, easing: (x: number) => x });
    }, 2200); // laisse passer la boot sequence

    // sécurité : si l'utilisateur scrolle avant le départ, on annule
    const cancel = () => {
      if (!started) clearTimeout(t);
    };
    window.addEventListener('wheel', cancel, { passive: true, once: true });
    window.addEventListener('touchstart', cancel, { passive: true, once: true });
    window.addEventListener('keydown', cancel, { once: true });

    return () => {
      clearTimeout(t);
      window.removeEventListener('wheel', cancel);
      window.removeEventListener('touchstart', cancel);
      window.removeEventListener('keydown', cancel);
    };
  }, [reduced]);

  // ── Fallback reduced-motion : empilement vertical, pas de 3D ──
  if (reduced) {
    return (
      <section className="mx-auto max-w-3xl space-y-16 px-4 py-24 text-center sm:px-6">
        {ITEMS.map((it, i) => (
          <div key={i} className={`mx-auto ${it.w}`}>
            {it.content}
          </div>
        ))}
      </section>
    );
  }

  return (
    <section ref={ref} style={{ height: `${SCROLL_VH}vh` }} className="relative">
      <div className="sticky top-0 h-screen overflow-hidden" style={{ perspective: '1100px' }}>
        {/* dégradé de profondeur */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(65% 65% at 50% 50%, transparent 25%, var(--base-900) 92%)' }}
        />

        <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
          {ITEMS.map((it, i) => (
            <div
              key={i}
              data-layer
              className={`absolute px-4 ${it.w} ${it.align === 'left' ? 'text-left' : it.align === 'right' ? 'text-right' : 'text-center'}`}
              style={{
                left: `${it.left}%`,
                top: `${it.top}%`,
                opacity: 0,
                transform: 'translate(-50%, -50%)',
                willChange: 'transform, opacity',
              }}
            >
              {it.content}
            </div>
          ))}
        </div>

        {/* jauge de profondeur Z */}
        <div className="absolute right-6 top-1/2 hidden h-40 -translate-y-1/2 flex-col items-center gap-2 md:flex">
          <span className="font-mono text-[9px] uppercase tracking-hud text-[color:var(--text-mute)]">Z</span>
          <div className="relative h-full w-px bg-line-strong">
            <div ref={barRef} className="absolute inset-x-0 top-0 h-full origin-top bg-accent" style={{ transform: 'scaleY(0)' }} />
          </div>
        </div>

        <span className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-hud text-[color:var(--text-mute)]">
          [ scroll = profondeur ]
        </span>
      </div>
    </section>
  );
}
