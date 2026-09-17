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

const cardClass =
  "rounded-2xl border border-black/[0.07] bg-white shadow-[0_10px_35px_rgba(23,23,20,0.035)]";

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
      <main className="min-h-[70vh] bg-michket-ivory">
        <div className="michket-container px-4 py-14 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-5 h-12 w-12 animate-pulse rounded-full border border-michket-gold/20 bg-michket-gold/10" />
            <p className="text-sm text-michket-charcoal/55">
              Chargement de votre commande…
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-[70vh] bg-michket-ivory">
        <div className="michket-container px-4 py-10 sm:py-16">
          <div className="mx-auto max-w-xl">
            <div className={`${cardClass} p-6 text-center sm:p-9`}>
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-red-100 bg-red-50 text-red-600">
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

              <h1 className="font-display text-2xl leading-tight text-michket-black sm:text-3xl">
                Impossible d&apos;afficher la commande
              </h1>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-michket-charcoal/60">
                {error ?? "Commande introuvable."}
              </p>

              <Link
                href="/"
                className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-michket-black px-6 text-sm font-semibold text-white transition hover:opacity-90 sm:w-auto"
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
      <div className="michket-container px-4 py-6 sm:py-10 lg:py-12">
        <div className="mx-auto max-w-6xl">
          <section className="relative overflow-hidden rounded-3xl border border-black/[0.07] bg-white px-5 py-8 shadow-[0_18px_55px_rgba(23,23,20,0.05)] sm:px-8 sm:py-10 lg:px-12 lg:py-12">
            <div
              className="pointer-events-none absolute right-0 top-0 h-48 w-48 translate-x-1/3 -translate-y-1/3 rounded-full bg-michket-gold/10 blur-3xl sm:h-64 sm:w-64"
              aria-hidden="true"
            />

            <div className="relative mx-auto max-w-3xl text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-michket-gold/20 bg-michket-gold/10 text-michket-gold-dark sm:h-16 sm:w-16">
                <svg
                  className="h-7 w-7 sm:h-8 sm:w-8"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>

              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-michket-gold-dark sm:text-[11px]">
                Commande enregistrée
              </p>

              <h1 className="mt-3 font-display text-[28px] leading-[1.12] text-michket-black sm:text-4xl lg:text-[42px]">
                Merci pour votre commande
              </h1>

              <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-michket-charcoal/65 sm:text-[15px] sm:leading-7">
                Votre commande a bien été enregistrée. Notre équipe vous
                contactera pour la confirmer avant son expédition.
              </p>

              <div className="mx-auto mt-6 max-w-lg rounded-2xl border border-michket-gold/15 bg-michket-ivory/80 px-4 py-4 sm:mt-7 sm:px-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-michket-charcoal/45">
                  Référence de commande
                </p>

                <p className="mt-2 break-words font-mono text-base font-bold tracking-[0.03em] text-michket-black sm:text-lg">
                  {order.reference}
                </p>
              </div>

              <p className="mx-auto mt-3 max-w-xl text-[11px] leading-5 text-michket-charcoal/45 sm:text-xs">
                Conservez cette référence pour toute demande concernant votre
                commande.
              </p>
            </div>
          </section>

          <section className="mt-4 grid grid-cols-1 gap-3 sm:mt-5 sm:grid-cols-3 sm:gap-4">
            <SummaryTile
              label="Statut"
              value={statusLabel(order.status)}
            />
            <SummaryTile
              label="Livraison"
              value={deliveryTypeLabel(order.deliveryType)}
            />
            <SummaryTile
              label="Total"
              value={formatDA(order.totalCents)}
              emphasized
            />
          </section>

          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.8fr)] lg:items-start">
            <div className="space-y-5">
              {order.items && order.items.length > 0 ? (
                <section className={`${cardClass} p-4 sm:p-6`}>
                  <SectionTitle title="Votre commande" />

                  <div className="mt-4 divide-y divide-black/[0.06]">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="py-4 first:pt-0 last:pb-0"
                      >
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-black/[0.05] bg-michket-ivory text-[10px] text-michket-charcoal/30 sm:h-[72px] sm:w-[72px]">
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
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                              <div className="min-w-0">
                                <p className="break-words text-sm font-semibold leading-5 text-michket-black">
                                  {item.productName}
                                </p>

                                {item.variantName ? (
                                  <p className="mt-1 text-xs text-michket-charcoal/55">
                                    {item.variantName}
                                  </p>
                                ) : null}

                                {item.colorName ? (
                                  <div className="mt-1.5 flex items-center gap-1.5">
                                    {item.colorHex ? (
                                      <span
                                        className="inline-block h-3 w-3 shrink-0 rounded-full border border-black/10"
                                        style={{
                                          backgroundColor:
                                            item.colorHex,
                                        }}
                                        aria-hidden="true"
                                      />
                                    ) : null}

                                    <span className="text-xs text-michket-charcoal/55">
                                      {item.colorName}
                                    </span>
                                  </div>
                                ) : null}
                              </div>

                              <span className="shrink-0 text-sm font-bold text-michket-black">
                                {formatDA(item.totalPriceCents)}
                              </span>
                            </div>

                            <p className="mt-2 text-xs text-michket-charcoal/50">
                              Quantité : {item.quantity}
                            </p>

                            {item.personalization ? (
                              <div className="mt-2 rounded-lg bg-michket-ivory px-3 py-2">
                                <p className="break-words text-xs leading-5 text-michket-charcoal/60">
                                  {typeof item.personalization.text === "string"
                                    ? item.personalization.text
                                    : Object.values(item.personalization).join(
                                        " · ",
                                      )}
                                </p>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              <section className={`${cardClass} p-4 sm:p-6`}>
                <SectionTitle title="Informations de livraison" />

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <InfoBlock
                    label="Client"
                    lines={[
                      order.fullName,
                      order.phone,
                      ...(order.email ? [order.email] : []),
                    ]}
                  />

                  <InfoBlock
                    label="Destination"
                    lines={[
                      `${order.commune}, ${order.wilayaName}`,
                      deliveryTypeLabel(order.deliveryType),
                      ...(order.deliveryType === "home"
                        ? [
                            order.addressLine1,
                            ...(order.addressLine2
                              ? [order.addressLine2]
                              : []),
                          ]
                        : []),
                    ]}
                  />
                </div>
              </section>

              {order.notes ? (
                <section className={`${cardClass} p-4 sm:p-6`}>
                  <SectionTitle title="Notes" />
                  <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-michket-charcoal/65">
                    {order.notes}
                  </p>
                </section>
              ) : null}
            </div>

            <div className="space-y-5 lg:sticky lg:top-24">
              <section className={`${cardClass} p-4 sm:p-6`}>
                <SectionTitle title="Récapitulatif" />

                <div className="mt-4 space-y-3 text-sm">
                  <PriceRow
                    label="Sous-total"
                    value={formatDA(order.subtotalCents)}
                  />

                  <PriceRow
                    label="Livraison"
                    value={formatDA(order.deliveryFeeCents)}
                  />

                  {order.discountCents > 0 ? (
                    <PriceRow
                      label="Réduction"
                      value={`−${formatDA(order.discountCents)}`}
                      discount
                    />
                  ) : null}

                  <div className="mt-4 flex items-center justify-between gap-4 border-t border-black/[0.07] pt-4">
                    <span className="text-sm font-semibold text-michket-black">
                      Total
                    </span>
                    <span className="text-lg font-bold text-michket-black sm:text-xl">
                      {formatDA(order.totalCents)}
                    </span>
                  </div>
                </div>
              </section>

              <section className={`${cardClass} p-4 sm:p-6`}>
                <SectionTitle title="Paiement" />

                <div className="mt-4 space-y-3">
                  <CompactRow
                    label="Mode"
                    value="Paiement à la livraison"
                  />
                  <CompactRow
                    label="Statut"
                    value={paymentStatusLabel(order.paymentStatus)}
                  />
                </div>
              </section>

              <div className="grid gap-3">
                <Link
                  href="/"
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-michket-black px-6 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Continuer mes achats
                </Link>

                <Link
                  href="/panier"
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-black/[0.09] bg-white px-6 text-sm font-semibold text-michket-black transition hover:bg-black/[0.02]"
                >
                  Retour au panier
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function SummaryTile({
  label,
  value,
  emphasized = false,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
}) {
  return (
    <div className={`${cardClass} px-4 py-4 sm:px-5`}>
      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-michket-charcoal/45">
        {label}
      </p>
      <p
        className={[
          "mt-1.5 break-words text-sm font-semibold",
          emphasized
            ? "text-michket-gold-dark"
            : "text-michket-black",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}

function SectionTitle({
  title,
}: {
  title: string;
}) {
  return (
    <h2 className="font-display text-lg text-michket-black sm:text-xl">
      {title}
    </h2>
  );
}

function InfoBlock({
  label,
  lines,
}: {
  label: string;
  lines: string[];
}) {
  return (
    <div className="rounded-xl bg-michket-ivory p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-michket-charcoal/45">
        {label}
      </p>

      <div className="mt-2 space-y-1">
        {lines.map((line, index) => (
          <p
            key={`${line}-${index}`}
            className={[
              "break-words text-sm leading-5",
              index === 0
                ? "font-semibold text-michket-black"
                : "text-michket-charcoal/60",
            ].join(" ")}
          >
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

function PriceRow({
  label,
  value,
  discount = false,
}: {
  label: string;
  value: string;
  discount?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={
          discount
            ? "text-emerald-700"
            : "text-michket-charcoal/60"
        }
      >
        {label}
      </span>
      <span
        className={
          discount
            ? "font-medium text-emerald-700"
            : "font-medium text-michket-black"
        }
      >
        {value}
      </span>
    </div>
  );
}

function CompactRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="shrink-0 text-michket-charcoal/55">
        {label}
      </span>
      <span className="break-words text-right font-medium text-michket-black">
        {value}
      </span>
    </div>
  );
}
