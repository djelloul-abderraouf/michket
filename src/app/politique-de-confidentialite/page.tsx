import type { Metadata } from "next";
import { siteConfig } from "@/data/site-config";

export const metadata: Metadata = {
  title: "Politique de confidentialité | Michket",
  description: "Politique de confidentialité du site Michket.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-michket-white">
      <section className="py-16 sm:py-20">
        <div className="michket-container max-w-3xl">
          <h1 className="font-display text-3xl text-michket-black mb-8">
            Politique de confidentialité
          </h1>
          <div className="prose prose-sm text-michket-charcoal">
            <p><strong>Dernière mise à jour :</strong> {new Date().toLocaleDateString("fr-FR")}</p>

            <h2>1. Collecte des données</h2>
            <p>
              Nous collectons les données personnelles que vous nous fournissez
              lors de votre commande : nom, prénom, adresse email, adresse postale,
              numéro de téléphone et données de paiement.
            </p>

            <h2>2. Utilisation des données</h2>
            <p>
              Vos données sont utilisées pour : traiter vos commandes, vous envoyer
              des confirmations et suivis de livraison, répondre à vos demandes
              de service client, et (avec votre consentement) vous envoyer des
              offres promotionnelles.
            </p>

            <h2>3. Protection des données</h2>
            <p>
              Nous mettons en œuvre des mesures techniques et organisationnelles
              pour protéger vos données personnelles contre tout accès non autorisé,
              perte ou alteration.
            </p>

            <h2>4. Vos droits</h2>
            <p>
              Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès,
              de rectification, de suppression et de portabilité de vos données.
              Vous pouvez exercer ces droits en nous contactant à{" "}
              <a href={`mailto:${siteConfig.contact.email}`} className="text-michket-gold hover:text-michket-gold-dark">
                {siteConfig.contact.email}
              </a>.
            </p>

            <h2>5. Contact</h2>
            <p>
              Pour toute question relative à la protection de vos données,
              contactez-nous à{" "}
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
