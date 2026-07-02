import { useEffect, useState } from 'react';

/** Variables couleur tweakables (toutes définies dans theme/tokens.css). */
const GROUPS: { title: string; vars: { v: string; label: string }[] }[] = [
  {
    title: 'Accents',
    vars: [
      { v: '--accent', label: 'Accent' },
      { v: '--accent-2', label: 'Accent 2' },
    ],
  },
  {
    title: 'Fonds',
    vars: [
      { v: '--base-900', label: 'Fond 900' },
      { v: '--base-800', label: 'Fond 800' },
      { v: '--base-700', label: 'Fond 700' },
      { v: '--base-600', label: 'Fond 600' },
    ],
  },
  {
    title: 'Texte',
    vars: [
      { v: '--text', label: 'Texte' },
      { v: '--text-dim', label: 'Texte dim' },
      { v: '--text-mute', label: 'Texte mute' },
    ],
  },
  {
    title: 'Surfaces claires',
    vars: [
      { v: '--concrete', label: 'Béton' },
      { v: '--paper', label: 'Papier' },
      { v: '--ink', label: 'Encre' },
    ],
  },
  {
    title: 'Statuts',
    vars: [
      { v: '--signal-live', label: 'Live' },
      { v: '--signal-ok', label: 'OK' },
      { v: '--signal-warn', label: 'Warn' },
    ],
  },
];

const KEY = 'lz-theme-overrides';
const ALL = GROUPS.flatMap((g) => g.vars.map((x) => x.v));

function readVar(v: string): string {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  return raw.startsWith('#') ? (raw.length === 4 ? `#${raw[1]}${raw[1]}${raw[2]}${raw[2]}${raw[3]}${raw[3]}` : raw) : '#000000';
}

/**
 * Tweaker de thème : overlay global qui modifie les variables couleur du site
 * en direct (roue chromatique native au clic), persisté en localStorage.
 */
export function ThemeTweaker() {
  const [open, setOpen] = useState(false);
  const [vals, setVals] = useState<Record<string, string>>({});

  // charge les overrides sauvegardés + lit les valeurs courantes
  useEffect(() => {
    const saved: Record<string, string> = JSON.parse(localStorage.getItem(KEY) || '{}');
    const init: Record<string, string> = {};
    for (const v of ALL) {
      if (saved[v]) document.documentElement.style.setProperty(v, saved[v]);
      init[v] = saved[v] ?? readVar(v);
    }
    setVals(init);
  }, []);

  const setColor = (v: string, val: string) => {
    document.documentElement.style.setProperty(v, val);
    const next = { ...vals, [v]: val };
    setVals(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };

  const reset = () => {
    for (const v of ALL) document.documentElement.style.removeProperty(v);
    localStorage.removeItem(KEY);
    const init: Record<string, string> = {};
    for (const v of ALL) init[v] = readVar(v);
    setVals(init);
  };

  const copy = () => {
    const css = ALL.map((v) => `  ${v}: ${vals[v]};`).join('\n');
    navigator.clipboard?.writeText(`:root {\n${css}\n}`);
  };

  return (
    <div className="theme-tweaker fixed bottom-4 left-4 z-[130]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 w-11 items-center justify-center border-2 border-accent bg-base-900 text-lg shadow-ink"
        aria-label="Tweaker de couleurs"
        title="Tweaker de couleurs"
      >
        🎨
      </button>

      {open && (
        <div className="mt-2 max-h-[70vh] w-64 overflow-y-auto border-2 border-line-strong bg-base-900/95 p-3 shadow-ink backdrop-blur-md">
          <div className="mb-3 flex items-center justify-between">
            <p className="hud-label text-[10px]">[ THEME ]</p>
            <div className="flex gap-2">
              <button type="button" onClick={copy} className="font-mono text-[9px] uppercase tracking-hud text-[color:var(--text-dim)] hover:text-accent" title="Copier le CSS">CSS</button>
              <button type="button" onClick={reset} className="font-mono text-[9px] uppercase tracking-hud text-[color:var(--text-dim)] hover:text-accent">RESET</button>
            </div>
          </div>

          {GROUPS.map((g) => (
            <div key={g.title} className="mb-3">
              <p className="mb-1.5 font-mono text-[8px] uppercase tracking-hud text-[color:var(--text-mute)]">{g.title}</p>
              <div className="space-y-1.5">
                {g.vars.map(({ v, label }) => (
                  <label key={v} className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-hud text-[color:var(--text-dim)]">{label}</span>
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-[9px] text-[color:var(--text-mute)]">{vals[v]}</span>
                      <input
                        type="color"
                        value={vals[v] ?? '#000000'}
                        onChange={(e) => setColor(v, e.target.value)}
                        className="h-6 w-8 cursor-pointer border border-line-strong bg-transparent p-0"
                      />
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
