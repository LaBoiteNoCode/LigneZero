import type { Staff } from '@/types';

/** Staff. AJOUTER = une entrée ici. Photos : public/img/staff/. */
export const staff: Staff[] = [
  {
    id: 's-coach',
    name: 'Romain "AXIS" D.',
    role: 'Head Coach — Valorant',
    division: 'Performance',
    clearance: 'Niveau 4',
    matricule: 'STF-001',
    since: 2021,
    socials: [{ label: 'X', url: 'https://x.com/' }],
    bio: 'Ancien joueur tier 1, structure le jeu et la préparation mentale.',
  },
  {
    id: 's-manager',
    name: 'Camille L.',
    role: 'Team Manager',
    division: 'Opérations',
    clearance: 'Niveau 5',
    matricule: 'STF-002',
    since: 2020,
    socials: [{ label: 'LinkedIn', url: 'https://linkedin.com/' }],
    bio: 'Logistique, contrats, vie quotidienne du roster.',
  },
  {
    id: 's-analyst',
    name: 'Kevin "PROBE" T.',
    role: 'Analyste',
    division: 'Performance',
    clearance: 'Niveau 3',
    matricule: 'STF-003',
    since: 2022,
    socials: [{ label: 'X', url: 'https://x.com/' }],
    bio: 'Scouting adverses, data de drafts et de rounds.',
  },
  {
    id: 's-crea',
    name: 'Inès "PIXL" R.',
    role: 'Direction créative',
    division: 'Brand',
    clearance: 'Niveau 3',
    matricule: 'STF-004',
    since: 2022,
    socials: [{ label: 'Instagram', url: 'https://instagram.com/' }],
    bio: 'Identité visuelle, motion, contenus réseaux.',
  },
];
