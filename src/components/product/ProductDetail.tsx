"use client";

/**
 * MICHKET PRODUCT DETAIL — VERSION GALERIE
 * VERSION MOBILE DIRECTE : photo -> titre -> prix -> formulaire.
 * Gauche : produit + galerie uniquement.
 * Droite : formulaire de commande uniquement.
 */

import Image from "next/image";
import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Product } from "@/data/products";
import type { CheckoutWilaya } from "@/lib/algeria";
import type { DeliveryType } from "@/data/delivery-prices";

interface ProductDetailProps {
  product: Product;
  relatedProducts?: Product[];
  wilayas: CheckoutWilaya[];
}

type OrderState =
  | { status: "idle" }
  | { status: "sending" }
  | { status: "success"; reference: string }
  | { status: "error"; message: string };

function formatPriceDA(price: number): string {
  return `${new Intl.NumberFormat("fr-DZ", {
    minimumFractionDigits: Number.isInteger(price) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(price)} DA`;
}

export function ProductDetail({ product, wilayas }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [personalization, setPersonalization] = useState("");
  const [wilayaCode, setWilayaCode] = useState("");
  const [commune, setCommune] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("home");

  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [deliveryMessage, setDeliveryMessage] = useState("");
  const [orderState, setOrderState] = useState<OrderState>({ status: "idle" });

  const selectedWilaya = useMemo(
    () =>
      wilayas.find((w) => String(w.code) === String(wilayaCode)) ?? null,
    [wilayaCode, wilayas],
  );

  const communes = selectedWilaya?.communes ?? [];
  const activeImage = product.images[selectedImage] ?? product.images[0];
  const subtotal = product.price * quantity;
  const total = deliveryFee === null ? null : subtotal + deliveryFee;

  useEffect(() => {
    setCommune("");
  }, [wilayaCode]);

  useEffect(() => {
    if (!wilayaCode) {
      setDeliveryFee(null);
      setDeliveryMessage("");
      return;
    }

    const controller = new AbortController();

    async function loadRate() {
      setDeliveryLoading(true);
      setDeliveryFee(null);
      setDeliveryMessage("");

      try {
        const response = await fetch("/api/delivery-rate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            wilayaCode: Number(wilayaCode),
            deliveryType,
          }),
        });

        const data = (await response.json()) as {
          fee?: number | null;
          message?: string;
        };

        if (!response.ok) {
          throw new Error(data.message || "Tarif indisponible.");
        }

        if (typeof data.fee === "number") {
          setDeliveryFee(data.fee);
          setDeliveryMessage("");
        } else {
          setDeliveryFee(null);
          setDeliveryMessage(data.message || "Tarif à confirmer.");
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        setDeliveryFee(null);
        setDeliveryMessage(
          error instanceof Error ? error.message : "Tarif à confirmer.",
        );
      } finally {
        if (!controller.signal.aborted) setDeliveryLoading(false);
      }
    }

    loadRate();
    return () => controller.abort();
  }, [wilayaCode, deliveryType]);

  useEffect(() => {
    if (!imageModalOpen) return;

    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setImageModalOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [imageModalOpen]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedWilaya || !commune || deliveryFee === null) {
      setOrderState({
        status: "error",
        message:
          "Sélectionnez votre wilaya, votre commune et un mode de livraison disponible.",
      });
      return;
    }

    setOrderState({ status: "sending" });
    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug: product.slug,
          quantity,
          firstName,
          lastName,
          phone,
          personalization,
          wilayaCode: selectedWilaya.code,
          wilayaName: selectedWilaya.name,
          commune,
          address,
          deliveryType,
          website: formData.get("website") ?? "",
        }),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        reference?: string;
        message?: string;
      };

      if (!response.ok || !data.ok || !data.reference) {
        throw new Error(data.message || "Impossible d'envoyer la commande.");
      }

      setOrderState({ status: "success", reference: data.reference });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setOrderState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Impossible d'envoyer la commande.",
      });
    }
  }

  const canSubmit =
    Boolean(firstName.trim()) &&
    Boolean(lastName.trim()) &&
    Boolean(phone.trim()) &&
    Boolean(wilayaCode) &&
    Boolean(commune) &&
    (deliveryType === "office" || Boolean(address.trim())) &&
    (!product.personalizable || Boolean(personalization.trim())) &&
    deliveryFee !== null &&
    orderState.status !== "sending";

  return (
    <main className="min-h-screen bg-[#F7F1E8] text-[#251713]">
      {orderState.status === "success" && (
        <div className="bg-emerald-50">
          <div className="mx-auto max-w-[1240px] px-4 py-4 sm:px-6 lg:px-8">
            <div className="rounded-[12px] border border-emerald-700/15 bg-white p-4">
              <p className="font-semibold text-emerald-950">
                Commande enregistrée.
              </p>
              <p className="mt-1 text-sm text-emerald-900/65">
                Référence : <strong>{orderState.reference}</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      <section className="mx-auto max-w-[1240px] px-3 py-3 sm:px-6 sm:py-8 lg:px-8">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.04fr_0.96fr] lg:items-start lg:gap-8">
          {/* GALERIE PRODUIT */}
          <div className="lg:sticky lg:top-6">
            <button
              type="button"
              onClick={() => setImageModalOpen(true)}
              className="group relative block w-full overflow-hidden rounded-[18px] border border-[#251713]/[0.07] bg-[#EDE3D7] shadow-[0_18px_45px_rgba(37,23,19,0.08)]"
            >
              <div className="relative aspect-[4/4.6] sm:aspect-square">
                <Image
                  src={activeImage.src}
                  alt={activeImage.alt}
                  fill
                  priority
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.015]"
                  sizes="(max-width: 1023px) 100vw, 52vw"
                />
              </div>

              <span className="absolute bottom-3 right-3 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold shadow">
                Voir en grand
              </span>
            </button>

            {product.images.length > 1 && (
              <div className="mt-3 hidden grid-cols-4 gap-2 sm:grid sm:grid-cols-5">
                {product.images.map((image, index) => (
                  <button
                    key={`${image.src}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={`overflow-hidden rounded-[10px] border-2 bg-[#EDE3D7] ${
                      selectedImage === index
                        ? "border-[#ECAB1C]"
                        : "border-transparent"
                    }`}
                  >
                    <div className="relative aspect-square">
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        className="object-cover"
                        sizes="120px"
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-3 rounded-[14px] border border-[#251713]/[0.07] bg-white p-4 sm:mt-4 sm:rounded-[16px] sm:p-5">
              <h1 className="font-body text-[24px] font-semibold leading-[1.08] tracking-[-0.04em] sm:text-[34px]">
                {product.title}
              </h1>

              <p className="mt-3 hidden text-[13px] leading-6 text-[#251713]/55 sm:block">
                {product.description}
              </p>

              <div className="mt-3 flex items-end gap-3 sm:mt-4">
                <span className="text-[26px] font-extrabold tracking-[-0.04em] sm:text-[28px]">
                  {formatPriceDA(product.price)}
                </span>

                {product.compareAtPrice &&
                  product.compareAtPrice > product.price && (
                    <span className="pb-1 text-sm text-[#251713]/30 line-through">
                      {formatPriceDA(product.compareAtPrice)}
                    </span>
                  )}
              </div>

              <p className="mt-2 hidden text-[10px] font-semibold text-[#8A6A20] sm:block">
                Paiement à la livraison
              </p>
            </div>
          </div>

          {/* FORMULAIRE */}
          <form
            onSubmit={handleSubmit}
            className="overflow-hidden rounded-[18px] border border-[#251713]/[0.08] bg-[#FFFCF8] shadow-[0_18px_45px_rgba(37,23,19,0.08)]"
          >
            <div className="h-1.5 bg-[#ECAB1C]" />

            <div className="border-b border-[#251713]/[0.07] p-4 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="hidden text-[9px] font-bold uppercase tracking-[0.14em] text-[#8A6A20] sm:block">
                    Commande
                  </p>
                  <h2 className="font-body text-[22px] font-semibold tracking-[-0.04em] sm:mt-1 sm:text-[25px]">
                    <span className="sm:hidden">Commander</span>
                    <span className="hidden sm:inline">Personnalisez et commandez</span>
                  </h2>
                </div>

                <span className="shrink-0 text-[21px] font-extrabold">
                  {formatPriceDA(product.price)}
                </span>
              </div>
            </div>

            <div className="space-y-4 p-4 sm:space-y-5 sm:p-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Prénom" required>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    autoComplete="given-name"
                    className={inputClass}
                    placeholder="Votre prénom"
                  />
                </Field>

                <Field label="Nom" required>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    autoComplete="family-name"
                    className={inputClass}
                    placeholder="Votre nom"
                  />
                </Field>
              </div>

              <Field label="Téléphone" required>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  autoComplete="tel"
                  inputMode="tel"
                  className={inputClass}
                  placeholder="05 XX XX XX XX"
                />
              </Field>

              <Field label="Personnalisation" required={product.personalizable}>
                <textarea
                  value={personalization}
                  onChange={(e) => setPersonalization(e.target.value)}
                  required={product.personalizable}
                  rows={4}
                  className={`${inputClass} min-h-[110px] resize-y py-3`}
                  placeholder="Ex : Prénom Lina, date, message souhaité..."
                />
              </Field>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Wilaya" required>
                  <select
                    value={wilayaCode}
                    onChange={(e) => setWilayaCode(e.target.value)}
                    required
                    className={inputClass}
                  >
                    <option value="">Choisir une wilaya</option>
                    {wilayas.map((wilaya) => (
                      <option key={wilaya.code} value={wilaya.code}>
                        {String(wilaya.code).padStart(2, "0")} — {wilaya.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Commune" required>
                  <select
                    value={commune}
                    onChange={(e) => setCommune(e.target.value)}
                    required
                    disabled={!wilayaCode}
                    className={`${inputClass} disabled:bg-[#EFE8DF] disabled:text-[#251713]/30`}
                  >
                    <option value="">
                      {wilayaCode
                        ? "Choisir une commune"
                        : "Choisir d'abord la wilaya"}
                    </option>
                    {communes.map((item) => (
                      <option
                        key={`${item.name}-${item.nameAr}`}
                        value={item.name}
                      >
                        {item.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div>
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.06em] text-[#251713]/55">
                  Livraison *
                </span>

                <div className="grid grid-cols-2 gap-2.5">
                  <DeliveryChoice
                    active={deliveryType === "home"}
                    title="Domicile"
                    price={
                      deliveryType === "home" && deliveryFee !== null
                        ? formatPriceDA(deliveryFee)
                        : undefined
                    }
                    onClick={() => setDeliveryType("home")}
                  />

                  <DeliveryChoice
                    active={deliveryType === "office"}
                    title="Bureau"
                    price={
                      deliveryType === "office" && deliveryFee !== null
                        ? formatPriceDA(deliveryFee)
                        : undefined
                    }
                    onClick={() => setDeliveryType("office")}
                  />
                </div>
              </div>

              {deliveryType === "home" && (
                <Field label="Adresse" required>
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    autoComplete="street-address"
                    className={inputClass}
                    placeholder="Quartier, rue, numéro..."
                  />
                </Field>
              )}

              <div className="min-h-5 text-[10px]">
                {deliveryLoading ? (
                  <span className="text-[#251713]/45">
                    Calcul de la livraison…
                  </span>
                ) : deliveryMessage ? (
                  <span className="font-medium text-amber-800">
                    {deliveryMessage}
                  </span>
                ) : deliveryFee !== null ? (
                  <span className="font-semibold text-emerald-700">
                    Livraison : {formatPriceDA(deliveryFee)}
                  </span>
                ) : null}
              </div>

              <div className="rounded-[14px] border border-[#251713]/[0.08] bg-[#F7F1E8] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold">Quantité</span>

                  <div className="flex items-center overflow-hidden rounded-[9px] border border-[#251713]/10 bg-white">
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((value) => Math.max(1, value - 1))
                      }
                      className="flex h-9 w-9 items-center justify-center"
                    >
                      −
                    </button>
                    <span className="flex h-9 min-w-8 items-center justify-center border-x border-[#251713]/10 px-2 text-xs font-bold">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((value) => Math.min(10, value + 1))
                      }
                      className="flex h-9 w-9 items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="my-3 h-px bg-[#251713]/[0.08]" />

                <div className="space-y-2 text-[11px]">
                  <PriceRow label="Produit" value={formatPriceDA(subtotal)} />
                  <PriceRow
                    label="Livraison"
                    value={
                      deliveryLoading
                        ? "Calcul…"
                        : deliveryFee === null
                          ? "—"
                          : formatPriceDA(deliveryFee)
                    }
                  />
                </div>

                <div className="my-3 h-px bg-[#251713]/[0.08]" />

                <div className="flex items-end justify-between gap-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#8A6A20]">
                    Total
                  </span>
                  <span className="text-[26px] font-extrabold">
                    {total === null ? "—" : formatPriceDA(total)}
                  </span>
                </div>
              </div>

              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />

              {orderState.status === "error" && (
                <div className="rounded-[10px] border border-red-800/10 bg-red-50 p-3 text-[11px] font-medium text-red-800">
                  {orderState.message}
                </div>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className="flex min-h-[56px] w-full items-center justify-center rounded-[11px] bg-[#ECAB1C] px-5 text-[12px] font-extrabold uppercase tracking-[0.1em] text-[#251713] shadow-[0_12px_26px_rgba(236,171,28,0.24)] transition hover:bg-[#F1B82F] disabled:cursor-not-allowed disabled:bg-[#D8C8A3] disabled:text-[#251713]/45"
              >
                {orderState.status === "sending"
                  ? "Envoi en cours…"
                  : "Commander maintenant"}
              </button>
            </div>
          </form>
        </div>
      </section>

      {imageModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4"
          onClick={() => setImageModalOpen(false)}
        >
          <div
            className="relative w-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setImageModalOpen(false)}
              className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl font-bold shadow-lg"
            >
              ×
            </button>

            <div className="overflow-hidden rounded-[16px] bg-white">
              <div className="relative aspect-[4/3] bg-[#EFE6DA] sm:aspect-[16/10]">
                <Image
                  src={activeImage.src}
                  alt={activeImage.alt}
                  fill
                  className="object-contain"
                  sizes="100vw"
                />
              </div>
            </div>

            {product.images.length > 1 && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={`${image.src}-modal-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-16 w-16 overflow-hidden rounded-[9px] border-2 ${
                      selectedImage === index
                        ? "border-[#ECAB1C]"
                        : "border-white/30"
                    }`}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

const inputClass =
  "min-h-12 w-full rounded-[10px] border border-[#251713]/10 bg-white px-3.5 text-[13px] text-[#251713] outline-none transition placeholder:text-[#251713]/25 focus:border-[#ECAB1C] focus:ring-2 focus:ring-[#ECAB1C]/10";

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.055em] text-[#251713]/55">
        {label}
        {required && <span className="ml-1 text-[#A87406]">*</span>}
      </span>
      {children}
    </label>
  );
}

function DeliveryChoice({
  active,
  title,
  price,
  onClick,
}: {
  active: boolean;
  title: string;
  price?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[11px] border p-3.5 text-left transition ${
        active
          ? "border-[#ECAB1C] bg-[#FFF8E8]"
          : "border-[#251713]/10 bg-white"
      }`}
    >
      <p className="text-[11px] font-bold">{title}</p>
      {price && (
        <p className="mt-1 text-[10px] font-extrabold text-[#8A6A20]">
          {price}
        </p>
      )}
    </button>
  );
}

function PriceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[#251713]/48">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
