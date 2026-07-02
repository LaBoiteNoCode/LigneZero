/**
 * Miroir JS des design tokens — pour le 3D (Three.js veut des hex/number,
 * pas des CSS vars) et les durées d'animation GSAP.
 * Garde ces valeurs synchro avec theme/tokens.css.
 */
export const tokens = {
  color: {
    base900: '#121013',
    base800: '#1a1715',
    base700: '#242019',
    concrete: '#cfcabb',
    paper: '#e8e4da',
    ink: '#0d0d0b',
    accent: '#f23127',
    accent2: '#e8e4da',
    text: '#ece7dd',
    textDim: '#948c7d',
  },
  duration: {
    snap: 0.09,
    ui: 0.22,
    boot: 0.6,
  },
  ease: {
    mech: [0.16, 1, 0.3, 1] as const,
  },
} as const;

/** Lit une CSS var au runtime (respecte un re-skin live). */
export function cssVar(name: string, fallback = ''): string {
  if (typeof window === 'undefined') return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}
