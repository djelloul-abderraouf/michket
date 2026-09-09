"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getOrderByReference, type ApiOrder } from "@/lib/api";

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDA(cents: number): string {
  return new Intl.NumberFormat("fr-DZ", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100) + " DA";
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: "En attente",
    confirmed: "Confirmée",
    processing: "En préparation",
    shipped: "Expédiée",
    delivered: "Livrée",
    cancelled: "Annulée",
  };
  return map[status] ?? status;
}

function paymentStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: "En attente",
    paid: "Payé",
    failed: "Échoué",
    refunded: "Remboursé",
  };
  return map[status] ?? status;
}

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

export default function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = use(params);

  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getOrderByReference(reference);
        if (!cancelled) setOrder(data);
      } catch (err: unknown) {
        if (cancelled) return;
        let message = "Impossible de charger la commande pour le moment.";
        if (err && typeof err === "object" && "status" in err) {
          const status = (err as { status: number }).status;
          if (status === 404) {
            message = "Commande introuvable.";
          } else if (status === 403) {
            message =
              "Cette commande ne peut pas être consultée depuis cette session.";
          }
        }
        setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reference]);

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <main className="min-h-screen bg-michket-ivory">
        <div className="michket-container py-8">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-michket-charcoal/40 text-sm">
              Chargement de la commande…
            </p>
          </div>
        </div>
      </main>
    );
  }

  /* ---------- Error ---------- */
  if (error || !order) {
    return (
      <main className="min-h-screen bg-michket-ivory">
        <div className="michket-container py-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-michket-white p-8">
              <p className="text-michket-charcoal/60 mb-4">
                {error ?? "Commande introuvable."}
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-michket-gold text-white text-sm font-semibold hover:bg-michket-gold-dark transition-colors"
              >
                Retour à la boutique
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* ---------- Success ---------- */
  return (
    <main className="min-h-screen bg-michket-ivory">
      <div className="michket-container py-8">
        <div className="max-w-3xl mx-auto">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <span className="font-display text-xl text-michket-black">
                Michket
              </span>
            </Link>
          </div>

          {/* Confirmation header */}
          <div className="bg-michket-white p-6 sm:p-8 text-center mb-6">
            <div className="text-4xl mb-4">✓</div>
            <h1 className="font-display text-xl text-michket-black mb-2">
              Merci pour votre commande
            </h1>
            <p className="text-sm text-michket-charcoal/60">
              Référence :{" "}
              <span className="font-mono font-semibold text-michket-black">
                {order.reference}
              </span>
            </p>
          </div>

          {/* Order details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Info */}
            <div className="space-y-6">
              {/* Status */}
              <section className="bg-michket-white p-6">
                <h2 className="text-sm font-semibold text-michket-black mb-3">
                  Statut
                </h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-michket-charcoal/60">Commande</span>
                    <span className="text-michket-black font-medium">
                      {statusLabel(order.status)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-michket-charcoal/60">Paiement</span>
                    <span className="text-michket-black">
                      Paiement à la livraison
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-michket-charcoal/60">
                      Statut paiement
                    </span>
                    <span className="text-michket-black">
                      {paymentStatusLabel(order.paymentStatus)}
                    </span>
                  </div>
                </div>
              </section>

              {/* Customer */}
              <section className="bg-michket-white p-6">
                <h2 className="text-sm font-semibold text-michket-black mb-3">
                  Client
                </h2>
                <div className="space-y-1 text-sm">
                  <p className="text-michket-black">
                    {order.firstName} {order.lastName}
                  </p>
                  <p className="text-michket-charcoal/60">{order.phone}</p>
                  {order.email && (
                    <p className="text-michket-charcoal/60">{order.email}</p>
                  )}
                </div>
              </section>

              {/* Address */}
              <section className="bg-michket-white p-6">
                <h2 className="text-sm font-semibold text-michket-black mb-3">
                  Adresse de livraison
                </h2>
                <div className="space-y-1 text-sm">
                  <p className="text-michket-black">{order.addressLine1}</p>
                  {order.addressLine2 && (
                    <p className="text-michket-charcoal/60">
                      {order.addressLine2}
                    </p>
                  )}
                  <p className="text-michket-charcoal/60">
                    {order.commune}, {order.wilayaName}
                  </p>
                  <p className="text-michket-charcoal/60">À domicile</p>
                </div>
              </section>
            </div>

            {/* Right: Amounts + Items */}
            <div className="space-y-6">
              {/* Amounts */}
              <section className="bg-michket-white p-6">
                <h2 className="text-sm font-semibold text-michket-black mb-3">
                  Montants
                </h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-michket-charcoal/60">
                      Sous-total
                    </span>
                    <span className="text-michket-black">
                      {formatDA(order.subtotalCents)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-michket-charcoal/60">Livraison</span>
                    <span className="text-michket-black">
                      {formatDA(order.deliveryFeeCents)}
                    </span>
                  </div>
                  {order.discountCents > 0 && (
                    <div className="flex justify-between">
                      <span className="text-green-600">Réduction</span>
                      <span className="text-green-600">
                        −{formatDA(order.discountCents)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold pt-2 border-t border-michket-ivory">
                    <span className="text-michket-black">Total</span>
                    <span className="text-michket-black">
                      {formatDA(order.totalCents)}
                    </span>
                  </div>
                </div>
              </section>

              {/* Items */}
              {order.items && order.items.length > 0 && (
                <section className="bg-michket-white p-6">
                  <h2 className="text-sm font-semibold text-michket-black mb-3">
                    Articles
                  </h2>
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-12 h-12 bg-michket-ivory flex items-center justify-center text-[10px] text-michket-charcoal/30 shrink-0">
                          {item.productImageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.productImageUrl}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>IMG</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-michket-black font-medium truncate">
                            {item.productName}
                          </p>
                          {item.colorName && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {item.colorHex && (
                                <span
                                  className="inline-block w-3 h-3 rounded-full border border-michket-gold/20"
                                  style={{ backgroundColor: item.colorHex }}
                                />
                              )}
                              <span className="text-xs text-michket-charcoal/60">
                                {item.colorName}
                              </span>
                            </div>
                          )}
                          {item.personalization && (
                            <p className="text-xs text-michket-charcoal/50 mt-0.5 truncate">
                              {typeof item.personalization.text === "string"
                                ? item.personalization.text
                                : Object.values(item.personalization).join(
                                    " · ",
                                  )}
                            </p>
                          )}
                          <div className="flex justify-between mt-1">
                            <span className="text-xs text-michket-charcoal/60">
                              ×{item.quantity}
                            </span>
                            <span className="text-sm text-michket-black">
                              {formatDA(item.totalPriceCents)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Notes */}
              {order.notes && (
                <section className="bg-michket-white p-6">
                  <h2 className="text-sm font-semibold text-michket-black mb-2">
                    Notes
                  </h2>
                  <p className="text-sm text-michket-charcoal/60">
                    {order.notes}
                  </p>
                </section>
              )}
            </div>
          </div>

          {/* Back to shop */}
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-michket-gold text-white text-sm font-semibold hover:bg-michket-gold-dark transition-colors"
            >
              Retour à la boutique
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
