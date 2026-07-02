import { useLayoutEffect, useRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface FunnelStageProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Force de l'inclinaison (deg max aux bords). */
  intensity?: number;
  /** Recul Z max des blocs périphériques (px) — creuse le entonnoir. */
  depth?: number;
  /** Perspective du conteneur (px). Plus petit = effet plus marqué. */
  perspective?: number;
}

/**
 * "Entonnoir" : les enfants marqués `data-tilt` sont inclinés vers le CENTRE
 * du conteneur (point de fuite central) — comme aspirés vers un trou central,
 * ce qui donne du relief. Calcul basé sur la position de chaque bloc, refait
 * au resize. Reduced-motion → aucun tilt (rendu plat, lisible).
 */
export function FunnelStage({
  children,
  intensity = 20,
  depth = 120,
  perspective = 1000,
  className = '',
  style,
  ...rest
}: FunnelStageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    if (reduced) {
      root.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
        el.style.transform = '';
      });
      return;
    }

    const compute = () => {
      const r = root.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const halfW = r.width / 2 || 1;
      const halfH = r.height / 2 || 1;

      root.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
        const b = el.getBoundingClientRect();
        const ex = b.left + b.width / 2;
        const ey = b.top + b.height / 2;
        const dx = Math.max(-1, Math.min(1, (ex - cx) / halfW)); // -1 gauche → 1 droite
        const dy = Math.max(-1, Math.min(1, (ey - cy) / halfH)); // -1 haut → 1 bas
        // inclinaison VERS le centre (bord intérieur qui recule = aspiré)
        const ry = -dx * intensity;
        const rx = dy * intensity;
        const tz = -(Math.hypot(dx, dy) / 1.414) * depth;
        el.style.transform = `translateZ(${tz.toFixed(0)}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
        el.style.transformStyle = 'preserve-3d';
        el.style.backfaceVisibility = 'hidden';
      });
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(root);
    window.addEventListener('resize', compute);
    // recalcul après chargement des polices/images (positions stabilisées)
    const t = window.setTimeout(compute, 300);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', compute);
      window.clearTimeout(t);
    };
  }, [reduced, intensity, depth]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ perspective: `${perspective}px`, perspectiveOrigin: 'center center', ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}
