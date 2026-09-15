"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { useCart, type CartItem } from "@/contexts/CartContext";
import {
  fetchProductDetail,
  type PersonalizationConfig,
  type Product,
  type ProductVariant,
} from "@/lib/api";

function formatPrice(price: number): string {
  return `${new Intl.NumberFormat("fr-DZ", {
    maximumFractionDigits: 2,
  }).format(price)} DA`;
}

function formatPersonalizationSummary(
  personalization: Record<string, unknown> | undefined,
): string | null {
  if (!personalization) return null;

  const preferredText = personalization.text;

  if (
    typeof preferredText === "string" &&
    preferredText.trim()
  ) {
    return preferredText.trim();
  }

  const values = Object.values(personalization)
    .filter(
      (value) =>
        value !== null &&
        value !== undefined &&
        String(value).trim(),
    )
    .map((value) => String(value));

  return values.length > 0 ? values.join(" · ") : null;
}

function variantLabel(variant: ProductVariant): string {
  const pieces = [variant.name];

  if (
    variant.colorName &&
    variant.colorName !== variant.name
  ) {
    pieces.push(variant.colorName);
  }

  return pieces.join(" · ");
}

function readInitialPersonalization(
  item: CartItem,
  config: PersonalizationConfig | null | undefined,
): Record<string, string> {
  const existing = item.personalization ?? {};

  if (config?.mode === "FREE") {
    const current = existing.text;

    return {
      text:
        typeof current === "string"
          ? current
          : formatPersonalizationSummary(
              item.personalization,
            ) ?? "",
    };
  }

  if (config?.mode === "OPTIONS") {
    const values: Record<string, string> = {};

    for (const field of config.fields) {
      const current = existing[field.id];
      values[field.id] =
        current == null ? "" : String(current);
    }

    return values;
  }

  return {
    text:
      formatPersonalizationSummary(
        item.personalization,
      ) ?? "",
  };
}

function buildPersonalizationPayload(
  product: Product,
  values: Record<string, string>,
):
  | { ok: true; value: Record<string, unknown> | null }
  | { ok: false; message: string } {
  if (!product.personalizable) {
    return {
      ok: true,
      value: null,
    };
  }

  const config = product.personalizationConfig;

  if (config?.mode === "FREE") {
    const value = (values.text ?? "").trim();

    if (config.required && !value) {
      return {
        ok: false,
        message: `${config.label || "Personnalisation"} est obligatoire.`,
      };
    }

    if (value.length > config.maxLength) {
      return {
        ok: false,
        message: `La personnalisation ne peut pas dépasser ${config.maxLength} caractères.`,
      };
    }

    return {
      ok: true,
      value: value ? { text: value } : null,
    };
  }

  if (config?.mode === "OPTIONS") {
    const payload: Record<string, unknown> = {};

    for (const field of config.fields) {
      const value = (values[field.id] ?? "").trim();

      if (field.required && !value) {
        return {
          ok: false,
          message: `${field.label} est obligatoire.`,
        };
      }

      if (
        field.type === "TEXT" &&
        field.maxLength != null &&
        value.length > field.maxLength
      ) {
        return {
          ok: false,
          message: `${field.label} ne peut pas dépasser ${field.maxLength} caractères.`,
        };
      }

      if (value) {
        payload[field.id] = value;
      }
    }

    return {
      ok: true,
      value:
        Object.keys(payload).length > 0
          ? payload
          : null,
    };
  }

  const fallback = (values.text ?? "").trim();

  return {
    ok: true,
    value: fallback ? { text: fallback } : null,
  };
}

function PersonalizationEditor({
  product,
  values,
  onChange,
}: {
  product: Product;
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}) {
  if (!product.personalizable) {
    return (
      <div className="rounded-[10px] border border-[#251713]/[0.06] bg-[#F7F1E8]/55 px-3 py-3 text-[12px] text-[#251713]/50">
        Ce produit ne nécessite pas de personnalisation.
      </div>
    );
  }

  const config = product.personalizationConfig;

  if (config?.mode === "FREE") {
    const remaining =
      config.maxLength -
      (values.text ?? "").length;

    return (
      <div>
        <label className="block text-[11px] font-semibold text-[#251713]/65">
          {config.label || "Personnalisation"}
          {config.required ? (
            <span className="ml-1 text-red-500">*</span>
          ) : null}
        </label>
        <textarea
          value={values.text ?? ""}
          onChange={(event) =>
            onChange("text", event.target.value)
          }
          maxLength={config.maxLength}
          rows={3}
          placeholder={
            config.placeholder ||
            "Écrivez votre personnalisation"
          }
          className="mt-1.5 w-full resize-none rounded-[10px] border border-[#251713]/10 bg-white px-3 py-2.5 text-[13px] text-[#251713] outline-none transition focus:border-[#ECAB1C] focus:ring-2 focus:ring-[#ECAB1C]/10"
        />
        <p className="mt-1 text-right text-[10px] text-[#251713]/35">
          {remaining} caractère
          {remaining > 1 ? "s" : ""} restant
          {remaining > 1 ? "s" : ""}
        </p>
      </div>
    );
  }

  if (config?.mode === "OPTIONS") {
    return (
      <div className="space-y-3">
        {config.fields.map((field) => {
          if (field.type === "SELECT") {
            return (
              <label
                key={field.id}
                className="block"
              >
                <span className="text-[11px] font-semibold text-[#251713]/65">
                  {field.label}
                  {field.required ? (
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  ) : null}
                </span>
                <select
                  value={values[field.id] ?? ""}
                  onChange={(event) =>
                    onChange(
                      field.id,
                      event.target.value,
                    )
                  }
                  className="mt-1.5 h-11 w-full rounded-[10px] border border-[#251713]/10 bg-white px-3 text-[13px] text-[#251713] outline-none transition focus:border-[#ECAB1C] focus:ring-2 focus:ring-[#ECAB1C]/10"
                >
                  <option value="">
                    Sélectionner
                  </option>
                  {(field.options ?? []).map(
                    (option) => (
                      <option
                        key={option}
                        value={option}
                      >
                        {option}
                      </option>
                    ),
                  )}
                </select>
              </label>
            );
          }

          return (
            <label
              key={field.id}
              className="block"
            >
              <span className="text-[11px] font-semibold text-[#251713]/65">
                {field.label}
                {field.required ? (
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                ) : null}
              </span>
              <input
                type="text"
                value={values[field.id] ?? ""}
                onChange={(event) =>
                  onChange(
                    field.id,
                    event.target.value,
                  )
                }
                maxLength={field.maxLength}
                placeholder={field.placeholder}
                className="mt-1.5 h-11 w-full rounded-[10px] border border-[#251713]/10 bg-white px-3 text-[13px] text-[#251713] outline-none transition placeholder:text-[#251713]/30 focus:border-[#ECAB1C] focus:ring-2 focus:ring-[#ECAB1C]/10"
              />
            </label>
          );
        })}
      </div>
    );
  }

  return (
    <label className="block">
      <span className="text-[11px] font-semibold text-[#251713]/65">
        Personnalisation
      </span>
      <textarea
        value={values.text ?? ""}
        onChange={(event) =>
          onChange("text", event.target.value)
        }
        rows={3}
        placeholder="Écrivez votre personnalisation"
        className="mt-1.5 w-full resize-none rounded-[10px] border border-[#251713]/10 bg-white px-3 py-2.5 text-[13px] text-[#251713] outline-none transition focus:border-[#ECAB1C] focus:ring-2 focus:ring-[#ECAB1C]/10"
      />
    </label>
  );
}

function CartItemEditor({
  item,
  onClose,
}: {
  item: CartItem;
  onClose: () => void;
}) {
  const { updateItem } = useCart();

  const [product, setProduct] =
    useState<Product | null>(null);
  const [loading, setLoading] =
    useState(true);
  const [saving, setSaving] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] =
    useState(item.variantId ?? "");
  const [
    personalizationValues,
    setPersonalizationValues,
  ] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      setLoading(true);
      setError(null);

      try {
        const result =
          await fetchProductDetail(item.slug);

        if (cancelled) return;

        setProduct(result);
        setSelectedVariantId(
          item.variantId ?? "",
        );
        setPersonalizationValues(
          readInitialPersonalization(
            item,
            result.personalizationConfig,
          ),
        );
      } catch {
        if (!cancelled) {
          setError(
            "Impossible de charger les options de ce produit.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadProduct();

    return () => {
      cancelled = true;
    };
  }, [item]);

  const selectedVariant = useMemo(
    () =>
      product?.variants?.find(
        (variant) =>
          variant.id === selectedVariantId,
      ) ?? null,
    [product, selectedVariantId],
  );

  const selectedPrice =
    selectedVariant?.price ??
    product?.price ??
    item.price;

  async function save() {
    if (!product || saving) return;

    setError(null);

    const variants = product.variants ?? [];

    if (
      variants.length > 0 &&
      !selectedVariantId
    ) {
      setError(
        "Choisissez une couleur ou une variante.",
      );
      return;
    }

    const selected = variants.find(
      (variant) =>
        variant.id === selectedVariantId,
    );

    if (
      variants.length > 0 &&
      (!selected || !selected.inStock)
    ) {
      setError(
        "Cette variante n’est pas disponible.",
      );
      return;
    }

    const personalization =
      buildPersonalizationPayload(
        product,
        personalizationValues,
      );

    if (!personalization.ok) {
      setError(personalization.message);
      return;
    }

    setSaving(true);

    const ok = await updateItem(item.id, {
      variantId:
        variants.length > 0
          ? selectedVariantId
          : null,
      personalization:
        personalization.value,
    });

    setSaving(false);

    if (!ok) {
      setError(
        "Impossible d’enregistrer les options. Réessayez.",
      );
      return;
    }

    onClose();
  }

  return (
    <div className="border-t border-[#251713]/[0.07] bg-[#FCFAF6] px-3 pb-4 pt-4 sm:px-4">
      {loading ? (
        <div className="py-5 text-center text-[12px] text-[#251713]/45">
          Chargement des options…
        </div>
      ) : error && !product ? (
        <div className="rounded-[10px] border border-red-800/10 bg-red-50 p-3 text-[12px] text-red-800">
          {error}
        </div>
      ) : product ? (
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-[13px] font-bold text-[#251713]">
                Modifier ce produit
              </h3>
              <p className="mt-1 text-[11px] leading-5 text-[#251713]/45">
                Choisissez les options de cette ligne du
                panier. Les autres produits ne seront pas
                modifiés.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="shrink-0 text-[11px] font-medium text-[#251713]/40 transition-colors hover:text-[#251713]"
            >
              Fermer
            </button>
          </div>

          {(product.variants?.length ?? 0) > 0 ? (
            <div>
              <p className="text-[11px] font-semibold text-[#251713]/65">
                Couleur / variante
                <span className="ml-1 text-red-500">
                  *
                </span>
              </p>

              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {(product.variants ?? []).map(
                  (variant) => {
                    const selected =
                      variant.id ===
                      selectedVariantId;

                    return (
                      <button
                        key={variant.id}
                        type="button"
                        disabled={!variant.inStock}
                        onClick={() =>
                          setSelectedVariantId(
                            variant.id,
                          )
                        }
                        className={[
                          "flex min-h-[52px] items-center gap-3 rounded-[10px] border px-3 py-2.5 text-left transition",
                          selected
                            ? "border-[#ECAB1C] bg-[#FFF9EA] shadow-[0_0_0_2px_rgba(236,171,28,0.12)]"
                            : "border-[#251713]/10 bg-white hover:border-[#ECAB1C]/55",
                          !variant.inStock
                            ? "cursor-not-allowed opacity-40"
                            : "",
                        ].join(" ")}
                      >
                        <span
                          className="h-6 w-6 shrink-0 rounded-full border border-black/10"
                          style={
                            variant.isMulticolor
                              ? {
                                  background:
                                    "conic-gradient(from 0deg, #FF3B30, #FF9500, #FFCC00, #34C759, #00C7BE, #007AFF, #5856D6, #AF52DE, #FF2D55, #FF3B30)",
                                }
                              : {
                                  backgroundColor:
                                    variant.colorHex ??
                                    "#E5E5E5",
                                }
                          }
                          aria-hidden="true"
                        />

                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[12px] font-semibold text-[#251713]">
                            {variantLabel(variant)}
                          </span>
                          <span className="mt-0.5 block text-[10px] text-[#251713]/40">
                            {variant.inStock
                              ? formatPrice(
                                  variant.price ??
                                    product.price,
                                )
                              : "Indisponible"}
                          </span>
                        </span>

                        {selected ? (
                          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#ECAB1C] text-[10px] font-bold text-[#251713]">
                            ✓
                          </span>
                        ) : null}
                      </button>
                    );
                  },
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-[10px] border border-[#251713]/[0.06] bg-white px-3 py-3 text-[12px] text-[#251713]/50">
              Ce produit n’a pas de variante à choisir.
            </div>
          )}

          <div>
            <p className="mb-2 text-[11px] font-semibold text-[#251713]/65">
              Personnalisation
            </p>

            <PersonalizationEditor
              product={product}
              values={personalizationValues}
              onChange={(key, value) =>
                setPersonalizationValues(
                  (current) => ({
                    ...current,
                    [key]: value,
                  }),
                )
              }
            />
          </div>

          {error ? (
            <div className="rounded-[10px] border border-red-800/10 bg-red-50 px-3 py-2.5 text-[12px] text-red-800">
              {error}
            </div>
          ) : null}

          <div className="flex flex-col gap-2 border-t border-[#251713]/[0.07] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-[0.08em] text-[#251713]/35">
                Prix avec cette variante
              </span>
              <p className="mt-0.5 text-[15px] font-bold text-[#251713]">
                {formatPrice(selectedPrice)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => void save()}
              disabled={saving}
              className="inline-flex min-h-11 items-center justify-center rounded-[10px] bg-[#ECAB1C] px-5 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#251713] transition hover:bg-[#F1B82F] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Enregistrement…"
                : "Enregistrer les choix"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function CartPage() {
  const {
    items,
    itemCount,
    total,
    hydrated,
    loading,
    error,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const [editingItemId, setEditingItemId] =
    useState<string | null>(null);

  /* ── Loading ── */
  if (!hydrated || loading) {
    return (
      <main className="min-h-screen bg-[#F7F1E8]">
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h1 className="font-body text-[24px] font-semibold text-[#251713] sm:text-[30px]">
              Mon panier
            </h1>
            <div className="mt-8 flex items-center justify-center py-16">
              <p className="text-sm text-[#251713]/45">
                Chargement du panier…
              </p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <main className="min-h-screen bg-[#F7F1E8]">
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h1 className="font-body text-[24px] font-semibold text-[#251713] sm:text-[30px]">
              Mon panier
            </h1>
            <div className="mt-8 rounded-[12px] border border-red-800/10 bg-red-50 p-6 text-center">
              <p className="text-sm font-medium text-red-800">
                {error}
              </p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  /* ── Empty cart ── */
  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#F7F1E8]">
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h1 className="font-body text-[24px] font-semibold text-[#251713] sm:text-[30px]">
              Mon panier
            </h1>
            <div className="mt-8 rounded-[14px] border border-[#251713]/[0.07] bg-white py-16 text-center">
              <svg
                className="mx-auto mb-4 h-16 w-16 text-[#251713]/15"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121 0 2.09-.773 2.34-1.872l1.836-8.046A1.125 1.125 0 0018.054 3H5.106m2.394 11.25l-1.5-6h13.5"
                />
              </svg>
              <h2 className="font-body text-[20px] font-semibold text-[#161616]">
                Votre panier est vide
              </h2>
              <p className="mx-auto mt-2 max-w-[300px] text-[13px] leading-6 text-[#251713]/45">
                Découvrez les créations Michket et ajoutez votre prochain
                cadeau personnalisé.
              </p>
              <Link
                href="/meilleures-ventes"
                className="mt-6 inline-flex min-h-12 items-center justify-center bg-[#ECAB1C] px-6 text-[11px] font-bold uppercase tracking-[0.09em] text-[#0A0A0A] transition-[filter] hover:brightness-95"
              >
                Découvrir nos créations
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  /* ── Cart with items ── */
  return (
    <main className="min-h-screen bg-[#F7F1E8]">
      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav
            aria-label="Fil d&apos;ariane"
            className="mb-6 text-[11px] text-[#251713]/45"
          >
            <ol className="flex items-center gap-1.5">
              <li>
                <Link
                  href="/"
                  className="transition-colors hover:text-[#ECAB1C]"
                >
                  Accueil
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="font-medium text-[#251713]">
                Panier
              </li>
            </ol>
          </nav>

          <h1 className="font-body text-[24px] font-semibold text-[#251713] sm:text-[30px]">
            Mon panier
          </h1>

          <p className="mt-2 max-w-xl text-[12px] leading-5 text-[#251713]/50">
            Vous pouvez modifier séparément la couleur, la variante et la
            personnalisation de chaque produit avant de passer la commande.
          </p>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
            {/* ── Items list ── */}
            <div className="space-y-3">
              {items.map((item) => {
                const personalization =
                  formatPersonalizationSummary(
                    item.personalization,
                  );
                const isEditing =
                  editingItemId === item.id;

                return (
                  <article
                    key={item.id}
                    className="overflow-hidden rounded-[12px] border border-[#251713]/[0.07] bg-white"
                  >
                    <div className="flex gap-3 p-3 sm:gap-4 sm:p-4">
                      {/* Image */}
                      <Link
                        href={`/produits/${item.slug}`}
                        className="relative h-20 w-[72px] shrink-0 overflow-hidden rounded-[8px] bg-[#EFE9DF] sm:h-24 sm:w-24"
                      >
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[10px] text-[#251713]/25">
                            —
                          </div>
                        )}
                      </Link>

                      {/* Info */}
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/produits/${item.slug}`}
                            className="line-clamp-2 text-[13px] font-semibold text-[#171717] transition-colors hover:text-[#8A6414] sm:text-[14px]"
                          >
                            {item.title}
                          </Link>
                          <button
                            type="button"
                            onClick={() =>
                              removeItem(item.id)
                            }
                            className="flex-shrink-0 p-1 text-[#251713]/25 transition-colors hover:text-red-500"
                            aria-label={`Retirer ${item.title}`}
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={1.5}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>

                        {/* Variant swatch */}
                        {item.variantId ? (
                          <div className="mt-1 flex items-center gap-1.5">
                            <span
                              className="inline-block h-3.5 w-3.5 rounded-full border border-black/10"
                              style={
                                item.selectedIsMulticolor
                                  ? {
                                      background:
                                        "conic-gradient(from 0deg, #FF3B30, #FF9500, #FFCC00, #34C759, #00C7BE, #007AFF, #5856D6, #AF52DE, #FF2D55, #FF3B30)",
                                    }
                                  : {
                                      backgroundColor:
                                        item.selectedColorHex ??
                                        "#ccc",
                                    }
                              }
                              aria-hidden="true"
                            />
                            <span className="text-[11px] text-[#251713]/45">
                              {item.selectedColorName ??
                                (item.selectedIsMulticolor
                                  ? "Multicolore"
                                  : "Variante sélectionnée")}
                            </span>
                          </div>
                        ) : null}

                        {/* Personalization */}
                        {personalization ? (
                          <p className="mt-1 line-clamp-2 text-[11px] italic text-[#251713]/35">
                            {personalization}
                          </p>
                        ) : null}

                        <button
                          type="button"
                          onClick={() =>
                            setEditingItemId(
                              isEditing
                                ? null
                                : item.id,
                            )
                          }
                          className="mt-2 w-fit text-[11px] font-bold text-[#8A6414] underline decoration-[#ECAB1C]/45 underline-offset-4 transition-colors hover:text-[#251713]"
                        >
                          {isEditing
                            ? "Fermer les options"
                            : "Modifier / personnaliser"}
                        </button>

                        {/* Quantity + line total */}
                        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                          <div className="inline-flex h-9 items-center rounded-[8px] border border-[#251713]/10 bg-white">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  item.quantity - 1,
                                )
                              }
                              className="flex h-full w-9 items-center justify-center text-base text-[#251713]/55 transition-colors hover:bg-[#251713]/[0.04] hover:text-[#251713]"
                              aria-label="Diminuer la quantité"
                            >
                              −
                            </button>
                            <span className="flex h-full min-w-9 items-center justify-center border-x border-[#251713]/[0.08] px-1 text-[12px] font-semibold text-[#111]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  item.quantity + 1,
                                )
                              }
                              disabled={
                                item.quantity >= 99
                              }
                              className="flex h-full w-9 items-center justify-center text-base text-[#251713]/55 transition-colors hover:bg-[#251713]/[0.04] hover:text-[#251713] disabled:cursor-not-allowed disabled:opacity-30"
                              aria-label="Augmenter la quantité"
                            >
                              +
                            </button>
                          </div>

                          <span className="text-[14px] font-bold text-[#111]">
                            {formatPrice(
                              item.price *
                                item.quantity,
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {isEditing ? (
                      <CartItemEditor
                        item={item}
                        onClose={() =>
                          setEditingItemId(null)
                        }
                      />
                    ) : null}
                  </article>
                );
              })}

              {/* Clear + continue shopping */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-[11px] text-[#251713]/30 transition-colors hover:text-red-500"
                >
                  Vider le panier
                </button>
                <Link
                  href="/meilleures-ventes"
                  className="text-[11px] font-medium text-[#251713]/42 transition-colors hover:text-[#ECAB1C]"
                >
                  ← Continuer les achats
                </Link>
              </div>
            </div>

            {/* ── Order summary ── */}
            <div className="lg:sticky lg:top-20">
              <div className="rounded-[14px] border border-[#251713]/[0.08] bg-white p-5 shadow-[0_12px_35px_rgba(37,23,19,0.06)] sm:p-6">
                <h2 className="font-body text-[18px] font-semibold text-[#111]">
                  Récapitulatif
                </h2>

                <div className="mt-4 space-y-2 text-[13px]">
                  <div className="flex justify-between">
                    <span className="text-[#251713]/50">
                      Sous-total ({itemCount} article
                      {itemCount > 1 ? "s" : ""})
                    </span>
                    <span className="font-medium text-[#111]">
                      {formatPrice(total)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#251713]/50">
                      Livraison
                    </span>
                    <span className="text-[11px] text-[#251713]/35">
                      Calculée à la commande
                    </span>
                  </div>
                </div>

                <div className="my-3 h-px bg-[#251713]/[0.08]" />

                <div className="flex items-end justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#8A6A20]">
                    Total
                  </span>
                  <span className="text-[22px] font-extrabold text-[#111]">
                    {formatPrice(total)}
                  </span>
                </div>

                <Link
                  href="/checkout"
                  className="mt-5 flex min-h-[48px] w-full items-center justify-center rounded-[11px] bg-[#ECAB1C] px-5 text-[12px] font-extrabold uppercase tracking-[0.1em] text-[#251713] shadow-[0_10px_22px_rgba(236,171,28,0.22)] transition hover:bg-[#F1B82F]"
                >
                  Passer la commande
                </Link>

                {/* Trust signals */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-[11px] text-[#251713]/45">
                    <svg
                      className="h-3.5 w-3.5 flex-shrink-0 text-[#ECAB1C]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                      />
                    </svg>
                    Paiement à la livraison
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#251713]/45">
                    <svg
                      className="h-3.5 w-3.5 flex-shrink-0 text-[#ECAB1C]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25"
                      />
                    </svg>
                    Livraison dans toute l&apos;Algérie
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
