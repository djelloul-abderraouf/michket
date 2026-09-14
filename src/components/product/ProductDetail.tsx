"use client";

/**
 * MICHKET PRODUCT DETAIL — VERSION GALERIE
 * VERSION MOBILE DIRECTE : photo -> titre -> prix -> formulaire.
 * Gauche : produit + galerie uniquement.
 * Droite : formulaire de commande uniquement.
 */

import Image from "next/image";
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

export function ProductDetail({ product }: ProductDetailProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariant | null>(null);

  // Filter images by selected variant, fallback to general images (variantId=null)
  const filteredImages = useMemo(() => {
    if (!selectedVariant) {
      const generalImages = product.images.filter(
        (img) => img.variantId === null,
      );

      return generalImages.length > 0 ? generalImages : product.images;
    }

    const variantImages = product.images.filter(
      (img) => img.variantId === selectedVariant.id,
    );

    if (variantImages.length === 0) {
      const generalImages = product.images.filter(
        (img) => img.variantId === null,
      );

      return generalImages.length > 0 ? generalImages : product.images;
    }

    return variantImages;
  }, [product.images, selectedVariant]);

  const [cartMessage, setCartMessage] = useState<string | null>(null);

  // Reset image selection when variant changes
  useEffect(() => {
    setSelectedImage(0);
  }, [selectedVariant]);

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

  const activeImage = filteredImages[selectedImage] ?? filteredImages[0];

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
        image: filteredImages[0]?.src ?? null,
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

  return (
    <main className="min-h-screen bg-[#F7F1E8] text-[#251713]">
      <section className="mx-auto max-w-[1240px] px-3 py-3 sm:px-6 sm:py-8 lg:px-8">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.04fr_0.96fr] lg:items-start lg:gap-8">
          {/* GALERIE PRODUIT */}
          <div className="lg:sticky lg:top-6">
            <button
              type="button"
              onClick={() => {
                if (activeImage) setImageModalOpen(true);
              }}
              disabled={!activeImage}
              className="group relative block w-full overflow-hidden rounded-[18px] border border-[#251713]/[0.07] bg-[#EDE3D7] shadow-[0_18px_45px_rgba(37,23,19,0.08)] disabled:cursor-default"
            >
              <div className="relative aspect-[4/4.6] sm:aspect-square">
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

            {/* Color swatches */}
            {product.variants && product.variants.length > 0 && (
              <div className="mt-3 flex items-center gap-2 sm:mt-4">
                <span className="text-[10px] font-semibold text-[#251713]/45 sm:text-[11px]">
                  Couleur :
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariant(variant)}
                      title={variant.colorName || variant.name}
                      className={`relative h-8 w-8 rounded-full border-2 transition ${
                        selectedVariant?.id === variant.id
                          ? "border-[#ECAB1C] ring-2 ring-[#ECAB1C]/20"
                          : "border-[#251713]/10 hover:border-[#251713]/25"
                      }`}
                    >
                      {variant.isMulticolor ? (
                        <span
                          className="absolute inset-1 rounded-full"
                          style={{
                            background:
                              "conic-gradient(from 0deg, #FF3B30, #FF9500, #FFCC00, #34C759, #00C7BE, #007AFF, #5856D6, #AF52DE, #FF2D55, #FF3B30)",
                          }}
                          aria-hidden="true"
                        />
                      ) : variant.colorHex ? (
                        <span
                          className="absolute inset-1 rounded-full"
                          style={{
                            backgroundColor: variant.colorHex,
                          }}
                          aria-hidden="true"
                        />
                      ) : (
                        <span
                          className="absolute inset-1 rounded-full bg-[#E7DED3]"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {filteredImages.length > 1 && (
              <div className="mt-3 hidden grid-cols-4 gap-2 sm:grid sm:grid-cols-5">
                {filteredImages.map((image, index) => (
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
                  {formatPriceDA(effectiveUnitPrice)}
                </span>

                {product.compareAtPrice &&
                  product.compareAtPrice > effectiveUnitPrice && (
                    <span className="pb-1 text-sm text-[#251713]/30 line-through">
                      {formatPriceDA(product.compareAtPrice)}
                    </span>
                  )}
              </div>

              <p className="mt-2 hidden text-[10px] font-semibold text-[#8A6A20] sm:block">
                Paiement à la livraison
              </p>

              <button
                type="button"
                onClick={handleAddToCart}
                className="mt-4 flex min-h-[48px] w-full items-center justify-center rounded-[11px] border-2 border-[#251713] bg-[#251713] px-5 text-[11px] font-extrabold uppercase tracking-[0.1em] text-white transition hover:bg-[#3D2A24]"
              >
                Ajouter au panier
              </button>

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
                  {formatPriceDA(effectiveUnitPrice)}
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

              {/* ── Personalization ── */}

              {/* FREE mode: single textarea */}
              {isFreeMode && (
                <Field label={config.label} required={config.required}>
                  <textarea
                    value={personalization}
                    onChange={(e) => setPersonalization(e.target.value)}
                    required={config.required}
                    maxLength={config.maxLength}
                    rows={4}
                    className={`${inputClass} min-h-[110px] resize-y py-3`}
                    placeholder={config.placeholder}
                  />
                  {config.maxLength > 0 && (
                    <span className="mt-1 block text-right text-[9px] text-[#251713]/30">
                      {personalization.length}/{config.maxLength}
                    </span>
                  )}
                </Field>
              )}

              {/* OPTIONS mode: render fields in backend order */}
              {isOptionsMode && config.fields && (
                <>
                  {config.fields.map((field) => {
                    if (field.type === "SELECT" && field.options) {
                      return (
                        <Field key={field.id} label={field.label} required={field.required}>
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

                    // TEXT field
                    return (
                      <Field key={field.id} label={field.label} required={field.required}>
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
                </>
              )}

              {/* NONE / config absente / config invalide */}
              {product.personalizable && !isFreeMode && !isOptionsMode && (
                <div className="rounded-[10px] border border-[#251713]/[0.08] bg-[#F7F1E8] px-4 py-3 text-[11px] text-[#251713]/50">
                  Configuration de personnalisation indisponible.
                </div>
              )}

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
                        ? "Chargement des wilayas Yalidine…"
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
                          ? "Chargement des communes Yalidine…"
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

            {filteredImages.length > 1 && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {filteredImages.map((image, index) => (
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

function PriceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[#251713]/48">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
