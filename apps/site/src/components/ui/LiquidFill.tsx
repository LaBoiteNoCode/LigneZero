interface LiquidFillProps {
  /** Hauteur du liquide en % de la case (reste sous le titre). */
  height?: number;
  variant?: 'primary' | 'secondary';
}

// Vague tuilée (période 300, 4 périodes sur 1200 → boucle propre à -50%).
const WAVE = 'M0 90 Q75 50 150 90 T300 90 T450 90 T600 90 T750 90 T900 90 T1050 90 T1200 90 V200 H0 Z';

/**
 * Liquide rouge qui ondule au fond d'une case. Vagues 100% CSS (aucun JS,
 * aucun rAF). Le balancement (slosh) est piloté par la variable CSS `--lt`
 * posée par la case parente uniquement au survol → réagit seulement quand le
 * curseur est DANS la case. Décoratif, sous le contenu.
 */
export function LiquidFill({ height = 42, variant = 'primary' }: LiquidFillProps) {
  const color = variant === 'secondary' ? 'var(--accent-2)' : 'var(--accent)';

  return (
    <div className="liquid-fill" style={{ height: `${height}%` }} aria-hidden>
      <div className="liquid-tilt">
        <svg className="liquid-wave liquid-wave-2" viewBox="0 0 1200 200" preserveAspectRatio="none">
          <path d={WAVE} fill={color} />
        </svg>
        <svg className="liquid-wave liquid-wave-1" viewBox="0 0 1200 200" preserveAspectRatio="none">
          <path d={WAVE} fill={color} fillOpacity={0.85} />
        </svg>
      </div>
      <div
        className="absolute inset-x-0 bottom-0 h-1/2"
        style={{ background: `linear-gradient(to top, ${color}, transparent)`, opacity: 0.5 }}
      />
    </div>
  );
}
