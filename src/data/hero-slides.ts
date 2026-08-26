export interface HeroSlide {
  id: string;
  desktopSrc: string;
  mobileSrc?: string;
  alt: string;
  href: string;
  ariaLabel: string;
  /** Custom object-position for mobile TEL images (default: "center top") */
  mobileObjectPosition?: string;
}

export const heroSlides: HeroSlide[] = [
  {
    id: "carte-du-monde",
    desktopSrc: "/images/hero/hero-carte-du-monde.png",
    mobileSrc: "/images/hero/hero-carte-du-monde-tel.png",
    alt: "Carte du monde en bois — Michket",
    href: "/cartes-du-monde",
    ariaLabel: "Découvrir la collection cartes du monde en bois",
    mobileObjectPosition: "center top",
  },
  {
    id: "trophee-bac",
    desktopSrc: "/images/hero/hero-trophee-bac.png",
    mobileSrc: "/images/hero/hero-trophee-bac-tel.png",
    alt: "Trophée BAC personnalisé — Michket",
    href: "/trophees?occasion=bac",
    ariaLabel: "Voir les trophées BAC personnalisés",
    mobileObjectPosition: "center top",
  },
  {
    id: "naissance",
    desktopSrc: "/images/hero/hero-naissance.png",
    mobileSrc: "/images/hero/hero-naissance-tel.png",
    alt: "Lampe LED naissance personnalisée — Michket",
    href: "/lampes-3d?occasion=naissance",
    ariaLabel: "Découvrir les lampes de naissance personnalisées",
    mobileObjectPosition: "center top",
  },
  {
    id: "mariage",
    desktopSrc: "/images/hero/hero-mariage.png",
    mobileSrc: "/images/hero/hero-mariage-tel.png",
    alt: "Lampe LED mariage personnalisée — Michket",
    href: "/lampes-3d?occasion=mariage",
    ariaLabel: "Découvrir les lampes de mariage personnalisées",
    mobileObjectPosition: "center top",
  },
];
