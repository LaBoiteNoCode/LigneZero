import type { ReactNode } from 'react';

/** Texte encadré d'équerres [ … ] — ornement HUD pour titres/labels. */
export function Bracket({
  children,
  tone = 'accent',
  className = '',
}: {
  children: ReactNode;
  tone?: 'accent' | 'dim';
  className?: string;
}) {
  const color = tone === 'accent' ? 'var(--accent)' : 'var(--text-dim)';
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span aria-hidden style={{ color }} className="font-mono">
        [
      </span>
      {children}
      <span aria-hidden style={{ color }} className="font-mono">
        ]
      </span>
    </span>
  );
}
