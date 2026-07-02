import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from './useReducedMotion';

interface CounterOptions {
  to: number;
  duration?: number; // s
  /** Décimales à afficher. */
  decimals?: number;
  /** Démarre seulement à l'entrée dans le viewport. */
  startOnView?: boolean;
}

/**
 * Compteur qui s'incrémente (stat HUD). Retourne la valeur formatée et un
 * ref à poser sur l'élément observé. En reduced-motion : valeur finale directe.
 */
export function useCounter<T extends HTMLElement = HTMLSpanElement>({
  to,
  duration = 1.4,
  decimals = 0,
  startOnView = true,
}: CounterOptions) {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion();
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (reduced) {
      setValue(to);
      return;
    }

    const run = () => {
      if (started.current) return;
      started.current = true;
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / (duration * 1000));
        // easeOutCubic
        const eased = 1 - Math.pow(1 - p, 3);
        setValue(to * eased);
        if (p < 1) requestAnimationFrame(tick);
        else setValue(to);
      };
      requestAnimationFrame(tick);
    };

    if (!startOnView) {
      run();
      return;
    }

    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && run()),
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to, duration, startOnView, reduced]);

  return { ref, value: value.toFixed(decimals) };
}
