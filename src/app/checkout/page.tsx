"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import {
  createOrder,
  getWilayas,
  getCommunes,
  getDeliveryRate,
  type ApiWilaya,
  type ApiCommune,
  type ApiDeliveryRate,
} from "@/lib/api";

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDA(cents: number): string {
  return new Intl.NumberFormat("fr-DZ", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100) + " DA";
}

/** Sum of unitPriceCents × quantity across all cart items */
function computeSubtotalCents(
  items: { price: number; quantity: number }[],
): number {
  return items.reduce((sum, item) => {
    const unitCents = Math.round(item.price * 100);
    return sum + unitCents * item.quantity;
  }, 0);
}

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

export default function CheckoutPage() {
  const cart = useCart();
  const router = useRouter();

  /* ---------- form state ---------- */
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [wilayaCode, setWilayaCode] = useState<number | null>(null);
  const [wilayaName, setWilayaName] = useState("");
  const [communeId, setCommuneId] = useState<number | null>(null);
  const [commune, setCommune] = useState("");
  const [deliveryType, setDeliveryType] = useState<"home" | "office">("home");
  const [addressLine1, setAddressLine1] = useState("");

  /* ---------- wilayas ---------- */
  const [wilayas, setWilayas] = useState<ApiWilaya[]>([]);
  const [wilayasLoading, setWilayasLoading] = useState(true);
  const [wilayasError, setWilayasError] = useState<string | null>(null);

  /* ---------- communes ---------- */
  const [communes, setCommunes] = useState<ApiCommune[]>([]);
  const [communesLoading, setCommunesLoading] = useState(false);
  const [communesError, setCommunesError] = useState<string | null>(null);

  /* ---------- delivery ---------- */
  const [deliveryRate, setDeliveryRate] = useState<ApiDeliveryRate | null>(
    null,
  );
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);

  /* ---------- idempotency ---------- */
  const idempotencyKeyRef = useRef<string | null>(null);
  const idempotencyFingerprintRef = useRef<string | null>(null);

  /* ---------- submit ---------- */
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  /* ================================================================ */
  /* Load wilayas on mount                                            */
  /* ================================================================ */

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getWilayas();
        if (!cancelled) setWilayas(data);
      } catch {
        if (!cancelled) setWilayasError("Impossible de charger les wilayas.");
      } finally {
        if (!cancelled) setWilayasLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ================================================================ */
  /* Load communes when wilaya changes                                */
  /* ================================================================ */

  useEffect(() => {
    let cancelled = false;

    setCommunes([]);
    setCommuneId(null);
    setCommune("");
    setCommunesError(null);
    setDeliveryRate(null);
    setDeliveryError(null);
    setDeliveryType("home");

    if (wilayaCode === null) {
      setCommunesLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setCommunesLoading(true);

    (async () => {
      try {
        const data = await getCommunes(wilayaCode);
        if (!cancelled) {
          setCommunes(data);
        }
      } catch {
        if (!cancelled) {
          setCommunesError("Impossible de charger les communes.");
        }
      } finally {
        if (!cancelled) {
          setCommunesLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [wilayaCode]);

  /* ================================================================ */
  /* Fetch exact Yalidine rate for wilaya + commune + delivery type   */
  /* ================================================================ */

  const fetchDeliveryRate = useCallback(
    async (
      code: number,
      selectedCommuneId: number,
      selectedDeliveryType: "home" | "office",
    ) => {
      setDeliveryLoading(true);
      setDeliveryError(null);
      setDeliveryRate(null);
  
      try {
        const data = await getDeliveryRate(
          code,
          selectedCommuneId,
          selectedDeliveryType,
        );
        setDeliveryRate(data);
      } catch {
        setDeliveryError(
          "Impossible de calculer le tarif Yalidine pour cette livraison.",
        );
      } finally {
        setDeliveryLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (wilayaCode === null || communeId === null) {
      setDeliveryRate(null);
      setDeliveryError(null);
        return;
    }

    const selected = communes.find((item) => item.id === communeId);

    if (!selected?.available) {
      setDeliveryRate(null);
      setDeliveryError("Livraison indisponible pour cette commune.");
        return;
    }

    if (deliveryType === "office" && !selected.hasStopDesk) {
      setDeliveryRate(null);
      setDeliveryError("La livraison en bureau n'est pas disponible pour cette commune.");
        return;
    }

    fetchDeliveryRate(wilayaCode, communeId, deliveryType);
  }, [
    wilayaCode,
    communeId,
    deliveryType,
    communes,
    fetchDeliveryRate,
  ]);

  /* ================================================================ */
  /* Submit order                                                     */
  /* ================================================================ */

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setOrderError(null);
    setSubmitting(true);

    try {
      // Build payload
      const payload = {
        items: cart.items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId ?? null,
          quantity: item.quantity,
          personalization: item.personalization,
        })),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        addressLine1: addressLine1.trim(),
        wilayaCode: wilayaCode!,
        communeId: communeId!,
        commune: commune.trim(),
        deliveryType,
      };

      // Deterministic fingerprint for idempotency
      const fingerprint = JSON.stringify(payload);

      // Generate new key only if first submit or payload changed
      if (
        idempotencyKeyRef.current === null ||
        fingerprint !== idempotencyFingerprintRef.current
      ) {
        idempotencyKeyRef.current = crypto.randomUUID();
        idempotencyFingerprintRef.current = fingerprint;
      }

      const order = await createOrder(payload, idempotencyKeyRef.current);

      // Order created — best-effort clear cart (never re-create order)
      try {
        await cart.clearCart();
      } catch {
        // Cart clear failed but order exists — proceed to confirmation
      }

      // Redirect to confirmation
      router.replace(`/commande/${order.reference}`);
    } catch (err: unknown) {
      // Parse backend error for specific messages
      let message = "Une erreur est survenue lors de la création de la commande.";

      if (err && typeof err === "object" && "status" in err) {
        const status = (err as { status: number }).status;
        const body = (err as { body?: unknown }).body as
          | { message?: string; error?: string }
          | undefined;

        if (status === 409) {
          message =
            "Une commande est déjà en cours de traitement pour cette tentative. Veuillez réessayer.";
          // Keep same key — do NOT regenerate
        } else if (status === 400) {
          const detail = body?.message || body?.error || "";
          if (detail.includes("stock") || detail.includes("Stock")) {
            message = "Un ou plusieurs articles ne sont plus disponibles en stock.";
          } else if (
            detail.includes("variant") ||
            detail.includes("Variant")
          ) {
            message =
              "Une variante sélectionnée n'est plus disponible. Veuillez modifier votre panier.";
          } else if (
            detail.includes("delivery") ||
            detail.includes("livraison") ||
            detail.includes("wilaya")
          ) {
            message = "La livraison n'est pas disponible pour l'adresse indiquée.";
          } else if (detail) {
            message = detail;
          }
        } else if (status === 404) {
          message = "Un article du panier n'existe plus. Veuillez vérifier votre panier.";
        } else if (status === 503) {
          message = "Le service de livraison est temporairement indisponible. Veuillez réessayer.";
        } else if (body?.message) {
          message = body.message;
        }
      } else if (err instanceof Error) {
        message = err.message;
      }

      setOrderError(message);
      // Do NOT clear idempotencyKeyRef — same payload will reuse same key on retry
    } finally {
      setSubmitting(false);
    }
  }, [
    submitting,
    cart,
    firstName,
    lastName,
    phone,
    addressLine1,
    wilayaCode,
    communeId,
    commune,
    deliveryType,
    router,
  ]);

  /* ================================================================ */
  /* Validation                                                       */
  /* ================================================================ */

  const selectedCommune =
    communeId !== null
      ? communes.find((item) => item.id === communeId) ?? null
      : null;

  const formValid =
    firstName.trim().length >= 1 &&
    firstName.trim().length <= 100 &&
    lastName.trim().length >= 1 &&
    lastName.trim().length <= 100 &&
    phone.trim().length >= 6 &&
    phone.trim().length <= 30 &&
    communeId !== null &&
    commune.trim().length >= 1 &&
    commune.trim().length <= 100 &&
    selectedCommune?.available === true &&
    (deliveryType === "home" || selectedCommune?.hasStopDesk === true) &&
    addressLine1.trim().length >= 1 &&
    addressLine1.trim().length <= 200 &&
    wilayaCode !== null &&
    wilayas.find((w) => w.code === wilayaCode)?.available === true;

  const canSubmit =
    cart.items.length > 0 &&
    formValid &&
    !deliveryLoading &&
    deliveryRate !== null &&
    !deliveryError &&
    !wilayasLoading &&
    !communesLoading;

  /* ================================================================ */
  /* Line totals                                                      */
  /* ================================================================ */

  const subtotalCents = computeSubtotalCents(cart.items);
  const deliveryFeeCents = deliveryRate?.amountCents ?? 0;
  const totalEstimateCents =
    subtotalCents + deliveryFeeCents;

  /* ================================================================ */
  /* Render                                                           */
  /* ================================================================ */

  return (
    <main className="min-h-screen bg-[#F7F1E8] text-[#251713]">
      <section className="mx-auto w-full max-w-[1240px] px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6 text-center sm:mb-8">
          <Link href="/" className="inline-block">
            <span className="font-display text-2xl text-[#251713]">
              Michket
            </span>
          </Link>

          <p className="mt-4 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#8A6A20]">
            Finalisation de la commande
          </p>

          <h1 className="mt-2 font-body text-[28px] font-semibold tracking-[-0.04em] sm:text-[36px]">
            Votre commande en quelques étapes
          </h1>

          <p className="mx-auto mt-2 max-w-[620px] text-[12px] leading-6 text-[#251713]/50 sm:text-[13px]">
            Vérifiez vos informations, choisissez votre livraison puis confirmez votre commande.
          </p>
        </div>

        {/* Empty cart */}
        {cart.hydrated && cart.items.length === 0 && (
          <div className="mx-auto max-w-xl rounded-[18px] border border-[#251713]/[0.07] bg-white p-8 text-center shadow-[0_14px_34px_rgba(37,23,19,0.05)]">
            <p className="text-sm text-[#251713]/55">
              Votre panier est vide.
            </p>

            <Link
              href="/"
              className="mt-5 inline-flex min-h-12 items-center justify-center rounded-[11px] bg-[#ECAB1C] px-6 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#251713] transition hover:bg-[#F1B82F]"
            >
              Découvrir nos créations
            </Link>
          </div>
        )}

        {/* Cart loading */}
        {!cart.hydrated && (
          <div className="mx-auto max-w-xl rounded-[18px] border border-[#251713]/[0.07] bg-white p-8 text-center">
            <p className="text-sm text-[#251713]/40">
              Chargement du panier…
            </p>
          </div>
        )}

        {/* Cart error */}
        {cart.hydrated && cart.error && (
          <div className="mx-auto max-w-xl rounded-[18px] border border-red-200 bg-red-50 p-8 text-center">
            <p className="text-sm text-red-700">
              Erreur lors du chargement du panier.
            </p>

            <Link
              href="/panier"
              className="mt-4 inline-block text-sm font-semibold text-[#8A6A20] hover:underline"
            >
              Retour au panier
            </Link>
          </div>
        )}

        {/* Main checkout */}
        {cart.hydrated && !cart.error && cart.items.length > 0 && (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.12fr)_minmax(340px,0.88fr)] lg:items-start lg:gap-7">
            {/* Left */}
            <div className="space-y-4 sm:space-y-5">
              {/* Client */}
              <section className="overflow-hidden rounded-[18px] border border-[#251713]/[0.08] bg-white shadow-[0_14px_36px_rgba(37,23,19,0.05)]">
                <div className="h-1.5 bg-[#ECAB1C]" />

                <div className="p-4 sm:p-6">
                  <div className="mb-5 flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ECAB1C] text-[11px] font-extrabold text-[#251713]">
                      1
                    </span>

                    <div>
                      <h2 className="font-body text-[20px] font-semibold tracking-[-0.03em]">
                        Vos informations
                      </h2>
                      <p className="mt-0.5 text-[10px] leading-4 text-[#251713]/45">
                        Ces informations nous servent à confirmer votre commande.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="co-firstname"
                          className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.055em] text-[#251713]/55"
                        >
                          Prénom *
                        </label>
                        <input
                          id="co-firstname"
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          maxLength={100}
                          className={inputClass}
                          placeholder="Votre prénom"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="co-lastname"
                          className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.055em] text-[#251713]/55"
                        >
                          Nom *
                        </label>
                        <input
                          id="co-lastname"
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          maxLength={100}
                          className={inputClass}
                          placeholder="Votre nom"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="co-phone"
                        className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.055em] text-[#251713]/55"
                      >
                        Téléphone *
                      </label>
                      <input
                        id="co-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        maxLength={30}
                        className={inputClass}
                        placeholder="05 XX XX XX XX"
                      />
                    </div>

                  </div>
                </div>
              </section>

              {/* Livraison */}
              <section className="overflow-hidden rounded-[18px] border border-[#251713]/[0.08] bg-white shadow-[0_14px_36px_rgba(37,23,19,0.05)]">
                <div className="p-4 sm:p-6">
                  <div className="mb-5 flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ECAB1C] text-[11px] font-extrabold text-[#251713]">
                      2
                    </span>

                    <div>
                      <h2 className="font-body text-[20px] font-semibold tracking-[-0.03em]">
                        Livraison
                      </h2>
                      <p className="mt-0.5 text-[10px] leading-4 text-[#251713]/45">
                        Choisissez votre wilaya, commune et mode de livraison.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="co-wilaya"
                          className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.055em] text-[#251713]/55"
                        >
                          Wilaya *
                        </label>

                        {wilayasLoading ? (
                          <div className={`${inputClass} flex items-center text-[#251713]/35`}>
                            Chargement…
                          </div>
                        ) : wilayasError ? (
                          <div className="min-h-12 rounded-[10px] border border-red-200 bg-red-50 px-3.5 py-3 text-xs text-red-700">
                            {wilayasError}
                          </div>
                        ) : (
                          <select
                            id="co-wilaya"
                            value={wilayaCode ?? ""}
                            onChange={(e) => {
                              const raw = e.target.value;

                              if (!raw) {
                                setWilayaCode(null);
                                setWilayaName("");
                                setCommuneId(null);
                                setCommune("");
                                setCommunes([]);
                                setDeliveryRate(null);
                                setDeliveryError(null);
                                setDeliveryType("home");
                                return;
                              }

                              const val = Number(raw);
                              const w = wilayas.find((item) => item.code === val);

                              setWilayaCode(val);
                              setWilayaName(w?.name ?? "");
                              setCommuneId(null);
                              setCommune("");
                              setDeliveryRate(null);
                              setDeliveryError(null);
                              setDeliveryType("home");
                            }}
                            className={inputClass}
                          >
                            <option value="">Choisir une wilaya</option>
                            {wilayas.map((w) => (
                              <option
                                key={w.code}
                                value={w.code}
                                disabled={!w.available}
                              >
                                {w.code} — {w.name}
                                {!w.available ? " (Indisponible)" : ""}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="co-commune"
                          className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.055em] text-[#251713]/55"
                        >
                          Commune *
                        </label>

                        {wilayaCode === null ? (
                          <div className={`${inputClass} flex items-center text-[#251713]/35`}>
                            Choisir d&apos;abord la wilaya
                          </div>
                        ) : communesLoading ? (
                          <div className={`${inputClass} flex items-center text-[#251713]/35`}>
                            Chargement…
                          </div>
                        ) : communesError ? (
                          <div className="min-h-12 rounded-[10px] border border-red-200 bg-red-50 px-3.5 py-3 text-xs text-red-700">
                            {communesError}
                          </div>
                        ) : (
                          <select
                            id="co-commune"
                            value={communeId ?? ""}
                            onChange={(e) => {
                              const raw = e.target.value;

                              if (!raw) {
                                setCommuneId(null);
                                setCommune("");
                                setDeliveryType("home");
                                setDeliveryRate(null);
                                setDeliveryError(null);
                                return;
                              }

                              const id = Number(raw);
                              const selected = communes.find(
                                (item) => item.id === id,
                              );

                              setCommuneId(id);
                              setCommune(selected?.name ?? "");
                              setDeliveryType((current) =>
                                current === "office" && !selected?.hasStopDesk
                                  ? "home"
                                  : current,
                              );
                              setDeliveryRate(null);
                              setDeliveryError(null);
                            }}
                            className={inputClass}
                          >
                            <option value="">Choisir une commune</option>
                            {communes.map((item) => (
                              <option
                                key={item.id}
                                value={item.id}
                                disabled={!item.available}
                              >
                                {item.name}
                                {!item.available ? " (Indisponible)" : ""}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>

                    {wilayaCode !== null &&
                      !wilayasLoading &&
                      wilayas.find((w) => w.code === wilayaCode)?.available === false && (
                        <p className="text-xs font-medium text-red-700">
                          Livraison indisponible pour cette wilaya.
                        </p>
                      )}

                    <div>
                      <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.055em] text-[#251713]/55">
                        Mode de livraison *
                      </span>

                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          disabled={
                            communeId === null ||
                            selectedCommune?.available !== true
                          }
                          onClick={() => setDeliveryType("home")}
                          className={`rounded-[11px] border p-3.5 text-left transition ${
                            communeId === null ||
                            selectedCommune?.available !== true
                              ? "cursor-not-allowed border-[#251713]/[0.06] bg-[#EFE8DF] text-[#251713]/35"
                              : deliveryType === "home"
                                ? "border-[#ECAB1C] bg-[#FFF8E8]"
                                : "border-[#251713]/10 bg-white"
                          }`}
                        >
                          <p className="text-[11px] font-bold">
                            Domicile
                          </p>

                          {deliveryType === "home" && deliveryRate && (
                            <p className="mt-1 text-[10px] font-extrabold text-[#8A6A20]">
                              {formatDA(deliveryRate.amountCents)}
                            </p>
                          )}
                        </button>

                        <button
                          type="button"
                          disabled={
                            communeId === null ||
                            selectedCommune?.available !== true ||
                            selectedCommune?.hasStopDesk !== true
                          }
                          onClick={() => setDeliveryType("office")}
                          className={`rounded-[11px] border p-3.5 text-left transition ${
                            communeId === null ||
                            selectedCommune?.available !== true ||
                            selectedCommune?.hasStopDesk !== true
                              ? "cursor-not-allowed border-[#251713]/[0.06] bg-[#EFE8DF] text-[#251713]/35"
                              : deliveryType === "office"
                                ? "border-[#ECAB1C] bg-[#FFF8E8]"
                                : "border-[#251713]/10 bg-white"
                          }`}
                        >
                          <p className="text-[11px] font-bold">
                            Bureau Yalidine
                          </p>

                          {deliveryType === "office" && deliveryRate && (
                            <p className="mt-1 text-[10px] font-extrabold text-[#8A6A20]">
                              {formatDA(deliveryRate.amountCents)}
                            </p>
                          )}

                          {communeId !== null &&
                            selectedCommune?.hasStopDesk !== true && (
                              <p className="mt-1 text-[9px] font-semibold">
                                Indisponible
                              </p>
                            )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="co-address"
                        className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.055em] text-[#251713]/55"
                      >
                        Adresse *
                      </label>
                      <input
                        id="co-address"
                        type="text"
                        value={addressLine1}
                        onChange={(e) => setAddressLine1(e.target.value)}
                        maxLength={200}
                        className={inputClass}
                        placeholder="Quartier, rue, numéro..."
                      />
                    </div>


                    <div className="min-h-5 text-[10px]">
                      {deliveryLoading ? (
                        <span className="text-[#251713]/45">
                          Calcul de la livraison…
                        </span>
                      ) : deliveryError ? (
                        <span className="font-medium text-amber-800">
                          {deliveryError}
                        </span>
                      ) : deliveryRate ? (
                        <span className="font-semibold text-emerald-700">
                          Livraison : {formatDA(deliveryRate.amountCents)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </section>

              {/* Paiement */}
              <section className="rounded-[18px] border border-[#251713]/[0.08] bg-white p-4 shadow-[0_14px_36px_rgba(37,23,19,0.05)] sm:p-6">
                <h2 className="font-body text-[18px] font-semibold tracking-[-0.03em]">
                  Paiement
                </h2>

                <div className="mt-4 flex items-start gap-3 rounded-[12px] border border-[#ECAB1C]/35 bg-[#FFF8E8] p-4">
                  <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#ECAB1C] text-[10px] font-black text-[#251713]">
                    ✓
                  </span>

                  <div>
                    <p className="text-[12px] font-bold">
                      Paiement à la livraison
                    </p>
                    <p className="mt-1 text-[10px] leading-4 text-[#251713]/45">
                      Vous paierez votre commande lors de sa livraison.
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* Right summary */}
            <aside className="lg:sticky lg:top-5">
              <div className="overflow-hidden rounded-[18px] border border-[#251713]/[0.08] bg-white shadow-[0_18px_45px_rgba(37,23,19,0.08)]">
                <div className="h-1.5 bg-[#ECAB1C]" />

                <div className="p-4 sm:p-6">
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#8A6A20]">
                    Votre panier
                  </p>

                  <h2 className="mt-1 font-body text-[22px] font-semibold tracking-[-0.035em]">
                    Récapitulatif
                  </h2>

                  <div className="mt-5 space-y-4">
                    {cart.items.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[10px] bg-[#EDE3D7]">
                          {item.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.image}
                              alt={item.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-[9px] text-[#251713]/30">
                              IMG
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[12px] font-bold">
                            {item.title}
                          </p>

                          {item.variantId && (
                            <div className="mt-1 flex items-center gap-1.5">
                              <span
                                className="inline-block h-3 w-3 rounded-full border border-[#251713]/10"
                                style={
                                  item.selectedIsMulticolor
                                    ? {
                                        background:
                                          "conic-gradient(from 0deg, #FF3B30, #FF9500, #FFCC00, #34C759, #00C7BE, #007AFF, #5856D6, #AF52DE, #FF2D55, #FF3B30)",
                                      }
                                    : {
                                        backgroundColor:
                                          item.selectedColorHex ?? "#ccc",
                                      }
                                }
                                aria-hidden="true"
                              />

                              <span className="text-[10px] text-[#251713]/48">
                                {item.selectedColorName ??
                                  (item.selectedIsMulticolor
                                    ? "Multicolore"
                                    : "Variante")}
                              </span>
                            </div>
                          )}

                          {item.personalization && (
                            <p className="mt-1 truncate text-[10px] text-[#251713]/45">
                              {typeof item.personalization.text === "string"
                                ? item.personalization.text
                                : Object.values(item.personalization).join(
                                    " · ",
                                  )}
                            </p>
                          )}

                          <div className="mt-1.5 flex items-center justify-between gap-3">
                            <span className="text-[10px] text-[#251713]/45">
                              ×{item.quantity}
                            </span>

                            <span className="text-[12px] font-bold">
                              {formatDA(
                                Math.round(item.price * 100) * item.quantity,
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="my-5 h-px bg-[#251713]/[0.08]" />

                  <div className="space-y-2.5 text-[12px]">
                    <div className="flex justify-between gap-4">
                      <span className="text-[#251713]/50">
                        Sous-total
                      </span>
                      <span className="font-semibold">
                        {formatDA(subtotalCents)}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-[#251713]/50">
                        Livraison
                      </span>
                      <span className="font-semibold">
                        {deliveryLoading
                          ? "Calcul…"
                          : deliveryRate
                            ? formatDA(deliveryFeeCents)
                            : deliveryError
                              ? "Indisponible"
                              : "—"}
                      </span>
                    </div>

                  </div>

                  <div className="my-4 h-px bg-[#251713]/[0.08]" />

                  <div className="flex items-end justify-between gap-4">
                    <span className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#8A6A20]">
                      Total
                    </span>

                    <span className="text-[27px] font-extrabold tracking-[-0.04em]">
                      {formatDA(totalEstimateCents)}
                    </span>
                  </div>

                  <p className="mt-2 text-[9px] leading-4 text-[#251713]/35">
                    Le montant final est validé par le serveur au moment de la commande.
                  </p>

                  {orderError && (
                    <div className="mt-4 rounded-[10px] border border-red-200 bg-red-50 p-3 text-[11px] font-medium text-red-700">
                      {orderError}
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={!canSubmit || submitting}
                    onClick={handleSubmit}
                    className="mt-5 flex min-h-[56px] w-full items-center justify-center rounded-[11px] bg-[#ECAB1C] px-5 text-[12px] font-extrabold uppercase tracking-[0.09em] text-[#251713] shadow-[0_12px_26px_rgba(236,171,28,0.24)] transition hover:bg-[#F1B82F] disabled:cursor-not-allowed disabled:bg-[#D8C8A3] disabled:text-[#251713]/45"
                  >
                    {submitting
                      ? "Création de la commande…"
                      : "Confirmer ma commande"}
                  </button>

                  <p className="mt-3 text-center text-[10px] font-medium text-[#251713]/42">
                    Paiement à la livraison
                  </p>

                  <div className="mt-4 text-center">
                    <Link
                      href="/panier"
                      className="text-[10px] font-semibold text-[#251713]/55 transition hover:text-[#8A6A20]"
                    >
                      ← Retour au panier
                    </Link>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-[10px] font-semibold text-[#251713]/45 transition hover:text-[#8A6A20]"
          >
            ← Retour à la boutique
          </Link>
        </div>
      </section>
    </main>

  );
}


const inputClass =
  "min-h-12 w-full rounded-[10px] border border-[#251713]/10 bg-white px-3.5 text-[13px] text-[#251713] outline-none transition placeholder:text-[#251713]/25 focus:border-[#ECAB1C] focus:ring-2 focus:ring-[#ECAB1C]/10";
