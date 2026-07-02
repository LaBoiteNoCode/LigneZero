/** Source unique de la navigation. Ajoute/retire une route ici. */
export interface RouteDef {
  path: string;
  label: string;
  /** Index HUD affiché en monospace (ex. 01, 02…). */
  code: string;
}

export const routes: RouteDef[] = [
  { path: '/equipe', label: 'Équipe', code: '01' },
  { path: '/staff', label: 'Staff', code: '02' },
  { path: '/sponsors', label: 'Sponsors', code: '03' },
  { path: '/calendrier', label: 'Calendrier', code: '04' },
  { path: '/communaute', label: 'Communauté', code: '05' },
];
