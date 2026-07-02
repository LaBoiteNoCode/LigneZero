import { useData } from '@/data/DataProvider';
import { getLiveMatch } from '@/lib/format';

/**
 * Bandeau "LIVE NOW" sticky, affiché uniquement quand un match est en cours.
 * Pulse en rouge, montre l'affiche + score + lien stream. Site-wide.
 */
export function LiveBar() {
  const { matches, games } = useData();
  const live = getLiveMatch(matches);
  if (!live) return null;

  const tag = games.find((g) => g.id === live.gameId)?.tag ?? '—';

  return (
    <div className="sticky top-16 z-40 border-b-2 border-accent bg-base-900/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 sm:px-6">
        <span className="flex items-center gap-2 bg-accent px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-hud text-[color:var(--paper)]">
          <span className="h-1.5 w-1.5 animate-live rounded-full bg-[color:var(--paper)]" />
          LIVE NOW
        </span>

        <p className="min-w-0 flex-1 truncate font-mono text-xs uppercase tracking-hud text-[color:var(--text-dim)]">
          <span className="text-accent">[{tag}]</span> __BRAND__{' '}
          {live.score && (
            <span className="font-bold text-[color:var(--text)]">
              {live.score.us}–{live.score.them}
            </span>
          )}{' '}
          {live.opponent.name} <span className="text-[color:var(--text-mute)]">· {live.competition}</span>
        </p>

        {live.streamUrl && (
          <a
            href={live.streamUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 border-2 border-accent px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-hud text-accent transition-colors hover:bg-accent hover:text-[color:var(--paper)]"
          >
            ▶ Regarder
          </a>
        )}
      </div>
    </div>
  );
}
