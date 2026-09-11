"use client";

import { useEffect, useState } from "react";
import {
  fetchProductBySlug,
  type ApiProductDetail,
  type Product,
} from "@/lib/api";
import { useCart } from "@/contexts/CartContext";

type QuickAddState = "idle" | "loading" | "added" | "error";

interface QuickAddButtonProps {
  product: Product;
  className?: string;
}

function getDefaultVariant(detail: ApiProductDetail) {
  return (
    [...detail.variants]
      .filter((variant) => variant.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder)[0] ?? null
  );
}

function getRepresentativeImage(detail: ApiProductDetail): string | null {
  const generalImages = detail.images
    .filter((image) => image.variantId === null)
    .sort((a, b) => {
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;
      return a.sortOrder - b.sortOrder;
    });

  return generalImages[0]?.url ?? detail.images[0]?.url ?? null;
}

export function QuickAddButton({
  product,
  className = "",
}: QuickAddButtonProps) {
  const { addItem } = useCart();
  const [state, setState] = useState<QuickAddState>("idle");

  useEffect(() => {
    if (state !== "added" && state !== "error") return;

    const timer = window.setTimeout(
      () => setState("idle"),
      state === "added" ? 1400 : 1800,
    );

    return () => window.clearTimeout(timer);
  }, [state]);

  async function handleQuickAdd() {
    if (state === "loading") return;

    setState("loading");

    try {
      const detail = await fetchProductBySlug(product.slug);
      const defaultVariant = getDefaultVariant(detail);

      const added = await addItem(
        {
          id: detail.id,
          productId: detail.id,
          slug: detail.slug,
          title: detail.name,
          price: (defaultVariant?.priceCents ?? detail.priceCents) / 100,
          image: getRepresentativeImage(detail),
          currency: detail.currency,
          variantId: defaultVariant?.id,
        },
        1,
      );

      setState(added ? "added" : "error");
    } catch {
      setState("error");
    }
  }

  const label =
    state === "loading"
      ? "Ajout en cours"
      : state === "added"
        ? "Produit ajouté au panier"
        : state === "error"
          ? "Impossible d'ajouter le produit"
          : `Ajouter ${product.title} au panier`;

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void handleQuickAdd();
      }}
      disabled={state === "loading"}
      className={className}
      aria-label={label}
      title={label}
    >
      {state === "added" && (
        <>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full border-2 border-current animate-ping"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -inset-1 rounded-full border border-current opacity-40"
          />
        </>
      )}

      <span
        className={`flex items-center justify-center transition-all duration-200 ${
          state === "added"
            ? "scale-125"
            : state === "error"
              ? "animate-pulse"
              : "scale-100"
        }`}
      >
        {state === "loading" ? (
          <svg
            className="h-5 w-5 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              strokeWidth="2"
              className="opacity-25"
            />
            <path
              d="M21 12a9 9 0 00-9-9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ) : state === "added" ? (
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.4}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 12.5l4.2 4.2L19 7"
            />
          </svg>
        ) : state === "error" ? (
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" d="M12 7v6" />
            <path strokeLinecap="round" d="M12 17h.01" />
            <circle cx="12" cy="12" r="9" />
          </svg>
        ) : (
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.5 4.5h2l1.65 9.05a2 2 0 001.97 1.65h7.76a2 2 0 001.94-1.52L20 8H7"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.25 19.25h.01M17.25 19.25h.01"
            />
          </svg>
        )}
      </span>
    </button>
  );
}
