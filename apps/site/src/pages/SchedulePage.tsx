import { PageHeader } from '@/components/layout/PageHeader';
import { MatchTickets } from '@/sections/MatchTickets';
import { PageBackdrop } from '@/components/animation/PageBackdrop';

export default function SchedulePage() {
  return (
    <div className="relative">
      <PageBackdrop ghost="MATCHS" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <PageHeader
          code="05"
          title="Calendrier"
          subtitle="Tes tickets de match. Déplace-les, ouvre-en un, et déchire-le pour accéder au live ou à la VOD."
        />
        <MatchTickets />
      </div>
    </div>
  );
}
