"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/api";

type CatalogCategory = {
  slug: string;
  name: string;
};

function formatPriceDA(price: number): string {
  return `${new Intl.NumberFormat("fr-DZ", {
    maximumFractionDigits: 2,
  }).format(price)} DA`;
}

function discountPercent(product: Product): number | null {
  if (
    typeof product.compareAtPrice !== "number" ||
    product.compareAtPrice <= product.price
  ) {
    return null;
  }

  return Math.round(
    ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100,
  );
}

function matchesCategory(product: Product, slug: string): boolean {
  if (slug === "all") return true;
  return product.subcategorySlug === slug;
}

function ColorDot({
  color,
  size = "md",
}: {
  color: { hex: string | null; isMulticolor: boolean };
  size?: "sm" | "md";
}) {
  const dimension = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <span
      className={`relative inline-block shrink-0 overflow-hidden rounded-full border border-black/10 ${dimension}`}
      aria-hidden="true"
    >
      {color.isMulticolor ? (
        <span
          className="absolute inset-0"
          style={{
            background:
              "conic-gradient(from 0deg, #FF3B30, #FF9500, #FFCC00, #34C759, #00C7BE, #007AFF, #5856D6, #AF52DE, #FF2D55, #FF3B30)",
          }}
        />
      ) : (
        <span
          className="absolute inset-0"
          style={{ backgroundColor: color.hex || "#E7DED3" }}
        />
      )}
    </span>
  );
}

export function ProductCatalog({
  title,
  description,
  subcategories,
  products,
  apiError = false,
}: {
  title: string;
  description?: string | null;
  subcategories: CatalogCategory[];
  products: Product[];
  apiError?: boolean;
}) {
  const [categorySlug, setCategorySlug] = useState("all");
  const [modelId, setModelId] = useState("all");
  const resultsRef = useRef<HTMLDivElement>(null);
  const skipScroll = useRef(true);

  const modelsInCategory = useMemo(() => {
    return products.filter((product) => matchesCategory(product, categorySlug));
  }, [categorySlug, products]);

  const visibleProducts = useMemo(() => {
    if (modelId === "all") return modelsInCategory;
    return modelsInCategory.filter((product) => product.id === modelId);
  }, [modelId, modelsInCategory]);

  useEffect(() => {
    if (skipScroll.current) {
      skipScroll.current = false;
      return;
    }

    resultsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [categorySlug, modelId]);

  function selectCategory(slug: string) {
    setCategorySlug(slug);
    setModelId("all");
  }

  return (
    <main className="min-h-screen bg-[#F7F1E8] text-[#251713]">
      <section className="border-b border-[#251713]/[0.08] bg-white">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8A6A20]">
            Modèles
          </p>
          <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.04em] sm:text-[36px]">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#251713]/55">
              {description}
            </p>
          ) : null}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1440px] px-4 py-4 sm:px-6 sm:py-5 lg:px-10">
        <div className="grid gap-3 rounded-2xl border border-[#251713]/[0.08] bg-white p-3 sm:grid-cols-2 sm:p-4">
          <label className="block min-w-0">
            <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#251713]/45">
              Catégorie
            </span>
            <select
              value={categorySlug}
              onChange={(event) => selectCategory(event.target.value)}
              className="h-12 w-full rounded-xl border border-[#251713]/15 bg-[#FFFCF8] px-3 text-base text-[#251713] outline-none focus:border-[#ECAB1C]"
            >
              <option value="all">Toutes les catégories</option>
              {subcategories.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block min-w-0">
            <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#251713]/45">
              Modèle
            </span>
            <select
              value={modelsInCategory.some((product) => product.id === modelId) ? modelId : "all"}
              onChange={(event) => setModelId(event.target.value)}
              className="h-12 w-full rounded-xl border border-[#251713]/15 bg-[#FFFCF8] px-3 text-base text-[#251713] outline-none focus:border-[#ECAB1C]"
            >
              <option value="all">Tous les modèles</option>
              {modelsInCategory.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.title}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div ref={resultsRef} className="scroll-mt-24">
        <p className="mt-4 text-sm text-[#251713]/50">
          {visibleProducts.length} modèle
          {visibleProducts.length > 1 ? "s" : ""}
        </p>

        {visibleProducts.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {visibleProducts.map((product, index) => (
              <ModelCard key={product.id} product={product} priority={index < 2} />
            ))}
          </div>
        ) : apiError ? (
          <p className="mt-8 rounded-xl border border-red-200 bg-red-50 px-5 py-8 text-center text-sm text-red-800">
            Impossible de charger les modèles pour le moment.
          </p>
        ) : (
          <p className="mt-8 rounded-xl border border-[#251713]/10 bg-white px-5 py-8 text-center text-sm text-[#251713]/55">
            Aucun modèle ne correspond à ces filtres.
          </p>
        )}
        </div>
      </section>
    </main>
  );
}

function ModelCard({
  product,
  priority,
}: {
  product: Product;
  priority: boolean;
}) {
  const image = product.images[0];
  const discount = discountPercent(product);
  const colors = product.colors ?? [];

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#251713]/[0.08] bg-white shadow-[0_8px_24px_rgba(37,23,19,0.05)]">
      <Link
        href={`/produits/${product.slug}`}
        className="relative block aspect-[4/5] bg-[#EDE3D7]"
      >
        {image ? (
          <Image
            src={image.src}
            alt={image.alt}
            fill
            priority={priority}
            className="object-cover"
            sizes="(max-width: 519px) 100vw, (max-width: 1023px) 50vw, 25vw"
          />
        ) : null}
        {discount ? (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-[#ECAB1C] px-2.5 py-1 text-[11px] font-extrabold text-[#251713]">
            -{discount}%
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8A6A20]">
          {product.subcategoryName || product.categoryName}
        </p>
        <Link href={`/produits/${product.slug}`}>
          <h2 className="mt-1 line-clamp-2 text-sm font-semibold leading-5">
            {product.title}
          </h2>
        </Link>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-bold">{formatPriceDA(product.price)}</span>
          {product.compareAtPrice && discount ? (
            <span className="text-xs text-[#251713]/35 line-through">
              {formatPriceDA(product.compareAtPrice)}
            </span>
          ) : null}
        </div>

        {colors.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {colors.map((item) => (
              <Link
                key={item.id}
                href={`/produits/${product.slug}?couleur=${item.id}`}
                title={item.isMulticolor ? "Multicolore +500 DA" : item.name}
                aria-label={`${product.title} — ${item.isMulticolor ? "Multicolore" : item.name}`}
                className="rounded-full p-0.5 transition hover:ring-2 hover:ring-[#ECAB1C]"
              >
                <ColorDot color={item} />
              </Link>
            ))}
          </div>
        )}
        {colors.some((item) => item.isMulticolor) ? (
          <p className="mt-2 text-[11px] leading-4 text-[#251713]/50">
            Multicolore : +500 DA
          </p>
        ) : null}
      </div>
    </article>
  );
}
