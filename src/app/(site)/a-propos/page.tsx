import type { Metadata } from "next";
import { siteConfig } from "@/data/site-config";

export const metadata: Metadata = {
  title: "À propos | Michket",
  description:
    "Découvrez l'histoire de Michket, artisan lyonnais spécialisé dans les créations personnalisées en bois et LED.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-michket-white">
      {/* Hero */}
      <section className="bg-michket-cream py-16 sm:py-20">
        <div className="michket-container text-center max-w-2xl mx-auto">
          <span className="inline-block text-xs font-medium tracking-widest uppercase text-michket-gold mb-3">
            Notre histoire
          </span>
          <h1 className="font-display text-3xl sm:text-4xl text-michket-black mb-4">
            L&apos;artisan derrière Michket
          </h1>
          <p className="text-base text-michket-charcoal/60 leading-relaxed">
            {siteConfig.name} est une marque artisanale spécialisée dans la
            création de produits personnalisés en bois et LED.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-12 sm:py-16">
        <div className="michket-container max-w-3xl">
          <div className="prose prose-lg text-michket-charcoal">
            <h2 className="font-display text-2xl text-michket-black">
              Notre Mission
            </h2>
            <p>
              Chez {siteConfig.name}, nous croyons que chaque moment spécial mérite
              un cadeau unique et mémorable. C&apos;est pourquoi nous créons des produits
              artisanaux qui racontent votre histoire.
            </p>
            <p>
              Chaque lampe LED, chaque trophée gravé, chaque carte du monde en bois
              est fabriqué avec soin dans notre atelier lyonnais. Nous utilisons des
              matériaux de qualité et des techniques artisanales pour garantir
              des créations durables et originales.
            </p>

            <h2 className="font-display text-2xl text-michket-black">
              Nos Valeurs
            </h2>
            <ul>
              <li>
                <strong>Artisanat français</strong> — Chaque produit est conçu et
                fabriqué à la main dans notre atelier.
              </li>
              <li>
                <strong>Personnalisation</strong> — Nous créons des pièces uniques
                adaptées à vos souhaits et à vos moments importants.
              </li>
              <li>
                <strong>Qualité</strong> — Nous sélectionnons rigoureusement nos
                matériaux pour vous offrir le meilleur.
              </li>
              <li>
                <strong>Durabilité</strong> — Nos créations sont conçues pour durer
                et traverser le temps.
              </li>
            </ul>

            <h2 className="font-display text-2xl text-michket-black">
              Contactez-nous
            </h2>
            <p>
              Une question, un projet personnalisé ? N&apos;hésitez pas à nous
              contacter via notre{" "}
              <a href="/contact" className="text-michket-gold hover:text-michket-gold-dark">
                page de contact
              </a>{" "}
              ou par email à{" "}
              <a href={`mailto:${siteConfig.contact.email}`} className="text-michket-gold hover:text-michket-gold-dark">
                {siteConfig.contact.email}
              </a>.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
