import type { ButtonHTMLAttributes, ReactNode } from 'react';

/** Bouton keycap sobre : plein (accent) ou ghost (contour). */
export function Button({
  variant = 'solid',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'solid' | 'ghost' | 'danger' }) {
  const base =
    'inline-flex items-center justify-center gap-2 px-4 py-2 font-mono text-xs uppercase tracking-hud ' +
    'transition-colors disabled:opacity-40 disabled:pointer-events-none';
  const styles = {
    solid: 'bg-accent text-ink hover:brightness-110',
    ghost: 'border border-line-strong text-[color:var(--text)] hover:border-line-bright hover:bg-base-700',
    danger: 'border border-[color:var(--accent)] text-accent hover:bg-accent hover:text-ink',
  }[variant];
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 font-mono text-xs text-[color:var(--text-mute)]">
      <span className="h-3 w-3 animate-spin border border-[color:var(--accent)] border-t-transparent" />
      {label ?? 'Chargement…'}
    </div>
  );
}

export function Badge({ children, tone = 'mute' }: { children: ReactNode; tone?: 'mute' | 'live' | 'ok' | 'warn' }) {
  const c = {
    mute: 'border-line-strong text-[color:var(--text-mute)]',
    live: 'border-[color:var(--signal-live)] text-[color:var(--signal-live)]',
    ok: 'border-[color:var(--signal-ok)] text-[color:var(--signal-ok)]',
    warn: 'border-[color:var(--signal-warn)] text-[color:var(--signal-warn)]',
  }[tone];
  return (
    <span className={`inline-block border px-2 py-0.5 font-mono text-[10px] uppercase tracking-hud ${c}`}>
      {children}
    </span>
  );
}

export function Panel({
  title,
  right,
  children,
  className = '',
}: {
  title?: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel ${className}`}>
      {(title || right) && (
        <header className="flex items-center justify-between border-b border-line-strong px-4 py-2">
          {title && <span className="hud-label text-[11px]">{title}</span>}
          {right}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

/** Overlay modal centré, fond assombri. */
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 sm:p-8"
      onMouseDown={onClose}
    >
      <div
        className="panel my-8 w-full max-w-2xl shadow-ink"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-line-strong px-4 py-3">
          <span className="font-display text-sm font-bold uppercase tracking-hud">{title}</span>
          <button
            onClick={onClose}
            className="font-mono text-xs text-[color:var(--text-mute)] hover:text-accent"
          >
            ✕ fermer
          </button>
        </header>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
