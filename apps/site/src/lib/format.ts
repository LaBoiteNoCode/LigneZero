import type { Match } from '@/types';

/** Date courte FR : "ven. 04 juil." */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
}

/** Heure FR : "19:00" */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

/** Le match en cours (status live), s'il y en a un. */
export function getLiveMatch(list: Match[]): Match | undefined {
  return list.find((m) => m.status === 'live');
}

/** Le prochain match à venir (le plus proche dans le temps). */
export function getNextMatch(list: Match[]): Match | undefined {
  const now = Date.now();
  return list
    .filter((m) => m.status === 'upcoming' && new Date(m.dateISO).getTime() > now)
    .sort((a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime())[0];
}

/** Slug d'URL d'un joueur (à partir du pseudo). */
export function playerSlug(pseudo: string): string {
  return pseudo.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

/** À venir + live d'abord (ordre chrono croissant), puis terminés (récents d'abord). */
export function sortMatches(list: Match[]): Match[] {
  const rank = (m: Match) => (m.status === 'finished' ? 1 : 0);
  return [...list].sort((a, b) => {
    const r = rank(a) - rank(b);
    if (r !== 0) return r;
    const ta = new Date(a.dateISO).getTime();
    const tb = new Date(b.dateISO).getTime();
    return rank(a) === 1 ? tb - ta : ta - tb;
  });
}
