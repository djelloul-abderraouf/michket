export type DeliveryType = "home" | "office";

export interface DeliveryPrice {
  home: number;
  office: number;
}

/**
 * TARIFS MANUELS OPTIONNELS
 * -------------------------
 * Si tu veux gérer toi-même les tarifs, ajoute ici les prix de chaque wilaya.
 * Ces tarifs ont priorité sur l'API du transporteur.
 *
 * Exemple :
 *
 * export const manualDeliveryPrices: Partial<Record<number, DeliveryPrice>> = {
 *   16: { home: 600, office: 500 }, // Alger
 *   31: { home: 900, office: 650 }, // Oran
 * };
 *
 * IMPORTANT : ne mets ici que les vrais tarifs convenus avec ton transporteur.
 */
export const manualDeliveryPrices: Partial<Record<number, DeliveryPrice>> = {};

/**
 * Les transporteurs algériens utilisent encore, pendant la transition,
 * les anciens codes (1..58) pour les 11 nouvelles wilayas 2026.
 *
 * Mapping des nouvelles wilayas vers leur wilaya d'origine pour le calcul
 * du tarif transporteur.
 */
export const courierWilayaFallback: Partial<Record<number, number>> = {
  59: 3,  // Aflou -> Laghouat
  60: 5,  // Barika -> Batna
  61: 7,  // El Kantara -> Biskra
  62: 12, // Bir El Ater -> Tébessa
  63: 13, // El Aricha -> Tlemcen
  64: 14, // Ksar Chellala -> Tiaret
  65: 17, // Ain Oussara -> Djelfa
  66: 17, // Messaad -> Djelfa
  67: 26, // Ksar El Boukhari -> Médéa
  68: 28, // Bou Saada -> M'Sila
  69: 32, // El Abiodh Sidi Cheikh -> El Bayadh
};

export function getCourierWilayaCode(wilayaCode: number): number {
  return courierWilayaFallback[wilayaCode] ?? wilayaCode;
}
