import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * Curseur HUD : un point central rouge + un réticule "lock-on" (4 équerres)
 * qui suit la souris et SE VERROUILLE sur les éléments interactifs (boutons,
 * liens, cartes), en s'ajustant à leur taille. Désactivé en tactile / sans
 * pointeur fin / reduced-motion (curseur natif conservé).
 */
export function HudCursor() {
  const reduced = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced || !window.matchMedia('(pointer: fine)').matches) return;
    setEnabled(true);
    document.documentElement.classList.add('hud-cursor-on');

    let mx = innerWidth / 2;
    let my = innerHeight / 2;
    let rx = mx;
    let ry = my;
    let target: HTMLElement | null = null;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      target = (e.target as HTMLElement)?.closest?.(
        'a, button, [role="button"], input, label, [data-cursor]',
      ) as HTMLElement | null;
    };

    const tick = () => {
      const d = dot.current;
      const r = ring.current;
      if (d) d.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;

      if (r) {
        if (target) {
          const b = target.getBoundingClientRect();
          const cx = b.left + b.width / 2;
          const cy = b.top + b.height / 2;
          rx += (cx - rx) * 0.25;
          ry += (cy - ry) * 0.25;
          r.style.width = `${b.width + 14}px`;
          r.style.height = `${b.height + 14}px`;
          r.dataset.lock = '1';
        } else {
          rx += (mx - rx) * 0.3;
          ry += (my - ry) * 0.3;
          r.style.width = '26px';
          r.style.height = '26px';
          r.dataset.lock = '0';
        }
        r.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.classList.remove('hud-cursor-on');
    };
  }, [reduced]);

  if (!enabled) return null;

  const corner = 'absolute h-2 w-2 transition-colors';
  return (
    <>
      <div
        ref={dot}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[120] h-1.5 w-1.5 bg-accent"
        style={{ boxShadow: '0 0 6px var(--accent)' }}
      />
      <div
        ref={ring}
        aria-hidden
        data-lock="0"
        className="hud-ring pointer-events-none fixed left-0 top-0 z-[120]"
        style={{ width: 26, height: 26 }}
      >
        <span className={`${corner} left-0 top-0 border-l-2 border-t-2`} />
        <span className={`${corner} right-0 top-0 border-r-2 border-t-2`} />
        <span className={`${corner} bottom-0 left-0 border-b-2 border-l-2`} />
        <span className={`${corner} bottom-0 right-0 border-b-2 border-r-2`} />
      </div>
    </>
  );
}
