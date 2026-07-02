import { useEffect, useState } from 'react';

interface CountdownProps {
  /** Date cible ISO. */
  target: string;
  className?: string;
}

function diff(target: string) {
  const ms = Math.max(0, new Date(target).getTime() - Date.now());
  const s = Math.floor(ms / 1000);
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
    done: ms <= 0,
  };
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Compte à rebours HUD (mise à jour chaque seconde). */
export function Countdown({ target, className = '' }: CountdownProps) {
  const [t, setT] = useState(() => diff(target));

  useEffect(() => {
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const Cell = ({ v, l }: { v: number; l: string }) => (
    <div className="text-center">
      <span className="hud-title block text-2xl font-bold leading-none text-accent sm:text-3xl">{pad(v)}</span>
      <span className="hud-label text-[8px]">{l}</span>
    </div>
  );

  return (
    <div className={`flex items-center gap-3 font-mono ${className}`}>
      <Cell v={t.d} l="J" />
      <span className="text-[color:var(--text-mute)]">:</span>
      <Cell v={t.h} l="H" />
      <span className="text-[color:var(--text-mute)]">:</span>
      <Cell v={t.m} l="M" />
      <span className="text-[color:var(--text-mute)]">:</span>
      <Cell v={t.s} l="S" />
    </div>
  );
}
