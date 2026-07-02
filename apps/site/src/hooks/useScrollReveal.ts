import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useReducedMotion } from './useReducedMotion';

interface RevealOptions {
  /** Sélecteur des enfants à révéler en cascade. Défaut : `[data-reveal]`. */
  selector?: string;
  /** Décalage entre chaque élément (s). */
  stagger?: number;
  /** Distance de glissement initiale (px). */
  y?: number;
  /** Position du déclenchement dans le viewport. */
  start?: string;
}

/**
 * Révélation "plaques qui s'assemblent et se verrouillent" au scroll.
 * Attache le ref retourné au conteneur ; marque les enfants avec data-reveal.
 * En reduced-motion : tout est visible immédiatement, aucun ScrollTrigger.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>({
  selector = '[data-reveal]',
  stagger = 0.08,
  y = 28,
  start = 'top 82%',
}: RevealOptions = {}) {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const targets = root.querySelectorAll<HTMLElement>(selector);
    if (targets.length === 0) return;

    if (reduced) {
      gsap.set(targets, { autoAlpha: 1, y: 0, clipPath: 'none' });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        {
          autoAlpha: 0,
          y,
          // la plaque arrive coupée puis se "verrouille"
          clipPath: 'inset(0 0 100% 0)',
        },
        {
          autoAlpha: 1,
          y: 0,
          clipPath: 'inset(0 0 0% 0)',
          duration: 0.55,
          ease: 'power3.out',
          stagger,
          scrollTrigger: { trigger: root, start },
        },
      );
    }, root);

    return () => ctx.revert();
  }, [reduced, selector, stagger, y, start]);

  return ref;
}
