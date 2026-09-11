"use client";

/* eslint-disable @next/next/no-img-element */

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { PageHeader } from "@/components/admin/PageHeader";
import { ProductGalleryManager } from "@/components/admin/products/ProductGalleryManager";
import { createClient } from "@/lib/supabase/client";

type ProductImage = {
  id: string;
  productId: string;
  url: string;
  storagePath: string | null;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
  variantId: string | null;
};

type InventoryRow = {
  id: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  reserved: number;
  lowStockThreshold: number;
  trackInventory: boolean;
};

type ProductVariant = {
  id: string;
  productId: string;
  name: string;
  sku: string | null;
  colorName: string | null;
  colorHex: string | null;
  priceCents: number | null;
  sortOrder: number;
  isActive: boolean;
  inventory: InventoryRow | null;
};

type VariantFormData = {
  name: string;
  colorName: string;
  colorHex: string;
  sku: string;
};

type ProductDetails = {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  description: string | null;
  shortDescription: string | null;
  priceCents: number;
  compareAtPriceCents: number | null;
  currency: string;
  badge: string | null;
  occasions: string[] | null;
  isActive: boolean;
  isPersonalizable: boolean;
  personalizationPrompt: string | null;
  personalizationConfig: Record<string, unknown> | null;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
  images: ProductImage[];
  inventory: InventoryRow | null;
  variants: ProductVariant[];
};

type Category = {
  id: string;
  name: string;
};

type CategoriesResponse = {
  data: Category[];
};

type ApiErrorPayload = {
  message?: string | string[];
};

const moneyFormatter = new Intl.NumberFormat("fr-DZ", {
  style: "currency",
  currency: "DZD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

function formatMoney(value: number) {
  return moneyFormatter.format(value / 100);
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : dateFormatter.format(date);
}

function apiMessage(
  payload: ApiErrorPayload | null,
  fallback: string,
) {
  if (!payload?.message) return fallback;
  return Array.isArray(payload.message)
    ? payload.message.join(" ")
    : payload.message;
}

export default function AdminProductDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const productId = params.id;

  const [product, setProduct] =
    useState<ProductDetails | null>(null);
  const [categoryName, setCategoryName] =
    useState("—");
  const [token, setToken] = useState<string>("");
  const [isLoading, setIsLoading] =
    useState(true);
  const [error, setError] =
    useState<string | null>(null);

  // Product activation / permanent deletion state
  const [updatingProductStatus, setUpdatingProductStatus] =
    useState(false);
  const [statusError, setStatusError] =
    useState<string | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] =
    useState("");
  const [deletingProduct, setDeletingProduct] =
    useState(false);
  const [deleteError, setDeleteError] =
    useState<string | null>(null);

  // Variant CRUD state
  const [showVariantForm, setShowVariantForm] =
    useState(false);
  const [editingVariant, setEditingVariant] =
    useState<ProductVariant | null>(null);
  const [variantForm, setVariantForm] =
    useState<VariantFormData>({
      name: "",
      colorName: "",
      colorHex: "#ECAB1C",
      sku: "",
    });
  const [savingVariant, setSavingVariant] =
    useState(false);
  const [variantError, setVariantError] =
    useState<string | null>(null);
  const [deletingVariantId, setDeletingVariantId] =
    useState<string | null>(null);
  const [confirmDeleteVariantId, setConfirmDeleteVariantId] =
    useState<string | null>(null);

  const loadProduct = useCallback(async () => {
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

      setToken(session.access_token);

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        setError(
          "NEXT_PUBLIC_API_URL n'est pas configurée.",
        );
        return;
      }

      const headers = {
        Authorization:
          `Bearer ${session.access_token}`,
      };

      const [productResponse, categoriesResponse] =
        await Promise.all([
          fetch(
            `${apiUrl}/admin/products/${productId}`,
            {
              headers,
              cache: "no-store",
            },
          ),
          fetch(
            `${apiUrl}/admin/categories?page=1&limit=100`,
            {
              headers,
              cache: "no-store",
            },
          ),
        ]);

      if (
        productResponse.status === 401 ||
        productResponse.status === 403
      ) {
        await supabase.auth.signOut();
        router.replace("/admin/login");
        return;
      }

      if (!productResponse.ok) {
        let payload: ApiErrorPayload | null = null;

        try {
          payload =
            (await productResponse.json()) as ApiErrorPayload;
        } catch {}

        setError(
          apiMessage(
            payload,
            productResponse.status === 404
              ? "Produit introuvable."
              : "Impossible de charger le produit.",
          ),
        );
        return;
      }

      const productPayload =
        (await productResponse.json()) as ProductDetails;

      setProduct(productPayload);

      if (categoriesResponse.ok) {
        const categoriesPayload =
          (await categoriesResponse.json()) as CategoriesResponse;

        setCategoryName(
          categoriesPayload.data.find(
            (category) =>
              category.id ===
              productPayload.categoryId,
          )?.name ?? "—",
        );
      }
    } catch {
      setError(
        "Une erreur est survenue pendant le chargement du produit.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [productId, router, supabase]);

  const handleVariantFormChange = useCallback(
    (field: keyof VariantFormData, value: string) => {
      setVariantForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleOpenAddVariant = useCallback(() => {
    setEditingVariant(null);
    setVariantError(null);
    setVariantForm({
      name: "",
      colorName: "",
      colorHex: "#ECAB1C",
      sku: "",
    });
    setShowVariantForm(true);
  }, []);

  const handleOpenEditVariant = useCallback(
    (variant: ProductVariant) => {
      setEditingVariant(variant);
      setVariantError(null);
      setVariantForm({
        name: variant.name,
        colorName: variant.colorName ?? "",
        colorHex: variant.colorHex ?? "#ECAB1C",
        sku: variant.sku ?? "",
      });
      setShowVariantForm(true);
    },
    [],
  );

  const handleSaveVariant = useCallback(async () => {
    if (!variantForm.name.trim()) return;

    setSavingVariant(true);
    setVariantError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const body = {
        name: variantForm.name.trim(),
        colorName: variantForm.colorName.trim() || null,
        colorHex: variantForm.colorHex.trim() || null,
        sku: variantForm.sku.trim() || null,
      };

      let res: Response;

      if (editingVariant) {
        res = await fetch(
          `${apiUrl}/admin/products/${productId}/variants/${editingVariant.id}`,
          { method: "PUT", headers, body: JSON.stringify(body) },
        );
      } else {
        res = await fetch(
          `${apiUrl}/admin/products/${productId}/variants`,
          { method: "POST", headers, body: JSON.stringify(body) },
        );
      }

      if (!res.ok) {
        let payload: ApiErrorPayload | null = null;
        try {
          payload = (await res.json()) as ApiErrorPayload;
        } catch {}
        throw new Error(
          apiMessage(payload, "Échec de l'enregistrement de la variante."),
        );
      }

      setShowVariantForm(false);
      setEditingVariant(null);
      setVariantError(null);
      await loadProduct();
    } catch (err) {
      setVariantError(
        err instanceof Error ? err.message : "Erreur inconnue.",
      );
    } finally {
      setSavingVariant(false);
    }
  }, [variantForm, editingVariant, token, productId, loadProduct]);

  const handleDeleteVariant = useCallback(
    async (variantId: string) => {
      setDeletingVariantId(variantId);
      setVariantError(null);

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(
          `${apiUrl}/admin/products/${productId}/variants/${variantId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!res.ok) {
          let payload: ApiErrorPayload | null = null;
          try {
            payload = (await res.json()) as ApiErrorPayload;
          } catch {}
          throw new Error(
            apiMessage(payload, "Échec de la suppression."),
          );
        }

        setConfirmDeleteVariantId(null);
        setVariantError(null);
        await loadProduct();
      } catch (err) {
        setVariantError(
          err instanceof Error ? err.message : "Erreur inconnue.",
        );
      } finally {
        setDeletingVariantId(null);
      }
    },
    [token, productId, loadProduct],
  );

  const handleToggleProductActive = useCallback(async () => {
    if (!product || updatingProductStatus) return;

    setUpdatingProductStatus(true);
    setStatusError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        setStatusError(
          "NEXT_PUBLIC_API_URL n'est pas configurée.",
        );
        return;
      }

      if (!token) {
        setStatusError(
          "Votre session administrateur n'est plus disponible. Reconnectez-vous.",
        );
        return;
      }

      const response = await fetch(
        `${apiUrl}/admin/products/${productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            isActive: !product.isActive,
          }),
        },
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        await supabase.auth.signOut();
        window.location.replace("/admin/login");
        return;
      }

      if (!response.ok) {
        let payload: ApiErrorPayload | null = null;

        try {
          payload =
            (await response.json()) as ApiErrorPayload;
        } catch {}

        setStatusError(
          apiMessage(
            payload,
            product.isActive
              ? "Impossible de désactiver ce produit."
              : "Impossible de réactiver ce produit.",
          ),
        );
        return;
      }

      await loadProduct();
    } catch {
      setStatusError(
        product.isActive
          ? "Une erreur est survenue pendant la désactivation du produit."
          : "Une erreur est survenue pendant la réactivation du produit.",
      );
    } finally {
      setUpdatingProductStatus(false);
    }
  }, [
    loadProduct,
    product,
    productId,
    supabase,
    token,
    updatingProductStatus,
  ]);

  const handleDeleteProduct = useCallback(async () => {
    if (
      deletingProduct ||
      deleteConfirmationText !== "SUPPRIMER"
    ) {
      return;
    }

    setDeletingProduct(true);
    setDeleteError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        setDeleteError(
          "NEXT_PUBLIC_API_URL n'est pas configurée.",
        );
        return;
      }

      if (!token) {
        setDeleteError(
          "Votre session administrateur n'est plus disponible. Reconnectez-vous.",
        );
        return;
      }

      const response = await fetch(
        `${apiUrl}/admin/products/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        await supabase.auth.signOut();
        window.location.replace("/admin/login");
        return;
      }

      if (!response.ok) {
        let payload: ApiErrorPayload | null = null;

        try {
          payload =
            (await response.json()) as ApiErrorPayload;
        } catch {}

        setDeleteError(
          apiMessage(
            payload,
            "Impossible de supprimer ce produit.",
          ),
        );
        return;
      }

      window.location.replace("/admin/products");
    } catch {
      setDeleteError(
        "Une erreur est survenue pendant la suppression du produit.",
      );
    } finally {
      setDeletingProduct(false);
    }
  }, [
    deleteConfirmationText,
    deletingProduct,
    productId,
    supabase,
    token,
  ]);

  useEffect(() => {
    void loadProduct();
  }, [loadProduct]);

  const totalStock = useMemo(() => {
    if (!product) {
      return {
        quantity: 0,
        reserved: 0,
        available: 0,
      };
    }

    if (product.variants.length === 0) {
      const inventory = product.inventory;

      return {
        quantity: inventory?.quantity ?? 0,
        reserved: inventory?.reserved ?? 0,
        available: Math.max(
          0,
          (inventory?.quantity ?? 0) -
            (inventory?.reserved ?? 0),
        ),
      };
    }

    return product.variants.reduce(
      (total, variant) => {
        total.quantity +=
          variant.inventory?.quantity ?? 0;
        total.reserved +=
          variant.inventory?.reserved ?? 0;
        total.available += Math.max(
          0,
          (variant.inventory?.quantity ?? 0) -
            (variant.inventory?.reserved ?? 0),
        );
        return total;
      },
      {
        quantity: 0,
        reserved: 0,
        available: 0,
      },
    );
  }, [product]);

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="admin-skeleton h-24 w-full" />
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-5">
            <div className="admin-skeleton h-72 w-full" />
            <div className="admin-skeleton h-56 w-full" />
          </div>
          <div className="admin-skeleton h-80 w-full" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div>
        <PageHeader
          title="Produit"
          description="Consultation de la fiche produit."
          action={
            <Link
              href="/admin/products"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-black/[0.08] bg-white px-4 text-sm font-semibold text-neutral-600 shadow-sm"
            >
              Retour aux produits
            </Link>
          }
        />

        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-12 text-center">
          <h2 className="text-base font-semibold text-red-800">
            Chargement impossible
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-red-700">
            {error ?? "Produit introuvable."}
          </p>
          <button
            type="button"
            onClick={() => void loadProduct()}
            className="mt-5 inline-flex min-h-10 items-center justify-center rounded-xl bg-white px-4 text-sm font-semibold text-red-700 ring-1 ring-red-200"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const primaryImage =
    product.images.find(
      (image) => image.isPrimary,
    ) ??
    product.images[0] ??
    null;

  return (
    <div>
      <PageHeader
        title={product.name}
        description={`/${product.slug}`}
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/products"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-black/[0.08] bg-white px-4 text-sm font-semibold text-neutral-600 shadow-sm transition hover:bg-neutral-50"
            >
              Retour
            </Link>
            <Link
              href={`/admin/products/${product.id}/edit`}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              Modifier
            </Link>
            <button
              type="button"
              disabled={updatingProductStatus}
              onClick={() => void handleToggleProductActive()}
              className={[
                "inline-flex min-h-11 items-center justify-center rounded-xl border bg-white px-4 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50",
                product.isActive
                  ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                  : "border-emerald-200 text-emerald-700 hover:bg-emerald-50",
              ].join(" ")}
            >
              {updatingProductStatus
                ? "Mise à jour..."
                : product.isActive
                  ? "Désactiver"
                  : "Réactiver"}
            </button>
            <button
              type="button"
              onClick={() => {
                setDeleteError(null);
                setDeleteConfirmationText("");
                setShowDeleteConfirmation(true);
              }}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-red-200 bg-white px-4 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-50"
            >
              Supprimer définitivement
            </button>
          </div>
        }
      />

      {statusError ? (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {statusError}
        </div>
      ) : null}

      {showDeleteConfirmation ? (
        <section className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
            <div>
              <p className="text-sm font-semibold text-red-800">
                Supprimer définitivement ce produit ?
              </p>
              <p className="mt-1 text-sm leading-6 text-red-700">
                « {product.name} » sera supprimé du catalogue, avec ses variantes,
                son inventaire et ses lignes de panier. Les anciennes commandes
                restent conservées grâce à leurs snapshots.
              </p>

              <label className="mt-4 block">
                <span className="mb-1.5 block text-xs font-semibold text-red-800">
                  Tapez SUPPRIMER pour confirmer
                </span>
                <input
                  type="text"
                  value={deleteConfirmationText}
                  disabled={deletingProduct}
                  onChange={(event) =>
                    setDeleteConfirmationText(
                      event.target.value.toUpperCase(),
                    )
                  }
                  className="min-h-10 w-full rounded-xl border border-red-200 bg-white px-3 text-sm font-semibold text-neutral-900 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100 disabled:opacity-60"
                  placeholder="SUPPRIMER"
                  autoComplete="off"
                />
              </label>

              {deleteError ? (
                <p className="mt-3 text-sm font-medium text-red-800">
                  {deleteError}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2 lg:justify-end">
              <button
                type="button"
                disabled={
                  deletingProduct ||
                  deleteConfirmationText !== "SUPPRIMER"
                }
                onClick={() => void handleDeleteProduct()}
                className="inline-flex min-h-10 items-center justify-center rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingProduct
                  ? "Suppression..."
                  : "Supprimer définitivement"}
              </button>

              <button
                type="button"
                disabled={deletingProduct}
                onClick={() => {
                  setDeleteError(null);
                  setDeleteConfirmationText("");
                  setShowDeleteConfirmation(false);
                }}
                className="inline-flex min-h-10 items-center justify-center rounded-xl border border-black/[0.08] bg-white px-4 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Annuler
              </button>
            </div>
          </div>
        </section>
      ) : null}

      <div className="mb-5 flex flex-wrap gap-2">
        <span
          className={[
            "rounded-full px-3 py-1.5 text-xs font-semibold",
            product.isActive
              ? "bg-emerald-50 text-emerald-700"
              : "bg-neutral-100 text-neutral-500",
          ].join(" ")}
        >
          {product.isActive ? "Actif" : "Inactif"}
        </span>

        {product.isPersonalizable ? (
          <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
            {(() => {
              const config = product.personalizationConfig as Record<string, unknown> | null;
              const mode = config?.mode;
              if (mode === "FREE") return "Personnalisation libre";
              if (mode === "OPTIONS") return "Choix admin";
              return "Personnalisable";
            })()}
          </span>
        ) : null}

        {product.badge ? (
          <span className="rounded-full bg-[#f1efe9] px-3 py-1.5 text-xs font-semibold text-neutral-600">
            {product.badge}
          </span>
        ) : null}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <section className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-[0_8px_30px_rgba(23,23,20,0.035)] sm:p-6">
            <div className="grid gap-6 md:grid-cols-[180px_minmax(0,1fr)]">
              <div className="aspect-square overflow-hidden rounded-2xl border border-black/[0.06] bg-[#f3f1ec]">
                {primaryImage ? (
                  <img
                    src={primaryImage.url}
                    alt={
                      primaryImage.altText ??
                      product.name
                    }
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-sm font-semibold text-neutral-400">
                    Aucune image
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                  Informations principales
                </p>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-neutral-400">
                      Catégorie
                    </p>
                    <p className="mt-1 text-sm font-semibold text-neutral-900">
                      {categoryName}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-neutral-400">
                      Prix
                    </p>
                    <div className="mt-1 flex items-baseline gap-2">
                      <p className="text-lg font-semibold text-neutral-950">
                        {formatMoney(
                          product.priceCents,
                        )}
                      </p>
                      {product.compareAtPriceCents &&
                      product.compareAtPriceCents >
                        product.priceCents ? (
                        <p className="text-xs text-neutral-400 line-through">
                          {formatMoney(
                            product.compareAtPriceCents,
                          )}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-neutral-400">
                      Créé le
                    </p>
                    <p className="mt-1 text-sm text-neutral-700">
                      {formatDate(product.createdAt)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-neutral-400">
                      Mis à jour
                    </p>
                    <p className="mt-1 text-sm text-neutral-700">
                      {formatDate(product.updatedAt)}
                    </p>
                  </div>
                </div>

                {product.shortDescription ? (
                  <div className="mt-5 border-t border-black/[0.06] pt-5">
                    <p className="text-xs text-neutral-400">
                      Description courte
                    </p>
                    <p className="mt-2 text-sm leading-6 text-neutral-600">
                      {product.shortDescription}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-[0_8px_30px_rgba(23,23,20,0.035)] sm:p-6">
            <ProductGalleryManager
              productId={product.id}
              images={product.images}
              variants={product.variants.map((v) => ({
                id: v.id,
                name: v.name,
                colorName: v.colorName,
                colorHex: v.colorHex,
              }))}
              token={token}
              onImagesChange={(next) =>
                setProduct({
                  ...product,
                  images: next,
                })
              }
            />
          </section>

          <section className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-[0_8px_30px_rgba(23,23,20,0.035)] sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
              Stock
            </p>
            <h2 className="mt-1 text-lg font-semibold text-neutral-950">
              Inventaire
            </h2>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                ["Quantité", totalStock.quantity],
                ["Réservé", totalStock.reserved],
                ["Disponible", totalStock.available],
              ].map(([label, value]) => (
                <div
                  key={String(label)}
                  className="rounded-xl bg-[#faf9f6] p-4"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                    {label}
                  </p>
                  <p className="mt-2 text-xl font-semibold text-neutral-950">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-[0_8px_30px_rgba(23,23,20,0.035)] sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                  Variantes
                </p>
                <h2 className="mt-1 text-lg font-semibold text-neutral-950">
                  Déclinaisons
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-neutral-400">
                  {product.variants.length}
                </span>
                <button
                  type="button"
                  onClick={handleOpenAddVariant}
                  className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl bg-neutral-950 px-3.5 text-xs font-semibold text-white transition hover:bg-neutral-800"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Ajouter
                </button>
              </div>
            </div>

            {variantError ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {variantError}
              </div>
            ) : null}

            {showVariantForm && (
              <div className="mt-5 rounded-xl border border-black/[0.08] bg-[#faf9f6] p-4">
                <p className="text-xs font-semibold text-neutral-700">
                  {editingVariant ? "Modifier la variante" : "Nouvelle variante"}
                </p>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.055em] text-neutral-400">
                      Nom *
                    </span>
                    <input
                      type="text"
                      value={variantForm.name}
                      onChange={(e) => handleVariantFormChange("name", e.target.value)}
                      className="min-h-10 w-full rounded-lg border border-black/[0.1] bg-white px-3 text-sm outline-none focus:border-[#ECAB1C] focus:ring-2 focus:ring-[#ECAB1C]/10"
                      placeholder="Ex: Rose Gold"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.055em] text-neutral-400">
                      Nom de couleur
                    </span>
                    <input
                      type="text"
                      value={variantForm.colorName}
                      onChange={(e) => handleVariantFormChange("colorName", e.target.value)}
                      className="min-h-10 w-full rounded-lg border border-black/[0.1] bg-white px-3 text-sm outline-none focus:border-[#ECAB1C] focus:ring-2 focus:ring-[#ECAB1C]/10"
                      placeholder="Ex: Rose"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.055em] text-neutral-400">
                      Couleur hex
                    </span>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={variantForm.colorHex}
                        onChange={(e) => handleVariantFormChange("colorHex", e.target.value)}
                        className="h-10 w-10 cursor-pointer rounded-lg border border-black/[0.1] bg-white p-0.5"
                      />
                      <input
                        type="text"
                        value={variantForm.colorHex}
                        onChange={(e) => handleVariantFormChange("colorHex", e.target.value)}
                        className="min-h-10 flex-1 rounded-lg border border-black/[0.1] bg-white px-3 text-sm font-mono outline-none focus:border-[#ECAB1C] focus:ring-2 focus:ring-[#ECAB1C]/10"
                        placeholder="#ECAB1C"
                      />
                    </div>
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.055em] text-neutral-400">
                      SKU
                    </span>
                    <input
                      type="text"
                      value={variantForm.sku}
                      onChange={(e) => handleVariantFormChange("sku", e.target.value)}
                      className="min-h-10 w-full rounded-lg border border-black/[0.1] bg-white px-3 text-sm outline-none focus:border-[#ECAB1C] focus:ring-2 focus:ring-[#ECAB1C]/10"
                      placeholder="Optionnel"
                    />
                  </label>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    disabled={savingVariant || !variantForm.name.trim()}
                    onClick={() => void handleSaveVariant()}
                    className="inline-flex min-h-9 items-center justify-center rounded-xl bg-neutral-950 px-4 text-xs font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
                  >
                    {savingVariant ? "…" : editingVariant ? "Enregistrer" : "Créer"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowVariantForm(false);
                      setEditingVariant(null);
                      setVariantError(null);
                    }}
                    className="inline-flex min-h-9 items-center justify-center rounded-xl border border-black/[0.08] bg-white px-4 text-xs font-semibold text-neutral-600 transition hover:bg-neutral-50"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {product.variants.length === 0 && !showVariantForm ? (
              <div className="mt-5 rounded-xl bg-[#faf9f6] px-4 py-8 text-center text-sm text-neutral-400">
                Ce produit n’a aucune variante.
              </div>
            ) : (
              <div className="mt-5 divide-y divide-black/[0.06] overflow-hidden rounded-xl border border-black/[0.06]">
                {product.variants.map((variant) => {
                  const available = Math.max(
                    0,
                    (variant.inventory?.quantity ?? 0) -
                      (variant.inventory?.reserved ?? 0),
                  );

                  return (
                    <div
                      key={variant.id}
                      className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-3">
                        {variant.colorHex ? (
                          <span
                            className="h-8 w-8 rounded-lg border border-black/[0.08]"
                            style={{
                              backgroundColor:
                                variant.colorHex,
                            }}
                          />
                        ) : null}

                        <div>
                          <p className="text-sm font-semibold text-neutral-900">
                            {variant.name}
                          </p>
                          <p className="mt-0.5 text-xs text-neutral-400">
                            {variant.sku ?? "Sans SKU"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-[#f1efe9] px-2.5 py-1 text-xs font-semibold text-neutral-600">
                          Stock {available}
                        </span>
                        <span
                          className={[
                            "rounded-full px-2.5 py-1 text-xs font-semibold",
                            variant.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-neutral-100 text-neutral-500",
                          ].join(" ")}
                        >
                          {variant.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleOpenEditVariant(variant)}
                          className="ml-2 inline-flex h-8 items-center gap-1 rounded-lg border border-black/[0.08] bg-white px-2.5 text-[10px] font-semibold text-neutral-600 transition hover:bg-neutral-50"
                        >
                          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                          </svg>
                        </button>

                        {confirmDeleteVariantId === variant.id ? (
                          <div className="flex gap-1">
                            <button
                              type="button"
                              disabled={deletingVariantId === variant.id}
                              onClick={() => void handleDeleteVariant(variant.id)}
                              className="inline-flex h-8 items-center gap-1 rounded-lg bg-red-500 px-2.5 text-[10px] font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
                            >
                              {deletingVariantId === variant.id ? "…" : "Confirmer"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteVariantId(null)}
                              className="inline-flex h-8 items-center rounded-lg border border-black/[0.08] bg-white px-2.5 text-[10px] font-semibold text-neutral-600 transition hover:bg-neutral-50"
                            >
                              Non
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteVariantId(variant.id)}
                            className="inline-flex h-8 items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 text-[10px] font-semibold text-red-600 transition hover:bg-red-50"
                          >
                            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-[98px] xl:self-start">
          <section className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-[0_8px_30px_rgba(23,23,20,0.035)]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
              Résumé
            </p>

            <div className="mt-4 space-y-4">
              <div className="flex justify-between border-b border-black/[0.05] pb-3 text-sm">
                <span className="text-neutral-400">
                  Images
                </span>
                <span className="font-semibold text-neutral-800">
                  {product.images.length}
                </span>
              </div>
              <div className="flex justify-between border-b border-black/[0.05] pb-3 text-sm">
                <span className="text-neutral-400">
                  Variantes
                </span>
                <span className="font-semibold text-neutral-800">
                  {product.variants.length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">
                  Stock disponible
                </span>
                <span className="font-semibold text-neutral-800">
                  {totalStock.available}
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-[0_8px_30px_rgba(23,23,20,0.035)]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
              Description
            </p>
            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-neutral-600">
              {product.description ||
                "Aucune description complète."}
            </p>
          </section>

          <section className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-[0_8px_30px_rgba(23,23,20,0.035)]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
              Personnalisation
            </p>

            {product.isPersonalizable ? (
              <div className="mt-3 space-y-3">
                <span className="inline-block rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                  {(() => {
                    const config = product.personalizationConfig as Record<string, unknown> | null;
                    const mode = config?.mode;
                    if (mode === "FREE") return "Personnalisation libre";
                    if (mode === "OPTIONS") return "Choix définis par l'admin";
                    return "Personnalisable";
                  })()}
                </span>

                {product.personalizationPrompt ? (
                  <div>
                    <p className="text-[11px] text-neutral-400">Instruction</p>
                    <p className="mt-1 text-sm leading-6 text-neutral-700">
                      {product.personalizationPrompt}
                    </p>
                  </div>
                ) : null}

                {/* FREE mode details */}
                {(() => {
                  const config = product.personalizationConfig as Record<string, unknown> | null;
                  if (config?.mode !== "FREE") return null;
                  return (
                    <div className="space-y-2 rounded-xl bg-[#faf9f6] p-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-400">Libellé</span>
                        <span className="font-medium text-neutral-800">
                          {String(config.label ?? "—")}
                        </span>
                      </div>
                      {config.placeholder ? (
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-400">Placeholder</span>
                          <span className="text-neutral-600">
                            {String(config.placeholder)}
                          </span>
                        </div>
                      ) : null}
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-400">Obligatoire</span>
                        <span className="text-neutral-800">
                          {config.required ? "Oui" : "Non"}
                        </span>
                      </div>
                      {config.maxLength ? (
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-400">Max caractères</span>
                          <span className="text-neutral-800">
                            {String(config.maxLength)}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  );
                })()}

                {/* OPTIONS mode details */}
                {(() => {
                  const config = product.personalizationConfig as Record<string, unknown> | null;
                  if (config?.mode !== "OPTIONS") return null;
                  const fields = config.fields as
                    | Array<Record<string, unknown>>
                    | undefined;
                  if (!Array.isArray(fields) || fields.length === 0) {
                    return (
                      <p className="text-sm text-amber-700">
                        Configuration de personnalisation non définie.
                      </p>
                    );
                  }
                  return (
                    <div className="space-y-2">
                      {fields.map((f, i) => (
                        <div
                          key={String(f.id ?? i)}
                          className="rounded-xl bg-[#faf9f6] p-3 space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-neutral-800">
                              {String(f.label ?? "—")}
                            </span>
                            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-500">
                              {String(f.type ?? "—")}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-neutral-400">
                            <span>
                              {f.required ? "Obligatoire" : "Facultatif"}
                            </span>
                            {f.type === "TEXT" && f.maxLength ? (
                              <span>Max {String(f.maxLength)} car.</span>
                            ) : null}
                          </div>
                          {f.type === "SELECT" &&
                          Array.isArray(f.options) &&
                          f.options.length > 0 ? (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {(f.options as string[]).map((opt, j) => (
                                <span
                                  key={j}
                                  className="rounded-full border border-black/[0.08] bg-white px-2 py-0.5 text-[10px] text-neutral-600"
                                >
                                  {opt}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {/* Legacy / invalid config fallback */}
                {product.isPersonalizable &&
                !product.personalizationConfig ? (
                  <p className="text-sm text-amber-700">
                    Configuration de personnalisation non définie.
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="mt-3 text-sm text-neutral-500">
                Aucune personnalisation
              </p>
            )}
          </section>

          {product.metaTitle ||
          product.metaDescription ? (
            <section className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-[0_8px_30px_rgba(23,23,20,0.035)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                SEO
              </p>

              {product.metaTitle ? (
                <div className="mt-3">
                  <p className="text-[11px] text-neutral-400">
                    Meta title
                  </p>
                  <p className="mt-1 text-sm font-medium text-neutral-700">
                    {product.metaTitle}
                  </p>
                </div>
              ) : null}

              {product.metaDescription ? (
                <div className="mt-4">
                  <p className="text-[11px] text-neutral-400">
                    Meta description
                  </p>
                  <p className="mt-1 text-sm leading-6 text-neutral-600">
                    {product.metaDescription}
                  </p>
                </div>
              ) : null}
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
