import type { Config } from 'tailwindcss';

/**
 * Manager — même palette béton/rouge que le vitrine (theme/tokens.css) mais
 * REGISTRE SOBRE : outil interne, dense, lisible. Pas de HUD cockpit ici.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          900: 'var(--base-900)',
          800: 'var(--base-800)',
          700: 'var(--base-700)',
          600: 'var(--base-600)',
        },
        accent: { DEFAULT: 'var(--accent)', 2: 'var(--accent-2)' },
        concrete: { DEFAULT: 'var(--concrete)', 2: 'var(--concrete-2)' },
        paper: 'var(--paper)',
        ink: 'var(--ink)',
        signal: {
          live: 'var(--signal-live)',
          ok: 'var(--signal-ok)',
          warn: 'var(--signal-warn)',
        },
        line: {
          DEFAULT: 'var(--line)',
          strong: 'var(--line-strong)',
          bright: 'var(--line-bright)',
        },
      },
      fontFamily: {
        display: ['"Chakra Petch"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: { hud: '0.18em' },
      boxShadow: {
        ink: '4px 4px 0 0 var(--base-900)',
        'ink-red': '4px 4px 0 0 var(--accent)',
      },
    },
  },
  plugins: [],
} satisfies Config;
