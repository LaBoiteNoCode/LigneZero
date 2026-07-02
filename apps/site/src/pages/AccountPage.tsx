import { useEffect, useState } from 'react';
import { KeycapButton } from '@/components/ui/KeycapButton';
import { Bracket } from '@/components/ui/Bracket';
import { GlitchText } from '@/components/animation/GlitchText';

type Mode = 'login' | 'signup';

/** Features débloquées plus tard par le compte (teasing). */
const PERKS = [
  'Badge d’accès personnel',
  'Suivi des matchs favoris',
  'Notifications de lives & résultats',
  'Contenus & drops réservés à la commu',
];

/**
 * Terminal d'accès au compte. L'auth n'est pas encore branchée : le formulaire
 * affiche un statut "bientôt disponible". Structure prête à recevoir un backend
 * (Supabase/API) plus tard sans refonte visuelle.
 */
export default function AccountPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    document.title = '__BRAND__ // Compte';
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Module d’authentification bientôt disponible — reviens vite, matelot.');
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <div className="hazard mb-8 h-3 w-full opacity-60" aria-hidden />
      <p className="hud-label mb-4 flex items-center gap-3 text-xs">
        <Bracket>ACCÈS SÉCURISÉ</Bracket>
        <span className="h-px w-12 bg-accent" />
      </p>
      <h1 className="hud-title text-5xl font-bold leading-none glow-text sm:text-7xl">
        <GlitchText text="Compte" />
      </h1>
      <p className="mt-4 max-w-xl font-mono text-sm leading-relaxed text-[color:var(--text-dim)]">
        &gt; Identifie-toi pour accéder à ton espace. Le module compte est en cours de déploiement.
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {/* ── Terminal d'accès ─────────────────────────────────── */}
        <div className="cut-panel panel-concrete border-2 border-line-strong p-6 shadow-ink">
          {/* Toggle mode */}
          <div className="mb-6 grid grid-cols-2 gap-0 border-2 border-line-strong">
            {(['login', 'signup'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setStatus(null); }}
                className={[
                  'py-2 font-mono text-[11px] font-bold uppercase tracking-hud transition-colors duration-ui',
                  mode === m ? 'bg-accent text-[color:var(--paper)]' : 'text-[color:var(--text-dim)] hover:text-[color:var(--text)]',
                ].join(' ')}
              >
                {m === 'login' ? 'Connexion' : 'Créer un compte'}
              </button>
            ))}
          </div>

          <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            {mode === 'signup' && (
              <Field id="pseudo" label="Pseudo" type="text" placeholder="ton_pseudo" autoComplete="username" />
            )}
            <Field id="email" label="Identifiant / e-mail" type="email" placeholder="agent@lignezero.gg" autoComplete="email" />
            <Field id="password" label="Mot de passe" type="password" placeholder="••••••••" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />

            <KeycapButton type="submit" className="mt-2 w-full" sound>
              {mode === 'login' ? 'Se connecter' : 'S’inscrire'} &gt;
            </KeycapButton>

            {status && (
              <p className="mt-1 border-l-2 border-accent bg-base-800/60 px-3 py-2 font-mono text-[11px] leading-relaxed text-[color:var(--text-dim)]">
                <span className="text-accent">&gt;</span> {status}
              </p>
            )}
          </form>
        </div>

        {/* ── Ce que le compte débloquera ──────────────────────── */}
        <div className="cut-panel-alt border-2 border-line-strong bg-base-800/40 p-6">
          <p className="hud-label mb-4 text-xs"><Bracket tone="dim">BIENTÔT</Bracket></p>
          <p className="hud-title mb-5 text-xl font-bold leading-tight">Avec un compte, tu débloques</p>
          <ul className="space-y-3">
            {PERKS.map((p) => (
              <li key={p} className="flex items-start gap-3 font-mono text-[12px] leading-snug text-[color:var(--text-dim)]">
                <span className="mt-0.5 text-accent">▸</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 border-t border-line pt-4 font-mono text-[10px] uppercase tracking-hud text-[color:var(--text-mute)]">
            Statut système : <span className="text-signal-warn">déploiement en cours</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Champ de formulaire HUD (label mono + input béton). */
function Field({
  id, label, type, placeholder, autoComplete,
}: { id: string; label: string; type: string; placeholder?: string; autoComplete?: string }) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5">
      <span className="font-mono text-[10px] uppercase tracking-hud text-[color:var(--text-dim)]">{label}</span>
      <input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="border-2 border-line-strong bg-base-900/70 px-3 py-2.5 font-mono text-sm text-[color:var(--text)] placeholder:text-[color:var(--text-mute)] transition-colors focus:border-accent focus:outline-none"
      />
    </label>
  );
}
