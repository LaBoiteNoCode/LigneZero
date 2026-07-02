/**
 * Grain film global : trame de bruit SVG (feTurbulence) figée au-dessus du
 * viewport, mélangée en soft-light. Donne une matière "photocopie/béton"
 * qui casse les aplats. Non interactif, ~0 coût runtime (statique).
 */
const NOISE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'>
      <filter id='n'>
        <feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/>
        <feColorMatrix type='saturate' values='0'/>
      </filter>
      <rect width='100%' height='100%' filter='url(#n)'/>
    </svg>`,
  );

export function GrainOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60] opacity-[0.07] mix-blend-soft-light"
      style={{ backgroundImage: `url("${NOISE}")`, backgroundSize: '160px 160px' }}
    />
  );
}
