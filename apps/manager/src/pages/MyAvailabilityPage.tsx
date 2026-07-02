import { useEffect, useMemo, useState } from 'react';
import type { Availability, AvailabilityStatus } from '@lignezero/types';
import { db } from '@/lib/supabase';
import { useAuth } from '@/auth/AuthProvider';
import { Badge, Button, Panel, Spinner } from '@/components/ui';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

function mondayOf(offset: number): Date {
  const x = new Date();
  const day = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - day + offset * 7);
  x.setHours(0, 0, 0, 0);
  return x;
}
const isoDay = (d: Date) => d.toISOString().slice(0, 10);

export function MyAvailabilityPage() {
  const { playerId } = useAuth();
  const [offset, setOffset] = useState(0);
  const [rows, setRows] = useState<Availability[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const week = useMemo(() => {
    const mon = mondayOf(offset);
    return DAYS.map((label, i) => {
      const d = new Date(mon);
      d.setDate(mon.getDate() + i);
      return { label, date: d, key: isoDay(d) };
    });
  }, [offset]);

  async function refresh() {
    try {
      setRows(await db.listAvailability());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    }
  }
  useEffect(() => {
    refresh();
  }, []);

  if (!playerId) {
    return (
      <Panel title="Mes disponibilités">
        <p className="font-mono text-sm text-[color:var(--signal-warn)]">
          &gt; Compte non lié à une fiche joueur. Contacte un admin.
        </p>
      </Panel>
    );
  }
  if (!rows) return <Spinner label="Chargement…" />;

  const slotsOf = (key: string) =>
    rows
      .filter((r) => r.day === key)
      .sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? ''));

  const mon = week[0].date;
  const sun = week[6].date;

  return (
    <div>
      <header className="mb-6 flex items-end justify-between">
        <div>
          <p className="hud-label text-[11px]">DISP // Mes disponibilités</p>
          <h1 className="font-display text-3xl font-bold uppercase tracking-hud">Mes disponibilités</h1>
          <p className="mt-1 font-mono text-xs text-[color:var(--text-dim)]">
            &gt; Ajoute tes créneaux précis par jour. Aucun créneau = indisponible.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => setOffset((o) => o - 1)}>←</Button>
          <span className="font-mono text-xs text-[color:var(--text-dim)]">
            {mon.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} – {sun.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
          </span>
          <Button variant="ghost" onClick={() => setOffset((o) => o + 1)}>→</Button>
        </div>
      </header>

      {error && <p className="mb-4 border border-[color:var(--accent)] px-3 py-2 font-mono text-xs text-accent">{error}</p>}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {week.map((d) => (
          <DayCard
            key={d.key}
            label={`${d.label} ${d.date.getDate()}/${d.date.getMonth() + 1}`}
            slots={slotsOf(d.key)}
            onAdd={async (startTime, endTime, status) => {
              setError(null);
              try {
                await db.upsertAvailability({ playerId, day: d.key, startTime, endTime, status });
                refresh();
              } catch (e) {
                setError(e instanceof Error ? e.message : 'Erreur');
              }
            }}
            onRemove={async (id) => {
              await db.removeAvailability(id);
              refresh();
            }}
          />
        ))}
      </div>
    </div>
  );
}

function DayCard({
  label,
  slots,
  onAdd,
  onRemove,
}: {
  label: string;
  slots: Availability[];
  onAdd: (start: string, end: string, status: AvailabilityStatus) => void;
  onRemove: (id: string) => void;
}) {
  const [from, setFrom] = useState('18:00');
  const [to, setTo] = useState('22:00');
  const [status, setStatus] = useState<AvailabilityStatus>('available');
  const [err, setErr] = useState<string | null>(null);

  function add() {
    if (from >= to) {
      setErr('Fin après le début.');
      return;
    }
    setErr(null);
    onAdd(from, to, status);
  }

  return (
    <Panel title={label}>
      {slots.length === 0 ? (
        <p className="mb-3 font-mono text-xs text-[color:var(--text-mute)]">Indisponible (aucun créneau).</p>
      ) : (
        <ul className="mb-3 space-y-1.5">
          {slots.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-2 border border-line-strong px-3 py-1.5">
              <span className="font-mono text-sm text-[color:var(--text)]">
                {s.startTime}–{s.endTime}
              </span>
              <span className="flex items-center gap-2">
                <Badge tone={s.status === 'available' ? 'ok' : 'warn'}>{s.status === 'available' ? 'dispo' : 'peut-être'}</Badge>
                <button onClick={() => onRemove(s.id)} className="font-mono text-xs text-[color:var(--text-mute)] hover:text-accent">✕</button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-end gap-2 border-t border-line pt-3">
        <div>
          <label className="label">De</label>
          <input type="time" className="field w-28" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <label className="label">À</label>
          <input type="time" className="field w-28" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div>
          <label className="label">Statut</label>
          <select className="field w-32" value={status} onChange={(e) => setStatus(e.target.value as AvailabilityStatus)}>
            <option value="available">Dispo</option>
            <option value="maybe">Peut-être</option>
          </select>
        </div>
        <Button onClick={add}>+ Ajouter</Button>
      </div>
      {err && <p className="mt-2 font-mono text-[11px] text-accent">{err}</p>}
    </Panel>
  );
}
