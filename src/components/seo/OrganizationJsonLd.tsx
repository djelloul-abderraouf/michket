import { siteConfig } from "@/data/site-config";

export function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: "https://michket.com",
    logo: "/images/brand/michket-logo-black.png",
    description:
      "Cadeaux personnalisés artisanaux : lampes LED 3D, trophées gravés, cartes du monde en bois, néon LED.",
    sameAs: [
      siteConfig.social.instagram,
      siteConfig.social.facebook,
      siteConfig.social.tiktok,
    ].filter(Boolean),
    contactPoint: {
      "@type": "ContactPoint",
      email: siteConfig.contact.email,
      contactType: "customer service",
      availableLanguage: ["French"],
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.contact.address,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
