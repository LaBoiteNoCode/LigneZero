import type { Match } from '@/types';

/**
 * Calendrier. AJOUTER UN MATCH = une entrée ici. Dates en ISO.
 * Le tri chronologique est géré à l'affichage (lib/format.ts).
 * status : 'upcoming' | 'live' | 'finished'.
 */
export const matches: Match[] = [
  {
    id: 'm-1',
    gameId: 'valorant',
    opponent: { name: 'NEMESIS' },
    dateISO: '2026-07-04T19:00:00+02:00',
    competition: 'Regional Clash · Playoffs',
    status: 'upcoming',
    streamUrl: 'https://twitch.tv/',
  },
  {
    id: 'm-2',
    gameId: 'lol',
    opponent: { name: 'IRON WOLVES' },
    dateISO: '2026-07-02T21:00:00+02:00',
    competition: 'Div2 Summer · J6',
    status: 'upcoming',
    streamUrl: 'https://twitch.tv/',
  },
  {
    id: 'm-live',
    gameId: 'valorant',
    opponent: { name: 'AURORA' },
    dateISO: '2026-06-29T20:00:00+02:00',
    competition: 'Open Tour · Group A',
    status: 'live',
    score: { us: 1, them: 0 },
    streamUrl: 'https://twitch.tv/',
  },
  {
    id: 'm-3',
    gameId: 'valorant',
    opponent: { name: 'OBSIDIAN' },
    dateISO: '2026-06-21T18:00:00+02:00',
    competition: 'Regional Clash · J5',
    status: 'finished',
    score: { us: 2, them: 1 },
    vodUrl: 'https://youtube.com/',
  },
  {
    id: 'm-4',
    gameId: 'lol',
    opponent: { name: 'CRIMSON' },
    dateISO: '2026-06-18T21:00:00+02:00',
    competition: 'Div2 Summer · J4',
    status: 'finished',
    score: { us: 1, them: 0 },
    vodUrl: 'https://youtube.com/',
  },
  {
    id: 'm-5',
    gameId: 'valorant',
    opponent: { name: 'PHANTOM' },
    dateISO: '2026-06-12T19:30:00+02:00',
    competition: 'Open Tour · Group A',
    status: 'finished',
    score: { us: 0, them: 2 },
    vodUrl: 'https://youtube.com/',
  },
];
