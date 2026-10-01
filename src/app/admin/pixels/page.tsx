"use client";

import { useEffect, useMemo, useState } from "react";

import { PageHeader } from "@/components/admin/PageHeader";
import { resolveApiBase } from "@/lib/api-base";
import { createClient } from "@/lib/supabase/client";

type PixelPlatform = "meta" | "tiktok";

type PixelRow = {
  id: string;
  name: string;
  platform: PixelPlatform;
  pixelId: string;
  isActive: boolean;
};

const fieldClass =
  "min-h-11 w-full rounded-xl border border-[#E5E1D8] bg-white px-3 text-sm text-[#171714] outline-none transition focus:border-[#171714]";

const emptyForm = {
  name: "",
  platform: "meta" as PixelPlatform,
  pixelId: "",
  isActive: true,
};

export default function AdminPixelsPage() {
  const [supabase] = useState(() => createClient());
  const [pixels, setPixels] = useState<PixelRow[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [platformFilter, setPlatformFilter] = useState<"all" | PixelPlatform>("all");
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function authorizedFetch(path: string, init?: RequestInit) {
    const apiUrl = resolveApiBase();
    if (!apiUrl) throw new Error("NEXT_PUBLIC_API_URL n'est pas configurée.");

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error("Session expirée.");

    const response = await fetch(`${apiUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      let text = "La requête a échoué.";
      try {
        const body = (await response.json()) as { message?: string | string[] };
        text = Array.isArray(body.message)
          ? body.message.join(" · ")
          : body.message || text;
      } catch {
        // Keep the fallback message.
      }
      throw new Error(text);
    }

    if (response.status === 204) return null;
    return response.json();
  }

  async function loadPixels() {
    const rows = (await authorizedFetch("/admin/pixels")) as PixelRow[];
    setPixels(rows);
  }

  useEffect(() => {
    let cancelled = false;
    loadPixels()
      .catch((reason: unknown) => {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : "Chargement impossible.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visiblePixels = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("fr");
    return pixels.filter((pixel) => {
      if (platformFilter !== "all" && pixel.platform !== platformFilter) return false;
      if (!needle) return true;
      return (
        pixel.name.toLocaleLowerCase("fr").includes(needle) ||
        pixel.pixelId.toLocaleLowerCase("fr").includes(needle)
      );
    });
  }, [pixels, platformFilter, query]);

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setMessage("");
  }

  function editPixel(pixel: PixelRow) {
    setEditingId(pixel.id);
    setForm({
      name: pixel.name,
      platform: pixel.platform,
      pixelId: pixel.pixelId,
      isActive: pixel.isActive,
    });
    setError("");
    setMessage("");
  }

  async function savePixel() {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        name: form.name.trim(),
        platform: form.platform,
        pixelId: form.pixelId.trim(),
        isActive: form.isActive,
      };

      if (editingId) {
        await authorizedFetch(`/admin/pixels/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await authorizedFetch("/admin/pixels", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      setMessage(editingId ? "Pixel mis à jour." : "Pixel ajouté.");
      setEditingId(null);
      setForm(emptyForm);
      await loadPixels();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  }

  async function removePixel(pixel: PixelRow) {
    if (!window.confirm(`Supprimer le pixel « ${pixel.name} » ?`)) return;
    setError("");
    setMessage("");
    try {
      await authorizedFetch(`/admin/pixels/${pixel.id}`, { method: "DELETE" });
      if (editingId === pixel.id) resetForm();
      setMessage("Pixel supprimé. Les campagnes qui l’utilisaient n’enverront plus ses événements.");
      await loadPixels();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Suppression impossible.");
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Pixels"
        description="Ajoutez les pixels Meta et TikTok. Chaque campagne choisit ensuite les siens."
        action={
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#171714] px-4 text-sm font-semibold text-white"
          >
            Nouveau pixel
          </button>
        }
      />

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="overflow-hidden rounded-2xl border border-[#E5E1D8] bg-white shadow-[0_1px_2px_rgba(23,23,20,0.04)]">
          <div className="flex flex-col gap-3 border-b border-[#E5E1D8] p-4 sm:flex-row sm:items-center sm:justify-between">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher un nom ou un ID"
              className={`${fieldClass} sm:max-w-xs`}
            />
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["all", "Tous"],
                  ["meta", "Meta"],
                  ["tiktok", "TikTok"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPlatformFilter(value)}
                  className={[
                    "min-h-9 rounded-full px-3 text-xs font-semibold",
                    platformFilter === value
                      ? "bg-[#171714] text-white"
                      : "bg-[#F6F4EF] text-[#5F5C55]",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="px-4 py-10 text-sm text-[#5F5C55]">Chargement…</p>
          ) : visiblePixels.length === 0 ? (
            <p className="px-4 py-10 text-sm text-[#5F5C55]">
              Aucun pixel pour cette recherche.
            </p>
          ) : (
            <div className="divide-y divide-[#E5E1D8]">
              {visiblePixels.map((pixel) => (
                <article
                  key={pixel.id}
                  className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-[#171714]">
                        {pixel.name}
                      </p>
                      <span className="rounded-full bg-[#F6F4EF] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5F5C55]">
                        {pixel.platform === "meta" ? "Meta" : "TikTok"}
                      </span>
                      <span
                        className={[
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                          pixel.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-[#F2F0EA] text-[#918C82]",
                        ].join(" ")}
                      >
                        {pixel.isActive ? "Actif" : "Inactif"}
                      </span>
                    </div>
                    <p className="mt-1 truncate font-mono text-xs text-[#918C82]">
                      {pixel.pixelId}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => editPixel(pixel)}
                      className="min-h-9 rounded-lg border border-[#E5E1D8] px-3 text-xs font-semibold text-[#171714]"
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => void removePixel(pixel)}
                      className="min-h-9 rounded-lg px-3 text-xs font-semibold text-[#B42318]"
                    >
                      Supprimer
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <form
          className="rounded-2xl border border-[#E5E1D8] bg-white p-4 shadow-[0_1px_2px_rgba(23,23,20,0.04)] lg:sticky lg:top-4"
          onSubmit={(event) => {
            event.preventDefault();
            void savePixel();
          }}
        >
          <h2 className="text-sm font-semibold text-[#171714]">
            {editingId ? "Modifier le pixel" : "Ajouter un pixel"}
          </h2>
          <div className="mt-4 space-y-3">
            <label className="block text-sm">
              <span className="mb-1.5 block text-xs font-medium text-[#5F5C55]">Nom</span>
              <input
                required
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                className={fieldClass}
                placeholder="Campagne Ramadan"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-xs font-medium text-[#5F5C55]">Plateforme</span>
              <select
                value={form.platform}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    platform: event.target.value as PixelPlatform,
                  }))
                }
                className={fieldClass}
              >
                <option value="meta">Meta</option>
                <option value="tiktok">TikTok</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-xs font-medium text-[#5F5C55]">
                Identifiant du pixel
              </span>
              <input
                required
                value={form.pixelId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    pixelId: event.target.value.replace(/[^A-Za-z0-9]/g, ""),
                  }))
                }
                className={fieldClass}
                placeholder="1234567890"
              />
            </label>
            <label className="inline-flex items-center gap-2 text-sm font-medium text-[#171714]">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) =>
                  setForm((current) => ({ ...current, isActive: event.target.checked }))
                }
                className="h-4 w-4 accent-[#171714]"
              />
              Pixel actif
            </label>
          </div>

          {error ? (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </p>
          ) : null}
          {message ? (
            <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={saving}
            className="mt-4 min-h-11 w-full rounded-xl bg-[#ECAB1C] text-sm font-bold text-[#251713] disabled:opacity-50"
          >
            {saving ? "Enregistrement…" : editingId ? "Enregistrer" : "Ajouter le pixel"}
          </button>
        </form>
      </div>
    </div>
  );
}
