/**
 * ID unique côté client. `crypto.randomUUID()` exige un contexte sécurisé
 * (HTTPS/localhost strict) et plante sinon (ex. accès via IP réseau en HTTP) —
 * `crypto.getRandomValues` reste disponible partout, on l'utilise à la place.
 */
export function uid(): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}
