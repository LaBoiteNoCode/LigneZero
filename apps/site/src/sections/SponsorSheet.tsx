import { useEffect } from 'react';
import type { Sponsor } from '@/types';
import { Bracket } from '@/components/ui/Bracket';
import { KeycapButton } from '@/components/ui/KeycapButton';

const TIER_LABEL: Record<Sponsor['tier'], string> = {
  principal: 'Partenaire principal',
  officiel: 'Partenaire officiel',
  technique: 'Partenaire technique',
};

/**
 * Fiche partenaire — tiroir HUD CINÉMATIQUE : le panneau s'arme (slide + barre
 * d'accent qui pousse), un scan balaie, un gros numéro de contrat fantôme,
 * puis le contenu se révèle en cascade. Ferme via fond / Échap.
 */
export function SponsorSheet({ sponsor, index, onClose }: { sponsor: Sponsor; index: number; onClose: () => void }) {
  const num = String(index + 1).padStart(3, '0');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const Row = ({ k, v, d }: { k: string; v?: string | number; d: number }) =>
    v ? (
      <div className="fadeup flex items-center justify-between border-b border-line py-3 font-mono text-xs" style={{ ['--d' as string]: `${d}ms` }}>
        <span className="uppercase tracking-hud text-[color:var(--text-mute)]">{k}</span>
        <span className="text-[color:var(--text)]">{v}</span>
      </div>
    ) : null;

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label={`Fiche ${sponsor.name}`}>
      <button type="button" aria-label="Fermer" onClick={onClose} className="absolute inset-0 bg-base-900/85 backdrop-blur-sm" />

      <aside className="animate-slidein-right panel-concrete absolute right-0 top-0 flex h-full w-full max-w-md flex-col overflow-hidden border-l-2 border-accent shadow-ink">
        {/* barre d'accent qui pousse depuis le haut */}
        <span aria-hidden className="grow-y absolute left-0 top-0 h-full w-1 bg-accent" />
        {/* scan qui balaie une fois à l'ouverture */}
        <span
          aria-hidden
          className="sweep-down pointer-events-none absolute inset-x-0 top-0 z-20 h-24"
          style={{ background: 'linear-gradient(to bottom, transparent, color-mix(in srgb, var(--accent) 26%, transparent), transparent)' }}
        />
        {/* numéro de contrat fantôme géant */}
        <span
          aria-hidden
          className="pointer-events-none absolute -right-4 bottom-10 select-none font-display text-[14rem] font-bold leading-none"
          style={{ color: 'transparent', WebkitTextStroke: '1px var(--line-strong)', opacity: 0.4 }}
        >
          {num}
        </span>
        {/* équerres d'angle */}
        <span aria-hidden className="absolute right-3 top-3 h-5 w-5 border-r-2 border-t-2 border-accent" />
        <span aria-hidden className="absolute bottom-3 right-3 h-5 w-5 border-b-2 border-r-2 border-accent" />

        {/* barre titre */}
        <div className="relative z-10 flex items-center justify-between border-b-2 border-line-strong px-5 py-3">
          <span className="hud-label text-[10px]">
            <Bracket>PARTNER {num}</Bracket>
          </span>
          <button type="button" onClick={onClose} aria-label="Fermer" className="font-mono text-xl leading-none text-accent hover:text-[color:var(--text)]">
            ×
          </button>
        </div>

        <div className="relative z-10 flex-1 overflow-y-auto p-6">
          {/* logo / nom (scan auto) */}
          <div className="scan-on-hover fadeup relative mb-6 flex h-32 items-center justify-center overflow-hidden border-2 border-line-strong bg-base-900/60" style={{ ['--d' as string]: '120ms' }}>
            <span
              aria-hidden
              className="sweep-down pointer-events-none absolute inset-x-0 top-0 h-16"
              style={{ background: 'linear-gradient(to bottom, transparent, color-mix(in srgb, var(--accent) 30%, transparent), transparent)' }}
            />
            {sponsor.logo ? (
              <img src={sponsor.logo} alt={sponsor.name} className="max-h-20 max-w-[70%] object-contain" />
            ) : (
              <span className="hud-title text-3xl font-bold tracking-hud">{sponsor.name}</span>
            )}
          </div>

          <p className="fadeup inline-block bg-accent px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-hud text-[color:var(--paper)]" style={{ ['--d' as string]: '180ms' }}>
            {TIER_LABEL[sponsor.tier]}
          </p>

          {sponsor.tagline && (
            <p className="fadeup mt-4 font-display text-xl font-bold uppercase leading-tight text-[color:var(--text)]" style={{ ['--d' as string]: '240ms' }}>
              {sponsor.tagline}
            </p>
          )}

          {sponsor.description && (
            <p className="fadeup mt-4 font-mono text-sm leading-relaxed text-[color:var(--text-dim)]" style={{ ['--d' as string]: '300ms' }}>
              {sponsor.description}
            </p>
          )}

          <div className="mt-6">
            <Row k="Secteur" v={sponsor.sector} d={360} />
            <Row k="Depuis" v={sponsor.since} d={420} />
            <Row k="Apport" v={sponsor.contribution} d={480} />
          </div>
        </div>

        <div className="fadeup relative z-10 border-t-2 border-line-strong p-5" style={{ ['--d' as string]: '540ms' }}>
          <KeycapButton href={sponsor.url} className="w-full">
            &gt; Visiter le site ↗
          </KeycapButton>
        </div>
      </aside>
    </div>
  );
}
