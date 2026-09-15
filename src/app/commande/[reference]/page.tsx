"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  getOrderByReference,
  type ApiOrder,
} from "@/lib/api";

function formatDA(cents: number): string {
  return (
    new Intl.NumberFormat("fr-DZ", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100) + " DA"
  );
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: "En attente de confirmation",
    confirmed: "Confirmée",
    processing: "En préparation",
    shipped: "Expédiée",
    delivered: "Livrée",
    cancelled: "Annulée",
    refunded: "Remboursée",
  };

  return map[status] ?? status;
}

function paymentStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: "À payer à la livraison",
    paid: "Payé",
    failed: "Échoué",
    refunded: "Remboursé",
  };

  return map[status] ?? status;
}

function deliveryTypeLabel(type: string): string {
  return type === "office"
    ? "Bureau Yalidine"
    : "Livraison à domicile";
}

export default function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = use(params);

  const [order, setOrder] =
    useState<ApiOrder | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data =
          await getOrderByReference(reference);

        if (!cancelled) {
          setOrder(data);
        }
      } catch (err: unknown) {
        if (cancelled) return;

        let message =
          "Impossible de charger la commande pour le moment.";

        if (
          err &&
          typeof err === "object" &&
          "status" in err
        ) {
          const status =
            (err as { status: number }).status;

          if (status === 404) {
            message = "Commande introuvable.";
          } else if (
            status === 401 ||
            status === 403
          ) {
            message =
              "Cette commande ne peut pas être consultée depuis cette session.";
          }
        }

        setError(message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reference]);

  if (loading) {
    return (
      <main className="min-h-screen bg-michket-ivory">
        <div className="michket-container py-16">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-full bg-michket-gold/20" />
            <p className="text-sm text-michket-charcoal/50">
              Chargement de votre commande…
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-michket-ivory">
        <div className="michket-container py-16">
          <div className="mx-auto max-w-xl">
            <div className="rounded-[20px] border border-michket-gold/10 bg-michket-white p-8 text-center shadow-sm">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M9 9l6 6M15 9l-6 6" />
                </svg>
              </div>

              <h1 className="font-display text-2xl text-michket-black">
                Impossible d&apos;afficher la commande
              </h1>

              <p className="mt-3 text-sm leading-6 text-michket-charcoal/60">
                {error ?? "Commande introuvable."}
              </p>

              <Link
                href="/"
                className="mt-6 inline-flex min-h-12 items-center justify-center rounded-[10px] bg-michket-gold px-6 text-sm font-semibold text-white transition-colors hover:bg-michket-gold-dark"
              >
                Retour à la boutique
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-michket-ivory">
      <div className="michket-container py-8 sm:py-12">
        <div className="mx-auto max-w-4xl">
          

          <section className="relative overflow-hidden rounded-[24px] border border-michket-gold/15 bg-michket-white px-6 py-10 text-center shadow-[0_20px_60px_rgba(37,23,19,0.06)] sm:px-10 sm:py-12">
            <div
              className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-michket-gold/10 blur-3xl"
              aria-hidden="true"
            />

            <div
              className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-michket-gold/10 blur-3xl"
              aria-hidden="true"
            />

            <div className="relative">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>

              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-michket-gold-dark">
                Commande confirmée
              </p>

              <h1 className="font-display text-3xl text-michket-black sm:text-4xl">
                Merci pour votre commande
              </h1>

              <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-michket-charcoal/60 sm:text-[15px]">
                Votre commande a bien été enregistrée. Notre équipe vous
                contactera pour la confirmer avant son expédition.
              </p>

              <div className="mx-auto mt-7 max-w-md rounded-[16px] border border-michket-gold/20 bg-michket-ivory px-5 py-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-michket-charcoal/45">
                  Référence de votre commande
                </p>

                <p className="mt-2 break-all font-mono text-lg font-bold tracking-[0.04em] text-michket-black sm:text-xl">
                  {order.reference}
                </p>
              </div>

              <p className="mt-4 text-xs text-michket-charcoal/45">
                Conservez cette référence pour toute demande concernant votre
                commande.
              </p>
            </div>
          </section>

          <section className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[16px] border border-michket-gold/10 bg-michket-white p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-michket-charcoal/45">
                Statut
              </p>
              <p className="mt-2 text-sm font-semibold text-michket-black">
                {statusLabel(order.status)}
              </p>
            </div>

            <div className="rounded-[16px] border border-michket-gold/10 bg-michket-white p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-michket-charcoal/45">
                Livraison
              </p>
              <p className="mt-2 text-sm font-semibold text-michket-black">
                {deliveryTypeLabel(order.deliveryType)}
              </p>
            </div>

            <div className="rounded-[16px] border border-michket-gold/10 bg-michket-white p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-michket-charcoal/45">
                Total
              </p>
              <p className="mt-2 text-sm font-semibold text-michket-black">
                {formatDA(order.totalCents)}
              </p>
            </div>
          </section>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <section className="rounded-[18px] border border-michket-gold/10 bg-michket-white p-6">
                <h2 className="font-display text-lg text-michket-black">
                  Informations client
                </h2>

                <div className="mt-4 space-y-2 text-sm">
                  <p className="font-medium text-michket-black">
                    {order.firstName} {order.lastName}
                  </p>

                  <p className="text-michket-charcoal/60">
                    {order.phone}
                  </p>

                  {order.email && (
                    <p className="break-all text-michket-charcoal/60">
                      {order.email}
                    </p>
                  )}
                </div>
              </section>

              <section className="rounded-[18px] border border-michket-gold/10 bg-michket-white p-6">
                <h2 className="font-display text-lg text-michket-black">
                  Livraison
                </h2>

                <div className="mt-4 space-y-2 text-sm">
                  <p className="font-medium text-michket-black">
                    {order.commune}, {order.wilayaName}
                  </p>

                  <p className="text-michket-charcoal/60">
                    {deliveryTypeLabel(order.deliveryType)}
                  </p>

                  {order.deliveryType === "home" && (
                    <>
                      <p className="text-michket-charcoal/60">
                        {order.addressLine1}
                      </p>

                      {order.addressLine2 && (
                        <p className="text-michket-charcoal/60">
                          {order.addressLine2}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </section>

              <section className="rounded-[18px] border border-michket-gold/10 bg-michket-white p-6">
                <h2 className="font-display text-lg text-michket-black">
                  Paiement
                </h2>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-michket-charcoal/60">
                      Mode
                    </span>
                    <span className="font-medium text-michket-black">
                      Paiement à la livraison
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-michket-charcoal/60">
                      Statut
                    </span>
                    <span className="font-medium text-michket-black">
                      {paymentStatusLabel(order.paymentStatus)}
                    </span>
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-6">
              {order.items && order.items.length > 0 && (
                <section className="rounded-[18px] border border-michket-gold/10 bg-michket-white p-6">
                  <h2 className="font-display text-lg text-michket-black">
                    Votre commande
                  </h2>

                  <div className="mt-4 space-y-4">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-3 border-b border-michket-ivory pb-4 last:border-b-0 last:pb-0"
                      >
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-michket-ivory text-[10px] text-michket-charcoal/30">
                          {item.productImageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.productImageUrl}
                              alt={item.productName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span>IMG</span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-michket-black">
                                {item.productName}
                              </p>

                              {item.variantName && (
                                <p className="mt-0.5 text-xs text-michket-charcoal/55">
                                  {item.variantName}
                                </p>
                              )}

                              {item.colorName && (
                                <div className="mt-1 flex items-center gap-1.5">
                                  {item.colorHex && (
                                    <span
                                      className="inline-block h-3 w-3 rounded-full border border-michket-gold/20"
                                      style={{
                                        backgroundColor: item.colorHex,
                                      }}
                                    />
                                  )}

                                  <span className="text-xs text-michket-charcoal/55">
                                    {item.colorName}
                                  </span>
                                </div>
                              )}
                            </div>

                            <span className="shrink-0 text-sm font-semibold text-michket-black">
                              {formatDA(item.totalPriceCents)}
                            </span>
                          </div>

                          <p className="mt-1 text-xs text-michket-charcoal/50">
                            Quantité : {item.quantity}
                          </p>

                          {item.personalization && (
                            <p className="mt-1 truncate text-xs text-michket-charcoal/50">
                              {typeof item.personalization.text === "string"
                                ? item.personalization.text
                                : Object.values(item.personalization).join(
                                    " · ",
                                  )}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section className="rounded-[18px] border border-michket-gold/10 bg-michket-white p-6">
                <h2 className="font-display text-lg text-michket-black">
                  Récapitulatif
                </h2>

                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-michket-charcoal/60">
                      Sous-total
                    </span>
                    <span className="text-michket-black">
                      {formatDA(order.subtotalCents)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-michket-charcoal/60">
                      Livraison
                    </span>
                    <span className="text-michket-black">
                      {formatDA(order.deliveryFeeCents)}
                    </span>
                  </div>

                  {order.discountCents > 0 && (
                    <div className="flex justify-between gap-4">
                      <span className="text-emerald-700">
                        Réduction
                      </span>
                      <span className="text-emerald-700">
                        −{formatDA(order.discountCents)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between gap-4 border-t border-michket-ivory pt-4 text-base font-bold">
                    <span className="text-michket-black">
                      Total
                    </span>
                    <span className="text-michket-black">
                      {formatDA(order.totalCents)}
                    </span>
                  </div>
                </div>
              </section>

              {order.notes && (
                <section className="rounded-[18px] border border-michket-gold/10 bg-michket-white p-6">
                  <h2 className="font-display text-lg text-michket-black">
                    Notes
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-michket-charcoal/60">
                    {order.notes}
                  </p>
                </section>
              )}
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-[10px] bg-michket-gold px-7 text-sm font-semibold text-white transition-colors hover:bg-michket-gold-dark sm:w-auto"
            >
              Continuer mes achats
            </Link>

            <Link
              href="/panier"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-[10px] border border-michket-gold/20 bg-michket-white px-7 text-sm font-semibold text-michket-black transition-colors hover:border-michket-gold/40 sm:w-auto"
            >
              Retour au panier
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
