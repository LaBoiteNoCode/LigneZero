import type Lenis from 'lenis';

/**
 * Singleton de l'instance Lenis active, pour piloter le smooth scroll hors
 * du hook (ex. auto-scroll du DepthDive via lenis.scrollTo).
 */
let instance: Lenis | null = null;

export function setLenis(l: Lenis | null) {
  instance = l;
}

export function getLenis(): Lenis | null {
  return instance;
}
