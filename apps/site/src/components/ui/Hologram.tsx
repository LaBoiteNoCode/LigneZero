interface HologramProps {
  text: string;
  /** Classes de taille/typo (ex. "text-4xl"). */
  className?: string;
  /** Taille de la base lumineuse (émetteur) sous l'hologramme, en px. */
  baseWidth?: number;
}

/**
 * Hologramme texte : glow accent + frange chromatique cyan/magenta + scanlines
 * mouvantes + flicker + flottement, avec une base lumineuse (émetteur) dessous.
 * Effet 100% CSS (aucun filtre SVG → pas de lag).
 */
export function Hologram({ text, className = '', baseWidth = 120 }: HologramProps) {
  return (
    <div className="holo relative inline-flex flex-col items-center">
      <div className={`holo-text whitespace-nowrap font-display font-bold uppercase tracking-hud ${className}`} data-text={text}>
        {text}
      </div>
      <div className="holo-scanlines" />
      <div className="holo-base" style={{ width: baseWidth, height: baseWidth * 0.22, bottom: -baseWidth * 0.16 }} />
    </div>
  );
}
