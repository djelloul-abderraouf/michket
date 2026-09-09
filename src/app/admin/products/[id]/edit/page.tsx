"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { PageHeader } from "@/components/admin/PageHeader";
import PersonalizationSection, {
  PersonalizationSectionHandle,
} from "@/components/admin/products/PersonalizationSection";
import { createClient } from "@/lib/supabase/client";

type Category = {
  id: string;
  name: string;
  isActive: boolean;
};

type CategoriesResponse = {
  data: Category[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type ProductImage = {
  id: string;
  url: string;
  isPrimary: boolean;
};

type ProductVariant = {
  id: string;
  name: string;
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
  images: ProductImage[];
  variants: ProductVariant[];
  inventory: {
    quantity: number;
    lowStockThreshold: number;
    trackInventory: boolean;
  } | null;
};

type ApiErrorPayload = {
  message?: string | string[];
  error?: string;
};

const BADGES = [
  { value: "", label: "Aucun badge" },
  { value: "BEST_SELLER", label: "Meilleure vente" },
  { value: "NOUVEAU", label: "Nouveau" },
  { value: "PROMO", label: "Promotion" },
  { value: "PERSONNALISABLE", label: "Personnalisable" },
  { value: "ENVOI_GRATUIT", label: "Envoi gratuit" },
] as const;

function parseMoneyToCents(value: string) {
  const normalized = value.replace(",", ".").trim();
  if (!normalized) return null;
  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount < 0) return null;
  return Math.round(amount * 100);
}

function formatCentsToMoney(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ".");
}

function getApiErrorMessage(
  payload: ApiErrorPayload | null,
  fallback: string,
): string {
  if (!payload?.message) return fallback;
  if (Array.isArray(payload.message))
    return payload.message.join(" ");
  return payload.message;
}

export default function EditAdminProductPage() {
  const params = useParams();
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const productId = params.id as string;

  const [product, setProduct] = useState<ProductDetails | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] =
    useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [categoryId, setCategoryId] = useState("");

  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");

  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [badge, setBadge] = useState("");

  const [occasions, setOccasions] = useState("");
  const [isActive, setIsActive] = useState(true);

  const personalizationRef =
    useRef<PersonalizationSectionHandle>(null);

  const [trackInventory, setTrackInventory] = useState(true);
  const [quantity, setQuantity] = useState("0");
  const [lowStockThreshold, setLowStockThreshold] =
    useState("5");

  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  const activeCategories = useMemo(
    () => categories.filter((category) => category.isActive),
    [categories],
  );

  /* ── Load product ── */
  const loadProduct = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
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
        setLoadError("NEXT_PUBLIC_API_URL n'est pas configurée.");
        return;
      }

      const response = await fetch(
        `${apiUrl}/admin/products/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      if (response.status === 401 || response.status === 403) {
        await supabase.auth.signOut();
        router.replace("/admin/login");
        return;
      }

      if (!response.ok) {
        setLoadError("Impossible de charger le produit.");
        return;
      }

      const data = (await response.json()) as ProductDetails;
      setProduct(data);

      // Pre-fill form
      setName(data.name);
      setSlug(data.slug);
      setCategoryId(data.categoryId);
      setShortDescription(data.shortDescription ?? "");
      setDescription(data.description ?? "");
      setPrice(formatCentsToMoney(data.priceCents));
      setCompareAtPrice(
        data.compareAtPriceCents != null
          ? formatCentsToMoney(data.compareAtPriceCents)
          : "",
      );
      setBadge(data.badge ?? "");
      setOccasions(data.occasions?.join(", ") ?? "");
      setIsActive(data.isActive);
      setMetaTitle(data.metaTitle ?? "");
      setMetaDescription(data.metaDescription ?? "");

      if (data.inventory) {
        setTrackInventory(data.inventory.trackInventory);
        setQuantity(String(data.inventory.quantity));
        setLowStockThreshold(
          String(data.inventory.lowStockThreshold),
        );
      }
    } catch {
      setLoadError(
        "Une erreur est survenue lors du chargement du produit.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [productId, supabase, router]);

  /* ── Load categories ── */
  const loadCategories = useCallback(async () => {
    setIsLoadingCategories(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) return;

      const response = await fetch(
        `${apiUrl}/admin/categories?limit=200`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      if (response.ok) {
        const data =
          (await response.json()) as CategoriesResponse;
        setCategories(data.data ?? []);
      }
    } catch {
      // Silently fail — categories are non-critical for display
    } finally {
      setIsLoadingCategories(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadProduct();
    loadCategories();
  }, [loadProduct, loadCategories]);

  /* ── Slug auto-generation ── */
  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) {
      setSlug(
        value
          .normalize("NFD")
          .replace(/[̀-ͯ]/g, "")
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, ""),
      );
    }
  }

  /* ── Submit ── */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const normalizedName = name.trim();
    const normalizedSlug = slug.trim();
    const priceCents = parseMoneyToCents(price);
    const compareAtPriceCents =
      compareAtPrice.trim() === ""
        ? null
        : parseMoneyToCents(compareAtPrice);

    if (!normalizedName) {
      setError("Le nom du produit est obligatoire.");
      return;
    }

    if (
      !normalizedSlug ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizedSlug)
    ) {
      setError(
        "Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets.",
      );
      return;
    }

    if (!categoryId) {
      setError("Sélectionnez une catégorie.");
      return;
    }

    if (priceCents === null) {
      setError("Saisissez un prix valide.");
      return;
    }

    if (
      compareAtPrice.trim() !== "" &&
      compareAtPriceCents === null
    ) {
      setError("Saisissez un ancien prix valide.");
      return;
    }

    const occasionValues = occasions
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (occasionValues.length > 30) {
      setError("Vous pouvez saisir au maximum 30 occasions.");
      return;
    }

    // ── Personalization frontend validation + payload ──
    const personalizationPayload =
      personalizationRef.current?.getPayload();
    const personalizationErrors =
      personalizationRef.current?.getValidationErrors() ?? [];

    if (personalizationErrors.length > 0) {
      setError(personalizationErrors[0]);
      return;
    }

    setIsSubmitting(true);

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
        setError("NEXT_PUBLIC_API_URL n'est pas configurée.");
        return;
      }

      const payload: Record<string, unknown> = {
        name: normalizedName,
        slug: normalizedSlug,
        categoryId,
        description: description.trim() || null,
        shortDescription: shortDescription.trim() || null,
        priceCents,
        compareAtPriceCents: compareAtPriceCents,
        badge: badge || null,
        occasions:
          occasionValues.length > 0 ? occasionValues : [],
        isActive,
        isPersonalizable:
          personalizationPayload?.isPersonalizable ?? false,
        personalizationPrompt:
          personalizationPayload?.personalizationPrompt ?? null,
        personalizationConfig:
          personalizationPayload?.personalizationConfig ?? null,
        metaTitle: metaTitle.trim() || null,
        metaDescription: metaDescription.trim() || null,
      };

      const response = await fetch(
        `${apiUrl}/admin/products/${productId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (response.status === 401 || response.status === 403) {
        await supabase.auth.signOut();
        router.replace("/admin/login");
        return;
      }

      if (!response.ok) {
        let errorPayload: ApiErrorPayload | null = null;
        try {
          errorPayload =
            (await response.json()) as ApiErrorPayload;
        } catch {
          // Keep the generic fallback below.
        }

        setError(
          getApiErrorMessage(
            errorPayload,
            "Impossible de modifier le produit.",
          ),
        );
        return;
      }

      router.push(`/admin/products/${productId}`);
      router.refresh();
    } catch {
      setError(
        "Une erreur est survenue pendant la modification du produit.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClassName =
    "h-11 w-full rounded-xl border border-black/[0.09] bg-white px-3.5 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-950/5 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400";

  const textareaClassName =
    "w-full rounded-xl border border-black/[0.09] bg-white px-3.5 py-3 text-sm leading-6 text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-950/5";

  const labelClassName =
    "mb-2 block text-xs font-semibold text-neutral-700";

  /* ── Loading / Error states ── */
  if (isLoading) {
    return (
      <div>
        <PageHeader
          title="Modifier le produit"
          description="Chargement du produit…"
        />
        <div className="flex items-center justify-center py-20">
          <div className="text-sm text-neutral-500">
            Chargement…
          </div>
        </div>
      </div>
    );
  }

  if (loadError || !product) {
    return (
      <div>
        <PageHeader
          title="Modifier le produit"
          description="Une erreur est survenue."
          action={
            <Link
              href="/admin/products"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-black/[0.08] bg-white px-4 text-sm font-semibold text-neutral-600 shadow-sm transition hover:bg-neutral-50 hover:text-neutral-900"
            >
              Retour aux produits
            </Link>
          }
        />
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
        >
          {loadError ?? "Produit introuvable."}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Modifier « ${product.name} »`}
        description="Modifiez les informations principales du produit. Les images, variantes et stock ne sont pas gérés ici."
        action={
          <div className="flex gap-2">
            <Link
              href={`/admin/products/${productId}`}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-black/[0.08] bg-white px-4 text-sm font-semibold text-neutral-600 shadow-sm transition hover:bg-neutral-50 hover:text-neutral-900"
            >
              Annuler
            </Link>
          </div>
        }
      />

      <form
        onSubmit={handleSubmit}
        className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]"
      >
        <div className="space-y-5">
          {error ? (
            <div
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
            >
              {error}
            </div>
          ) : null}

          {/* ── Informations ── */}
          <section className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-[0_8px_30px_rgba(23,23,20,0.035)] sm:p-6">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                Informations
              </p>
              <h2 className="mt-1 text-lg font-semibold tracking-[-0.025em] text-neutral-950">
                Informations principales
              </h2>
            </div>

            <div className="grid gap-5">
              <div>
                <label
                  htmlFor="name"
                  className={labelClassName}
                >
                  Nom du produit *
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  maxLength={200}
                  onChange={(event) =>
                    handleNameChange(event.target.value)
                  }
                  placeholder="Ex. Lampe LED 3D Anniversaire"
                  className={inputClassName}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="slug"
                  className={labelClassName}
                >
                  Slug *
                </label>
                <input
                  id="slug"
                  type="text"
                  value={slug}
                  maxLength={220}
                  onChange={(event) => {
                    setSlugTouched(true);
                    setSlug(event.target.value.toLowerCase());
                  }}
                  placeholder="lampe-led-3d-anniversaire"
                  className={inputClassName}
                  required
                />
                <p className="mt-1.5 text-[11px] text-neutral-400">
                  Utilisé dans l'URL. Lettres minuscules, chiffres
                  et tirets uniquement.
                </p>
              </div>

              <div>
                <label
                  htmlFor="category"
                  className={labelClassName}
                >
                  Catégorie *
                </label>
                <select
                  id="category"
                  value={categoryId}
                  onChange={(event) =>
                    setCategoryId(event.target.value)
                  }
                  disabled={
                    isLoadingCategories ||
                    activeCategories.length === 0
                  }
                  className={inputClassName}
                  required
                >
                  {isLoadingCategories ? (
                    <option value="">
                      Chargement des catégories…
                    </option>
                  ) : activeCategories.length === 0 ? (
                    <option value="">
                      Aucune catégorie active
                    </option>
                  ) : (
                    activeCategories.map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label
                  htmlFor="shortDescription"
                  className={labelClassName}
                >
                  Description courte
                </label>
                <textarea
                  id="shortDescription"
                  value={shortDescription}
                  maxLength={500}
                  rows={3}
                  onChange={(event) =>
                    setShortDescription(event.target.value)
                  }
                  placeholder="Résumé court visible dans le catalogue."
                  className={textareaClassName}
                />
                <p className="mt-1.5 text-right text-[11px] text-neutral-400">
                  {shortDescription.length}/500
                </p>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className={labelClassName}
                >
                  Description complète
                </label>
                <textarea
                  id="description"
                  value={description}
                  rows={7}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Décrivez le produit, ses caractéristiques et son usage."
                  className={textareaClassName}
                />
              </div>
            </div>
          </section>

          {/* ── Tarification ── */}
          <section className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-[0_8px_30px_rgba(23,23,20,0.035)] sm:p-6">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                Prix
              </p>
              <h2 className="mt-1 text-lg font-semibold tracking-[-0.025em] text-neutral-950">
                Tarification
              </h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="price"
                  className={labelClassName}
                >
                  Prix de vente (DZD) *
                </label>
                <input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={price}
                  onChange={(event) =>
                    setPrice(event.target.value)
                  }
                  placeholder="0.00"
                  className={inputClassName}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="compareAtPrice"
                  className={labelClassName}
                >
                  Ancien prix (DZD)
                </label>
                <input
                  id="compareAtPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={compareAtPrice}
                  onChange={(event) =>
                    setCompareAtPrice(event.target.value)
                  }
                  placeholder="Laisser vide pour supprimer"
                  className={inputClassName}
                />
                <p className="mt-1.5 text-[11px] text-neutral-400">
                  Si renseigné, affiché en barré à côté du prix.
                </p>
              </div>
            </div>
          </section>

          {/* ── Badge & Occasions ── */}
          <section className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-[0_8px_30px_rgba(23,23,20,0.035)] sm:p-6">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                Habillage
              </p>
              <h2 className="mt-1 text-lg font-semibold tracking-[-0.025em] text-neutral-950">
                Badge & occasions
              </h2>
            </div>

            <div className="grid gap-5">
              <div>
                <label
                  htmlFor="badge"
                  className={labelClassName}
                >
                  Badge
                </label>
                <select
                  id="badge"
                  value={badge}
                  onChange={(event) =>
                    setBadge(event.target.value)
                  }
                  className={inputClassName}
                >
                  {BADGES.map((b) => (
                    <option key={b.value} value={b.value}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="occasions"
                  className={labelClassName}
                >
                  Occasions
                </label>
                <input
                  id="occasions"
                  type="text"
                  value={occasions}
                  onChange={(event) =>
                    setOccasions(event.target.value)
                  }
                  placeholder="Anniversaire, mariage, fête… (séparées par des virgules)"
                  className={inputClassName}
                />
                <p className="mt-1.5 text-[11px] text-neutral-400">
                  Séparez les occasions par des virgules. Maximum 30.
                </p>
              </div>
            </div>
          </section>

          {/* ── Personnalisation ── */}
          <PersonalizationSection
            ref={personalizationRef}
            initialIsPersonalizable={product.isPersonalizable}
            initialPersonalizationPrompt={
              product.personalizationPrompt
            }
            initialPersonalizationConfig={
              product.personalizationConfig
            }
            inputClassName={inputClassName}
            textareaClassName={textareaClassName}
            labelClassName={labelClassName}
          />

          {/* ── SEO ── */}
          <section className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-[0_8px_30px_rgba(23,23,20,0.035)] sm:p-6">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                Référencement
              </p>
              <h2 className="mt-1 text-lg font-semibold tracking-[-0.025em] text-neutral-950">
                SEO
              </h2>
            </div>

            <div className="grid gap-5">
              <div>
                <label
                  htmlFor="metaTitle"
                  className={labelClassName}
                >
                  Meta title
                </label>
                <input
                  id="metaTitle"
                  type="text"
                  value={metaTitle}
                  maxLength={200}
                  onChange={(event) =>
                    setMetaTitle(event.target.value)
                  }
                  className={inputClassName}
                />
              </div>

              <div>
                <label
                  htmlFor="metaDescription"
                  className={labelClassName}
                >
                  Meta description
                </label>
                <textarea
                  id="metaDescription"
                  value={metaDescription}
                  maxLength={500}
                  rows={3}
                  onChange={(event) =>
                    setMetaDescription(event.target.value)
                  }
                  className={textareaClassName}
                />
                <p className="mt-1.5 text-right text-[11px] text-neutral-400">
                  {metaDescription.length}/500
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-5 xl:sticky xl:top-24 xl:self-start">
          {/* ── Statut ── */}
          <section className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-[0_8px_30px_rgba(23,23,20,0.035)] sm:p-6">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                Visibilité
              </p>
              <h2 className="mt-1 text-lg font-semibold tracking-[-0.025em] text-neutral-950">
                Statut
              </h2>
            </div>

            <div className="flex items-center justify-between gap-4">
              <label className="text-sm font-medium text-neutral-700">
                Actif
              </label>
              <button
                type="button"
                role="switch"
                aria-checked={isActive}
                onClick={() => setIsActive(!isActive)}
                className={[
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition",
                  isActive ? "bg-neutral-950" : "bg-neutral-300",
                ].join(" ")}
              >
                <span
                  className={[
                    "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
                    isActive
                      ? "translate-x-5"
                      : "translate-x-0",
                  ].join(" ")}
                />
              </button>
            </div>
          </section>

          {/* ── Stock (read-only info) ── */}
          <section className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-[0_8px_30px_rgba(23,23,20,0.035)] sm:p-6">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                Inventaire
              </p>
              <h2 className="mt-1 text-lg font-semibold tracking-[-0.025em] text-neutral-950">
                Stock
              </h2>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-700">
              La gestion du stock et des images est disponible sur la page de détail du produit.
            </div>
          </section>

          {/* ── Submit ── */}
          <section className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-[0_8px_30px_rgba(23,23,20,0.035)] sm:p-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-neutral-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isSubmitting
                ? "Enregistrement…"
                : "Enregistrer les modifications"}
            </button>
          </section>
        </div>
      </form>
    </div>
  );
}
