import { useEffect, useMemo, useState } from 'react';
import type { Availability, Player } from '@lignezero/types';
import { db } from '@/lib/supabase';
import { Button, Panel, Spinner } from '@/components/ui';

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function mondayOf(offset: number): Date {
  const x = new Date();
  const day = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - day + offset * 7);
  x.setHours(0, 0, 0, 0);
  return x;
}
const isoDay = (d: Date) => d.toISOString().slice(0, 10);

export function TeamAvailabilityPage() {
  const [offset, setOffset] = useState(0);
  const [players, setPlayers] = useState<Player[]>([]);
  const [rows, setRows] = useState<Availability[] | null>(null);

  const week = useMemo(() => {
    const mon = mondayOf(offset);
    return DAYS.map((label, i) => {
      const d = new Date(mon);
      d.setDate(mon.getDate() + i);
      return { label, date: d, key: isoDay(d) };
    });
  }, [offset]);

  useEffect(() => {
    (async () => {
      const [ps, av] = await Promise.all([db.listPlayers(), db.listAvailability()]);
      setPlayers(ps);
      setRows(av);
    })();
  }, []);

  const slots = (playerId: string, key: string) =>
    (rows ?? [])
      .filter((r) => r.playerId === playerId && r.day === key)
      .sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? ''));

  if (!rows) return <Spinner label="Chargement…" />;

  const mon = week[0].date;
  const sun = week[6].date;

  return (
    <div>
      <header className="mb-6 flex items-end justify-between">
        <div>
          <p className="hud-label text-[11px]">GRID // Dispos équipe</p>
          <h1 className="font-display text-3xl font-bold uppercase tracking-hud">Dispos équipe</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => setOffset((o) => o - 1)}>←</Button>
          <span className="font-mono text-xs text-[color:var(--text-dim)]">
            {mon.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} – {sun.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
          </span>
          <Button variant="ghost" onClick={() => setOffset((o) => o + 1)}>→</Button>
        </div>
      </header>

      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="hud-label text-[10px]">
                <th className="px-3 py-2">Joueur</th>
                {week.map((d) => (
                  <th key={d.key} className="px-3 py-2 text-center">{d.label} {d.date.getDate()}</th>
                ))}
              </tr>
            </thead>
            <tbody className="font-mono text-xs">
              {players.map((p) => (
                <tr key={p.id} className="border-t border-line align-top">
                  <td className="px-3 py-2 font-semibold text-[color:var(--text)]">{p.pseudo}</td>
                  {week.map((d) => {
                    const cell = slots(p.id, d.key);
                    return (
                      <td key={d.key} className="px-2 py-2 text-center">
                        {cell.length === 0 ? (
                          <span className="text-[color:var(--text-mute)]">—</span>
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            {cell.map((s) => (
                              <span
                                key={s.id}
                                className="whitespace-nowrap px-1.5 py-0.5 text-[10px]"
                                style={{
                                  background: s.status === 'available' ? 'var(--signal-ok)' : 'var(--signal-warn)',
                                  color: '#0d0d0b',
                                }}
                              >
                                {s.startTime}–{s.endTime}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex gap-4 font-mono text-[10px] uppercase tracking-hud text-[color:var(--text-mute)]">
          <span><span className="mr-1 inline-block h-3 w-3 align-middle" style={{ background: 'var(--signal-ok)' }} /> Dispo</span>
          <span><span className="mr-1 inline-block h-3 w-3 align-middle" style={{ background: 'var(--signal-warn)' }} /> Peut-être</span>
          <span>— = indisponible</span>
        </div>
      </Panel>
    </div>
  );
}
