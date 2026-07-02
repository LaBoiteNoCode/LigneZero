import { useState } from 'react';
import { setSoundEnabled, isSoundEnabled, playClick } from '@/lib/sound';

/** Active/désactive le "clac" mécanique global. Off par défaut. */
export function SoundToggle({ className = '' }: { className?: string }) {
  const [on, setOn] = useState(isSoundEnabled());

  const toggle = () => {
    const next = !on;
    setSoundEnabled(next);
    setOn(next);
    if (next) playClick('down'); // aperçu sonore à l'activation
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? 'Couper le son' : 'Activer le son'}
      className={`font-mono text-[10px] uppercase tracking-hud transition-colors ${
        on ? 'text-accent' : 'text-[color:var(--text-dim)] hover:text-[color:var(--text)]'
      } ${className}`}
    >
      [ SND:{on ? 'ON' : 'OFF'} ]
    </button>
  );
}
