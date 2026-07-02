import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

/**
 * Post-traitement accordé à la DA brutalist : bloom RETENU (juste un halo
 * léger sur le rouge), vignette marquée (studio sombre), grain film pour
 * raccorder à la texture du reste du site. Pas de néon criard.
 */
export function PostFX() {
  return (
    <EffectComposer>
      <Bloom intensity={0.35} luminanceThreshold={0.82} luminanceSmoothing={0.2} mipmapBlur />
      <Vignette eskil={false} offset={0.25} darkness={0.85} />
      <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.35} />
    </EffectComposer>
  );
}
