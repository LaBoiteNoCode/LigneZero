/**
 * Requêtes typées, retournant/acceptant des types domaine (@lignezero/types).
 * Lecture : listes triées par sort_order (contenu) ou date (matchs).
 * Écriture (manager) : upsert / remove. Les RLS imposent le rôle staff.
 */
import type {
  Game,
  Player,
  Staff,
  Sponsor,
  Match,
  Creator,
  Clip,
  Product,
  Profile,
  UserRole,
  Announcement,
  Objective,
  ObjectiveStatus,
  Feedback,
  Session,
  SessionRsvp,
  Availability,
} from '@lignezero/types';
import type { LigneZeroClient } from './client';
import {
  fromGameRow,
  fromPlayerRow,
  fromStaffRow,
  fromSponsorRow,
  fromMatchRow,
  fromCreatorRow,
  fromClipRow,
  fromProductRow,
  toGameRow,
  toPlayerRow,
  toStaffRow,
  toSponsorRow,
  toMatchRow,
  toCreatorRow,
  toClipRow,
  toProductRow,
  fromProfileRow,
  fromAnnouncementRow,
  toAnnouncementRow,
  fromObjectiveRow,
  toObjectiveRow,
  fromFeedbackRow,
  toFeedbackRow,
  fromSessionRow,
  toSessionRow,
  fromRsvpRow,
  toRsvpRow,
  fromAvailabilityRow,
  toAvailabilityRow,
} from './mappers';

function unwrap<T>(data: T | null, error: { message: string } | null): T {
  if (error) throw new Error(`[supabase] ${error.message}`);
  return data as T;
}

export function createQueries(sb: LigneZeroClient) {
  return {
    // ── Games ──
    async listGames(): Promise<Game[]> {
      const { data, error } = await sb.from('games').select('*').order('sort_order');
      return unwrap(data, error).map(fromGameRow);
    },
    async upsertGame(g: Game, sortOrder?: number): Promise<void> {
      const { error } = await sb.from('games').upsert(toGameRow(g, sortOrder ?? 0));
      unwrap(null, error);
    },
    async removeGame(id: string): Promise<void> {
      const { error } = await sb.from('games').delete().eq('id', id);
      unwrap(null, error);
    },

    // ── Players ──
    async listPlayers(): Promise<Player[]> {
      const { data, error } = await sb.from('players').select('*').order('sort_order');
      return unwrap(data, error).map(fromPlayerRow);
    },
    async listPlayersByGame(gameId: string): Promise<Player[]> {
      const { data, error } = await sb
        .from('players')
        .select('*')
        .eq('game_id', gameId)
        .order('sort_order');
      return unwrap(data, error).map(fromPlayerRow);
    },
    async upsertPlayer(p: Player, sortOrder?: number): Promise<void> {
      const { error } = await sb.from('players').upsert(toPlayerRow(p, sortOrder ?? 0));
      unwrap(null, error);
    },
    async removePlayer(id: string): Promise<void> {
      const { error } = await sb.from('players').delete().eq('id', id);
      unwrap(null, error);
    },
    /** MAJ profil joueur (sous-ensemble éditable par le joueur lui-même). */
    async updatePlayerProfile(
      id: string,
      f: { pseudo: string; firstName?: string; lastName?: string; country?: string; color?: string; photo?: string; socials: Player['socials'] },
    ): Promise<void> {
      const { error } = await sb
        .from('players')
        .update({
          pseudo: f.pseudo,
          first_name: f.firstName ?? null,
          last_name: f.lastName ?? null,
          country: f.country ?? null,
          color: f.color ?? null,
          photo: f.photo ?? null,
          socials: (f.socials ?? []) as unknown as import('./database.types').TablesInsert<'players'>['socials'],
        })
        .eq('id', id);
      unwrap(null, error);
    },

    // ── Staff ──
    async listStaff(): Promise<Staff[]> {
      const { data, error } = await sb.from('staff').select('*').order('sort_order');
      return unwrap(data, error).map(fromStaffRow);
    },
    async upsertStaff(s: Staff, sortOrder?: number): Promise<void> {
      const { error } = await sb.from('staff').upsert(toStaffRow(s, sortOrder ?? 0));
      unwrap(null, error);
    },
    async removeStaff(id: string): Promise<void> {
      const { error } = await sb.from('staff').delete().eq('id', id);
      unwrap(null, error);
    },

    // ── Sponsors ──
    async listSponsors(): Promise<Sponsor[]> {
      const { data, error } = await sb.from('sponsors').select('*').order('sort_order');
      return unwrap(data, error).map(fromSponsorRow);
    },
    async upsertSponsor(s: Sponsor, sortOrder?: number): Promise<void> {
      const { error } = await sb.from('sponsors').upsert(toSponsorRow(s, sortOrder ?? 0));
      unwrap(null, error);
    },
    async removeSponsor(id: string): Promise<void> {
      const { error } = await sb.from('sponsors').delete().eq('id', id);
      unwrap(null, error);
    },

    // ── Matches ──
    async listMatches(): Promise<Match[]> {
      const { data, error } = await sb.from('matches').select('*').order('date_iso');
      return unwrap(data, error).map(fromMatchRow);
    },
    async upsertMatch(m: Match): Promise<void> {
      const { error } = await sb.from('matches').upsert(toMatchRow(m));
      unwrap(null, error);
    },
    async removeMatch(id: string): Promise<void> {
      const { error } = await sb.from('matches').delete().eq('id', id);
      unwrap(null, error);
    },

    // ── Creators ──
    async listCreators(): Promise<Creator[]> {
      const { data, error } = await sb.from('creators').select('*').order('sort_order');
      return unwrap(data, error).map(fromCreatorRow);
    },
    async upsertCreator(c: Creator, sortOrder?: number): Promise<void> {
      const { error } = await sb.from('creators').upsert(toCreatorRow(c, sortOrder ?? 0));
      unwrap(null, error);
    },
    async removeCreator(id: string): Promise<void> {
      const { error } = await sb.from('creators').delete().eq('id', id);
      unwrap(null, error);
    },

    // ── Clips ──
    async listClips(): Promise<Clip[]> {
      const { data, error } = await sb.from('clips').select('*').order('sort_order');
      return unwrap(data, error).map(fromClipRow);
    },
    async upsertClip(c: Clip, sortOrder?: number): Promise<void> {
      const { error } = await sb.from('clips').upsert(toClipRow(c, sortOrder ?? 0));
      unwrap(null, error);
    },
    async removeClip(id: string): Promise<void> {
      const { error } = await sb.from('clips').delete().eq('id', id);
      unwrap(null, error);
    },

    // ── Products ──
    async listProducts(): Promise<Product[]> {
      const { data, error } = await sb.from('products').select('*').order('sort_order');
      return unwrap(data, error).map(fromProductRow);
    },
    async upsertProduct(p: Product, sortOrder?: number): Promise<void> {
      const { error } = await sb.from('products').upsert(toProductRow(p, sortOrder ?? 0));
      unwrap(null, error);
    },
    async removeProduct(id: string): Promise<void> {
      const { error } = await sb.from('products').delete().eq('id', id);
      unwrap(null, error);
    },

    // ── Profiles / rôles ──
    async myProfile(): Promise<Profile | null> {
      const { data } = await sb.auth.getUser();
      const uid = data.user?.id;
      if (!uid) return null;
      const { data: row } = await sb.from('profiles').select('*').eq('id', uid).single();
      return row ? fromProfileRow(row) : null;
    },
    async listProfiles(): Promise<Profile[]> {
      const { data, error } = await sb.from('profiles').select('*').order('created_at');
      return unwrap(data, error).map(fromProfileRow);
    },
    async setRole(id: string, role: UserRole): Promise<void> {
      const { error } = await sb.from('profiles').update({ role }).eq('id', id);
      unwrap(null, error);
    },
    async linkPlayer(id: string, playerId: string | null): Promise<void> {
      const { error } = await sb.from('profiles').update({ player_id: playerId }).eq('id', id);
      unwrap(null, error);
    },

    // ── Announcements ──
    async listAnnouncements(): Promise<Announcement[]> {
      const { data, error } = await sb.from('announcements').select('*').order('created_at', { ascending: false });
      return unwrap(data, error).map(fromAnnouncementRow);
    },
    async upsertAnnouncement(a: Partial<Announcement>): Promise<void> {
      const { error } = await sb.from('announcements').upsert(toAnnouncementRow(a));
      unwrap(null, error);
    },
    async removeAnnouncement(id: string): Promise<void> {
      const { error } = await sb.from('announcements').delete().eq('id', id);
      unwrap(null, error);
    },

    // ── Objectives ──
    async listObjectives(): Promise<Objective[]> {
      const { data, error } = await sb.from('objectives').select('*').order('created_at', { ascending: false });
      return unwrap(data, error).map(fromObjectiveRow);
    },
    async upsertObjective(o: Partial<Objective>): Promise<void> {
      const { error } = await sb.from('objectives').upsert(toObjectiveRow(o));
      unwrap(null, error);
    },
    async setObjectiveStatus(id: string, status: ObjectiveStatus): Promise<void> {
      const { error } = await sb.from('objectives').update({ status }).eq('id', id);
      unwrap(null, error);
    },
    async removeObjective(id: string): Promise<void> {
      const { error } = await sb.from('objectives').delete().eq('id', id);
      unwrap(null, error);
    },

    // ── Feedback ──
    async listFeedback(): Promise<Feedback[]> {
      const { data, error } = await sb.from('feedback').select('*').order('created_at', { ascending: false });
      return unwrap(data, error).map(fromFeedbackRow);
    },
    async upsertFeedback(f: Partial<Feedback>): Promise<void> {
      const { error } = await sb.from('feedback').upsert(toFeedbackRow(f));
      unwrap(null, error);
    },
    async ackFeedback(id: string, reply?: string): Promise<void> {
      const { error } = await sb.from('feedback').update({ acknowledged: true, reply: reply ?? null }).eq('id', id);
      unwrap(null, error);
    },
    async removeFeedback(id: string): Promise<void> {
      const { error } = await sb.from('feedback').delete().eq('id', id);
      unwrap(null, error);
    },

    // ── Sessions ──
    async listSessions(): Promise<Session[]> {
      const { data, error } = await sb.from('sessions').select('*').order('starts_at');
      return unwrap(data, error).map(fromSessionRow);
    },
    async upsertSession(s: Partial<Session>): Promise<void> {
      const { error } = await sb.from('sessions').upsert(toSessionRow(s));
      unwrap(null, error);
    },
    async removeSession(id: string): Promise<void> {
      const { error } = await sb.from('sessions').delete().eq('id', id);
      unwrap(null, error);
    },

    // ── RSVP ──
    async listRsvp(): Promise<SessionRsvp[]> {
      const { data, error } = await sb.from('session_rsvp').select('*');
      return unwrap(data, error).map(fromRsvpRow);
    },
    async setRsvp(r: SessionRsvp): Promise<void> {
      const { error } = await sb.from('session_rsvp').upsert(toRsvpRow(r));
      unwrap(null, error);
    },

    // ── Availability ──
    async listAvailability(): Promise<Availability[]> {
      const { data, error } = await sb.from('availability').select('*').order('day');
      return unwrap(data, error).map(fromAvailabilityRow);
    },
    /** Ajoute un créneau (ou met à jour si un id est fourni). */
    async upsertAvailability(a: Partial<Availability>): Promise<void> {
      const { error } = await sb.from('availability').upsert(toAvailabilityRow(a));
      unwrap(null, error);
    },
    async removeAvailability(id: string): Promise<void> {
      const { error } = await sb.from('availability').delete().eq('id', id);
      unwrap(null, error);
    },
  };
}

export type Queries = ReturnType<typeof createQueries>;
