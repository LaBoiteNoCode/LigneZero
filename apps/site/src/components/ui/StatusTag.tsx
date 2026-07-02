export type Status = 'upcoming' | 'live' | 'finished';

const MAP: Record<Status, { label: string; color: string; pulse?: boolean }> = {
  upcoming: { label: 'À VENIR', color: 'var(--text-dim)' },
  live: { label: 'LIVE', color: 'var(--signal-live)', pulse: true },
  finished: { label: 'TERMINÉ', color: 'var(--signal-ok)' },
};

/** Pastille de statut HUD (calendrier). LIVE pulse en néon. */
export function StatusTag({ status, className = '' }: { status: Status; className?: string }) {
  const s = MAP[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2 py-0.5 font-mono text-[10px] uppercase tracking-hud ${className}`}
      style={{ color: s.color, borderColor: 'color-mix(in srgb, currentColor 40%, transparent)' }}
    >
      <span
        className={`h-1.5 w-1.5 ${s.pulse ? 'animate-live' : ''}`}
        style={{ background: 'currentColor', boxShadow: s.pulse ? '0 0 6px currentColor' : 'none' }}
      />
      {s.label}
    </span>
  );
}
