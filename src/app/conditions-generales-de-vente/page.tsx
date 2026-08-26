import type { Metadata } from "next";
import { siteConfig } from "@/data/site-config";

export const metadata: Metadata = {
  title: "Conditions générales de vente | Michket",
  description: "Conditions générales de vente du site Michket.",
};

export default function CGVPage() {
  return (
    <main className="min-h-screen bg-michket-white">
      <section className="py-16 sm:py-20">
        <div className="michket-container max-w-3xl">
          <h1 className="font-display text-3xl text-michket-black mb-8">
            Conditions générales de vente
          </h1>
          <div className="prose prose-sm text-michket-charcoal">
            <p><strong>Dernière mise à jour :</strong> {new Date().toLocaleDateString("fr-FR")}</p>

            <h2>Article 1 - Objet</h2>
            <p>
              Les présentes conditions générales de vente régissent les
              relations contractuelles entre {siteConfig.name} et tout
              acheteur effectuant un achat sur le site {siteConfig.url}.
            </p>

            <h2>Article 2 - Prix</h2>
            <p>
              Les prix sont indiqués en euros (€) toutes taxes comprises.
              {siteConfig.name} se réserve le droit de modifier ses prix à
              tout moment,being étant entendu que le prix applicable est
              celui en vigueur au moment de la validation de la commande.
            </p>

            <h2>Article 3 - Commandes</h2>
            <p>
              La commande est validée lorsque le paiement est confirmé.
              {siteConfig.name} se réserve le droit d&apos;annuler ou de refuser
              toute commande d&apos;un client avec lequel il existerait un litige
              relatif au paiement d&apos;une commande antérieure.
            </p>

            <h2>Article 4 - Paiement</h2>
            <p>
              Le paiement est exigible à la commande. Les moyens de paiement
              acceptés sont : carte bancaire (CB, Visa, Mastercard) et PayPal.
            </p>

            <h2>Article 5 - Livraison</h2>
            <p>
              Livraison offerte dès {siteConfig.shipping.freeThreshold}€ d'achat. Les délais de livraison sont
              donnés à titre indicatif. En cas de retard de livraison,
              aucune annulation de commande ne pourra être envisagée avant
              un délai de 30 jours à compter de la date de notification du retard.
            </p>

            <h2>Article 6 - Droit de rétractation</h2>
            <p>
              Conformément à la législation en vigueur, vous disposez d&apos;un
              délai de 14 jours pour exercer votre droit de rétractation.
              Toutefois, les produits personnalisés ne sont pas soumis à
              ce droit de rétractation.
            </p>

            <h2>Article 7 - Garanties</h2>
            <p>
              Nos produits bénéficient de la garantie légale de conformité
              et de la garantie contre les vices cachés. En cas de produit
              défectueux, contactez-nous sous 48h avec des photos.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
