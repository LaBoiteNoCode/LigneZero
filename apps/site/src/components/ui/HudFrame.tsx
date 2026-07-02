import type { HTMLAttributes, ReactNode } from 'react';

interface HudFrameProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Label technique affiché en haut-gauche (style [ SECTION ]). */
  label?: string;
  /** Texte/élément aligné en haut-droite (code, statut, coord). */
  corner?: ReactNode;
  variant?: 'primary' | 'secondary';
  /** Couleur des équerres + lignes. Sinon hérite de la variante. */
  tone?: 'accent' | 'dim';
  /** Affiche les 4 équerres d'angle (signature HUD). Défaut: true. */
  brackets?: boolean;
}

/**
 * Cadre HUD hard-surface : panneau anthracite + équerres d'angle [ ]
 * (les "L" coupés des réfs sci-fi), label technique optionnel, fines
 * lignes de blindage. Brique d'encadrement des sections et blocs data.
 * Pas de glow par défaut — l'accent souligne seulement les arêtes.
 */
export function HudFrame({
  children,
  label,
  corner,
  variant = 'primary',
  tone = 'dim',
  brackets = true,
  className = '',
  ...rest
}: HudFrameProps) {
  const edge = variant === 'secondary' ? 'var(--accent-2)' : 'var(--accent)';
  const bracketColor = tone === 'accent' ? edge : 'var(--line-bright)';

  const Corner = ({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) => {
    const base = 'absolute h-[var(--corner)] w-[var(--corner)] z-10';
    const map: Record<string, string> = {
      tl: 'left-0 top-0 border-l-2 border-t-2',
      tr: 'right-0 top-0 border-r-2 border-t-2',
      bl: 'left-0 bottom-0 border-l-2 border-b-2',
      br: 'right-0 bottom-0 border-r-2 border-b-2',
    };
    return <span aria-hidden className={`${base} ${map[pos]}`} style={{ borderColor: bracketColor }} />;
  };

  return (
    <div
      className={`panel-concrete relative border-2 ${className}`}
      style={{ borderColor: 'var(--line-strong)' }}
      {...rest}
    >
      {brackets && (
        <>
          <Corner pos="tl" />
          <Corner pos="tr" />
          <Corner pos="bl" />
          <Corner pos="br" />
        </>
      )}

      {(label || corner) && (
        <div className="flex items-center justify-between border-b border-line px-3 py-1.5">
          {label && (
            <span className="font-mono text-[10px] uppercase tracking-hud text-[color:var(--text-dim)]">
              <span style={{ color: edge }}>[</span> {label}{' '}
              <span style={{ color: edge }}>]</span>
            </span>
          )}
          {corner && (
            <span className="font-mono text-[10px] uppercase tracking-hud text-[color:var(--text-mute)]">
              {corner}
            </span>
          )}
        </div>
      )}

      {children}
    </div>
  );
}
