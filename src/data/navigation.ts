/**
 * Navigation structure for Michket.
 * Centralizes desktop mega-menu content and the mobile accordion hierarchy.
 */

export interface NavItem {
  label: string;
  href: string;
  badge?: string;
}

export interface MegaMenuCategory {
  label: string;
  href: string;
  image: string;
  objectPosition?: string;
}

export interface MegaMenuColumn {
  title: string;
  items: NavItem[];
}

export interface MegaMenu {
  categories: MegaMenuCategory[];
  columns: MegaMenuColumn[];
}

export interface NavItemWithMega extends NavItem {
  mega?: MegaMenu;
}

/* ───────────────────────── Main navigation ───────────────────────── */

export const mainNav: NavItemWithMega[] = [
  {
    label: "Accueil",
    href: "/",
  },

  {
    label: "Meilleures ventes",
    href: "/meilleures-ventes",
    badge: "BEST SELLER",
    mega: {
      categories: [
        {
          label: "Lampes populaires",
          href: "/lampes-3d",
          image: "/images/products/lampes/anniv.jpeg",
          objectPosition: "center",
        },
        {
          label: "Trophées populaires",
          href: "/trophees",
          image: "/images/products/trophees/trophebac.jpeg",
          objectPosition: "center",
        },
        {
          label: "Cartes du monde",
          href: "/cartes-du-monde",
          image: "/images/products/cartes-du-monde/carte.jpg",
          objectPosition: "center",
        },
        {
          label: "Néons populaires",
          href: "/neon-led",
          image: "/images/products/neon-led/OIP.webp",
          objectPosition: "center",
        },
      ],
      columns: [
        {
          title: "Lampes",
          items: [
            { label: "Toutes les lampes", href: "/lampes-3d" },
            {
              label: "Lampes anniversaire",
              href: "/lampes-3d/anniversaire",
            },
            {
              label: "Lampes naissance",
              href: "/lampes-3d/naissance",
            },
            {
              label: "Lampes couple",
              href: "/lampes-3d?occasion=couple",
            },
            {
              label: "Lampes maman",
              href: "/lampes-3d/maman",
            },
          ],
        },
        {
          title: "Trophées",
          items: [
            { label: "Tous les trophées", href: "/trophees" },
            { label: "Trophées BAC", href: "/trophees?occasion=bac" },
            {
              label: "Trophées soutenance",
              href: "/trophees?occasion=soutenance",
            },
            {
              label: "Trophées sportifs",
              href: "/trophees?occasion=sport",
            },
          ],
        },
        {
          title: "Cartes du monde",
          items: [
            { label: "Toutes les cartes", href: "/cartes-du-monde" },
            {
              label: "Cartes LED",
              href: "/cartes-du-monde?style=led",
            },
            {
              label: "Cartes colorées",
              href: "/cartes-du-monde?style=colorees",
            },
          ],
        },
      ],
    },
  },

  {
    label: "Lampes 3D",
    href: "/lampes-3d",
    mega: {
      categories: [
        {
          label: "Anniversaire",
          href: "/lampes-3d/anniversaire",
          image: "/images/products/lampes/anniv.jpeg",
          objectPosition: "center",
        },
        {
          label: "Mariage",
          href: "/lampes-3d/mariage",
          image: "/images/products/lampes/mariage.jpeg",
          objectPosition: "center",
        },
        {
          label: "Nouveau-né",
          href: "/lampes-3d/naissance",
          image: "/images/products/lampes/nouveau%20nee.jpeg",
          objectPosition: "center",
        },
        {
          label: "Maman & Famille",
          href: "/lampes-3d/maman",
          image: "/images/products/lampes/maman.jpeg",
          objectPosition: "center",
        },
        {
          label: "Médecine",
          href: "/lampes-3d/medecine",
          image: "/images/products/lampes/medecine.jpeg",
          objectPosition: "center",
        },
        {
          label: "Football",
          href: "/lampes-3d/football",
          image: "/images/products/lampes/football.jpeg",
          objectPosition: "center",
        },
        {
          label: "Soutenance",
          href: "/lampes-3d/soutenance",
          image: "/images/products/lampes/soutenance.jpeg",
          objectPosition: "center",
        },
        {
          label: "5ème année",
          href: "/lampes-3d/5eme",
          image: "/images/products/lampes/5eme.jpeg",
          objectPosition: "center",
        },
      ],
      columns: [
        {
          title: "Par occasion",
          items: [
            {
              label: "Anniversaire",
              href: "/lampes-3d/anniversaire",
            },
            { label: "Mariage", href: "/lampes-3d/mariage" },
            { label: "Nouveau-né", href: "/lampes-3d/naissance" },
            {
              label: "Maman & Famille",
              href: "/lampes-3d/maman",
            },
            {
              label: "Diplôme & Soutenance",
              href: "/lampes-3d/soutenance",
            },
            {
              label: "Football & Sport",
              href: "/lampes-3d/football",
            },
            { label: "Métiers", href: "/lampes-3d/medecine" },
          ],
        },
        {
          title: "Par type",
          items: [
            { label: "Toutes les lampes", href: "/lampes-3d" },
            { label: "Lampes LED acrylique", href: "/lampes-3d?type=led" },
            { label: "Lampes avec photo", href: "/lampes-3d?type=photo" },
            {
              label: "Lampes avec prénom",
              href: "/lampes-3d?type=prenom",
            },
          ],
        },
      ],
    },
  },

  {
    label: "Cartes du monde",
    href: "/cartes-du-monde",
    mega: {
      categories: [
        {
          label: "Toutes les cartes",
          href: "/cartes-du-monde",
          image: "/images/products/cartes-du-monde/carte.jpg",
          objectPosition: "center",
        },
        {
          label: "Cartes 3D",
          href: "/cartes-du-monde?style=3d",
          image: "/images/products/cartes-du-monde/carte.jpg",
          objectPosition: "center",
        },
        {
          label: "Cartes LED",
          href: "/cartes-du-monde?style=led",
          image: "/images/products/cartes-du-monde/carte.jpg",
          objectPosition: "center",
        },
        {
          label: "Cartes colorées",
          href: "/cartes-du-monde?style=colorees",
          image: "/images/products/cartes-du-monde/carte.jpg",
          objectPosition: "center",
        },
        {
          label: "Bois naturel",
          href: "/cartes-du-monde?style=naturelles",
          image: "/images/products/cartes-du-monde/carte.jpg",
          objectPosition: "center",
        },
        {
          label: "Cartes panneau",
          href: "/cartes-du-monde?style=panneau",
          image: "/images/products/cartes-du-monde/carte.jpg",
          objectPosition: "center",
        },
      ],
      columns: [
        {
          title: "Par style",
          items: [
            { label: "Toutes les cartes", href: "/cartes-du-monde" },
            {
              label: "Cartes 3D",
              href: "/cartes-du-monde?style=3d",
            },
            {
              label: "Cartes LED",
              href: "/cartes-du-monde?style=led",
            },
            {
              label: "Cartes colorées",
              href: "/cartes-du-monde?style=colorees",
            },
            {
              label: "Bois naturel",
              href: "/cartes-du-monde?style=naturelles",
            },
            {
              label: "Cartes panneau",
              href: "/cartes-du-monde?style=panneau",
            },
          ],
        },
        {
          title: "Par taille",
          items: [
            {
              label: "Petite (60×90 cm)",
              href: "/cartes-du-monde?taille=m",
            },
            {
              label: "Moyenne (90×150 cm)",
              href: "/cartes-du-monde?taille=l",
            },
            {
              label: "Grande (120×200 cm)",
              href: "/cartes-du-monde?taille=xl",
            },
            {
              label: "Très grande (160×250 cm)",
              href: "/cartes-du-monde?taille=2xl",
            },
          ],
        },
      ],
    },
  },

  {
    label: "Trophées",
    href: "/trophees",
    mega: {
      categories: [
        {
          label: "Tous les trophées",
          href: "/trophees",
          image: "/images/products/trophees/trophebac.jpeg",
          objectPosition: "center",
        },
        {
          label: "BAC",
          href: "/trophees?occasion=bac",
          image: "/images/products/trophees/trophebac.jpeg",
          objectPosition: "center",
        },
        {
          label: "Soutenance",
          href: "/trophees?occasion=soutenance",
          image: "/images/products/trophees/soutenance2.jpeg",
          objectPosition: "center",
        },
        {
          label: "Remerciement",
          href: "/trophees?occasion=remerciement",
          image: "/images/products/trophees/remerciement.jpeg",
          objectPosition: "center",
        },
        {
          label: "BEM",
          href: "/trophees?occasion=diplome",
          image: "/images/products/trophees/bem.jpeg",
          objectPosition: "center",
        },
        {
          label: "Sport",
          href: "/trophees?occasion=sport",
          image: "/images/products/trophees/trophebac.jpeg",
          objectPosition: "center",
        },
        {
          label: "Enseignant",
          href: "/trophees?occasion=enseignant",
          image: "/images/products/trophees/soutenance2.jpeg",
          objectPosition: "center",
        },
        {
          label: "Événements",
          href: "/trophees?occasion=evenements",
          image: "/images/products/trophees/remerciement.jpeg",
          objectPosition: "center",
        },
      ],
      columns: [
        {
          title: "Par type",
          items: [
            { label: "Tous les trophées", href: "/trophees" },
            { label: "Trophées BAC", href: "/trophees?occasion=bac" },
            {
              label: "Trophées soutenance",
              href: "/trophees?occasion=soutenance",
            },
            {
              label: "Trophées remerciement",
              href: "/trophees?occasion=remerciement",
            },
            {
              label: "Trophées sportifs",
              href: "/trophees?occasion=sport",
            },
            {
              label: "Trophées enseignant",
              href: "/trophees?occasion=enseignant",
            },
          ],
        },
        {
          title: "Par occasion",
          items: [
            { label: "Diplôme", href: "/trophees?occasion=diplome" },
            {
              label: "Soutenance",
              href: "/trophees?occasion=soutenance",
            },
            { label: "BAC", href: "/trophees?occasion=bac" },
            {
              label: "Événements",
              href: "/trophees?occasion=evenements",
            },
            {
              label: "Personnalisés",
              href: "/trophees?occasion=personnalises",
            },
          ],
        },
      ],
    },
  },

  {
    label: "Néon LED",
    href: "/neon-led",
    mega: {
      categories: [
        {
          label: "Tous les néons",
          href: "/neon-led",
          image: "/images/products/neon-led/OIP.webp",
          objectPosition: "center",
        },
        {
          label: "Prénom",
          href: "/neon-led?type=prenom",
          image: "/images/products/neon-led/OIP.webp",
          objectPosition: "center",
        },
        {
          label: "Couple",
          href: "/neon-led?type=couple",
          image: "/images/products/neon-led/OIP%20(1).webp",
          objectPosition: "center",
        },
        {
          label: "Chambre",
          href: "/neon-led?type=chambre",
          image: "/images/products/neon-led/OIP.webp",
          objectPosition: "center",
        },
        {
          label: "Décoration",
          href: "/neon-led?type=decoration",
          image: "/images/products/neon-led/OIP%20(1).webp",
          objectPosition: "center",
        },
        {
          label: "Sur mesure",
          href: "/neon-led?type=mesure",
          image: "/images/products/neon-led/OIP.webp",
          objectPosition: "center",
        },
      ],
      columns: [
        {
          title: "Par type",
          items: [
            { label: "Tous les néons", href: "/neon-led" },
            { label: "Prénom", href: "/neon-led?type=prenom" },
            { label: "Couple", href: "/neon-led?type=couple" },
            { label: "Chambre", href: "/neon-led?type=chambre" },
            {
              label: "Décoration",
              href: "/neon-led?type=decoration",
            },
            {
              label: "Événement",
              href: "/neon-led?type=evenement",
            },
            {
              label: "Sur mesure",
              href: "/neon-led?type=mesure",
            },
          ],
        },
      ],
    },
  },
];

/* Mobile drawer uses the same canonical navigation data. */
export const mobileNav = mainNav.filter((item) => item.href !== "/");

/* ───────────────────────── Footer navigation ─────────────────────── */

export const footerNav = {
  catalogue: [
    { label: "Lampes 3D personnalisées", href: "/lampes-3d" },
    { label: "Trophées personnalisés", href: "/trophees" },
    { label: "Cartes du monde en bois", href: "/cartes-du-monde" },
    { label: "Néon LED", href: "/neon-led" },
    { label: "Nouveautés", href: "/nouveautes" },
    { label: "Meilleures ventes", href: "/meilleures-ventes" },
  ],

  cadeaux: [
    { label: "Pour elle", href: "/cadeaux?destinataire=elle" },
    { label: "Pour lui", href: "/cadeaux?destinataire=lui" },
    { label: "Pour les enfants", href: "/cadeaux?destinataire=enfants" },
    { label: "Pour la maison", href: "/cadeaux?destinataire=maison" },
    { label: "Petits budgets", href: "/cadeaux?prix=petit-budget" },
    { label: "Cadeaux premium", href: "/cadeaux?prix=premium" },
    { label: "Cartes cadeaux", href: "/cartes-cadeaux" },
  ],

  occasions: [
    { label: "Anniversaire", href: "/occasions/anniversaire" },
    { label: "Mariage / Fiançailles", href: "/occasions/mariage" },
    { label: "Naissance / Bébé", href: "/occasions/naissance" },
    { label: "BAC / Diplôme", href: "/occasions/bac" },
    { label: "Soutenance", href: "/occasions/soutenance" },
    { label: "Fête des mères", href: "/occasions/maman" },
    { label: "Football / Sport", href: "/occasions/sport" },
    { label: "Remerciement", href: "/occasions/remerciement" },
  ],

  assistance: [
    { label: "Suivre ma commande", href: "/suivi-commande" },
    { label: "Politique de livraison", href: "/livraison" },
    { label: "Politique de retour", href: "/retours" },
    { label: "Conditions générales", href: "/cgv" },
    { label: "Politique de confidentialité", href: "/confidentialite" },
    { label: "Mentions légales", href: "/mentions-legales" },
  ],

  aPropos: [
    { label: "Notre histoire", href: "/notre-histoire" },
    { label: "Notre savoir-faire", href: "/savoir-faire" },
    { label: "Nos valeurs", href: "/nos-valeurs" },
    { label: "Nous contacter", href: "/contact" },
    { label: "Avis clients", href: "/avis" },
    { label: "FAQ", href: "/faq" },
  ],
};
