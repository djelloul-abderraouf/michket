import type { Metadata } from "next";
import { siteConfig } from "@/data/site-config";

export const metadata: Metadata = {
  title: "Mentions légales | Michket",
  description: "Mentions légales du site Michket.",
};

export default function LegalPage() {
  return (
    <main className="min-h-screen bg-michket-white">
      <section className="py-16 sm:py-20">
        <div className="michket-container max-w-3xl">
          <h1 className="font-display text-3xl text-michket-black mb-8">
            Mentions légales
          </h1>
          <div className="prose prose-sm text-michket-charcoal">
            <h2>Éditeur du site</h2>
            <p>
              <strong>{siteConfig.name}</strong><br />
              {siteConfig.contact.address}<br />
              Email :{" "}
              <a href={`mailto:${siteConfig.contact.email}`} className="text-michket-gold hover:text-michket-gold-dark">
                {siteConfig.contact.email}
              </a><br />
              Téléphone :{" "}
              <a href={`tel:${siteConfig.contact.phone}`} className="text-michket-gold hover:text-michket-gold-dark">
                {siteConfig.contact.phone}
              </a>
            </p>

            <h2>Hébergeur</h2>
            <p>
              Ce site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis.
            </p>

            <h2>Propriété intellectuelle</h2>
            <p>
              L&apos;ensemble du contenu de ce site (textes, images, vidéos, logos)
              est la propriété exclusive de {siteConfig.name} ou de ses partenaires.
              Toute reproduction, même partielle, est interdite sans autorisation préalable.
            </p>

            <h2>Cookies</h2>
            <p>
              Ce site utilise des cookies pour améliorer l&apos;expérience utilisateur
              et mesurer l&apos;audience. Vous pouvez gérer vos préférences dans les
              paramètres de votre navigateur.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
