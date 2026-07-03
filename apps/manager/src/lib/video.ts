export type VideoPlatform = 'youtube' | 'twitch' | 'other';

export interface ParsedVideo {
  platform: VideoPlatform;
  /** ID YouTube ou ID de VOD Twitch. Absent pour 'other'. */
  id?: string;
}

/** Détecte la plateforme d'une URL de VOD et en extrait l'identifiant (pour l'embed + le seek). */
export function parseVideoUrl(url: string): ParsedVideo {
  try {
    const u = new URL(url);
    const host = u.host.replace(/^www\./, '');

    if (host === 'youtu.be') {
      return { platform: 'youtube', id: u.pathname.slice(1) };
    }
    if (host.endsWith('youtube.com')) {
      const id = u.searchParams.get('v') ?? u.pathname.match(/\/embed\/([^/?]+)/)?.[1];
      if (id) return { platform: 'youtube', id };
    }
    if (host.endsWith('twitch.tv')) {
      const m = u.pathname.match(/\/videos\/(\d+)/);
      if (m) return { platform: 'twitch', id: m[1] };
    }
  } catch {
    // URL invalide → traité comme 'other' ci-dessous
  }
  return { platform: 'other' };
}

/** mm:ss (ou h:mm:ss au-delà d'une heure) pour affichage. */
export function formatTimestamp(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const mm = h > 0 ? String(m).padStart(2, '0') : String(m);
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}
