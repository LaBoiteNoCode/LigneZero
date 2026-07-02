import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { setLenis } from '@/lib/lenis';
import { useReducedMotion } from './useReducedMotion';

/**
 * Smooth scroll global (Lenis) câblé au RAF de GSAP et synchro avec
 * ScrollTrigger. Désactivé proprement si prefers-reduced-motion.
 */
export function useLenis(): void {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);
    setLenis(lenis);

    const onRaf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onRaf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onRaf);
      lenis.destroy();
      setLenis(null);
    };
  }, [reduced]);
}
