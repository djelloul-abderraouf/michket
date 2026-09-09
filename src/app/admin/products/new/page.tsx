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
import { useRouter } from "next/navigation";

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

type CreatedProduct = {
  id: string;
  name: string;
  slug: string;
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

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseMoneyToCents(value: string) {
  const normalized = value.replace(",", ".").trim();

  if (!normalized) {
    return null;
  }

  const amount = Number(normalized);

  if (!Number.isFinite(amount) || amount < 0) {
    return null;
  }

  return Math.round(amount * 100);
}

function getApiErrorMessage(
  payload: ApiErrorPayload | null,
  fallback: string,
) {
  if (!payload?.message) {
    return fallback;
  }

  if (Array.isArray(payload.message)) {
    return payload.message.join(" ");
  }

  return payload.message;
}

export default function NewAdminProductPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

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

  const loadCategories = useCallback(async () => {
    setIsLoadingCategories(true);
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
        setError("NEXT_PUBLIC_API_URL n’est pas configurée.");
        return;
      }

      const response = await fetch(
        `${apiUrl}/admin/categories?page=1&limit=100`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          cache: "no-store",
        },
      );

      if (response.status === 401 || response.status === 403) {
        await supabase.auth.signOut();
        router.replace("/admin/login");
        return;
      }

      if (!response.ok) {
        throw new Error();
      }

      const payload =
        (await response.json()) as CategoriesResponse;

      setCategories(payload.data);

      const firstActive = payload.data.find(
        (category) => category.isActive,
      );

      if (firstActive) {
        setCategoryId((current) => current || firstActive.id);
      }
    } catch {
      setError(
        "Impossible de charger les catégories. Réessayez avant de créer le produit.",
      );
    } finally {
      setIsLoadingCategories(false);
    }
  }, [router, supabase]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  function handleNameChange(value: string) {
    setName(value);

    if (!slugTouched) {
      setSlug(slugify(value));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const normalizedName = name.trim();
    const normalizedSlug = slug.trim();
    const priceCents = parseMoneyToCents(price);
    const compareAtPriceCents =
      compareAtPrice.trim() === ""
        ? undefined
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

    const parsedQuantity = Number(quantity);
    const parsedLowStockThreshold = Number(lowStockThreshold);

    if (
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity < 0
    ) {
      setError(
        "La quantité en stock doit être un entier positif ou égal à 0.",
      );
      return;
    }

    if (
      !Number.isInteger(parsedLowStockThreshold) ||
      parsedLowStockThreshold < 0
    ) {
      setError(
        "Le seuil de stock faible doit être un entier positif ou égal à 0.",
      );
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
        setError("NEXT_PUBLIC_API_URL n’est pas configurée.");
        return;
      }

      const payload = {
        name: normalizedName,
        slug: normalizedSlug,
        categoryId,
        description: description.trim() || undefined,
        shortDescription:
          shortDescription.trim() || undefined,
        priceCents,
        compareAtPriceCents:
          compareAtPriceCents ?? undefined,
        badge: badge || undefined,
        occasions:
          occasionValues.length > 0
            ? occasionValues
            : undefined,
        isActive,
        isPersonalizable:
          personalizationPayload?.isPersonalizable ?? false,
        personalizationPrompt:
          personalizationPayload?.personalizationPrompt,
        personalizationConfig:
          personalizationPayload?.personalizationConfig ?? undefined,
        metaTitle: metaTitle.trim() || undefined,
        metaDescription:
          metaDescription.trim() || undefined,
        inventory: {
          quantity: parsedQuantity,
          lowStockThreshold: parsedLowStockThreshold,
          trackInventory,
        },
      };

      const response = await fetch(
        `${apiUrl}/admin/products`,
        {
          method: "POST",
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
            "Impossible de créer le produit.",
          ),
        );
        return;
      }

      await response.json() as CreatedProduct;

      router.push("/admin/products");
      router.refresh();
    } catch {
      setError(
        "Une erreur est survenue pendant la création du produit.",
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

  return (
    <div>
      <PageHeader
        title="Ajouter un produit"
        description="Créez la fiche principale du produit. Les images et variantes seront gérées à l’étape suivante."
        action={
          <Link
            href="/admin/products"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-black/[0.08] bg-white px-4 text-sm font-semibold text-neutral-600 shadow-sm transition hover:bg-neutral-50 hover:text-neutral-900"
          >
            Annuler
          </Link>
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
                <label htmlFor="name" className={labelClassName}>
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
                <label htmlFor="slug" className={labelClassName}>
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
                  Utilisé dans l’URL. Lettres minuscules, chiffres
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
                <label htmlFor="price" className={labelClassName}>
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
                  placeholder="3500"
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
                  placeholder="4500"
                  className={inputClassName}
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="badge" className={labelClassName}>
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
                  {BADGES.map((item) => (
                    <option
                      key={item.value || "none"}
                      value={item.value}
                    >
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-[0_8px_30px_rgba(23,23,20,0.035)] sm:p-6">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                Catalogue
              </p>
              <h2 className="mt-1 text-lg font-semibold tracking-[-0.025em] text-neutral-950">
                Organisation et personnalisation
              </h2>
            </div>

            <div className="grid gap-5">
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
                  placeholder="anniversaire, mariage, naissance"
                  className={inputClassName}
                />
                <p className="mt-1.5 text-[11px] text-neutral-400">
                  Séparez les occasions par des virgules.
                </p>
              </div>

              <PersonalizationSection
                ref={personalizationRef}
                inputClassName={inputClassName}
                textareaClassName={textareaClassName}
                labelClassName={labelClassName}
              />
            </div>
          </section>

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
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-[98px] xl:self-start">
          <section className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-[0_8px_30px_rgba(23,23,20,0.035)]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
              Publication
            </p>

            <label className="mt-4 flex cursor-pointer items-start justify-between gap-4 rounded-xl bg-[#faf9f6] p-4">
              <div>
                <p className="text-sm font-semibold text-neutral-900">
                  Produit actif
                </p>
                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  Le produit pourra être proposé au catalogue.
                </p>
              </div>

              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) =>
                  setIsActive(event.target.checked)
                }
                className="mt-1 h-4 w-4 accent-neutral-950"
              />
            </label>
          </section>

          <section className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-[0_8px_30px_rgba(23,23,20,0.035)]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
              Stock initial
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="quantity"
                  className={labelClassName}
                >
                  Quantité
                </label>
                <input
                  id="quantity"
                  type="number"
                  min="0"
                  step="1"
                  value={quantity}
                  onChange={(event) =>
                    setQuantity(event.target.value)
                  }
                  className={inputClassName}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="lowStockThreshold"
                  className={labelClassName}
                >
                  Seuil stock faible
                </label>
                <input
                  id="lowStockThreshold"
                  type="number"
                  min="0"
                  step="1"
                  value={lowStockThreshold}
                  onChange={(event) =>
                    setLowStockThreshold(event.target.value)
                  }
                  className={inputClassName}
                  required
                />
              </div>

              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-[#faf9f6] px-4 py-3">
                <span className="text-sm font-medium text-neutral-700">
                  Suivre le stock
                </span>
                <input
                  type="checkbox"
                  checked={trackInventory}
                  onChange={(event) =>
                    setTrackInventory(event.target.checked)
                  }
                  className="h-4 w-4 accent-neutral-950"
                />
              </label>
            </div>

            <p className="mt-4 text-[11px] leading-5 text-neutral-400">
              Ce stock est créé au niveau du produit. Les
              variantes seront ajoutées séparément ensuite.
            </p>
          </section>

          <button
            type="submit"
            disabled={
              isSubmitting ||
              isLoadingCategories ||
              activeCategories.length === 0
            }
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isSubmitting ? (
              <>
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                  aria-hidden="true"
                />
                Création…
              </>
            ) : (
              "Créer le produit"
            )}
          </button>

          <p className="px-2 text-center text-[11px] leading-5 text-neutral-400">
            Les images et variantes seront ajoutées après la
            création de la fiche principale.
          </p>
        </aside>
      </form>
    </div>
  );
}
