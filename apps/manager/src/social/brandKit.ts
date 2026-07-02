import type { FormatId } from './formats';

/**
 * Brand kit + brouillons persistés en localStorage (pas de table DB dédiée :
 * ce sont des préférences d'outil, propres au poste de l'utilisateur).
 */

const KIT_KEY = 'lz.social.brandkit';
const DRAFTS_KEY = 'lz.social.drafts';

export interface BrandKit {
  /** Hashtags ajoutés à toutes les légendes (sans le #). */
  hashtags: string[];
  /** Mention ajoutée en fin de légende (ex. @lignezero). */
  mention: string;
  /** Accent par défaut (hex) — proposé quand une entité n'a pas de couleur. */
  accent: string;
}

export const DEFAULT_KIT: BrandKit = { hashtags: [], mention: '', accent: '#f23127' };

export function loadKit(): BrandKit {
  try {
    const raw = localStorage.getItem(KIT_KEY);
    if (!raw) return DEFAULT_KIT;
    return { ...DEFAULT_KIT, ...(JSON.parse(raw) as Partial<BrandKit>) };
  } catch {
    return DEFAULT_KIT;
  }
}

export function saveKit(kit: BrandKit): void {
  try {
    localStorage.setItem(KIT_KEY, JSON.stringify(kit));
  } catch {
    /* quota / mode privé : on ignore */
  }
}

export type Platform = 'generic' | 'x' | 'instagram';

/**
 * Post-traite une légende selon la plateforme + le brand kit.
 * - X : compacte, garde peu de hashtags.
 * - Instagram : garde tout + bloc de hashtags additionnels.
 */
export function applyPlatform(caption: string, platform: Platform, kit: BrandKit): string {
  const extra = kit.hashtags.map((h) => `#${h.replace(/[^a-zA-Z0-9]/g, '')}`).filter((h) => h.length > 1);
  let out = caption;

  if (platform === 'x') {
    // X : on limite les hashtags de la légende aux 2 premiers, pas d'ajout massif.
    const parts = out.split('\n');
    out = parts
      .map((line) => {
        const tags = line.match(/#[^\s#]+/g);
        if (tags && tags.length > 2 && line.trim().startsWith('#')) return tags.slice(0, 2).join(' ');
        return line;
      })
      .join('\n');
  } else if (platform === 'instagram' && extra.length) {
    out += `\n\n${extra.join(' ')}`;
  }

  if (kit.mention) out += `\n${kit.mention}`;
  return out.replace(/\n{3,}/g, '\n\n').trim();
}

// ── Brouillons ────────────────────────────────────────────────

export interface Draft {
  id: string;
  label: string;
  templateId: string;
  format: FormatId;
  content: Record<string, unknown>;
  savedAt: number;
}

export function loadDrafts(): Draft[] {
  try {
    const raw = localStorage.getItem(DRAFTS_KEY);
    return raw ? (JSON.parse(raw) as Draft[]) : [];
  } catch {
    return [];
  }
}

export function saveDrafts(drafts: Draft[]): void {
  try {
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts.slice(0, 40)));
  } catch {
    /* ignore */
  }
}
