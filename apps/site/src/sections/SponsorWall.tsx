import type { Sponsor, SponsorTier } from '@/types';
import { useData } from '@/data/DataProvider';
import { KeycapCard } from '@/components/ui/KeycapCard';
import { Bracket } from '@/components/ui/Bracket';
import { FunnelStage } from '@/components/animation/FunnelStage';

const TIERS: { id: SponsorTier; label: string }[] = [
  { id: 'principal', label: 'Partenaire principal' },
  { id: 'officiel', label: 'Partenaires officiels' },
  { id: 'technique', label: 'Partenaires techniques' },
];

function SponsorCell({ s, big }: { s: Sponsor; big?: boolean }) {
  return (
    <a href={s.url} target="_blank" rel="noopener noreferrer" data-tilt className="block">
      <KeycapCard interactive className={`flex items-center justify-center p-6 ${big ? 'h-32 sm:h-40' : 'h-24'}`}>
        {s.logo ? (
          <img src={s.logo} alt={s.name} className="max-h-full max-w-full object-contain grayscale transition group-hover:grayscale-0" />
        ) : (
          <span className={`hud-title font-bold tracking-hud text-[color:var(--text-dim)] transition-colors group-hover:text-[color:var(--text)] ${big ? 'text-2xl sm:text-3xl' : 'text-lg'}`}>
            {s.name}
          </span>
        )}
      </KeycapCard>
    </a>
  );
}

/** Mur de partenaires groupés par niveau. Données data/sponsors.ts. */
export function SponsorWall() {
  const { sponsors } = useData();
  return (
    <div className="mt-10 space-y-12">
      {TIERS.map((tier) => {
        const list = sponsors.filter((s) => s.tier === tier.id);
        if (list.length === 0) return null;
        const principal = tier.id === 'principal';

        return (
          <div key={tier.id}>
            <p className="hud-label mb-5 flex items-center gap-3 text-xs">
              <Bracket>{tier.label}</Bracket>
              <span className="h-px flex-1 bg-line-strong" />
              <span className="text-[color:var(--text-mute)]">{list.length}</span>
            </p>
            <FunnelStage
              intensity={12}
              depth={70}
              perspective={1600}
              className={
                principal
                  ? 'grid grid-cols-1'
                  : 'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'
              }
            >
              {list.map((s) => (
                <SponsorCell key={s.id} s={s} big={principal} />
              ))}
            </FunnelStage>
          </div>
        );
      })}
    </div>
  );
}
