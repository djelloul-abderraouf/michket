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
  previewPromo,
  type ApiWilaya,
  type ApiCommune,
  type ApiDeliveryRate,
  type ApiPromoPreview,
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

function isValidEmail(email: string): boolean {
  if (!email) return true; // optional
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
  const [email, setEmail] = useState("");
  const [wilayaCode, setWilayaCode] = useState<number | null>(null);
  const [wilayaName, setWilayaName] = useState("");
  const [communeId, setCommuneId] = useState<number | null>(null);
  const [commune, setCommune] = useState("");
  const [deliveryType, setDeliveryType] = useState<"home" | "office">("home");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [notes, setNotes] = useState("");
  const [promoInput, setPromoInput] = useState("");

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
  const [deliveryEstimate, setDeliveryEstimate] = useState<string | null>(null);

  /* ---------- promo ---------- */
  const [promoResult, setPromoResult] = useState<ApiPromoPreview | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoApplied, setPromoApplied] = useState(false);

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
    setDeliveryEstimate(null);
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
      setDeliveryEstimate(null);

      try {
        const data = await getDeliveryRate(
          code,
          selectedCommuneId,
          selectedDeliveryType,
        );
        setDeliveryRate(data);
        setDeliveryEstimate(data.estimate);
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
      setDeliveryEstimate(null);
      return;
    }

    const selected = communes.find((item) => item.id === communeId);

    if (!selected?.available) {
      setDeliveryRate(null);
      setDeliveryError("Livraison indisponible pour cette commune.");
      setDeliveryEstimate(null);
      return;
    }

    if (deliveryType === "office" && !selected.hasStopDesk) {
      setDeliveryRate(null);
      setDeliveryError("La livraison en bureau n'est pas disponible pour cette commune.");
      setDeliveryEstimate(null);
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
  /* Promo                                                            */
  /* ================================================================ */

  const handleApplyPromo = useCallback(async () => {
    const code = promoInput.trim();
    if (!code) return;
    setPromoLoading(true);
    setPromoError(null);
    setPromoResult(null);
    setPromoApplied(false);
    try {
      const subtotalCents = computeSubtotalCents(cart.items);
      const data = await previewPromo(code, subtotalCents);
      setPromoResult(data);
      setPromoApplied(true);
    } catch {
      setPromoError("Code promo invalide ou expiré.");
    } finally {
      setPromoLoading(false);
    }
  }, [promoInput, cart.items]);

  const handleRemovePromo = useCallback(() => {
    setPromoResult(null);
    setPromoApplied(false);
    setPromoInput("");
    setPromoError(null);
  }, []);

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
        email: email.trim() || undefined,
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim() || undefined,
        wilayaCode: wilayaCode!,
        communeId: communeId!,
        commune: commune.trim(),
        deliveryType,
        notes: notes.trim() || undefined,
        promoCode: promoApplied && promoResult ? promoResult.code : undefined,
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
            detail.includes("promo") ||
            detail.includes("Promo") ||
            detail.includes("promotion")
          ) {
            message =
              "Le code promo n'est plus valide. Veuillez vérifier votre code.";
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
    email,
    addressLine1,
    addressLine2,
    wilayaCode,
    communeId,
    commune,
    deliveryType,
    notes,
    promoApplied,
    promoResult,
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
    isValidEmail(email.trim()) &&
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
  const discountCents = promoResult?.discountCents ?? 0;
  const totalEstimateCents = Math.max(
    0,
    subtotalCents + deliveryFeeCents - discountCents,
  );

  /* ================================================================ */
  /* Render                                                           */
  /* ================================================================ */

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

          {/* Empty cart */}
          {cart.hydrated && cart.items.length === 0 && (
            <div className="bg-michket-white p-8 text-center">
              <p className="text-michket-charcoal/60 mb-4">
                Votre panier est vide.
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-michket-gold text-white text-sm font-semibold hover:bg-michket-gold-dark transition-colors"
              >
                Découvrir nos créations
              </Link>
            </div>
          )}

          {/* Cart loading */}
          {!cart.hydrated && (
            <div className="bg-michket-white p-8 text-center">
              <p className="text-michket-charcoal/40 text-sm">
                Chargement du panier…
              </p>
            </div>
          )}

          {/* Cart error */}
          {cart.hydrated && cart.error && (
            <div className="bg-michket-white p-8 text-center">
              <p className="text-red-600 text-sm mb-4">
                Erreur lors du chargement du panier.
              </p>
              <Link
                href="/panier"
                className="text-sm text-michket-gold hover:underline"
              >
                Retour au panier
              </Link>
            </div>
          )}

          {/* Main checkout form */}
          {cart.hydrated && !cart.error && cart.items.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* ── Left: Form ── */}
              <div className="lg:col-span-3 space-y-6">
                {/* Customer info */}
                <section className="bg-michket-white p-6 sm:p-8">
                  <h1 className="font-display text-xl text-michket-black mb-6">
                    Informations client
                  </h1>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="co-firstname"
                          className="block text-xs font-medium text-michket-charcoal mb-1"
                        >
                          Prénom *
                        </label>
                        <input
                          id="co-firstname"
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          maxLength={100}
                          className="w-full px-3 py-2.5 bg-michket-ivory border border-michket-gold/15 text-sm focus:outline-none focus:border-michket-gold/40 transition-colors"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="co-lastname"
                          className="block text-xs font-medium text-michket-charcoal mb-1"
                        >
                          Nom *
                        </label>
                        <input
                          id="co-lastname"
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          maxLength={100}
                          className="w-full px-3 py-2.5 bg-michket-ivory border border-michket-gold/15 text-sm focus:outline-none focus:border-michket-gold/40 transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="co-phone"
                        className="block text-xs font-medium text-michket-charcoal mb-1"
                      >
                        Téléphone *
                      </label>
                      <input
                        id="co-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        maxLength={30}
                        className="w-full px-3 py-2.5 bg-michket-ivory border border-michket-gold/15 text-sm focus:outline-none focus:border-michket-gold/40 transition-colors"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="co-email"
                        className="block text-xs font-medium text-michket-charcoal mb-1"
                      >
                        Email
                      </label>
                      <input
                        id="co-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2.5 bg-michket-ivory border border-michket-gold/15 text-sm focus:outline-none focus:border-michket-gold/40 transition-colors"
                      />
                    </div>
                  </div>
                </section>

                {/* Address */}
                <section className="bg-michket-white p-6 sm:p-8">
                  <h2 className="font-display text-lg text-michket-black mb-6">
                    Adresse de livraison
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="co-wilaya"
                        className="block text-xs font-medium text-michket-charcoal mb-1"
                      >
                        Wilaya *
                      </label>
                      {wilayasLoading ? (
                        <div className="w-full px-3 py-2.5 bg-michket-ivory border border-michket-gold/15 text-sm text-michket-charcoal/40">
                          Chargement…
                        </div>
                      ) : wilayasError ? (
                        <div className="w-full px-3 py-2.5 bg-michket-ivory border border-red-300 text-sm text-red-600">
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
                              setDeliveryEstimate(null);
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
                            setDeliveryEstimate(null);
                            setDeliveryType("home");
                          }}
                          className="w-full px-3 py-2.5 bg-michket-ivory border border-michket-gold/15 text-sm focus:outline-none focus:border-michket-gold/40 transition-colors"
                        >
                          <option value="">— Sélectionnez —</option>
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

                    {/* Wilaya unavailable */}
                    {wilayaCode !== null &&
                      !wilayasLoading &&
                      wilayas.find((w) => w.code === wilayaCode)
                        ?.available === false && (
                        <p className="text-sm text-red-600">
                          Livraison indisponible pour cette wilaya.
                        </p>
                      )}

                    <div>
                      <label
                        htmlFor="co-commune"
                        className="block text-xs font-medium text-michket-charcoal mb-1"
                      >
                        Commune *
                      </label>

                      {wilayaCode === null ? (
                        <div className="w-full px-3 py-2.5 bg-michket-ivory border border-michket-gold/15 text-sm text-michket-charcoal/40">
                          Sélectionnez d&apos;abord une wilaya.
                        </div>
                      ) : communesLoading ? (
                        <div className="w-full px-3 py-2.5 bg-michket-ivory border border-michket-gold/15 text-sm text-michket-charcoal/40">
                          Chargement des communes…
                        </div>
                      ) : communesError ? (
                        <div className="w-full px-3 py-2.5 bg-michket-ivory border border-red-300 text-sm text-red-600">
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
                              setDeliveryEstimate(null);
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
                            setDeliveryEstimate(null);
                          }}
                          className="w-full px-3 py-2.5 bg-michket-ivory border border-michket-gold/15 text-sm focus:outline-none focus:border-michket-gold/40 transition-colors"
                        >
                          <option value="">— Sélectionnez —</option>
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

                    {selectedCommune?.deliveryTime && (
                      <p className="text-xs text-michket-charcoal/60">
                        Délai indicatif Yalidine : {selectedCommune.deliveryTime}
                      </p>
                    )}

                    <div>
                      <label
                        htmlFor="co-address"
                        className="block text-xs font-medium text-michket-charcoal mb-1"
                      >
                        Adresse *
                      </label>
                      <input
                        id="co-address"
                        type="text"
                        value={addressLine1}
                        onChange={(e) => setAddressLine1(e.target.value)}
                        maxLength={200}
                        className="w-full px-3 py-2.5 bg-michket-ivory border border-michket-gold/15 text-sm focus:outline-none focus:border-michket-gold/40 transition-colors"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="co-address2"
                        className="block text-xs font-medium text-michket-charcoal mb-1"
                      >
                        Complément d&apos;adresse
                      </label>
                      <input
                        id="co-address2"
                        type="text"
                        value={addressLine2}
                        onChange={(e) => setAddressLine2(e.target.value)}
                        maxLength={200}
                        className="w-full px-3 py-2.5 bg-michket-ivory border border-michket-gold/15 text-sm focus:outline-none focus:border-michket-gold/40 transition-colors"
                      />
                    </div>
                  </div>
                </section>

                {/* Delivery type */}
                <section className="bg-michket-white p-6 sm:p-8">
                  <h2 className="font-display text-lg text-michket-black mb-4">
                    Type de livraison
                  </h2>

                  <div className="space-y-3">
                    <label
                      className={`flex items-center gap-3 p-3 border bg-michket-ivory ${
                        communeId === null || selectedCommune?.available !== true
                          ? "border-michket-gold/10 opacity-50 cursor-not-allowed"
                          : deliveryType === "home"
                            ? "border-michket-gold/40 cursor-pointer"
                            : "border-michket-gold/20 cursor-pointer"
                      }`}
                    >
                      <input
                        type="radio"
                        name="delivery-type"
                        value="home"
                        checked={deliveryType === "home"}
                        disabled={
                          communeId === null ||
                          selectedCommune?.available !== true
                        }
                        onChange={() => setDeliveryType("home")}
                        className="accent-michket-gold"
                      />
                      <span className="text-sm text-michket-black">
                        Livraison à domicile
                      </span>
                    </label>

                    <label
                      className={`flex items-center gap-3 p-3 border bg-michket-ivory ${
                        communeId === null ||
                        selectedCommune?.available !== true ||
                        selectedCommune?.hasStopDesk !== true
                          ? "border-michket-gold/10 opacity-50 cursor-not-allowed"
                          : deliveryType === "office"
                            ? "border-michket-gold/40 cursor-pointer"
                            : "border-michket-gold/20 cursor-pointer"
                      }`}
                    >
                      <input
                        type="radio"
                        name="delivery-type"
                        value="office"
                        checked={deliveryType === "office"}
                        disabled={
                          communeId === null ||
                          selectedCommune?.available !== true ||
                          selectedCommune?.hasStopDesk !== true
                        }
                        onChange={() => setDeliveryType("office")}
                        className="accent-michket-gold"
                      />
                      <span className="text-sm text-michket-black">
                        Livraison en bureau Yalidine
                        {communeId !== null &&
                        selectedCommune?.hasStopDesk !== true
                          ? " — Indisponible dans cette commune"
                          : ""}
                      </span>
                    </label>
                  </div>

                  {deliveryLoading && (
                    <p className="mt-4 text-sm text-michket-charcoal/60">
                      Calcul du tarif Yalidine…
                    </p>
                  )}

                  {deliveryError && !deliveryLoading && (
                    <p className="mt-4 text-sm text-red-600">
                      {deliveryError}
                    </p>
                  )}

                  {deliveryRate && !deliveryLoading && (
                    <div className="mt-4 p-3 bg-michket-ivory border border-michket-gold/15">
                      <p className="text-sm text-michket-black">
                        Tarif de livraison :{" "}
                        <span className="font-semibold">
                          {formatDA(deliveryRate.amountCents)}
                        </span>
                      </p>
                      {deliveryEstimate && (
                        <p className="text-xs text-michket-charcoal/60 mt-1">
                          Délai estimé : {deliveryEstimate}
                        </p>
                      )}
                    </div>
                  )}
                </section>

                {/* Promo code */}
                <section className="bg-michket-white p-6 sm:p-8">
                  <h2 className="font-display text-lg text-michket-black mb-4">
                    Code promo
                  </h2>

                  {promoApplied && promoResult ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200">
                      <div className="text-sm">
                        <span className="font-semibold text-green-700">
                          {promoResult.code}
                        </span>{" "}
                        appliqué — Réduction :{" "}
                        <span className="font-semibold">
                          {formatDA(promoResult.discountCents)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemovePromo}
                        className="text-sm text-red-600 hover:underline ml-4 shrink-0"
                      >
                        Retirer
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        placeholder="Votre code promo"
                        className="flex-1 px-3 py-2.5 bg-michket-ivory border border-michket-gold/15 text-sm focus:outline-none focus:border-michket-gold/40 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        disabled={promoLoading || !promoInput.trim()}
                        className="px-4 py-2.5 bg-michket-gold text-white text-sm font-semibold hover:bg-michket-gold-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {promoLoading ? "…" : "Appliquer"}
                      </button>
                    </div>
                  )}

                  {promoError && (
                    <p className="mt-2 text-sm text-red-600">{promoError}</p>
                  )}
                </section>

                {/* Notes */}
                <section className="bg-michket-white p-6 sm:p-8">
                  <h2 className="font-display text-lg text-michket-black mb-4">
                    Notes pour la commande
                  </h2>
                  <textarea
                    value={notes}
                    onChange={(e) =>
                      setNotes(e.target.value.slice(0, 1000))
                    }
                    maxLength={1000}
                    rows={3}
                    placeholder="Instructions de livraison, demandes spéciales…"
                    className="w-full px-3 py-2.5 bg-michket-ivory border border-michket-gold/15 text-sm focus:outline-none focus:border-michket-gold/40 transition-colors resize-none"
                  />
                  <p className="text-xs text-michket-charcoal/40 mt-1 text-right">
                    {notes.length}/1000
                  </p>
                </section>

                {/* Payment */}
                <section className="bg-michket-white p-6 sm:p-8">
                  <h2 className="font-display text-lg text-michket-black mb-4">
                    Mode de paiement
                  </h2>

                  <label className="flex items-center gap-3 p-3 border border-michket-gold/20 bg-michket-ivory cursor-pointer">
                    <input
                      type="radio"
                      name="payment-method"
                      checked
                      readOnly
                      className="accent-michket-gold"
                    />
                    <div>
                      <span className="text-sm text-michket-black font-medium">
                        Paiement à la livraison
                      </span>
                      <p className="text-xs text-michket-charcoal/60 mt-0.5">
                        Vous paierez votre commande lors de la livraison.
                      </p>
                    </div>
                  </label>
                </section>
              </div>

              {/* ── Right: Summary (sticky) ── */}
              <div className="lg:col-span-2">
                <div className="bg-michket-white p-6 sticky top-24">
                  <h2 className="text-sm font-semibold text-michket-black mb-4">
                    Récapitulatif
                  </h2>

                  {/* Items */}
                  <div className="space-y-4 mb-4">
                    {cart.items.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        {/* Image placeholder */}
                        <div className="w-14 h-14 bg-michket-ivory flex items-center justify-center text-xs text-michket-charcoal/30 shrink-0">
                          {item.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-[10px]">IMG</span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-michket-black font-medium truncate">
                            {item.title}
                          </p>

                          {/* Variant swatch */}
                          {item.variantId && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span
                                className="inline-block w-3 h-3 rounded-full border border-michket-gold/20"
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
                              <span className="text-xs text-michket-charcoal/60">
                                {item.selectedColorName ??
                                  (item.selectedIsMulticolor
                                    ? "Multicolore"
                                    : "Variante")}
                              </span>
                            </div>
                          )}

                          {/* Personalization */}
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
                            <span className="text-sm text-michket-black font-medium">
                              {formatDA(
                                Math.round(item.price * 100) * item.quantity,
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="border-t border-michket-ivory pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-michket-charcoal/60">
                        Sous-total
                      </span>
                      <span className="text-michket-black">
                        {formatDA(subtotalCents)}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-michket-charcoal/60">
                        Livraison
                      </span>
                      <span className="text-michket-black">
                        {deliveryLoading
                          ? "Calcul…"
                          : deliveryRate
                            ? formatDA(deliveryFeeCents)
                            : deliveryError
                              ? "Indisponible"
                              : "—"}
                      </span>
                    </div>

                    {discountCents > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">Réduction</span>
                        <span className="text-green-600">
                          −{formatDA(discountCents)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm font-semibold pt-2 border-t border-michket-ivory">
                      <span className="text-michket-black">
                        Total estimé
                      </span>
                      <span className="text-michket-black">
                        {formatDA(totalEstimateCents)}
                      </span>
                    </div>
                    <p className="text-[11px] text-michket-charcoal/40">
                      Le total final sera calculé par le serveur.
                    </p>
                  </div>

                  {/* Order error */}
                  {orderError && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 text-sm text-red-700">
                      {orderError}
                    </div>
                  )}

                  {/* Submit button */}
                  <div className="mt-6">
                    <button
                      type="button"
                      disabled={!canSubmit || submitting}
                      onClick={handleSubmit}
                      className="w-full py-3 bg-michket-gold text-white font-semibold text-sm hover:bg-michket-gold-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting
                        ? "Création de la commande…"
                        : "Confirmer ma commande"}
                    </button>
                  </div>

                  {/* Back link */}
                  <div className="mt-4 text-center">
                    <Link
                      href="/panier"
                      className="text-xs text-michket-charcoal/60 hover:text-michket-gold transition-colors"
                    >
                      ← Retour au panier
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

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
