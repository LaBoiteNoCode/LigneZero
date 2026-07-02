import type { HTMLAttributes } from 'react';
import { HudFrame } from './HudFrame';

interface Row {
  k: string;
  v: string;
}

interface DataReadoutProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  rows: Row[];
  variant?: 'primary' | 'secondary';
}

/** Petit bloc de télémétrie HUD (paires clé/valeur mono), flottant dans le Hero. */
export function DataReadout({ label, rows, variant = 'primary', className = '', ...rest }: DataReadoutProps) {
  return (
    <HudFrame
      label={label}
      tone="accent"
      variant={variant}
      className={`cut-panel w-56 backdrop-blur-sm ${className}`}
      {...rest}
    >
      <ul className="divide-y divide-[color:var(--line)] p-3">
        {rows.map((r) => (
          <li key={r.k} className="flex items-center justify-between py-1.5 font-mono text-[11px]">
            <span className="uppercase tracking-hud text-[color:var(--text-mute)]">{r.k}</span>
            <span className="text-[color:var(--text)]">{r.v}</span>
          </li>
        ))}
      </ul>
    </HudFrame>
  );
}
