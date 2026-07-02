import { Component, lazy, Suspense } from 'react';
import type { ReactNode } from 'react';
import { MediaFrame } from '@/components/ui/MediaFrame';

const JerseyViewer = lazy(() => import('./JerseyViewer'));

interface Props {
  base: string;
  accent: string;
  number?: string;
}

/** Fallback "boot" pendant le chargement du chunk 3D (jauge segmentée mecha). */
function Loader3D() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3">
      <p className="hud-label text-[10px]">
        [ 3D ] <span className="text-accent">&gt;</span> chargement du module…
      </p>
      <div className="flex gap-1">
        {Array.from({ length: 12 }).map((_, i) => (
          <span
            key={i}
            className="h-3 w-2 bg-accent"
            style={{ animation: `blink 1.1s steps(1) ${i * 0.08}s infinite`, opacity: 0.3 }}
          />
        ))}
      </div>
    </div>
  );
}

/** Garde-fou : si WebGL indisponible ou crash, on retombe sur un visuel statique. */
class GLBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/**
 * Hôte du viewer 3D : lazy-load + Suspense (boot) + ErrorBoundary
 * (fallback MediaFrame statique). À utiliser dans un conteneur dimensionné.
 */
export function Canvas3D({ base, accent, number }: Props) {
  return (
    <GLBoundary
      fallback={<MediaFrame ratio="1/1" label="MAILLOT" corner="3D OFF" className="h-full" />}
    >
      <Suspense fallback={<Loader3D />}>
        <JerseyViewer base={base} accent={accent} number={number} />
      </Suspense>
    </GLBoundary>
  );
}
