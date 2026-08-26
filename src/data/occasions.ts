/**
 * Occasion-based shopping data for Michket.
 * Product counts are retained as optional catalogue metadata but are not
 * displayed in the OccasionBar until real production counts are confirmed.
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
    href: "/occasions/anniversaire",
    image: "/images/products/lampes/anniv.jpeg",
    productCount: 24,
  },
  {
    id: "mariage",
    label: "Mariage",
    href: "/occasions/mariage",
    image: "/images/products/lampes/mariage.jpeg",
    productCount: 18,
  },
  {
    id: "naissance",
    label: "Naissance",
    href: "/occasions/naissance",
    image: "/images/products/lampes/nouveau nee.jpeg",
    productCount: 15,
  },
  {
    id: "bac",
    label: "BAC",
    href: "/occasions/bac",
    image: "/images/products/trophees/trophebac.jpeg",
    productCount: 22,
  },
  {
    id: "soutenance",
    label: "Soutenance",
    href: "/occasions/soutenance",
    image: "/images/products/trophees/soutenance2.jpeg",
    productCount: 12,
  },
  {
    id: "maman",
    label: "Fête des mères",
    href: "/occasions/maman",
    image: "/images/products/lampes/maman.jpeg",
    productCount: 20,
  },
  {
    id: "sport",
    label: "Football / Sport",
    href: "/occasions/sport",
    image: "/images/products/lampes/football.jpeg",
    productCount: 14,
  },
  {
    id: "remerciement",
    label: "Remerciement",
    href: "/occasions/remerciement",
    image: "/images/products/trophees/remerciement.jpeg",
    productCount: 16,
  },
  {
    id: "couple",
    label: "Couple",
    href: "/occasions/couple",
    image: "/images/products/neon-led/OIP (1).webp",
    productCount: 10,
  },
  {
    id: "metiers",
    label: "Métiers",
    href: "/occasions/metiers",
    image: "/images/products/lampes/medecine.jpeg",
    productCount: 8,
  },
];