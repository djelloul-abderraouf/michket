"use client";

import { useState } from "react";
import { siteConfig } from "@/data/site-config";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="min-h-screen bg-michket-white">
      {/* Hero */}
      <section className="bg-michket-cream py-16 sm:py-20">
        <div className="michket-container text-center max-w-2xl mx-auto">
          <span className="inline-block text-xs font-medium tracking-widest uppercase text-michket-gold mb-3">
            Contact
          </span>
          <h1 className="font-display text-3xl sm:text-4xl text-michket-black mb-4">
            Parlons de votre projet
          </h1>
          <p className="text-base text-michket-charcoal/60">
            Une question, un devis, une commande spéciale ? Écrivez-nous, nous
            répondons sous 24h.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="michket-container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto">
            {/* Contact info */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-michket-black mb-2">
                  Email
                </h3>
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="text-sm text-michket-gold hover:text-michket-gold-dark transition-colors"
                >
                  {siteConfig.contact.email}
                </a>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-michket-black mb-2">
                  Téléphone
                </h3>
                <a
                  href={`tel:${siteConfig.contact.phone}`}
                  className="text-sm text-michket-gold hover:text-michket-gold-dark transition-colors"
                >
                  {siteConfig.contact.phone}
                </a>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-michket-black mb-2">
                  Adresse
                </h3>
                <p className="text-sm text-michket-charcoal/60">
                  {siteConfig.contact.address}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-michket-black mb-2">
                  Horaires
                </h3>
                <p className="text-sm text-michket-charcoal/60">
                  Lun-Ven : 9h-18h
                </p>
              </div>
            </div>

            {/* Contact form */}
            <div className="lg:col-span-2">
              {submitted ? (
                <div className="p-8 bg-michket-cream text-center">
                  <svg className="w-12 h-12 text-michket-gold mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="font-display text-xl text-michket-black mb-2">
                    Message envoyé !
                  </h3>
                  <p className="text-sm text-michket-charcoal/60">
                    Merci pour votre message. Nous vous répondrons sous 24h.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSubmitted(true);
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-michket-black mb-1.5">
                        Nom complet *
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        className="w-full px-4 py-3 bg-michket-ivory border border-michket-gold/15 text-sm text-michket-black placeholder:text-michket-charcoal/40 focus:outline-none focus:border-michket-gold/40 transition-colors"
                        placeholder="Votre nom"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-michket-black mb-1.5">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        className="w-full px-4 py-3 bg-michket-ivory border border-michket-gold/15 text-sm text-michket-black placeholder:text-michket-charcoal/40 focus:outline-none focus:border-michket-gold/40 transition-colors"
                        placeholder="votre@email.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-michket-black mb-1.5">
                      Sujet
                    </label>
                    <select
                      id="subject"
                      className="w-full px-4 py-3 bg-michket-ivory border border-michket-gold/15 text-sm text-michket-black focus:outline-none focus:border-michket-gold/40 transition-colors"
                    >
                      <option value="">Choisir un sujet</option>
                      <option value="devis">Demande de devis</option>
                      <option value="commande">Suivi de commande</option>
                      <option value="personnalisation">Personnalisation</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-michket-black mb-1.5">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      rows={6}
                      required
                      className="w-full px-4 py-3 bg-michket-ivory border border-michket-gold/15 text-sm text-michket-black placeholder:text-michket-charcoal/40 focus:outline-none focus:border-michket-gold/40 transition-colors resize-none"
                      placeholder="Décrivez votre projet ou votre question..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-michket-gold text-white text-sm font-semibold hover:bg-michket-gold-dark transition-colors"
                  >
                    Envoyer le message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
