/**
 * Calques de fond BRUTALIST pour le Hero : champ halftone qui se densifie,
 * bandes béton diagonales, gros numéro fantôme, bande hazard. Aucune lueur
 * néon — la profondeur vient des superpositions et du contraste de matière.
 * `data-depth` pour réagir à la parallaxe du parent.
 */
export function BackgroundFX() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* champ halftone (coin haut-droit, dégradé d'opacité) */}
      <div
        data-depth="8"
        className="halftone absolute -right-20 -top-20 h-[60vh] w-[60vh] text-[color:var(--accent)] opacity-[0.18]"
        style={{ maskImage: 'radial-gradient(circle at 70% 30%, #000, transparent 70%)' }}
      />

      {/* grosse barre béton diagonale (bloc de matière) */}
      <div
        data-depth="16"
        className="concrete absolute -left-40 top-[72%] h-40 w-[140%] -rotate-[5deg] opacity-[0.9] shadow-ink"
      />
      {/* liseré rouge collé à la barre */}
      <div
        data-depth="16"
        className="absolute -left-40 top-[72%] h-2 w-[140%] -rotate-[5deg] bg-accent"
      />

      {/* numéro de section fantôme, énorme */}
      <div
        data-depth="5"
        className="absolute right-[6%] top-[8%] select-none font-display text-[18vw] font-bold leading-none text-[color:var(--base-700)] opacity-60"
      >
        00
      </div>

      {/* bande hazard verticale (bord gauche) */}
      <div data-depth="22" className="hazard absolute bottom-0 left-0 top-0 w-3 opacity-70" />

      {/* grosse croix de visée technique */}
      <div data-depth="30" className="absolute right-[12%] top-[40%] h-24 w-24 opacity-50">
        <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-line-bright" />
        <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-line-bright" />
        <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 border border-accent" />
      </div>
    </div>
  );
}
