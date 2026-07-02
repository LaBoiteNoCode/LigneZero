import { NavLink } from 'react-router-dom';
import { routes } from '@/lib/routes';

interface NavProps {
  orientation?: 'row' | 'col';
  onNavigate?: () => void;
}

/** Liens de navigation, partagés desktop (row) et mobile (col). */
export function Nav({ orientation = 'row', onNavigate }: NavProps) {
  return (
    <nav
      aria-label="Navigation principale"
      className={orientation === 'row' ? 'flex items-center gap-1' : 'flex flex-col gap-2'}
    >
      {routes.map((r) => (
        <NavLink
          key={r.path}
          to={r.path}
          onClick={onNavigate}
          className={({ isActive }) =>
            [
              'group relative px-3 py-2 font-display uppercase tracking-hud text-sm transition-colors duration-ui ease-mech',
              isActive ? 'text-[color:var(--text)]' : 'text-[color:var(--text-dim)] hover:text-[color:var(--text)]',
            ].join(' ')
          }
        >
          {({ isActive }) => (
            <>
              <span className="mr-1.5 font-mono text-[10px] text-accent">{r.code}</span>
              {r.label}
              {/* arête active qui s'allume (accent) */}
              <span
                aria-hidden
                className={[
                  'absolute bottom-0 left-2 right-2 h-px bg-accent shadow-glow transition-transform duration-ui ease-mech origin-left',
                  isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
                ].join(' ')}
              />
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
