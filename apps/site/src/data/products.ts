import type { Product } from '@/types';

/**
 * Catalogue boutique (placeholder MVP, pas de paiement).
 * AJOUTER = une entrée ici. Images : public/img/shop/.
 */
export const products: Product[] = [
  { id: 'pr-jersey', name: 'Maillot 2026', category: 'Jersey', price: '69 €', status: 'available' },
  { id: 'pr-jersey-pro', name: 'Maillot Pro (player edition)', category: 'Jersey', price: '89 €', status: 'soon' },
  { id: 'pr-hoodie', name: 'Hoodie Cutline', category: 'Streetwear', price: '74 €', status: 'soon' },
  { id: 'pr-tee', name: 'Tee Signal', category: 'Streetwear', price: '34 €', status: 'soon' },
  { id: 'pr-cap', name: 'Casquette HUD', category: 'Accessoire', price: '29 €', status: 'soon' },
  { id: 'pr-mousepad', name: 'Tapis XL Grid', category: 'Setup', price: '39 €', status: 'soon' },
];

/** Variantes de couleur du maillot pour le configurateur 3D. */
export interface JerseyVariant {
  id: string;
  label: string;
  /** Couleur principale du tissu (hex). */
  base: string;
  /** Couleur des accents/numéro (hex). */
  accent: string;
}

export const jerseyVariants: JerseyVariant[] = [
  { id: 'home', label: 'Domicile', base: '#1a1715', accent: '#f23127' },
  { id: 'away', label: 'Extérieur', base: '#e8e4da', accent: '#1a1715' },
  { id: 'third', label: 'Third', base: '#f23127', accent: '#e8e4da' },
];
