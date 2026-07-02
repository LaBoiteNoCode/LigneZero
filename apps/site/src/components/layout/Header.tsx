import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Nav } from './Nav';

/** Header HUD fixe, façon cockpit. Se densifie au scroll. */
export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={[
        'fixed inset-x-0 top-0 z-50 border-b transition-colors duration-ui',
        scrolled ? 'border-line bg-base-900/85 backdrop-blur-md' : 'border-transparent bg-transparent',
      ].join(' ')}
    >
      {/* liseré HUD haut */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo / brand placeholder */}
        <Link to="/" className="group flex items-center gap-2" aria-label="__BRAND__ — accueil">
          <span aria-hidden className="font-mono text-accent">[</span>
          <span className="hud-title text-lg font-bold tracking-wide2 glow-text">__BRAND__</span>
          <span aria-hidden className="font-mono text-accent">]</span>
        </Link>

        {/* Nav desktop */}
        <div className="hidden md:block">
          <Nav orientation="row" />
        </div>

        {/* Statut système + burger mobile */}
        <div className="flex items-center gap-4">
          <span className="hidden font-mono text-[10px] uppercase tracking-hud text-[color:var(--text-dim)] lg:inline">
            <span className="mr-1 inline-block h-1.5 w-1.5 animate-live rounded-full bg-accent align-middle" />
            SYSTEM&nbsp;ONLINE
          </span>

          {/* Accès compte (point d'entrée dédié, hors menu numéroté) */}
          <Link
            to="/compte"
            aria-label="Accès compte"
            className="flex items-center gap-1.5 border border-line px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-hud text-[color:var(--text-dim)] transition-colors duration-ui hover:border-accent hover:text-[color:var(--text)]"
          >
            <span aria-hidden className="text-accent">⬡</span>
            <span className="hidden sm:inline">Compte</span>
          </Link>

          <button
            type="button"
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center border border-line text-accent md:hidden"
          >
            <span className="font-mono text-lg leading-none">{open ? '×' : '≡'}</span>
          </button>
        </div>
      </div>

      {/* Menu mobile déroulant */}
      {open && (
        <div className="border-t border-line bg-base-900/95 px-4 py-4 md:hidden">
          <Nav orientation="col" onNavigate={() => setOpen(false)} />
        </div>
      )}
    </header>
  );
}
