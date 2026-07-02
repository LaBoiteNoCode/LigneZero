import type { Match } from '@lignezero/types';

/** Lundi 00:00 de la semaine contenant `iso`. */
export function mondayOf(iso: string): Date {
  const d = new Date(iso);
  const day = (d.getDay() + 6) % 7; // 0 = lundi
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d;
}

export function isoDate(d: Date): string {
  // Date locale au format YYYY-MM-DD (évite le décalage UTC de toISOString).
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export interface WeekOption {
  start: string;
  label: string;
  count: number;
}

/** Semaines (lundi ISO) ayant au moins un match, triées chronologiquement. */
export function weekOptions(matches: Match[]): WeekOption[] {
  const map = new Map<string, number>();
  for (const m of matches) {
    const s = isoDate(mondayOf(m.dateISO));
    map.set(s, (map.get(s) ?? 0) + 1);
  }
  const fmt = (x: Date) => x.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  return [...map.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([start, count]) => {
      const d = new Date(start);
      const end = new Date(d);
      end.setDate(d.getDate() + 6);
      return { start, count, label: `Semaine du ${fmt(d)} → ${fmt(end)}` };
    });
}

/** Matchs de la semaine commençant à `weekStart`, triés par date. */
export function matchesOfWeek(matches: Match[], weekStart?: string): Match[] {
  if (!weekStart) return [];
  const start = new Date(weekStart);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return matches
    .filter((m) => {
      const d = new Date(m.dateISO);
      return d >= start && d < end;
    })
    .sort((a, b) => (a.dateISO < b.dateISO ? -1 : 1));
}
