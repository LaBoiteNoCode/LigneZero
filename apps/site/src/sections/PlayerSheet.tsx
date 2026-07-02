import { useEffect } from 'react';
import type { Player, Game } from '@/types';
import { MediaFrame } from '@/components/ui/MediaFrame';
import { Bracket } from '@/components/ui/Bracket';
import { KeycapButton } from '@/components/ui/KeycapButton';

interface PlayerSheetProps {
  player: Player;
  game?: Game;
  onClose: () => void;
}

/** Fiche détail joueur — overlay "data sheet" mecha. Ferme via fond / Échap. */
export function PlayerSheet({ player, game, onClose }: PlayerSheetProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const fullName = [player.firstName, player.lastName].filter(Boolean).join(' ');

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Fiche ${player.pseudo}`}
    >
      {/* fond */}
      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className="absolute inset-0 bg-base-900/85 backdrop-blur-sm"
      />

      {/* panneau */}
      <div className="cut-panel panel-concrete relative grid w-full max-w-3xl grid-cols-1 gap-0 border-2 border-line-strong shadow-ink md:grid-cols-[280px_1fr]">
        {/* barre titre */}
        <div className="absolute -top-px left-0 right-0 flex items-center justify-between border-b-2 border-line-strong bg-base-900/80 px-4 py-2">
          <span className="hud-label text-[10px]">
            <Bracket>DATA SHEET</Bracket> {game?.tag ?? '—'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-lg leading-none text-accent hover:text-[color:var(--text)]"
            aria-label="Fermer"
          >
            ×
          </button>
        </div>

        {/* portrait */}
        <div className="p-4 pt-14">
          <MediaFrame
            src={player.photo}
            alt={player.pseudo}
            ratio="3/4"
            label={player.role}
            corner={player.country}
          />
        </div>

        {/* infos */}
        <div className="p-4 pt-14 md:pr-6">
          <h2 className="hud-title text-4xl font-bold leading-none glow-text">{player.pseudo}</h2>
          {fullName && <p className="mt-1 font-mono text-sm text-[color:var(--text-dim)]">{fullName}</p>}
          <p className="mt-3 inline-block bg-accent px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-hud text-[color:var(--paper)]">
            {player.role}
          </p>

          {/* stats */}
          <div className="mt-5 grid grid-cols-3 gap-px border border-line bg-line">
            {player.stats.map((s) => (
              <div key={s.label} className="bg-base-800 p-3 text-center">
                <p className="hud-title text-xl font-bold text-accent">{s.value}</p>
                <p className="hud-label mt-1 text-[9px]">{s.label}</p>
              </div>
            ))}
          </div>

          {/* palmarès */}
          {player.palmares.length > 0 && (
            <div className="mt-5">
              <p className="hud-label mb-2 text-[10px]">[ Palmarès ]</p>
              <ul className="space-y-1">
                {player.palmares.map((p) => (
                  <li key={p} className="font-mono text-xs text-[color:var(--text-dim)]">
                    <span className="text-accent">&gt;</span> {p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* méta + socials */}
          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-line pt-4">
            {player.joinedYear && (
              <span className="font-mono text-[10px] uppercase tracking-hud text-[color:var(--text-mute)]">
                EST. {player.joinedYear}
              </span>
            )}
            {player.socials.map((s) => (
              <KeycapButton key={s.label} href={s.url} size="sm" variant="secondary">
                {s.label}
              </KeycapButton>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
