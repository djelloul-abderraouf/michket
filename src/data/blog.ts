/**
 * Blog posts data for Michket.
 */

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  image: string;
  alt: string;
  href: string;
}

export const posts: BlogPost[] = [
  {
    id: "1",
    slug: "idees-cadeaux-anniversaire",
    title: "10 idées cadeaux originales pour un anniversaire",
    excerpt: "Découvrez nos suggestions pour offrir un cadeau unique et personnalisé lors d'un anniversaire.",
    date: "15 août 2026",
    category: "Inspiration",
    image: "/images/products/lampes/anniv.jpeg",
    alt: "Lampe LED personnalisée pour anniversaire",
    href: "/blog/idees-cadeaux-anniversaire",
  },
  {
    id: "2",
    slug: "celebrer-bac-avec-trofee",
    title: "Comment célébrer le BAC avec un trophée personnalisé",
    excerpt: "Le bac est une étape importante. Apprenez comment commémorer cette réussite avec un trophée sur mesure.",
    date: "10 août 2026",
    category: "Célébrations",
    image: "/images/products/trophees/trophebac.jpeg",
    alt: "Trophée personnalisé pour le BAC",
    href: "/blog/celebrer-bac-avec-trofee",
  },
  {
    id: "3",
    slug: "decoration-murale-carte-monde",
    title: "Décoration murale : la carte du monde en bois tendance",
    excerpt: "La carte du monde en bois est un élément de décoration incontournable pour les passionnés de voyage.",
    date: "5 août 2026",
    category: "Décoration",
    image: "/images/products/cartes-du-monde/carte.jpg",
    alt: "Carte du monde en bois pour décoration murale",
    href: "/blog/decoration-murale-carte-monde",
  },
];
