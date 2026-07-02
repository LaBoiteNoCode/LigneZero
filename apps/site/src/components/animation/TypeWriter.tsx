import { useEffect, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface TypeWriterProps {
  text: string;
  /** Vitesse : caractères par seconde. */
  cps?: number;
  /** Délai avant démarrage (ms). */
  delay?: number;
  /** Curseur clignotant en fin de frappe. */
  cursor?: boolean;
  className?: string;
}

/** Texte qui "se tape" (terminal). Reduced-motion : texte complet direct. */
export function TypeWriter({ text, cps = 38, delay = 0, cursor = true, className = '' }: TypeWriterProps) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(reduced ? text : '');
  const [done, setDone] = useState(reduced);

  useEffect(() => {
    if (reduced) {
      setShown(text);
      setDone(true);
      return;
    }
    setShown('');
    setDone(false);
    let i = 0;
    let raf = 0;
    let timer: ReturnType<typeof setTimeout>;
    const step = 1000 / cps;
    let last = 0;

    const tick = (now: number) => {
      if (!last) last = now;
      if (now - last >= step) {
        i += 1;
        setShown(text.slice(0, i));
        last = now;
      }
      if (i < text.length) raf = requestAnimationFrame(tick);
      else setDone(true);
    };

    timer = setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [text, cps, delay, reduced]);

  return (
    <span className={className}>
      {shown}
      {cursor && (
        <span className={`ml-0.5 inline-block h-[1em] w-[0.5ch] translate-y-[0.1em] bg-accent ${done ? 'animate-blink' : ''}`} />
      )}
    </span>
  );
}
