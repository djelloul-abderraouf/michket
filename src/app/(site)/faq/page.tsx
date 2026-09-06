"use client";

import { useState } from "react";
import { siteConfig } from "@/data/site-config";

const faqs = [
  {
    question: "Combien de temps prend la fabrication d'un produit personnalisé ?",
    answer: "La fabrication de nos produits personnalisés prend en général 2 à 5 jours ouvrés. Les commandes urgentes peuvent être traitées en 24 à 48h selon la complexité.",
  },
  {
    question: "Livrez-vous dans toute la France ?",
    answer: `Oui, nous livrons dans toute la France métropolitaine. Livraison offerte dès ${siteConfig.shipping.freeThreshold}€ d'achat. Les livraisons en point relais sont également disponibles.`,
  },
  {
    question: "Comment personnaliser un produit ?",
    answer: "Pour personnaliser un produit, rendez-vous sur la page du produit et sélectionnez les options de personnalisation disponibles (texte, prénom, date, etc.). Vous pouvez également nous contacter directement pour un projet sur mesure.",
  },
  {
    question: "Puis-je retourner un produit personnalisé ?",
    answer: "Les produits personnalisés ne sont pas retournables, sauf en cas de défaut de fabrication. Si vous constatez un problème, contactez-nous sous 48h avec des photos.",
  },
  {
    question: "Quels moyens de paiement acceptez-vous ?",
    answer: "Nous acceptons les cartes bancaires (CB, Visa, Mastercard) et PayPal. Tous les paiements sont 100% sécurisés.",
  },
  {
    question: "Offrez-vous des cartes cadeaux ?",
    answer: "Oui, nous proposons des cartes cadeaux numériques à partir de 25€. Contactez-nous pour plus d'informations.",
  },
  {
    question: "Puis-je commander en gros pour un événement ?",
    answer: "Absolument ! Nous offrons des tarifs dégressifs pour les commandes en gros (mariages, entreprises, associations). Contactez-nous pour un devis personnalisé.",
  },
  {
    question: "Vos produits sont-ils éco-responsables ?",
    answer: "Nos produits sont fabriqués en bois certifié et avec des LED basse consommation. Nous privilégions les matériaux durables et l'artisanat local.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <main className="min-h-screen bg-michket-white">
      {/* Hero */}
      <section className="bg-michket-cream py-16 sm:py-20">
        <div className="michket-container text-center max-w-2xl mx-auto">
          <span className="inline-block text-xs font-medium tracking-widest uppercase text-michket-gold mb-3">
            FAQ
          </span>
          <h1 className="font-display text-3xl sm:text-4xl text-michket-black mb-4">
            Questions fréquentes
          </h1>
          <p className="text-base text-michket-charcoal/60">
            Tout ce que vous devez savoir sur nos produits et services.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="michket-container max-w-3xl">
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="border border-michket-ivory"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                  aria-expanded={openIndex === i}
                >
                  <span className="text-sm font-medium text-michket-black pr-4">
                    {faq.question}
                  </span>
                  <svg
                    className={`w-5 h-5 text-michket-charcoal/40 flex-shrink-0 transition-transform ${
                      openIndex === i ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openIndex === i ? "max-h-48" : "max-h-0"
                  }`}
                  role="region"
                >
                  <p className="px-5 pb-4 text-sm text-michket-charcoal/60 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-12 text-center p-8 bg-michket-cream">
            <h3 className="font-display text-xl text-michket-black mb-2">
              Vous n&apos;avez pas trouvé votre réponse ?
            </h3>
            <p className="text-sm text-michket-charcoal/60 mb-4">
              Notre équipe est disponible pour répondre à toutes vos questions.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-michket-gold text-white text-sm font-semibold hover:bg-michket-gold-dark transition-colors"
            >
              Nous contacter
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
