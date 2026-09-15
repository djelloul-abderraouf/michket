"use client";

/* eslint-disable @next/next/no-img-element */

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { PageHeader } from "@/components/admin/PageHeader";
import { createClient } from "@/lib/supabase/client";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  priceCents: number;
  compareAtPriceCents: number | null;
  currency: string;
  badge: string | null;
  isActive: boolean;
  isPersonalizable: boolean;
  imageUrl: string | null;
  imageAlt: string | null;
  createdAt: string;
};

type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type ProductsResponse = {
  data: ProductRow[];
  meta: PaginationMeta;
};

type CategoryRow = {
  id: string;
  name: string;
};

type CategoriesResponse = {
  data: CategoryRow[];
  meta: PaginationMeta;
};

type StatusFilter = "all" | "active" | "inactive";

const priceFormatter = new Intl.NumberFormat("fr-DZ", {
  style: "currency",
  currency: "DZD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatPrice(priceCents: number) {
  return priceFormatter.format(priceCents / 100);
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return dateFormatter.format(date);
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categoryNames, setCategoryNames] = useState<
    Record<string, string>
  >({});
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        router.replace("/admin/login");
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        setError(
          "NEXT_PUBLIC_API_URL n’est pas configurée.",
        );
        return;
      }

      const headers = {
        Authorization: `Bearer ${session.access_token}`,
      };

      const [productsResponse, categoriesResponse] =
        await Promise.all([
          fetch(
            `${apiUrl}/admin/products?page=${page}&limit=20`,
            {
              method: "GET",
              headers,
              cache: "no-store",
            },
          ),
          fetch(
            `${apiUrl}/admin/categories?page=1&limit=100`,
            {
              method: "GET",
              headers,
              cache: "no-store",
            },
          ),
        ]);

      if (
        productsResponse.status === 401 ||
        productsResponse.status === 403 ||
        categoriesResponse.status === 401 ||
        categoriesResponse.status === 403
      ) {
        await supabase.auth.signOut();
        router.replace("/admin/login");
        return;
      }

      if (!productsResponse.ok) {
        throw new Error(
          "Impossible de charger les produits.",
        );
      }

      const productsPayload =
        (await productsResponse.json()) as ProductsResponse;

      setProducts(productsPayload.data);
      setMeta(productsPayload.meta);

      if (categoriesResponse.ok) {
        const categoriesPayload =
          (await categoriesResponse.json()) as CategoriesResponse;

        setCategoryNames(
          Object.fromEntries(
            categoriesPayload.data.map((category) => [
              category.id,
              category.name,
            ]),
          ),
        );
      }
    } catch {
      setError(
        "Une erreur est survenue pendant le chargement du catalogue.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, router, supabase]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && product.isActive) ||
        (statusFilter === "inactive" && !product.isActive);

      if (!matchesStatus) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return (
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.slug.toLowerCase().includes(normalizedQuery) ||
        (categoryNames[product.categoryId] ?? "")
          .toLowerCase()
          .includes(normalizedQuery)
      );
    });
  }, [categoryNames, products, query, statusFilter]);

  return (
    <div>
      <PageHeader
        title="Produits"
        description="Gérez le catalogue Michket et consultez les produits enregistrés dans le backend."
        action={
          <Link
            href="/admin/products/new"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/25"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M8 3v10" />
              <path d="M3 8h10" />
            </svg>
            Ajouter un produit
          </Link>
        }
      />

      <section className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white shadow-[0_8px_30px_rgba(23,23,20,0.035)]">
        <div className="border-b border-black/[0.06] p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-md">
              <svg
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <circle cx="7" cy="7" r="4.5" />
                <path d="m10.5 10.5 3 3" />
              </svg>

              <input
                type="search"
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                placeholder="Rechercher sur cette page…"
                className="h-11 w-full rounded-xl border border-black/[0.08] bg-[#faf9f6] pl-10 pr-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-950/5"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  ["all", "Tous"],
                  ["active", "Actifs"],
                  ["inactive", "Inactifs"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatusFilter(value)}
                  className={[
                    "min-h-10 rounded-xl px-3.5 text-xs font-semibold transition",
                    statusFilter === value
                      ? "bg-neutral-950 text-white"
                      : "border border-black/[0.07] bg-white text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-black/[0.05] pt-4">
            <p className="text-xs text-neutral-400">
              {isLoading
                ? "Chargement du catalogue…"
                : `${meta.total} produit${
                    meta.total > 1 ? "s" : ""
                  } au total`}
            </p>

            {!isLoading ? (
              <p className="text-xs text-neutral-400">
                {visibleProducts.length} affiché
                {visibleProducts.length > 1 ? "s" : ""} sur
                cette page
              </p>
            ) : null}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="admin-skeleton h-[76px] w-full"
              />
            ))}
          </div>
        ) : error ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-red-700">
              <svg
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="10" cy="10" r="7.5" />
                <path d="M10 6.5v4" />
                <path d="M10 13.5h.01" />
              </svg>
            </div>

            <h2 className="mt-4 text-base font-semibold text-neutral-950">
              Chargement impossible
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
              {error}
            </p>

            <button
              type="button"
              onClick={() => void loadProducts()}
              className="mt-5 inline-flex min-h-10 items-center justify-center rounded-xl border border-black/[0.08] bg-white px-4 text-sm font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-50"
            >
              Réessayer
            </button>
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#f1efe9] text-neutral-600">
              <svg
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M2.5 6.25 10 2.5l7.5 3.75v7.5L10 17.5l-7.5-3.75v-7.5Z" />
              </svg>
            </div>

            <h2 className="mt-4 text-base font-semibold text-neutral-950">
              Aucun résultat
            </h2>
            <p className="mt-2 text-sm text-neutral-500">
              Aucun produit de cette page ne correspond aux
              filtres sélectionnés.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[860px] border-collapse">
                <thead>
                  <tr className="border-b border-black/[0.06] bg-[#faf9f6] text-left">
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                      Produit
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                      Catégorie
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                      Prix
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                      Statut
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                      Créé
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {visibleProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-black/[0.05] last:border-b-0 hover:bg-[#fcfbf8]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-black/[0.06] bg-[#f3f1ec]">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={
                                  product.imageAlt ||
                                  product.name
                                }
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="grid h-full w-full place-items-center text-xs font-semibold text-neutral-400">
                                M
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <Link
                                href={`/admin/products/${product.id}`}
                                className="max-w-[280px] truncate text-sm font-semibold text-neutral-900 transition hover:text-neutral-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20"
                              >
                                {product.name}
                              </Link>

                              {product.isPersonalizable ? (
                                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                                  Personnalisable
                                </span>
                              ) : null}
                            </div>

                            <p className="mt-1 max-w-[320px] truncate text-xs text-neutral-400">
                              /{product.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-sm text-neutral-600">
                        {categoryNames[product.categoryId] ??
                          "—"}
                      </td>

                      <td className="px-4 py-4">
                        <p className="text-sm font-semibold text-neutral-900">
                          {formatPrice(product.priceCents)}
                        </p>

                        {product.compareAtPriceCents &&
                        product.compareAtPriceCents >
                          product.priceCents ? (
                          <p className="mt-0.5 text-xs text-neutral-400 line-through">
                            {formatPrice(
                              product.compareAtPriceCents,
                            )}
                          </p>
                        ) : null}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={[
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                            product.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-neutral-100 text-neutral-500",
                          ].join(" ")}
                        >
                          <span
                            className={[
                              "h-1.5 w-1.5 rounded-full",
                              product.isActive
                                ? "bg-emerald-500"
                                : "bg-neutral-400",
                            ].join(" ")}
                            aria-hidden="true"
                          />
                          {product.isActive
                            ? "Actif"
                            : "Inactif"}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-sm text-neutral-500">
                        {formatDate(product.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-black/[0.06] md:hidden">
              {visibleProducts.map((product) => (
                <article
                  key={product.id}
                  className="p-4"
                >
                  <div className="flex gap-3">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-black/[0.06] bg-[#f3f1ec]">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={
                            product.imageAlt || product.name
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-xs font-semibold text-neutral-400">
                          M
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="truncate text-sm font-semibold text-neutral-950">
                            <Link
                              href={`/admin/products/${product.id}`}
                              className="transition hover:text-neutral-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20"
                            >
                              {product.name}
                            </Link>
                          </h2>
                          <p className="mt-1 truncate text-xs text-neutral-400">
                            {categoryNames[
                              product.categoryId
                            ] ?? "Catégorie inconnue"}
                          </p>
                        </div>

                        <span
                          className={[
                            "shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold",
                            product.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-neutral-100 text-neutral-500",
                          ].join(" ")}
                        >
                          {product.isActive
                            ? "Actif"
                            : "Inactif"}
                        </span>
                      </div>

                      <div className="mt-3 flex items-end justify-between gap-3">
                        <p className="text-sm font-semibold text-neutral-900">
                          {formatPrice(product.priceCents)}
                        </p>

                        <p className="text-[11px] text-neutral-400">
                          {formatDate(product.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        {!isLoading && !error && meta.totalPages > 1 ? (
          <div className="flex items-center justify-between gap-3 border-t border-black/[0.06] bg-[#faf9f6] px-4 py-3 sm:px-5">
            <button
              type="button"
              onClick={() =>
                setPage((current) =>
                  Math.max(1, current - 1),
                )
              }
              disabled={page <= 1}
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-black/[0.08] bg-white px-3.5 text-xs font-semibold text-neutral-600 shadow-sm transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Précédent
            </button>

            <p className="text-xs font-medium text-neutral-500">
              Page {meta.page} sur {meta.totalPages}
            </p>

            <button
              type="button"
              onClick={() =>
                setPage((current) =>
                  Math.min(
                    meta.totalPages,
                    current + 1,
                  ),
                )
              }
              disabled={page >= meta.totalPages}
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-black/[0.08] bg-white px-3.5 text-xs font-semibold text-neutral-600 shadow-sm transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Suivant
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
