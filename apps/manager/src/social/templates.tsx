import { forwardRef } from 'react';

/** Templates disponibles. */
export type TemplateId = 'matchday' | 'victoire' | 'defaite';

export interface SocialStat {
  label: string;
  value: string;
}

export interface SocialContent {
  template: TemplateId;
  gameTag: string;
  brand: string;
  opponent: string;
  competition: string;
  dateLabel: string;
  timeLabel: string;
  scoreUs: string;
  scoreThem: string;
  streamLabel: string;
  /** Gros mot d'accroche en cône 3D (ex. GGWP). */
  headline: string;
  playerName: string;
  playerRole: string;
  playerPhoto?: string;
  playerColor: string;
  /** Chiffres clés du joueur (chips foil). */
  playerStats: SocialStat[];
}

export const TEMPLATES: { id: TemplateId; label: string }[] = [
  { id: 'matchday', label: 'Match du jour' },
  { id: 'victoire', label: 'Victoire' },
  { id: 'defaite', label: 'Défaite' },
];

export const DEFAULT_HEADLINE: Record<TemplateId, string> = {
  matchday: 'MATCHDAY',
  victoire: 'GGWP',
  defaite: 'GG',
};

const C = {
  base900: '#121013',
  base800: '#1a1715',
  base700: '#242019',
  accent: '#f23127',
  concrete: '#cfcabb',
  paper: '#e8e4da',
  ink: '#0d0d0b',
  text: '#ece7dd',
  dim: '#948c7d',
  mute: '#635b4d',
  line: 'rgba(205,196,178,0.28)',
};

const DISPLAY = "'Chakra Petch', sans-serif";
const MONO = "'JetBrains Mono', monospace";
const CHAMFER = (r: number) =>
  `polygon(0 0, calc(100% - ${r}px) 0, 100% ${r}px, 100% 100%, ${r}px 100%, 0 calc(100% - ${r}px))`;

function Silhouette({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 130" style={{ height: '100%', width: '100%' }} aria-hidden>
      <circle cx="50" cy="34" r="19" fill={color} opacity="0.9" />
      <path d="M12 130 Q14 76 50 74 Q86 76 88 130 Z" fill={color} opacity="0.9" />
    </svg>
  );
}

function Corner({ u, pos }: { u: number; pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const s = u * 5;
  const t = Math.max(2, u * 0.4);
  const style: React.CSSProperties = { position: 'absolute', width: s, height: s };
  if (pos.includes('t')) style.top = u * 3;
  else style.bottom = u * 3;
  if (pos.includes('l')) style.left = u * 3;
  else style.right = u * 3;
  const b = `${t}px solid ${C.accent}`;
  return (
    <div
      aria-hidden
      style={{
        ...style,
        borderTop: pos.includes('t') ? b : undefined,
        borderBottom: pos.includes('b') ? b : undefined,
        borderLeft: pos.includes('l') ? b : undefined,
        borderRight: pos.includes('r') ? b : undefined,
      }}
    />
  );
}

/** Titre 3D DOUBLE COULEUR + cône (face claire, extrusion accent, fuite droite). */
function ConeHeadline({ text, u, depth }: { text: string; u: number; depth: string }) {
  const size = u * (text.length <= 4 ? 26 : text.length <= 6 ? 18 : 12.5);
  const steps = Math.max(6, Math.round(size * 0.07));
  // Extrusion vers la GAUCHE : les lettres fuient vers le centre (à droite),
  // on voit donc leur flanc gauche/arrière — profondeur projetée à gauche.
  const shadow = Array.from({ length: steps }, (_, i) => `-${i + 1}px ${i + 1}px 0 ${depth}`).join(',');
  return (
    <div style={{ perspective: u * 55 }}>
      <div
        style={{
          transformOrigin: 'left center',
          transform: 'rotateY(38deg)',
          fontFamily: DISPLAY,
          fontWeight: 700,
          fontSize: size,
          lineHeight: 0.82,
          letterSpacing: u * 0.2,
          color: '#f6f2e8',
          textShadow: shadow,
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </div>
    </div>
  );
}

/** Chip data foil (papier chanfreiné, valeur en couleur, ombre dure). */
function FoilChip({ u, color, value, label }: { u: number; color: string; value: string; label: string }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: u * 1.2,
        background: C.paper,
        border: `${u * 0.28}px solid rgba(255,255,255,0.85)`,
        padding: `${u * 0.9}px ${u * 1.8}px`,
        boxShadow: `${u * 0.7}px ${u * 0.7}px 0 ${C.base900}`,
        clipPath: CHAMFER(u * 1.1),
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: u * 4.4, lineHeight: 1, color: `color-mix(in srgb, ${color} 62%, #0a0a0c)` }}>
        {value}
      </span>
      <span style={{ fontFamily: MONO, fontSize: u * 1.5, textTransform: 'uppercase', letterSpacing: u * 0.1, color: 'rgba(13,13,11,0.72)' }}>
        {label}
      </span>
    </div>
  );
}

/**
 * Visuel réseau façon CARTE JOUEUR (full-art 3D). Joueur au centre, accroche
 * 3D double-couleur en cône, chips data foil colorées, foil + ombres dures.
 * Layout adaptatif : en PAYSAGE (X/Twitter) la carte passe à droite et grossit
 * pour un vrai affichage ; centrée en carré/story. Rendu natif w×h → PNG.
 */
export const SocialVisual = forwardRef<HTMLDivElement, { content: SocialContent; w: number; h: number }>(
  ({ content: c, w, h }, ref) => {
    const u = Math.min(w, h) / 100;
    const col = c.playerColor || C.accent;
    const isResult = c.template !== 'matchday';
    const dark = `color-mix(in srgb, ${col} 52%, #0a0a0c)`;
    const lite = `color-mix(in srgb, ${col} 72%, #ffffff)`;
    const land = w / h >= 1.3;

    // Carte : plus grande, à droite en paysage, centrée sinon.
    const cardH = land ? h * 0.84 : Math.min(h * 0.58, w * 0.66);
    const cardW = cardH * 0.72;
    const cardTop = (h - cardH) / 2 + (land ? 0 : h * 0.02);
    const cardLeft = land ? w - cardW - w * 0.05 : (w - cardW) / 2;
    const stats = (c.playerStats ?? []).slice(0, 3);

    return (
      <div
        ref={ref}
        style={{
          width: w,
          height: h,
          position: 'relative',
          overflow: 'hidden',
          background: `radial-gradient(120% 90% at ${land ? '72%' : '50%'} 0%, ${C.base700} 0%, ${C.base900} 72%)`,
          color: C.text,
          fontFamily: MONO,
        }}
      >
        {/* trame dot-grid */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `radial-gradient(${C.line} ${u * 0.16}px, transparent ${u * 0.16}px)`,
            backgroundSize: `${u * 4}px ${u * 4}px`,
            opacity: 0.4,
          }}
        />
        {/* halo couleur joueur derrière la carte */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: cardLeft + cardW / 2,
            top: cardTop + cardH / 2,
            width: cardW * 1.7,
            height: cardW * 1.7,
            transform: 'translate(-50%,-50%)',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${col} 0%, transparent 62%)`,
            opacity: 0.28,
          }}
        />
        {/* bande hazard diagonale */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: h * 0.64,
            left: -w * 0.1,
            width: w * 1.2,
            height: u * 1.6,
            transform: 'rotate(-6deg)',
            background: `repeating-linear-gradient(45deg, ${col} 0 ${u * 2}px, transparent ${u * 2}px ${u * 4}px)`,
            opacity: 0.22,
          }}
        />

        {/* ── CARTE JOUEUR (perspective + tilt 3D) ── */}
        <div style={{ position: 'absolute', left: cardLeft, top: cardTop, width: cardW, height: cardH, perspective: u * 150 }}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              borderRadius: u * 2.4,
              border: `${u * 0.3}px solid rgba(255,255,255,0.45)`,
              overflow: 'hidden',
              background: `radial-gradient(120% 80% at 50% 10%, ${lite} 0%, ${col} 44%, ${dark} 100%)`,
              transform: `rotateY(${land ? -11 : -8}deg) rotateX(4deg)`,
              transformOrigin: 'center',
              boxShadow: `${u * 2.6}px ${u * 3.2}px 0 -2px rgba(0,0,0,0.6), 0 ${u * 4}px ${u * 9}px -${u * 2}px ${col}`,
            }}
          >
            <div
              aria-hidden
              style={{
                position: 'absolute',
                top: '20%',
                left: '50%',
                transform: 'translateX(-50%)',
                fontFamily: DISPLAY,
                fontWeight: 700,
                fontSize: u * 15,
                lineHeight: 1,
                whiteSpace: 'nowrap',
                color: 'rgba(255,255,255,0.16)',
              }}
            >
              {c.playerName}
            </div>

            {/* joueur : photo ou silhouette */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
              <div style={{ height: '94%', width: '90%' }}>
                {c.playerPhoto ? (
                  // eslint-disable-next-line jsx-a11y/alt-text
                  <img src={c.playerPhoto} style={{ height: '100%', width: '100%', objectFit: 'contain', objectPosition: 'bottom' }} />
                ) : (
                  <Silhouette color="rgba(255,255,255,0.85)" />
                )}
              </div>
            </div>

            <div aria-hidden style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${dark} 3%, transparent 45%)` }} />
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(118deg, rgba(255,255,255,0) 32%, rgba(255,255,255,0.28) 46%, rgba(255,255,255,0) 60%)',
                mixBlendMode: 'screen',
              }}
            />
            <div style={{ position: 'absolute', left: u * 2, right: u * 2, bottom: u * 1.6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: MONO, fontSize: u * 1.8, letterSpacing: u * 0.15, color: 'rgba(255,255,255,0.8)' }}>
                {c.brand} · {c.gameTag}
              </span>
              <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: u * 2.4, color: '#fff' }}>★★★★★</span>
            </div>
          </div>
        </div>

        {/* ── CHIPS DATA FOIL (stats joueur) — débordent près de la carte ── */}
        {stats.length > 0 && (
          <div
            style={{
              position: 'absolute',
              // Paysage : colonne gauche libre, SOUS l'accroche « GG » et
              // AU-DESSUS du nom → plus de chevauchement. Portrait : à droite de la carte.
              left: land ? w * 0.06 : cardLeft + cardW - u * 3,
              top: land ? h * 0.46 : cardTop + cardH * 0.16,
              display: 'flex',
              flexDirection: 'column',
              gap: u * 1.8,
              perspective: u * 80,
            }}
          >
            {stats.map((s, i) => (
              <div key={s.label} style={{ transformOrigin: land ? 'left center' : 'right center', transform: `rotateY(${land ? 22 : -24}deg) rotate(${(i - 1) * 1.5}deg)` }}>
                <FoilChip u={u} color={col} value={s.value} label={s.label} />
              </div>
            ))}
          </div>
        )}

        {/* ── ACCROCHE 3D DOUBLE COULEUR EN CÔNE ── */}
        <div style={{ position: 'absolute', left: w * 0.05, top: land ? h * 0.14 : h * 0.07 }}>
          <ConeHeadline text={c.headline} u={u} depth={c.template === 'defaite' ? C.mute : C.accent} />
        </div>

        {/* ── SCORE / DATE (chip 3D, coin haut de la carte) ── */}
        <div style={{ position: 'absolute', left: cardLeft - u * 5, top: cardTop - u * 3, perspective: u * 60 }}>
          <div style={{ transformOrigin: 'right center', transform: 'rotateY(-26deg) rotate(-3deg)' }}>
            {isResult ? (
              <div style={{ border: `${u * 0.3}px solid rgba(255,255,255,0.7)`, background: 'rgba(18,16,19,0.95)', padding: `${u * 1.2}px ${u * 2.4}px`, boxShadow: `${u * 0.8}px ${u * 0.8}px 0 ${C.base900}`, textAlign: 'center' }}>
                <div style={{ fontFamily: MONO, fontSize: u * 1.7, letterSpacing: u * 0.2, color: C.mute }}>SCORE</div>
                <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: u * 10, lineHeight: 1, color: C.text }}>
                  {c.scoreUs}
                  <span style={{ color: C.accent, margin: `0 ${u}px` }}>–</span>
                  {c.scoreThem}
                </div>
              </div>
            ) : (
              <div style={{ border: `${u * 0.3}px solid rgba(255,255,255,0.7)`, background: 'rgba(18,16,19,0.95)', padding: `${u * 1.2}px ${u * 2.4}px`, boxShadow: `${u * 0.8}px ${u * 0.8}px 0 ${C.base900}` }}>
                <div style={{ fontFamily: MONO, fontSize: u * 1.7, letterSpacing: u * 0.2, color: C.mute }}>KICKOFF</div>
                <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: u * 4.6, lineHeight: 1, color: C.text }}>{c.timeLabel}</div>
                <div style={{ fontFamily: MONO, fontSize: u * 1.9, color: C.dim }}>{c.dateLabel}</div>
              </div>
            )}
          </div>
        </div>

        {/* équerres HUD */}
        <Corner u={u} pos="tl" />
        <Corner u={u} pos="tr" />
        <Corner u={u} pos="bl" />
        <Corner u={u} pos="br" />

        {/* header : brand + tag */}
        <div style={{ position: 'absolute', top: u * 6, left: u * 8, right: u * 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: u * 4.6, letterSpacing: u * 0.2 }}>{c.brand}</span>
          <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: u * 2.4, letterSpacing: u * 0.25, background: C.accent, color: C.ink, padding: `${u * 0.7}px ${u * 1.6}px` }}>
            {c.gameTag}
          </span>
        </div>

        {/* nom joueur (bas-gauche, gros) + rôle */}
        <div style={{ position: 'absolute', left: u * 7, bottom: u * 12, maxWidth: land ? '48%' : '60%' }}>
          <span
            style={{
              display: 'inline-block',
              fontFamily: DISPLAY,
              fontWeight: 700,
              fontSize: u * 2.6,
              textTransform: 'uppercase',
              letterSpacing: u * 0.2,
              background: col,
              color: '#0a0a0c',
              padding: `${u * 0.4}px ${u * 1.4}px`,
            }}
          >
            {c.playerRole}
          </span>
          <div
            style={{
              fontFamily: DISPLAY,
              fontWeight: 700,
              fontSize: u * 10,
              lineHeight: 0.88,
              textTransform: 'uppercase',
              color: C.text,
              textShadow: `${u * 0.4}px ${u * 0.55}px 0 ${col}`,
              marginTop: u * 1,
            }}
          >
            {c.playerName}
          </div>
        </div>

        {/* footer : matchup + compétition + stream */}
        <div style={{ position: 'absolute', left: u * 7, right: u * 7, bottom: u * 4.5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: u * 3 }}>
          <div>
            <div style={{ fontFamily: MONO, fontSize: u * 2.4, letterSpacing: u * 0.12 }}>
              <span style={{ color: C.text }}>{c.brand}</span>
              <span style={{ color: C.mute }}> vs </span>
              <span style={{ color: C.dim }}>{c.opponent}</span>
            </div>
            <div style={{ fontFamily: MONO, fontSize: u * 2, color: C.mute, marginTop: u * 0.4 }}>{c.competition}</div>
          </div>
          {c.streamLabel && (
            <div style={{ fontFamily: MONO, fontSize: u * 2.2, color: C.accent, border: `${Math.max(1, u * 0.25)}px solid ${C.accent}`, padding: `${u * 0.7}px ${u * 1.5}px`, whiteSpace: 'nowrap' }}>
              ▶ {c.streamLabel}
            </div>
          )}
        </div>
      </div>
    );
  },
);
SocialVisual.displayName = 'SocialVisual';
