import { useMemo, useRef, useState } from 'react';
import type { Game, Player } from '@/types';
import { useData } from '@/data/DataProvider';
import { useReducedMotion } from '@/hooks/useReducedMotion';

type ColState = 'closed' | 'open' | 'spine';

/* Positions des data 3D autour d'un pilier fermé (TL, TR, BL, BR) —
   inclinées pour "rentrer" dans la colonne. */
const SLOTS = [
  { pos: 'left-0 top-6 -translate-x-1/2', tz: 82, ry: 34, rx: -6 },
  { pos: 'right-0 top-16 translate-x-1/2', tz: 82, ry: -34, rx: -6 },
  { pos: 'left-0 bottom-16 -translate-x-1/2', tz: 66, ry: 28, rx: 5 },
  { pos: 'right-0 bottom-8 translate-x-1/2', tz: 66, ry: -28, rx: 5 },
] as const;

/** Ligne de roster (sélection d'un joueur) — forme cutline + keycap. */
function RosterRow({ active, color, onClick, n, title, sub }: { active: boolean; color?: string; onClick: () => void; n: string; title: string; sub: string }) {
  const c = color ?? 'var(--accent)';
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ ['--accent' as string]: c }}
      className={[
        'cut-panel-alt group relative flex items-stretch overflow-hidden border-2 text-left shadow-ink-sm transition-all duration-ui ease-mech',
        active
          ? 'min-h-[66px] -translate-x-0.5 -translate-y-0.5 border-accent shadow-ink'
          : 'min-h-[52px] border-line-strong hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-accent hover:shadow-ink',
      ].join(' ')}
    >
      {/* pavé numéro (keycap) — plein couleur joueur quand actif */}
      <span
        aria-hidden
        className="flex w-11 shrink-0 items-center justify-center font-display text-lg font-bold transition-colors duration-ui"
        style={{ background: active ? c : 'rgba(255,255,255,0.05)', color: active ? '#0a0a0c' : c }}
      >
        {n}
      </span>

      {/* corps frosté */}
      <span className="relative flex min-w-0 flex-1 items-center gap-2 border-l-2 bg-base-900/55 px-3 py-2 backdrop-blur-sm" style={{ borderColor: 'var(--line-strong)' }}>
        <span className="min-w-0 flex-1">
          <span className={`hud-title block font-bold leading-none transition-all ${active ? 'text-xl text-white' : 'text-base text-white/70 group-hover:text-white'}`}>{title}</span>
          <span className={`block overflow-hidden font-mono text-[9px] uppercase tracking-hud text-white/45 transition-all duration-ui ${active ? 'mt-1.5 max-h-6 opacity-100' : 'max-h-0 opacity-0'}`}>{sub}</span>
        </span>
        <span className={`shrink-0 font-mono transition-transform ${active ? 'translate-x-0 opacity-100' : '-translate-x-1 opacity-0 group-hover:opacity-100'}`} style={{ color: c }}>▸</span>
      </span>

      {/* liseré d'accent haut (hover / actif) */}
      <span aria-hidden className={`pointer-events-none absolute inset-x-0 top-0 h-0.5 transition-opacity ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} style={{ background: c }} />
    </button>
  );
}

/* ── Colonne de jeu : un seul composant pour les 3 états ──────────────────
   closed (pilier centré + data 3D) · open (roster + carte) · spine (tranche).
   Le FOND FOIL et la couleur du jeu persistent dans tous les états → la
   transition = expansion de largeur + cross-fade du contenu (titre ↔ roster).
   L'accent des lignes/roster reprend la couleur du jeu (continuité). */
function GameColumn({
  g,
  roster,
  state,
  playerId,
  selected,
  flashKey,
  onOpen,
  onPickPlayer,
}: {
  g: Game;
  roster: Player[];
  state: ColState;
  playerId: string | null;
  selected: Player | null;
  flashKey: number;
  onOpen: () => void;
  onPickPlayer: (id: string) => void;
}) {
  const c = g.color ?? 'var(--accent)';
  const count = roster.length;
  const stats = (g.stats ?? []).slice(0, 4);
  const open = state === 'open';
  const closed = state === 'closed';
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const onMove = (e: React.PointerEvent) => {
    if (reduced || open || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    const s = ref.current.style;
    s.setProperty('--rx', `${(-y * 8).toFixed(2)}deg`);
    s.setProperty('--ry', `${(x * 10).toFixed(2)}deg`);
    s.setProperty('--mx', `${((x + 0.5) * 100).toFixed(1)}%`);
    s.setProperty('--my', `${((y + 0.5) * 100).toFixed(1)}%`);
  };
  const onLeave = () => {
    const s = ref.current?.style;
    if (!s) return;
    s.setProperty('--rx', '0deg');
    s.setProperty('--ry', '0deg');
    s.setProperty('--mx', '50%');
    s.setProperty('--my', '50%');
  };

  return (
    <div
      className="relative shrink-0"
      style={{
        flexGrow: open ? 1 : 0,
        flexBasis: open ? 0 : closed ? 236 : 118,
        transition: 'flex-grow 0.55s cubic-bezier(0.16,1,0.3,1), flex-basis 0.55s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      <div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="relative h-full"
        style={{ transformStyle: 'preserve-3d', transform: 'rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))', transition: 'transform 0.2s ease-out' }}
      >
        {/* PANNEAU (foil + contenu qui cross-fade) */}
        <div
          className="relative h-full overflow-hidden rounded-2xl border-2 shadow-ink"
          style={{ borderColor: open ? c : 'var(--line-strong)', transition: 'border-color 0.4s' }}
        >
          {/* ── FOND FOIL (persiste dans tous les états) ── */}
          <div className="absolute inset-0">
            {g.visual ? (
              <img src={g.visual} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full" style={{ background: `radial-gradient(120% 85% at 50% 4%, color-mix(in srgb, ${c} 62%, #ffffff) 0%, ${c} 42%, color-mix(in srgb, ${c} 40%, #0a0a0c) 100%)` }} aria-hidden />
            )}
          </div>
          <div className="tcg-foil pointer-events-none absolute inset-0" aria-hidden />
          <div className="tcg-glare pointer-events-none absolute inset-0" aria-hidden />

          {/* scrim : léger fondu bas (fermé) → assombrissement fort (ouvert, lisibilité) */}
          <div aria-hidden className="pointer-events-none absolute inset-0 transition-opacity duration-500" style={{ background: 'rgba(8,8,10,0.9)', opacity: open ? 0.8 : 0 }} />
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-24" style={{ background: 'linear-gradient(to top, rgba(10,10,10,0.8), transparent)' }} />

          {/* ── CONTENU FERMÉ / SPINE : titre glitché vertical + tag + compteur ── */}
          <button
            type="button"
            onClick={onOpen}
            aria-label={`Afficher l'effectif ${g.name}`}
            className={`absolute inset-0 z-10 block transition-opacity duration-300 ${open ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <span className="absolute left-3 top-3 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-hud text-white" style={{ background: c }}>
              {g.tag}
            </span>
            <span className="absolute inset-0 flex items-center justify-center" style={{ perspective: '600px' }}>
              <span
                aria-hidden
                className={`title-3d select-none font-display font-bold uppercase leading-none tracking-wide2 [writing-mode:vertical-rl] ${closed ? 'text-6xl' : 'text-3xl'}`}
                style={{ ['--tx' as string]: c, transformOrigin: 'center', transform: 'translateZ(30px) rotateY(-20deg)' }}
              >
                {g.name}
              </span>
            </span>
            <span className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-1 px-3 py-2">
              <span className="hud-title text-lg font-bold text-white">{String(count).padStart(2, '0')}</span>
              <span className="hud-label text-[7px] text-white/60">JR</span>
            </span>
          </button>

          {/* ── CONTENU OUVERT : colonne info (nom 3D + stats + palmarès + roster).
             La carte joueur flotte HORS de la box (calque non clippé, voir + bas). ── */}
          <div
            className={`absolute inset-0 z-20 transition-opacity duration-300 ${open ? 'opacity-100 delay-150' : 'pointer-events-none opacity-0'}`}
            style={{ ['--accent' as string]: c }}
          >
            {/* liseré d'accent haut */}
            <div className="absolute inset-x-0 top-0 h-0.5" style={{ background: c }} aria-hidden />

            <div className="flex h-full w-[42%] min-w-[330px] max-w-[470px] flex-col gap-4 p-5">
              {/* header : label + nom en 3D double couleur */}
              <div>
                <p className="font-mono text-[10px] uppercase tracking-hud text-white/55">[ GAME // {g.tag} ]</p>
                <div style={{ perspective: '650px' }}>
                  <h3 className="title-3d font-display text-4xl font-bold uppercase leading-[0.82]" style={{ ['--tx' as string]: c, transformOrigin: 'left center', transform: 'rotateY(-14deg)' }}>
                    {g.name}
                  </h3>
                </div>
              </div>

              {/* stats : mêmes chips que sur la carte (papier, ombre dure) + forme chanfreinée */}
              {stats.length > 0 && (
                <div className="flex flex-wrap gap-2.5">
                  {stats.map((s, i) => (
                    <div
                      key={s.label}
                      className="flex items-center gap-2 whitespace-nowrap border-2 border-white/70 bg-paper px-2.5 py-1 shadow-ink"
                      style={{
                        clipPath: 'polygon(0 0, calc(100% - 9px) 0, 100% 9px, 100% 100%, 9px 100%, 0 calc(100% - 9px))',
                        transform: `rotate(${i % 2 ? 1.4 : -1.4}deg)`,
                      }}
                    >
                      {/* valeur foncée (couleur du jeu assombrie) pour rester lisible sur le papier */}
                      <span className="font-display text-xl font-bold leading-none" style={{ color: `color-mix(in srgb, ${c} 60%, #0a0a0c)` }}>{s.value}</span>
                      <span className="font-mono text-[7px] uppercase leading-tight tracking-hud" style={{ color: 'color-mix(in srgb, var(--ink) 72%, transparent)' }}>{s.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* palmarès */}
              {g.palmares.length > 0 && (
                <ul className="space-y-1">
                  {g.palmares.map((pl) => (
                    <li key={pl} className="flex gap-2 font-mono text-[10px] leading-snug text-white/70">
                      <span style={{ color: c }}>▸</span>
                      <span>{pl}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* roster */}
              <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
                <p className="hud-label text-[10px] text-white/55">[ Roster ] · {String(count).padStart(2, '0')}</p>
                {roster.map((p, i) => (
                  <RosterRow key={p.id} active={p.id === playerId} color={p.color} onClick={() => onPickPlayer(p.id)} n={String(i + 1).padStart(2, '0')} title={p.pseudo} sub={`${p.role} · ${p.country}`} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── CARTE JOUEUR : sort de la box en 3D ──────────────────────
           Placée HORS du panneau (pas de clip), poussée en avant (translateZ)
           et plus grande que le panneau → déborde du cadre comme si elle
           sortait du jeu. */}
        {open && (
          <div className="absolute z-40" style={{ left: '46%', right: '0%', top: -34, bottom: -34 }}>
            <div key={`${selected?.id ?? 'empty'}-${flashKey}`} className="card-assemble h-full w-full">
              {selected ? <PlayerDetail p={selected} lift /> : <EmptyCard />}
            </div>
          </div>
        )}

        {/* ── DATA 3D flottantes (uniquement pilier fermé) ── */}
        {stats.map((st, i) => {
          const s = SLOTS[i];
          return (
            <div
              key={st.label}
              aria-hidden
              className={`pointer-events-none absolute z-30 ${s.pos} transition-opacity duration-300 ${closed ? 'opacity-100' : 'opacity-0'}`}
              style={{ transform: `translateZ(${s.tz}px) rotateX(${s.rx}deg) rotateY(${s.ry}deg)`, transformOrigin: s.ry > 0 ? 'right center' : 'left center' }}
            >
              <div className="flex items-center gap-2 whitespace-nowrap border-2 border-white/70 bg-base-900/90 px-2.5 py-1.5 shadow-ink">
                <span className="font-display text-xl font-bold leading-none" style={{ color: c }}>{st.value}</span>
                <span className="font-mono text-[7px] uppercase leading-tight tracking-hud text-white/70">{st.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Silhouette de secours quand aucun PNG joueur n'est fourni. */
function Silhouette() {
  return (
    <svg viewBox="0 0 100 130" className="h-full w-full" aria-hidden>
      <circle cx="50" cy="34" r="19" fill="currentColor" opacity="0.32" />
      <path d="M14 130 Q16 78 50 76 Q84 78 86 130 Z" fill="currentColor" opacity="0.32" />
    </svg>
  );
}

/* ── Carte FULL-ART (façon alt-art) : le joueur remplit la carte ──
   `lift` = pop 3D (translateZ + angle) posé EN BASE du transform, combiné au
   tilt souris → la carte "sort" tout en restant réactive au survol. */
function PlayerDetail({ p, lift = false }: { p: Player; lift?: boolean }) {
  const { games, players: allPlayers } = useData();
  const TOTAL = String(allPlayers.length).padStart(2, '0');
  const game = games.find((g) => g.id === p.gameId);
  const fullName = [p.firstName, p.lastName].filter(Boolean).join(' ');
  const num = String(allPlayers.indexOf(p) + 1).padStart(2, '0');
  const c = p.color ?? '#f23127';
  const cardRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const onMove = (e: React.PointerEvent) => {
    if (reduced || !cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    const s = cardRef.current.style;
    s.setProperty('--ry', `${(x * 12).toFixed(2)}deg`);
    s.setProperty('--rx', `${(-y * 9).toFixed(2)}deg`);
    s.setProperty('--mx', `${((x + 0.5) * 100).toFixed(1)}%`);
    s.setProperty('--my', `${((y + 0.5) * 100).toFixed(1)}%`);
  };
  const onLeave = () => {
    const s = cardRef.current?.style;
    if (!s) return;
    s.setProperty('--rx', '0deg');
    s.setProperty('--ry', '0deg');
    s.setProperty('--mx', '50%');
    s.setProperty('--my', '50%');
  };

  return (
    <div className="flex h-full w-full items-center justify-center" style={{ perspective: '1100px' }} onPointerMove={onMove} onPointerLeave={onLeave}>
      <div
        key={p.id}
        ref={cardRef}
        className="tcg-in relative h-full max-h-[560px] min-h-[500px] w-full max-w-[380px]"
        style={{
          transform: 'translateZ(var(--pz,0px)) rotateY(var(--pry,0deg)) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.2s ease-out',
          ...(lift ? { ['--pz' as string]: '110px', ['--pry' as string]: '-8deg' } : null),
        }}
      >
        {/* ── CARTE clippée (art) ── */}
        <div
          className="absolute inset-0 overflow-hidden rounded-[22px] border-2 border-white/40"
          style={{
            background: `radial-gradient(120% 80% at 50% 12%, color-mix(in srgb, ${c} 72%, #ffffff) 0%, ${c} 42%, color-mix(in srgb, ${c} 52%, #0a0a0c) 100%)`,
            boxShadow: `0 28px 55px -18px ${c}, inset 0 0 0 2px rgba(255,255,255,0.3)`,
          }}
        >
          {/* nom géant fantôme */}
          <span aria-hidden className="pointer-events-none absolute left-1/2 top-[26%] -translate-x-1/2 select-none whitespace-nowrap font-display text-[8.5rem] font-bold uppercase leading-none text-white/15">
            {p.pseudo}
          </span>
          {/* joueur (full art) */}
          <div className="absolute inset-0 flex items-end justify-center text-white">
            <div className="h-[95%] w-[92%]">
              {p.photo ? (
                <img src={p.photo} alt={p.pseudo} className="h-full w-full object-contain object-bottom drop-shadow-[0_16px_28px_rgba(0,0,0,0.6)]" />
              ) : (
                <Silhouette />
              )}
            </div>
          </div>
          {/* scrim bas */}
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-[55%]" style={{ background: `linear-gradient(to top, color-mix(in srgb, ${c} 60%, #0a0a0c) 4%, transparent)` }} />
          {/* foil + brillance */}
          <div className="tcg-foil pointer-events-none absolute inset-0" aria-hidden />
          <div className="tcg-glare pointer-events-none absolute inset-0" aria-hidden />
          {/* pied minimal (dans la carte) */}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-4 py-2 text-white/75">
            <span className="font-mono text-[8px] uppercase tracking-hud">LIGNE ZERO · {num}/{TOTAL}</span>
            <span className="ticket-barcode h-3.5 w-12 text-white" />
          </div>
        </div>

        {/* ── DONNÉES qui DÉBORDENT, inclinées en point de fuite vers le centre ── */}
        {/* rareté (haut-gauche) */}
        <div className="absolute left-2 -top-4" style={{ transform: 'translateZ(70px) rotateX(-16deg) rotateY(22deg)' }}>
          <div className="flex items-center gap-2 border-2 border-white/70 bg-base-900/90 px-2 py-1 shadow-ink">
            <span className="flex h-7 w-7 items-center justify-center font-display text-lg font-bold text-white" style={{ background: c }}>S</span>
            <span className="font-mono text-[8px] tracking-[0.2em] text-white/80">★★★★★</span>
          </div>
        </div>

        {/* set (haut-droite) */}
        <div className="absolute right-2 -top-4" style={{ transform: 'translateZ(70px) rotateX(-16deg) rotateY(-22deg)' }}>
          <div className="border-2 border-white/70 bg-base-900/90 px-3 py-1.5 shadow-ink">
            <p className="font-mono text-[8px] uppercase tracking-hud text-white/70">SET</p>
            <p className="font-display text-sm font-bold leading-none text-white">{game?.tag} · {num}</p>
          </div>
        </div>

        {/* stats (débordent à droite) */}
        <div className="absolute -right-11 top-[30%]" style={{ transform: 'translateZ(100px)', perspective: '330px' }}>
          <div className="flex flex-col gap-2.5" style={{ transformOrigin: 'right center', transform: 'rotateY(-34deg)' }}>
            {p.stats.map((s, i) => (
              <div key={s.label} className="flex items-center gap-2 border-2 border-white/70 bg-paper px-2.5 py-1 shadow-ink" style={{ transform: `rotate(${(i - 1) * 2}deg)` }}>
                <span className="font-display text-xl font-bold leading-none" style={{ color: `color-mix(in srgb, ${c} 60%, #0a0a0c)` }}>{s.value}</span>
                <span className="font-mono text-[7px] uppercase leading-tight tracking-hud" style={{ color: 'color-mix(in srgb, var(--ink) 72%, transparent)' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* nom + rôle (débordent en bas-gauche) */}
        <div className="absolute -left-7 bottom-8" style={{ transform: 'translateZ(95px) rotateX(-6deg) rotateY(6deg)', transformStyle: 'preserve-3d' }}>
          <div>
            <span className="inline-block bg-base-900 px-2 py-0.5 font-display text-xs font-bold uppercase tracking-wide2 shadow-ink-sm" style={{ color: c }}>
              {p.role}
            </span>
            <div className="mt-1" style={{ perspective: '230px' }}>
              <h2
                className="whitespace-nowrap font-display text-7xl font-bold uppercase leading-[0.78] text-white sm:text-8xl"
                style={{ transformOrigin: 'left center', transform: 'rotateY(46deg)', textShadow: `0 3px 0 ${c}, 0 10px 26px rgba(0,0,0,0.7)` }}
              >
                {p.pseudo}
              </h2>
            </div>
            <p className="mt-2 font-mono text-[9px] uppercase tracking-hud text-white/80">
              {[fullName, p.country, p.joinedYear && `EST ${p.joinedYear}`].filter(Boolean).join(' · ')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Carte vide (en attente d'un joueur) ────────────────────── */
function EmptyCard() {
  return (
    <div className="relative flex h-full min-h-[600px] items-center justify-center overflow-hidden rounded-[22px] border-2 border-dashed border-white/25 bg-black/20">
      <div className="text-center">
        <span className="font-display text-[10rem] font-bold leading-none text-white/25">?</span>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-hud text-white/50">&gt; sélectionne un joueur</p>
      </div>
    </div>
  );
}

/* ── Accordéon unifié : piliers fermés → colonne ouverte (animé) ──────── */
export function RosterShowcase() {
  const { players: allPlayers, games } = useData();
  // Aucun jeu ouvert par défaut : les piliers se présentent fermés et centrés.
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [flashKey, setFlashKey] = useState(0);

  const roster = useMemo(() => (gameId ? allPlayers.filter((p) => p.gameId === gameId) : []), [gameId, allPlayers]);
  const selected = roster.find((p) => p.id === playerId) ?? null;

  const pickGame = (id: string) => {
    if (id === gameId) return; // déjà ouvert : garder la sélection courante
    setGameId(id);
    // Présélectionne le 1er joueur de l'effectif → sa carte s'affiche direct
    // (au lieu de la carte "?" en attente).
    const first = allPlayers.find((p) => p.gameId === id) ?? null;
    setPlayerId(first ? first.id : null);
    setFlashKey((k) => k + 1);
  };
  const pickPlayer = (id: string) => {
    setPlayerId(id);
    setFlashKey((k) => k + 1);
  };

  return (
    <>
      {/* flash plein écran au changement de joueur */}
      {flashKey > 0 && (
        <span
          key={flashKey}
          aria-hidden
          className="card-flash pointer-events-none fixed inset-0 z-[95]"
          style={{ background: 'radial-gradient(circle at 50% 45%, #fff 0%, rgba(255,255,255,0.6) 35%, transparent 72%)' }}
        />
      )}

      {/* DESKTOP · accordéon unique (gap animé : large fermé → serré ouvert) */}
      <div
        className="mt-8 hidden items-stretch justify-center md:flex"
        style={{ minHeight: 680, perspective: '1500px', gap: gameId === null ? 120 : 16, transition: 'gap 0.55s cubic-bezier(0.16,1,0.3,1)' }}
      >
        {games.map((g) => {
          const gr = allPlayers.filter((p) => p.gameId === g.id);
          const state: ColState = gameId === null ? 'closed' : gameId === g.id ? 'open' : 'spine';
          return (
            <GameColumn
              key={g.id}
              g={g}
              roster={gr}
              state={state}
              playerId={playerId}
              selected={state === 'open' ? selected : null}
              flashKey={flashKey}
              onOpen={() => pickGame(g.id)}
              onPickPlayer={pickPlayer}
            />
          );
        })}
      </div>

      {/* MOBILE : sélecteur + roster + carte empilés */}
      <div className="mt-8 md:hidden">
        <div className="mb-4 flex gap-2">
          {games.map((g) => (
            <button key={g.id} type="button" onClick={() => pickGame(g.id)} className={`flex-1 border-2 px-2 py-2 font-mono text-[11px] font-bold uppercase tracking-hud transition-all ${gameId === g.id ? 'border-accent bg-accent text-[color:var(--paper)]' : 'border-line-strong text-[color:var(--text-dim)]'}`}>
              {g.tag} · {allPlayers.filter((p) => p.gameId === g.id).length}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {roster.map((p, i) => (
            <RosterRow key={p.id} active={p.id === playerId} color={p.color} onClick={() => pickPlayer(p.id)} n={String(i + 1).padStart(2, '0')} title={p.pseudo} sub={`${p.role} · ${p.country}`} />
          ))}
        </div>
        <div className="mt-4">
          {selected ? (
            <div key={`m-${selected.id}-${flashKey}`} className="card-assemble relative z-[90]">
              <PlayerDetail p={selected} />
            </div>
          ) : (
            <EmptyCard />
          )}
        </div>
      </div>
    </>
  );
}
