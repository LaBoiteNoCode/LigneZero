import { useData } from '@/data/DataProvider';
import { AccessBadge } from '@/components/ui/AccessBadge';

/**
 * Staff présenté comme un RACK D'ACCÈS : rail mural en tête, sous lequel
 * pendent les badges d'accès du staff (un par membre). Clic sur un badge =
 * badging + révélation du dossier. Données data/staff.ts — ajouter un membre
 * suffit. Registre visuel distinct du roster (badge sécurisé vs fiche joueur).
 */
export function StaffAccessRack() {
  const { staff } = useData();
  return (
    <div className="mt-10">
      {/* Rail de fixation + libellé zone d'accès */}
      <div className="relative mb-2 flex items-center justify-between gap-3">
        <span className="hud-label text-[10px]">Zone réservée · Contrôle d'accès</span>
        <span className="font-mono text-[10px] uppercase tracking-hud text-[color:var(--text-mute)]">
          {staff.length.toString().padStart(2, '0')} badges
        </span>
      </div>
      <div className="hazard h-3 w-full border-y border-line-strong opacity-70" aria-hidden />

      {/* Rack : badges suspendus */}
      <div className="grid grid-cols-1 gap-x-6 gap-y-12 pt-8 sm:grid-cols-2 lg:grid-cols-4">
        {staff.map((s, i) => (
          <AccessBadge key={s.id} staff={s} index={i} />
        ))}
      </div>
    </div>
  );
}
