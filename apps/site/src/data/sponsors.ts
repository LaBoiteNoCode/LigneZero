import type { Sponsor } from '@/types';

/**
 * Partenaires. AJOUTER = une entrée ici. Logos : public/img/sponsors/.
 * tier : 'principal' | 'officiel' | 'technique'. `dossier` = lore (page Sponsors).
 */
export const sponsors: Sponsor[] = [
  {
    id: 'sp-1',
    name: 'HYPERVOLT',
    url: 'https://example.com',
    tier: 'principal',
    status: 'actif',
    tagline: 'L\'énergie derrière chaque round.',
    sector: 'Énergie',
    since: 2024,
    description: 'Partenaire titre de la structure. Présent sur le maillot, les lives et tous les événements majeurs.',
    contribution: 'Naming, maillot, dotation événements',
    dossier: {
      classification: 'NIVEAU 3',
      agent: 'C. LEROY',
      intel: ['Contrat-titre 3 ans', 'Logo central maillot', 'Naming de la gaming house'],
      story:
        'Premier à croire au projet. HYPERVOLT signe avant même le premier titre et finance le bootcamp fondateur. Le partenariat scelle l\'identité visuelle rouge de la structure — leur signature électrique.',
      activation: ['Maillot — torse', 'Habillage live (intro/outro)', 'Stand événements', 'Drops co-brandés'],
    },
  },
  {
    id: 'sp-2',
    name: 'NEXUS GEAR',
    url: 'https://example.com',
    tier: 'officiel',
    status: 'actif',
    sector: 'Périphériques',
    since: 2024,
    description: 'Équipe le roster en souris, claviers et casques de compétition.',
    contribution: 'Setup joueurs',
    dossier: {
      classification: 'NIVEAU 2',
      agent: 'C. LEROY',
      intel: ['Fourniture full setup', 'Éditions joueurs signature', 'Tests matériel en avant-première'],
      story:
        'NEXUS GEAR équipe chaque joueur sur-mesure. Les souris signature sortent en série limitée aux couleurs des joueurs — collector instantané pour la commu.',
      activation: ['Manche maillot', 'Souris/clavier signature', 'Concours giveaway'],
    },
  },
  {
    id: 'sp-3',
    name: 'KILOWATT',
    url: 'https://example.com',
    tier: 'officiel',
    status: 'actif',
    sector: 'Hardware',
    since: 2025,
    description: 'Fournisseur des PC et configurations de la gaming house.',
    contribution: 'PC & infrastructure',
    dossier: {
      classification: 'NIVEAU 2',
      agent: 'K. TANAKA',
      intel: ['12 configs compétition', 'Maintenance 24/7', 'Salle serveur dédiée'],
      story:
        'Sans KILOWATT, pas de framerate. Ils montent et maintiennent toute l\'infrastructure de la gaming house et assurent le matos sur les LAN.',
      activation: ['Dos maillot', 'Tour de cou caster', 'Visite setup en vidéo'],
    },
  },
  {
    id: 'sp-4',
    name: 'FORGE PERIPH',
    url: 'https://example.com',
    tier: 'technique',
    status: 'actif',
    sector: 'Mobilier',
    since: 2025,
    description: 'Sièges et bureaux ergonomiques de la structure.',
    contribution: 'Mobilier setup',
    dossier: {
      classification: 'NIVEAU 1',
      agent: 'K. TANAKA',
      intel: ['Bureaux réglables', 'Ergonomie validée kiné', 'Mobilier régie'],
      story: 'FORGE PERIPH a pensé chaque poste pour des sessions de 10h. Confort = constance en scrim.',
      activation: ['Habillage gaming house', 'Crédits vidéo'],
    },
  },
  {
    id: 'sp-5',
    name: 'BYTECHAIR',
    url: 'https://example.com',
    tier: 'technique',
    status: 'actif',
    sector: 'Assises',
    since: 2026,
    description: 'Assises de compétition pour l\'entraînement quotidien.',
    contribution: 'Sièges',
    dossier: {
      classification: 'NIVEAU 1',
      agent: 'I. RElla',
      intel: ['Sièges compétition', 'Modèles aux couleurs équipe'],
      story: 'Dernier arrivé, déjà adopté. BYTECHAIR fournit les sièges floqués du roster.',
      activation: ['Setup joueurs', 'Photos contenus'],
    },
  },
  {
    id: 'sp-6',
    name: 'NODE ENERGY',
    url: 'https://example.com',
    tier: 'technique',
    status: 'actif',
    sector: 'Boisson',
    since: 2026,
    description: 'Boisson officielle de la structure pendant les bootcamps.',
    contribution: 'Nutrition / boissons',
    dossier: {
      classification: 'NIVEAU 1',
      agent: 'I. RElla',
      intel: ['Boisson officielle', 'Saveur édition équipe', 'Ravito LAN'],
      story: 'NODE ENERGY carbure les bootcamps. Une saveur signature sort aux couleurs de la structure.',
      activation: ['Frigo régie', 'Placement live', 'Édition limitée'],
    },
  },
];

/** Chiffres d'audience (bloc "Devenir partenaire"). Édite ici. */
export interface AudienceStat {
  label: string;
  value: number;
  suffix?: string;
}

export const audience: AudienceStat[] = [
  { label: 'Abonnés réseaux', value: 184, suffix: 'K' },
  { label: 'Vues mensuelles', value: 2.4, suffix: 'M' },
  { label: 'Heures watch / an', value: 920, suffix: 'K' },
  { label: 'Taux d\'engagement', value: 7.8, suffix: '%' },
];
