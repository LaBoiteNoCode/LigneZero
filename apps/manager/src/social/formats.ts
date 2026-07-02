/** Formats d'export réseaux (dimensions natives en px). */
export type FormatId = 'x' | 'square' | 'story';

export interface SocialFormat {
  id: FormatId;
  label: string;
  w: number;
  h: number;
  note: string;
}

export const FORMATS: SocialFormat[] = [
  { id: 'x', label: 'X / Twitter', w: 1600, h: 900, note: '16:9' },
  { id: 'square', label: 'Instagram post', w: 1080, h: 1080, note: '1:1' },
  { id: 'story', label: 'Story / Reel', w: 1080, h: 1920, note: '9:16' },
];
