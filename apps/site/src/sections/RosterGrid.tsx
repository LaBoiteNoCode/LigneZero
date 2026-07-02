import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '@/data/DataProvider';
import { KeycapCard } from '@/components/ui/KeycapCard';
import { MediaFrame } from '@/components/ui/MediaFrame';
import { FunnelStage } from '@/components/animation/FunnelStage';
import { playerSlug } from '@/lib/format';

const ALL = 'all';

/** Grille roster filtrable par jeu. Clic carte → page joueur dédiée. */
export function RosterGrid() {
  const { players: allPlayers, games } = useData();
  const [filter, setFilter] = useState<string>(ALL);

  const list = useMemo(
    () => (filter === ALL ? allPlayers : allPlayers.filter((p) => p.gameId === filter)),
    [filter, allPlayers],
  );

  const Tab = ({ id, label }: { id: string; label: string }) => {
    const active = filter === id;
    return (
      <button
        type="button"
        onClick={() => setFilter(id)}
        className={[
          'border-2 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-hud transition-all duration-snap',
          active
            ? 'border-accent bg-accent text-[color:var(--paper)] shadow-ink-sm'
            : 'border-line-strong text-[color:var(--text-dim)] hover:border-accent hover:text-[color:var(--text)]',
        ].join(' ')}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="mt-10">
      {/* filtres */}
      <div className="mb-8 flex flex-wrap gap-2">
        <Tab id={ALL} label={`Tous · ${allPlayers.length}`} />
        {games.map((g) => (
          <Tab key={g.id} id={g.id} label={`${g.tag} · ${allPlayers.filter((p) => p.gameId === g.id).length}`} />
        ))}
      </div>

      {/* grille — cartes inclinées vers le centre (entonnoir) */}
      <FunnelStage
        intensity={14}
        depth={90}
        perspective={1500}
        className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      >
        {list.map((p) => (
          <Link key={p.id} to={`/equipe/${playerSlug(p.pseudo)}`} data-tilt className="block text-left">
            <KeycapCard interactive className="h-full p-0">
              <MediaFrame
                src={p.photo}
                alt={p.pseudo}
                ratio="3/4"
                label={games.find((g) => g.id === p.gameId)?.tag}
                corner={p.country}
                className="!border-0 !shadow-none"
              />
              <div className="p-3">
                <p className="hud-title text-lg font-bold leading-none">{p.pseudo}</p>
                <p className="hud-label mt-1.5 text-[9px]">{p.role}</p>
              </div>
            </KeycapCard>
          </Link>
        ))}
      </FunnelStage>
    </div>
  );
}
