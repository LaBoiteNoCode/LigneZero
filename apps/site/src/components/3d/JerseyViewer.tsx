import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import { JerseyModel } from './JerseyModel';
import { PostFX } from './PostFX';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface JerseyViewerProps {
  base: string;
  accent: string;
  number?: string;
}

/**
 * Viewer 3D du maillot : studio sombre, rim light rouge, ombre de contact,
 * orbit à la souris/touch, post-traitement brutalist. Chargé en lazy
 * (import dynamique) + Suspense côté page → pas de coût avant ouverture.
 */
export default function JerseyViewer({ base, accent, number }: JerseyViewerProps) {
  const reduced = useReducedMotion();

  return (
    <Canvas
      shadows
      dpr={[1, 1.8]}
      camera={{ position: [0, 0.2, 5], fov: 38 }}
      gl={{ antialias: true, alpha: true }}
    >
      {/* éclairage studio (100% local, aucune dépendance HDR/CDN) */}
      <ambientLight intensity={0.5} />
      <hemisphereLight args={['#cdd3da', '#1a1715', 0.7]} />
      <spotLight position={[4, 6, 5]} angle={0.5} penumbra={0.8} intensity={3} castShadow color="#fff4ec" />
      {/* fill avant pour révéler la forme même en coloris sombre */}
      <directionalLight position={[0, 1, 6]} intensity={1.1} color="#cfd6e0" />
      {/* rim light rouge (accent DA) */}
      <pointLight position={[-4, 1, -3]} intensity={3.5} color="#f23127" />
      <pointLight position={[3, -2, -2]} intensity={1.2} color="#5566ff" />

      <JerseyModel base={base} accent={accent} number={number} autoRotate={!reduced} />

      <ContactShadows position={[0, -1.55, 0]} opacity={0.5} scale={8} blur={2.6} far={4} />

      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={3.5}
        maxDistance={7}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.8}
        autoRotate={false}
      />

      <PostFX />
    </Canvas>
  );
}
