import { useData } from '@/data/DataProvider';
import { HudFrame } from '@/components/ui/HudFrame';
import { MediaFrame } from '@/components/ui/MediaFrame';
import { FunnelStage } from '@/components/animation/FunnelStage';

/**
 * Liste des jeux. Scalable N jeux (map sur data/games.ts). Chaque jeu affiche
 * son visuel, son palmarès et l'effectif RELIÉ (players.gameId === game.id).
 * Blocs inclinés vers le centre (entonnoir).
 */
export function GamesSection() {
  const { games, players } = useData();
  return (
    <FunnelStage intensity={9} depth={60} perspective={1800} className="mt-10 space-y-10">
      {games.map((game, i) => {
        const roster = players.filter((p) => p.gameId === game.id);
        const flip = i % 2 === 1;

        return (
          <HudFrame
            key={game.id}
            data-tilt
            label={`GAME // ${game.tag}`}
            corner={`${roster.length} JOUEURS`}
            tone="accent"
            className="cut-panel"
          >
            <div className={`grid grid-cols-1 gap-6 p-6 lg:grid-cols-[320px_1fr] ${flip ? 'lg:grid-flow-col-dense' : ''}`}>
              {/* visuel jeu */}
              <div className={flip ? 'lg:col-start-2' : ''}>
                <MediaFrame src={game.visual} alt={game.name} ratio="16/9" label={game.tag} corner="GAME" />
              </div>

              {/* infos + effectif */}
              <div>
                <h2 className="hud-title text-4xl font-bold leading-none glow-text">{game.name}</h2>

                {game.palmares.length > 0 && (
                  <ul className="mt-4 space-y-1">
                    {game.palmares.map((p) => (
                      <li key={p} className="font-mono text-xs text-[color:var(--text-dim)]">
                        <span className="text-accent">▸</span> {p}
                      </li>
                    ))}
                  </ul>
                )}

                {/* effectif (chips) */}
                <p className="hud-label mb-3 mt-6 text-[10px]">[ Effectif ]</p>
                <div className="flex flex-wrap gap-2">
                  {roster.map((p) => (
                    <span
                      key={p.id}
                      className="border-2 border-line-strong bg-base-800 px-3 py-1.5 font-mono text-xs"
                    >
                      <span className="font-bold text-[color:var(--text)]">{p.pseudo}</span>{' '}
                      <span className="text-[color:var(--text-mute)]">· {p.role}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </HudFrame>
        );
      })}
    </FunnelStage>
  );
}
