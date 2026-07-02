import type { HTMLAttributes } from 'react';

type Ratio = '3/4' | '4/5' | '1/1' | '16/9' | '4/3';
type Treatment = 'duotone' | 'mono' | 'raw';

interface MediaFrameProps extends HTMLAttributes<HTMLDivElement> {
  /** Source image. Si absent → placeholder stylé (l'emplacement reste lisible). */
  src?: string;
  alt?: string;
  ratio?: Ratio;
  /** Traitement DA : duotone (ink→rouge), mono (N&B), raw (brut). */
  treatment?: Treatment;
  label?: string;
  corner?: string;
  variant?: 'primary' | 'secondary';
  /** Trame halftone par-dessus (print). */
  halftone?: boolean;
}

/**
 * Emplacement VISUEL au langage brutalist : cadre cutline, bordure épaisse,
 * équerres d'angle, traitement duotone rouge, halftone, label technique.
 * Sert aux photos joueurs/staff, rendus maillot, key art, logos.
 * Sans `src`, affiche un placeholder « VISUAL FEED » : la maquette tient
 * AVANT même d'avoir les assets. Dépose les images dans `public/img/`.
 */
export function MediaFrame({
  src,
  alt = '',
  ratio = '3/4',
  treatment = 'duotone',
  label,
  corner,
  variant = 'primary',
  halftone = true,
  className = '',
  ...rest
}: MediaFrameProps) {
  const edge = variant === 'secondary' ? 'var(--accent-2)' : 'var(--accent)';

  const Corner = ({ p }: { p: 'tl' | 'tr' | 'bl' | 'br' }) => {
    const map: Record<string, string> = {
      tl: 'left-0 top-0 border-l-2 border-t-2',
      tr: 'right-0 top-0 border-r-2 border-t-2',
      bl: 'left-0 bottom-0 border-l-2 border-b-2',
      br: 'right-0 bottom-0 border-r-2 border-b-2',
    };
    return (
      <span aria-hidden className={`absolute z-20 h-4 w-4 ${map[p]}`} style={{ borderColor: edge }} />
    );
  };

  return (
    <div
      className={`group relative border-2 panel-concrete shadow-ink ${className}`}
      style={{ borderColor: 'var(--line-strong)', aspectRatio: ratio.replace('/', ' / ') }}
      {...rest}
    >
      <div className="cut-panel relative h-full w-full overflow-hidden">
        {src ? (
          <img
            src={src}
            alt={alt}
            loading="lazy"
            className={[
              'h-full w-full object-cover',
              treatment !== 'raw' ? 'grayscale contrast-[1.05]' : '',
              'transition-transform duration-ui ease-mech group-hover:scale-[1.04]',
            ].join(' ')}
          />
        ) : (
          /* Placeholder : l'emplacement reste fort sans asset */
          <div className="hazard absolute inset-0 opacity-[0.18]" aria-hidden />
        )}

        {/* duotone (sur photo uniquement) : ombres → ink, hautes lumières → accent */}
        {src && treatment === 'duotone' && (
          <>
            <div className="absolute inset-0 mix-blend-multiply" style={{ background: 'var(--ink)', opacity: 0.55 }} aria-hidden />
            <div className="absolute inset-0 mix-blend-screen" style={{ background: edge, opacity: 0.35 }} aria-hidden />
          </>
        )}

        {src && halftone && (
          <div
            className="halftone pointer-events-none absolute inset-0 text-[color:var(--ink)] opacity-[0.12]"
            aria-hidden
          />
        )}

        {/* texte placeholder centré quand pas d'image */}
        {!src && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
            <span className="font-mono text-[10px] uppercase tracking-hud text-[color:var(--text-mute)]">
              <span style={{ color: edge }}>[</span> visual feed <span style={{ color: edge }}>]</span>
            </span>
            <span className="font-display text-2xl font-bold uppercase text-[color:var(--text-dim)]">
              {label ?? 'NO SIGNAL'}
            </span>
            <span className="font-mono text-[9px] text-[color:var(--text-mute)]">/ public/img/</span>
          </div>
        )}

        {/* vignette bas pour ancrer un éventuel texte */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-1/3"
          style={{ background: 'linear-gradient(to top, var(--base-900), transparent)' }}
        />
      </div>

      <Corner p="tl" />
      <Corner p="tr" />
      <Corner p="bl" />
      <Corner p="br" />

      {/* label haut-gauche */}
      {label && src && (
        <span className="absolute left-2 top-2 z-20 bg-base-900/80 px-2 py-0.5 font-mono text-[10px] uppercase tracking-hud text-[color:var(--text-dim)]">
          <span style={{ color: edge }}>[</span> {label} <span style={{ color: edge }}>]</span>
        </span>
      )}
      {/* badge coin bas-droite */}
      {corner && (
        <span
          className="absolute bottom-2 right-2 z-20 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-hud text-[color:var(--paper)]"
          style={{ background: edge }}
        >
          {corner}
        </span>
      )}
    </div>
  );
}
