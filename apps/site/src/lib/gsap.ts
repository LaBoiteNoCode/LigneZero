import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Enregistre les plugins une seule fois pour toute l'app.
gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };
