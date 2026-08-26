/**
 * Site-wide configuration for Michket.
 * Centralizes all commercial information, contact details, and site metadata.
 *
 * OWNER_INPUT_REQUIRED items are marked with comments.
 */

export const siteConfig = {
  name: "Michket",
  tagline: "Cadeaux personnalisés uniques",
  url: "https://michket.com", // OWNER_INPUT_REQUIRED: real domain
  locale: "fr-FR",
  currency: "EUR",
  currencySymbol: "€",

  announcement: {
    enabled: true,
    text: "Livraison offerte à partir de 100€ d'achat",
    // OWNER_INPUT_REQUIRED: real free-shipping threshold
    link: "/meilleures-ventes",
    linkText: "Voir les offres",
  },

  shipping: {
    freeThreshold: 100, // OWNER_INPUT_REQUIRED: real threshold in EUR
    standardDays: "5-7",
    expressDays: "2-3",
    productionTime: "3-5 jours ouvrés", // for personalized items
    productionTimeTrophies: "5-7 jours ouvrés",
  },

  contact: {
    email: "contact@michket.com", // OWNER_INPUT_REQUIRED
    whatsapp: "", // OWNER_INPUT_REQUIRED
    phone: "", // OWNER_INPUT_REQUIRED
    address: "", // OWNER_INPUT_REQUIRED
  },

  social: {
    instagram: "", // OWNER_INPUT_REQUIRED
    facebook: "", // OWNER_INPUT_REQUIRED
    tiktok: "", // OWNER_INPUT_REQUIRED
    pinterest: "", // OWNER_INPUT_REQUIRED
    youtube: "", // OWNER_INPUT_REQUIRED
  },

  legal: {
    companyName: "", // OWNER_INPUT_REQUIRED: legal entity name
    siret: "", // OWNER_INPUT_REQUIRED
    copyright: "© 2026 Michket. Tous droits réservés.",
  },

  newsletter: {
    headline: "10% de réduction sur votre première commande",
    subtext: "Inscrivez-vous pour recevoir votre code promo et nos meilleures offres.",
    ctaText: "J'en profite",
    trustText: "Pas de spam. Désabonnement en un clic.",
  },

  trust: {
    items: [
      { icon: "truck", text: "Livraison offerte dès 100€" },
      { icon: "shield", text: "Paiement 100% sécurisé" },
      { icon: "star", text: "Fabrication artisanale" },
      { icon: "refresh", text: "Satisfait ou remboursé" },
    ],
  },
} as const;
