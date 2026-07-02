import { useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface GlitchTextProps {
  text: string;
  className?: string;
  /** Glitch en continu plutôt qu'au survol seulement. */
  always?: boolean;
  as?: 'span' | 'h1' | 'h2' | 'h3';
}

/**
 * Texte avec datamosh léger (RGB split) au survol — chic, jamais stroboscopique.
 * Reduced-motion : texte statique sans effet.
 */
export function GlitchText({ text, className = '', always = false, as = 'span' }: GlitchTextProps) {
  const reduced = useReducedMotion();
  const [hover, setHover] = useState(false);
  const active = !reduced && (always || hover);
  const Tag = as;

  return (
    <Tag
      className={`glitch relative inline-block ${active ? 'is-glitch' : ''} ${className}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      data-text={text}
    >
      {text}
    </Tag>
  );
}
