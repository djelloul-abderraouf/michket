/**
 * Chaque vignette utilise directement `href`.
 *
 * Pour une catégorie :
 *   href: "/lampes-3d/anniversaire"
 *
 * Pour un produit précis :
 *   href: "/produits/slug-du-produit"
 */

export interface Occasion {
  id: string;
  label: string;
  href: string;
  image: string;
  productCount?: number;
}

export const occasions: Occasion[] = [
  {
    id: "anniversaire",
    label: "Anniversaire",
    href: "/lampes-3d/anniversaire",
    image: "/images/products/lampes/anniv.jpeg",
  },
  {
    id: "mariage",
    label: "Mariage",
    href: "/lampes-3d/mariage",
    image: "/images/products/lampes/mariage.jpeg",
  },
  {
    id: "naissance",
    label: "Naissance",
    href: "/lampes-3d/naissance",
    image: "/images/products/lampes/nouveau nee.jpeg",
  },
  {
    id: "bac",
    label: "BAC",
    href: "/trophees",
    image: "/images/products/trophees/trophebac.jpeg",
  },
  {
    id: "soutenance",
    label: "Soutenance",
    href: "/lampes-3d/soutenance",
    image: "/images/products/trophees/soutenance2.jpeg",
  },
  {
    id: "maman",
    label: "Fête des mères",
    href: "/lampes-3d/maman",
    image: "/images/products/lampes/maman.jpeg",
  },
  {
    id: "sport",
    label: "Football / Sport",
    href: "/lampes-3d/football",
    image: "/images/products/lampes/football.jpeg",
  },
  {
    id: "remerciement",
    label: "Remerciement",
    href: "/trophees",
    image: "/images/products/trophees/remerciement.jpeg",
  },
  {
    id: "couple",
    label: "Couple",
    href: "/neon-led",
    image: "/images/products/neon-led/OIP (1).webp",
  },
  {
    id: "metiers",
    label: "Métiers",
    href: "/lampes-3d/medecine",
    image: "/images/products/lampes/medecine.jpeg",
  },
];
