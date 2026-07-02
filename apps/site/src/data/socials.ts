/** Réseaux de la structure. Édite ici pour changer les liens du header/footer. */
export interface Social {
  id: string;
  label: string;
  handle: string;
  url: string;
}

export const socials: Social[] = [
  { id: 'twitch', label: 'Twitch', handle: '/__BRAND__', url: 'https://twitch.tv/' },
  { id: 'x', label: 'X', handle: '@__BRAND__', url: 'https://x.com/' },
  { id: 'instagram', label: 'Instagram', handle: '@__BRAND__', url: 'https://instagram.com/' },
  { id: 'youtube', label: 'YouTube', handle: '/__BRAND__', url: 'https://youtube.com/' },
  { id: 'discord', label: 'Discord', handle: 'discord.gg', url: 'https://discord.gg/' },
  { id: 'tiktok', label: 'TikTok', handle: '@__BRAND__', url: 'https://tiktok.com/' },
];
