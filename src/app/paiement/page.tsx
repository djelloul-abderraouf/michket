import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Paiement | Michket",
  description: "Finalisez votre commande en toute sécurité.",
};

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-michket-ivory">
      <div className="michket-container py-8">
        <div className="max-w-5xl mx-auto">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <span className="font-display text-xl text-michket-black">
                Michket
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Form */}
            <div className="lg:col-span-3 bg-michket-white p-6 sm:p-8">
              <h1 className="font-display text-xl text-michket-black mb-6">
                Informations de livraison
              </h1>

              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="checkout-firstname" className="block text-xs font-medium text-michket-charcoal mb-1">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      id="checkout-firstname"
                      required
                      className="w-full px-3 py-2.5 bg-michket-ivory border border-michket-gold/15 text-sm focus:outline-none focus:border-michket-gold/40 transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="checkout-lastname" className="block text-xs font-medium text-michket-charcoal mb-1">
                      Nom *
                    </label>
                    <input
                      type="text"
                      id="checkout-lastname"
                      required
                      className="w-full px-3 py-2.5 bg-michket-ivory border border-michket-gold/15 text-sm focus:outline-none focus:border-michket-gold/40 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="checkout-email" className="block text-xs font-medium text-michket-charcoal mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="checkout-email"
                    required
                    className="w-full px-3 py-2.5 bg-michket-ivory border border-michket-gold/15 text-sm focus:outline-none focus:border-michket-gold/40 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="checkout-address" className="block text-xs font-medium text-michket-charcoal mb-1">
                    Adresse *
                  </label>
                  <input
                    type="text"
                    id="checkout-address"
                    required
                    className="w-full px-3 py-2.5 bg-michket-ivory border border-michket-gold/15 text-sm focus:outline-none focus:border-michket-gold/40 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <label htmlFor="checkout-zip" className="block text-xs font-medium text-michket-charcoal mb-1">
                      Code postal *
                    </label>
                    <input
                      type="text"
                      id="checkout-zip"
                      required
                      className="w-full px-3 py-2.5 bg-michket-ivory border border-michket-gold/15 text-sm focus:outline-none focus:border-michket-gold/40 transition-colors"
                    />
                  </div>
                  <div className="col-span-2">
                    <label htmlFor="checkout-city" className="block text-xs font-medium text-michket-charcoal mb-1">
                      Ville *
                    </label>
                    <input
                      type="text"
                      id="checkout-city"
                      required
                      className="w-full px-3 py-2.5 bg-michket-ivory border border-michket-gold/15 text-sm focus:outline-none focus:border-michket-gold/40 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="checkout-phone" className="block text-xs font-medium text-michket-charcoal mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    id="checkout-phone"
                    className="w-full px-3 py-2.5 bg-michket-ivory border border-michket-gold/15 text-sm focus:outline-none focus:border-michket-gold/40 transition-colors"
                  />
                </div>

                <div className="pt-4 border-t border-michket-ivory">
                  <button
                    type="submit"
                    className="w-full py-3 bg-michket-gold text-white font-semibold text-sm hover:bg-michket-gold-dark transition-colors"
                  >
                    Continuer vers le paiement
                  </button>
                </div>
              </form>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-2">
              <div className="bg-michket-white p-6 sticky top-24">
                <h2 className="text-sm font-semibold text-michket-black mb-4">
                  Récapitulatif
                </h2>

                <div className="text-center py-8 text-michket-charcoal/40 text-sm">
                  Votre panier est vide
                </div>

                <div className="border-t border-michket-ivory pt-4 mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-michket-charcoal/60">Sous-total</span>
                    <span className="text-michket-black">0,00 €</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-michket-charcoal/60">Livraison</span>
                    <span className="text-michket-black">Calculée à l&apos;étape suivante</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold pt-2 border-t border-michket-ivory">
                    <span className="text-michket-black">Total</span>
                    <span className="text-michket-black">0,00 €</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Back to shop */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-michket-charcoal/60 hover:text-michket-gold transition-colors"
            >
              ← Retour à la boutique
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
