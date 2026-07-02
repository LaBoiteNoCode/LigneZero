import type { Game } from '@/types';

/**
 * Jeux de la structure. AJOUTER UN JEU = une entrée ici (l'archi gère N jeux).
 * Relie les joueurs via Player.gameId === Game.id.
 */
export const games: Game[] = [
  {
    id: 'valorant',
    slug: 'valorant',
    name: 'Valorant',
    tag: 'VAL',
    visual: undefined, // public/img/games/valorant.png
    color: '#ff4655',
    stats: [
      { label: 'Titres', value: '03' },
      { label: 'Podiums', value: '07' },
      { label: 'Victoires', value: '128' },
      { label: 'Winrate', value: '67%' },
    ],
    palmares: ['Champion Regional Clash 2025', 'Top 4 Open Tour Winter 2025'],
  },
  {
    id: 'lol',
    slug: 'league-of-legends',
    name: 'League of Legends',
    tag: 'LoL',
    visual: undefined,
    color: '#0ac8b9',
    stats: [
      { label: 'Titres', value: '02' },
      { label: 'Podiums', value: '05' },
      { label: 'Victoires', value: '96' },
      { label: 'Winrate', value: '61%' },
    ],
    palmares: ['Vainqueur Div2 Spring 2026', 'Promotion LFL 2026'],
  },
];
