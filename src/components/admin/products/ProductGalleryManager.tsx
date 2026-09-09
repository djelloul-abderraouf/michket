"use client";

/* eslint-disable @next/next/no-img-element */

import {
  useCallback,
  useRef,
  useState,
} from "react";

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

type ProductVariantOption = {
  id: string;
  name: string;
  colorName: string | null;
  colorHex: string | null;
};

type ApiErrorPayload = {
  message?: string | string[];
};

const ALLOWED_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_IMAGES = 20;

function apiMessage(
  payload: ApiErrorPayload | null,
  fallback: string,
) {
  if (!payload?.message) return fallback;
  return Array.isArray(payload.message)
    ? payload.message.join(" ")
    : payload.message;
}

export function ProductGalleryManager({
  productId,
  images: initialImages,
  variants = [],
  token,
  onImagesChange,
}: {
  productId: string;
  images: ProductImage[];
  variants?: ProductVariantOption[];
  token: string;
  onImagesChange: (images: ProductImage[]) => void;
}) {
  const [images, setImages] =
    useState<ProductImage[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [editingAltId, setEditingAltId] = useState<
    string | null
  >(null);
  const [altDraft, setAltDraft] = useState("");
  const [savingAltId, setSavingAltId] = useState<
    string | null
  >(null);
  const [deletingId, setDeletingId] = useState<
    string | null
  >(null);
  const [settingPrimaryId, setSettingPrimaryId] =
    useState<string | null>(null);
  const [reorderingId, setReorderingId] = useState<
    string | null
  >(null);
  const [error, setError] = useState<string | null>(
    null,
  );
  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ?? "";

  const syncImages = useCallback(
    (next: ProductImage[]) => {
      setImages(next);
      onImagesChange(next);
    },
    [onImagesChange],
  );

  /* ── Upload ─────────────────────────────────── */

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setError(null);

      if (!ALLOWED_MIMES.has(file.type)) {
        setError(
          "Format non supporté. Utilisez JPEG, PNG, WebP ou AVIF.",
        );
        e.target.value = "";
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError(
          "Le fichier dépasse la limite de 10 Mo.",
        );
        e.target.value = "";
        return;
      }

      if (images.length >= MAX_IMAGES) {
        setError(
          `Maximum ${MAX_IMAGES} images par produit.`,
        );
        e.target.value = "";
        return;
      }

      setUploading(true);

      try {
        // 1. Upload to Supabase via media endpoint
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await fetch(
          `${apiUrl}/media/product-images`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          },
        );

        if (!uploadRes.ok) {
          let payload: ApiErrorPayload | null = null;
          try {
            payload =
              (await uploadRes.json()) as ApiErrorPayload;
          } catch {}
          throw new Error(
            apiMessage(
              payload,
              "Échec de l'envoi de l'image.",
            ),
          );
        }

        const { url, path } = (await uploadRes.json()) as {
          url: string;
          path: string;
        };

        // 2. Register in product images
        const addRes = await fetch(
          `${apiUrl}/admin/products/${productId}/images`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              url,
              storagePath: path,
              altText: "",
              sortOrder: images.length,
              isPrimary: images.length === 0,
            }),
          },
        );

        if (!addRes.ok) {
          let payload: ApiErrorPayload | null = null;
          try {
            payload =
              (await addRes.json()) as ApiErrorPayload;
          } catch {}

          // Cleanup orphan
          await fetch(`${apiUrl}/media/product-images`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ storagePath: path }),
          }).catch(() => {});

          throw new Error(
            apiMessage(
              payload,
              "Échec de l'enregistrement de l'image.",
            ),
          );
        }

        const added: ProductImage = await addRes.json();
        syncImages([...images, added]);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erreur inconnue lors de l'envoi.",
        );
      } finally {
        setUploading(false);
        e.target.value = "";
      }
    },
    [apiUrl, images, productId, syncImages, token],
  );

  /* ── Set Primary ────────────────────────────── */

  const handleSetPrimary = useCallback(
    async (imageId: string) => {
      setSettingPrimaryId(imageId);
      setError(null);

      try {
        const res = await fetch(
          `${apiUrl}/admin/products/${productId}/images/${imageId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ isPrimary: true }),
          },
        );

        if (!res.ok) {
          let payload: ApiErrorPayload | null = null;
          try {
            payload =
              (await res.json()) as ApiErrorPayload;
          } catch {}
          throw new Error(
            apiMessage(
              payload,
              "Échec de la définition de l'image principale.",
            ),
          );
        }

        const updated: ProductImage = await res.json();
        syncImages(
          images.map((img) =>
            img.id === imageId
              ? { ...img, isPrimary: true }
              : { ...img, isPrimary: false },
          ),
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erreur inconnue.",
        );
      } finally {
        setSettingPrimaryId(null);
      }
    },
    [apiUrl, images, productId, syncImages, token],
  );

  /* ── Alt Text ───────────────────────────────── */

  const startEditAlt = useCallback(
    (image: ProductImage) => {
      setEditingAltId(image.id);
      setAltDraft(image.altText ?? "");
    },
    [],
  );

  const saveAlt = useCallback(
    async (imageId: string) => {
      setSavingAltId(imageId);
      setError(null);

      try {
        const res = await fetch(
          `${apiUrl}/admin/products/${productId}/images/${imageId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              altText: altDraft.trim(),
            }),
          },
        );

        if (!res.ok) {
          let payload: ApiErrorPayload | null = null;
          try {
            payload =
              (await res.json()) as ApiErrorPayload;
          } catch {}
          throw new Error(
            apiMessage(
              payload,
              "Échec de la mise à jour du texte alternatif.",
            ),
          );
        }

        const updated: ProductImage = await res.json();
        syncImages(
          images.map((img) =>
            img.id === imageId ? updated : img,
          ),
        );
        setEditingAltId(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erreur inconnue.",
        );
      } finally {
        setSavingAltId(null);
      }
    },
    [
      apiUrl,
      altDraft,
      images,
      productId,
      syncImages,
      token,
    ],
  );

  /* ── Reorder ────────────────────────────────── */

  const handleMove = useCallback(
    async (imageId: string, direction: "up" | "down") => {
      const idx = images.findIndex(
        (img) => img.id === imageId,
      );
      if (idx < 0) return;

      const targetIdx =
        direction === "up" ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= images.length)
        return;

      setReorderingId(imageId);
      setError(null);

      const next = [...images];
      [next[idx], next[targetIdx]] = [
        next[targetIdx],
        next[idx],
      ];
      const reorderedIds = next.map((img) => img.id);

      try {
        const res = await fetch(
          `${apiUrl}/admin/products/${productId}/images/reorder`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              imageIds: reorderedIds,
            }),
          },
        );

        if (!res.ok) {
          let payload: ApiErrorPayload | null = null;
          try {
            payload =
              (await res.json()) as ApiErrorPayload;
          } catch {}
          throw new Error(
            apiMessage(
              payload,
              "Échec du réordonnancement.",
            ),
          );
        }

        syncImages(next);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erreur inconnue.",
        );
      } finally {
        setReorderingId(null);
      }
    },
    [apiUrl, images, productId, syncImages, token],
  );

  /* ── Delete ─────────────────────────────────── */

  const handleDelete = useCallback(
    async (image: ProductImage) => {
      setDeletingId(image.id);
      setError(null);

      try {
        const res = await fetch(
          `${apiUrl}/admin/products/${productId}/images/${image.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!res.ok) {
          let payload: ApiErrorPayload | null = null;
          try {
            payload =
              (await res.json()) as ApiErrorPayload;
          } catch {}
          throw new Error(
            apiMessage(
              payload,
              "Échec de la suppression.",
            ),
          );
        }

        syncImages(
          images.filter((img) => img.id !== image.id),
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erreur inconnue.",
        );
      } finally {
        setDeletingId(null);
      }
    },
    [apiUrl, images, productId, syncImages, token],
  );

  /* ── Variant Assignment ─────────────────────── */

  const [updatingVariantId, setUpdatingVariantId] =
    useState<string | null>(null);

  const handleSetVariant = useCallback(
    async (imageId: string, variantId: string | null) => {
      setUpdatingVariantId(imageId);
      setError(null);

      try {
        const res = await fetch(
          `${apiUrl}/admin/products/${productId}/images/${imageId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ variantId }),
          },
        );

        if (!res.ok) {
          let payload: ApiErrorPayload | null = null;
          try {
            payload =
              (await res.json()) as ApiErrorPayload;
          } catch {}
          throw new Error(
            apiMessage(
              payload,
              "Échec de la mise à jour de la variante.",
            ),
          );
        }

        const updated: ProductImage = await res.json();
        syncImages(
          images.map((img) =>
            img.id === imageId ? updated : img,
          ),
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erreur inconnue.",
        );
      } finally {
        setUpdatingVariantId(null);
      }
    },
    [apiUrl, images, productId, syncImages, token],
  );

  /* ── Render ─────────────────────────────────── */

  return (
    <div>
      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {/* Upload button */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
            Images
          </p>
          <h2 className="mt-1 text-lg font-semibold text-neutral-950">
            Galerie produit
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-400">
            {images.length}/{MAX_IMAGES}
          </span>
          <label
            className={[
              "inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition",
              uploading ||
                images.length >= MAX_IMAGES
                ? "cursor-not-allowed bg-neutral-100 text-neutral-400"
                : "bg-neutral-950 text-white hover:bg-neutral-800",
            ].join(" ")}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              disabled={
                uploading || images.length >= MAX_IMAGES
              }
              onChange={handleFileSelect}
            />
            {uploading ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="opacity-25"
                  />
                  <path
                    d="M4 12a8 8 0 018-8"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
                Envoi…
              </>
            ) : (
              <>
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Ajouter
              </>
            )}
          </label>
        </div>
      </div>

      {/* Image grid */}
      {images.length === 0 ? (
        <div className="mt-5 rounded-xl bg-[#faf9f6] px-4 py-12 text-center">
          <svg
            className="mx-auto h-10 w-10 text-neutral-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect
              x="3"
              y="3"
              width="18"
              height="18"
              rx="3"
            />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <p className="mt-3 text-sm text-neutral-400">
            Aucune image. Cliquez sur{" "}
            <strong>Ajouter</strong> pour commencer.
          </p>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image, idx) => (
            <div
              key={image.id}
              className={[
                "group relative overflow-hidden rounded-xl border bg-[#f3f1ec] transition",
                image.isPrimary
                  ? "border-neutral-950 ring-2 ring-neutral-950/10"
                  : "border-black/[0.06] hover:border-black/[0.12]",
              ].join(" ")}
            >
              {/* Image */}
              <div className="aspect-square overflow-hidden">
                <img
                  src={image.url}
                  alt={
                    image.altText ?? "Image produit"
                  }
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Variant assignment */}
              {variants.length > 0 ? (
                <div className="px-2 py-1.5">
                  <select
                    value={image.variantId ?? ""}
                    disabled={updatingVariantId === image.id}
                    onChange={(e) => {
                      const val = e.target.value || null;
                      void handleSetVariant(image.id, val);
                    }}
                    className="w-full rounded-md border border-black/[0.08] bg-white px-1.5 py-1 text-[10px] text-neutral-700 outline-none focus:border-[#ECAB1C]"
                  >
                    <option value="">Image générale</option>
                    {variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.colorName ?? v.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              {/* Primary badge */}
              {image.isPrimary ? (
                <span className="absolute left-2 top-2 rounded-full bg-neutral-950/90 px-2 py-1 text-[10px] font-semibold text-white">
                  Principale
                </span>
              ) : null}

              {/* Overlay controls — visible on hover */}
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition group-hover:opacity-100">
                {/* Left: reorder buttons */}
                <div className="flex gap-1">
                  {idx > 0 ? (
                    <button
                      type="button"
                      disabled={
                        reorderingId === image.id
                      }
                      onClick={() =>
                        void handleMove(
                          image.id,
                          "up",
                        )
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-neutral-700 transition hover:bg-white disabled:opacity-50"
                      title="Déplacer vers la gauche"
                    >
                      <svg
                        className="h-3.5 w-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      >
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                    </button>
                  ) : null}
                  {idx < images.length - 1 ? (
                    <button
                      type="button"
                      disabled={
                        reorderingId === image.id
                      }
                      onClick={() =>
                        void handleMove(
                          image.id,
                          "down",
                        )
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-neutral-700 transition hover:bg-white disabled:opacity-50"
                      title="Déplacer vers la droite"
                    >
                      <svg
                        className="h-3.5 w-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  ) : null}
                </div>

                {/* Right: actions */}
                <div className="flex gap-1">
                  {!image.isPrimary ? (
                    <button
                      type="button"
                      disabled={
                        settingPrimaryId === image.id
                      }
                      onClick={() =>
                        void handleSetPrimary(
                          image.id,
                        )
                      }
                      className="flex h-7 items-center gap-1 rounded-lg bg-white/90 px-2 text-[10px] font-semibold text-neutral-700 transition hover:bg-white disabled:opacity-50"
                      title="Définir comme principale"
                    >
                      <svg
                        className="h-3 w-3"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={() =>
                      void startEditAlt(image)
                    }
                    className="flex h-7 items-center gap-1 rounded-lg bg-white/90 px-2 text-[10px] font-semibold text-neutral-700 transition hover:bg-white"
                    title="Modifier le texte alternatif"
                  >
                    <svg
                      className="h-3 w-3"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    disabled={
                      deletingId === image.id
                    }
                    onClick={() =>
                      void handleDelete(image)
                    }
                    className="flex h-7 items-center gap-1 rounded-lg bg-red-500/90 px-2 text-[10px] font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
                    title="Supprimer l'image"
                  >
                    {deletingId === image.id ? (
                      <svg
                        className="h-3 w-3 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="3"
                          className="opacity-25"
                        />
                        <path
                          d="M4 12a8 8 0 018-8"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-3 w-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Alt text editing (inline modal) */}
              {editingAltId === image.id ? (
                <div className="absolute inset-0 flex flex-col justify-end bg-black/70 p-3">
                  <label className="text-[10px] font-semibold text-white/80">
                    Texte alternatif
                  </label>
                  <input
                    type="text"
                    value={altDraft}
                    onChange={(e) =>
                      setAltDraft(e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter")
                        void saveAlt(image.id);
                      if (e.key === "Escape")
                        setEditingAltId(null);
                    }}
                    placeholder="Décrivez l'image…"
                    autoFocus
                    className="mt-1 rounded-lg border-0 bg-white px-3 py-1.5 text-sm text-neutral-900 outline-none ring-1 ring-black/10 placeholder:text-neutral-400"
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      disabled={
                        savingAltId === image.id
                      }
                      onClick={() =>
                        void saveAlt(image.id)
                      }
                      className="flex-1 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-neutral-900 transition hover:bg-neutral-100 disabled:opacity-50"
                    >
                      {savingAltId === image.id
                        ? "…"
                        : "Enregistrer"}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingAltId(null)
                      }
                      className="rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/30"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
