"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/api";

export type CatalogImage = {
  src: string;
  alt: string;
};

export type CatalogCategoryCard = {
  slug: string;
  name: string;
  description?: string | null;
  href: string;
  images: CatalogImage[];
  modelCount: number;
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

function ColorDot({
  color,
}: {
  color: { hex: string | null; isMulticolor: boolean };
}) {
  return (
    <span
      className="relative inline-block h-5 w-5 shrink-0 overflow-hidden rounded-full border border-black/10"
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
  categories,
}: {
  title: string;
  description?: string | null;
  categories: CatalogCategoryCard[];
}) {
  return (
    <main className="min-h-screen bg-[#F7F1E8] text-[#251713]">
      <section className="border-b border-[#251713]/[0.08] bg-white">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8A6A20]">
            Catégories
          </p>
          <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.04em] sm:text-[36px]">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#251713]/55">
              {description}
            </p>
          ) : (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#251713]/55">
              Choisissez une catégorie pour voir ses modèles.
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-6 lg:px-10">
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
            {categories.map((category, index) => (
              <CategoryCard
                key={category.slug}
                category={category}
                priority={index < 2}
                startDelay={index * 700}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-[#251713]/10 bg-white px-5 py-10 text-center text-sm text-[#251713]/55">
            Aucune catégorie disponible pour le moment.
          </p>
        )}
      </section>
    </main>
  );
}

function CategoryCard({
  category,
  priority,
  startDelay,
}: {
  category: CatalogCategoryCard;
  priority: boolean;
  startDelay: number;
}) {
  return (
    <Link
      href={category.href}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#251713]/[0.08] bg-white shadow-[0_10px_28px_rgba(37,23,19,0.06)] transition hover:-translate-y-0.5 hover:border-[#ECAB1C]/40"
    >
      <FadingImages
        images={category.images}
        priority={priority}
        startDelay={startDelay}
        label={category.name}
      />

      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold sm:text-lg">
            {category.name}
          </h2>
          <p className="mt-0.5 text-sm text-[#251713]/55">
            {category.modelCount} modèle
            {category.modelCount > 1 ? "s" : ""}
          </p>
          {category.description ? (
            <p className="mt-1 line-clamp-1 text-sm text-[#251713]/45">
              {category.description}
            </p>
          ) : null}
        </div>
        <span className="shrink-0 text-sm font-semibold text-[#8A6A20]">
          Voir
        </span>
      </div>
    </Link>
  );
}

function FadingImages({
  images,
  priority,
  startDelay,
  label,
}: {
  images: CatalogImage[];
  priority: boolean;
  startDelay: number;
  label: string;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (images.length < 2 || paused) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) return;

    let intervalId = 0;
    const startId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        setIndex((current) => (current + 1) % images.length);
      }, 3200);
    }, startDelay);

    return () => {
      window.clearTimeout(startId);
      window.clearInterval(intervalId);
    };
  }, [images.length, paused, startDelay]);

  if (images.length === 0) {
    return <div className="aspect-[4/3] bg-[#EDE3D7]" />;
  }

  return (
    <div
      className="relative aspect-[4/3] overflow-hidden bg-[#EDE3D7]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {images.map((image, imageIndex) => (
        <Image
          key={image.src}
          src={image.src}
          alt={imageIndex === index ? image.alt || label : ""}
          fill
          priority={priority && imageIndex === 0}
          aria-hidden={imageIndex !== index}
          className={`object-cover transition-opacity duration-700 ease-in-out ${
            imageIndex === index ? "opacity-100" : "opacity-0"
          }`}
          sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 33vw"
        />
      ))}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#21130F]/35 via-transparent to-transparent"
        aria-hidden="true"
      />
      {images.length > 1 ? (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {images.map((image, imageIndex) => (
            <span
              key={image.src}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                imageIndex === index
                  ? "w-5 bg-white"
                  : "w-1.5 bg-white/55"
              }`}
              aria-hidden="true"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ModelGrid({
  products,
  apiError = false,
}: {
  products: Product[];
  apiError?: boolean;
}) {
  if (apiError) {
    return (
      <p className="rounded-2xl border border-red-200 bg-red-50 px-5 py-10 text-center text-sm text-red-800">
        Impossible de charger les modèles pour le moment.
      </p>
    );
  }

  if (products.length === 0) {
    return (
      <p className="rounded-2xl border border-[#251713]/10 bg-white px-5 py-10 text-center text-sm text-[#251713]/55">
        Aucun modèle dans cette catégorie pour le moment.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, index) => (
        <ModelCard key={product.id} product={product} priority={index < 2} />
      ))}
    </div>
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
        <Link href={`/produits/${product.slug}`}>
          <h2 className="line-clamp-2 text-sm font-semibold leading-5 sm:text-base">
            {product.title}
          </h2>
        </Link>

        <div className="mt-2 flex flex-wrap items-baseline gap-2">
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
