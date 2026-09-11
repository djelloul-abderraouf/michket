"use client";

/* eslint-disable @next/next/no-img-element */

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { PageHeader } from "@/components/admin/PageHeader";
import { createClient } from "@/lib/supabase/client";

type HeroImage = {
  id: string;
  categoryId: string;
  url: string;
  storagePath: string;
  altText: string | null;
  sortOrder: number;
  createdAt: string;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  pageTitle: string | null;
  productsTitle: string | null;
  filterLabel: string | null;
  imageUrl: string | null;
  imageStoragePath: string | null;
  href: string | null;
  parentId: string | null;
  isActive: boolean;
  sortOrder: number;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
  heroImages?: HeroImage[];
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

type ApiErrorPayload = {
  message?: string | string[];
};

type CategoryFormState = {
  name: string;
  slug: string;
  kind: "CATEGORY" | "SUBCATEGORY";
  parentId: string;
  description: string;
  pageTitle: string;
  productsTitle: string;
  filterLabel: string;
  imageUrl: string;
  imageStoragePath: string;
  href: string;
  sortOrder: string;
  isActive: boolean;
  metaTitle: string;
  metaDescription: string;
};

const EMPTY_FORM: CategoryFormState = {
  name: "",
  slug: "",
  kind: "CATEGORY",
  parentId: "",
  description: "",
  pageTitle: "",
  productsTitle: "",
  filterLabel: "",
  imageUrl: "",
  imageStoragePath: "",
  href: "",
  sortOrder: "0",
  isActive: true,
  metaTitle: "",
  metaDescription: "",
};

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function apiMessage(
  payload: ApiErrorPayload | null,
  fallback: string,
) {
  if (!payload?.message) {
    return fallback;
  }

  return Array.isArray(payload.message)
    ? payload.message.join(" ")
    : payload.message;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);
  const [form, setForm] =
    useState<CategoryFormState>(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] =
    useState<string | null>(null);

  // Profile image upload state
  const profileFileInputRef = useRef<HTMLInputElement>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [profileUploadError, setProfileUploadError] = useState<string | null>(null);
  // Tracks the URL/path of an image uploaded to Storage but NOT yet saved to DB
  const [pendingProfileUrl, setPendingProfileUrl] = useState<string | null>(null);
  const [pendingProfileStoragePath, setPendingProfileStoragePath] = useState<string | null>(null);

  // Hero images state
  const heroFileInputRef = useRef<HTMLInputElement>(null);
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [heroUploadError, setHeroUploadError] = useState<string | null>(null);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [reorderingImageId, setReorderingImageId] = useState<string | null>(null);

  const [actionId, setActionId] =
    useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<Category | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] =
    useState("");
  const [deleteError, setDeleteError] =
    useState<string | null>(null);
  const [isDeletingCategory, setIsDeletingCategory] =
    useState(false);
  const [search, setSearch] = useState("");

  const loadCategories = useCallback(async () => {
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
        setLoadError(
          "NEXT_PUBLIC_API_URL n'est pas configurée.",
        );
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

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        await supabase.auth.signOut();
        router.replace("/admin/login");
        return;
      }

      if (!response.ok) {
        let payload: ApiErrorPayload | null = null;

        try {
          payload =
            (await response.json()) as ApiErrorPayload;
        } catch {}

        setLoadError(
          apiMessage(
            payload,
            "Impossible de charger les catégories.",
          ),
        );
        return;
      }

      const payload =
        (await response.json()) as CategoriesResponse;

      setCategories(payload.data);
    } catch {
      setLoadError(
        "Une erreur est survenue pendant le chargement des catégories.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [router, supabase]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const topLevelCategories = useMemo(
    () =>
      categories
        .filter((category) => category.parentId === null)
        .sort(
          (a, b) =>
            a.sortOrder - b.sortOrder ||
            a.name.localeCompare(b.name, "fr"),
        ),
    [categories],
  );

  const parentCandidates = useMemo(
    () =>
      topLevelCategories.filter(
        (category) =>
          category.id !== editingCategory?.id &&
          category.isActive,
      ),
    [editingCategory?.id, topLevelCategories],
  );

  const childrenByParent = useMemo(() => {
    const map = new Map<string, Category[]>();

    for (const category of categories) {
      if (!category.parentId) {
        continue;
      }

      const children = map.get(category.parentId) ?? [];
      children.push(category);
      map.set(category.parentId, children);
    }

    for (const children of map.values()) {
      children.sort(
        (a, b) =>
          a.sortOrder - b.sortOrder ||
          a.name.localeCompare(b.name, "fr"),
      );
    }

    return map;
  }, [categories]);

  const filteredTopLevelCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return topLevelCategories;
    }

    return topLevelCategories.filter((category) => {
      const children =
        childrenByParent.get(category.id) ?? [];

      return (
        category.name.toLowerCase().includes(query) ||
        category.pageTitle
          ?.toLowerCase()
          .includes(query) ||
        children.some(
          (child) =>
            child.name.toLowerCase().includes(query) ||
            child.pageTitle
              ?.toLowerCase()
              .includes(query),
        )
      );
    });
  }, [
    childrenByParent,
    search,
    topLevelCategories,
  ]);

  const orphanCategories = useMemo(() => {
    const ids = new Set(
      categories.map((category) => category.id),
    );

    return categories.filter(
      (category) =>
        category.parentId &&
        !ids.has(category.parentId),
    );
  }, [categories]);

  function openCreateForm() {
    setEditingCategory(null);
    setForm(EMPTY_FORM);
    setSlugTouched(false);
    setFormError(null);
    setProfileFile(null);
    setProfilePreview(null);
    setProfileUploadError(null);
    setPendingProfileUrl(null);
    setPendingProfileStoragePath(null);
    setHeroImages([]);
    setHeroUploadError(null);
    setIsFormOpen(true);
  }

  async function openEditForm(category: Category) {
    setEditingCategory(category);
    setSlugTouched(true);
    setFormError(null);
    setProfileFile(null);
    setProfilePreview(category.imageUrl);
    setProfileUploadError(null);
    setPendingProfileUrl(null);
    setPendingProfileStoragePath(null);
    setHeroUploadError(null);
    setForm({
      name: category.name,
      slug: category.slug,
      kind: category.parentId
        ? "SUBCATEGORY"
        : "CATEGORY",
      parentId: category.parentId ?? "",
      description: category.description ?? "",
      pageTitle: category.pageTitle ?? "",
      productsTitle: category.productsTitle ?? "",
      filterLabel: category.filterLabel ?? "",
      imageUrl: category.imageUrl ?? "",
      imageStoragePath: category.imageStoragePath ?? "",
      href: category.href ?? "",
      sortOrder: String(category.sortOrder),
      isActive: category.isActive,
      metaTitle: category.metaTitle ?? "",
      metaDescription:
        category.metaDescription ?? "",
    });

    // Load hero images for subcategories
    if (category.parentId) {
      await loadHeroImages(category.id);
    } else {
      setHeroImages([]);
    }

    setIsFormOpen(true);
  }

  async function loadHeroImages(categoryId: string) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) return;

      const response = await fetch(
        `${apiUrl}/admin/categories/${categoryId}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      if (response.ok) {
        const data = (await response.json()) as Category;
        setHeroImages(data.heroImages ?? []);
      }
    } catch {
      // Silently fail - hero images are optional
    }
  }

  function closeForm() {
    if (isSaving) {
      return;
    }

    setIsFormOpen(false);
    setEditingCategory(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setSlugTouched(false);
    setProfileFile(null);
    setProfilePreview(null);
    setProfileUploadError(null);
    setPendingProfileUrl(null);
    setPendingProfileStoragePath(null);
    setHeroImages([]);
    setHeroUploadError(null);
  }

  /** Cancel = cleanup temp uploads then close. */
  function handleCancel() {
    if (isSaving) return;
    if (pendingProfileStoragePath) {
      void deleteTempStorage(pendingProfileStoragePath);
    }
    closeForm();
  }

  function updateForm<K extends keyof CategoryFormState>(
    key: K,
    value: CategoryFormState[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleNameChange(value: string) {
    setForm((current) => ({
      ...current,
      name: value,
      slug: slugTouched
        ? current.slug
        : slugify(value),
    }));
  }

  // Profile image file handling

  /** Best-effort delete a temp file from Storage. Never throws. */
  async function deleteTempStorage(storagePath: string) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) return;

      await fetch(`${apiUrl}/media/category-images`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ storagePath }),
      });
    } catch {
      // Best-effort — don't break UI
    }
  }

  async function handleProfileFileSelect(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    setProfileUploadError(null);

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setProfileUploadError(
        "Format non supporté. Utilisez JPEG, PNG, WebP ou AVIF.",
      );
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setProfileUploadError(
        `Fichier trop volumineux (${formatFileSize(file.size)}). Maximum : 10 Mo.`,
      );
      return;
    }

    // If there's a previous pending upload, clean it up (Case 3: B→C)
    if (pendingProfileStoragePath) {
      void deleteTempStorage(pendingProfileStoragePath);
    }

    // Upload immediately to Supabase Storage
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      router.replace("/admin/login");
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) return;

    setIsUploadingProfile(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${apiUrl}/media/category-images`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: formData,
        },
      );

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as ApiErrorPayload;
        setProfileUploadError(
          apiMessage(payload, "Erreur lors de l'upload de l'image."),
        );
        return;
      }

      const { url, path } = (await response.json()) as {
        url: string;
        path: string;
      };

      // New temp upload is now in Storage
      setProfileFile(file);
      setProfilePreview(url);
      setPendingProfileUrl(url);
      setPendingProfileStoragePath(path);
    } catch {
      setProfileUploadError(
        "Erreur réseau lors de l'upload.",
      );
    } finally {
      setIsUploadingProfile(false);
    }
  }

  function handleProfileFileRemove() {
    // Mark the image for removal — actual DB + Storage cleanup happens on Save
    setProfileFile(null);
    setProfilePreview(null);
    setProfileUploadError(null);
    updateForm("imageUrl", "");
    updateForm("imageStoragePath", "");
    if (profileFileInputRef.current) {
      profileFileInputRef.current.value = "";
    }
  }

  // Hero image operations
  async function handleHeroImageUpload(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    if (!file || !editingCategory) return;

    setHeroUploadError(null);

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setHeroUploadError(
        "Format non supporté. Utilisez JPEG, PNG, WebP ou AVIF.",
      );
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setHeroUploadError(
        `Fichier trop volumineux (${formatFileSize(file.size)}). Maximum : 5 Mo.`,
      );
      return;
    }

    setIsUploadingHero(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        router.replace("/admin/login");
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) return;

      // Upload to storage via media endpoint
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch(
        `${apiUrl}/media/category-images`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: formData,
        },
      );

      if (!uploadResponse.ok) {
        const payload = (await uploadResponse.json().catch(() => null)) as ApiErrorPayload;
        setHeroUploadError(
          apiMessage(payload, "Erreur lors de l'upload de l'image."),
        );
        return;
      }

      const { url, path } = (await uploadResponse.json()) as {
        url: string;
        path: string;
      };

      // Create hero image record
      const sortOrder = heroImages.length;

      const createResponse = await fetch(
        `${apiUrl}/admin/categories/${editingCategory.id}/hero-images`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url,
            storagePath: path,
            altText: file.name.replace(/\.[^/.]+$/, ""),
            sortOrder,
          }),
        },
      );

      if (!createResponse.ok) {
        const payload = (await createResponse.json().catch(() => null)) as ApiErrorPayload;
        setHeroUploadError(
          apiMessage(payload, "Erreur lors de l'enregistrement de l'image."),
        );
        return;
      }

      const newImage = (await createResponse.json()) as HeroImage;
      setHeroImages((prev) => [...prev, newImage]);
    } catch {
      setHeroUploadError(
        "Erreur réseau lors de l'upload.",
      );
    } finally {
      setIsUploadingHero(false);
      if (heroFileInputRef.current) {
        heroFileInputRef.current.value = "";
      }
    }
  }

  async function handleHeroImageDelete(image: HeroImage) {
    if (!editingCategory) return;

    const confirmed = window.confirm(
      `Supprimer cette image hero ?`,
    );

    if (!confirmed) return;

    setDeletingImageId(image.id);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        router.replace("/admin/login");
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) return;

      const response = await fetch(
        `${apiUrl}/admin/categories/${editingCategory.id}/hero-images/${image.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as ApiErrorPayload;
        window.alert(
          apiMessage(payload, "Impossible de supprimer l'image."),
        );
        return;
      }

      setHeroImages((prev) =>
        prev
          .filter((img) => img.id !== image.id)
          .map((img, index) => ({
            ...img,
            sortOrder: index,
          })),
      );
    } catch {
      window.alert(
        "Erreur réseau lors de la suppression.",
      );
    } finally {
      setDeletingImageId(null);
    }
  }

  async function handleHeroImageMoveUp(image: HeroImage) {
    if (!editingCategory) return;

    const currentIndex = heroImages.findIndex(
      (img) => img.id === image.id,
    );

    if (currentIndex <= 0) return;

    const newImages = [...heroImages];
    const temp = newImages[currentIndex - 1];
    newImages[currentIndex - 1] = newImages[currentIndex];
    newImages[currentIndex] = temp;

    const updatedImages = newImages.map((img, index) => ({
      ...img,
      sortOrder: index,
    }));

    setHeroImages(updatedImages);
    setReorderingImageId(image.id);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        router.replace("/admin/login");
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) return;

      await fetch(
        `${apiUrl}/admin/categories/${editingCategory.id}/hero-images/reorder`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            images: updatedImages.map((img) => ({
              imageId: img.id,
              sortOrder: img.sortOrder,
            })),
          }),
        },
      );
    } catch {
      // Revert on error
      setHeroImages((prev) => {
        const reverted = [...prev];
        const tempReverted = reverted[currentIndex - 1];
        reverted[currentIndex - 1] = reverted[currentIndex];
        reverted[currentIndex] = tempReverted;
        return reverted.map((img, index) => ({
          ...img,
          sortOrder: index,
        }));
      });
    } finally {
      setReorderingImageId(null);
    }
  }

  async function handleHeroImageMoveDown(image: HeroImage) {
    if (!editingCategory) return;

    const currentIndex = heroImages.findIndex(
      (img) => img.id === image.id,
    );

    if (currentIndex < 0 || currentIndex >= heroImages.length - 1) return;

    const newImages = [...heroImages];
    const temp = newImages[currentIndex + 1];
    newImages[currentIndex + 1] = newImages[currentIndex];
    newImages[currentIndex] = temp;

    const updatedImages = newImages.map((img, index) => ({
      ...img,
      sortOrder: index,
    }));

    setHeroImages(updatedImages);
    setReorderingImageId(image.id);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        router.replace("/admin/login");
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) return;

      await fetch(
        `${apiUrl}/admin/categories/${editingCategory.id}/hero-images/reorder`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            images: updatedImages.map((img) => ({
              imageId: img.id,
              sortOrder: img.sortOrder,
            })),
          }),
        },
      );
    } catch {
      // Revert on error
      setHeroImages((prev) => {
        const reverted = [...prev];
        const tempReverted = reverted[currentIndex + 1];
        reverted[currentIndex + 1] = reverted[currentIndex];
        reverted[currentIndex] = tempReverted;
        return reverted.map((img, index) => ({
          ...img,
          sortOrder: index,
        }));
      });
    } finally {
      setReorderingImageId(null);
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setFormError(null);

    const name = form.name.trim();
    const slug = form.slug.trim().toLowerCase();

    if (!name) {
      setFormError("Le nom est obligatoire.");
      return;
    }

    if (!slug) {
      setFormError("Le slug est obligatoire.");
      return;
    }

    if (
      form.kind === "SUBCATEGORY" &&
      !form.parentId
    ) {
      setFormError(
        "Choisissez la catégorie parente.",
      );
      return;
    }

    const sortOrder = Number(form.sortOrder);

    if (
      !Number.isInteger(sortOrder) ||
      sortOrder < 0
    ) {
      setFormError(
        "L'ordre doit être un nombre entier positif ou nul.",
      );
      return;
    }

    setIsSaving(true);

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
        setFormError(
          "NEXT_PUBLIC_API_URL n'est pas configurée.",
        );
        return;
      }

      // Profile image: use pending upload if available, or current form values
      let imageUrl = form.imageUrl;
      let imageStoragePath = form.imageStoragePath;

      if (pendingProfileUrl && pendingProfileStoragePath) {
        // Upload already happened at file selection time
        imageUrl = pendingProfileUrl;
        imageStoragePath = pendingProfileStoragePath;
      }

      // When editing: empty string means "remove the image" → send null
      // When creating: empty string means "no image" → send undefined (omit from payload)
      const imageUrlValue =
        editingCategory && imageUrl === "" ? null : imageUrl || undefined;
      const imageStoragePathValue =
        editingCategory && imageStoragePath === "" ? null : imageStoragePath || undefined;

      const payload = {
        name,
        slug,
        description:
          form.description.trim() || undefined,
        pageTitle:
          form.pageTitle.trim() || undefined,
        productsTitle:
          form.kind === "CATEGORY"
            ? form.productsTitle.trim() || undefined
            : "",
        filterLabel:
          form.kind === "CATEGORY"
            ? form.filterLabel.trim() || undefined
            : "",
        imageUrl: imageUrlValue,
        imageStoragePath: imageStoragePathValue,
        href: form.href.trim() || undefined,
        parentId:
          form.kind === "SUBCATEGORY"
            ? form.parentId
            : null,
        isActive: form.isActive,
        sortOrder,
        metaTitle:
          form.metaTitle.trim() || undefined,
        metaDescription:
          form.metaDescription.trim() ||
          undefined,
      };

      const response = await fetch(
        editingCategory
          ? `${apiUrl}/admin/categories/${editingCategory.id}`
          : `${apiUrl}/admin/categories`,
        {
          method: editingCategory ? "PUT" : "POST",
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
        let errorPayload: ApiErrorPayload | null = null;

        try {
          errorPayload =
            (await response.json()) as ApiErrorPayload;
        } catch {}

        // Save failed — clean up the temp upload if any
        if (pendingProfileStoragePath) {
          void deleteTempStorage(pendingProfileStoragePath);
          setPendingProfileUrl(null);
          setPendingProfileStoragePath(null);
        }

        setFormError(
          apiMessage(
            errorPayload,
            editingCategory
              ? "Impossible de modifier la catégorie."
              : "Impossible de créer la catégorie.",
          ),
        );
        return;
      }

      // Save succeeded — pending image is now official in DB
      setPendingProfileUrl(null);
      setPendingProfileStoragePath(null);

      closeForm();
      await loadCategories();
      router.refresh();
    } catch {
      // Network error — clean up temp upload if any
      if (pendingProfileStoragePath) {
        void deleteTempStorage(pendingProfileStoragePath);
        setPendingProfileUrl(null);
        setPendingProfileStoragePath(null);
      }

      setFormError(
        "Une erreur est survenue pendant l'enregistrement.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleCategoryActive(
    category: Category,
  ) {
    const nextIsActive = !category.isActive;

    const confirmed = window.confirm(
      nextIsActive
        ? `Réactiver "${category.name}" ?`
        : `Désactiver "${category.name}" ?`,
    );

    if (!confirmed) {
      return;
    }

    setActionId(category.id);

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
        window.alert(
          "NEXT_PUBLIC_API_URL n'est pas configurée.",
        );
        return;
      }

      const response = await fetch(
        `${apiUrl}/admin/categories/${category.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isActive: nextIsActive,
          }),
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
        let payload: ApiErrorPayload | null = null;

        try {
          payload =
            (await response.json()) as ApiErrorPayload;
        } catch {}

        window.alert(
          apiMessage(
            payload,
            nextIsActive
              ? "Impossible de réactiver cette catégorie."
              : "Impossible de désactiver cette catégorie.",
          ),
        );
        return;
      }

      await loadCategories();
      router.refresh();
    } catch {
      window.alert(
        nextIsActive
          ? "Une erreur est survenue pendant la réactivation."
          : "Une erreur est survenue pendant la désactivation.",
      );
    } finally {
      setActionId(null);
    }
  }

  function openDeleteCategory(category: Category) {
    setDeleteTarget(category);
    setDeleteConfirmationText("");
    setDeleteError(null);
  }

  function closeDeleteCategory() {
    if (isDeletingCategory) {
      return;
    }

    setDeleteTarget(null);
    setDeleteConfirmationText("");
    setDeleteError(null);
  }

  async function permanentlyDeleteCategory() {
    if (
      !deleteTarget ||
      isDeletingCategory ||
      deleteConfirmationText !== "SUPPRIMER"
    ) {
      return;
    }

    setIsDeletingCategory(true);
    setDeleteError(null);

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
        setDeleteError(
          "NEXT_PUBLIC_API_URL n'est pas configurée.",
        );
        return;
      }

      const response = await fetch(
        `${apiUrl}/admin/categories/${deleteTarget.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
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
        let payload: ApiErrorPayload | null = null;

        try {
          payload =
            (await response.json()) as ApiErrorPayload;
        } catch {}

        setDeleteError(
          apiMessage(
            payload,
            "Impossible de supprimer définitivement cette catégorie.",
          ),
        );
        return;
      }

      setDeleteTarget(null);
      setDeleteConfirmationText("");
      await loadCategories();
      router.refresh();
    } catch {
      setDeleteError(
        "Une erreur est survenue pendant la suppression définitive.",
      );
    } finally {
      setIsDeletingCategory(false);
    }
  }

  const isSubcategory = form.kind === "SUBCATEGORY";

  return (
    <div>
      <PageHeader
        title="Catégories"
        description="Organisez le catalogue en catégories et sous-catégories."
        action={
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-neutral-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M8 3v10M3 8h10" />
            </svg>
            Ajouter
          </button>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-black/[0.07] bg-white p-4">
          <p className="text-xs font-medium text-neutral-400">
            Catégories principales
          </p>
          <p className="mt-2 text-2xl font-semibold text-neutral-950">
            {topLevelCategories.length}
          </p>
        </div>

        <div className="rounded-2xl border border-black/[0.07] bg-white p-4">
          <p className="text-xs font-medium text-neutral-400">
            Sous-catégories
          </p>
          <p className="mt-2 text-2xl font-semibold text-neutral-950">
            {
              categories.filter(
                (category) => category.parentId,
              ).length
            }
          </p>
        </div>

        <div className="rounded-2xl border border-black/[0.07] bg-white p-4">
          <p className="text-xs font-medium text-neutral-400">
            Actives
          </p>
          <p className="mt-2 text-2xl font-semibold text-neutral-950">
            {
              categories.filter(
                (category) => category.isActive,
              ).length
            }
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white shadow-[0_8px_30px_rgba(23,23,20,0.035)]">
        <div className="flex flex-col gap-3 border-b border-black/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-neutral-950">
              Structure du catalogue
            </h2>
            <p className="mt-1 text-xs text-neutral-400">
              Une catégorie principale peut contenir plusieurs sous-catégories.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              width="15"
              height="15"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <circle cx="7" cy="7" r="4.5" />
              <path d="m10.5 10.5 3 3" />
            </svg>

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Rechercher…"
              className="h-10 w-full rounded-xl border border-black/[0.08] bg-[#faf9f6] pl-9 pr-3 text-sm text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-neutral-300 focus:bg-white"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-4">
            <div className="admin-skeleton h-24 w-full" />
            <div className="admin-skeleton h-24 w-full" />
            <div className="admin-skeleton h-24 w-full" />
          </div>
        ) : loadError ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-semibold text-red-700">
              {loadError}
            </p>
            <button
              type="button"
              onClick={() => void loadCategories()}
              className="mt-4 rounded-xl border border-black/[0.08] bg-white px-4 py-2 text-sm font-semibold text-neutral-700"
            >
              Réessayer
            </button>
          </div>
        ) : categories.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-[#f1efe9] text-neutral-500">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <rect
                  x="3"
                  y="3"
                  width="7"
                  height="7"
                  rx="1.5"
                />
                <rect
                  x="14"
                  y="3"
                  width="7"
                  height="7"
                  rx="1.5"
                />
                <rect
                  x="3"
                  y="14"
                  width="7"
                  height="7"
                  rx="1.5"
                />
                <rect
                  x="14"
                  y="14"
                  width="7"
                  height="7"
                  rx="1.5"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-base font-semibold text-neutral-950">
              Aucune catégorie
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
              Commencez par créer une catégorie principale,
              par exemple « Lampes 3D ».
            </p>
            <button
              type="button"
              onClick={openCreateForm}
              className="mt-5 rounded-xl bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white"
            >
              Créer la première catégorie
            </button>
          </div>
        ) : filteredTopLevelCategories.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-neutral-400">
            Aucun résultat.
          </div>
        ) : (
          <div className="divide-y divide-black/[0.06]">
            {filteredTopLevelCategories.map(
              (category) => {
                const children =
                  childrenByParent.get(category.id) ??
                  [];

                return (
                  <div
                    key={category.id}
                    className="p-4 sm:p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex min-w-0 items-start gap-4">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-black/[0.06] bg-[#f3f1ec]">
                          {category.imageUrl ? (
                            <img
                              src={category.imageUrl}
                              alt={category.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="grid h-full w-full place-items-center text-xs font-bold text-neutral-400">
                              CAT
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-base font-semibold text-neutral-950">
                              {category.name}
                            </h3>
                            <span className="rounded-full bg-neutral-950 px-2 py-1 text-[10px] font-semibold text-white">
                              Catégorie
                            </span>
                            <span
                              className={[
                                "rounded-full px-2 py-1 text-[10px] font-semibold",
                                category.isActive
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-neutral-100 text-neutral-500",
                              ].join(" ")}
                            >
                              {category.isActive
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </div>

                          <p className="mt-1 truncate text-xs text-neutral-400">
                            /{category.slug}
                          </p>

                          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
                            {category.pageTitle ||
                              category.description ||
                              "Aucun titre ou description renseigné."}
                          </p>

                          <p className="mt-2 text-xs font-medium text-neutral-400">
                            {children.length} sous-catégorie
                            {children.length > 1
                              ? "s"
                              : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategory(null);
                            setForm({
                              ...EMPTY_FORM,
                              kind: "SUBCATEGORY",
                              parentId: category.id,
                            });
                            setSlugTouched(false);
                            setFormError(null);
                            setProfileFile(null);
                            setProfilePreview(null);
                            setProfileUploadError(null);
                            setHeroImages([]);
                            setHeroUploadError(null);
                            setIsFormOpen(true);
                          }}
                          className="rounded-xl border border-black/[0.08] bg-white px-3 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50"
                        >
                          + Sous-catégorie
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            void openEditForm(category)
                          }
                          className="rounded-xl border border-black/[0.08] bg-white px-3 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50"
                        >
                          Modifier
                        </button>

                        <button
                          type="button"
                          disabled={
                            actionId === category.id
                          }
                          onClick={() =>
                            void toggleCategoryActive(
                              category,
                            )
                          }
                          className={[
                            "rounded-xl border bg-white px-3 py-2 text-xs font-semibold transition disabled:opacity-50",
                            category.isActive
                              ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                              : "border-emerald-200 text-emerald-700 hover:bg-emerald-50",
                          ].join(" ")}
                        >
                          {actionId === category.id
                            ? "Mise à jour…"
                            : category.isActive
                              ? "Désactiver"
                              : "Réactiver"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            openDeleteCategory(category)
                          }
                          className="rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>

                    {children.length > 0 ? (
                      <div className="mt-4 grid gap-3 border-l border-black/[0.08] pl-4 sm:grid-cols-2 xl:grid-cols-3">
                        {children.map((child) => (
                          <div
                            key={child.id}
                            className="flex gap-3 rounded-xl border border-black/[0.06] bg-[#faf9f6] p-3"
                          >
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-black/[0.06] bg-white">
                              {child.imageUrl ? (
                                <img
                                  src={child.imageUrl}
                                  alt={child.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="grid h-full w-full place-items-center text-[9px] font-bold text-neutral-400">
                                  SOUS
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-neutral-900">
                                    {child.name}
                                  </p>
                                  <p className="mt-0.5 truncate text-[11px] text-neutral-400">
                                    /{child.slug}
                                  </p>
                                </div>

                                <span
                                  className={[
                                    "mt-0.5 h-2 w-2 shrink-0 rounded-full",
                                    child.isActive
                                      ? "bg-emerald-500"
                                      : "bg-neutral-300",
                                  ].join(" ")}
                                  title={
                                    child.isActive
                                      ? "Active"
                                      : "Inactive"
                                  }
                                />
                              </div>

                              <div className="mt-3 flex gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    void openEditForm(child)
                                  }
                                  className="text-xs font-semibold text-neutral-600 hover:text-neutral-950"
                                >
                                  Modifier
                                </button>

                                <button
                                  type="button"
                                  disabled={
                                    actionId === child.id
                                  }
                                  onClick={() =>
                                    void toggleCategoryActive(
                                      child,
                                    )
                                  }
                                  className={[
                                    "text-xs font-semibold disabled:opacity-50",
                                    child.isActive
                                      ? "text-amber-700 hover:text-amber-800"
                                      : "text-emerald-700 hover:text-emerald-800",
                                  ].join(" ")}
                                >
                                  {actionId === child.id
                                    ? "Mise à jour…"
                                    : child.isActive
                                      ? "Désactiver"
                                      : "Réactiver"}
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    openDeleteCategory(child)
                                  }
                                  className="text-xs font-semibold text-red-600 hover:text-red-700"
                                >
                                  Supprimer
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              },
            )}
          </div>
        )}

        {orphanCategories.length > 0 ? (
          <div className="border-t border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
            {orphanCategories.length} catégorie(s) ont une
            catégorie parente introuvable.
          </div>
        ) : null}
      </section>


      {deleteTarget ? (
        <div
          className="fixed inset-0 z-[110] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-label="Supprimer définitivement la catégorie"
        >
          <button
            type="button"
            aria-label="Fermer"
            onClick={closeDeleteCategory}
            className="absolute inset-0"
          />

          <div className="relative z-10 w-full rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-lg sm:rounded-3xl sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-red-500">
              Suppression définitive
            </p>
            <h2 className="mt-2 text-xl font-semibold text-neutral-950">
              Supprimer « {deleteTarget.name} » ?
            </h2>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              Cette action est irréversible. Une catégorie qui contient encore
              des sous-catégories ou des produits ne pourra pas être supprimée.
              Ses images enregistrées seront également nettoyées.
            </p>

            <label className="mt-5 block">
              <span className="text-xs font-semibold text-neutral-700">
                Tapez SUPPRIMER pour confirmer
              </span>
              <input
                type="text"
                value={deleteConfirmationText}
                disabled={isDeletingCategory}
                onChange={(event) =>
                  setDeleteConfirmationText(
                    event.target.value.toUpperCase(),
                  )
                }
                autoComplete="off"
                placeholder="SUPPRIMER"
                className="mt-2 h-11 w-full rounded-xl border border-red-200 bg-white px-3 text-sm font-semibold text-neutral-900 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100 disabled:opacity-60"
              />
            </label>

            {deleteError ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                {deleteError}
              </div>
            ) : null}

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={isDeletingCategory}
                onClick={closeDeleteCategory}
                className="min-h-11 rounded-xl border border-black/[0.08] bg-white px-4 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
              >
                Annuler
              </button>

              <button
                type="button"
                disabled={
                  isDeletingCategory ||
                  deleteConfirmationText !== "SUPPRIMER"
                }
                onClick={() =>
                  void permanentlyDeleteCategory()
                }
                className="min-h-11 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeletingCategory
                  ? "Suppression…"
                  : "Supprimer définitivement"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isFormOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/35 p-0 sm:items-center sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-label={
            editingCategory
              ? "Modifier une catégorie"
              : "Ajouter une catégorie"
          }
        >
          <button
            type="button"
            aria-label="Fermer"
            onClick={handleCancel}
            className="absolute inset-0"
          />

          <form
            onSubmit={handleSubmit}
            className="relative z-10 max-h-[94vh] w-full overflow-y-auto rounded-t-3xl bg-[#f8f7f3] shadow-2xl sm:max-w-3xl sm:rounded-3xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/[0.07] bg-[#f8f7f3]/95 px-5 py-4 backdrop-blur sm:px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
                  Catalogue
                </p>
                <h2 className="mt-1 text-xl font-semibold text-neutral-950">
                  {editingCategory
                    ? "Modifier"
                    : "Ajouter"}
                </h2>
              </div>

              <button
                type="button"
                onClick={handleCancel}
                className="grid h-9 w-9 place-items-center rounded-full bg-white text-neutral-500 ring-1 ring-black/[0.06] hover:text-neutral-950"
              >
                ×
              </button>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              {formError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {formError}
                </div>
              ) : null}

              <section className="rounded-2xl border border-black/[0.07] bg-white p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-neutral-950">
                  Type
                </h3>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        kind: "CATEGORY",
                        parentId: "",
                      }))
                    }
                    className={[
                      "rounded-xl border p-4 text-left transition",
                      form.kind === "CATEGORY"
                        ? "border-neutral-950 bg-neutral-950 text-white"
                        : "border-black/[0.07] bg-[#faf9f6] text-neutral-800",
                    ].join(" ")}
                  >
                    <p className="text-sm font-semibold">
                      Catégorie principale
                    </p>
                    <p
                      className={[
                        "mt-1 text-xs leading-5",
                        form.kind === "CATEGORY"
                          ? "text-white/60"
                          : "text-neutral-400",
                      ].join(" ")}
                    >
                      Exemple : Lampes 3D
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      updateForm(
                        "kind",
                        "SUBCATEGORY",
                      )
                    }
                    className={[
                      "rounded-xl border p-4 text-left transition",
                      form.kind === "SUBCATEGORY"
                        ? "border-neutral-950 bg-neutral-950 text-white"
                        : "border-black/[0.07] bg-[#faf9f6] text-neutral-800",
                    ].join(" ")}
                  >
                    <p className="text-sm font-semibold">
                      Sous-catégorie
                    </p>
                    <p
                      className={[
                        "mt-1 text-xs leading-5",
                        form.kind === "SUBCATEGORY"
                          ? "text-white/60"
                          : "text-neutral-400",
                      ].join(" ")}
                    >
                      Exemple : Anniversaire
                    </p>
                  </button>
                </div>

                {form.kind === "SUBCATEGORY" ? (
                  <label className="mt-4 block">
                    <span className="text-xs font-semibold text-neutral-600">
                      Catégorie parente *
                    </span>
                    <select
                      required
                      value={form.parentId}
                      onChange={(event) =>
                        updateForm(
                          "parentId",
                          event.target.value,
                        )
                      }
                      className="mt-2 h-11 w-full rounded-xl border border-black/[0.08] bg-white px-3 text-sm outline-none focus:border-neutral-300"
                    >
                      <option value="">
                        Choisir…
                      </option>
                      {parentCandidates.map(
                        (category) => (
                          <option
                            key={category.id}
                            value={category.id}
                          >
                            {category.name}
                          </option>
                        ),
                      )}
                    </select>
                  </label>
                ) : null}
              </section>

              <section className="rounded-2xl border border-black/[0.07] bg-white p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-neutral-950">
                  Contenu
                </h3>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="sm:col-span-1">
                    <span className="text-xs font-semibold text-neutral-600">
                      Nom *
                    </span>
                    <input
                      required
                      maxLength={150}
                      value={form.name}
                      onChange={(event) =>
                        handleNameChange(
                          event.target.value,
                        )
                      }
                      placeholder="Ex : Lampes 3D"
                      className="mt-2 h-11 w-full rounded-xl border border-black/[0.08] bg-white px-3 text-sm outline-none focus:border-neutral-300"
                    />
                  </label>

                  <label>
                    <span className="text-xs font-semibold text-neutral-600">
                      Slug *
                    </span>
                    <input
                      required
                      maxLength={180}
                      value={form.slug}
                      onChange={(event) => {
                        setSlugTouched(true);
                        updateForm(
                          "slug",
                          slugify(event.target.value),
                        );
                      }}
                      placeholder="lampes-3d"
                      className="mt-2 h-11 w-full rounded-xl border border-black/[0.08] bg-white px-3 text-sm outline-none focus:border-neutral-300"
                    />
                  </label>

                  <label className="sm:col-span-2">
                    <span className="text-xs font-semibold text-neutral-600">
                      {form.kind === "SUBCATEGORY"
                        ? "Titre accrocheur"
                        : "Titre de la catégorie"}
                    </span>
                    <input
                      maxLength={200}
                      value={form.pageTitle}
                      onChange={(event) =>
                        updateForm(
                          "pageTitle",
                          event.target.value,
                        )
                      }
                      placeholder={
                        form.kind === "SUBCATEGORY"
                          ? "Ex : Illuminez chaque anniversaire"
                          : "Ex : Lampes 3D personnalisées"
                      }
                      className="mt-2 h-11 w-full rounded-xl border border-black/[0.08] bg-white px-3 text-sm outline-none focus:border-neutral-300"
                    />
                  </label>

                  <label className="sm:col-span-2">
                    <span className="text-xs font-semibold text-neutral-600">
                      Petite description
                    </span>
                    <textarea
                      rows={3}
                      value={form.description}
                      onChange={(event) =>
                        updateForm(
                          "description",
                          event.target.value,
                        )
                      }
                      placeholder="Une courte présentation de cette catégorie."
                      className="mt-2 w-full resize-y rounded-xl border border-black/[0.08] bg-white px-3 py-3 text-sm outline-none focus:border-neutral-300"
                    />
                  </label>

                  {form.kind === "CATEGORY" ? (
                    <>
                      <label>
                        <span className="text-xs font-semibold text-neutral-600">
                          Titre au-dessus des produits
                        </span>
                        <input
                          maxLength={200}
                          value={form.productsTitle}
                          onChange={(event) =>
                            updateForm(
                              "productsTitle",
                              event.target.value,
                            )
                          }
                          placeholder="Une lumière unique pour chaque histoire"
                          className="mt-2 h-11 w-full rounded-xl border border-black/[0.08] bg-white px-3 text-sm outline-none focus:border-neutral-300"
                        />
                      </label>

                      <label>
                        <span className="text-xs font-semibold text-neutral-600">
                          Message du filtre
                        </span>
                        <input
                          maxLength={200}
                          value={form.filterLabel}
                          onChange={(event) =>
                            updateForm(
                              "filterLabel",
                              event.target.value,
                            )
                          }
                          placeholder="Filtrer : Toutes les lampes"
                          className="mt-2 h-11 w-full rounded-xl border border-black/[0.08] bg-white px-3 text-sm outline-none focus:border-neutral-300"
                        />
                      </label>
                    </>
                  ) : null}
                </div>
              </section>

              {/* Photo de présentation - catégories et sous-catégories */}
              <section className="rounded-2xl border border-black/[0.07] bg-white p-4 sm:p-5">
                  <h3 className="text-sm font-semibold text-neutral-950">
                    Image de présentation
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-neutral-400">
                    Image utilisée pour représenter cette {isSubcategory ? "sous-catégorie" : "catégorie"}.
                    JPEG, PNG, WebP ou AVIF. Maximum 10 Mo.
                  </p>

                  <div className="mt-4 grid gap-4 sm:grid-cols-[120px_minmax(0,1fr)]">
                    <div className="aspect-square overflow-hidden rounded-xl border border-black/[0.07] bg-[#f3f1ec]">
                      {profilePreview ? (
                        <img
                          src={profilePreview}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-xs font-semibold text-neutral-400">
                          Aperçu
                        </div>
                      )}
                    </div>

                    <div>
                      <input
                        ref={profileFileInputRef}
                        type="file"
                        accept={ACCEPTED_IMAGE_TYPES.join(",")}
                        onChange={handleProfileFileSelect}
                        className="hidden"
                      />

                      {profileFile ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm text-neutral-700">
                              {profileFile.name}
                            </span>
                            <span className="shrink-0 text-xs text-neutral-400">
                              ({formatFileSize(profileFile.size)})
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                profileFileInputRef.current?.click()
                              }
                              className="rounded-lg border border-black/[0.08] bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                            >
                              Changer
                            </button>
                            <button
                              type="button"
                              onClick={handleProfileFileRemove}
                              className="rounded-lg border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      ) : form.imageUrl ? (
                        <div className="space-y-2">
                          <p className="text-xs text-neutral-500">
                            Image existante chargée depuis le serveur.
                          </p>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                profileFileInputRef.current?.click()
                              }
                              className="rounded-lg border border-black/[0.08] bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                            >
                              Remplacer
                            </button>
                            <button
                              type="button"
                              onClick={handleProfileFileRemove}
                              className="rounded-lg border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            profileFileInputRef.current?.click()
                          }
                          className="flex h-11 items-center gap-2 rounded-xl border border-dashed border-black/[0.15] bg-[#faf9f6] px-4 text-sm font-semibold text-neutral-600 transition hover:border-neutral-300 hover:bg-white"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            aria-hidden="true"
                          >
                            <path d="M8 3v10M3 8h10" />
                          </svg>
                          Choisir un fichier
                        </button>
                      )}

                      {profileUploadError ? (
                        <p className="mt-2 text-xs text-red-600">
                          {profileUploadError}
                        </p>
                      ) : null}

                      <label className="mt-3 block">
                        <span className="text-xs font-semibold text-neutral-600">
                          Lien de page optionnel
                        </span>
                        <input
                          value={form.href}
                          onChange={(event) =>
                            updateForm(
                              "href",
                              event.target.value,
                            )
                          }
                          placeholder="/lampes-3d/anniversaire"
                          className="mt-2 h-11 w-full rounded-xl border border-black/[0.08] bg-white px-3 text-sm outline-none focus:border-neutral-300"
                        />
                      </label>
                    </div>
                  </div>
                </section>

              {/* Hero Images - Only for subcategories when editing */}
              {isSubcategory && editingCategory && (
                <section className="rounded-2xl border border-black/[0.07] bg-white p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-950">
                        Images Hero
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-neutral-400">
                        Images affichées dans le hero de la page catégorie.
                        Maximum 10 images. JPEG, PNG, WebP ou AVIF. Max 10 Mo.
                      </p>
                    </div>

                    <span className="text-xs font-medium text-neutral-400">
                      {heroImages.length}/10
                    </span>
                  </div>

                  <input
                    ref={heroFileInputRef}
                    type="file"
                    accept={ACCEPTED_IMAGE_TYPES.join(",")}
                    onChange={handleHeroImageUpload}
                    className="hidden"
                  />

                  {heroUploadError ? (
                    <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                      {heroUploadError}
                    </div>
                  ) : null}

                  {heroImages.length > 0 ? (
                    <div className="mt-4 space-y-2">
                      {heroImages.map((image, index) => (
                        <div
                          key={image.id}
                          className={[
                            "flex items-center gap-3 rounded-xl border border-black/[0.06] bg-[#faf9f6] p-2",
                            deletingImageId === image.id ||
                            reorderingImageId === image.id
                              ? "opacity-50"
                              : "",
                          ].join(" ")}
                        >
                          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-black/[0.06] bg-white">
                            <img
                              src={image.url}
                              alt={image.altText ?? ""}
                              className="h-full w-full object-cover"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs text-neutral-600">
                              {image.altText ?? "Image hero"}
                            </p>
                            <p className="mt-0.5 text-[10px] text-neutral-400">
                              Position {index + 1}
                            </p>
                          </div>

                          <div className="flex shrink-0 gap-1">
                            <button
                              type="button"
                              disabled={index === 0 || deletingImageId !== null}
                              onClick={() =>
                                void handleHeroImageMoveUp(image)
                              }
                              className="grid h-7 w-7 place-items-center rounded-lg text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
                              title="Monter"
                            >
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M8 3v10M4 7l4-4 4 4" />
                              </svg>
                            </button>

                            <button
                              type="button"
                              disabled={index === heroImages.length - 1 || deletingImageId !== null}
                              onClick={() =>
                                void handleHeroImageMoveDown(image)
                              }
                              className="grid h-7 w-7 place-items-center rounded-lg text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
                              title="Descendre"
                            >
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M8 13V3M4 9l4 4 4-4" />
                              </svg>
                            </button>

                            <button
                              type="button"
                              disabled={deletingImageId !== null}
                              onClick={() =>
                                void handleHeroImageDelete(image)
                              }
                              className="grid h-7 w-7 place-items-center rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-30"
                              title="Supprimer"
                            >
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M3 4h10M6 4V3h4v1M5 4v9h6V4" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-xl border border-dashed border-black/[0.1] bg-[#faf9f6] p-6 text-center">
                      <p className="text-xs text-neutral-400">
                        Aucune image hero. Ajoutez une image pour le hero de cette sous-catégorie.
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={
                      isUploadingHero || heroImages.length >= 10
                    }
                    onClick={() =>
                      heroFileInputRef.current?.click()
                    }
                    className={[
                      "mt-4 flex h-11 items-center gap-2 rounded-xl border border-dashed border-black/[0.15] bg-[#faf9f6] px-4 text-sm font-semibold transition",
                      isUploadingHero || heroImages.length >= 10
                        ? "cursor-not-allowed text-neutral-400"
                        : "text-neutral-600 hover:border-neutral-300 hover:bg-white",
                    ].join(" ")}
                  >
                    {isUploadingHero ? (
                      <>
                        <svg
                          className="animate-spin"
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <circle
                            cx="8"
                            cy="8"
                            r="6"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="opacity-25"
                          />
                          <path
                            d="M14 8a6 6 0 01-6 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            className="opacity-75"
                          />
                        </svg>
                        Upload en cours…
                      </>
                    ) : (
                      <>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          aria-hidden="true"
                        >
                          <path d="M8 3v10M3 8h10" />
                        </svg>
                        Ajouter une image hero
                      </>
                    )}
                  </button>
                </section>
              )}

              <section className="rounded-2xl border border-black/[0.07] bg-white p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-neutral-950">
                  Réglages
                </h3>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label>
                    <span className="text-xs font-semibold text-neutral-600">
                      Ordre d'affichage
                    </span>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={form.sortOrder}
                      onChange={(event) =>
                        updateForm(
                          "sortOrder",
                          event.target.value,
                        )
                      }
                      className="mt-2 h-11 w-full rounded-xl border border-black/[0.08] bg-white px-3 text-sm outline-none focus:border-neutral-300"
                    />
                  </label>

                  <label className="flex min-h-11 items-center gap-3 self-end rounded-xl border border-black/[0.07] bg-[#faf9f6] px-4">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(event) =>
                        updateForm(
                          "isActive",
                          event.target.checked,
                        )
                      }
                      className="h-4 w-4"
                    />
                    <span className="text-sm font-semibold text-neutral-700">
                      Catégorie active
                    </span>
                  </label>
                </div>
              </section>

              <section className="rounded-2xl border border-black/[0.07] bg-white p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-neutral-950">
                  SEO
                </h3>

                <div className="mt-4 space-y-4">
                  <label className="block">
                    <span className="text-xs font-semibold text-neutral-600">
                      Meta title
                    </span>
                    <input
                      maxLength={200}
                      value={form.metaTitle}
                      onChange={(event) =>
                        updateForm(
                          "metaTitle",
                          event.target.value,
                        )
                      }
                      className="mt-2 h-11 w-full rounded-xl border border-black/[0.08] bg-white px-3 text-sm outline-none focus:border-neutral-300"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-semibold text-neutral-600">
                      Meta description
                    </span>
                    <textarea
                      rows={3}
                      maxLength={500}
                      value={form.metaDescription}
                      onChange={(event) =>
                        updateForm(
                          "metaDescription",
                          event.target.value,
                        )
                      }
                      className="mt-2 w-full resize-y rounded-xl border border-black/[0.08] bg-white px-3 py-3 text-sm outline-none focus:border-neutral-300"
                    />
                  </label>
                </div>
              </section>
            </div>

            <div className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-black/[0.07] bg-[#f8f7f3]/95 px-5 py-4 backdrop-blur sm:flex-row sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="min-h-11 rounded-xl border border-black/[0.08] bg-white px-5 text-sm font-semibold text-neutral-700 disabled:opacity-50"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="min-h-11 rounded-xl bg-neutral-950 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving
                  ? "Enregistrement…"
                  : editingCategory
                    ? "Enregistrer les modifications"
                    : "Créer"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
