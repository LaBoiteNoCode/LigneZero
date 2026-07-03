/**
 * Modèle de données LigneZero — SOURCE UNIQUE partagée par le vitrine
 * (apps/site) et l'esport manager (apps/manager).
 *
 * Ces interfaces (camelCase) sont le "domaine" applicatif. La DB Supabase
 * stocke les mêmes données en snake_case ; la conversion vit dans
 * @lignezero/supabase (mappers). Garder ces interfaces stables : elles sont
 * le contrat entre les deux apps.
 */

export interface SocialLink {
  label: string;
  url: string;
}

/** Un jeu = un effectif. L'archi gère N jeux. */
export interface Game {
  id: string;
  slug: string;
  name: string;
  /** Sigle court (ex. VAL, LoL). */
  tag: string;
  /** Visuel/illustration. Optionnel → placeholder. */
  visual?: string;
  /** Couleur signature du jeu (hex) — teinte la bande foil / le titre. */
  color?: string;
  /** Chiffres clés flottant en 3D autour du pilier (victoires, podiums…). */
  stats?: PlayerStat[];
  palmares: string[];
}

export type PlayerRole = string;

export interface PlayerStat {
  label: string;
  value: string;
}

export interface Player {
  id: string;
  pseudo: string;
  firstName?: string;
  lastName?: string;
  role: PlayerRole;
  /** Relie le joueur à l'effectif d'un jeu (Game.id). */
  gameId: string;
  country?: string;
  /** Couleur signature du joueur (hex) — recolore sa fiche. */
  color?: string;
  /** Portrait. Optionnel → placeholder. */
  photo?: string;
  socials: SocialLink[];
  stats: PlayerStat[];
  palmares: string[];
  joinedYear?: number;
  /** Setup gaming (souris, clavier, tapis, écran…) — renseigné par le joueur. */
  setup: PlayerStat[];
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  photo?: string;
  socials: SocialLink[];
  bio?: string;
  /** Matricule badge (ex. "STF-042"). Optionnel → généré depuis l'id. */
  matricule?: string;
  /** Niveau d'habilitation affiché sur le badge (ex. "NIVEAU 3"). */
  clearance?: string;
  /** Division / pôle gravé sur la plaque (ex. "PERFORMANCE"). */
  division?: string;
  /** Année d'arrivée dans la structure. */
  since?: number;
}

export type SponsorTier = 'principal' | 'officiel' | 'technique';

/** État du partenariat dans le pipeline de suivi (public : pilote la vitrine). */
export type SponsorStatus = 'prospect' | 'contact' | 'negociation' | 'actif' | 'pause' | 'termine';

export interface SponsorDossier {
  classification?: string;
  agent?: string;
  /** Faits bruts (puces). */
  intel?: string[];
  /** Récit du partenariat (paragraphe). */
  story?: string;
  /** Où la marque apparaît (activation). */
  activation?: string[];
}

export interface Sponsor {
  id: string;
  name: string;
  /** Logo. Optionnel → placeholder texte. */
  logo?: string;
  /** Couleur signature de la marque (hex) — teinte la scène spotlight. */
  color?: string;
  url: string;
  tier: SponsorTier;
  /** Accroche du partenariat (surtout pour le partenaire principal). */
  tagline?: string;
  /** Secteur d'activité (ex. Énergie, Périphériques). */
  sector?: string;
  /** Année de début du partenariat. */
  since?: number;
  /** Description courte affichée dans la fiche. */
  description?: string;
  /** Ce que le partenaire apporte à la structure. */
  contribution?: string;
  /** Contenu "dossier d'enquête" (lore pour la commu). */
  dossier?: SponsorDossier;
  /** État du pipeline — seuls les 'actif' apparaissent sur la vitrine. */
  status: SponsorStatus;
}

/** Suivi business d'un sponsor — table PRIVÉE (manager/admin uniquement). */
export interface SponsorTracking {
  sponsorId: string;
  /** Date ISO (jour). */
  contractStart?: string;
  contractEnd?: string;
  /** Valeur annuelle du contrat (€). */
  valueAnnual?: number;
  contactName?: string;
  contactEmail?: string;
  notes?: string;
}

export type MatchStatus = 'upcoming' | 'live' | 'finished';

export interface MatchOpponent {
  name: string;
  logo?: string;
}

export interface MatchScore {
  us: number;
  them: number;
}

export interface Match {
  id: string;
  gameId: string;
  opponent: MatchOpponent;
  /** Date ISO (tri chronologique). */
  dateISO: string;
  competition: string;
  status: MatchStatus;
  /** Score si terminé/live. */
  score?: MatchScore;
  streamUrl?: string;
  vodUrl?: string;
}

/** Créateur / streamer de la communauté (page Communauté). */
export interface Creator {
  id: string;
  name: string;
  /** Rôle affiché (ex. "Joueur · Valorant", "Créatrice"). */
  role?: string;
  platform: 'Twitch' | 'YouTube' | 'Kick';
  /** En live actuellement → carte mise en avant + badge LIVE. */
  live?: boolean;
  /** Titre du live / dernière vidéo. */
  title?: string;
  /** Spectateurs si en live. */
  viewers?: number;
  /** Avatar. Optionnel → placeholder. */
  avatar?: string;
  url: string;
}

/** Clip / temps fort partagé par la communauté. */
export interface Clip {
  id: string;
  title: string;
  author: string;
  game?: string;
  /** Vignette. Optionnel → placeholder. */
  thumb?: string;
  url: string;
}

export type ProductStatus = 'available' | 'soon';

export interface Product {
  id: string;
  name: string;
  category: string;
  price?: string;
  image?: string;
  status: ProductStatus;
}

/** Rôle d'un compte (profiles.role côté Supabase). */
export type UserRole = 'admin' | 'manager' | 'coach' | 'joueur' | 'staff' | 'content' | 'graphiste' | 'member';

export interface Profile {
  id: string;
  role: UserRole;
  displayName?: string;
  /** Lie un compte joueur à sa fiche roster (players.id). */
  playerId?: string;
}

// ── Plateforme d'équipe (manager utilisé par direction + staff + joueurs) ──

export interface Announcement {
  id: string;
  title: string;
  body: string;
  audience: string;
  createdAt: string;
}

export type ObjectiveScope = 'team' | 'player';
export type ObjectiveStatus = 'todo' | 'doing' | 'done';

export interface Objective {
  id: string;
  scope: ObjectiveScope;
  /** Requis si scope='player'. */
  playerId?: string;
  /** Lundi de la semaine (date ISO) ou vide. */
  week?: string;
  title: string;
  detail?: string;
  status: ObjectiveStatus;
  createdAt: string;
}

export interface Feedback {
  id: string;
  playerId: string;
  /** Match lié (optionnel). */
  matchId?: string;
  body: string;
  acknowledged: boolean;
  reply?: string;
  /** Renvoie à un checkpoint précis d'une revue vidéo (auto-créé depuis la revue). */
  reviewId?: string;
  timestampSec?: number;
  createdAt: string;
}

export type SessionKind = 'scrim' | 'practice' | 'review' | 'tournament' | 'meeting' | 'event';

export interface Session {
  id: string;
  kind: SessionKind;
  title: string;
  /** Date/heure ISO. */
  startsAt: string;
  durationMin?: number;
  gameId?: string;
  location?: string;
  notes?: string;
}

export type RsvpStatus = 'yes' | 'no' | 'maybe';

export interface SessionRsvp {
  sessionId: string;
  playerId: string;
  status: RsvpStatus;
}

export type AvailabilityStatus = 'available' | 'maybe';

/** Un créneau de disponibilité : un jour + une plage horaire (plusieurs par jour). */
export interface Availability {
  id: string;
  playerId: string;
  /** Jour (date ISO). */
  day: string;
  /** Heure de début 'HH:MM'. */
  startTime?: string;
  /** Heure de fin 'HH:MM'. */
  endTime?: string;
  status: AvailabilityStatus;
  note?: string;
}

/** Revue vidéo : un VOD (YouTube/Twitch/autre) sur lequel le staff pose des annotations. */
export interface VideoReview {
  id: string;
  title: string;
  videoUrl: string;
  /** Jeu concerné (optionnel). */
  gameId?: string;
  /** Session de revue liée (calendrier), optionnelle. */
  sessionId?: string;
  /** Match précis auquel cette revue se rapporte (hub match), optionnel. */
  matchId?: string;
  createdAt: string;
}

/** Checkpoint horodaté sur une VideoReview. Sans playerId = remarque pour toute l'équipe. */
export interface VideoAnnotation {
  id: string;
  reviewId: string;
  /** Instant dans la vidéo, en secondes. */
  timestampSec: number;
  tag: string;
  description: string;
  playerId?: string;
  createdAt: string;
}

/** Stats d'un joueur pour un match précis (hub match) — même forme que PlayerStat. */
export interface MatchPlayerStat {
  id: string;
  matchId: string;
  playerId: string;
  stats: PlayerStat[];
}

/** Objet d'inventaire membre. Attribué par un bot Twitch/Discord externe (lecture seule côté site). */
export type InventoryItemKind = 'ticket' | 'cartouche' | 'special';

export interface InventoryItem {
  id: string;
  ownerId: string;
  kind: InventoryItemKind;
  name: string;
  description?: string;
  image?: string;
  /** Origine du drop (ex. 'twitch', 'discord', 'manuel'). */
  source?: string;
  obtainedAt: string;
}

/** Match marqué favori par un membre (auto-service). */
export interface FavoriteMatch {
  ownerId: string;
  matchId: string;
}

/** Comptes externes liés (pour que le bot de drops retrouve le bon membre). */
export interface MemberLinks {
  ownerId: string;
  discordHandle?: string;
  twitchHandle?: string;
}

/** Entrée de bibliothèque de strats/executes, taguée par jeu/map. */
export interface Strat {
  id: string;
  title: string;
  gameId?: string;
  map?: string;
  description: string;
  tags: string[];
  /** Renvoie vers un instant précis d'une revue vidéo (démonstration). */
  reviewId?: string;
  timestampSec?: number;
  createdAt: string;
}

// ── Studio graphique (demandes de visuels traitées par les graphistes) ──

export type DesignKind = 'reseaux' | 'maillot' | 'overlay' | 'print' | 'logo' | 'autre';
export type DesignStatus = 'todo' | 'doing' | 'review' | 'done';

export interface DesignRequest {
  id: string;
  title: string;
  /** Brief / consignes. */
  brief?: string;
  kind: DesignKind;
  status: DesignStatus;
  /** Échéance (date ISO jour). */
  due?: string;
  /** Lien vers le livrable (Drive, Figma, export…). */
  assetUrl?: string;
  createdAt: string;
}

// ── Finance (accès CEO/admin uniquement — RLS stricte) ──

export type TransactionKind = 'depense' | 'revenu';

export interface Transaction {
  id: string;
  kind: TransactionKind;
  /** Catégorie libre (Sponsoring, Salaires, Déplacements, Merch…). */
  category: string;
  label: string;
  /** Montant positif (€) — le sens vient de `kind`. */
  amount: number;
  /** Date de la transaction (ISO jour). */
  date: string;
  /** Sponsor lié (revenus de sponsoring). */
  sponsorId?: string;
  notes?: string;
}
