import { useReducedMotion } from '@/hooks/useReducedMotion';

interface MarqueeTickerProps {
  items: string[];
  /** Durée d'un cycle complet (s). Plus grand = plus lent. */
  duration?: number;
  reverse?: boolean;
  variant?: 'primary' | 'secondary' | 'dim';
  className?: string;
}

/**
 * Bande défilante type chyron HUD (data en continu). Boucle CSS sans JS.
 * Reduced-motion : statique, tronquée. Sépare les items par des chevrons.
 */
export function MarqueeTicker({
  items,
  duration = 28,
  reverse = false,
  variant = 'dim',
  className = '',
}: MarqueeTickerProps) {
  const reduced = useReducedMotion();
  const color =
    variant === 'primary' ? 'text-accent' : variant === 'secondary' ? 'text-accent-2' : 'text-[color:var(--text-dim)]';

  const Row = ({ ariaHidden = false }: { ariaHidden?: boolean }) => (
    <span aria-hidden={ariaHidden} className="flex shrink-0 items-center">
      {items.map((it, i) => (
        <span key={i} className="flex items-center">
          <span className="px-5 font-mono text-[11px] uppercase tracking-hud">{it}</span>
          <span className="text-accent/60" aria-hidden>
            ◇
          </span>
        </span>
      ))}
    </span>
  );

  return (
    <div className={`relative flex w-full overflow-hidden border-y border-line bg-base-900/60 py-2 ${color} ${className}`}>
      {reduced ? (
        <div className="truncate px-5">
          <Row />
        </div>
      ) : (
        <div
          className="flex w-max"
          style={{
            animation: `marquee ${duration}s linear infinite`,
            animationDirection: reverse ? 'reverse' : 'normal',
          }}
        >
          <Row />
          <Row ariaHidden />
        </div>
      )}
    </div>
  );
}
