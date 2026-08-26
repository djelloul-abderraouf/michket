/**
 * Category discovery data for Michket homepage and navigation.
 */

export interface Category {
  id: string;
  label: string;
  description: string;
  href: string;
  image: string;
}

export const mainCategories: Category[] = [
  {
    id: "lampes-3d",
    label: "Lampes 3D",
    description: "Lampes LED acrylic personnalisées avec éclairage illuminé",
    href: "/lampes-3d",
    image: "/images/products/lampes/anniv.jpeg",
  },
  {
    id: "trophees",
    label: "Trophées",
    description: "Trophées et plaques commémoratives gravées sur mesure",
    href: "/trophees",
    image: "/images/products/trophees/trophebac.jpeg",
  },
  {
    id: "cartes-du-monde",
    label: "Cartes du Monde",
    description: "Cartes décoratives en bois découpées au laser",
    href: "/cartes-du-monde",
    image: "/images/products/cartes-du-monde/carte.jpg",
  },
  {
    id: "neon-led",
    label: "Néon LED",
    description: "Néons LED personnalisés pour décoration intérieure",
    href: "/neon-led",
    image: "/images/products/neon-led/OIP.webp",
  },
];

/** Alias used by homepage/search components */
export const categories = mainCategories;

export const featuredCategories: Category[] = [
  {
    id: "lampes-anniversaire",
    label: "Lampes d'anniversaire",
    description: "Le cadeau d'anniversaire parfait",
    href: "/lampes-3d?occasion=anniversaire",
    image: "/images/products/lampes/anniv.jpeg",
  },
  {
    id: "trofees-bac",
    label: "Trophées BAC",
    description: "Célébrez la réussite du BAC",
    href: "/trophees?occasion=bac",
    image: "/images/products/trophees/trophebac.jpeg",
  },
  {
    id: "cartes-monde-deco",
    label: "Cartes pour salon",
    description: "Transformez votre espace de vie",
    href: "/cartes-du-monde",
    image: "/images/products/cartes-du-monde/carte.jpg",
  },
];
