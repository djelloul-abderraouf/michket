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
import {
  ProductCategorySelector,
  type ProductAdminCategory,
  type ProductCategorySelection,
} from "@/components/admin/products/ProductCategorySelector";
import {
  ProductGalleryManager,
  type DraftProductImage,
} from "@/components/admin/products/ProductGalleryManager";
import PersonalizationSection, {
  type PersonalizationSectionHandle,
} from "@/components/admin/products/PersonalizationSection";
import { createClient } from "@/lib/supabase/client";

type CategoriesResponse = {
  data: ProductAdminCategory[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

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

type ProductVariant = {
  id: string;
  productId: string;
  name: string;
  sku: string | null;
  colorName: string | null;
  colorHex: string | null;
  isMulticolor: boolean;
  priceCents: number | null;
  sortOrder: number;
  isActive: boolean;
};

type DraftVariant = {
  id: string;
  name: string;
  sku: string | null;
  colorName: string | null;
  colorHex: string | null;
  isMulticolor: boolean;
  priceCents: number | null;
  sortOrder: number;
};

type ProductDetails = {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  subcategoryId: string | null;
  subsubcategoryId: string | null;
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

type VariantFormData = {
  name: string;
  colorName: string;
  colorHex: string;
  isMulticolor: boolean;
  sku: string;
  price: string;
};

type ColorPresetKey =
  | "red"
  | "green"
  | "blue"
  | "pink"
  | "sky"
  | "yellow"
  | "white"
  | "multicolor"
  | "custom";

type ColorPreset = {
  key: Exclude<ColorPresetKey, "custom">;
  label: string;
  hex: string | null;
  isMulticolor: boolean;
};

const COLOR_PRESETS: ColorPreset[] = [
  { key: "red", label: "Rouge", hex: "#FF3B30", isMulticolor: false },
  { key: "green", label: "Vert", hex: "#34C759", isMulticolor: false },
  { key: "blue", label: "Bleu", hex: "#007AFF", isMulticolor: false },
  { key: "pink", label: "Rose", hex: "#FF2D55", isMulticolor: false },
  { key: "sky", label: "Bleu ciel", hex: "#5AC8FA", isMulticolor: false },
  { key: "yellow", label: "Jaune", hex: "#FFCC00", isMulticolor: false },
  { key: "white", label: "Blanc", hex: "#FFFFFF", isMulticolor: false },
  { key: "multicolor", label: "Multicolore", hex: null, isMulticolor: true },
];

const MULTICOLOR_SWATCH =
  "conic-gradient(from 0deg, #FF3B30, #FF9500, #FFCC00, #34C759, #00C7BE, #007AFF, #5856D6, #AF52DE, #FF2D55, #FF3B30)";

function findPresetForColor(
  colorName: string | null | undefined,
  colorHex: string | null | undefined,
  isMulticolor: boolean,
): ColorPreset["key"] | null {
  if (isMulticolor) return "multicolor";

  const normalizedName = (colorName ?? "").trim().toLowerCase();
  const normalizedHex = (colorHex ?? "").trim().toUpperCase();

  const preset = COLOR_PRESETS.find((item) =>
    !item.isMulticolor &&
    (item.label.toLowerCase() === normalizedName ||
      item.hex?.toUpperCase() === normalizedHex),
  );

  return preset?.key ?? null;
}

type EditingVariant =
  | {
      source: "draft";
      id: string;
      name: string;
    }
  | {
      source: "saved";
      id: string;
      name: string;
    }
  | null;

const BADGES = [
  { value: "", label: "Aucun badge" },
  { value: "BEST_SELLER", label: "Meilleure vente" },
  { value: "NOUVEAU", label: "Nouveau" },
  { value: "PROMO", label: "Promotion" },
  {
    value: "PERSONNALISABLE",
    label: "Personnalisable",
  },
  {
    value: "ENVOI_GRATUIT",
    label: "Envoi gratuit",
  },
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

function formatCentsToMoney(cents: number | null) {
  if (cents == null) {
    return "";
  }

  return (cents / 100).toFixed(2);
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

function makeDraftId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `draft-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

export default function NewAdminProductPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [token, setToken] = useState("");
  const [categories, setCategories] = useState<
    ProductAdminCategory[]
  >([]);
  const [isLoadingCategories, setIsLoadingCategories] =
    useState(true);

  const [createdProductId, setCreatedProductId] = useState<
    string | null
  >(null);
  const [productDetails, setProductDetails] =
    useState<ProductDetails | null>(null);
  const [isLoadingProductDetails, setIsLoadingProductDetails] =
    useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [categorySelection, setCategorySelection] =
    useState<ProductCategorySelection>({
      categoryId: "",
      subcategoryId: "",
      subsubcategoryId: "",
    });

  const [shortDescription, setShortDescription] =
    useState("");
  const [description, setDescription] = useState("");

  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] =
    useState("");
  const [badge, setBadge] = useState("");
  const [occasions, setOccasions] = useState("");
  const [isActive, setIsActive] = useState(true);

  const personalizationRef =
    useRef<PersonalizationSectionHandle>(null);

  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] =
    useState("");

  // Everything below can now be prepared BEFORE the product exists.
  const [draftVariants, setDraftVariants] = useState<
    DraftVariant[]
  >([]);
  const [draftImages, setDraftImages] = useState<
    DraftProductImage[]
  >([]);

  const [showVariantForm, setShowVariantForm] =
    useState(false);
  const [editingVariant, setEditingVariant] =
    useState<EditingVariant>(null);
  const [variantForm, setVariantForm] =
    useState<VariantFormData>({
      name: "",
      colorName: "",
      colorHex: "",
      isMulticolor: false,
      sku: "",
      price: "",
    });
  const [selectedColorMode, setSelectedColorMode] =
    useState<ColorPresetKey | null>(null);
  const [savingVariant, setSavingVariant] =
    useState(false);
  const [variantError, setVariantError] = useState<
    string | null
  >(null);
  const [
    updatingVariantStatusId,
    setUpdatingVariantStatusId,
  ] = useState<string | null>(null);

  const activeCategories = useMemo(
    () =>
      categories.filter((category) => category.isActive),
    [categories],
  );

  const visibleVariants = useMemo(() => {
    if (createdProductId) {
      return productDetails?.variants ?? [];
    }

    return draftVariants;
  }, [createdProductId, draftVariants, productDetails]);

  const galleryVariantOptions = useMemo(
    () =>
      visibleVariants.map((variant) => ({
        id: variant.id,
        name: variant.name,
        colorName: variant.colorName,
        colorHex: variant.colorHex,
      })),
    [visibleVariants],
  );

  const inputClassName =
    "h-11 w-full rounded-xl border border-black/[0.09] bg-white px-3.5 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-950/5 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400";

  const textareaClassName =
    "w-full rounded-xl border border-black/[0.09] bg-white px-3.5 py-3 text-sm leading-6 text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-950/5";

  const labelClassName =
    "mb-2 block text-xs font-semibold text-neutral-700";

  const loadProductDetails = useCallback(
    async (productId: string, accessToken: string) => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        setError(
          "NEXT_PUBLIC_API_URL n’est pas configurée.",
        );
        return;
      }

      setIsLoadingProductDetails(true);

      try {
        const response = await fetch(
          `${apiUrl}/admin/products/${productId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            cache: "no-store",
          },
        );

        if (
          response.status === 401 ||
          response.status === 403
        ) {
          await supabase.auth.signOut();
          router.replace("/admin/login");
          return;
        }

        if (!response.ok) {
          throw new Error(
            "Impossible de recharger le produit.",
          );
        }

        const details =
          (await response.json()) as ProductDetails;

        setProductDetails(details);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Impossible de recharger le produit.",
        );
      } finally {
        setIsLoadingProductDetails(false);
      }
    },
    [router, supabase],
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

      setToken(session.access_token);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        setError(
          "NEXT_PUBLIC_API_URL n’est pas configurée.",
        );
        return;
      }

      const allCategories: ProductAdminCategory[] = [];

      let page = 1;
      let totalPages = 1;

      do {
        const response = await fetch(
          `${apiUrl}/admin/categories?page=${page}&limit=100`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
            cache: "no-store",
          },
        );

        if (
          response.status === 401 ||
          response.status === 403
        ) {
          await supabase.auth.signOut();
          router.replace("/admin/login");
          return;
        }

        if (!response.ok) {
          throw new Error();
        }

        const payload =
          (await response.json()) as CategoriesResponse;

        allCategories.push(...(payload.data ?? []));

        totalPages = payload.meta?.totalPages ?? 1;
        page += 1;
      } while (page <= totalPages);

      setCategories(allCategories);
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

  function validateBaseForm() {
    const normalizedName = name.trim();
    const normalizedSlug = slug.trim();

    if (!normalizedName) {
      return {
        ok: false as const,
        message:
          "Le nom du produit est obligatoire.",
      };
    }

    if (
      !normalizedSlug ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
        normalizedSlug,
      )
    ) {
      return {
        ok: false as const,
        message:
          "Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets.",
      };
    }

    if (!categorySelection.categoryId) {
      return {
        ok: false as const,
        message:
          "Sélectionnez une catégorie principale.",
      };
    }

    if (!categorySelection.subcategoryId) {
      return {
        ok: false as const,
        message:
          "Sélectionnez une sous-catégorie.",
      };
    }

    const priceCents = parseMoneyToCents(price);

    if (priceCents === null) {
      return {
        ok: false as const,
        message: "Saisissez un prix valide.",
      };
    }

    const compareAtPriceCents =
      compareAtPrice.trim() === ""
        ? null
        : parseMoneyToCents(compareAtPrice);

    if (
      compareAtPrice.trim() !== "" &&
      compareAtPriceCents === null
    ) {
      return {
        ok: false as const,
        message:
          "Saisissez un ancien prix valide.",
      };
    }

    const occasionValues = occasions
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (occasionValues.length > 30) {
      return {
        ok: false as const,
        message:
          "Vous pouvez saisir au maximum 30 occasions.",
      };
    }

    const personalizationPayload =
      personalizationRef.current?.getPayload();

    const personalizationErrors =
      personalizationRef.current?.getValidationErrors() ??
      [];

    if (personalizationErrors.length > 0) {
      return {
        ok: false as const,
        message: personalizationErrors[0],
      };
    }

    return {
      ok: true as const,
      data: {
        normalizedName,
        normalizedSlug,
        priceCents,
        compareAtPriceCents,
        occasionValues,
        personalizationPayload,
      },
    };
  }

  function buildVariantPayload(
    source: VariantFormData,
  ) {
    const variantName = source.name.trim();

    if (!variantName) {
      return {
        ok: false as const,
        message:
          "Le nom de la variante est obligatoire.",
      };
    }

    if (
      !source.isMulticolor &&
      source.colorHex.trim() &&
      !/^#[0-9A-Fa-f]{6}$/.test(
        source.colorHex.trim(),
      )
    ) {
      return {
        ok: false as const,
        message:
          "Le code couleur doit être au format #RRGGBB.",
      };
    }

    const variantPrice =
      source.price.trim() === ""
        ? null
        : parseMoneyToCents(source.price);

    if (
      source.price.trim() !== "" &&
      variantPrice === null
    ) {
      return {
        ok: false as const,
        message:
          "Le prix de la variante est invalide.",
      };
    }

    return {
      ok: true as const,
      data: {
        name: variantName,
        sku: source.sku.trim() || null,
        colorName:
          source.colorName.trim() ||
          (source.isMulticolor
            ? "Multicolore"
            : null),
        colorHex: source.isMulticolor
          ? null
          : source.colorHex.trim() || null,
        isMulticolor: source.isMulticolor,
        priceCents: variantPrice,
      },
    };
  }

  async function registerVariant(
    apiUrl: string,
    accessToken: string,
    productId: string,
    variant: DraftVariant,
  ): Promise<ProductVariant> {
    const response = await fetch(
      `${apiUrl}/admin/products/${productId}/variants`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: variant.name,
          sku: variant.sku,
          colorName: variant.colorName,
          colorHex: variant.colorHex,
          isMulticolor: variant.isMulticolor,
          priceCents: variant.priceCents,
          sortOrder: variant.sortOrder,
        }),
      },
    );

    if (!response.ok) {
      let payload: ApiErrorPayload | null = null;

      try {
        payload =
          (await response.json()) as ApiErrorPayload;
      } catch {}

      throw new Error(
        getApiErrorMessage(
          payload,
          `Impossible de créer la variante « ${variant.name} ».`,
        ),
      );
    }

    return response.json() as Promise<ProductVariant>;
  }

  async function registerDraftImage(
    apiUrl: string,
    accessToken: string,
    productId: string,
    image: DraftProductImage,
    variantIdMap: Map<string, string>,
  ) {
    const formData = new FormData();
    formData.append("file", image.file);

    const uploadResponse = await fetch(
      `${apiUrl}/media/product-images`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      },
    );

    if (!uploadResponse.ok) {
      let payload: ApiErrorPayload | null = null;

      try {
        payload =
          (await uploadResponse.json()) as ApiErrorPayload;
      } catch {}

      throw new Error(
        getApiErrorMessage(
          payload,
          `Impossible d’envoyer l’image « ${image.file.name} ».`,
        ),
      );
    }

    const uploaded = (await uploadResponse.json()) as {
      url: string;
      path: string;
    };

    const mappedVariantId = image.variantId
      ? variantIdMap.get(image.variantId) ?? null
      : null;

    const addResponse = await fetch(
      `${apiUrl}/admin/products/${productId}/images`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: uploaded.url,
          storagePath: uploaded.path,
          altText: image.altText.trim(),
          sortOrder: image.sortOrder,
          isPrimary: image.isPrimary,
          variantId: mappedVariantId,
        }),
      },
    );

    if (!addResponse.ok) {
      await fetch(`${apiUrl}/media/product-images`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storagePath: uploaded.path,
        }),
      }).catch(() => {});

      let payload: ApiErrorPayload | null = null;

      try {
        payload =
          (await addResponse.json()) as ApiErrorPayload;
      } catch {}

      throw new Error(
        getApiErrorMessage(
          payload,
          `Impossible d’enregistrer l’image « ${image.file.name} ».`,
        ),
      );
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const validation = validateBaseForm();

    if (!validation.ok) {
      setError(validation.message);
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

      setToken(session.access_token);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        setError(
          "NEXT_PUBLIC_API_URL n’est pas configurée.",
        );
        return;
      }

      const {
        normalizedName,
        normalizedSlug,
        priceCents,
        compareAtPriceCents,
        occasionValues,
        personalizationPayload,
      } = validation.data;

      if (!createdProductId) {
        const payload = {
          name: normalizedName,
          slug: normalizedSlug,
          categoryId: categorySelection.categoryId,
          subcategoryId:
            categorySelection.subcategoryId,
          subsubcategoryId:
            categorySelection.subsubcategoryId ||
            undefined,
          description:
            description.trim() || undefined,
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
            personalizationPayload?.isPersonalizable ??
            false,
          personalizationPrompt:
            personalizationPayload?.personalizationPrompt,
          personalizationConfig:
            personalizationPayload?.personalizationConfig ??
            undefined,
          metaTitle:
            metaTitle.trim() || undefined,
          metaDescription:
            metaDescription.trim() || undefined,
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

        if (
          response.status === 401 ||
          response.status === 403
        ) {
          await supabase.auth.signOut();
          router.replace("/admin/login");
          return;
        }

        if (!response.ok) {
          let errorPayload: ApiErrorPayload | null =
            null;

          try {
            errorPayload =
              (await response.json()) as ApiErrorPayload;
          } catch {}

          setError(
            getApiErrorMessage(
              errorPayload,
              "Impossible de créer le produit.",
            ),
          );
          return;
        }

        const created =
          (await response.json()) as CreatedProduct;

        // From this exact moment, retries must update this product instead
        // of accidentally creating a duplicate base product.
        setCreatedProductId(created.id);

        try {
          const variantIdMap = new Map<
            string,
            string
          >();

          for (const variant of draftVariants) {
            const createdVariant =
              await registerVariant(
                apiUrl,
                session.access_token,
                created.id,
                variant,
              );

            variantIdMap.set(
              variant.id,
              createdVariant.id,
            );
          }

          for (const image of [...draftImages].sort(
            (a, b) => a.sortOrder - b.sortOrder,
          )) {
            await registerDraftImage(
              apiUrl,
              session.access_token,
              created.id,
              image,
              variantIdMap,
            );
          }

          draftImages.forEach((image) => {
            URL.revokeObjectURL(image.previewUrl);
          });

          setDraftVariants([]);
          setDraftImages([]);

          await loadProductDetails(
            created.id,
            session.access_token,
          );

          setSuccess(
            "Le produit a été créé avec ses variantes et ses images.",
          );
        } catch (finalizationError) {
          await loadProductDetails(
            created.id,
            session.access_token,
          );

          setError(
            finalizationError instanceof Error
              ? `La fiche produit a bien été créée, mais une partie de la configuration n’a pas pu être enregistrée : ${finalizationError.message}`
              : "La fiche produit a bien été créée, mais une partie de la configuration n’a pas pu être enregistrée.",
          );
        }

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        return;
      }

      const payload: Record<string, unknown> = {
        name: normalizedName,
        slug: normalizedSlug,
        categoryId: categorySelection.categoryId,
        subcategoryId:
          categorySelection.subcategoryId,
        subsubcategoryId:
          categorySelection.subsubcategoryId || null,
        description: description.trim() || null,
        shortDescription:
          shortDescription.trim() || null,
        priceCents,
        compareAtPriceCents,
        badge: badge || null,
        occasions: occasionValues,
        isActive,
        isPersonalizable:
          personalizationPayload?.isPersonalizable ??
          false,
        personalizationPrompt:
          personalizationPayload?.personalizationPrompt ??
          null,
        personalizationConfig:
          personalizationPayload?.personalizationConfig ??
          null,
        metaTitle: metaTitle.trim() || null,
        metaDescription:
          metaDescription.trim() || null,
      };

      const response = await fetch(
        `${apiUrl}/admin/products/${createdProductId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        let errorPayload: ApiErrorPayload | null =
          null;

        try {
          errorPayload =
            (await response.json()) as ApiErrorPayload;
        } catch {}

        setError(
          getApiErrorMessage(
            errorPayload,
            "Impossible d’enregistrer les modifications.",
          ),
        );
        return;
      }

      await loadProductDetails(
        createdProductId,
        session.access_token,
      );

      setSuccess(
        "Les informations du produit ont été enregistrées.",
      );
    } catch {
      setError(
        createdProductId
          ? "Une erreur est survenue pendant l’enregistrement du produit."
          : "Une erreur est survenue pendant la création du produit.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function applyColorPreset(preset: ColorPreset) {
    setSelectedColorMode(preset.key);

    setVariantForm((current) => {
      const previousColorName = current.colorName.trim();
      const shouldSyncVariantName =
        !current.name.trim() ||
        current.name.trim() === previousColorName;

      return {
        ...current,
        name: shouldSyncVariantName
          ? preset.label
          : current.name,
        colorName: preset.label,
        colorHex: preset.hex ?? "",
        isMulticolor: preset.isMulticolor,
      };
    });
  }

  function chooseCustomColor() {
    setSelectedColorMode("custom");

    setVariantForm((current) => ({
      ...current,
      isMulticolor: false,
      colorName:
        current.isMulticolor &&
        current.colorName.trim().toLowerCase() ===
          "multicolore"
          ? ""
          : current.colorName,
      colorHex:
        current.isMulticolor || !current.colorHex
          ? "#8B5CF6"
          : current.colorHex,
    }));
  }

  function openAddVariant() {
    setEditingVariant(null);
    setVariantError(null);
    setSelectedColorMode(null);
    setVariantForm({
      name: "",
      colorName: "",
      colorHex: "",
      isMulticolor: false,
      sku: "",
      price: "",
    });
    setShowVariantForm(true);
  }

  function openEditDraftVariant(
    variant: DraftVariant,
  ) {
    setEditingVariant({
      source: "draft",
      id: variant.id,
      name: variant.name,
    });
    setVariantError(null);
    setSelectedColorMode(
      findPresetForColor(
        variant.colorName,
        variant.colorHex,
        variant.isMulticolor,
      ) ?? "custom",
    );
    setVariantForm({
      name: variant.name,
      colorName: variant.colorName ?? "",
      colorHex: variant.colorHex ?? "#8B5CF6",
      isMulticolor: variant.isMulticolor,
      sku: variant.sku ?? "",
      price:
        variant.priceCents != null
          ? formatCentsToMoney(variant.priceCents)
          : "",
    });
    setShowVariantForm(true);
  }

  function openEditSavedVariant(
    variant: ProductVariant,
  ) {
    setEditingVariant({
      source: "saved",
      id: variant.id,
      name: variant.name,
    });
    setVariantError(null);
    setSelectedColorMode(
      findPresetForColor(
        variant.colorName,
        variant.colorHex,
        variant.isMulticolor,
      ) ?? "custom",
    );
    setVariantForm({
      name: variant.name,
      colorName: variant.colorName ?? "",
      colorHex: variant.colorHex ?? "#8B5CF6",
      isMulticolor: variant.isMulticolor,
      sku: variant.sku ?? "",
      price:
        variant.priceCents != null
          ? formatCentsToMoney(variant.priceCents)
          : "",
    });
    setShowVariantForm(true);
  }

  async function handleSaveVariant() {
    const validation = buildVariantPayload(variantForm);

    if (!validation.ok) {
      setVariantError(validation.message);
      return;
    }

    setVariantError(null);

    // Before first product creation: keep the variant locally.
    if (!createdProductId) {
      const data = validation.data;

      if (
        editingVariant &&
        editingVariant.source === "draft"
      ) {
        setDraftVariants((current) =>
          current.map((variant) =>
            variant.id === editingVariant.id
              ? {
                  ...variant,
                  ...data,
                }
              : variant,
          ),
        );
      } else {
        setDraftVariants((current) => [
          ...current,
          {
            id: makeDraftId(),
            ...data,
            sortOrder: current.length,
          },
        ]);
      }

      setShowVariantForm(false);
      setEditingVariant(null);
      setSelectedColorMode(null);
      return;
    }

    if (!token) {
      setVariantError(
        "Votre session admin n’est plus disponible.",
      );
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      setVariantError(
        "NEXT_PUBLIC_API_URL n’est pas configurée.",
      );
      return;
    }

    setSavingVariant(true);

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const editingSaved =
        editingVariant?.source === "saved"
          ? editingVariant
          : null;

      const response = await fetch(
        editingSaved
          ? `${apiUrl}/admin/products/${createdProductId}/variants/${editingSaved.id}`
          : `${apiUrl}/admin/products/${createdProductId}/variants`,
        {
          method: editingSaved ? "PUT" : "POST",
          headers,
          body: JSON.stringify(validation.data),
        },
      );

      if (!response.ok) {
        let payload: ApiErrorPayload | null = null;

        try {
          payload =
            (await response.json()) as ApiErrorPayload;
        } catch {}

        throw new Error(
          getApiErrorMessage(
            payload,
            editingSaved
              ? "Impossible de modifier la variante."
              : "Impossible de créer la variante.",
          ),
        );
      }

      setShowVariantForm(false);
      setEditingVariant(null);
      setSelectedColorMode(null);

      await loadProductDetails(
        createdProductId,
        token,
      );

      setSuccess(
        editingSaved
          ? "La variante a été mise à jour."
          : "La variante a été ajoutée.",
      );
    } catch (variantSaveError) {
      setVariantError(
        variantSaveError instanceof Error
          ? variantSaveError.message
          : "Impossible d’enregistrer la variante.",
      );
    } finally {
      setSavingVariant(false);
    }
  }

  function removeDraftVariant(
    variantId: string,
  ) {
    setDraftVariants((current) =>
      current
        .filter((variant) => variant.id !== variantId)
        .map((variant, index) => ({
          ...variant,
          sortOrder: index,
        })),
    );

    setDraftImages((current) =>
      current.map((image) =>
        image.variantId === variantId
          ? {
              ...image,
              variantId: null,
            }
          : image,
      ),
    );

    if (
      editingVariant?.source === "draft" &&
      editingVariant.id === variantId
    ) {
      setEditingVariant(null);
      setShowVariantForm(false);
    }
  }

  async function toggleVariantActive(
    variant: ProductVariant,
  ) {
    if (!createdProductId || !token) {
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      return;
    }

    setUpdatingVariantStatusId(variant.id);
    setVariantError(null);

    try {
      const response = await fetch(
        `${apiUrl}/admin/products/${createdProductId}/variants/${variant.id}`,
        {
          method: variant.isActive
            ? "DELETE"
            : "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            ...(variant.isActive
              ? {}
              : {
                  "Content-Type": "application/json",
                }),
          },
          ...(variant.isActive
            ? {}
            : {
                body: JSON.stringify({
                  isActive: true,
                }),
              }),
        },
      );

      if (!response.ok) {
        let payload: ApiErrorPayload | null = null;

        try {
          payload =
            (await response.json()) as ApiErrorPayload;
        } catch {}

        throw new Error(
          getApiErrorMessage(
            payload,
            variant.isActive
              ? "Impossible de désactiver la variante."
              : "Impossible de réactiver la variante.",
          ),
        );
      }

      await loadProductDetails(
        createdProductId,
        token,
      );
    } catch (statusError) {
      setVariantError(
        statusError instanceof Error
          ? statusError.message
          : "Impossible de modifier le statut de la variante.",
      );
    } finally {
      setUpdatingVariantStatusId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title={
          createdProductId
            ? `Configurer « ${name || "Produit"} »`
            : "Ajouter un produit"
        }
        description={
          createdProductId
            ? "La fiche existe. Vous pouvez encore modifier les informations, variantes, prix et images avant de terminer."
            : "Préparez toute la fiche, les variantes et les images avant de créer le produit."
        }
        action={
          <div className="flex flex-wrap gap-2">
            {createdProductId ? (
              <Link
                href={`/admin/products/${createdProductId}`}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-black/[0.08] bg-white px-4 text-sm font-semibold text-neutral-600 shadow-sm transition hover:bg-neutral-50 hover:text-neutral-900"
              >
                Voir la fiche
              </Link>
            ) : null}

            <Link
              href="/admin/products"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-black/[0.08] bg-white px-4 text-sm font-semibold text-neutral-600 shadow-sm transition hover:bg-neutral-50 hover:text-neutral-900"
            >
              {createdProductId
                ? "Retour aux produits"
                : "Annuler"}
            </Link>
          </div>
        }
      />

      {error ? (
        <div
          role="alert"
          className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
        >
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700">
          {success}
        </div>
      ) : null}

      {createdProductId ? (
        <div className="mb-5 rounded-2xl border border-emerald-200 bg-white p-5 shadow-[0_8px_30px_rgba(23,23,20,0.035)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">
                Fiche créée
              </p>
              <p className="mt-1 text-sm font-semibold text-neutral-900">
                Le produit est maintenant enregistré.
              </p>
              <p className="mt-1 text-xs leading-5 text-neutral-500">
                Vous pouvez encore modifier les variantes,
                leurs prix et les images sur cette même page.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/admin/products/${createdProductId}`,
                )
              }
              className="inline-flex min-h-10 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Terminer
            </button>
          </div>
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]"
      >
        <div className="space-y-5">
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
                    handleNameChange(
                      event.target.value,
                    )
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
                    setSlug(
                      event.target.value.toLowerCase(),
                    );
                  }}
                  placeholder="lampe-led-3d-anniversaire"
                  className={inputClassName}
                  required
                />
                <p className="mt-1.5 text-[11px] text-neutral-400">
                  Utilisé dans l’URL. Lettres
                  minuscules, chiffres et tirets
                  uniquement.
                </p>
              </div>

              <ProductCategorySelector
                categories={categories}
                value={categorySelection}
                onChange={setCategorySelection}
                disabled={isLoadingCategories}
                inputClassName={inputClassName}
                labelClassName={labelClassName}
              />

              {isLoadingCategories ? (
                <p className="-mt-2 text-[11px] text-neutral-400">
                  Chargement des catégories…
                </p>
              ) : activeCategories.length === 0 ? (
                <p className="-mt-2 text-[11px] font-medium text-red-600">
                  Aucune catégorie active
                  disponible.
                </p>
              ) : null}

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
                    setShortDescription(
                      event.target.value,
                    )
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
                    setDescription(
                      event.target.value,
                    )
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
                    setCompareAtPrice(
                      event.target.value,
                    )
                  }
                  placeholder="4500"
                  className={inputClassName}
                />
              </div>

              <div className="sm:col-span-2">
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
                    setOccasions(
                      event.target.value,
                    )
                  }
                  placeholder="anniversaire, mariage, naissance"
                  className={inputClassName}
                />
                <p className="mt-1.5 text-[11px] text-neutral-400">
                  Séparez les occasions par des
                  virgules.
                </p>
              </div>

              <PersonalizationSection
                ref={personalizationRef}
                inputClassName={inputClassName}
                textareaClassName={
                  textareaClassName
                }
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
                    setMetaTitle(
                      event.target.value,
                    )
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
                    setMetaDescription(
                      event.target.value,
                    )
                  }
                  className={textareaClassName}
                />
                <p className="mt-1.5 text-right text-[11px] text-neutral-400">
                  {metaDescription.length}/500
                </p>
              </div>
            </div>
          </section>

          {/* Variants are available immediately, even before the first save. */}
          <section className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-[0_8px_30px_rgba(23,23,20,0.035)] sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                  Variantes
                </p>
                <h2 className="mt-1 text-lg font-semibold text-neutral-950">
                  Déclinaisons et prix
                </h2>
                <p className="mt-1 max-w-2xl text-xs leading-5 text-neutral-500">
                  Ajoutez les couleurs ou modèles
                  dès maintenant. Chaque variante
                  peut avoir son propre prix.
                </p>
              </div>

              <button
                type="button"
                onClick={openAddVariant}
                className="inline-flex min-h-10 items-center justify-center rounded-xl bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                + Ajouter une variante
              </button>
            </div>

            {variantError ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {variantError}
              </div>
            ) : null}

            {showVariantForm ? (
              <div className="mt-5 rounded-2xl border border-black/[0.07] bg-[#faf9f6] p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-neutral-900">
                    {editingVariant
                      ? `Modifier « ${editingVariant.name} »`
                      : "Nouvelle variante"}
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setShowVariantForm(false);
                      setEditingVariant(null);
                      setSelectedColorMode(null);
                      setVariantError(null);
                    }}
                    className="text-xs font-semibold text-neutral-400 hover:text-neutral-700"
                  >
                    Fermer
                  </button>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className={labelClassName}>
                      Couleur de la variante
                    </label>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                      {COLOR_PRESETS.map((preset) => {
                        const isSelected =
                          selectedColorMode ===
                          preset.key;

                        return (
                          <button
                            key={preset.key}
                            type="button"
                            onClick={() =>
                              applyColorPreset(preset)
                            }
                            className={[
                              "flex min-h-12 items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition",
                              isSelected
                                ? "border-neutral-950 bg-neutral-950 text-white"
                                : "border-black/[0.08] bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50",
                            ].join(" ")}
                          >
                            <span
                              className="h-6 w-6 shrink-0 rounded-full border border-black/10"
                              style={
                                preset.isMulticolor
                                  ? { background: MULTICOLOR_SWATCH }
                                  : {
                                      backgroundColor:
                                        preset.hex ?? "#E5E5E5",
                                    }
                              }
                              aria-hidden="true"
                            />
                            <span className="text-xs font-semibold">
                              {preset.label}
                            </span>
                          </button>
                        );
                      })}

                      <button
                        type="button"
                        onClick={chooseCustomColor}
                        className={[
                          "flex min-h-12 items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition",
                          selectedColorMode === "custom"
                            ? "border-neutral-950 bg-neutral-950 text-white"
                            : "border-dashed border-black/[0.14] bg-white text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50",
                        ].join(" ")}
                      >
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-current text-sm font-bold">
                          +
                        </span>
                        <span className="text-xs font-semibold">
                          Autre couleur
                        </span>
                      </button>
                    </div>

                    <p className="mt-2 text-[11px] leading-5 text-neutral-400">
                      Choisissez une couleur prédéfinie ou utilisez
                      « Autre couleur » pour ajouter une teinte spéciale
                      à ce produit.
                    </p>
                  </div>

                  <div>
                    <label className={labelClassName}>
                      Nom *
                    </label>
                    <input
                      type="text"
                      value={variantForm.name}
                      onChange={(event) =>
                        setVariantForm((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                      placeholder="Ex. Rouge"
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label className={labelClassName}>
                      Nom de couleur
                    </label>
                    <input
                      type="text"
                      value={variantForm.colorName}
                      onChange={(event) =>
                        setVariantForm((current) => ({
                          ...current,
                          colorName: event.target.value,
                        }))
                      }
                      placeholder={
                        variantForm.isMulticolor
                          ? "Multicolore"
                          : "Ex. Beige"
                      }
                      disabled={
                        selectedColorMode !== "custom" &&
                        selectedColorMode !== null
                      }
                      className={inputClassName}
                    />
                  </div>

                  {variantForm.isMulticolor ? (
                    <div>
                      <span className={labelClassName}>
                        Aperçu couleur
                      </span>
                      <div className="flex h-11 items-center gap-3 rounded-xl border border-black/[0.08] bg-white px-3.5">
                        <span
                          className="h-7 w-7 rounded-full border border-black/[0.08]"
                          style={{ background: MULTICOLOR_SWATCH }}
                          aria-hidden="true"
                        />
                        <span className="text-sm text-neutral-600">
                          Multicolore
                        </span>
                      </div>
                    </div>
                  ) : selectedColorMode === "custom" ? (
                    <div>
                      <label className={labelClassName}>
                        Couleur personnalisée
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={
                            /^#[0-9A-Fa-f]{6}$/.test(variantForm.colorHex)
                              ? variantForm.colorHex
                              : "#8B5CF6"
                          }
                          onChange={(event) =>
                            setVariantForm((current) => ({
                              ...current,
                              colorHex:
                                event.target.value.toUpperCase(),
                            }))
                          }
                          className="h-11 w-12 rounded-xl border border-black/[0.09] bg-white p-1"
                          aria-label="Choisir une couleur personnalisée"
                        />
                        <input
                          type="text"
                          value={variantForm.colorHex}
                          onChange={(event) =>
                            setVariantForm((current) => ({
                              ...current,
                              colorHex:
                                event.target.value.toUpperCase(),
                            }))
                          }
                          placeholder="#8B5CF6"
                          maxLength={7}
                          className={inputClassName}
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <span className={labelClassName}>
                        Aperçu couleur
                      </span>
                      <div className="flex h-11 items-center gap-3 rounded-xl border border-black/[0.08] bg-white px-3.5">
                        <span
                          className="h-7 w-7 rounded-full border border-black/[0.12]"
                          style={{
                            backgroundColor:
                              variantForm.colorHex || "#E5E5E5",
                          }}
                          aria-hidden="true"
                        />
                        <span className="text-sm text-neutral-600">
                          {variantForm.colorName ||
                            "Choisissez une couleur"}
                        </span>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className={labelClassName}>
                      SKU
                    </label>
                    <input
                      type="text"
                      value={variantForm.sku}
                      onChange={(event) =>
                        setVariantForm((current) => ({
                          ...current,
                          sku: event.target.value,
                        }))
                      }
                      placeholder="Optionnel"
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label className={labelClassName}>
                      Prix spécifique (DZD)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={variantForm.price}
                      onChange={(event) =>
                        setVariantForm((current) => ({
                          ...current,
                          price: event.target.value,
                        }))
                      }
                      placeholder="Vide = prix du produit"
                      className={inputClassName}
                    />
                    <p className="mt-1.5 text-[11px] text-neutral-400">
                      Laissez vide pour utiliser le
                      prix principal du produit.
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={savingVariant}
                    onClick={() =>
                      void handleSaveVariant()
                    }
                    className="inline-flex min-h-10 items-center justify-center rounded-xl bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
                  >
                    {savingVariant
                      ? "Enregistrement…"
                      : editingVariant
                        ? "Enregistrer la variante"
                        : "Ajouter la variante"}
                  </button>

                  <button
                    type="button"
                    disabled={savingVariant}
                    onClick={() => {
                      setShowVariantForm(false);
                      setEditingVariant(null);
                      setSelectedColorMode(null);
                      setVariantError(null);
                    }}
                    className="inline-flex min-h-10 items-center justify-center rounded-xl border border-black/[0.08] bg-white px-4 text-sm font-semibold text-neutral-600"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : null}

            {isLoadingProductDetails &&
            createdProductId ? (
              <div className="mt-5 rounded-xl bg-[#faf9f6] px-4 py-8 text-center">
                <p className="text-sm font-medium text-neutral-500">
                  Chargement des variantes…
                </p>
              </div>
            ) : visibleVariants.length === 0 ? (
              <div className="mt-5 rounded-xl bg-[#faf9f6] px-4 py-8 text-center">
                <p className="text-sm font-medium text-neutral-500">
                  Aucune variante.
                </p>
              </div>
            ) : (
              <div className="mt-5 divide-y divide-black/[0.06] overflow-hidden rounded-xl border border-black/[0.06]">
                {visibleVariants.map((variant) => {
                  const isDraft =
                    !createdProductId;

                  return (
                    <div
                      key={variant.id}
                      className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        {variant.isMulticolor ? (
                          <span
                            className="h-9 w-9 shrink-0 rounded-xl border border-black/[0.08]"
                            style={{
                              background:
                                "conic-gradient(from 0deg, #FF3B30, #FF9500, #FFCC00, #34C759, #00C7BE, #007AFF, #5856D6, #AF52DE, #FF2D55, #FF3B30)",
                            }}
                            aria-hidden="true"
                          />
                        ) : variant.colorHex ? (
                          <span
                            className="h-9 w-9 shrink-0 rounded-xl border border-black/[0.08]"
                            style={{
                              backgroundColor:
                                variant.colorHex,
                            }}
                            aria-hidden="true"
                          />
                        ) : null}

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-semibold text-neutral-900">
                              {variant.name}
                            </p>

                            <span
                              className={[
                                "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                                isDraft
                                  ? "bg-amber-50 text-amber-700"
                                  : "isActive" in
                                        variant &&
                                      variant.isActive
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-neutral-100 text-neutral-500",
                              ].join(" ")}
                            >
                              {isDraft
                                ? "À créer"
                                : "isActive" in
                                      variant &&
                                    variant.isActive
                                  ? "Active"
                                  : "Inactive"}
                            </span>
                          </div>

                          <p className="mt-1 text-xs text-neutral-400">
                            {variant.sku ??
                              "Sans SKU"}
                            {" · "}
                            {variant.priceCents !=
                            null
                              ? `${formatCentsToMoney(
                                  variant.priceCents,
                                )} DZD`
                              : "Prix du produit"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (isDraft) {
                              openEditDraftVariant(
                                variant as DraftVariant,
                              );
                            } else {
                              openEditSavedVariant(
                                variant as ProductVariant,
                              );
                            }
                          }}
                          className="inline-flex min-h-9 items-center justify-center rounded-xl border border-black/[0.08] bg-white px-3 text-xs font-semibold text-neutral-600 transition hover:bg-neutral-50"
                        >
                          Modifier
                        </button>

                        {isDraft ? (
                          <button
                            type="button"
                            onClick={() =>
                              removeDraftVariant(
                                variant.id,
                              )
                            }
                            className="inline-flex min-h-9 items-center justify-center rounded-xl border border-red-200 bg-white px-3 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                          >
                            Retirer
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={
                              updatingVariantStatusId ===
                              variant.id
                            }
                            onClick={() =>
                              void toggleVariantActive(
                                variant as ProductVariant,
                              )
                            }
                            className={[
                              "inline-flex min-h-9 items-center justify-center rounded-xl border bg-white px-3 text-xs font-semibold transition disabled:opacity-50",
                              "isActive" in
                                variant &&
                              variant.isActive
                                ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                                : "border-emerald-200 text-emerald-700 hover:bg-emerald-50",
                            ].join(" ")}
                          >
                            {updatingVariantStatusId ===
                            variant.id
                              ? "…"
                              : "isActive" in
                                    variant &&
                                  variant.isActive
                                ? "Désactiver"
                                : "Réactiver"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Gallery is also available before the product exists. */}
          <section className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-[0_8px_30px_rgba(23,23,20,0.035)] sm:p-6">
            <ProductGalleryManager
              productId={createdProductId}
              images={productDetails?.images ?? []}
              draftImages={draftImages}
              variants={galleryVariantOptions}
              token={token}
              onDraftImagesChange={setDraftImages}
              onImagesChange={(nextImages) =>
                setProductDetails((current) =>
                  current
                    ? {
                        ...current,
                        images: nextImages,
                      }
                    : current,
                )
              }
            />
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
                  Le produit pourra être proposé
                  au catalogue.
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
                {createdProductId
                  ? "Enregistrement…"
                  : "Création complète…"}
              </>
            ) : createdProductId ? (
              "Enregistrer les informations"
            ) : (
              "Créer le produit"
            )}
          </button>

          {createdProductId ? (
            <button
              type="button"
              disabled={isLoadingProductDetails}
              onClick={() =>
                router.push(
                  `/admin/products/${createdProductId}`,
                )
              }
              className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-black/[0.08] bg-white px-4 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
            >
              Terminer la création
            </button>
          ) : null}

          <p className="px-2 text-center text-[11px] leading-5 text-neutral-400">
            {createdProductId
              ? "Les variantes, leurs prix et les images restent modifiables sur cette page."
              : "Préparez les variantes et les images avant de cliquer sur « Créer le produit ». Tout sera enregistré dans le même parcours."}
          </p>
        </aside>
      </form>
    </div>
  );
}
