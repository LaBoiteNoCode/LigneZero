import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface JerseyModelProps {
  base: string;
  accent: string;
  /** Numéro affiché sur le maillot. */
  number?: string;
  autoRotate?: boolean;
}

/**
 * Maillot procédural (silhouette extrudée) — placeholder tant qu'aucun .glb
 * n'est fourni. Quand le modèle réel est prêt, déposer public/models/jersey.glb
 * et remplacer ce composant par un useGLTF('/models/jersey.glb').
 */
export function JerseyModel({ base, accent, number = '00', autoRotate = true }: JerseyModelProps) {
  const group = useRef<THREE.Group>(null);

  // Silhouette de t-shirt (extrudée) construite une seule fois.
  const geometry = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-0.42, 1.0); // col gauche
    s.lineTo(-0.95, 1.02); // épaule gauche
    s.lineTo(-1.55, 0.58); // manche haut
    s.lineTo(-1.22, 0.3); // manche bas
    s.lineTo(-0.72, 0.52); // aisselle
    s.lineTo(-0.82, -1.2); // bas gauche
    s.lineTo(0.82, -1.2); // bas droit
    s.lineTo(0.72, 0.52); // aisselle
    s.lineTo(1.22, 0.3);
    s.lineTo(1.55, 0.58);
    s.lineTo(0.95, 1.02);
    s.lineTo(0.42, 1.0); // col droit
    s.quadraticCurveTo(0, 0.78, -0.42, 1.0); // courbe de col
    const geo = new THREE.ExtrudeGeometry(s, {
      depth: 0.32,
      bevelEnabled: true,
      bevelThickness: 0.06,
      bevelSize: 0.06,
      bevelSegments: 3,
      curveSegments: 24,
    });
    geo.center();
    return geo;
  }, []);

  useFrame((_, dt) => {
    if (group.current && autoRotate) group.current.rotation.y += dt * 0.35;
  });

  return (
    <group ref={group} rotation={[0, -0.3, 0]}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial color={base} roughness={0.62} metalness={0.12} />
      </mesh>

      {/* bandes d'accent sur les manches */}
      {[-1.15, 1.15].map((x) => (
        <mesh key={x} position={[x, 0.42, 0.18]}>
          <boxGeometry args={[0.5, 0.07, 0.34]} />
          <meshStandardMaterial color={accent} roughness={0.5} metalness={0.15} />
        </mesh>
      ))}

      {/* numéro au dos (face avant ici, lisible) */}
      <Text
        position={[0, -0.05, 0.2]}
        fontSize={0.7}
        color={accent}
        anchorX="center"
        anchorY="middle"
        font={undefined}
        letterSpacing={-0.02}
      >
        {number}
      </Text>

      {/* liseré de col */}
      <mesh position={[0, 0.86, 0.18]}>
        <torusGeometry args={[0.34, 0.05, 8, 24, Math.PI]} />
        <meshStandardMaterial color={accent} roughness={0.5} />
      </mesh>
    </group>
  );
}
