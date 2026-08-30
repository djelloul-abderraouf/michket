/**
 * Demo product catalog for Michket.
 * All data is frontend-only — no backend integration yet.
 *
 * OWNER_INPUT_REQUIRED: Real product names, prices, images, and descriptions.
 * Current data uses placeholder products based on available photography.
 */

export interface ProductImage {
  src: string;
  alt: string;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  images: ProductImage[];
  badge?: "BEST SELLER" | "NOUVEAU" | "PROMO" | "PERSONNALISABLE" | "ENVOI GRATUIT";
  category: string;
  occasion?: string[];
  rating?: number;
  reviewCount?: number;
  inStock: boolean;
  personalizable: boolean;
}

export const products: Product[] = [
  {
    id: "lamp-anniv-etoile",
    slug: "lampe-led-3d-anniversaire-etoile",
    title: "Lampe LED 3D — Anniversaire Étoile",
    description: "Lampe personnalisée en acrylic LED 3D avec motif étoile. Idéale pour un cadeau d'anniversaire mémorable.",
    price: 49.90,
    compareAtPrice: 69.90,
    currency: "DA",
    images: [
      { src: "/images/products/lampes/anniv.jpeg", alt: "Lampe LED 3D personnalisée anniversaire" },
    ],
    badge: "BEST SELLER",
    category: "lampes-3d",
    occasion: ["anniversaire"],
    rating: 4.8,
    reviewCount: 245,
    inStock: true,
    personalizable: true,
  },
  {
    id: "lamp-mariage",
    slug: "lampe-led-3d-mariage-couple",
    title: "Lampe LED 3D — Mariage Couple",
    description: "Lampe personnalisée pour célébrer votre amour. Gravure de vos prénoms et date de mariage.",
    price: 54.90,
    compareAtPrice: 74.90,
    currency: "DA",
    images: [
      { src: "/images/products/lampes/mariage.jpeg", alt: "Lampe LED 3D personnalisée mariage" },
    ],
    badge: "BEST SELLER",
    category: "lampes-3d",
    occasion: ["mariage", "couple"],
    rating: 4.9,
    reviewCount: 189,
    inStock: true,
    personalizable: true,
  },
  {
    id: "lamp-naissance",
    slug: "lampe-led-3d-naissance-bebe",
    title: "Lampe LED 3D — Naissance Bébé",
    description: "Lampe de naissance personnalisée avec le prénom et la date de naissance de bébé.",
    price: 44.90,
    compareAtPrice: 59.90,
    currency: "DA",
    images: [
      { src: "/images/products/lampes/nouveau nee.jpeg", alt: "Lampe LED 3D naissance personnalisée" },
    ],
    badge: "NOUVEAU",
    category: "lampes-3d",
    occasion: ["naissance"],
    rating: 4.7,
    reviewCount: 156,
    inStock: true,
    personalizable: true,
  },
  {
    id: "lamp-maman",
    slug: "lampe-led-3d-maman-famille",
    title: "Lampe LED 3D — Maman & Famille",
    description: "Offrez à maman une lampe personnalisée avec les prénoms de la famille.",
    price: 49.90,
    compareAtPrice: 64.90,
    currency: "DA",
    images: [
      { src: "/images/products/lampes/maman.jpeg", alt: "Lampe LED 3D personnalisée maman" },
    ],
    badge: "PERSONNALISABLE",
    category: "lampes-3d",
    occasion: ["maman", "famille"],
    rating: 4.8,
    reviewCount: 203,
    inStock: true,
    personalizable: true,
  },
  {
    id: "lamp-medecin",
    slug: "lampe-led-3d-medecin",
    title: "Lampe LED 3D — Médecin",
    description: "Lampe personnalisée pour hommage à un médecin. Motif stéthoscope et prénom gravé.",
    price: 52.90,
    compareAtPrice: 69.90,
    currency: "DA",
    images: [
      { src: "/images/products/lampes/medecine.jpeg", alt: "Lampe LED 3D médecin personnalisée" },
    ],
    badge: "PERSONNALISABLE",
    category: "lampes-3d",
    occasion: ["metiers", "remerciement"],
    rating: 4.9,
    reviewCount: 87,
    inStock: true,
    personalizable: true,
  },
  {
    id: "lamp-football",
    slug: "lampe-led-3d-football",
    title: "Lampe LED 3D — Football",
    description: "Lampe personnalisée pour les amateurs de football. Motif ballon et numéro personnalisé.",
    price: 47.90,
    compareAtPrice: 62.90,
    currency: "DA",
    images: [
      { src: "/images/products/lampes/football.jpeg", alt: "Lampe LED 3D football personnalisée" },
    ],
    badge: "BEST SELLER",
    category: "lampes-3d",
    occasion: ["sport"],
    rating: 4.7,
    reviewCount: 134,
    inStock: true,
    personalizable: true,
  },
  {
    id: "lamp-soutenance",
    slug: "lampe-led-3d-soutenance",
    title: "Lampe LED 3D — Soutenance",
    description: "Lampe de soutenance personnalisée pour célébrer l'obtention du diplôme.",
    price: 49.90,
    compareAtPrice: 64.90,
    currency: "DA",
    images: [
      { src: "/images/products/lampes/soutenance.jpeg", alt: "Lampe LED 3D soutenance personnalisée" },
    ],
    category: "lampes-3d",
    occasion: ["soutenance", "diplome"],
    rating: 4.6,
    reviewCount: 98,
    inStock: true,
    personalizable: true,
  },
  {
    id: "lamp-5eme",
    slug: "lampe-led-3d-5eme",
    title: "Lampe LED 3D — 5ème Année",
    description: "Lampe commémorative pour les 5 ans de mariage ou événement spécial.",
    price: 52.90,
    compareAtPrice: 69.90,
    currency: "DA",
    images: [
      { src: "/images/products/lampes/5eme.jpeg", alt: "Lampe LED 3D 5ème anniversaire" },
    ],
    category: "lampes-3d",
    occasion: ["anniversaire", "mariage"],
    rating: 4.8,
    reviewCount: 67,
    inStock: true,
    personalizable: true,
  },
  {
    id: "trofee-bac",
    slug: "trofee-personnalise-bac",
    title: "Trophée Personnalisé — BAC",
    description: "Trophée gravé pour célébrer l'obtention du BAC. Personnalisation avec nom, spécialité et mention.",
    price: 39.90,
    compareAtPrice: 54.90,
    currency: "DA",
    images: [
      { src: "/images/products/trophees/trophebac.jpeg", alt: "Trophée personnalisé BAC" },
    ],
    badge: "BEST SELLER",
    category: "trophees",
    occasion: ["bac", "diplome"],
    rating: 4.9,
    reviewCount: 312,
    inStock: true,
    personalizable: true,
  },
  {
    id: "trofee-bem",
    slug: "trofee-personnalise-bem",
    title: "Trophée Personnalisé — BEM",
    description: "Trophée de mérite personnalisé pour récompenser l'excellence.",
    price: 42.90,
    compareAtPrice: 59.90,
    currency: "DA",
    images: [
      { src: "/images/products/trophees/bem.jpeg", alt: "Trophée personnalisé BEM" },
    ],
    category: "trophees",
    occasion: ["diplome", "remerciement"],
    rating: 4.8,
    reviewCount: 156,
    inStock: true,
    personalizable: true,
  },
  {
    id: "trofee-soutenance",
    slug: "trofee-personnalise-soutenance",
    title: "Trophée Personnalisé — Soutenance",
    description: "Trophée de soutenance gravé avec le nom de l'étudiant et le sujet de thèse.",
    price: 44.90,
    compareAtPrice: 62.90,
    currency: "DA",
    images: [
      { src: "/images/products/trophees/soutenance2.jpeg", alt: "Trophée personnalisé soutenance" },
    ],
    badge: "NOUVEAU",
    category: "trophees",
    occasion: ["soutenance"],
    rating: 4.7,
    reviewCount: 89,
    inStock: true,
    personalizable: true,
  },
  {
    id: "trofee-remerciement",
    slug: "trofee-personnalise-remerciement",
    title: "Trophée Personnalisé — Remerciement",
    description: "Trophée de remerciement pour exprimer votre gratitude avec un message personnalisé.",
    price: 37.90,
    compareAtPrice: 49.90,
    currency: "DA",
    images: [
      { src: "/images/products/trophees/remerciement.jpeg", alt: "Trophée remerciement personnalisé" },
    ],
    category: "trophees",
    occasion: ["remerciement"],
    rating: 4.8,
    reviewCount: 178,
    inStock: true,
    personalizable: true,
  },
  {
    id: "carte-monde-multicolore",
    slug: "carte-du-monde-bois-multicolore",
    title: "Carte du Monde en Bois — Multicolore",
    description: "Carte du monde en bois découpé au laser, multicolore. Décoration murale premium pour salon ou bureau.",
    price: 89.90,
    compareAtPrice: 119.90,
    currency: "DA",
    images: [
      { src: "/images/products/cartes-du-monde/carte.jpg", alt: "Carte du monde en bois multicolore" },
    ],
    badge: "BEST SELLER",
    category: "cartes-du-monde",
    occasion: ["anniversaire", "maison"],
    rating: 4.9,
    reviewCount: 423,
    inStock: true,
    personalizable: false,
  },
  {
    id: "neon-prenom",
    slug: "neon-led-prenom-personnalise",
    title: "Néon LED — Prénom Personnalisé",
    description: "Néon LED sur mesure avec votre prénom. Idéal pour chambre, salon ou bureau.",
    price: 59.90,
    compareAtPrice: 79.90,
    currency: "DA",
    images: [
      { src: "/images/products/neon-led/OIP.webp", alt: "Néon LED prénom personnalisé" },
    ],
    badge: "PERSONNALISABLE",
    category: "neon-led",
    occasion: ["anniversaire", "chambre"],
    rating: 4.6,
    reviewCount: 112,
    inStock: true,
    personalizable: true,
  },
  {
    id: "neon-couple",
    slug: "neon-led-couple-personnalise",
    title: "Néon LED — Couple Personnalisé",
    description: "Néon LED personnalisé avec les prénoms de votre couple. Parfait pour la chambre ou l'entrée.",
    price: 64.90,
    compareAtPrice: 84.90,
    currency: "DA",
    images: [
      { src: "/images/products/neon-led/OIP (1).webp", alt: "Néon LED couple personnalisé" },
    ],
    badge: "NOUVEAU",
    category: "neon-led",
    occasion: ["couple", "mariage"],
    rating: 4.7,
    reviewCount: 76,
    inStock: true,
    personalizable: true,
  },
];

export const getProductBySlug = (slug: string): Product | undefined =>
  products.find((p) => p.slug === slug);

export const getProductsByCategory = (category: string): Product[] =>
  products.filter((p) => p.category === category);

export const getBestSellers = (): Product[] =>
  products.filter((p) => p.badge === "BEST SELLER");

export const getNewArrivals = (): Product[] =>
  products.filter((p) => p.badge === "NOUVEAU");

export const getPersonalizableProducts = (): Product[] =>
  products.filter((p) => p.personalizable);
