import { PageHeader } from '@/components/layout/PageHeader';
import { SponsorShowcase } from '@/sections/SponsorShowcase';
import { PageBackdrop } from '@/components/animation/PageBackdrop';
import { useData } from '@/data/DataProvider';

export default function SponsorsPage() {
  const { sponsors } = useData();
  return (
    <div className="relative">
      <PageBackdrop ghost="CORPO" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <PageHeader
          code="04"
          title="Sponsors"
          subtitle="Ils construisent le projet avec nous. Clique une plaque pour la fiche partenaire."
          meta={
            <span className="hud-title text-5xl font-bold text-accent glow-text">
              {String(sponsors.length).padStart(2, '0')}
            </span>
          }
        />
        <SponsorShowcase />
      </div>
    </div>
  );
}
