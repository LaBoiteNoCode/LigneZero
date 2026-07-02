import { useEffect, useRef, useState } from 'react';
import type { Staff } from '@/types';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { playClick } from '@/lib/sound';

interface AccessBadgeProps {
  staff: Staff;
  index: number;
}

/** Nom d'affichage : pseudo entre guillemets sinon 1er prénom. */
function displayName(name: string) {
  const m = name.match(/"([^"]+)"/);
  return (m ? m[1] : name.split(' ')[0]).toUpperCase();
}

function Silhouette() {
  return (
    <svg viewBox="0 0 100 130" className="h-full w-full" preserveAspectRatio="xMidYMax meet" aria-hidden>
      <circle cx="50" cy="36" r="20" fill="rgba(0,0,0,0.35)" />
      <path d="M12 130 Q14 82 50 80 Q86 82 88 130 Z" fill="rgba(0,0,0,0.35)" />
    </svg>
  );
}

/**
 * Badge d'accès ACRYLIQUE (façon porte-clés esport) suspendu à un cordon.
 * Recto = art rouge détouré + cadre HUD + gros nom + tag RÉSULTAT + œillet.
 * Clic = scan (LED rouge→vert) puis flip vers le dossier (verso). Clavier +
 * reduced-motion. L'ancien style reste dispo dans AccessBadgeClassic.
 */
export function AccessBadge({ staff, index }: AccessBadgeProps) {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const matricule = staff.matricule ?? `STF-${String(index + 1).padStart(3, '0')}`;
  const clearance = staff.clearance ?? 'Niveau 2';
  const granted = open || scanning;
  const dname = displayName(staff.name);

  useEffect(() => () => clearTimeout(timer.current), []);

  function toggle() {
    if (open) {
      playClick('up');
      setOpen(false);
      return;
    }
    playClick('down');
    if (reduced) {
      setOpen(true);
      return;
    }
    setScanning(true);
    timer.current = setTimeout(() => {
      setScanning(false);
      setOpen(true);
      playClick('up');
    }, 620);
  }

  const swayDelay = `${-(index % 4) * 0.9}s`;

  return (
    <div className="badge-unit relative flex flex-col items-center" style={{ perspective: 1200 }}>
      {/* ── Plaque gravée (support mural) ── */}
      <div className="plate-metal relative z-20 w-full max-w-[15rem] overflow-hidden border-2 px-4 py-2 shadow-ink" style={{ borderColor: 'var(--line-strong)' }}>
        <span aria-hidden className="absolute left-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[color:var(--ink)]/40" />
        <span aria-hidden className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[color:var(--ink)]/40" />
        <p className="engrave hud-title text-center text-sm font-bold leading-tight">{staff.name}</p>
        <p className="engrave text-center font-mono text-[9px] uppercase tracking-hud">{staff.division ?? 'Structure'} · {matricule}</p>
        <span className="plate-sheen" aria-hidden />
      </div>

      {/* ── Cordon (webbing) + clip ── */}
      <div className="relative z-10 flex flex-col items-center">
        <div
          className="h-11 w-9"
          style={{ background: 'repeating-linear-gradient(90deg, var(--accent) 0 3px, color-mix(in srgb, var(--accent) 62%, #000) 3px 6px)', clipPath: 'polygon(30% 0,70% 0,62% 100%,38% 100%)' }}
          aria-hidden
        />
        <div className="-mt-1 h-3.5 w-7 border border-black/60 bg-[color:var(--concrete-2)]" style={{ clipPath: 'polygon(14% 0,86% 0,100% 100%,0 100%)' }} aria-hidden />
      </div>

      {/* ── Badge suspendu (flip) ── */}
      <div className="badge-hang relative -mt-0.5 flex w-full flex-col items-center" data-open={open} style={{ animationDelay: swayDelay, perspective: 1100 }}>
        <div className="badge-flip relative w-full max-w-[15rem]" data-open={open} style={{ aspectRatio: '3 / 4.4' }}>
          {/* ══ RECTO : carte acrylique ══ */}
          <button
            type="button"
            onClick={toggle}
            aria-expanded={open}
            aria-hidden={open}
            tabIndex={open ? -1 : 0}
            className="badge-face group absolute inset-0 rounded-[16px] p-[6px] text-left shadow-ink transition-transform duration-ui ease-mech hover:-translate-y-1"
            style={{ background: 'linear-gradient(150deg,#ffffff,#e7e2d6 60%,#cfc9ba)' }}
          >
            {/* œillet */}
            <span aria-hidden className="absolute left-1/2 top-1 h-2.5 w-2.5 -translate-x-1/2 rounded-full border-2 border-[color:var(--ink)]/40 bg-base-900" />

            <span className="relative block h-full w-full overflow-hidden rounded-[11px]">
              {/* ART rouge (photo duotone ou silhouette) */}
              <span
                aria-hidden
                className="absolute inset-0"
                style={{ background: `radial-gradient(120% 80% at 50% 0%, color-mix(in srgb, var(--accent) 78%, #fff) 0%, var(--accent) 45%, color-mix(in srgb, var(--accent) 45%, #0a0a0c) 100%)` }}
              />
              {staff.photo ? (
                <>
                  <img src={staff.photo} alt={staff.name} className="absolute inset-0 h-full w-full object-cover grayscale contrast-125" />
                  <span aria-hidden className="absolute inset-0 mix-blend-multiply" style={{ background: 'var(--accent)', opacity: 0.55 }} />
                  <span aria-hidden className="absolute inset-0 mix-blend-screen" style={{ background: '#3a0d0d', opacity: 0.4 }} />
                </>
              ) : (
                <span className="absolute inset-x-0 bottom-0 top-6 flex items-end justify-center">
                  <Silhouette />
                </span>
              )}
              <span aria-hidden className="halftone absolute inset-0 text-white/10" />

              {/* cadre HUD (cutline blanche + équerres + flèche) */}
              <span aria-hidden className="pointer-events-none absolute inset-2 border border-white/70" style={{ clipPath: 'polygon(0 0,88% 0,100% 8%,100% 100%,0 100%)' }} />
              <span aria-hidden className="pointer-events-none absolute right-2 top-2 h-0 w-0 border-l-[10px] border-t-[10px] border-l-transparent border-t-white/70" />
              {[' -left-0 top-6', ' -right-0 bottom-10'].map((p) => (
                <span key={p} aria-hidden className={`pointer-events-none absolute ${p} h-4 w-4 border-white/60`} />
              ))}

              {/* haut : emblème + tag RÉSULTAT + dot-matrix */}
              <span className="absolute left-2.5 top-2.5 flex h-6 w-6 items-center justify-center bg-base-900/85 font-display text-xs font-bold text-white">◭</span>
              <span className="absolute right-2.5 top-3 flex items-center gap-1">
                <span className="bg-base-900/85 px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-hud text-white">▐ ACCÈS</span>
              </span>
              <span aria-hidden className="absolute right-2.5 top-8 grid grid-cols-3 gap-0.5">
                {Array.from({ length: 9 }).map((_, k) => (
                  <span key={k} className="h-0.5 w-0.5 bg-white/60" />
                ))}
              </span>

              {/* faction / division verticale */}
              <span className="absolute left-2.5 top-12 font-mono text-[9px] font-bold uppercase tracking-hud text-white/85 [writing-mode:vertical-rl]">
                {staff.division ?? 'STRUCTURE'} · {matricule}
              </span>

              {/* LED statut */}
              <span className="absolute right-2.5 bottom-[38%] flex items-center gap-1 font-mono text-[7px] font-bold uppercase tracking-hud text-white">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: granted ? 'var(--signal-ok)' : '#fff', boxShadow: `0 0 6px ${granted ? 'var(--signal-ok)' : '#fff'}` }} />
                {granted ? 'OK' : 'LOCK'}
              </span>

              {/* bas : gros nom + rôle + matricule */}
              <span className="absolute inset-x-0 bottom-0 p-2.5" style={{ background: 'linear-gradient(to top, rgba(10,8,8,0.85), transparent)' }}>
                <span className="block font-display text-3xl font-bold uppercase leading-[0.85] text-white" style={{ textShadow: '0 2px 0 #6a1010, 0 4px 10px rgba(0,0,0,0.6)' }}>
                  {dname}
                </span>
                <span className="mt-0.5 flex items-center justify-between font-mono text-[8px] uppercase tracking-hud text-white/80">
                  <span>{staff.role}</span>
                  <span>{clearance}</span>
                </span>
              </span>

              {scanning && <span className="badge-scan" aria-hidden />}
            </span>

            <span className="absolute bottom-1 right-2 font-mono text-[8px] uppercase tracking-hud text-[color:var(--ink)]/50 opacity-0 transition-opacity duration-ui group-hover:opacity-100">
              [ badger ]
            </span>
          </button>

          {/* ══ VERSO : même design acrylique que le recto ══ */}
          <div
            className="badge-face badge-face--back absolute inset-0 rounded-[16px] p-[6px] shadow-ink"
            style={{ background: 'linear-gradient(150deg,#ffffff,#e7e2d6 60%,#cfc9ba)' }}
            aria-hidden={!open}
          >
            <span aria-hidden className="absolute left-1/2 top-1 h-2.5 w-2.5 -translate-x-1/2 rounded-full border-2 border-[color:var(--ink)]/40 bg-base-900" />

            <span className="relative block h-full w-full overflow-hidden rounded-[11px]">
              {/* art rouge + halftone (identique au recto) */}
              <span aria-hidden className="absolute inset-0" style={{ background: `radial-gradient(120% 80% at 50% 0%, color-mix(in srgb, var(--accent) 78%, #fff) 0%, var(--accent) 45%, color-mix(in srgb, var(--accent) 45%, #0a0a0c) 100%)` }} />
              <span aria-hidden className="halftone absolute inset-0 text-white/10" />
              {/* cadre HUD + flèche */}
              <span aria-hidden className="pointer-events-none absolute inset-2 border border-white/70" style={{ clipPath: 'polygon(0 0,88% 0,100% 8%,100% 100%,0 100%)' }} />
              <span aria-hidden className="pointer-events-none absolute right-2 top-2 h-0 w-0 border-l-[10px] border-t-[10px] border-l-transparent border-t-white/70" />

              {/* haut : emblème + tag DOSSIER + dot-matrix */}
              <span className="absolute left-2.5 top-2.5 z-10 flex h-6 w-6 items-center justify-center bg-base-900/85 font-display text-xs font-bold text-white">◭</span>
              <span className="absolute right-2.5 top-3 z-10 bg-base-900/85 px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-hud text-white">▐ DOSSIER</span>
              <span aria-hidden className="absolute right-2.5 top-8 z-10 grid grid-cols-3 gap-0.5">
                {Array.from({ length: 9 }).map((_, k) => <span key={k} className="h-0.5 w-0.5 bg-white/60" />)}
              </span>

              {/* contenu lisible sur voile sombre */}
              <div className="absolute inset-x-2 bottom-2 top-11 flex flex-col overflow-auto bg-black/45 p-2.5 text-white backdrop-blur-sm">
                <p className="hud-title text-base font-bold leading-tight">{staff.name}</p>
                <p className="mt-0.5 font-mono text-[9px] uppercase tracking-hud text-white/70">{staff.role}</p>
                {staff.bio && <p className="mt-2 font-mono text-[10px] leading-relaxed text-white/75">{staff.bio}</p>}
                <dl className="mt-2.5 grid grid-cols-2 gap-x-2 gap-y-1.5 font-mono text-[9px] uppercase tracking-hud">
                  <div><dt className="text-white/50">Division</dt><dd className="text-white/85">{staff.division ?? '—'}</dd></div>
                  <div><dt className="text-white/50">Habilit.</dt><dd style={{ color: 'var(--signal-ok)' }}>{clearance}</dd></div>
                  <div><dt className="text-white/50">Depuis</dt><dd className="text-white/85">{staff.since ?? '—'}</dd></div>
                  <div><dt className="text-white/50">Statut</dt><dd style={{ color: 'var(--signal-ok)' }}>Actif</dd></div>
                </dl>
                {staff.socials.length > 0 && (
                  <div className="mt-auto flex flex-wrap gap-3 border-t border-white/20 pt-2">
                    {staff.socials.map((soc) => (
                      <a key={soc.label} href={soc.url} target="_blank" rel="noopener noreferrer" tabIndex={open ? 0 : -1} className="font-mono text-[9px] uppercase tracking-hud text-white/70 transition-colors hover:text-white">&gt; {soc.label}</a>
                    ))}
                  </div>
                )}
              </div>

              {/* fermer */}
              <button type="button" onClick={toggle} tabIndex={open ? 0 : -1} className="absolute right-2.5 bottom-2.5 z-20 bg-base-900/85 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-hud text-white/80 transition-colors hover:text-accent">↺ fermer</button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
