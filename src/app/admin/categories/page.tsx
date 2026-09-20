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
  mobileUrl: string | null;
  mobileStoragePath: string | null;
  altText: string | null;
  sortOrder: number;
  createdAt: string;
};

type PendingHeroUpload = {
  tempId: string;
  url: string;
  storagePath: string;
  mobileUrl: string;
  mobileStoragePath: string;
  altText: string;
  desktopFileName: string;
  mobileFileName: string;
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
  kind: "CATEGORY" | "SUBCATEGORY" | "SUBSUBCATEGORY";
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
  const [formSuccess, setFormSuccess] =
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

  // Hero carousel state
  const heroDesktopFileInputRef = useRef<HTMLInputElement>(null);
  const heroMobileFileInputRef = useRef<HTMLInputElement>(null);
  const [heroDesktopFile, setHeroDesktopFile] = useState<File | null>(null);
  const [heroMobileFile, setHeroMobileFile] = useState<File | null>(null);
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [pendingHeroUploads, setPendingHeroUploads] =
    useState<PendingHeroUpload[]>([]);
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [heroUploadError, setHeroUploadError] = useState<string | null>(null);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [reorderingImageId, setReorderingImageId] = useState<string | null>(null);
  const [updatingImageId, setUpdatingImageId] = useState<string | null>(null);

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

  const categoryById = useMemo(
    () =>
      new Map(
        categories.map((category) => [
          category.id,
          category,
        ]),
      ),
    [categories],
  );

  const secondLevelCategories = useMemo(
    () =>
      categories
        .filter((category) => {
          if (!category.parentId) return false;
          const parent = categoryById.get(
            category.parentId,
          );
          return Boolean(parent && !parent.parentId);
        })
        .sort(
          (a, b) =>
            a.sortOrder - b.sortOrder ||
            a.name.localeCompare(b.name, "fr"),
        ),
    [categories, categoryById],
  );

  const thirdLevelCategories = useMemo(
    () =>
      categories
        .filter((category) => {
          if (!category.parentId) return false;
          const parent = categoryById.get(
            category.parentId,
          );
          return Boolean(parent?.parentId);
        })
        .sort(
          (a, b) =>
            a.sortOrder - b.sortOrder ||
            a.name.localeCompare(b.name, "fr"),
        ),
    [categories, categoryById],
  );

  const parentCandidates = useMemo(() => {
    const candidates =
      form.kind === "SUBSUBCATEGORY"
        ? secondLevelCategories
        : form.kind === "SUBCATEGORY"
          ? topLevelCategories
          : [];

    return candidates.filter(
      (category) =>
        category.id !== editingCategory?.id &&
        category.isActive,
    );
  }, [
    editingCategory?.id,
    form.kind,
    secondLevelCategories,
    topLevelCategories,
  ]);

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

      const descendants = children.flatMap(
        (child) => [
          child,
          ...(childrenByParent.get(child.id) ?? []),
        ],
      );

      return (
        category.name.toLowerCase().includes(query) ||
        category.pageTitle
          ?.toLowerCase()
          .includes(query) ||
        descendants.some(
          (descendant) =>
            descendant.name
              .toLowerCase()
              .includes(query) ||
            descendant.pageTitle
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
    setFormSuccess(null);
    setProfileFile(null);
    setProfilePreview(null);
    setProfileUploadError(null);
    setPendingProfileUrl(null);
    setPendingProfileStoragePath(null);
    setHeroImages([]);
    setPendingHeroUploads([]);
    setHeroDesktopFile(null);
    setHeroMobileFile(null);
    setHeroUploadError(null);
    setIsFormOpen(true);
  }

  async function openEditForm(category: Category) {
    setEditingCategory(category);
    setSlugTouched(true);
    setFormError(null);
    setFormSuccess(null);
    setProfileFile(null);
    setProfilePreview(category.imageUrl);
    setProfileUploadError(null);
    setPendingProfileUrl(null);
    setPendingProfileStoragePath(null);
    setPendingHeroUploads([]);
    setHeroDesktopFile(null);
    setHeroMobileFile(null);
    setHeroUploadError(null);
    setForm({
      name: category.name,
      slug: category.slug,
      kind: category.parentId
        ? categoryById.get(category.parentId)
            ?.parentId
          ? "SUBSUBCATEGORY"
          : "SUBCATEGORY"
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

    // Hero carousel is available only for top-level categories.
    if (!category.parentId) {
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
    setFormSuccess(null);
    setSlugTouched(false);
    setProfileFile(null);
    setProfilePreview(null);
    setProfileUploadError(null);
    setPendingProfileUrl(null);
    setPendingProfileStoragePath(null);
    setHeroImages([]);
    setPendingHeroUploads([]);
    setHeroDesktopFile(null);
    setHeroMobileFile(null);
    setHeroUploadError(null);
  }

  /** Cancel = cleanup temp uploads then close. */
  function handleCancel() {
    if (isSaving) return;

    if (pendingProfileStoragePath) {
      void deleteTempStorage(pendingProfileStoragePath);
    }

    for (const pendingHero of pendingHeroUploads) {
      void deleteTempStorage(pendingHero.storagePath);
      void deleteTempStorage(pendingHero.mobileStoragePath);
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
    // If this is a new unsaved upload, remove it from Storage immediately.
    if (pendingProfileStoragePath) {
      void deleteTempStorage(pendingProfileStoragePath);
      setPendingProfileUrl(null);
      setPendingProfileStoragePath(null);
    }

    setProfileFile(null);
    setProfilePreview(null);
    setProfileUploadError(null);
    updateForm("imageUrl", "");
    updateForm("imageStoragePath", "");

    if (profileFileInputRef.current) {
      profileFileInputRef.current.value = "";
    }
  }

  // Hero carousel operations
  function validateHeroFile(file: File): string | null {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return "Format non supporté. Utilisez JPEG, PNG, WebP ou AVIF.";
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return `Fichier trop volumineux (${formatFileSize(file.size)}). Maximum : 10 Mo.`;
    }

    return null;
  }

  function handleHeroDraftFileSelect(
    kind: "desktop" | "mobile",
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const validationError = validateHeroFile(file);

    if (validationError) {
      setHeroUploadError(validationError);
      event.target.value = "";
      return;
    }

    setHeroUploadError(null);

    if (kind === "desktop") {
      setHeroDesktopFile(file);
    } else {
      setHeroMobileFile(file);
    }

    event.target.value = "";
  }

  async function uploadHeroFile(
    file: File,
    accessToken: string,
  ): Promise<{ url: string; path: string }> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      throw new Error(
        "NEXT_PUBLIC_API_URL n'est pas configurée.",
      );
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      `${apiUrl}/media/category-images`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      },
    );

    if (!response.ok) {
      const payload = (
        await response.json().catch(() => null)
      ) as ApiErrorPayload | null;

      throw new Error(
        apiMessage(
          payload,
          "Erreur lors de l'upload de l'image.",
        ),
      );
    }

    return (await response.json()) as {
      url: string;
      path: string;
    };
  }

  async function handleAddHeroSlide() {
    setHeroUploadError(null);

    if (!heroDesktopFile || !heroMobileFile) {
      setHeroUploadError(
        "Choisissez une image PC et une image téléphone pour ce slide.",
      );
      return;
    }

    const totalHeroSlides =
      heroImages.length + pendingHeroUploads.length;

    if (totalHeroSlides >= 10) {
      setHeroUploadError(
        "Le carrousel Hero est limité à 10 slides.",
      );
      return;
    }

    setIsUploadingHero(true);

    let desktopUpload: { url: string; path: string } | null = null;
    let mobileUpload: { url: string; path: string } | null = null;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        router.replace("/admin/login");
        return;
      }

      desktopUpload = await uploadHeroFile(
        heroDesktopFile,
        session.access_token,
      );

      mobileUpload = await uploadHeroFile(
        heroMobileFile,
        session.access_token,
      );

      const altText = heroDesktopFile.name.replace(
        /\.[^/.]+$/,
        "",
      );

      if (!editingCategory) {
        setPendingHeroUploads((current) => [
          ...current,
          {
            tempId: crypto.randomUUID(),
            url: desktopUpload!.url,
            storagePath: desktopUpload!.path,
            mobileUrl: mobileUpload!.url,
            mobileStoragePath: mobileUpload!.path,
            altText,
            desktopFileName: heroDesktopFile.name,
            mobileFileName: heroMobileFile.name,
          },
        ]);

        // These Storage files are now owned by pendingHeroUploads.
        desktopUpload = null;
        mobileUpload = null;
        setHeroDesktopFile(null);
        setHeroMobileFile(null);
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        throw new Error(
          "NEXT_PUBLIC_API_URL n'est pas configurée.",
        );
      }

      const nextSortOrder =
        heroImages.length === 0
          ? 0
          : Math.max(
              ...heroImages.map(
                (image) => image.sortOrder,
              ),
            ) + 1;

      const createResponse = await fetch(
        `${apiUrl}/admin/categories/${editingCategory.id}/hero-images`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: desktopUpload.url,
            storagePath: desktopUpload.path,
            mobileUrl: mobileUpload.url,
            mobileStoragePath: mobileUpload.path,
            altText,
            sortOrder: nextSortOrder,
          }),
        },
      );

      if (!createResponse.ok) {
        const payload = (
          await createResponse.json().catch(() => null)
        ) as ApiErrorPayload | null;

        throw new Error(
          apiMessage(
            payload,
            "Erreur lors de l'enregistrement du slide Hero.",
          ),
        );
      }

      const newImage =
        (await createResponse.json()) as HeroImage;

      setHeroImages((current) => [
        ...current,
        newImage,
      ]);

      // The DB row now owns both Storage files.
      desktopUpload = null;
      mobileUpload = null;
      setHeroDesktopFile(null);
      setHeroMobileFile(null);
    } catch (error) {
      if (desktopUpload) {
        await deleteTempStorage(desktopUpload.path);
      }

      if (mobileUpload) {
        await deleteTempStorage(mobileUpload.path);
      }

      setHeroUploadError(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'ajout du slide Hero.",
      );
    } finally {
      setIsUploadingHero(false);
    }
  }

  async function handlePendingHeroDelete(
    pending: PendingHeroUpload,
  ) {
    setDeletingImageId(pending.tempId);

    try {
      await Promise.all([
        deleteTempStorage(pending.storagePath),
        deleteTempStorage(pending.mobileStoragePath),
      ]);

      setPendingHeroUploads((current) =>
        current.filter(
          (item) => item.tempId !== pending.tempId,
        ),
      );
    } finally {
      setDeletingImageId(null);
    }
  }

  function movePendingHero(
    pending: PendingHeroUpload,
    direction: "up" | "down",
  ) {
    setPendingHeroUploads((current) => {
      const currentIndex = current.findIndex(
        (item) => item.tempId === pending.tempId,
      );

      if (currentIndex < 0) {
        return current;
      }

      const targetIndex =
        direction === "up"
          ? currentIndex - 1
          : currentIndex + 1;

      if (
        targetIndex < 0 ||
        targetIndex >= current.length
      ) {
        return current;
      }

      const next = [...current];
      const temp = next[targetIndex];
      next[targetIndex] = next[currentIndex];
      next[currentIndex] = temp;

      return next;
    });
  }

  async function handleHeroImageReplacement(
    image: HeroImage,
    kind: "desktop" | "mobile",
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !editingCategory) {
      return;
    }

    const validationError = validateHeroFile(file);

    if (validationError) {
      setHeroUploadError(validationError);
      return;
    }

    setHeroUploadError(null);
    setUpdatingImageId(image.id);

    let uploaded: { url: string; path: string } | null = null;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        router.replace("/admin/login");
        return;
      }

      uploaded = await uploadHeroFile(
        file,
        session.access_token,
      );

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        throw new Error(
          "NEXT_PUBLIC_API_URL n'est pas configurée.",
        );
      }

      const payload =
        kind === "desktop"
          ? {
              url: uploaded.url,
              storagePath: uploaded.path,
            }
          : {
              mobileUrl: uploaded.url,
              mobileStoragePath: uploaded.path,
            };

      const response = await fetch(
        `${apiUrl}/admin/categories/${editingCategory.id}/hero-images/${image.id}`,
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
        const errorPayload = (
          await response.json().catch(() => null)
        ) as ApiErrorPayload | null;

        throw new Error(
          apiMessage(
            errorPayload,
            kind === "desktop"
              ? "Impossible de remplacer l'image PC."
              : "Impossible de remplacer l'image téléphone.",
          ),
        );
      }

      const updated =
        (await response.json()) as HeroImage;

      setHeroImages((current) =>
        current.map((item) =>
          item.id === updated.id ? updated : item,
        ),
      );

      // The DB row now owns the new Storage file.
      uploaded = null;
    } catch (error) {
      if (uploaded) {
        await deleteTempStorage(uploaded.path);
      }

      setHeroUploadError(
        error instanceof Error
          ? error.message
          : "Erreur lors du remplacement de l'image Hero.",
      );
    } finally {
      setUpdatingImageId(null);
    }
  }

  async function handleHeroImageDelete(image: HeroImage) {
    if (!editingCategory) return;

    const confirmed = window.confirm(
      "Supprimer ce slide Hero ?",
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
        const payload = (
          await response.json().catch(() => null)
        ) as ApiErrorPayload | null;

        window.alert(
          apiMessage(
            payload,
            "Impossible de supprimer le slide.",
          ),
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

      const response = await fetch(
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

      if (!response.ok) {
        throw new Error("Reorder failed");
      }
    } catch {
      await loadHeroImages(editingCategory.id);
      setHeroUploadError(
        "Impossible de modifier l'ordre des slides.",
      );
    } finally {
      setReorderingImageId(null);
    }
  }

  async function handleHeroImageMoveDown(image: HeroImage) {
    if (!editingCategory) return;

    const currentIndex = heroImages.findIndex(
      (img) => img.id === image.id,
    );

    if (
      currentIndex < 0 ||
      currentIndex >= heroImages.length - 1
    ) {
      return;
    }

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

      const response = await fetch(
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

      if (!response.ok) {
        throw new Error("Reorder failed");
      }
    } catch {
      await loadHeroImages(editingCategory.id);
      setHeroUploadError(
        "Impossible de modifier l'ordre des slides.",
      );
    } finally {
      setReorderingImageId(null);
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setFormError(null);
    setFormSuccess(null);

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
      form.kind !== "CATEGORY" &&
      !form.parentId
    ) {
      setFormError(
        form.kind === "SUBSUBCATEGORY"
          ? "Choisissez la sous-catégorie parente."
          : "Choisissez la catégorie parente.",
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

    if (heroDesktopFile || heroMobileFile) {
      setFormError(
        "Ajoutez ou annulez le slide Hero en préparation avant d'enregistrer la catégorie.",
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
          form.kind === "CATEGORY"
            ? null
            : form.parentId,
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

      const savedCategory = (await response.json()) as Category;

      // During creation the category UUID does not exist yet, so pending
      // desktop/mobile slide pairs are attached immediately after creation.
      const wasCreatingCategory = !editingCategory;
      let committedHeroImages: HeroImage[] = [];
      let failedHeroUploads = 0;

      if (
        wasCreatingCategory &&
        form.kind === "CATEGORY" &&
        pendingHeroUploads.length > 0
      ) {
        for (
          let index = 0;
          index < pendingHeroUploads.length;
          index += 1
        ) {
          const pendingHero =
            pendingHeroUploads[index];

          try {
            const createHeroResponse = await fetch(
              `${apiUrl}/admin/categories/${savedCategory.id}/hero-images`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${session.access_token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  url: pendingHero.url,
                  storagePath:
                    pendingHero.storagePath,
                  mobileUrl:
                    pendingHero.mobileUrl,
                  mobileStoragePath:
                    pendingHero.mobileStoragePath,
                  altText:
                    pendingHero.altText,
                  sortOrder: index,
                }),
              },
            );

            if (!createHeroResponse.ok) {
              failedHeroUploads += 1;

              await Promise.all([
                deleteTempStorage(
                  pendingHero.storagePath,
                ),
                deleteTempStorage(
                  pendingHero.mobileStoragePath,
                ),
              ]);

              continue;
            }

            committedHeroImages.push(
              (await createHeroResponse.json()) as HeroImage,
            );
          } catch {
            failedHeroUploads += 1;

            await Promise.all([
              deleteTempStorage(
                pendingHero.storagePath,
              ),
              deleteTempStorage(
                pendingHero.mobileStoragePath,
              ),
            ]);
          }
        }
      }

      // Save succeeded — pending presentation image is now official in DB.
      setPendingProfileUrl(null);
      setPendingProfileStoragePath(null);
      setPendingHeroUploads([]);
      setHeroDesktopFile(null);
      setHeroMobileFile(null);

      const keepCreatedCategoryOpen =
        wasCreatingCategory &&
        form.kind === "CATEGORY" &&
        failedHeroUploads > 0;

      if (keepCreatedCategoryOpen) {
        // Keep the modal open after the first save so Hero slides can still
        // be managed immediately without closing and reopening the category.
        setEditingCategory(savedCategory);
        setSlugTouched(true);
        setProfileFile(null);
        setProfilePreview(savedCategory.imageUrl);
        setHeroImages(
          committedHeroImages.length > 0
            ? committedHeroImages
            : savedCategory.heroImages ?? [],
        );
        setForm({
          name: savedCategory.name,
          slug: savedCategory.slug,
          kind: form.kind,
          parentId:
            savedCategory.parentId ?? form.parentId,
          description:
            savedCategory.description ?? "",
          pageTitle:
            savedCategory.pageTitle ?? "",
          productsTitle:
            savedCategory.productsTitle ?? "",
          filterLabel:
            savedCategory.filterLabel ?? "",
          imageUrl:
            savedCategory.imageUrl ?? "",
          imageStoragePath:
            savedCategory.imageStoragePath ?? "",
          href: savedCategory.href ?? "",
          sortOrder:
            String(savedCategory.sortOrder),
          isActive:
            savedCategory.isActive,
          metaTitle:
            savedCategory.metaTitle ?? "",
          metaDescription:
            savedCategory.metaDescription ?? "",
        });

        const heroSuccessCount =
          committedHeroImages.length;

        const createdLabel =
          form.kind === "SUBSUBCATEGORY"
            ? "Sous-sous-catégorie créée"
            : form.kind === "SUBCATEGORY"
              ? "Sous-catégorie créée"
              : "Catégorie créée";

        setFormSuccess(
          heroSuccessCount > 0
            ? `${createdLabel} avec ${heroSuccessCount} slide(s) Hero.`
            : `${createdLabel}.`,
        );

        if (failedHeroUploads > 0) {
          setHeroUploadError(
            `${failedHeroUploads} slide(s) Hero n'ont pas pu être enregistrés. Vous pouvez les ajouter à nouveau ci-dessous.`,
          );
        }
      } else {
        closeForm();
      }

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

  const deleteImpact = useMemo(() => {
    if (!deleteTarget) {
      return {
        descendants: [] as Category[],
        secondLevelCount: 0,
        thirdLevelCount: 0,
      };
    }

    const descendants: Category[] = [];
    const visited = new Set<string>([deleteTarget.id]);
    let frontier = [deleteTarget.id];

    while (frontier.length > 0) {
      const nextFrontier: string[] = [];

      for (const parentId of frontier) {
        const children =
          childrenByParent.get(parentId) ?? [];

        for (const child of children) {
          if (visited.has(child.id)) {
            continue;
          }

          visited.add(child.id);
          descendants.push(child);
          nextFrontier.push(child.id);
        }
      }

      frontier = nextFrontier;
    }

    let secondLevelCount = 0;
    let thirdLevelCount = 0;

    for (const descendant of descendants) {
      const parent = descendant.parentId
        ? categoryById.get(descendant.parentId)
        : null;

      if (parent?.parentId) {
        thirdLevelCount += 1;
      } else {
        secondLevelCount += 1;
      }
    }

    return {
      descendants,
      secondLevelCount,
      thirdLevelCount,
    };
  }, [
    categoryById,
    childrenByParent,
    deleteTarget,
  ]);

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

        const message = apiMessage(
          payload,
          "Impossible de supprimer définitivement cette catégorie.",
        );

        const normalizedMessage =
          message.toLowerCase();

        if (
          normalizedMessage.includes("sous-catégorie") ||
          normalizedMessage.includes("sous catégorie") ||
          normalizedMessage.includes("child categor") ||
          normalizedMessage.includes("children")
        ) {
          setDeleteError(
            "Le backend utilisé par cette page bloque encore les catégories enfants. Le code actuel du backend Michket autorise déjà la suppression en cascade : vérifiez que la dernière version du backend est bien déployée.",
          );
        } else {
          setDeleteError(message);
        }
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
  const isSubSubcategory =
    form.kind === "SUBSUBCATEGORY";

  return (
    <div>
      <PageHeader
        title="Catégories"
        description="Organisez le catalogue en catégories, sous-catégories et sous-sous-catégories."
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

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
            {secondLevelCategories.length}
          </p>
        </div>

        <div className="rounded-2xl border border-black/[0.07] bg-white p-4">
          <p className="text-xs font-medium text-neutral-400">
            Sous-sous-catégories
          </p>
          <p className="mt-2 text-2xl font-semibold text-neutral-950">
            {thirdLevelCategories.length}
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
              Une catégorie principale peut contenir des sous-catégories, qui peuvent elles-mêmes contenir des sous-sous-catégories optionnelles.
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
                            setFormSuccess(null);
                            setProfileFile(null);
                            setProfilePreview(null);
                            setProfileUploadError(null);
                            setHeroImages([]);
                            setPendingHeroUploads([]);
                            setHeroDesktopFile(null);
                            setHeroMobileFile(null);
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

                              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingCategory(null);
                                    setForm({
                                      ...EMPTY_FORM,
                                      kind: "SUBSUBCATEGORY",
                                      parentId: child.id,
                                    });
                                    setSlugTouched(false);
                                    setFormError(null);
                                    setFormSuccess(null);
                                    setProfileFile(null);
                                    setProfilePreview(null);
                                    setProfileUploadError(null);
                                    setHeroImages([]);
                                    setPendingHeroUploads([]);
                                    setHeroDesktopFile(null);
                                    setHeroMobileFile(null);
                                    setHeroUploadError(null);
                                    setIsFormOpen(true);
                                  }}
                                  className="text-xs font-semibold text-[#8A6A20] hover:text-neutral-950"
                                >
                                  + Sous-sous-catégorie
                                </button>

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

                              {(childrenByParent.get(child.id) ?? []).length > 0 ? (
                                <div className="mt-3 space-y-2 border-l border-black/[0.08] pl-3">
                                  {(childrenByParent.get(child.id) ?? []).map(
                                    (grandchild) => (
                                      <div
                                        key={grandchild.id}
                                        className="rounded-lg border border-black/[0.06] bg-white p-2.5"
                                      >
                                        <div className="flex items-start gap-2.5">
                                          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-md border border-black/[0.06] bg-[#f3f1ec]">
                                            {grandchild.imageUrl ? (
                                              <img
                                                src={grandchild.imageUrl}
                                                alt={grandchild.name}
                                                className="h-full w-full object-cover"
                                              />
                                            ) : (
                                              <div className="grid h-full w-full place-items-center text-[8px] font-bold text-neutral-400">
                                                N3
                                              </div>
                                            )}
                                          </div>

                                          <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-2">
                                              <div className="min-w-0">
                                                <p className="truncate text-xs font-semibold text-neutral-900">
                                                  {grandchild.name}
                                                </p>
                                                <p className="mt-0.5 truncate text-[10px] text-neutral-400">
                                                  /{grandchild.slug}
                                                </p>
                                              </div>

                                              <span
                                                className={[
                                                  "mt-0.5 h-2 w-2 shrink-0 rounded-full",
                                                  grandchild.isActive
                                                    ? "bg-emerald-500"
                                                    : "bg-neutral-300",
                                                ].join(" ")}
                                                title={
                                                  grandchild.isActive
                                                    ? "Active"
                                                    : "Inactive"
                                                }
                                              />
                                            </div>

                                            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  void openEditForm(grandchild)
                                                }
                                                className="text-[11px] font-semibold text-neutral-600 hover:text-neutral-950"
                                              >
                                                Modifier
                                              </button>

                                              <button
                                                type="button"
                                                disabled={
                                                  actionId === grandchild.id
                                                }
                                                onClick={() =>
                                                  void toggleCategoryActive(
                                                    grandchild,
                                                  )
                                                }
                                                className={[
                                                  "text-[11px] font-semibold disabled:opacity-50",
                                                  grandchild.isActive
                                                    ? "text-amber-700 hover:text-amber-800"
                                                    : "text-emerald-700 hover:text-emerald-800",
                                                ].join(" ")}
                                              >
                                                {actionId === grandchild.id
                                                  ? "Mise à jour…"
                                                  : grandchild.isActive
                                                    ? "Désactiver"
                                                    : "Réactiver"}
                                              </button>

                                              <button
                                                type="button"
                                                onClick={() =>
                                                  openDeleteCategory(
                                                    grandchild,
                                                  )
                                                }
                                                className="text-[11px] font-semibold text-red-600 hover:text-red-700"
                                              >
                                                Supprimer
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ),
                                  )}
                                </div>
                              ) : null}
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
            <div className="mt-3 space-y-3">
              <p className="text-sm leading-6 text-neutral-600">
                Cette action est irréversible. La catégorie sélectionnée sera supprimée
                avec toutes les sous-catégories et sous-sous-catégories qu&apos;elle contient.
                Les images enregistrées pour toute cette branche seront également nettoyées.
              </p>

              {deleteImpact.descendants.length > 0 ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-xs font-semibold text-amber-900">
                    Suppression en cascade
                  </p>
                  <p className="mt-1 text-xs leading-5 text-amber-800">
                    Cette suppression enlèvera aussi{" "}
                    {deleteImpact.descendants.length} catégorie
                    {deleteImpact.descendants.length > 1 ? "s" : ""} enfant
                    {deleteImpact.descendants.length > 1 ? "s" : ""}.
                    {deleteImpact.secondLevelCount > 0
                      ? ` ${deleteImpact.secondLevelCount} sous-catégorie${
                          deleteImpact.secondLevelCount > 1 ? "s" : ""
                        }.`
                      : ""}
                    {deleteImpact.thirdLevelCount > 0
                      ? ` ${deleteImpact.thirdLevelCount} sous-sous-catégorie${
                          deleteImpact.thirdLevelCount > 1 ? "s" : ""
                        }.`
                      : ""}
                  </p>
                </div>
              ) : null}

              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-xs font-semibold text-red-800">
                  Les produits seront également supprimés
                </p>
                <p className="mt-1 text-xs leading-5 text-red-700">
                  Tous les produits rattachés à cette catégorie, à ses sous-catégories
                  ou à ses sous-sous-catégories seront supprimés définitivement avec
                  leurs variantes, leur inventaire et leurs images. Les anciennes
                  commandes restent conservées.
                </p>
              </div>
            </div>

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

              {formSuccess ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  {formSuccess}
                </div>
              ) : null}

              <section className="rounded-2xl border border-black/[0.07] bg-white p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-neutral-950">
                  Type
                </h3>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
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
                      setForm((current) => ({
                        ...current,
                        kind: "SUBCATEGORY",
                        parentId:
                          current.kind === "SUBCATEGORY"
                            ? current.parentId
                            : "",
                      }))
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

                  <button
                    type="button"
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        kind: "SUBSUBCATEGORY",
                        parentId: "",
                      }))
                    }
                    className={[
                      "rounded-xl border p-4 text-left transition",
                      form.kind === "SUBSUBCATEGORY"
                        ? "border-neutral-950 bg-neutral-950 text-white"
                        : "border-black/[0.07] bg-[#faf9f6] text-neutral-800",
                    ].join(" ")}
                  >
                    <p className="text-sm font-semibold">
                      Sous-sous-catégorie
                    </p>
                    <p
                      className={[
                        "mt-1 text-xs leading-5",
                        form.kind === "SUBSUBCATEGORY"
                          ? "text-white/60"
                          : "text-neutral-400",
                      ].join(" ")}
                    >
                      Exemple : Chirurgie
                    </p>
                  </button>
                </div>

                {form.kind !== "CATEGORY" ? (
                  <label className="mt-4 block">
                    <span className="text-xs font-semibold text-neutral-600">
                      {form.kind === "SUBSUBCATEGORY"
                        ? "Sous-catégorie parente *"
                        : "Catégorie parente *"}
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
                        (category) => {
                          const parent =
                            category.parentId
                              ? categoryById.get(
                                  category.parentId,
                                )
                              : null;

                          return (
                            <option
                              key={category.id}
                              value={category.id}
                            >
                              {parent
                                ? `${parent.name} → ${category.name}`
                                : category.name}
                            </option>
                          );
                        },
                      )}
                    </select>

                    {form.kind === "SUBSUBCATEGORY" ? (
                      <p className="mt-2 text-xs leading-5 text-neutral-400">
                        Le niveau 3 est optionnel. Choisissez ici la sous-catégorie qui contiendra cette sous-sous-catégorie.
                      </p>
                    ) : null}
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
                      {form.kind === "CATEGORY"
                        ? "Titre de la catégorie"
                        : "Titre accrocheur"}
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
                        form.kind === "SUBSUBCATEGORY"
                          ? "Ex : Lampes pour chirurgiens"
                          : form.kind === "SUBCATEGORY"
                            ? "Ex : Découvrez nos lampes médecine"
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
                    Image utilisée pour représenter cette{" "}
                    {isSubSubcategory
                      ? "sous-sous-catégorie"
                      : isSubcategory
                        ? "sous-catégorie"
                        : "catégorie"}.
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

              {/* Carrousel Hero - catégories principales uniquement */}
              {form.kind === "CATEGORY" ? (
  
                <section className="rounded-2xl border border-black/[0.07] bg-white p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-950">
                        Carrousel Hero de cette page
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-neutral-400">
                        Chaque slide contient une image PC horizontale et une image téléphone verticale.
                        Maximum 10 slides. JPEG, PNG, WebP ou AVIF. Max 10 Mo par image.
                      </p>
                    </div>
  
                    <span className="shrink-0 text-xs font-medium text-neutral-400">
                      {heroImages.length + pendingHeroUploads.length}/10
                    </span>
                  </div>
  
                  <input
                    ref={heroDesktopFileInputRef}
                    type="file"
                    accept={ACCEPTED_IMAGE_TYPES.join(",")}
                    onChange={(event) =>
                      handleHeroDraftFileSelect(
                        "desktop",
                        event,
                      )
                    }
                    className="hidden"
                  />
  
                  <input
                    ref={heroMobileFileInputRef}
                    type="file"
                    accept={ACCEPTED_IMAGE_TYPES.join(",")}
                    onChange={(event) =>
                      handleHeroDraftFileSelect(
                        "mobile",
                        event,
                      )
                    }
                    className="hidden"
                  />
  
                  {heroUploadError ? (
                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                      {heroUploadError}
                    </div>
                  ) : null}
  
                  <div className="mt-4 rounded-xl border border-black/[0.07] bg-[#faf9f6] p-3 sm:p-4">
                    <p className="text-xs font-semibold text-neutral-700">
                      Nouveau slide
                    </p>
  
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-black/[0.06] bg-white p-3">
                        <p className="text-xs font-semibold text-neutral-800">
                          Image PC
                        </p>
                        <p className="mt-1 text-[11px] text-neutral-400">
                          Format horizontal
                        </p>
  
                        {heroDesktopFile ? (
                          <div className="mt-3 rounded-lg bg-[#f5f3ee] px-3 py-2">
                            <p className="truncate text-xs font-medium text-neutral-700">
                              {heroDesktopFile.name}
                            </p>
                            <p className="mt-0.5 text-[10px] text-neutral-400">
                              {formatFileSize(heroDesktopFile.size)}
                            </p>
                          </div>
                        ) : null}
  
                        <button
                          type="button"
                          disabled={isUploadingHero}
                          onClick={() =>
                            heroDesktopFileInputRef.current?.click()
                          }
                          className="mt-3 min-h-10 w-full rounded-lg border border-dashed border-black/[0.14] px-3 text-xs font-semibold text-neutral-600 transition hover:bg-neutral-50 disabled:opacity-50"
                        >
                          {heroDesktopFile
                            ? "Changer l'image PC"
                            : "Choisir l'image PC"}
                        </button>
                      </div>
  
                      <div className="rounded-xl border border-black/[0.06] bg-white p-3">
                        <p className="text-xs font-semibold text-neutral-800">
                          Image téléphone
                        </p>
                        <p className="mt-1 text-[11px] text-neutral-400">
                          Format vertical
                        </p>
  
                        {heroMobileFile ? (
                          <div className="mt-3 rounded-lg bg-[#f5f3ee] px-3 py-2">
                            <p className="truncate text-xs font-medium text-neutral-700">
                              {heroMobileFile.name}
                            </p>
                            <p className="mt-0.5 text-[10px] text-neutral-400">
                              {formatFileSize(heroMobileFile.size)}
                            </p>
                          </div>
                        ) : null}
  
                        <button
                          type="button"
                          disabled={isUploadingHero}
                          onClick={() =>
                            heroMobileFileInputRef.current?.click()
                          }
                          className="mt-3 min-h-10 w-full rounded-lg border border-dashed border-black/[0.14] px-3 text-xs font-semibold text-neutral-600 transition hover:bg-neutral-50 disabled:opacity-50"
                        >
                          {heroMobileFile
                            ? "Changer l'image téléphone"
                            : "Choisir l'image téléphone"}
                        </button>
                      </div>
                    </div>
  
                    <button
                      type="button"
                      disabled={
                        isUploadingHero ||
                        !heroDesktopFile ||
                        !heroMobileFile ||
                        heroImages.length + pendingHeroUploads.length >= 10
                      }
                      onClick={() =>
                        void handleAddHeroSlide()
                      }
                      className="mt-3 min-h-11 w-full rounded-xl bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {isUploadingHero
                        ? "Upload du slide…"
                        : "Ajouter ce slide"}
                    </button>
                  </div>
  
                  {pendingHeroUploads.length > 0 ? (
                    <div className="mt-4 space-y-3">
                      {pendingHeroUploads.map(
                        (pending, index) => (
                          <div
                            key={pending.tempId}
                            className={[
                              "rounded-xl border border-amber-200 bg-amber-50/60 p-3",
                              deletingImageId === pending.tempId
                                ? "opacity-50"
                                : "",
                            ].join(" ")}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-xs font-semibold text-neutral-800">
                                  Slide {heroImages.length + index + 1}
                                </p>
                                <p className="mt-0.5 text-[10px] font-medium text-amber-700">
                                  Sera enregistré avec la catégorie
                                </p>
                              </div>
  
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  disabled={
                                    index === 0 ||
                                    deletingImageId !== null
                                  }
                                  onClick={() =>
                                    movePendingHero(
                                      pending,
                                      "up",
                                    )
                                  }
                                  className="grid h-8 w-8 place-items-center rounded-lg text-neutral-500 hover:bg-white disabled:opacity-30"
                                  title="Monter"
                                >
                                  ↑
                                </button>
  
                                <button
                                  type="button"
                                  disabled={
                                    index ===
                                      pendingHeroUploads.length - 1 ||
                                    deletingImageId !== null
                                  }
                                  onClick={() =>
                                    movePendingHero(
                                      pending,
                                      "down",
                                    )
                                  }
                                  className="grid h-8 w-8 place-items-center rounded-lg text-neutral-500 hover:bg-white disabled:opacity-30"
                                  title="Descendre"
                                >
                                  ↓
                                </button>
  
                                <button
                                  type="button"
                                  disabled={
                                    deletingImageId !== null
                                  }
                                  onClick={() =>
                                    void handlePendingHeroDelete(
                                      pending,
                                    )
                                  }
                                  className="grid h-8 w-8 place-items-center rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-30"
                                  title="Retirer"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
  
                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                              <div>
                                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
                                  PC
                                </p>
                                <div className="aspect-[16/7] overflow-hidden rounded-lg border border-black/[0.06] bg-white">
                                  <img
                                    src={pending.url}
                                    alt={pending.altText}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <p className="mt-1 truncate text-[10px] text-neutral-500">
                                  {pending.desktopFileName}
                                </p>
                              </div>
  
                              <div>
                                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
                                  Téléphone
                                </p>
                                <div className="mx-auto aspect-[3/4] max-h-40 overflow-hidden rounded-lg border border-black/[0.06] bg-white">
                                  <img
                                    src={pending.mobileUrl}
                                    alt={pending.altText}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <p className="mt-1 truncate text-[10px] text-neutral-500">
                                  {pending.mobileFileName}
                                </p>
                              </div>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  ) : null}
  
                  {heroImages.length > 0 ? (
                    <div className="mt-4 space-y-3">
                      {heroImages.map((image, index) => {
                        const imageBusy =
                          deletingImageId === image.id ||
                          reorderingImageId === image.id ||
                          updatingImageId === image.id;
  
                        return (
                          <div
                            key={image.id}
                            className={[
                              "rounded-xl border border-black/[0.06] bg-[#faf9f6] p-3",
                              imageBusy ? "opacity-50" : "",
                            ].join(" ")}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-xs font-semibold text-neutral-800">
                                  Slide {index + 1}
                                </p>
                                <p className="mt-0.5 text-[10px] text-neutral-400">
                                  {image.altText ?? "Image Hero"}
                                </p>
                              </div>
  
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  disabled={
                                    index === 0 ||
                                    deletingImageId !== null ||
                                    reorderingImageId !== null ||
                                    updatingImageId !== null
                                  }
                                  onClick={() =>
                                    void handleHeroImageMoveUp(
                                      image,
                                    )
                                  }
                                  className="grid h-8 w-8 place-items-center rounded-lg text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
                                  title="Monter"
                                >
                                  ↑
                                </button>
  
                                <button
                                  type="button"
                                  disabled={
                                    index === heroImages.length - 1 ||
                                    deletingImageId !== null ||
                                    reorderingImageId !== null ||
                                    updatingImageId !== null
                                  }
                                  onClick={() =>
                                    void handleHeroImageMoveDown(
                                      image,
                                    )
                                  }
                                  className="grid h-8 w-8 place-items-center rounded-lg text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
                                  title="Descendre"
                                >
                                  ↓
                                </button>
  
                                <button
                                  type="button"
                                  disabled={
                                    deletingImageId !== null ||
                                    updatingImageId !== null
                                  }
                                  onClick={() =>
                                    void handleHeroImageDelete(
                                      image,
                                    )
                                  }
                                  className="grid h-8 w-8 place-items-center rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-30"
                                  title="Supprimer le slide"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
  
                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                              <div className="rounded-lg border border-black/[0.06] bg-white p-2">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
                                  PC · horizontal
                                </p>
                                <div className="mt-2 aspect-[16/7] overflow-hidden rounded-md bg-[#f3f1ec]">
                                  <img
                                    src={image.url}
                                    alt={image.altText ?? ""}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
  
                                <label className="mt-2 flex min-h-9 cursor-pointer items-center justify-center rounded-lg border border-black/[0.08] px-3 text-[11px] font-semibold text-neutral-600 hover:bg-neutral-50">
                                  Remplacer l'image PC
                                  <input
                                    type="file"
                                    accept={ACCEPTED_IMAGE_TYPES.join(",")}
                                    disabled={imageBusy}
                                    onChange={(event) =>
                                      void handleHeroImageReplacement(
                                        image,
                                        "desktop",
                                        event,
                                      )
                                    }
                                    className="hidden"
                                  />
                                </label>
                              </div>
  
                              <div className="rounded-lg border border-black/[0.06] bg-white p-2">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
                                  Téléphone · vertical
                                </p>
  
                                {image.mobileUrl ? (
                                  <div className="mx-auto mt-2 aspect-[3/4] max-h-48 overflow-hidden rounded-md bg-[#f3f1ec]">
                                    <img
                                      src={image.mobileUrl}
                                      alt={image.altText ?? ""}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="mt-2 grid min-h-28 place-items-center rounded-md border border-dashed border-amber-200 bg-amber-50 px-3 text-center text-[11px] text-amber-700">
                                    Ancien slide : ajoutez maintenant son image téléphone.
                                  </div>
                                )}
  
                                <label className="mt-2 flex min-h-9 cursor-pointer items-center justify-center rounded-lg border border-black/[0.08] px-3 text-[11px] font-semibold text-neutral-600 hover:bg-neutral-50">
                                  {image.mobileUrl
                                    ? "Remplacer l'image téléphone"
                                    : "Ajouter l'image téléphone"}
                                  <input
                                    type="file"
                                    accept={ACCEPTED_IMAGE_TYPES.join(",")}
                                    disabled={imageBusy}
                                    onChange={(event) =>
                                      void handleHeroImageReplacement(
                                        image,
                                        "mobile",
                                        event,
                                      )
                                    }
                                    className="hidden"
                                  />
                                </label>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : pendingHeroUploads.length === 0 ? (
                    <div className="mt-4 rounded-xl border border-dashed border-black/[0.1] bg-[#faf9f6] p-6 text-center">
                      <p className="text-xs text-neutral-400">
                        Aucun slide Hero pour cette page.
                      </p>
                    </div>
                  ) : null}
                </section>
  
              ) : null}
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
