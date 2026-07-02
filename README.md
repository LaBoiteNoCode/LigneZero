# __BRAND__ — Site vitrine esport

Vitrine + hub communautaire. React + Vite + TS, Tailwind, R3F, GSAP, Lenis.
DA : Hard Surface / Cutline / Néon HUD.

## Démarrer

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # build prod (tsc + vite)
npm run preview
```

## Personnalisation rapide

| Quoi | Où |
|---|---|
| **Nom de marque** | find-replace global `__BRAND__` |
| **Couleurs / accent néon** | `src/theme/tokens.css` (`--accent`, `--accent-2`) + miroir `src/theme/tokens.ts` pour le 3D |
| **Polices** | `src/theme/fonts.css` (import Google) + `tailwind.config.ts` (`fontFamily`) |
| **Durées d'anim** | `tailwind.config.ts` (`transitionDuration`) + `src/theme/tokens.css` |
| **Navigation** | `src/lib/routes.ts` |
| **Réseaux sociaux** | `src/data/socials.ts` |

> Re-skin complet = éditer `tokens.css`. Aucun composant à toucher.

## Ajouter une donnée (phases ≥ 3)

Tout est data-driven : ajouter un joueur / jeu / match / sponsor = une entrée
dans le `src/data/*.ts` correspondant, typée via `src/types/`. L'UI suit.
Couche prête à brancher sur une API / Supabase plus tard.

## Architecture

```
src/
  theme/       tokens (couleurs, fonts, durées) — source de vérité du skin
  types/       interfaces des données
  data/        contenu (joueurs, jeux, matchs, sponsors…)
  hooks/       anim scroll, lenis, reduced-motion, counters
  components/
    ui/        KeycapButton, CutPanel, HudFrame…
    animation/ PageTransition, BootSequence, GlitchText…
    layout/    Header HUD, Footer, Nav
    3d/        R3F (lazy) — Hero, viewer maillot, postpro néon
  sections/    blocs data-driven réutilisables
  pages/       routes
  lib/         gsap, routes, formatters
```

## 3D

Déposer le modèle maillot dans `public/models/jersey.glb` (instructions au
moment du viewer, Phase 4). Tout le 3D est lazy-loadé.

## État des phases

- [x] **Phase 1** — Fondations (setup, tokens, thème, fonts, header/footer, routing)
- [x] **Phase 2** — Système d'animation (PageTransition, Keycap, boot, hooks)
- [x] **Phase 3** — Sections data-driven (Équipe, Staff, Jeux, Sponsors, Calendrier)
- [x] **Phase 4** — 3D (viewer maillot configurable, postpro, lazy + fallback)
- [ ] **Phase 5** — Responsive, a11y, perf, polish (+ hero canvas 3D optionnel)

DA = **béton brutalist + rouge** (`--accent #f23127`). Visuels via `MediaFrame` (duotone rouge + halftone), assets dans `public/img/`.
