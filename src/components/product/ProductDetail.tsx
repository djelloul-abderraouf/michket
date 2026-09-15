"use client";

/**
 * MICHKET PRODUCT DETAIL — VERSION GALERIE
 * VERSION MOBILE DIRECTE : photo -> titre -> prix -> formulaire.
 * Gauche : produit + galerie uniquement.
 * Droite : formulaire de commande uniquement.
 */

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getCommunes,
  getDeliveryRate,
  getWilayas,
  setGuestOrderAccessToken,
  type ApiCommune,
  type ApiWilaya,
  type Product,
  type ProductVariant,
} from "@/lib/api";
import { useCart } from "@/contexts/CartContext";

interface ProductDetailProps {
  product: Product;
  relatedProducts?: Product[];
  /**
   * Compatibilité temporaire avec la page produit actuelle.
   * Les données de cette prop ne sont plus utilisées : les wilayas et communes
   * sont maintenant chargées exclusivement depuis le backend Yalidine.
   */
  wilayas?: unknown;
}

type DeliveryType = "home" | "office";

type OrderState =
  | { status: "idle" }
  | { status: "sending" }
  | { status: "error"; message: string };

function formatPriceDA(price: number): string {
  return `${new Intl.NumberFormat("fr-DZ", {
    minimumFractionDigits: Number.isInteger(price) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(price)} DA`;
}

export function ProductDetail({ product, relatedProducts = [] }: ProductDetailProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariant | null>(null);

  // Keep the complete gallery visible at all times.
  // Choosing a color only changes the large/main image.
  const galleryImages = product.images;

  const [cartMessage, setCartMessage] = useState<string | null>(null);

  function handleVariantSelect(variant: ProductVariant) {
    setSelectedVariant(variant);

    const variantImageIndex = product.images.findIndex(
      (image) => image.variantId === variant.id,
    );

    if (variantImageIndex >= 0) {
      setSelectedImage(variantImageIndex);
    }
  }

  // Auto-dismiss cart message after 3s
  useEffect(() => {
    if (!cartMessage) return;
    const timer = setTimeout(() => setCartMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [cartMessage]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [personalization, setPersonalization] = useState("");
  const [personalizationFields, setPersonalizationFields] = useState<Record<string, string>>({});

  const [wilayas, setWilayas] = useState<ApiWilaya[]>([]);
  const [wilayaCode, setWilayaCode] = useState("");
  const [wilayasLoading, setWilayasLoading] = useState(true);
  const [wilayasError, setWilayasError] = useState("");

  const [communes, setCommunes] = useState<ApiCommune[]>([]);
  const [communeId, setCommuneId] = useState("");
  const [communesLoading, setCommunesLoading] = useState(false);
  const [communesError, setCommunesError] = useState("");

  const [address, setAddress] = useState("");
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("home");

  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [deliveryMessage, setDeliveryMessage] = useState("");
  const [orderState, setOrderState] = useState<OrderState>({ status: "idle" });

  const selectedWilaya = useMemo(
    () =>
      wilayas.find((item) => String(item.code) === wilayaCode) ?? null,
    [wilayaCode, wilayas],
  );

  const selectedCommune = useMemo(
    () =>
      communes.find((item) => String(item.id) === communeId) ?? null,
    [communeId, communes],
  );

  const activeImage = galleryImages[selectedImage] ?? galleryImages[0];

  // A selected variant can override the base product price.
  // Example: product = 4 000 DA, red variant = 4 500 DA.
  const effectiveUnitPrice =
    selectedVariant?.price ?? product.price;

  const subtotal = effectiveUnitPrice * quantity;
  const total =
    deliveryFee === null
      ? null
      : subtotal + deliveryFee;

  /* --------------------------------------------------------------- */
  /* Yalidine locations                                              */
  /* --------------------------------------------------------------- */

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setWilayasLoading(true);
      setWilayasError("");

      try {
        const data = await getWilayas();

        if (!cancelled) {
          setWilayas(data);
        }
      } catch {
        if (!cancelled) {
          setWilayas([]);
          setWilayasError("Impossible de charger les wilayas Yalidine.");
        }
      } finally {
        if (!cancelled) {
          setWilayasLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    setCommunes([]);
    setCommuneId("");
    setCommunesError("");
    setDeliveryType("home");
    setDeliveryFee(null);
    setDeliveryMessage("");

    if (!wilayaCode) {
      setCommunesLoading(false);
      return () => {
        cancelled = true;
      };
    }

    const code = Number(wilayaCode);

    if (!Number.isInteger(code)) {
      setCommunesLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setCommunesLoading(true);

    (async () => {
      try {
        const data = await getCommunes(code);

        if (!cancelled) {
          setCommunes(data);
        }
      } catch {
        if (!cancelled) {
          setCommunes([]);
          setCommunesError("Impossible de charger les communes Yalidine.");
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

  /* --------------------------------------------------------------- */
  /* Exact Yalidine fee                                              */
  /* --------------------------------------------------------------- */

  useEffect(() => {
    let cancelled = false;

    setDeliveryFee(null);
    setDeliveryMessage("");

    if (!selectedWilaya || !selectedCommune) {
      setDeliveryLoading(false);
      return () => {
        cancelled = true;
      };
    }

    if (!selectedWilaya.available || !selectedCommune.available) {
      setDeliveryLoading(false);
      setDeliveryMessage("Livraison indisponible pour cette destination.");
      return () => {
        cancelled = true;
      };
    }

    if (deliveryType === "office" && !selectedCommune.hasStopDesk) {
      setDeliveryLoading(false);
      setDeliveryMessage(
        "La livraison en bureau Yalidine n'est pas disponible pour cette commune.",
      );
      return () => {
        cancelled = true;
      };
    }

    setDeliveryLoading(true);

    (async () => {
      try {
        const rate = await getDeliveryRate(
          selectedWilaya.code,
          selectedCommune.id,
          deliveryType,
        );

        if (!cancelled) {
          setDeliveryFee(rate.amountCents / 100);
        }
      } catch {
        if (!cancelled) {
          setDeliveryFee(null);
                setDeliveryMessage(
            "Impossible de calculer le tarif Yalidine pour cette livraison.",
          );
        }
      } finally {
        if (!cancelled) {
          setDeliveryLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedWilaya, selectedCommune, deliveryType]);

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

    if (
      product.variants &&
      product.variants.length > 0 &&
      !selectedVariant
    ) {
      setOrderState({
        status: "error",
        message: "Sélectionnez une variante avant de commander.",
      });
      return;
    }

    if (
      !selectedWilaya ||
      !selectedCommune ||
      !selectedCommune.available ||
      (deliveryType === "office" && !selectedCommune.hasStopDesk) ||
      deliveryFee === null
    ) {
      setOrderState({
        status: "error",
        message:
          "Sélectionnez votre wilaya, votre commune et un mode de livraison Yalidine disponible.",
      });
      return;
    }

    setOrderState({ status: "sending" });
    const formData = new FormData(event.currentTarget);

    // Serialize personalization: FREE → raw string, OPTIONS → field:value pairs
    let personalizationValue = "";
    if (isFreeMode) {
      personalizationValue = personalization;
    } else if (isOptionsMode && config.fields) {
      const parts = config.fields
        .map((field) => {
          const val = personalizationFields[field.id] ?? "";
          return val.trim() ? `${field.label}: ${val}` : "";
        })
        .filter(Boolean);
      personalizationValue = parts.join("\n");
    }

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug: product.slug,
          variantId: selectedVariant?.id ?? null,
          quantity,
          firstName,
          lastName,
          phone,
          personalization: personalizationValue,
          wilayaCode: selectedWilaya.code,
          wilayaName: selectedWilaya.name,
          communeId: selectedCommune.id,
          commune: selectedCommune.name,
          address,
          deliveryType,
          website: formData.get("website") ?? "",
        }),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        reference?: string;
        guestAccessToken?: string;
        message?: string;
      };

      if (!response.ok || !data.ok || !data.reference) {
        throw new Error(data.message || "Impossible d'envoyer la commande.");
      }

      if (data.guestAccessToken) {
        setGuestOrderAccessToken(
          data.reference,
          data.guestAccessToken,
        );
      }

      router.replace(`/commande/${encodeURIComponent(data.reference)}`);
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

  // --- Personalization validation ---
  const config = product.personalizationConfig;
  const isFreeMode = config?.mode === "FREE";
  const isOptionsMode = config?.mode === "OPTIONS";

  // FREE: required comes from config.required
  const freeRequired = isFreeMode && config.required;

  // OPTIONS: check each field's own required
  function areOptionsFieldsValid(): boolean {
    if (!isOptionsMode || !config.fields) return true;
    return config.fields.every((field) => {
      if (!field.required) return true;
      const val = personalizationFields[field.id] ?? "";
      return val.trim().length > 0;
    });
  }

  const isPersonalizationValid =
    !product.personalizable ||
    (isFreeMode && (!freeRequired || Boolean(personalization.trim()))) ||
    (isOptionsMode && areOptionsFieldsValid()) ||
    (!isFreeMode && !isOptionsMode); // NONE or invalid → no validation needed

  // --- Add to cart handler ---
  async function handleAddToCart() {
    // Block if variants exist but none selected
    if (product.variants && product.variants.length > 0 && !selectedVariant) {
      setCartMessage("Veuillez sélectionner une option");
      return;
    }

    // Block if personalization is required but empty
    if (!isPersonalizationValid) {
      setCartMessage("Veuillez remplir la personnalisation");
      return;
    }

    // Build personalization payload for the backend
    let personalizationPayload: Record<string, unknown> | undefined;
    if (isFreeMode && personalization.trim()) {
      personalizationPayload = { text: personalization.trim() };
    } else if (isOptionsMode && config.fields) {
      const fields: Record<string, string> = {};
      for (const field of config.fields) {
        const val = personalizationFields[field.id] ?? "";
        if (val.trim()) fields[field.id] = val.trim();
      }
      if (Object.keys(fields).length > 0) {
        personalizationPayload = fields;
      }
    }

    const added = await addItem(
      {
        id: product.id,
        productId: product.id,
        slug: product.slug,
        title: product.title,
        price: effectiveUnitPrice,
        image:
          (selectedVariant
            ? product.images.find(
                (image) => image.variantId === selectedVariant.id,
              )?.src
            : undefined) ??
          product.images.find((image) => image.variantId === null)?.src ??
          product.images[0]?.src ??
          null,
        variantId: selectedVariant?.id,
        personalization: personalizationPayload,
      },
      quantity,
    );

    setCartMessage(
      added
        ? "Produit ajouté au panier"
        : "Impossible d'ajouter le produit au panier",
    );
  }

  const canSubmit =
    Boolean(firstName.trim()) &&
    Boolean(lastName.trim()) &&
    (!product.variants ||
      product.variants.length === 0 ||
      Boolean(selectedVariant)) &&
    Boolean(phone.trim()) &&
    Boolean(selectedWilaya?.available) &&
    Boolean(selectedCommune?.available) &&
    (deliveryType === "home" || selectedCommune?.hasStopDesk === true) &&
    (deliveryType === "office" || Boolean(address.trim())) &&
    isPersonalizationValid &&
    !wilayasLoading &&
    !communesLoading &&
    !deliveryLoading &&
    deliveryFee !== null &&
    orderState.status !== "sending";

  const whatsappHref = `https://wa.me/213542638242?text=${encodeURIComponent(
    `Bonjour Michket, j'ai une question concernant le produit "${product.title}".`,
  )}`;

  return (
    <main className="min-h-screen bg-[#F7F1E8] pb-8 text-[#251713]">
      <style>{`
        @keyframes michketWhatsAppFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>

      <section className="mx-auto max-w-[1240px] px-3 py-3 sm:px-6 sm:py-8 lg:px-8">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-8">
          {/* ------------------------------------------------------ */}
          {/* PRODUIT / ARGUMENTAIRE                                */}
          {/* ------------------------------------------------------ */}
          <div className="space-y-3 sm:space-y-4 lg:sticky lg:top-5">
            {/* Image principale */}
            <button
              type="button"
              onClick={() => {
                if (activeImage) setImageModalOpen(true);
              }}
              disabled={!activeImage}
              className="group relative block w-full overflow-hidden rounded-[18px] border border-[#251713]/[0.07] bg-[#EDE3D7] shadow-[0_18px_45px_rgba(37,23,19,0.08)] disabled:cursor-default sm:rounded-[22px]"
            >
              <div className="relative aspect-[1/1.08] sm:aspect-square">
                {activeImage ? (
                  <Image
                    src={activeImage.src}
                    alt={activeImage.alt}
                    fill
                    priority
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.015]"
                    sizes="(max-width: 1023px) 100vw, 52vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[#251713]/25">
                    <svg
                      className="h-12 w-12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.3}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 6.75A2.25 2.25 0 016 4.5h12a2.25 2.25 0 012.25 2.25v10.5A2.25 2.25 0 0118 19.5H6a2.25 2.25 0 01-2.25-2.25V6.75z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 15l4.72-4.72a1.5 1.5 0 012.12 0L15 14.69m-1.5-1.5 1.22-1.22a1.5 1.5 0 012.12 0L20.25 15.38"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {activeImage && (
                <span className="absolute bottom-3 right-3 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold shadow">
                  Voir en grand
                </span>
              )}
            </button>

            {/* Miniatures : visibles aussi sur mobile */}
            {galleryImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-5 sm:overflow-visible sm:pb-0">
                {galleryImages.map((image, index) => (
                  <button
                    key={`${image.src}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-[68px] w-[68px] shrink-0 overflow-hidden rounded-[10px] border-2 bg-[#EDE3D7] sm:h-auto sm:w-auto ${
                      selectedImage === index
                        ? "border-[#ECAB1C]"
                        : "border-transparent"
                    }`}
                  >
                    <div className="relative h-full w-full sm:aspect-square">
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

            {/* Choix de couleur : juste après les photos */}
            {product.variants && product.variants.length > 0 && (
              <div className="rounded-[14px] border border-[#251713]/[0.08] bg-white p-4 shadow-[0_10px_28px_rgba(37,23,19,0.04)]">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#251713]/55">
                      Choisissez la couleur
                    </p>
                    <p className="mt-1 text-[11px] leading-5 text-[#251713]/45">
                      Les couleurs définies dans l&apos;admin s&apos;affichent ici automatiquement.
                    </p>
                  </div>

                  {selectedVariant && (
                    <span className="shrink-0 rounded-full bg-[#FFF4D5] px-2.5 py-1 text-[10px] font-extrabold text-[#8A6200]">
                      {selectedVariant.colorName || selectedVariant.name}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => {
                    const label =
                      variant.colorName || variant.name;
                    const isSelected =
                      selectedVariant?.id === variant.id;

                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() =>
                          handleVariantSelect(variant)
                        }
                        title={label}
                        aria-label={`Choisir ${label}`}
                        aria-pressed={isSelected}
                        className={[
                          "inline-flex min-h-11 items-center gap-2 rounded-full border px-3 py-2 text-left transition",
                          isSelected
                            ? "border-[#ECAB1C] bg-[#FFF8E8] shadow-[0_0_0_3px_rgba(236,171,28,0.12)]"
                            : "border-[#251713]/10 bg-white hover:border-[#251713]/25 hover:bg-[#FCFAF6]",
                        ].join(" ")}
                      >
                        <span
                          className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full border border-black/10 bg-[#E7DED3]"
                          aria-hidden="true"
                        >
                          {variant.isMulticolor ? (
                            <span
                              className="absolute inset-0"
                              style={{
                                background:
                                  "conic-gradient(from 0deg, #FF3B30, #FF9500, #FFCC00, #34C759, #00C7BE, #007AFF, #5856D6, #AF52DE, #FF2D55, #FF3B30)",
                              }}
                            />
                          ) : variant.colorHex ? (
                            <span
                              className="absolute inset-0"
                              style={{
                                backgroundColor:
                                  variant.colorHex,
                              }}
                            />
                          ) : null}
                        </span>

                        <span className="max-w-[140px] truncate text-[11px] font-bold text-[#251713]">
                          {label}
                        </span>

                        {isSelected ? (
                          <span
                            className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#ECAB1C] text-[10px] font-black text-[#251713]"
                            aria-hidden="true"
                          >
                            ✓
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>

                <p className="mt-3 text-[10px] leading-4 text-[#251713]/35">
                  Rouge, vert, bleu, rose, bleu ciel, jaune, blanc, multicolore et les couleurs personnalisées sont gérés avec les données de la variante.
                </p>
              </div>
            )}

            {/* Informations principales */}
            <div className="rounded-[18px] border border-[#251713]/[0.07] bg-white p-4 shadow-[0_12px_35px_rgba(37,23,19,0.05)] sm:p-6">
              {product.badge && (
                <span className="inline-flex rounded-full bg-[#FFF4D5] px-3 py-1 text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#8A6200]">
                  {product.badge}
                </span>
              )}

              <h1 className="mt-2 font-body text-[26px] font-semibold leading-[1.08] tracking-[-0.04em] sm:text-[36px]">
                {product.title}
              </h1>

              <div className="mt-3 flex flex-wrap items-end gap-3">
                <span className="text-[29px] font-extrabold tracking-[-0.04em] sm:text-[32px]">
                  {formatPriceDA(effectiveUnitPrice)}
                </span>

                {product.compareAtPrice &&
                  product.compareAtPrice > effectiveUnitPrice && (
                    <span className="pb-1 text-sm text-[#251713]/30 line-through">
                      {formatPriceDA(product.compareAtPrice)}
                    </span>
                  )}
              </div>

              <p className="mt-3 text-[13px] leading-6 text-[#251713]/58">
                {product.description}
              </p>

              <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById("michket-order-form")
                      ?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      })
                  }
                  className="flex min-h-[52px] items-center justify-center rounded-[11px] bg-[#ECAB1C] px-5 text-[12px] font-extrabold uppercase tracking-[0.08em] text-[#251713] shadow-[0_10px_24px_rgba(236,171,28,0.24)] transition hover:bg-[#F1B82F]"
                >
                  Commander maintenant
                </button>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex min-h-[52px] items-center justify-center rounded-[11px] border-2 border-[#251713] bg-white px-5 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#251713] transition hover:bg-[#251713] hover:text-white"
                >
                  Ajouter au panier
                </button>
              </div>

              {cartMessage && (
                <p
                  className={`mt-2 text-center text-[11px] font-semibold ${
                    cartMessage.includes("ajouté")
                      ? "text-emerald-700"
                      : "text-red-700"
                  }`}
                >
                  {cartMessage}
                </p>
              )}
            </div>
          </div>

          {/* ------------------------------------------------------ */}
          {/* FORMULAIRE DE COMMANDE                                */}
          {/* ------------------------------------------------------ */}
          <form
            id="michket-order-form"
            onSubmit={handleSubmit}
            className="scroll-mt-4 overflow-hidden rounded-[18px] border border-[#251713]/[0.08] bg-[#FFFCF8] shadow-[0_18px_45px_rgba(37,23,19,0.08)] sm:rounded-[22px]"
          >
            <div className="h-1.5 bg-[#ECAB1C]" />

            <div className="border-b border-[#251713]/[0.07] bg-white p-4 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#8A6A20]">
                    Commande rapide
                  </p>
                  <h2 className="mt-1 font-body text-[24px] font-semibold tracking-[-0.04em] sm:text-[28px]">
                    Commandez en quelques étapes
                  </h2>
                  <p className="mt-1 text-[11px] leading-5 text-[#251713]/45">
                    Remplissez vos informations, choisissez la livraison puis confirmez.
                  </p>
                </div>

                <span className="shrink-0 rounded-full bg-[#FFF4D5] px-3 py-1.5 text-[12px] font-extrabold text-[#8A6200]">
                  {formatPriceDA(effectiveUnitPrice)}
                </span>
              </div>
            </div>

            <div className="space-y-5 p-4 sm:p-6">
              {/* Étape 1 */}
              <FormSection
                number="1"
                title="Vos informations"
                subtitle="Pour confirmer et livrer votre commande."
              >
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
              </FormSection>

              {/* Étape 2 : personnalisation uniquement si nécessaire */}
              {(isFreeMode || isOptionsMode || product.personalizable) && (
                <FormSection
                  number="2"
                  title="Personnalisation"
                  subtitle="Indiquez exactement ce que vous souhaitez."
                >
                  {isFreeMode && (
                    <Field label={config.label} required={config.required}>
                      <textarea
                        value={personalization}
                        onChange={(e) => setPersonalization(e.target.value)}
                        required={config.required}
                        maxLength={config.maxLength}
                        rows={4}
                        className={`${inputClass} min-h-[105px] resize-y py-3`}
                        placeholder={config.placeholder}
                      />
                      {config.maxLength > 0 && (
                        <span className="mt-1 block text-right text-[9px] text-[#251713]/30">
                          {personalization.length}/{config.maxLength}
                        </span>
                      )}
                    </Field>
                  )}

                  {isOptionsMode && config.fields && (
                    <div className="space-y-3">
                      {config.fields.map((field) => {
                        if (field.type === "SELECT" && field.options) {
                          return (
                            <Field
                              key={field.id}
                              label={field.label}
                              required={field.required}
                            >
                              <select
                                value={personalizationFields[field.id] ?? ""}
                                onChange={(e) =>
                                  setPersonalizationFields((prev) => ({
                                    ...prev,
                                    [field.id]: e.target.value,
                                  }))
                                }
                                required={field.required}
                                className={inputClass}
                              >
                                <option value="">Choisir…</option>
                                {field.options.map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            </Field>
                          );
                        }

                        return (
                          <Field
                            key={field.id}
                            label={field.label}
                            required={field.required}
                          >
                            <input
                              type="text"
                              value={personalizationFields[field.id] ?? ""}
                              onChange={(e) =>
                                setPersonalizationFields((prev) => ({
                                  ...prev,
                                  [field.id]: e.target.value,
                                }))
                              }
                              required={field.required}
                              maxLength={field.maxLength}
                              className={inputClass}
                              placeholder={field.placeholder ?? ""}
                            />
                          </Field>
                        );
                      })}
                    </div>
                  )}

                  {product.personalizable && !isFreeMode && !isOptionsMode && (
                    <div className="rounded-[10px] border border-[#251713]/[0.08] bg-[#F7F1E8] px-4 py-3 text-[11px] text-[#251713]/50">
                      Configuration de personnalisation indisponible.
                    </div>
                  )}
                </FormSection>
              )}

              {/* Livraison */}
              <FormSection
                number={product.personalizable ? "3" : "2"}
                title="Livraison"
                subtitle="Le tarif se calcule automatiquement."
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Wilaya" required>
                    <select
                      value={wilayaCode}
                      onChange={(e) => setWilayaCode(e.target.value)}
                      required
                      disabled={wilayasLoading || Boolean(wilayasError)}
                      className={`${inputClass} disabled:bg-[#EFE8DF] disabled:text-[#251713]/30`}
                    >
                      <option value="">
                        {wilayasLoading
                          ? "Chargement des wilayas…"
                          : "Choisir une wilaya"}
                      </option>

                      {wilayas.map((wilaya) => (
                        <option
                          key={wilaya.code}
                          value={wilaya.code}
                          disabled={!wilaya.available}
                        >
                          {String(wilaya.code).padStart(2, "0")} — {wilaya.name}
                          {!wilaya.available ? " (Indisponible)" : ""}
                        </option>
                      ))}
                    </select>

                    {wilayasError && (
                      <span className="mt-1 block text-[10px] font-medium text-red-700">
                        {wilayasError}
                      </span>
                    )}
                  </Field>

                  <Field label="Commune" required>
                    <select
                      value={communeId}
                      onChange={(e) => {
                        const nextId = e.target.value;
                        const nextCommune =
                          communes.find(
                            (item) => String(item.id) === nextId,
                          ) ?? null;

                        setCommuneId(nextId);

                        if (
                          deliveryType === "office" &&
                          nextCommune?.hasStopDesk !== true
                        ) {
                          setDeliveryType("home");
                        }
                      }}
                      required
                      disabled={
                        !wilayaCode ||
                        communesLoading ||
                        Boolean(communesError)
                      }
                      className={`${inputClass} disabled:bg-[#EFE8DF] disabled:text-[#251713]/30`}
                    >
                      <option value="">
                        {!wilayaCode
                          ? "Choisir d'abord la wilaya"
                          : communesLoading
                            ? "Chargement des communes…"
                            : "Choisir une commune"}
                      </option>

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

                    {communesError && (
                      <span className="mt-1 block text-[10px] font-medium text-red-700">
                        {communesError}
                      </span>
                    )}
                  </Field>
                </div>

                <div>
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.06em] text-[#251713]/55">
                    Mode de livraison *
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
                      disabled={!selectedCommune?.available}
                      onClick={() => setDeliveryType("home")}
                    />

                    <DeliveryChoice
                      active={deliveryType === "office"}
                      title="Bureau Yalidine"
                      price={
                        deliveryType === "office" && deliveryFee !== null
                          ? formatPriceDA(deliveryFee)
                          : undefined
                      }
                      disabled={
                        !selectedCommune?.available ||
                        selectedCommune?.hasStopDesk !== true
                      }
                      unavailableText={
                        selectedCommune &&
                        selectedCommune.hasStopDesk !== true
                          ? "Indisponible"
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
              </FormSection>

              {/* Total et CTA */}
              <FormSection
                number={product.personalizable ? "4" : "3"}
                title="Votre total"
                subtitle="Vous paierez ce montant à la livraison."
              >
                <div className="rounded-[14px] border border-[#251713]/[0.08] bg-[#F7F1E8] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold">
                      Quantité
                    </span>

                    <div className="flex items-center overflow-hidden rounded-[9px] border border-[#251713]/10 bg-white">
                      <button
                        type="button"
                        onClick={() =>
                          setQuantity((value) => Math.max(1, value - 1))
                        }
                        className="flex h-10 w-10 items-center justify-center text-lg"
                        aria-label="Diminuer la quantité"
                      >
                        −
                      </button>

                      <span className="flex h-10 min-w-10 items-center justify-center border-x border-[#251713]/10 px-2 text-xs font-bold">
                        {quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setQuantity((value) => Math.min(10, value + 1))
                        }
                        className="flex h-10 w-10 items-center justify-center text-lg"
                        aria-label="Augmenter la quantité"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="my-3 h-px bg-[#251713]/[0.08]" />

                  <div className="space-y-2 text-[12px]">
                    <PriceRow
                      label="Produit"
                      value={formatPriceDA(subtotal)}
                    />

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
                    <span className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#8A6A20]">
                      Total à payer
                    </span>

                    <span className="text-[30px] font-extrabold tracking-[-0.04em]">
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
                  className="flex min-h-[58px] w-full items-center justify-center rounded-[12px] bg-[#ECAB1C] px-5 text-[13px] font-extrabold uppercase tracking-[0.09em] text-[#251713] shadow-[0_14px_30px_rgba(236,171,28,0.28)] transition hover:bg-[#F1B82F] disabled:cursor-not-allowed disabled:bg-[#D8C8A3] disabled:text-[#251713]/45"
                >
                  {orderState.status === "sending"
                    ? "Envoi en cours…"
                    : "Commander maintenant"}
                </button>

                <div className="flex items-center justify-center gap-2 text-center text-[10px] font-medium text-[#251713]/45">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                  Paiement à la livraison · confirmation de commande
                </div>
              </FormSection>
            </div>
          </form>
        </div>
      </section>

      {/* Réassurance : placée tout en bas, juste avant les produits suggérés */}
      <section className="mx-auto max-w-[1240px] px-3 pb-4 sm:px-6 sm:pb-6 lg:px-8">
        <div className="grid grid-cols-3 gap-2 rounded-[18px] border border-[#251713]/[0.07] bg-white p-3 shadow-[0_12px_30px_rgba(37,23,19,0.04)] sm:gap-3 sm:p-4">
          <TrustPoint
            title="Paiement"
            text="À la livraison"
            icon={
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 9h18M7 15h3" />
              </svg>
            }
          />

          <TrustPoint
            title="Livraison"
            text="Tarif calculé"
            icon={
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" />
                <circle cx="7" cy="18" r="2" />
                <circle cx="17" cy="18" r="2" />
              </svg>
            }
          />

          <TrustPoint
            title="Commande"
            text="Confirmation"
            icon={
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M5 12l4 4L19 6" />
              </svg>
            }
          />
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="mx-auto mt-2 max-w-[1240px] px-3 pb-6 sm:px-6 sm:pb-10 lg:px-8">
          <div className="rounded-[20px] border border-[#251713]/[0.07] bg-white p-4 shadow-[0_14px_36px_rgba(37,23,19,0.05)] sm:p-6">
            <div className="mb-4">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#8A6A20]">
                Vous aimerez aussi
              </p>
              <h2 className="mt-1 font-body text-[22px] font-semibold tracking-[-0.035em] sm:text-[27px]">
                Découvrez aussi ces produits
              </h2>
            </div>

            <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-4">
              {relatedProducts.slice(0, 4).map((related) => {
                const relatedImage =
                  related.images.find((image) => image.variantId === null) ??
                  related.images[0];

                return (
                  <Link
                    key={related.id}
                    href={`/produits/${related.slug}`}
                    className="group w-[72vw] max-w-[260px] shrink-0 overflow-hidden rounded-[15px] border border-[#251713]/[0.08] bg-[#FFFCF8] transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(37,23,19,0.08)] sm:w-auto sm:max-w-none"
                  >
                    <div className="relative aspect-square bg-[#EDE3D7]">
                      {relatedImage ? (
                        <Image
                          src={relatedImage.src}
                          alt={relatedImage.alt || related.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                          sizes="(max-width: 639px) 72vw, (max-width: 1023px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-[#251713]/30">
                          Image indisponible 
                        </div>
                      )}
                    </div>

                    <div className="p-3.5">
                      <h3 className="line-clamp-2 min-h-10 text-[13px] font-bold leading-5 text-[#251713]">
                        {related.title}
                      </h3>

                      <div className="mt-2 flex items-end justify-between gap-2">
                        <span className="text-[15px] font-extrabold text-[#251713]">
                          {formatPriceDA(related.price)}
                        </span>

                        <span className="text-[10px] font-bold text-[#8A6A20]">
                          Voir
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* WhatsApp flottant : reste visible pendant le scroll */}
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contacter Michket sur WhatsApp"
        title="Besoin d'aide ? Écrivez-nous sur WhatsApp"
        className="fixed bottom-5 right-4 z-[90] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_rgba(0,0,0,0.22)] ring-4 ring-white/80 transition hover:scale-105 sm:bottom-6 sm:right-6 sm:h-16 sm:w-16"
        style={{
          animation: "michketWhatsAppFloat 3s ease-in-out infinite",
        }}
      >
        <svg
          viewBox="0 0 32 32"
          className="h-7 w-7 sm:h-8 sm:w-8"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M16 4.2C9.5 4.2 4.2 9.3 4.2 15.7c0 2 .5 4 1.5 5.7L4 27.8l6.6-1.7c1.7.9 3.5 1.3 5.4 1.3 6.5 0 11.8-5.1 11.8-11.5S22.5 4.2 16 4.2Z"
            fill="currentColor"
          />
          <path
            d="M12.2 10.1c-.3-.7-.6-.7-.9-.7h-.8c-.3 0-.7.1-1 .5-.4.5-1.4 1.4-1.4 3.3 0 2 1.5 3.8 1.7 4.1.2.3 2.8 4.4 7 6 3.5 1.3 4.2 1 5 .9.8-.1 2.5-1 2.9-2 .4-1 .4-1.8.3-2-.1-.2-.4-.3-.9-.6l-3-1.4c-.4-.2-.7-.3-1 .3l-1.3 1.6c-.2.3-.5.3-.9.1-.4-.2-1.8-.6-3.4-2-1.3-1.1-2.1-2.5-2.4-2.9-.2-.4 0-.6.2-.8l.7-.8c.2-.2.3-.4.4-.7.1-.3.1-.5 0-.8l-1.2-2.9Z"
            fill="#25D366"
          />
        </svg>
        <span className="absolute -left-1 -top-1 h-3 w-3 rounded-full bg-white/90 shadow" />
      </a>

      {/* Galerie plein écran */}
      {imageModalOpen && activeImage && (
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
              aria-label="Fermer l'image"
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

            {galleryImages.length > 1 && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {galleryImages.map((image, index) => (
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
  disabled = false,
  unavailableText,
  onClick,
}: {
  active: boolean;
  title: string;
  price?: string;
  disabled?: boolean;
  unavailableText?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-[11px] border p-3.5 text-left transition ${
        disabled
          ? "cursor-not-allowed border-[#251713]/[0.06] bg-[#EFE8DF] text-[#251713]/35"
          : active
            ? "border-[#ECAB1C] bg-[#FFF8E8]"
            : "border-[#251713]/10 bg-white"
      }`}
    >
      <p className="text-[11px] font-bold">{title}</p>
      {price && !disabled && (
        <p className="mt-1 text-[10px] font-extrabold text-[#8A6A20]">
          {price}
        </p>
      )}
      {unavailableText && disabled && (
        <p className="mt-1 text-[9px] font-semibold">
          {unavailableText}
        </p>
      )}
    </button>
  );
}

function TrustPoint({
  title,
  text,
  icon,
}: {
  title: string;
  text: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-[11px] border border-[#251713]/[0.07] bg-[#FAF6F0] px-2 py-3 text-center">
      <div className="mx-auto flex h-7 w-7 items-center justify-center text-[#8A6A20]">
        {icon}
      </div>
      <p className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.06em] text-[#251713]/60">
        {title}
      </p>
      <p className="mt-0.5 text-[9px] leading-4 text-[#251713]/45">
        {text}
      </p>
    </div>
  );
}

function FormSection({
  number,
  title,
  subtitle,
  children,
}: {
  number: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[15px] border border-[#251713]/[0.07] bg-white p-4 sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#ECAB1C] text-[11px] font-extrabold text-[#251713]">
          {number}
        </span>

        <div>
          <h3 className="text-[13px] font-extrabold text-[#251713]">
            {title}
          </h3>
          <p className="mt-0.5 text-[10px] leading-4 text-[#251713]/45">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {children}
      </div>
    </section>
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
