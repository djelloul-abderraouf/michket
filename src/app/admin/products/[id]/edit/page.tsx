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
import {
  ProductCategorySelector,
  type ProductAdminCategory,
  type ProductCategorySelection,
} from "@/components/admin/products/ProductCategorySelector";
import { ProductGalleryManager } from "@/components/admin/products/ProductGalleryManager";
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
  inventory: InventoryRow | null;
  variants: ProductVariant[];
};

type ApiErrorPayload = {
  message?: string | string[];
  error?: string;
};

type VariantFormData = {
  name: string;
  colorName: string;
  colorHex: string;
  sku: string;
  price: string;
  quantity: string;
  lowStockThreshold: string;
  trackInventory: boolean;
};

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

function parseMoneyToCents(value: string) {
  const normalized = value.replace(",", ".").trim();

  if (!normalized) return null;

  const amount = Number(normalized);

  if (!Number.isFinite(amount) || amount < 0) {
    return null;
  }

  return Math.round(amount * 100);
}

function formatCentsToMoney(cents: number | null) {
  if (cents == null) return "";

  return (cents / 100).toFixed(2);
}

function getApiErrorMessage(
  payload: ApiErrorPayload | null,
  fallback: string,
) {
  if (!payload?.message) return fallback;

  return Array.isArray(payload.message)
    ? payload.message.join(" ")
    : payload.message;
}

function parseNonNegativeInteger(value: string) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

export default function EditAdminProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const productId = params.id;

  const [token, setToken] = useState("");
  const [product, setProduct] =
    useState<ProductDetails | null>(null);

  const [categories, setCategories] = useState<
    ProductAdminCategory[]
  >([]);
  const [isLoadingCategories, setIsLoadingCategories] =
    useState(true);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] =
    useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);
  const [success, setSuccess] =
    useState<string | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [
    categorySelection,
    setCategorySelection,
  ] = useState<ProductCategorySelection>({
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

  const [trackInventory, setTrackInventory] =
    useState(true);
  const [quantity, setQuantity] = useState("0");
  const [lowStockThreshold, setLowStockThreshold] =
    useState("5");
  const [savingProductInventory, setSavingProductInventory] =
    useState(false);

  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] =
    useState("");

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
      price: "",
      quantity: "0",
      lowStockThreshold: "5",
      trackInventory: true,
    });
  const [savingVariant, setSavingVariant] =
    useState(false);
  const [variantError, setVariantError] =
    useState<string | null>(null);
  const [
    updatingVariantStatusId,
    setUpdatingVariantStatusId,
  ] = useState<string | null>(null);

  const activeCategories = useMemo(
    () =>
      categories.filter(
        (category) => category.isActive,
      ),
    [categories],
  );

  const inputClassName =
    "h-11 w-full rounded-xl border border-black/[0.09] bg-white px-3.5 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-950/5 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400";

  const textareaClassName =
    "w-full rounded-xl border border-black/[0.09] bg-white px-3.5 py-3 text-sm leading-6 text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-950/5";

  const labelClassName =
    "mb-2 block text-xs font-semibold text-neutral-700";

  const applyProductToForm = useCallback(
    (data: ProductDetails) => {
      setName(data.name);
      setSlug(data.slug);
      setCategorySelection({
        categoryId: data.categoryId,
        subcategoryId:
          data.subcategoryId ?? "",
        subsubcategoryId:
          data.subsubcategoryId ?? "",
      });
      setShortDescription(
        data.shortDescription ?? "",
      );
      setDescription(data.description ?? "");
      setPrice(
        formatCentsToMoney(data.priceCents),
      );
      setCompareAtPrice(
        data.compareAtPriceCents != null
          ? formatCentsToMoney(
              data.compareAtPriceCents,
            )
          : "",
      );
      setBadge(data.badge ?? "");
      setOccasions(
        data.occasions?.join(", ") ?? "",
      );
      setIsActive(data.isActive);
      setMetaTitle(data.metaTitle ?? "");
      setMetaDescription(
        data.metaDescription ?? "",
      );

      if (
        data.variants.length === 0 &&
        data.inventory
      ) {
        setTrackInventory(
          data.inventory.trackInventory,
        );
        setQuantity(
          String(data.inventory.quantity),
        );
        setLowStockThreshold(
          String(
            data.inventory.lowStockThreshold,
          ),
        );
      }
    },
    [],
  );

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

      setToken(session.access_token);

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        setLoadError(
          "NEXT_PUBLIC_API_URL n'est pas configurée.",
        );
        return;
      }

      const response = await fetch(
        `${apiUrl}/admin/products/${productId}`,
        {
          headers: {
            Authorization:
              `Bearer ${session.access_token}`,
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
        setLoadError(
          response.status === 404
            ? "Produit introuvable."
            : "Impossible de charger le produit.",
        );
        return;
      }

      const data =
        (await response.json()) as ProductDetails;

      setProduct(data);
      applyProductToForm(data);
    } catch {
      setLoadError(
        "Une erreur est survenue lors du chargement du produit.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    applyProductToForm,
    productId,
    router,
    supabase,
  ]);

  const reloadProduct = useCallback(
    async (accessToken = token) => {
      if (!accessToken) return;

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) return;

      const response = await fetch(
        `${apiUrl}/admin/products/${productId}`,
        {
          headers: {
            Authorization:
              `Bearer ${accessToken}`,
          },
          cache: "no-store",
        },
      );

      if (!response.ok) return;

      const data =
        (await response.json()) as ProductDetails;

      setProduct(data);

      if (
        data.variants.length === 0 &&
        data.inventory
      ) {
        setTrackInventory(
          data.inventory.trackInventory,
        );
        setQuantity(
          String(data.inventory.quantity),
        );
        setLowStockThreshold(
          String(
            data.inventory.lowStockThreshold,
          ),
        );
      }
    },
    [productId, token],
  );

  const loadCategories = useCallback(async () => {
    setIsLoadingCategories(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        return;
      }

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        return;
      }

      const allCategories:
        ProductAdminCategory[] = [];

      let page = 1;
      let totalPages = 1;

      do {
        const response = await fetch(
          `${apiUrl}/admin/categories?page=${page}&limit=100`,
          {
            headers: {
              Authorization:
                `Bearer ${session.access_token}`,
            },
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error();
        }

        const data =
          (await response.json()) as CategoriesResponse;

        allCategories.push(...(data.data ?? []));
        totalPages = data.meta?.totalPages ?? 1;
        page += 1;
      } while (page <= totalPages);

      setCategories(allCategories);
    } catch {
      setError(
        "Impossible de charger les catégories.",
      );
    } finally {
      setIsLoadingCategories(false);
    }
  }, [supabase]);

  useEffect(() => {
    void loadProduct();
    void loadCategories();
  }, [loadCategories, loadProduct]);

  function validateMainForm() {
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

    const priceCents =
      parseMoneyToCents(price);

    if (priceCents === null) {
      return {
        ok: false as const,
        message:
          "Saisissez un prix valide.",
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

    if (
      personalizationErrors.length > 0
    ) {
      return {
        ok: false as const,
        message:
          personalizationErrors[0],
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

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const validation =
      validateMainForm();

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

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        setError(
          "NEXT_PUBLIC_API_URL n'est pas configurée.",
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

      const payload: Record<string, unknown> = {
        name: normalizedName,
        slug: normalizedSlug,
        categoryId:
          categorySelection.categoryId,
        subcategoryId:
          categorySelection.subcategoryId,
        subsubcategoryId:
          categorySelection.subsubcategoryId ||
          null,
        description:
          description.trim() || null,
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
        `${apiUrl}/admin/products/${productId}`,
        {
          method: "PUT",
          headers: {
            Authorization:
              `Bearer ${session.access_token}`,
            "Content-Type":
              "application/json",
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
        let errorPayload:
          | ApiErrorPayload
          | null = null;

        try {
          errorPayload =
            (await response.json()) as ApiErrorPayload;
        } catch {}

        setError(
          getApiErrorMessage(
            errorPayload,
            "Impossible de modifier le produit.",
          ),
        );
        return;
      }

      await reloadProduct(
        session.access_token,
      );

      setSuccess(
        "Les informations du produit ont été enregistrées.",
      );
    } catch {
      setError(
        "Une erreur est survenue pendant la modification du produit.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSaveProductInventory() {
    if (
      !product ||
      !token ||
      product.variants.length > 0
    ) {
      return;
    }

    const parsedQuantity =
      parseNonNegativeInteger(
        quantity,
      );
    const parsedThreshold =
      parseNonNegativeInteger(
        lowStockThreshold,
      );

    if (
      parsedQuantity === null ||
      parsedThreshold === null
    ) {
      setError(
        "Vérifiez la quantité et le seuil de stock.",
      );
      return;
    }

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      setError(
        "NEXT_PUBLIC_API_URL n'est pas configurée.",
      );
      return;
    }

    setSavingProductInventory(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        `${apiUrl}/admin/products/${productId}/inventory`,
        {
          method: "PUT",
          headers: {
            Authorization:
              `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            quantity: parsedQuantity,
            lowStockThreshold:
              parsedThreshold,
            trackInventory,
          }),
        },
      );

      if (!response.ok) {
        let payload:
          | ApiErrorPayload
          | null = null;

        try {
          payload =
            (await response.json()) as ApiErrorPayload;
        } catch {}

        throw new Error(
          getApiErrorMessage(
            payload,
            "Impossible de mettre à jour le stock.",
          ),
        );
      }

      await reloadProduct();
      setSuccess(
        "Le stock du produit a été mis à jour.",
      );
    } catch (inventoryError) {
      setError(
        inventoryError instanceof Error
          ? inventoryError.message
          : "Impossible de mettre à jour le stock.",
      );
    } finally {
      setSavingProductInventory(false);
    }
  }

  function openAddVariant() {
    const productInventory =
      product?.inventory;

    setEditingVariant(null);
    setVariantError(null);
    setVariantForm({
      name: "",
      colorName: "",
      colorHex: "#ECAB1C",
      sku: "",
      price: "",
      quantity: String(
        productInventory?.quantity ?? 0,
      ),
      lowStockThreshold: String(
        productInventory?.lowStockThreshold ??
          5,
      ),
      trackInventory:
        productInventory?.trackInventory ??
        true,
    });
    setShowVariantForm(true);
  }

  function openEditVariant(
    variant: ProductVariant,
  ) {
    setEditingVariant(variant);
    setVariantError(null);
    setVariantForm({
      name: variant.name,
      colorName:
        variant.colorName ?? "",
      colorHex:
        variant.colorHex ?? "#ECAB1C",
      sku: variant.sku ?? "",
      price:
        variant.priceCents != null
          ? formatCentsToMoney(
              variant.priceCents,
            )
          : "",
      quantity: String(
        variant.inventory?.quantity ?? 0,
      ),
      lowStockThreshold: String(
        variant.inventory
          ?.lowStockThreshold ?? 5,
      ),
      trackInventory:
        variant.inventory?.trackInventory ??
        true,
    });
    setShowVariantForm(true);
  }

  async function handleSaveVariant() {
    if (!product || !token) {
      return;
    }

    const variantName =
      variantForm.name.trim();

    if (!variantName) {
      setVariantError(
        "Le nom de la variante est obligatoire.",
      );
      return;
    }

    const quantityValue =
      parseNonNegativeInteger(
        variantForm.quantity,
      );
    const thresholdValue =
      parseNonNegativeInteger(
        variantForm.lowStockThreshold,
      );

    if (
      quantityValue === null ||
      thresholdValue === null
    ) {
      setVariantError(
        "Le stock et le seuil doivent être des entiers positifs ou égaux à 0.",
      );
      return;
    }

    const variantPrice =
      variantForm.price.trim() === ""
        ? null
        : parseMoneyToCents(
            variantForm.price,
          );

    if (
      variantForm.price.trim() !== "" &&
      variantPrice === null
    ) {
      setVariantError(
        "Le prix de la variante est invalide.",
      );
      return;
    }

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      setVariantError(
        "NEXT_PUBLIC_API_URL n'est pas configurée.",
      );
      return;
    }

    setSavingVariant(true);
    setVariantError(null);

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      if (editingVariant) {
        const variantResponse = await fetch(
          `${apiUrl}/admin/products/${productId}/variants/${editingVariant.id}`,
          {
            method: "PUT",
            headers,
            body: JSON.stringify({
              name: variantName,
              sku:
                variantForm.sku.trim() ||
                null,
              colorName:
                variantForm.colorName.trim() ||
                null,
              colorHex:
                variantForm.colorHex.trim() ||
                null,
              priceCents:
                variantPrice ?? undefined,
            }),
          },
        );

        if (!variantResponse.ok) {
          let payload:
            | ApiErrorPayload
            | null = null;

          try {
            payload =
              (await variantResponse.json()) as ApiErrorPayload;
          } catch {}

          throw new Error(
            getApiErrorMessage(
              payload,
              "Impossible de modifier la variante.",
            ),
          );
        }

        const inventoryResponse =
          await fetch(
            `${apiUrl}/admin/products/${productId}/inventory`,
            {
              method: "PUT",
              headers,
              body: JSON.stringify({
                variantId:
                  editingVariant.id,
                quantity: quantityValue,
                lowStockThreshold:
                  thresholdValue,
                trackInventory:
                  variantForm.trackInventory,
              }),
            },
          );

        if (!inventoryResponse.ok) {
          let payload:
            | ApiErrorPayload
            | null = null;

          try {
            payload =
              (await inventoryResponse.json()) as ApiErrorPayload;
          } catch {}

          throw new Error(
            getApiErrorMessage(
              payload,
              "La variante a été modifiée, mais son stock n'a pas pu être mis à jour.",
            ),
          );
        }
      } else {
        const response = await fetch(
          `${apiUrl}/admin/products/${productId}/variants`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              name: variantName,
              sku:
                variantForm.sku.trim() ||
                undefined,
              colorName:
                variantForm.colorName.trim() ||
                undefined,
              colorHex:
                variantForm.colorHex.trim() ||
                undefined,
              priceCents:
                variantPrice ?? undefined,
              inventory: {
                quantity: quantityValue,
                lowStockThreshold:
                  thresholdValue,
                trackInventory:
                  variantForm.trackInventory,
              },
            }),
          },
        );

        if (!response.ok) {
          let payload:
            | ApiErrorPayload
            | null = null;

          try {
            payload =
              (await response.json()) as ApiErrorPayload;
          } catch {}

          throw new Error(
            getApiErrorMessage(
              payload,
              "Impossible de créer la variante.",
            ),
          );
        }
      }

      setShowVariantForm(false);
      setEditingVariant(null);

      await reloadProduct();

      setSuccess(
        editingVariant
          ? "La variante et son stock ont été mis à jour."
          : "La variante a été ajoutée.",
      );
    } catch (variantSaveError) {
      setVariantError(
        variantSaveError instanceof Error
          ? variantSaveError.message
          : "Impossible d'enregistrer la variante.",
      );
    } finally {
      setSavingVariant(false);
    }
  }

  async function toggleVariantActive(
    variant: ProductVariant,
  ) {
    if (!token) {
      return;
    }

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) return;

    setUpdatingVariantStatusId(
      variant.id,
    );
    setVariantError(null);

    try {
      const response = await fetch(
        `${apiUrl}/admin/products/${productId}/variants/${variant.id}`,
        variant.isActive
          ? {
              method: "DELETE",
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          : {
              method: "PUT",
              headers: {
                Authorization:
                  `Bearer ${token}`,
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                isActive: true,
              }),
            },
      );

      if (!response.ok) {
        let payload:
          | ApiErrorPayload
          | null = null;

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

      await reloadProduct();
    } catch (statusError) {
      setVariantError(
        statusError instanceof Error
          ? statusError.message
          : "Impossible de modifier le statut de la variante.",
      );
    } finally {
      setUpdatingVariantStatusId(
        null,
      );
    }
  }

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

  const productHasVariants =
    product.variants.length > 0;

  return (
    <div>
      <PageHeader
        title={`Modifier « ${product.name} »`}
        description="Toutes les fonctions produit sont disponibles ici : informations, catégorie, personnalisation, stock, variantes et images."
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/admin/products/${productId}`}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-black/[0.08] bg-white px-4 text-sm font-semibold text-neutral-600 shadow-sm transition hover:bg-neutral-50 hover:text-neutral-900"
            >
              Voir la fiche
            </Link>

            <Link
              href="/admin/products"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-black/[0.08] bg-white px-4 text-sm font-semibold text-neutral-600 shadow-sm transition hover:bg-neutral-50 hover:text-neutral-900"
            >
              Retour
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
                    setName(event.target.value)
                  }
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
                  onChange={(event) =>
                    setSlug(
                      event.target.value.toLowerCase(),
                    )
                  }
                  className={inputClassName}
                  required
                />
              </div>

              <ProductCategorySelector
                categories={categories}
                value={categorySelection}
                onChange={
                  setCategorySelection
                }
                disabled={isLoadingCategories}
                inputClassName={inputClassName}
                labelClassName={labelClassName}
              />

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
                  value={price}
                  onChange={(event) =>
                    setPrice(event.target.value)
                  }
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
                  value={compareAtPrice}
                  onChange={(event) =>
                    setCompareAtPrice(
                      event.target.value,
                    )
                  }
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
                  className={inputClassName}
                />
              </div>

              <PersonalizationSection
                ref={personalizationRef}
                initialIsPersonalizable={
                  product.isPersonalizable
                }
                initialPersonalizationPrompt={
                  product.personalizationPrompt
                }
                initialPersonalizationConfig={
                  product.personalizationConfig
                }
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
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-[0_8px_30px_rgba(23,23,20,0.035)] sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                  Variantes
                </p>

                <h2 className="mt-1 text-lg font-semibold text-neutral-950">
                  Déclinaisons et stock
                </h2>

                <p className="mt-1 max-w-2xl text-xs leading-5 text-neutral-500">
                  Ajoutez ou modifiez les couleurs et modèles ici.
                  Chaque variante peut avoir son propre stock.
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
                      setVariantError(null);
                    }}
                    className="text-xs font-semibold text-neutral-400 hover:text-neutral-700"
                  >
                    Fermer
                  </button>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className={labelClassName}>
                      Nom *
                    </label>

                    <input
                      type="text"
                      value={variantForm.name}
                      onChange={(event) =>
                        setVariantForm(
                          (current) => ({
                            ...current,
                            name: event.target.value,
                          }),
                        )
                      }
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
                        setVariantForm(
                          (current) => ({
                            ...current,
                            colorName:
                              event.target.value,
                          }),
                        )
                      }
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label className={labelClassName}>
                      Couleur
                    </label>

                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={variantForm.colorHex}
                        onChange={(event) =>
                          setVariantForm(
                            (current) => ({
                              ...current,
                              colorHex:
                                event.target.value,
                            }),
                          )
                        }
                        className="h-11 w-12 rounded-xl border border-black/[0.09] bg-white p-1"
                      />

                      <input
                        type="text"
                        value={variantForm.colorHex}
                        onChange={(event) =>
                          setVariantForm(
                            (current) => ({
                              ...current,
                              colorHex:
                                event.target.value,
                            }),
                          )
                        }
                        className={inputClassName}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClassName}>
                      SKU
                    </label>

                    <input
                      type="text"
                      value={variantForm.sku}
                      onChange={(event) =>
                        setVariantForm(
                          (current) => ({
                            ...current,
                            sku: event.target.value,
                          }),
                        )
                      }
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
                        setVariantForm(
                          (current) => ({
                            ...current,
                            price: event.target.value,
                          }),
                        )
                      }
                      placeholder="Vide = prix du produit"
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label className={labelClassName}>
                      Quantité *
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={variantForm.quantity}
                      onChange={(event) =>
                        setVariantForm(
                          (current) => ({
                            ...current,
                            quantity:
                              event.target.value,
                          }),
                        )
                      }
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label className={labelClassName}>
                      Seuil stock faible *
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={
                        variantForm.lowStockThreshold
                      }
                      onChange={(event) =>
                        setVariantForm(
                          (current) => ({
                            ...current,
                            lowStockThreshold:
                              event.target.value,
                          }),
                        )
                      }
                      className={inputClassName}
                    />
                  </div>

                  <label className="flex min-h-11 cursor-pointer items-center justify-between gap-4 rounded-xl border border-black/[0.08] bg-white px-4">
                    <span className="text-sm font-medium text-neutral-700">
                      Suivre le stock
                    </span>

                    <input
                      type="checkbox"
                      checked={
                        variantForm.trackInventory
                      }
                      onChange={(event) =>
                        setVariantForm(
                          (current) => ({
                            ...current,
                            trackInventory:
                              event.target.checked,
                          }),
                        )
                      }
                      className="h-4 w-4 accent-neutral-950"
                    />
                  </label>
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
                        : "Créer la variante"}
                  </button>

                  <button
                    type="button"
                    disabled={savingVariant}
                    onClick={() => {
                      setShowVariantForm(false);
                      setEditingVariant(null);
                      setVariantError(null);
                    }}
                    className="inline-flex min-h-10 items-center justify-center rounded-xl border border-black/[0.08] bg-white px-4 text-sm font-semibold text-neutral-600"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : null}

            {product.variants.length === 0 ? (
              <div className="mt-5 rounded-xl bg-[#faf9f6] px-4 py-8 text-center">
                <p className="text-sm font-medium text-neutral-500">
                  Aucune variante.
                </p>

                <p className="mt-1 text-xs text-neutral-400">
                  Le stock reste actuellement au niveau du produit.
                </p>
              </div>
            ) : (
              <div className="mt-5 divide-y divide-black/[0.06] overflow-hidden rounded-xl border border-black/[0.06]">
                {product.variants.map(
                  (variant) => {
                    const available = Math.max(
                      0,
                      (variant.inventory?.quantity ??
                        0) -
                        (variant.inventory
                          ?.reserved ?? 0),
                    );

                    return (
                      <div
                        key={variant.id}
                        className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          {variant.colorHex ? (
                            <span
                              className="h-9 w-9 shrink-0 rounded-xl border border-black/[0.08]"
                              style={{
                                backgroundColor:
                                  variant.colorHex,
                              }}
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
                                  variant.isActive
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-neutral-100 text-neutral-500",
                                ].join(" ")}
                              >
                                {variant.isActive
                                  ? "Active"
                                  : "Inactive"}
                              </span>
                            </div>

                            <p className="mt-1 text-xs text-neutral-400">
                              {variant.sku ??
                                "Sans SKU"}{" "}
                              · Stock disponible{" "}
                              {available}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openEditVariant(
                                variant,
                              )
                            }
                            className="inline-flex min-h-9 items-center justify-center rounded-xl border border-black/[0.08] bg-white px-3 text-xs font-semibold text-neutral-600 transition hover:bg-neutral-50"
                          >
                            Modifier
                          </button>

                          <button
                            type="button"
                            disabled={
                              updatingVariantStatusId ===
                              variant.id
                            }
                            onClick={() =>
                              void toggleVariantActive(
                                variant,
                              )
                            }
                            className={[
                              "inline-flex min-h-9 items-center justify-center rounded-xl border bg-white px-3 text-xs font-semibold transition disabled:opacity-50",
                              variant.isActive
                                ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                                : "border-emerald-200 text-emerald-700 hover:bg-emerald-50",
                            ].join(" ")}
                          >
                            {updatingVariantStatusId ===
                            variant.id
                              ? "…"
                              : variant.isActive
                                ? "Désactiver"
                                : "Réactiver"}
                          </button>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-[0_8px_30px_rgba(23,23,20,0.035)] sm:p-6">
            <ProductGalleryManager
              productId={productId}
              images={product.images}
              variants={product.variants.map(
                (variant) => ({
                  id: variant.id,
                  name: variant.name,
                  colorName:
                    variant.colorName,
                  colorHex:
                    variant.colorHex,
                }),
              )}
              token={token}
              onImagesChange={(nextImages) =>
                setProduct((current) =>
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
                  Le produit pourra être proposé au catalogue.
                </p>
              </div>

              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) =>
                  setIsActive(
                    event.target.checked,
                  )
                }
                className="mt-1 h-4 w-4 accent-neutral-950"
              />
            </label>
          </section>

          {!productHasVariants ? (
            <section className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-[0_8px_30px_rgba(23,23,20,0.035)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                Stock
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
                      setQuantity(
                        event.target.value,
                      )
                    }
                    className={inputClassName}
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
                      setLowStockThreshold(
                        event.target.value,
                      )
                    }
                    className={inputClassName}
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
                      setTrackInventory(
                        event.target.checked,
                      )
                    }
                    className="h-4 w-4 accent-neutral-950"
                  />
                </label>

                <button
                  type="button"
                  disabled={savingProductInventory}
                  onClick={() =>
                    void handleSaveProductInventory()
                  }
                  className="inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-black/[0.08] bg-white px-4 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
                >
                  {savingProductInventory
                    ? "Enregistrement…"
                    : "Mettre à jour le stock"}
                </button>
              </div>

              <p className="mt-4 text-[11px] leading-5 text-neutral-400">
                Si vous créez une première variante, le stock produit sera converti vers cette variante par le backend.
              </p>
            </section>
          ) : (
            <section className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-[0_8px_30px_rgba(23,23,20,0.035)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                Stock
              </p>

              <p className="mt-3 text-sm leading-6 text-neutral-600">
                Ce produit possède des variantes. Le stock est géré directement dans chaque variante.
              </p>
            </section>
          )}

          <button
            type="submit"
            disabled={
              isSubmitting ||
              isLoadingCategories ||
              activeCategories.length === 0
            }
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isSubmitting
              ? "Enregistrement…"
              : "Enregistrer les modifications"}
          </button>

          <Link
            href={`/admin/products/${productId}`}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-black/[0.08] bg-white px-4 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
          >
            Terminer
          </Link>
        </aside>
      </form>
    </div>
  );
}
