"use client";

/**
 * MICHKET PRODUCT DETAIL — VERSION GALERIE
 * VERSION MOBILE DIRECTE : photo -> titre -> prix -> formulaire.
 * Gauche : produit + galerie uniquement.
 * Droite : formulaire de commande uniquement.
 */

import Image, { getImageProps } from "next/image";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
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

function getArabicBadgeLabel(
  badge: string | null | undefined,
): string | null {
  if (!badge) return null;

  const labels: Record<string, string> = {
    BEST_SELLER: "الأكثر مبيعًا",
    NOUVEAU: "جديد",
    PROMO: "عرض",
    PERSONNALISABLE: "قابل للتخصيص",
    ENVOI_GRATUIT: "توصيل مجاني",
  };

  return labels[badge] ?? badge;
}

function localizeColorLabel(value: string): string {
  const normalized = value.trim().toLocaleLowerCase("fr");

  const labels: Record<string, string> = {
    rouge: "أحمر",
    vert: "أخضر",
    bleu: "أزرق",
    rose: "وردي",
    "bleu ciel": "أزرق سماوي",
    jaune: "أصفر",
    blanc: "أبيض",
    multicolore: "متعدد الألوان",
    multicolor: "متعدد الألوان",
  };

  return labels[normalized] ?? value;
}

function formatPriceDA(price: number): string {
  return `${new Intl.NumberFormat("ar-DZ", {
    minimumFractionDigits: Number.isInteger(price) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(price)} دج`;
}

const MAIN_IMAGE_SIZES = "(max-width: 1023px) 100vw, 52vw";

export function ProductDetail({ product }: ProductDetailProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariant | null>(null);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  // Keep the complete gallery visible at all times.
  // Choosing a color only changes the large/main image.
  const galleryImages = product.images;

  const [cartMessage, setCartMessage] = useState<string | null>(null);

  /**
   * The thumbnails are intentionally small, so the browser may only have a
   * 58–72 px optimized copy cached. When a color is selected, the main image
   * needs a much larger Next.js image candidate. Preload the exact responsive
   * candidates used by the main image so color changes feel immediate.
   */
  const preloadedVariantSources = useRef<Set<string>>(new Set());
  const preloadImagesRef = useRef<HTMLImageElement[]>([]);

  const variantImageSources = useMemo(() => {
    const sources = new Set<string>();

    for (const variant of product.variants ?? []) {
      const image = product.images.find(
        (candidate) => candidate.variantId === variant.id,
      );

      if (image?.src) {
        sources.add(image.src);
      }
    }

    return Array.from(sources);
  }, [product.images, product.variants]);

  const preloadVariantImage = useCallback((src: string) => {
    if (
      typeof window === "undefined" ||
      preloadedVariantSources.current.has(src)
    ) {
      return;
    }

    preloadedVariantSources.current.add(src);

    const { props } = getImageProps({
      src,
      alt: "",
      fill: true,
      sizes: MAIN_IMAGE_SIZES,
    });

    const preloadImage = new window.Image();

    if (typeof props.sizes === "string") {
      preloadImage.sizes = props.sizes;
    }

    if (typeof props.srcSet === "string") {
      preloadImage.srcset = props.srcSet;
    }

    if (typeof props.src === "string") {
      preloadImage.src = props.src;
    }

    // Keep references while requests are in flight.
    preloadImagesRef.current.push(preloadImage);
  }, []);

  const preloadAllVariantImages = useCallback(() => {
    for (const src of variantImageSources) {
      preloadVariantImage(src);
    }
  }, [preloadVariantImage, variantImageSources]);

  /*
   * Do not automatically preload every full-size variant image during the
   * initial page load. On a throttled mobile connection those requests can
   * compete with the main LCP image.
   *
   * Variant images are still preloaded immediately when the customer opens,
   * focuses or interacts with the color picker, and the selected variant is
   * explicitly warmed before switching the main image.
   */

  function handleVariantSelect(variant: ProductVariant) {
    setSelectedVariant(variant);

    const variantImageIndex = product.images.findIndex(
      (image) => image.variantId === variant.id,
    );

    if (variantImageIndex >= 0) {
      const variantImage = product.images[variantImageIndex];
      preloadVariantImage(variantImage.src);
      setSelectedImage(variantImageIndex);
    }

    setColorPickerOpen(false);
  }

  // Auto-dismiss cart message after 3s
  useEffect(() => {
    if (!cartMessage) return;
    const timer = setTimeout(() => setCartMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [cartMessage]);

  const [fullName, setFullName] = useState("");
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
          setWilayasError("تعذر تحميل ولايات ياليدين.");
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
          setCommunesError("تعذر تحميل بلديات ياليدين.");
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
      setDeliveryMessage("التوصيل غير متوفر لهذه الوجهة.");
      return () => {
        cancelled = true;
      };
    }

    if (deliveryType === "office" && !selectedCommune.hasStopDesk) {
      setDeliveryLoading(false);
      setDeliveryMessage(
        "التوصيل إلى مكتب ياليدين غير متوفر في هذه البلدية.",
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
            "تعذر حساب سعر التوصيل عبر ياليدين.",
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
        message: "اختر اللون أو الخيار المناسب قبل تأكيد الطلب.",
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
          "اختر الولاية والبلدية وطريقة توصيل متوفرة عبر ياليدين.",
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
          fullName,
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
        throw new Error(data.message || "تعذر إرسال الطلب.");
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
            : "تعذر إرسال الطلب.",
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
      setCartMessage("يرجى اختيار اللون أو الخيار المناسب");
      return;
    }

    // Block if personalization is required but empty
    if (!isPersonalizationValid) {
      setCartMessage("يرجى إدخال معلومات التخصيص المطلوبة");
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
        ? "تمت إضافة المنتج إلى السلة"
        : "تعذر إضافة المنتج إلى السلة",
    );
  }

  const canSubmit =
    fullName.trim().length >= 2 &&
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
    `مرحبًا Michket، لدي سؤال بخصوص المنتج "${product.title}".`,
  )}`;

  return (
    <>
      <style>{`
        .michket-arabic {
          font-synthesis: none;
        }

        .michket-arabic input,
        .michket-arabic textarea,
        .michket-arabic select,
        .michket-arabic button {
          font: inherit;
        }

        @keyframes michketWhatsAppFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>

      <section className="mx-auto w-full max-w-[1240px] px-3 py-3 sm:px-5 sm:py-6 md:px-6 lg:px-8 lg:py-8">
        <div className="grid min-w-0 gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1.04fr)_minmax(360px,0.96fr)] lg:items-start lg:gap-6 xl:gap-8">
          {/* ------------------------------------------------------ */}
          {/* PRODUIT / ARGUMENTAIRE                                */}
          {/* ------------------------------------------------------ */}
          <div className="min-w-0 space-y-3 sm:space-y-4 xl:sticky xl:top-5">
            {/* Image principale */}
            <button
              type="button"
              onClick={() => {
                if (activeImage) setImageModalOpen(true);
              }}
              disabled={!activeImage}
              className="group relative block w-full overflow-hidden rounded-[18px] border border-[#251713]/[0.07] bg-[#EDE3D7] shadow-[0_18px_45px_rgba(37,23,19,0.08)] disabled:cursor-default sm:rounded-[22px]"
            >
              <div className="relative aspect-square sm:aspect-[4/3] lg:aspect-square">
                {activeImage ? (
                  <Image
                    src={activeImage.src}
                    alt={activeImage.alt}
                    fill
                    loading="eager"
                    fetchPriority="high"
                    onLoad={() => {
                      if (galleryImages.length <= 1) return;

                      const nextImage =
                        galleryImages[
                          (selectedImage + 1) % galleryImages.length
                        ];
                      const previousImage =
                        galleryImages[
                          (selectedImage - 1 + galleryImages.length) %
                            galleryImages.length
                        ];

                      if (nextImage?.src) {
                        preloadVariantImage(nextImage.src);
                      }

                      if (
                        previousImage?.src &&
                        previousImage.src !== nextImage?.src
                      ) {
                        preloadVariantImage(previousImage.src);
                      }
                    }}
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.015]"
                    sizes={MAIN_IMAGE_SIZES}
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
                <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold shadow">
                  عرض الصورة بحجم أكبر
                </span>
              )}
            </button>

            {/* Miniatures : mobile inchangé, plus compactes sur PC */}
            {galleryImages.length > 1 && (
              <div className="-mx-0.5 flex snap-x gap-2 overflow-x-auto px-0.5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {galleryImages.map((image, index) => (
                  <button
                    key={`${image.src}-${index}`}
                    type="button"
                    onPointerEnter={() => preloadVariantImage(image.src)}
                    onPointerDown={() => preloadVariantImage(image.src)}
                    onFocus={() => preloadVariantImage(image.src)}
                    onClick={() => setSelectedImage(index)}
                    aria-label={`عرض الصورة ${index + 1}`}
                    className={`relative h-[72px] w-[72px] shrink-0 snap-start overflow-hidden rounded-[10px] border-2 bg-[#EDE3D7] transition sm:h-[68px] sm:w-[68px] lg:h-[58px] lg:w-[58px] xl:h-[62px] xl:w-[62px] ${
                      selectedImage === index
                        ? "border-[#ECAB1C] shadow-[0_0_0_2px_rgba(236,171,28,0.10)]"
                        : "border-transparent hover:border-[#251713]/15"
                    }`}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 639px) 72px, (max-width: 1023px) 68px, 62px"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Couleurs : sélecteur compact avec libellés toujours complets */}
            {product.variants && product.variants.length > 0 && (
              <div className="rounded-[12px] border border-[#251713]/[0.07] bg-white/95 p-2.5 shadow-[0_7px_18px_rgba(37,23,19,0.03)] sm:p-3">
                <button
                  type="button"
                  onPointerEnter={preloadAllVariantImages}
                  onFocus={preloadAllVariantImages}
                  onClick={() => {
                    if (!colorPickerOpen) {
                      preloadAllVariantImages();
                    }

                    setColorPickerOpen((value) => !value);
                  }}
                  aria-expanded={colorPickerOpen}
                  aria-controls="michket-color-options"
                  className={[
                    "flex min-h-11 w-full items-center justify-between gap-3 rounded-[10px] border px-3 py-2 text-right transition",
                    colorPickerOpen
                      ? "border-[#ECAB1C] bg-[#FFF8E8]"
                      : "border-[#251713]/10 bg-[#FFFCF8] hover:border-[#251713]/20 hover:bg-white",
                  ].join(" ")}
                >
                  <span className="flex min-w-0 flex-1 items-center gap-2.5">
                    <span
                      className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full border border-black/10 bg-[#E7DED3]"
                      aria-hidden="true"
                    >
                      {selectedVariant ? (
                        selectedVariant.isMulticolor ? (
                          <span
                            className="absolute inset-0"
                            style={{
                              background:
                                "conic-gradient(from 0deg, #FF3B30, #FF9500, #FFCC00, #34C759, #00C7BE, #007AFF, #5856D6, #AF52DE, #FF2D55, #FF3B30)",
                            }}
                          />
                        ) : selectedVariant.colorHex ? (
                          <span
                            className="absolute inset-0"
                            style={{
                              backgroundColor:
                                selectedVariant.colorHex,
                            }}
                          />
                        ) : (
                          <span className="absolute inset-0 bg-[#E7DED3]" />
                        )
                      ) : (
                        <span className="absolute inset-0 grid place-items-center text-[12px] font-black text-[#251713]/35">
                          +
                        </span>
                      )}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-[10px] font-extrabold text-[#251713]/55">
                        Choisir une couleur | اختر اللون
                      </span>
                      <span className="mt-0.5 block whitespace-normal break-words text-[11px] font-bold leading-4 text-[#251713]">
                        {selectedVariant
                          ? localizeColorLabel(
                              selectedVariant.colorName ||
                                selectedVariant.name,
                            )
                          : "اضغط لعرض الألوان المتوفرة"}
                      </span>
                    </span>
                  </span>

                  <svg
                    className={`h-4 w-4 shrink-0 text-[#251713]/45 transition-transform duration-200 ${
                      colorPickerOpen ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m6 9 6 6 6-6"
                    />
                  </svg>
                </button>

                {colorPickerOpen && (
                  <div
                    id="michket-color-options"
                    className="mt-2.5 grid grid-cols-2 gap-1.5 sm:grid-cols-3 sm:gap-2 xl:grid-cols-4"
                  >
                    {product.variants.map((variant) => {
                      const rawLabel =
                        variant.colorName || variant.name;
                      const label =
                        localizeColorLabel(rawLabel);
                      const isSelected =
                        selectedVariant?.id === variant.id;

                      return (
                        <button
                          key={variant.id}
                          type="button"
                          onPointerEnter={() => {
                            const image = product.images.find(
                              (candidate) =>
                                candidate.variantId === variant.id,
                            );

                            if (image?.src) {
                              preloadVariantImage(image.src);
                            }
                          }}
                          onFocus={() => {
                            const image = product.images.find(
                              (candidate) =>
                                candidate.variantId === variant.id,
                            );

                            if (image?.src) {
                              preloadVariantImage(image.src);
                            }
                          }}
                          onClick={() =>
                            handleVariantSelect(variant)
                          }
                          title={label}
                          aria-label={`اختيار ${label}`}
                          aria-pressed={isSelected}
                          className={[
                            "flex min-h-[42px] min-w-0 items-center gap-2 rounded-[9px] border px-2.5 py-1.5 text-right transition sm:min-h-[44px]",
                            isSelected
                              ? "border-[#ECAB1C] bg-[#FFF8E8] shadow-[0_0_0_1px_rgba(236,171,28,0.10)]"
                              : "border-[#251713]/10 bg-[#FFFCF8] hover:border-[#251713]/20 hover:bg-white",
                          ].join(" ")}
                        >
                          <span
                            className={[
                              "relative h-[18px] w-[18px] shrink-0 overflow-hidden rounded-full border bg-[#E7DED3] sm:h-5 sm:w-5",
                              isSelected
                                ? "border-[#ECAB1C] ring-2 ring-[#ECAB1C]/20"
                                : "border-black/10",
                            ].join(" ")}
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

                          <span className="min-w-0 flex-1 whitespace-normal break-words text-[9px] font-bold leading-4 text-[#251713] sm:text-[10px]">
                            {label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Informations principales */}
            <div className="rounded-[18px] border border-[#251713]/[0.07] bg-white p-4 shadow-[0_12px_35px_rgba(37,23,19,0.05)] sm:p-6">
              {product.badge && (
                <span className="inline-flex rounded-full bg-[#FFF4D5] px-3 py-1 text-[9px] font-extrabold tracking-[0.1em] text-[#8A6200]">
                  {getArabicBadgeLabel(product.badge)}
                </span>
              )}

              <h1 className="mt-2 text-[24px] font-semibold leading-[1.35] tracking-[-0.04em] sm:text-[36px]">
                {product.title}
              </h1>

              <div className="mt-3 flex flex-wrap items-end gap-3">
                <span className="text-[27px] font-extrabold tracking-[-0.04em] sm:text-[32px]">
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

              <div className="mt-5 grid gap-2.5 min-[460px]:grid-cols-2">
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
                  className="flex min-h-[52px] items-center justify-center rounded-[11px] bg-[#ECAB1C] px-5 text-[12px] font-extrabold tracking-[0.08em] text-[#251713] shadow-[0_10px_24px_rgba(236,171,28,0.24)] transition hover:bg-[#F1B82F]"
                >
                  اطلب الآن
                </button>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex min-h-[52px] items-center justify-center rounded-[11px] border-2 border-[#251713] bg-white px-5 text-[11px] font-extrabold tracking-[0.08em] text-[#251713] transition hover:bg-[#251713] hover:text-white"
                >
                  أضف إلى السلة
                </button>
              </div>

              {cartMessage && (
                <p
                  className={`mt-2 text-center text-[11px] font-semibold ${
                    cartMessage.includes("تمت إضافة")
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
              <div className="flex flex-col gap-3 min-[440px]:flex-row min-[440px]:items-start min-[440px]:justify-between">
                <div>
                  <p className="text-[9px] font-extrabold tracking-[0.14em] text-[#8A6A20]">
                    Commande rapide | طلب سريع
                  </p>
                  <h2 className="mt-1 text-[24px] font-semibold tracking-[-0.04em] sm:text-[28px]">
                    اطلب بسهولة في بضع خطوات
                  </h2>
                  <p className="mt-1 text-[11px] leading-5 text-[#251713]/45">
                    أدخل معلوماتك، اختر طريقة التوصيل ثم أكّد طلبك.
                  </p>
                </div>

                <span className="shrink-0 rounded-full bg-[#FFF4D5] px-3 py-1.5 text-[12px] font-extrabold text-[#8A6200]">
                  {formatPriceDA(effectiveUnitPrice)}
                </span>
              </div>
            </div>

            <div className="space-y-4 p-3 sm:space-y-5 sm:p-5 lg:p-6">
              {/* Étape 1 */}
              <FormSection
                number="1"
                title={<BilingualText fr="Vos informations" ar="معلوماتك" />}
                subtitle="نحتاجها لتأكيد الطلب وتوصيله إليك."
              >
                <Field
                  label={
                    <BilingualText
                      fr="Nom et prénom"
                      ar="الاسم واللقب"
                    />
                  }
                  required
                >
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    minLength={2}
                    maxLength={200}
                    autoComplete="name"
                    className={inputClass}
                    placeholder="اكتب الاسم واللقب"
                  />
                </Field>

                <Field label={<BilingualText fr="Téléphone" ar="رقم الهاتف" />} required>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    autoComplete="tel"
                    inputMode="tel"
                    dir="ltr"
                    className={`${inputClass} !text-left`}
                    placeholder="05 XX XX XX XX"
                  />
                </Field>
              </FormSection>

              {/* Étape 2 : personnalisation uniquement si nécessaire */}
              {(isFreeMode || isOptionsMode || product.personalizable) && (
                <FormSection
                  number="2"
                  title={<BilingualText fr="Personnalisation" ar="التخصيص" />}
                  subtitle="اكتب تفاصيل التخصيص كما تريدها بالضبط."
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
                                <option value="">اختر...</option>
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
                      إعدادات التخصيص غير متوفرة.
                    </div>
                  )}
                </FormSection>
              )}

              {/* Livraison */}
              <FormSection
                number={product.personalizable ? "3" : "2"}
                title={<BilingualText fr="Livraison" ar="التوصيل" />}
                subtitle="يُحسب سعر التوصيل تلقائيًا."
              >
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label={<BilingualText fr="Wilaya" ar="الولاية" />} required>
                    <select
                      value={wilayaCode}
                      onChange={(e) => setWilayaCode(e.target.value)}
                      required
                      disabled={wilayasLoading || Boolean(wilayasError)}
                      className={`${inputClass} disabled:bg-[#EFE8DF] disabled:text-[#251713]/30`}
                    >
                      <option value="">
                        {wilayasLoading
                          ? "جارٍ تحميل الولايات..."
                          : "اختر الولاية"}
                      </option>

                      {wilayas.map((wilaya) => (
                        <option
                          key={wilaya.code}
                          value={wilaya.code}
                          disabled={!wilaya.available}
                        >
                          {String(wilaya.code).padStart(2, "0")} — {wilaya.name}
                          {!wilaya.available ? " (غير متاح)" : ""}
                        </option>
                      ))}
                    </select>

                    {wilayasError && (
                      <span className="mt-1 block text-[10px] font-medium text-red-700">
                        {wilayasError}
                      </span>
                    )}
                  </Field>

                  <Field label={<BilingualText fr="Commune" ar="البلدية" />} required>
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
                          ? "اختر الولاية أولًا"
                          : communesLoading
                            ? "جارٍ تحميل البلديات..."
                            : "اختر البلدية"}
                      </option>

                      {communes.map((item) => (
                        <option
                          key={item.id}
                          value={item.id}
                          disabled={!item.available}
                        >
                          {item.name}
                          {!item.available ? " (غير متاح)" : ""}
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
                  <span className="mb-2 block text-[10px] font-bold tracking-[0.06em] text-[#251713]/55">
                    Mode de livraison | طريقة التوصيل *
                  </span>

                  <div className="grid grid-cols-1 gap-2.5 min-[430px]:grid-cols-2">
                    <DeliveryChoice
                      active={deliveryType === "home"}
                      title={<BilingualText fr="Domicile" ar="إلى المنزل" />}
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
                      title={<BilingualText fr="Bureau Yalidine" ar="مكتب ياليدين" />}
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
                          ? "غير متاح"
                          : undefined
                      }
                      onClick={() => setDeliveryType("office")}
                    />
                  </div>
                </div>

                {deliveryType === "home" && (
                  <Field label={<BilingualText fr="Adresse" ar="العنوان" />} required>
                    <input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      autoComplete="street-address"
                      className={inputClass}
                      placeholder="الحي، الشارع، رقم المنزل..."
                    />
                  </Field>
                )}

                <div className="min-h-5 text-[10px]">
                  {deliveryLoading ? (
                    <span className="text-[#251713]/45">
                      جارٍ حساب سعر التوصيل...
                    </span>
                  ) : deliveryMessage ? (
                    <span className="font-medium text-amber-800">
                      {deliveryMessage}
                    </span>
                  ) : deliveryFee !== null ? (
                    <span className="font-semibold text-emerald-700">
                      التوصيل: {formatPriceDA(deliveryFee)}
                    </span>
                  ) : null}
                </div>
              </FormSection>

              {/* Total et CTA */}
              <FormSection
                number={product.personalizable ? "4" : "3"}
                title={<BilingualText fr="Votre total" ar="إجمالي الطلب" />}
                subtitle="ستدفع هذا المبلغ عند الاستلام."
              >
                <div className="rounded-[14px] border border-[#251713]/[0.08] bg-[#F7F1E8] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold">
                      Quantité | الكمية
                    </span>

                    <div className="flex items-center overflow-hidden rounded-[9px] border border-[#251713]/10 bg-white">
                      <button
                        type="button"
                        onClick={() =>
                          setQuantity((value) => Math.max(1, value - 1))
                        }
                        className="flex h-10 w-10 items-center justify-center text-lg"
                        aria-label="تقليل الكمية"
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
                        aria-label="زيادة الكمية"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="my-3 h-px bg-[#251713]/[0.08]" />

                  <div className="space-y-2 text-[12px]">
                    <PriceRow
                      label={<BilingualText fr="Produit" ar="المنتج" />}
                      value={formatPriceDA(subtotal)}
                    />

                    <PriceRow
                      label={<BilingualText fr="Livraison" ar="التوصيل" />}
                      value={
                        deliveryLoading
                          ? "جارٍ الحساب..."
                          : deliveryFee === null
                            ? "—"
                            : formatPriceDA(deliveryFee)
                      }
                    />
                  </div>

                  <div className="my-3 h-px bg-[#251713]/[0.08]" />

                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <span className="text-[11px] font-extrabold tracking-[0.1em] text-[#8A6A20]">
                      Total à payer | المبلغ الإجمالي
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
                  className="flex min-h-[58px] w-full items-center justify-center rounded-[12px] bg-[#ECAB1C] px-5 text-[13px] font-extrabold tracking-[0.09em] text-[#251713] shadow-[0_14px_30px_rgba(236,171,28,0.28)] transition hover:bg-[#F1B82F] disabled:cursor-not-allowed disabled:bg-[#D8C8A3] disabled:text-[#251713]/45"
                >
                  {orderState.status === "sending"
                    ? "جارٍ إرسال الطلب..."
                    : "تأكيد الطلب"}
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
                  الدفع عند الاستلام · تأكيد سريع للطلب
                </div>
              </FormSection>
            </div>
          </form>
        </div>
      </section>

      {/* Réassurance : placée tout en bas, juste avant les produits suggérés */}
      <section className="mx-auto max-w-[1240px] px-3 pb-4 sm:px-6 sm:pb-6 lg:px-8">
        <div className="grid grid-cols-1 gap-2 rounded-[18px] min-[430px]:grid-cols-3 border border-[#251713]/[0.07] bg-white p-3 shadow-[0_12px_30px_rgba(37,23,19,0.04)] sm:gap-3 sm:p-4">
          <TrustPoint
            title="Paiement | الدفع"
            text="عند الاستلام"
            icon={
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 9h18M7 15h3" />
              </svg>
            }
          />

          <TrustPoint
            title={<BilingualText fr="Livraison" ar="التوصيل" />}
            text="سعر محسوب تلقائيًا"
            icon={
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" />
                <circle cx="7" cy="18" r="2" />
                <circle cx="17" cy="18" r="2" />
              </svg>
            }
          />

          <TrustPoint
            title="Commande | الطلب"
            text="تأكيد سريع"
            icon={
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M5 12l4 4L19 6" />
              </svg>
            }
          />
        </div>
      </section>

      {/* WhatsApp flottant : reste visible pendant le scroll */}
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="تواصل مع Michket عبر واتساب"
        title="هل تحتاج إلى مساعدة؟ راسلنا عبر واتساب"
        className="fixed bottom-5 left-4 z-[90] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_rgba(0,0,0,0.22)] ring-4 ring-white/80 transition hover:scale-105 sm:bottom-6 sm:left-6 sm:h-16 sm:w-16"
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
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-white/90 shadow" />
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
              className="absolute left-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl font-bold shadow-lg"
              aria-label="إغلاق الصورة"
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
    </>
  );
}

const inputClass =
  "min-h-12 w-full min-w-0 rounded-[10px] border border-[#251713]/10 bg-white px-3.5 text-right text-[13px] text-[#251713] outline-none transition placeholder:text-[#251713]/25 focus:border-[#ECAB1C] focus:ring-2 focus:ring-[#ECAB1C]/10";

function BilingualText({
  fr,
  ar,
}: {
  fr: string;
  ar: string;
}) {
  return (
    <span
      dir="ltr"
      className="inline-flex flex-wrap items-baseline justify-end gap-x-1"
    >
      <span lang="fr">{fr}</span>
      <span aria-hidden="true" className="text-[#251713]/30">
        |
      </span>
      <span lang="ar" dir="rtl">
        {ar}
      </span>
    </span>
  );
}

function Field({
  label,
  required = false,
  children,
}: {
  label: ReactNode;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold tracking-[0.055em] text-[#251713]/55">
        {label}
        {required && <span className="mr-1 text-[#A87406]">*</span>}
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
  title: ReactNode;
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
      className={`rounded-[11px] border p-3.5 text-right transition ${
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
  title: ReactNode;
  text: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-[11px] border border-[#251713]/[0.07] bg-[#FAF6F0] px-2 py-3 text-center">
      <div className="mx-auto flex h-7 w-7 items-center justify-center text-[#8A6A20]">
        {icon}
      </div>
      <p className="mt-1 text-[9px] font-extrabold tracking-[0.06em] text-[#251713]/60">
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
  title: ReactNode;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[15px] border border-[#251713]/[0.07] bg-white p-3.5 sm:p-5">
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

function PriceRow({ label, value }: { label: ReactNode; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[#251713]/48">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
