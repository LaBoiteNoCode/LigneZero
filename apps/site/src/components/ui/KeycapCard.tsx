import type { HTMLAttributes, ReactNode } from 'react';
import { ScanlineOverlay } from '@/components/animation/ScanlineOverlay';

interface KeycapCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  /** Carte cliquable : ajoute le feedback press + curseur. */
  interactive?: boolean;
  /** Scanlines CRT discrètes au survol. */
  scanlines?: boolean;
}

/**
 * Carte hard-surface réagissant comme une keycap : élévation au survol,
 * enfoncement au press, arêtes accent qui s'allument. Coins biseautés
 * (clip-path), fond anthracite. Base des grilles joueurs/staff/produits.
 */
export function KeycapCard({
  children,
  variant = 'primary',
  interactive = false,
  scanlines = false,
  className = '',
  ...rest
}: KeycapCardProps) {
  const accent = variant === 'secondary' ? 'var(--accent-2)' : 'var(--accent)';

  return (
    <div
      className={[
        'cut-panel panel-concrete group relative border-2',
        'shadow-keycap transition-all duration-ui ease-mech',
        interactive
          ? 'cursor-pointer hover:-translate-x-1 hover:-translate-y-1 hover:shadow-ink active:translate-x-0 active:translate-y-0 active:shadow-keycap-press'
          : '',
        className,
      ].join(' ')}
      style={{ borderColor: 'var(--line-strong)' }}
      {...rest}
    >
      {/* barre accent pleine au survol (pas de glow) */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-1 opacity-0 transition-opacity duration-ui group-hover:opacity-100"
        style={{ background: accent }}
      />
      {scanlines && (
        <div className="absolute inset-0 opacity-0 transition-opacity duration-ui group-hover:opacity-100">
          <ScanlineOverlay opacity={0.07} />
        </div>
      )}
      <div className="relative">{children}</div>
    </div>
  );
}
