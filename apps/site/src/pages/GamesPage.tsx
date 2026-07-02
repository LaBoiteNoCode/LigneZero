import { PageHeader } from '@/components/layout/PageHeader';
import { GamesSection } from '@/sections/GamesSection';
import { useData } from '@/data/DataProvider';

export default function GamesPage() {
  const { games } = useData();
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <PageHeader
        code="03"
        title="Jeux"
        subtitle="Nos disciplines et les effectifs associés."
        meta={
          <span className="hud-title text-5xl font-bold text-accent glow-text">
            {String(games.length).padStart(2, '0')}
          </span>
        }
      />
      <GamesSection />
    </div>
  );
}
