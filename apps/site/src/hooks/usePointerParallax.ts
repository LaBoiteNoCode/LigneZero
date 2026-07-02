import { useEffect, useRef } from 'react';
import { useReducedMotion } from './useReducedMotion';

/**
 * Parallaxe au pointeur : déplace les enfants marqués `data-depth="N"`
 * (N = force, ex. 6, 14, 24) selon la position de la souris, créant des
 * couches de profondeur. Lissé via lerp + RAF. Désactivé en reduced-motion
 * et sur écrans tactiles (pas de pointeur fin).
 */
export function usePointerParallax<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const root = ref.current;
    if (!root || reduced) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const layers = Array.from(root.querySelectorAll<HTMLElement>('[data-depth]')).map((el) => ({
      el,
      depth: parseFloat(el.dataset.depth || '0'),
    }));
    if (layers.length === 0) return;

    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      // -0.5 → 0.5 relatif au centre du conteneur
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
    };

    const tick = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      for (const { el, depth } of layers) {
        el.style.transform = `translate3d(${(-cx * depth).toFixed(2)}px, ${(-cy * depth).toFixed(2)}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return ref;
}
