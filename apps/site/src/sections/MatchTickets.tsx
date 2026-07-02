import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { Match, MatchStatus } from '@/types';
import { useData } from '@/data/DataProvider';
import { formatDate, formatTime, sortMatches } from '@/lib/format';

const ALL = 'all';
const TW = 360;
const TH = 168;
const STATUSES: { id: MatchStatus | typeof ALL; label: string }[] = [
  { id: ALL, label: 'Tous' },
  { id: 'upcoming', label: 'À venir' },
  { id: 'live', label: 'Live' },
  { id: 'finished', label: 'Terminés' },
];

function access(m: Match): { stub: string; action: string; url?: string } {
  if (m.status === 'live') return { stub: 'ENTRÉE LIVE', action: '▶ REGARDER LE LIVE', url: m.streamUrl };
  if (m.status === 'finished') return { stub: 'REPLAY', action: '⊙ VOIR LA VOD', url: m.vodUrl };
  return { stub: 'À VENIR', action: m.streamUrl ? '▶ STREAM' : 'BIENTÔT', url: m.streamUrl };
}

/* ── Demi-perforation : chaque partie garde la moitié des points (rip au milieu) ── */
function HalfSeam({ part }: { part: 'body' | 'stub' }) {
  // body → centre du point sur le bord DROIT (montre la moitié gauche)
  // stub → centre du point sur le bord GAUCHE (montre la moitié droite)
  const pos = part === 'body' ? 'right' : 'left';
  return (
    <div
      className="concrete w-[6px] shrink-0 self-stretch"
      style={{
        backgroundImage: `radial-gradient(circle at ${pos} center, var(--ink) 2.5px, transparent 2.9px)`,
        backgroundSize: '6px 15px',
        backgroundRepeat: 'repeat-y',
      }}
    />
  );
}

/* ── Contenu ────────────────────────────────────────────────── */
function TicketBody({ m }: { m: Match }) {
  const { games } = useData();
  const gameTag = (id: string) => games.find((g) => g.id === id)?.tag ?? '—';
  return (
    <div className="concrete relative flex min-w-0 flex-1 flex-col justify-between p-4">
      <div className="flex items-center justify-between">
        <span className="bg-accent px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-hud text-[color:var(--paper)]">
          {gameTag(m.gameId)}
        </span>
        <span className="font-mono text-[10px] font-bold uppercase tracking-hud text-ink">
          {formatDate(m.dateISO)} · {formatTime(m.dateISO)}
        </span>
      </div>
      <div className="my-2">
        <p className="font-display text-xl font-bold uppercase leading-none text-ink">__BRAND__</p>
        <p className="font-mono text-[10px] uppercase tracking-hud text-ink/60">vs</p>
        <p className="font-display text-xl font-bold uppercase leading-none text-ink">{m.opponent.name}</p>
      </div>
      <div className="flex items-end justify-between">
        <span className="max-w-[60%] truncate font-mono text-[9px] uppercase tracking-hud text-ink/60">{m.competition}</span>
        <span className="ticket-barcode h-6 w-20 text-ink" />
      </div>
    </div>
  );
}

function TicketStub({ m }: { m: Match }) {
  const a = access(m);
  return (
    <div className="flex h-full w-[96px] shrink-0 flex-col items-center justify-between bg-accent p-3 text-[color:var(--paper)]">
      <span className="font-mono text-[8px] uppercase tracking-hud opacity-80">ADMIT ONE</span>
      {m.score ? (
        <span className="hud-title text-2xl font-bold leading-none">
          {m.score.us}-{m.score.them}
        </span>
      ) : (
        <span className="font-mono text-2xl">●</span>
      )}
      <span className="text-center font-mono text-[8px] font-bold uppercase leading-tight tracking-hud">{a.stub}</span>
      <span className="font-mono text-[8px] opacity-70">#{m.id.replace(/\D/g, '').padStart(4, '0')}</span>
    </div>
  );
}

/** Ticket complet, intact (table / mobile). */
function TicketCard({ m }: { m: Match }) {
  return (
    <div className="flex h-[168px] w-[360px] select-none overflow-hidden border border-ink/20 shadow-paper">
      <TicketBody m={m} />
      <HalfSeam part="body" />
      <HalfSeam part="stub" />
      <TicketStub m={m} />
    </div>
  );
}

/* ── Focus : LE ticket cliqué vient au centre (FLIP) + arrachage ── */
function FocusTicket({ m, rect, onClose }: { m: Match; rect: DOMRect; onClose: () => void }) {
  const a = access(m);
  const [enter, setEnter] = useState(false);
  const [pull, setPull] = useState(0);
  const [ripped, setRipped] = useState(false);
  const drag = useRef(false);
  const startX = useRef(0);
  const MAX = 240;
  const THRESH = 120;

  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => setEnter(true));
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = () => {
    setEnter(false);
    window.setTimeout(onClose, 420);
  };

  const dx = window.innerWidth / 2 - (rect.left + rect.width / 2);
  const dy = window.innerHeight / 2 - (rect.top + rect.height / 2);
  const flip = enter ? `translate(${dx}px, ${dy}px) scale(1.35)` : 'translate(0,0) scale(1)';

  const onDown = (e: React.PointerEvent) => {
    if (ripped) return;
    drag.current = true;
    startX.current = e.clientX - pull;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    setPull(Math.max(0, Math.min(MAX, e.clientX - startX.current)));
  };
  const onUp = () => {
    if (!drag.current) return;
    drag.current = false;
    if (pull >= THRESH) {
      setRipped(true);
      if (a.url) window.open(a.url, '_blank', 'noopener');
    } else setPull(0);
  };

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Fermer"
        onClick={close}
        className={`absolute inset-0 bg-base-900/85 backdrop-blur-sm transition-opacity duration-300 ${enter ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* le ticket lui-même, déplacé/zoomé depuis sa position cliquée */}
      <div
        className="absolute"
        style={{
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          transform: flip,
          transformOrigin: 'center',
          transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <div className="flex h-full w-full">
          {/* corps : garde la MOITIÉ GAUCHE des points */}
          <div className="flex flex-1 overflow-hidden border border-ink/20 shadow-paper">
            <TicketBody m={m} />
            <HalfSeam part="body" />
          </div>
          {/* talon : garde la MOITIÉ DROITE des points et s'arrache en pivotant pile au milieu */}
          <div
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            className="relative flex shrink-0 cursor-grab touch-none border-y border-r border-ink/20 shadow-paper active:cursor-grabbing"
            style={{
              transformOrigin: '0% 0%',
              transform: ripped
                ? `rotate(58deg) translate(${MAX}px, 80px)`
                : `rotate(${pull * 0.14}deg) translateX(${pull * 0.4}px)`,
              opacity: ripped ? 0 : 1,
              transition: drag.current ? 'none' : 'transform 0.5s cubic-bezier(0.16,1,0.3,1), opacity 0.5s',
            }}
          >
            <HalfSeam part="stub" />
            <TicketStub m={m} />
          </div>
        </div>
      </div>

      {/* instruction / accès (bas de l'écran) */}
      <div className={`absolute inset-x-0 bottom-14 flex flex-col items-center gap-3 transition-opacity duration-300 ${enter ? 'opacity-100' : 'opacity-0'}`}>
        {!ripped ? (
          <p className="font-mono text-[11px] uppercase tracking-hud text-[color:var(--text-dim)]">
            ✂ tire le talon rouge pour l'arracher
          </p>
        ) : (
          <>
            <p className="font-mono text-[11px] uppercase tracking-hud text-accent">accès débloqué</p>
            {a.url && (
              <a
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-accent bg-accent px-4 py-2 font-mono text-xs font-bold uppercase tracking-hud text-[color:var(--paper)] shadow-ink-sm"
              >
                {a.action}
              </a>
            )}
          </>
        )}
      </div>

      <button
        type="button"
        onClick={close}
        className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center border-2 border-accent bg-base-900 font-mono text-accent"
        aria-label="Fermer"
      >
        ×
      </button>
    </div>
  );
}

/* ── Table : scatter + drag + flottement libre ──────────────── */
interface Pos {
  x: number;
  y: number;
  rot: number;
  z: number;
}
interface Dyn {
  ox: number;
  oy: number;
  vx: number;
  vy: number;
}

export function MatchTickets() {
  const { matches, games } = useData();
  const [game, setGame] = useState<string>(ALL);
  const [status, setStatus] = useState<MatchStatus | typeof ALL>(ALL);
  const [focus, setFocus] = useState<{ m: Match; rect: DOMRect } | null>(null);

  const list = useMemo(
    () => sortMatches(matches.filter((m) => (game === ALL || m.gameId === game) && (status === ALL || m.status === status))),
    [game, status],
  );

  const tableRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const posRef = useRef<Record<string, Pos>>({});
  const dynRef = useRef<Record<string, Dyn>>({});
  const zc = useRef(1);
  const [, force] = useState(0);
  const dragId = useRef<string | null>(null);
  const dragInfo = useRef({ sx: 0, sy: 0, ox: 0, oy: 0, moved: false });

  useLayoutEffect(() => {
    const el = tableRef.current;
    if (!el) return;
    const W = el.clientWidth;
    const H = el.clientHeight;
    posRef.current = {};
    dynRef.current = {};
    list.forEach((m, i) => {
      let s = (i + 1) * 9301 + 49297;
      const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
      posRef.current[m.id] = {
        x: 16 + rnd() * Math.max(1, W - TW - 32),
        y: 16 + rnd() * Math.max(1, H - TH - 32),
        rot: (rnd() - 0.5) * 14,
        z: i + 1,
      };
      dynRef.current[m.id] = { ox: 0, oy: 0, vx: 0, vy: 0 };
    });
    zc.current = list.length + 1;
    force((n) => n + 1);
  }, [list]);

  // Flottement LIBRE : ressort + inertie, faible impact souris (clic possible).
  useEffect(() => {
    const el = tableRef.current;
    if (!el || !window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let mx = -9999;
    let my = -9999;
    let rect = el.getBoundingClientRect();
    const onMove = (e: PointerEvent) => ((mx = e.clientX), (my = e.clientY));
    const onScroll = () => (rect = el.getBoundingClientRect());

    let raf = 0;
    let running = false;
    const t0 = performance.now();
    const R = 190;
    const tick = (now: number) => {
      const t = (now - t0) / 1000;
      list.forEach((m, i) => {
        if (dragId.current === m.id) return;
        const base = posRef.current[m.id];
        const d = dynRef.current[m.id];
        const node = nodeRefs.current[m.id];
        if (!base || !d || !node) return;
        const cx = rect.left + base.x + TW / 2 + d.ox;
        const cy = rect.top + base.y + TH / 2 + d.oy;
        const dxp = cx - mx;
        const dyp = cy - my;
        const dist = Math.hypot(dxp, dyp) || 1;
        if (dist < R) {
          const f = (1 - dist / R) * 0.5; // poussée d'air FAIBLE
          d.vx += (dxp / dist) * f;
          d.vy += (dyp / dist) * f;
        }
        d.vx += -0.025 * d.ox; // rappel ressort
        d.vy += -0.025 * d.oy;
        d.vx *= 0.9; // amortissement
        d.vy *= 0.9;
        d.ox += d.vx;
        d.oy += d.vy;
        const idleX = Math.sin(t * 0.7 + i) * 2.5;
        const idleY = Math.cos(t * 0.55 + i * 1.3) * 2.5;
        const rot = base.rot + d.ox * 0.06 + Math.sin(t * 0.5 + i) * 1.1;
        node.style.transform = `translate(${(base.x + d.ox + idleX).toFixed(1)}px, ${(base.y + d.oy + idleY).toFixed(1)}px) rotate(${rot.toFixed(2)}deg)`;
        node.style.zIndex = String(base.z);
      });
      raf = requestAnimationFrame(tick);
    };
    const start = () => !running && ((running = true), (raf = requestAnimationFrame(tick)));
    const stop = () => ((running = false), cancelAnimationFrame(raf));

    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0 });
    io.observe(el);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      io.disconnect();
      stop();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [list]);

  const onPointerDown = (e: React.PointerEvent, id: string) => {
    const p = posRef.current[id];
    const d = dynRef.current[id];
    if (!p || !d) return;
    dragId.current = id;
    dragInfo.current = { sx: e.clientX, sy: e.clientY, ox: p.x + d.ox, oy: p.y + d.oy, moved: false };
    p.z = ++zc.current;
    window.addEventListener('pointermove', onMoveDrag);
    window.addEventListener('pointerup', onUpDrag);
  };
  const onMoveDrag = (e: PointerEvent) => {
    const id = dragId.current;
    if (!id) return;
    const di = dragInfo.current;
    const dx = e.clientX - di.sx;
    const dy = e.clientY - di.sy;
    if (Math.hypot(dx, dy) > 5) di.moved = true;
    const p = posRef.current[id];
    const d = dynRef.current[id];
    p.x = di.ox + dx;
    p.y = di.oy + dy;
    d.ox = 0;
    d.oy = 0;
    d.vx = 0;
    d.vy = 0;
    const node = nodeRefs.current[id];
    if (node) {
      node.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.rot}deg)`;
      node.style.zIndex = String(p.z);
    }
  };
  const onUpDrag = () => {
    const id = dragId.current;
    window.removeEventListener('pointermove', onMoveDrag);
    window.removeEventListener('pointerup', onUpDrag);
    dragId.current = null;
    if (id && !dragInfo.current.moved) {
      const node = nodeRefs.current[id];
      const m = list.find((x) => x.id === id);
      if (node && m) setFocus({ m, rect: node.getBoundingClientRect() });
    }
  };

  const FilterBtn = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={onClick}
      className={[
        'border-2 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-hud transition-all duration-snap',
        active ? 'border-accent bg-accent text-[color:var(--paper)] shadow-ink-sm' : 'border-line-strong text-[color:var(--text-dim)] hover:border-accent hover:text-[color:var(--text)]',
      ].join(' ')}
    >
      {children}
    </button>
  );

  return (
    <div className="mt-10">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <FilterBtn key={s.id} active={status === s.id} onClick={() => setStatus(s.id)}>
              {s.label}
            </FilterBtn>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterBtn active={game === ALL} onClick={() => setGame(ALL)}>
            Tous jeux
          </FilterBtn>
          {games.map((g) => (
            <FilterBtn key={g.id} active={game === g.id} onClick={() => setGame(g.id)}>
              {g.tag}
            </FilterBtn>
          ))}
        </div>
      </div>

      <p className="mb-4 font-mono text-[10px] uppercase tracking-hud text-[color:var(--text-mute)]">
        &gt; déplace les tickets · clique pour ouvrir · arrache pour accéder
      </p>

      {/* TABLE desktop */}
      <div ref={tableRef} className="relative hidden h-[640px] w-full overflow-hidden border-2 border-line-strong bg-base-900/40 dot-grid md:block">
        {list.map((m) => {
          const p = posRef.current[m.id];
          return (
            <div
              key={m.id}
              ref={(el) => (nodeRefs.current[m.id] = el)}
              onPointerDown={(e) => onPointerDown(e, m.id)}
              className="absolute left-0 top-0 cursor-grab touch-none will-change-transform active:cursor-grabbing"
              style={{
                transform: p ? `translate(${p.x}px, ${p.y}px) rotate(${p.rot}deg)` : undefined,
                zIndex: p?.z,
                opacity: focus?.m.id === m.id ? 0 : 1,
              }}
            >
              <TicketCard m={m} />
            </div>
          );
        })}
        {list.length === 0 && (
          <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-sm text-[color:var(--text-mute)]">
            &gt; Aucun match pour ce filtre.
          </p>
        )}
      </div>

      {/* MOBILE */}
      <div className="flex flex-col items-center gap-5 md:hidden">
        {list.map((m, i) => (
          <div
            key={m.id}
            style={{ transform: `rotate(${(i % 5) - 2}deg)`, opacity: focus?.m.id === m.id ? 0 : 1 }}
            onClick={(e) => setFocus({ m, rect: e.currentTarget.getBoundingClientRect() })}
          >
            <TicketCard m={m} />
          </div>
        ))}
      </div>

      {focus && <FocusTicket m={focus.m} rect={focus.rect} onClose={() => setFocus(null)} />}
    </div>
  );
}
