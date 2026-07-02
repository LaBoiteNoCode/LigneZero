/**
 * Micro "clac" de switch mécanique, synthétisé (pas de fichier audio).
 * Off par défaut côté composants. Toujours désactivé en reduced-motion.
 * Activable globalement via setSoundEnabled().
 */
let enabled = false;
let ctx: AudioContext | null = null;

export function setSoundEnabled(v: boolean) {
  enabled = v;
}

export function isSoundEnabled() {
  return enabled;
}

function reducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Joue un clic court. `kind` : down (enfoncement) ou up (relâche). */
export function playClick(kind: 'down' | 'up' = 'down') {
  if (!enabled || reducedMotion() || typeof window === 'undefined') return;
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = kind === 'down' ? 220 : 320;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.06, t + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.06);
  } catch {
    /* audio indisponible : on ignore silencieusement */
  }
}
