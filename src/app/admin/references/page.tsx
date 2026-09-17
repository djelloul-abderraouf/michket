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

type ClientReference = {
  id: string;
  name: string;
  imageUrl: string;
  imageStoragePath: string;
  altText: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

type ReferencesResponse = {
  data: ClientReference[];
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

type ReferenceFormState = {
  name: string;
  altText: string;
  sortOrder: string;
  isActive: boolean;
};

const EMPTY_FORM: ReferenceFormState = {
  name: "",
  altText: "",
  sortOrder: "0",
  isActive: true,
};

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

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
  if (bytes < 1024) {
    return `${bytes} o`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} Ko`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export default function AdminReferencesPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [references, setReferences] = useState<ClientReference[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReference, setEditingReference] =
    useState<ClientReference | null>(null);
  const [form, setForm] =
    useState<ReferenceFormState>(EMPTY_FORM);
  const [formError, setFormError] =
    useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);
  const [imagePreview, setImagePreview] =
    useState<string | null>(null);
  const [pendingImageUrl, setPendingImageUrl] =
    useState<string | null>(null);
  const [
    pendingImageStoragePath,
    setPendingImageStoragePath,
  ] = useState<string | null>(null);
  const [isUploading, setIsUploading] =
    useState(false);
  const [uploadError, setUploadError] =
    useState<string | null>(null);

  const [actionId, setActionId] =
    useState<string | null>(null);
  const [reorderingId, setReorderingId] =
    useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<ClientReference | null>(null);
  const [isDeleting, setIsDeleting] =
    useState(false);
  const [deleteError, setDeleteError] =
    useState<string | null>(null);

  const loadReferences = useCallback(async () => {
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

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        setLoadError(
          "NEXT_PUBLIC_API_URL n'est pas configurée.",
        );
        return;
      }

      const response = await fetch(
        `${apiUrl}/admin/references?page=1&limit=100`,
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
        const payload = (
          await response
            .json()
            .catch(() => null)
        ) as ApiErrorPayload | null;

        setLoadError(
          apiMessage(
            payload,
            "Impossible de charger les références.",
          ),
        );
        return;
      }

      const payload =
        (await response.json()) as ReferencesResponse;

      setReferences(payload.data);
    } catch {
      setLoadError(
        "Une erreur est survenue pendant le chargement des références.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [router, supabase]);

  useEffect(() => {
    void loadReferences();
  }, [loadReferences]);

  const orderedReferences = useMemo(
    () =>
      [...references].sort(
        (a, b) =>
          a.sortOrder - b.sortOrder ||
          a.name.localeCompare(b.name, "fr"),
      ),
    [references],
  );

  const filteredReferences = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return orderedReferences;
    }

    return orderedReferences.filter(
      (reference) =>
        reference.name
          .toLowerCase()
          .includes(query) ||
        reference.altText
          ?.toLowerCase()
          .includes(query),
    );
  }, [orderedReferences, search]);

  const activeCount = useMemo(
    () =>
      references.filter(
        (reference) => reference.isActive,
      ).length,
    [references],
  );

  function resetUploadState() {
    setSelectedFile(null);
    setImagePreview(null);
    setPendingImageUrl(null);
    setPendingImageStoragePath(null);
    setUploadError(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function openCreateForm() {
    setEditingReference(null);
    setForm({
      ...EMPTY_FORM,
      sortOrder: String(references.length),
    });
    setFormError(null);
    resetUploadState();
    setIsFormOpen(true);
  }

  function openEditForm(
    reference: ClientReference,
  ) {
    setEditingReference(reference);
    setForm({
      name: reference.name,
      altText: reference.altText ?? "",
      sortOrder: String(reference.sortOrder),
      isActive: reference.isActive,
    });
    setFormError(null);
    setSelectedFile(null);
    setImagePreview(reference.imageUrl);
    setPendingImageUrl(null);
    setPendingImageStoragePath(null);
    setUploadError(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setIsFormOpen(true);
  }

  async function deleteTemporaryImage(
    storagePath: string,
  ) {
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

      await fetch(
        `${apiUrl}/media/reference-images`,
        {
          method: "DELETE",
          headers: {
            Authorization:
              `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            storagePath,
          }),
        },
      );
    } catch {
      // Best-effort cleanup only.
    }
  }

  function closeForm() {
    if (isSaving || isUploading) {
      return;
    }

    setIsFormOpen(false);
    setEditingReference(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    resetUploadState();
  }

  function handleCancel() {
    if (isSaving || isUploading) {
      return;
    }

    if (pendingImageStoragePath) {
      void deleteTemporaryImage(
        pendingImageStoragePath,
      );
    }

    closeForm();
  }

  function updateForm<
    K extends keyof ReferenceFormState,
  >(
    key: K,
    value: ReferenceFormState[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleFileSelect(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploadError(null);

    if (
      !ACCEPTED_IMAGE_TYPES.includes(
        file.type,
      )
    ) {
      setUploadError(
        "Format non supporté. Utilisez JPEG, PNG, WebP ou AVIF.",
      );
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setUploadError(
        `Fichier trop volumineux (${formatFileSize(file.size)}). Maximum : 10 Mo.`,
      );
      return;
    }

    if (pendingImageStoragePath) {
      await deleteTemporaryImage(
        pendingImageStoragePath,
      );
    }

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
      setUploadError(
        "NEXT_PUBLIC_API_URL n'est pas configurée.",
      );
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${apiUrl}/media/reference-images`,
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${session.access_token}`,
          },
          body: formData,
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
        const payload = (
          await response
            .json()
            .catch(() => null)
        ) as ApiErrorPayload | null;

        setUploadError(
          apiMessage(
            payload,
            "Erreur lors de l'upload de l'image.",
          ),
        );
        return;
      }

      const result = (await response.json()) as {
        url: string;
        path: string;
      };

      setSelectedFile(file);
      setImagePreview(result.url);
      setPendingImageUrl(result.url);
      setPendingImageStoragePath(
        result.path,
      );

      setForm((current) => ({
        ...current,
        altText:
          current.altText.trim() ||
          current.name.trim() ||
          file.name.replace(/\.[^/.]+$/, ""),
      }));
    } catch {
      setUploadError(
        "Erreur réseau lors de l'upload.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  async function removePendingImage() {
    if (pendingImageStoragePath) {
      await deleteTemporaryImage(
        pendingImageStoragePath,
      );

      setPendingImageUrl(null);
      setPendingImageStoragePath(null);
    }

    setSelectedFile(null);

    if (editingReference) {
      setImagePreview(
        editingReference.imageUrl,
      );
    } else {
      setImagePreview(null);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setFormError(null);

    const name = form.name.trim();
    const altText =
      form.altText.trim() || undefined;
    const sortOrder = Number(form.sortOrder);

    if (!name) {
      setFormError(
        "Le nom de l'entreprise ou de l'organisme est obligatoire.",
      );
      return;
    }

    if (
      !Number.isInteger(sortOrder) ||
      sortOrder < 0
    ) {
      setFormError(
        "L'ordre d'affichage doit être un entier positif ou nul.",
      );
      return;
    }

    if (
      !editingReference &&
      (
        !pendingImageUrl ||
        !pendingImageStoragePath
      )
    ) {
      setFormError(
        "Ajoutez un logo ou une image avant de créer la référence.",
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

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        setFormError(
          "NEXT_PUBLIC_API_URL n'est pas configurée.",
        );
        return;
      }

      const payload: {
        name: string;
        altText?: string;
        isActive: boolean;
        sortOrder: number;
        imageUrl?: string;
        imageStoragePath?: string;
      } = {
        name,
        altText,
        isActive: form.isActive,
        sortOrder,
      };

      if (
        pendingImageUrl &&
        pendingImageStoragePath
      ) {
        payload.imageUrl =
          pendingImageUrl;
        payload.imageStoragePath =
          pendingImageStoragePath;
      }

      const response = await fetch(
        editingReference
          ? `${apiUrl}/admin/references/${editingReference.id}`
          : `${apiUrl}/admin/references`,
        {
          method: editingReference
            ? "PUT"
            : "POST",
          headers: {
            Authorization:
              `Bearer ${session.access_token}`,
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
        const errorPayload = (
          await response
            .json()
            .catch(() => null)
        ) as ApiErrorPayload | null;

        /*
         * The newly uploaded image is not officially linked when the save
         * fails. Try to clean it up immediately. The backend also performs
         * best-effort cleanup for DB failures, so this remains safe.
         */
        if (pendingImageStoragePath) {
          await deleteTemporaryImage(
            pendingImageStoragePath,
          );
          setPendingImageUrl(null);
          setPendingImageStoragePath(null);
          setSelectedFile(null);

          if (editingReference) {
            setImagePreview(
              editingReference.imageUrl,
            );
          } else {
            setImagePreview(null);
          }
        }

        setFormError(
          apiMessage(
            errorPayload,
            editingReference
              ? "Impossible de modifier cette référence."
              : "Impossible de créer cette référence.",
          ),
        );
        return;
      }

      setPendingImageUrl(null);
      setPendingImageStoragePath(null);

      closeForm();
      await loadReferences();
      router.refresh();
    } catch {
      if (pendingImageStoragePath) {
        await deleteTemporaryImage(
          pendingImageStoragePath,
        );
        setPendingImageUrl(null);
        setPendingImageStoragePath(null);
      }

      setFormError(
        "Une erreur est survenue pendant l'enregistrement.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleActive(
    reference: ClientReference,
  ) {
    const nextIsActive =
      !reference.isActive;

    setActionId(reference.id);

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
        window.alert(
          "NEXT_PUBLIC_API_URL n'est pas configurée.",
        );
        return;
      }

      const response = await fetch(
        `${apiUrl}/admin/references/${reference.id}`,
        {
          method: "PUT",
          headers: {
            Authorization:
              `Bearer ${session.access_token}`,
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
        const payload = (
          await response
            .json()
            .catch(() => null)
        ) as ApiErrorPayload | null;

        window.alert(
          apiMessage(
            payload,
            nextIsActive
              ? "Impossible de réactiver cette référence."
              : "Impossible de désactiver cette référence.",
          ),
        );
        return;
      }

      await loadReferences();
      router.refresh();
    } catch {
      window.alert(
        "Une erreur réseau est survenue.",
      );
    } finally {
      setActionId(null);
    }
  }

  async function persistOrder(
    nextReferences: ClientReference[],
  ) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      router.replace("/admin/login");
      return false;
    }

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      window.alert(
        "NEXT_PUBLIC_API_URL n'est pas configurée.",
      );
      return false;
    }

    const response = await fetch(
      `${apiUrl}/admin/references/reorder`,
      {
        method: "PUT",
        headers: {
          Authorization:
            `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          references: nextReferences.map(
            (reference, index) => ({
              referenceId: reference.id,
              sortOrder: index,
            }),
          ),
        }),
      },
    );

    if (
      response.status === 401 ||
      response.status === 403
    ) {
      await supabase.auth.signOut();
      router.replace("/admin/login");
      return false;
    }

    if (!response.ok) {
      const payload = (
        await response
          .json()
          .catch(() => null)
      ) as ApiErrorPayload | null;

      window.alert(
        apiMessage(
          payload,
          "Impossible de modifier l'ordre des références.",
        ),
      );
      return false;
    }

    return true;
  }

  async function moveReference(
    reference: ClientReference,
    direction: "up" | "down",
  ) {
    const currentList =
      [...orderedReferences];

    const currentIndex =
      currentList.findIndex(
        (item) =>
          item.id === reference.id,
      );

    if (currentIndex < 0) {
      return;
    }

    const targetIndex =
      direction === "up"
        ? currentIndex - 1
        : currentIndex + 1;

    if (
      targetIndex < 0 ||
      targetIndex >= currentList.length
    ) {
      return;
    }

    const nextList = [
      ...currentList,
    ];

    [
      nextList[currentIndex],
      nextList[targetIndex],
    ] = [
      nextList[targetIndex],
      nextList[currentIndex],
    ];

    const optimistic =
      nextList.map(
        (item, index) => ({
          ...item,
          sortOrder: index,
        }),
      );

    const previous = references;

    setReferences(optimistic);
    setReorderingId(reference.id);

    try {
      const success =
        await persistOrder(
          optimistic,
        );

      if (!success) {
        setReferences(previous);
      }
    } catch {
      setReferences(previous);
      window.alert(
        "Une erreur réseau est survenue pendant le réordonnancement.",
      );
    } finally {
      setReorderingId(null);
    }
  }

  async function deleteReference() {
    if (!deleteTarget || isDeleting) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

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
        setDeleteError(
          "NEXT_PUBLIC_API_URL n'est pas configurée.",
        );
        return;
      }

      const response = await fetch(
        `${apiUrl}/admin/references/${deleteTarget.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization:
              `Bearer ${session.access_token}`,
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
        const payload = (
          await response
            .json()
            .catch(() => null)
        ) as ApiErrorPayload | null;

        setDeleteError(
          apiMessage(
            payload,
            "Impossible de supprimer cette référence.",
          ),
        );
        return;
      }

      setDeleteTarget(null);
      await loadReferences();
      router.refresh();
    } catch {
      setDeleteError(
        "Une erreur réseau est survenue pendant la suppression.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Nos références"
        description="Gérez les entreprises, organismes et clients affichés dans la section « Nos références » de la boutique."
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
            Ajouter une référence
          </button>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-black/[0.07] bg-white p-4">
          <p className="text-xs font-medium text-neutral-400">
            Total
          </p>
          <p className="mt-2 text-2xl font-semibold text-neutral-950">
            {references.length}
          </p>
        </div>

        <div className="rounded-2xl border border-black/[0.07] bg-white p-4">
          <p className="text-xs font-medium text-neutral-400">
            Actives
          </p>
          <p className="mt-2 text-2xl font-semibold text-neutral-950">
            {activeCount}
          </p>
        </div>

        <div className="rounded-2xl border border-black/[0.07] bg-white p-4">
          <p className="text-xs font-medium text-neutral-400">
            Masquées
          </p>
          <p className="mt-2 text-2xl font-semibold text-neutral-950">
            {references.length - activeCount}
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white shadow-[0_8px_30px_rgba(23,23,20,0.035)]">
        <div className="flex flex-col gap-3 border-b border-black/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-neutral-950">
              Références affichées
            </h2>
            <p className="mt-1 text-xs leading-5 text-neutral-400">
              L&apos;ordre défini ici sera utilisé pour le défilement automatique sur la page d&apos;accueil.
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
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Rechercher…"
              className="h-10 w-full rounded-xl border border-black/[0.08] bg-[#faf9f6] pl-9 pr-3 text-sm text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-neutral-300 focus:bg-white"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="admin-skeleton h-36 w-full" />
            <div className="admin-skeleton h-36 w-full" />
            <div className="admin-skeleton h-36 w-full" />
          </div>
        ) : loadError ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-semibold text-red-700">
              {loadError}
            </p>
            <button
              type="button"
              onClick={() =>
                void loadReferences()
              }
              className="mt-4 rounded-xl border border-black/[0.08] bg-white px-4 py-2 text-sm font-semibold text-neutral-700"
            >
              Réessayer
            </button>
          </div>
        ) : references.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#f1efe9] text-neutral-500">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect
                  x="3"
                  y="5"
                  width="18"
                  height="14"
                  rx="2"
                />
                <path d="M7 9h10M7 13h7" />
              </svg>
            </div>

            <h3 className="mt-4 text-base font-semibold text-neutral-950">
              Aucune référence
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
              Ajoutez les entreprises, organismes ou clients qui ont travaillé avec Michket.
            </p>

            <button
              type="button"
              onClick={openCreateForm}
              className="mt-5 rounded-xl bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white"
            >
              Ajouter la première référence
            </button>
          </div>
        ) : filteredReferences.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-neutral-400">
            Aucun résultat.
          </div>
        ) : (
          <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredReferences.map(
              (reference) => {
                const index =
                  orderedReferences.findIndex(
                    (item) =>
                      item.id ===
                      reference.id,
                  );

                return (
                  <article
                    key={reference.id}
                    className="flex flex-col rounded-2xl border border-black/[0.07] bg-[#faf9f6] p-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-black/[0.07] bg-white p-2">
                        <img
                          src={reference.imageUrl}
                          alt={
                            reference.altText ??
                            reference.name
                          }
                          className="h-full w-full object-contain"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-sm font-semibold text-neutral-950">
                            {reference.name}
                          </h3>

                          <span
                            className={[
                              "rounded-full px-2 py-1 text-[10px] font-semibold",
                              reference.isActive
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-neutral-200/70 text-neutral-500",
                            ].join(" ")}
                          >
                            {reference.isActive
                              ? "Active"
                              : "Masquée"}
                          </span>
                        </div>

                        <p className="mt-2 text-xs leading-5 text-neutral-400">
                          Position{" "}
                          {index >= 0
                            ? index + 1
                            : reference.sortOrder + 1}
                        </p>

                        {reference.altText ? (
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-neutral-500">
                            {reference.altText}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-black/[0.06] pt-3">
                      <button
                        type="button"
                        disabled={
                          index <= 0 ||
                          reorderingId !== null
                        }
                        onClick={() =>
                          void moveReference(
                            reference,
                            "up",
                          )
                        }
                        className="grid h-9 w-9 place-items-center rounded-lg border border-black/[0.07] bg-white text-neutral-500 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-30"
                        title="Monter"
                      >
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M8 13V3M4 7l4-4 4 4" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        disabled={
                          index < 0 ||
                          index ===
                            orderedReferences.length -
                              1 ||
                          reorderingId !== null
                        }
                        onClick={() =>
                          void moveReference(
                            reference,
                            "down",
                          )
                        }
                        className="grid h-9 w-9 place-items-center rounded-lg border border-black/[0.07] bg-white text-neutral-500 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-30"
                        title="Descendre"
                      >
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M8 3v10M4 9l4 4 4-4" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          openEditForm(reference)
                        }
                        className="rounded-lg border border-black/[0.07] bg-white px-3 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50"
                      >
                        Modifier
                      </button>

                      <button
                        type="button"
                        disabled={
                          actionId === reference.id
                        }
                        onClick={() =>
                          void toggleActive(
                            reference,
                          )
                        }
                        className={[
                          "rounded-lg border bg-white px-3 py-2 text-xs font-semibold transition disabled:opacity-50",
                          reference.isActive
                            ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                            : "border-emerald-200 text-emerald-700 hover:bg-emerald-50",
                        ].join(" ")}
                      >
                        {actionId === reference.id
                          ? "Mise à jour…"
                          : reference.isActive
                            ? "Masquer"
                            : "Afficher"}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setDeleteTarget(
                            reference,
                          );
                          setDeleteError(null);
                        }}
                        className="ml-auto rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        Supprimer
                      </button>
                    </div>
                  </article>
                );
              },
            )}
          </div>
        )}
      </section>

      {deleteTarget ? (
        <div
          className="fixed inset-0 z-[110] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-label="Supprimer la référence"
        >
          <button
            type="button"
            aria-label="Fermer"
            disabled={isDeleting}
            onClick={() =>
              setDeleteTarget(null)
            }
            className="absolute inset-0"
          />

          <div className="relative z-10 w-full rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-lg sm:rounded-3xl sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-red-500">
              Suppression
            </p>

            <h2 className="mt-2 text-xl font-semibold text-neutral-950">
              Supprimer « {deleteTarget.name} » ?
            </h2>

            <p className="mt-3 text-sm leading-6 text-neutral-600">
              Cette référence sera supprimée définitivement ainsi que son logo ou son image dans le stockage.
            </p>

            {deleteError ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {deleteError}
              </div>
            ) : null}

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() =>
                  setDeleteTarget(null)
                }
                className="min-h-11 rounded-xl border border-black/[0.08] bg-white px-4 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
              >
                Annuler
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={() =>
                  void deleteReference()
                }
                className="min-h-11 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeleting
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
            editingReference
              ? "Modifier une référence"
              : "Ajouter une référence"
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
            className="relative z-10 max-h-[94vh] w-full overflow-y-auto rounded-t-3xl bg-[#f8f7f3] shadow-2xl sm:max-w-2xl sm:rounded-3xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/[0.07] bg-[#f8f7f3]/95 px-5 py-4 backdrop-blur sm:px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
                  Nos références
                </p>
                <h2 className="mt-1 text-xl font-semibold text-neutral-950">
                  {editingReference
                    ? "Modifier la référence"
                    : "Ajouter une référence"}
                </h2>
              </div>

              <button
                type="button"
                onClick={handleCancel}
                disabled={
                  isSaving || isUploading
                }
                className="grid h-9 w-9 place-items-center rounded-full bg-white text-neutral-500 ring-1 ring-black/[0.06] hover:text-neutral-950 disabled:opacity-50"
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
                  Entreprise ou organisme
                </h3>

                <div className="mt-4 space-y-4">
                  <label className="block">
                    <span className="text-xs font-semibold text-neutral-600">
                      Nom *
                    </span>
                    <input
                      required
                      maxLength={200}
                      value={form.name}
                      onChange={(event) =>
                        updateForm(
                          "name",
                          event.target.value,
                        )
                      }
                      placeholder="Ex : Entreprise ABC"
                      className="mt-2 h-11 w-full rounded-xl border border-black/[0.08] bg-white px-3 text-sm outline-none focus:border-neutral-300"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-semibold text-neutral-600">
                      Texte alternatif
                    </span>
                    <input
                      maxLength={300}
                      value={form.altText}
                      onChange={(event) =>
                        updateForm(
                          "altText",
                          event.target.value,
                        )
                      }
                      placeholder="Ex : Logo Entreprise ABC"
                      className="mt-2 h-11 w-full rounded-xl border border-black/[0.08] bg-white px-3 text-sm outline-none focus:border-neutral-300"
                    />
                    <p className="mt-1.5 text-[11px] leading-5 text-neutral-400">
                      Utilisé pour l&apos;accessibilité de l&apos;image.
                    </p>
                  </label>
                </div>
              </section>

              <section className="rounded-2xl border border-black/[0.07] bg-white p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-neutral-950">
                  Logo ou image
                </h3>

                <p className="mt-1 text-xs leading-5 text-neutral-400">
                  JPEG, PNG, WebP ou AVIF. Maximum 10 Mo. Pour un logo, privilégiez une image nette avec un fond transparent si possible.
                </p>

                <div className="mt-4 grid gap-4 sm:grid-cols-[160px_minmax(0,1fr)]">
                  <div className="grid aspect-square place-items-center overflow-hidden rounded-2xl border border-black/[0.07] bg-[#f7f6f2] p-3">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt=""
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="text-center">
                        <p className="text-xs font-semibold text-neutral-400">
                          Aucun logo
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={ACCEPTED_IMAGE_TYPES.join(
                        ",",
                      )}
                      onChange={
                        handleFileSelect
                      }
                      className="hidden"
                    />

                    {isUploading ? (
                      <div className="flex min-h-11 items-center gap-2 rounded-xl border border-black/[0.08] bg-[#faf9f6] px-4 text-sm font-semibold text-neutral-500">
                        <span
                          aria-hidden="true"
                          className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-800"
                        />
                        Upload en cours…
                      </div>
                    ) : selectedFile ? (
                      <div className="space-y-3">
                        <div>
                          <p className="truncate text-sm font-medium text-neutral-700">
                            {selectedFile.name}
                          </p>
                          <p className="mt-1 text-xs text-neutral-400">
                            {formatFileSize(
                              selectedFile.size,
                            )}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              fileInputRef.current?.click()
                            }
                            className="rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                          >
                            Changer
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void removePendingImage()
                            }
                            className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                          >
                            Retirer
                          </button>
                        </div>
                      </div>
                    ) : editingReference ? (
                      <div className="space-y-3">
                        <p className="text-xs leading-5 text-neutral-500">
                          L&apos;image actuelle sera conservée tant que vous n&apos;en choisissez pas une nouvelle.
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            fileInputRef.current?.click()
                          }
                          className="min-h-11 rounded-xl border border-black/[0.08] bg-white px-4 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
                        >
                          Remplacer l&apos;image
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          fileInputRef.current?.click()
                        }
                        className="flex min-h-11 items-center gap-2 rounded-xl border border-dashed border-black/[0.15] bg-[#faf9f6] px-4 text-sm font-semibold text-neutral-600 transition hover:border-neutral-300 hover:bg-white"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          aria-hidden="true"
                        >
                          <path d="M8 3v10M3 8h10" />
                        </svg>
                        Choisir une image
                      </button>
                    )}

                    {uploadError ? (
                      <p className="mt-3 text-xs leading-5 text-red-600">
                        {uploadError}
                      </p>
                    ) : null}
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-black/[0.07] bg-white p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-neutral-950">
                  Affichage
                </h3>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label>
                    <span className="text-xs font-semibold text-neutral-600">
                      Ordre d&apos;affichage
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
                      Afficher sur le site
                    </span>
                  </label>
                </div>
              </section>
            </div>

            <div className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-black/[0.07] bg-[#f8f7f3]/95 px-5 py-4 backdrop-blur sm:flex-row sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={handleCancel}
                disabled={
                  isSaving || isUploading
                }
                className="min-h-11 rounded-xl border border-black/[0.08] bg-white px-5 text-sm font-semibold text-neutral-700 disabled:opacity-50"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={
                  isSaving || isUploading
                }
                className="min-h-11 rounded-xl bg-neutral-950 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving
                  ? "Enregistrement…"
                  : editingReference
                    ? "Enregistrer les modifications"
                    : "Créer la référence"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
