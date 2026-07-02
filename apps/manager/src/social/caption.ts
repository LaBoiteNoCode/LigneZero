import type { SocialContent } from './templates';

/** Slug hashtag depuis un libellé (retire accents/espaces/ponctuation). */
function tag(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * Génère une légende prête à coller (emoji + hashtags). Le rendu diffère selon
 * le template. __BRAND__ reste tel quel (remplacé au find-replace global).
 */
export function buildCaption(c: SocialContent): string {
  const hashtags = ['#__BRAND__', c.gameTag ? `#${tag(c.gameTag)}` : '', '#esport']
    .filter(Boolean)
    .join(' ');

  if (c.template === 'matchday') {
    return [
      `🔴 MATCH DU JOUR — ${c.gameTag}`,
      ``,
      `__BRAND__ 🆚 ${c.opponent}`,
      `🏆 ${c.competition}`,
      `🗓️ ${c.dateLabel} · ${c.timeLabel}`,
      c.streamLabel ? `📺 ${c.streamLabel}` : ``,
      ``,
      hashtags,
    ]
      .filter((l) => l !== undefined)
      .join('\n')
      .replace(/\n{3,}/g, '\n\n');
  }

  if (c.template === 'victoire') {
    return [
      `✅ VICTOIRE ${c.scoreUs}–${c.scoreThem} !`,
      ``,
      `__BRAND__ s'impose face à ${c.opponent}.`,
      `🏆 ${c.competition}`,
      ``,
      `${hashtags} #Victory`,
    ].join('\n');
  }

  // défaite
  return [
    `Défaite ${c.scoreUs}–${c.scoreThem} contre ${c.opponent}.`,
    ``,
    `On encaisse, on analyse, on revient plus fort. 🔴`,
    `🏆 ${c.competition}`,
    ``,
    hashtags,
  ].join('\n');
}
