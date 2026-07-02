import { PageHeader } from '@/components/layout/PageHeader';
import { CommunityHub } from '@/sections/CommunityHub';
import { PageBackdrop } from '@/components/animation/PageBackdrop';
import { useData } from '@/data/DataProvider';

export default function CommunityPage() {
  const { creators } = useData();
  const liveCount = creators.filter((c) => c.live).length;
  return (
    <div className="relative">
      <PageBackdrop ghost="CREW" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <PageHeader
          code="05"
          title="Communauté"
          subtitle="Lives, créateurs, clips et réseaux — le hub de la communauté."
          meta={
            <span className="hud-title text-5xl font-bold text-accent glow-text">
              {String(liveCount).padStart(2, '0')}
              <span className="ml-2 align-middle font-mono text-xs uppercase tracking-hud text-[color:var(--text-dim)]">live</span>
            </span>
          }
        />
        <CommunityHub />
      </div>
    </div>
  );
}
