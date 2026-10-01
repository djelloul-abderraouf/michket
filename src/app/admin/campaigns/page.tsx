"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { PageHeader } from "@/components/admin/PageHeader";
import { resolveApiBase } from "@/lib/api-base";
import { createClient } from "@/lib/supabase/client";

type VariantChoice = {
  id: string;
  name: string;
  hex: string | null;
  isMulticolor: boolean;
};

type CatalogProduct = {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  isActive: boolean;
  variants: VariantChoice[];
};

type DraftItem = {
  key: string;
  productId: string;
  title: string;
  variantIds: string[];
  product: CatalogProduct;
};

type CampaignSummary = {
  id: string;
  title: string;
  publicTitle: string;
  slug: string;
  isActive: boolean;
  itemCount: number;
};

type PixelChoice = {
  id: string;
  name: string;
  platform: "meta" | "tiktok";
  pixelId: string;
  isActive: boolean;
};

const fieldClass =
  "min-h-11 w-full rounded-xl border border-[#E5E1D8] bg-white px-3 text-sm text-[#171714] outline-none transition focus:border-[#171714]";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export default function AdminCampaignsPage() {
  const [supabase] = useState(() => createClient());
  const [catalog, setCatalog] = useState<CatalogProduct[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [publicTitle, setPublicTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [items, setItems] = useState<DraftItem[]>([]);
  const [pixels, setPixels] = useState<PixelChoice[]>([]);
  const [metaPixelId, setMetaPixelId] = useState("");
  const [tiktokPixelId, setTiktokPixelId] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [origin, setOrigin] = useState("");
  const [newPixelName, setNewPixelName] = useState("");
  const [newPixelPlatform, setNewPixelPlatform] = useState<"meta" | "tiktok">("meta");
  const [newPixelId, setNewPixelId] = useState("");
  const [creatingPixel, setCreatingPixel] = useState(false);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

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

  async function loadLists() {
    const [productRows, campaignRows] = await Promise.all([
      authorizedFetch("/admin/campaigns/catalog"),
      authorizedFetch("/admin/campaigns"),
    ]);
    setCatalog(productRows as CatalogProduct[]);
    setCampaigns(campaignRows as CampaignSummary[]);

    try {
      const pixelRows = await authorizedFetch("/admin/pixels");
      setPixels(pixelRows as PixelChoice[]);
    } catch (reason) {
      setPixels([]);
      setError(
        reason instanceof Error
          ? reason.message
          : "Les pixels n'ont pas pu être chargés. Redémarrez le backend, puis réessayez.",
      );
    }
  }

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadLists()
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

  const filteredCatalog = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("fr");
    if (!needle) return catalog;
    return catalog.filter((product) =>
      product.name.toLocaleLowerCase("fr").includes(needle),
    );
  }, [catalog, query]);

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setPublicTitle("");
    setSlug("");
    setSlugTouched(false);
    setIsActive(true);
    setItems([]);
    setMetaPixelId("");
    setTiktokPixelId("");
    setLinkCopied(false);
    setError("");
    setMessage("");
  }

  function addProduct(product: CatalogProduct) {
    setItems((current) => [
      ...current,
      {
        key: `${product.id}-${current.length}-${Date.now()}`,
        productId: product.id,
        title: `المنتج ${current.length + 1}`,
        variantIds: product.variants.map((variant) => variant.id),
        product,
      },
    ]);
  }

  async function editCampaign(id: string) {
    setError("");
    setMessage("");
    const detail = (await authorizedFetch(`/admin/campaigns/${id}`)) as {
      id: string;
      title: string;
      publicTitle: string;
      slug: string;
      isActive: boolean;
      metaPixelId: string | null;
      tiktokPixelId: string | null;
      items: Array<{
        productId: string;
        title: string;
        variantIds: string[];
        product: CatalogProduct | null;
      }>;
    };

    setEditingId(detail.id);
    setTitle(detail.title);
    setPublicTitle(detail.publicTitle);
    setSlug(detail.slug);
    setSlugTouched(true);
    setIsActive(detail.isActive);
    setMetaPixelId(detail.metaPixelId ?? "");
    setTiktokPixelId(detail.tiktokPixelId ?? "");
    setLinkCopied(false);
    setItems(
      detail.items.flatMap((item, index) => {
        const product =
          item.product ?? catalog.find((entry) => entry.id === item.productId) ?? null;
        if (!product) return [];
        return [
          {
            key: `${item.productId}-${index}`,
            productId: item.productId,
            title: item.title,
            variantIds: item.variantIds,
            product,
          },
        ];
      }),
    );
  }

  async function saveCampaign() {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      if (items.length === 0) throw new Error("Ajoutez au moins un produit.");
      const payload = {
        title: title.trim(),
        publicTitle: publicTitle.trim(),
        slug: slug.trim(),
        isActive,
        metaPixelId: metaPixelId || null,
        tiktokPixelId: tiktokPixelId || null,
        items: items.map((item, index) => ({
          productId: item.productId,
          title: item.title.trim(),
          variantIds: item.variantIds,
          sortOrder: index,
        })),
      };

      if (editingId) {
        await authorizedFetch(`/admin/campaigns/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        const created = (await authorizedFetch("/admin/campaigns", {
          method: "POST",
          body: JSON.stringify(payload),
        })) as { id: string };
        setEditingId(created.id);
      }

      setMessage("Campagne enregistrée.");
      await loadLists();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  }

  async function createPixel() {
    setCreatingPixel(true);
    setError("");
    setMessage("");

    try {
      const created = (await authorizedFetch("/admin/pixels", {
        method: "POST",
        body: JSON.stringify({
          name: newPixelName.trim(),
          platform: newPixelPlatform,
          pixelId: newPixelId.trim(),
          isActive: true,
        }),
      })) as PixelChoice;

      setPixels((current) => [created, ...current.filter((pixel) => pixel.id !== created.id)]);
      if (created.platform === "tiktok") {
        setTiktokPixelId(created.id);
      } else {
        setMetaPixelId(created.id);
      }
      setNewPixelName("");
      setNewPixelId("");
      setMessage(`Pixel ${created.platform === "meta" ? "Meta" : "TikTok"} ajouté et sélectionné.`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Impossible de créer le pixel.");
    } finally {
      setCreatingPixel(false);
    }
  }

  const publicPath = slug ? `/campagne/${slug}` : "";
  const publicUrl = publicPath && origin ? `${origin}${publicPath}` : publicPath;
  const metaPixels = pixels.filter((pixel) => pixel.platform === "meta");
  const tiktokPixels = pixels.filter((pixel) => pixel.platform === "tiktok");

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Campagnes"
        description="Choisissez les produits, les pixels Meta et TikTok, puis générez le lien de commande."
        action={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Link
              href="/admin/pixels"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#171714] bg-white px-4 text-sm font-semibold text-[#171714]"
            >
              Gérer les pixels
            </Link>
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#171714] px-4 text-sm font-semibold text-white"
            >
              Nouvelle campagne
            </button>
          </div>
        }
      />

      <div className="grid items-start gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-[#E5E1D8] bg-white p-3 shadow-[0_1px_2px_rgba(23,23,20,0.04)] lg:sticky lg:top-4">
          <p className="px-2 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#918C82]">
            Campagnes
          </p>
          {loading ? (
            <p className="px-2 py-6 text-sm text-[#5F5C55]">Chargement…</p>
          ) : campaigns.length === 0 ? (
            <p className="px-2 py-6 text-sm leading-6 text-[#5F5C55]">
              Aucune campagne enregistrée.
            </p>
          ) : (
            <div className="space-y-1.5">
              {campaigns.map((campaign) => {
                const active = editingId === campaign.id;
                return (
                  <button
                    key={campaign.id}
                    type="button"
                    onClick={() => void editCampaign(campaign.id)}
                    className={[
                      "w-full rounded-xl px-3 py-3 text-left transition",
                      active
                        ? "bg-[#171714] text-white"
                        : "hover:bg-[#F6F4EF]",
                    ].join(" ")}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold">
                        {campaign.title}
                      </span>
                      <span
                        className={[
                          "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                          active
                            ? "bg-white/15 text-white"
                            : campaign.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-[#F2F0EA] text-[#918C82]",
                        ].join(" ")}
                      >
                        {campaign.isActive ? "Active" : "Inactive"}
                      </span>
                    </span>
                    <span className={`mt-1 block truncate text-xs ${active ? "text-white/70" : "text-[#918C82]"}`}>
                      {campaign.itemCount} produit{campaign.itemCount > 1 ? "s" : ""} · /campagne/{campaign.slug}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        <div className="min-w-0 space-y-4">
          <section className="rounded-2xl border border-[#E5E1D8] bg-white p-4 shadow-[0_1px_2px_rgba(23,23,20,0.04)] sm:p-5">
            <h2 className="text-sm font-semibold text-[#171714]">1. La campagne</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block text-sm sm:col-span-2">
                <span className="mb-1.5 block text-xs font-medium text-[#5F5C55]">Nom interne</span>
                <input
                  value={title}
                  onChange={(event) => {
                    const next = event.target.value;
                    setTitle(next);
                    if (!slugTouched) setSlug(slugify(next));
                  }}
                  className={fieldClass}
                  placeholder="Ramadan lampes"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block text-xs font-medium text-[#5F5C55]">Titre affiché</span>
                <input
                  dir="rtl"
                  value={publicTitle}
                  onChange={(event) => setPublicTitle(event.target.value)}
                  className={fieldClass}
                  placeholder="حملة رمضان"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block text-xs font-medium text-[#5F5C55]">Lien public</span>
                <input
                  value={slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    setSlug(slugify(event.target.value));
                  }}
                  className={fieldClass}
                  placeholder="ramadan-lampes"
                />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <label className="inline-flex items-center gap-2 text-sm font-medium text-[#171714]">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(event) => setIsActive(event.target.checked)}
                  className="h-4 w-4 accent-[#171714]"
                />
                Page visible pour les clients
              </label>
              {publicPath ? (
                <a
                  href={publicPath}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-semibold text-[#171714] underline decoration-[#ECAB1C] underline-offset-4"
                >
                  Voir la page
                </a>
              ) : null}
            </div>
          </section>

          <section className="rounded-2xl border border-[#ECAB1C]/50 bg-white p-4 shadow-[0_1px_2px_rgba(23,23,20,0.04)] sm:p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#171714]">
                  2. Pixels Meta et TikTok
                </h2>
                <p className="mt-1 text-xs leading-5 text-[#918C82]">
                  Créez un pixel ici, puis choisissez-le pour cette campagne. Le même produit peut utiliser d’autres pixels dans une autre campagne.
                </p>
              </div>
              <Link
                href="/admin/pixels"
                className="shrink-0 text-sm font-semibold text-[#171714] underline decoration-[#ECAB1C] underline-offset-4"
              >
                Voir tous les pixels
              </Link>
            </div>

            <div className="mt-4 grid gap-3 rounded-xl bg-[#F6F4EF] p-3 sm:grid-cols-[1fr_140px_1fr_auto] sm:items-end">
              <label className="block text-sm">
                <span className="mb-1.5 block text-xs font-medium text-[#5F5C55]">Nouveau pixel</span>
                <input
                  value={newPixelName}
                  onChange={(event) => setNewPixelName(event.target.value)}
                  className={fieldClass}
                  placeholder="Nom, ex. Ramadan"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block text-xs font-medium text-[#5F5C55]">Plateforme</span>
                <select
                  value={newPixelPlatform}
                  onChange={(event) =>
                    setNewPixelPlatform(event.target.value as "meta" | "tiktok")
                  }
                  className={fieldClass}
                >
                  <option value="meta">Meta</option>
                  <option value="tiktok">TikTok</option>
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block text-xs font-medium text-[#5F5C55]">ID du pixel</span>
                <input
                  value={newPixelId}
                  onChange={(event) =>
                    setNewPixelId(event.target.value.replace(/[^A-Za-z0-9]/g, ""))
                  }
                  className={fieldClass}
                  placeholder="1234567890"
                />
              </label>
              <button
                type="button"
                disabled={creatingPixel || newPixelName.trim().length < 2 || newPixelId.trim().length < 4}
                onClick={() => void createPixel()}
                className="min-h-11 rounded-xl bg-[#171714] px-4 text-sm font-semibold text-white disabled:opacity-40"
              >
                {creatingPixel ? "Ajout…" : "Créer le pixel"}
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1.5 block text-xs font-medium text-[#5F5C55]">Pixel Meta de la campagne</span>
                <select
                  value={metaPixelId}
                  onChange={(event) => setMetaPixelId(event.target.value)}
                  className={fieldClass}
                >
                  <option value="">Aucun pixel Meta</option>
                  {metaPixels.map((pixel) => (
                    <option key={pixel.id} value={pixel.id}>
                      {pixel.name} · {pixel.pixelId}
                      {pixel.isActive ? "" : " · inactif"}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block text-xs font-medium text-[#5F5C55]">Pixel TikTok de la campagne</span>
                <select
                  value={tiktokPixelId}
                  onChange={(event) => setTiktokPixelId(event.target.value)}
                  className={fieldClass}
                >
                  <option value="">Aucun pixel TikTok</option>
                  {tiktokPixels.map((pixel) => (
                    <option key={pixel.id} value={pixel.id}>
                      {pixel.name} · {pixel.pixelId}
                      {pixel.isActive ? "" : " · inactif"}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-4 rounded-xl border border-[#E5E1D8] p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#918C82]">
                Lien de commande
              </p>
              {publicPath ? (
                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <code className="min-w-0 flex-1 truncate rounded-lg bg-[#F6F4EF] px-3 py-2 text-sm text-[#171714]">
                    {publicUrl}
                  </code>
                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard.writeText(publicUrl).then(() => {
                        setLinkCopied(true);
                        window.setTimeout(() => setLinkCopied(false), 1600);
                      });
                    }}
                    className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#171714] px-3 text-xs font-semibold text-white"
                  >
                    {linkCopied ? "Copié" : "Copier le lien"}
                  </button>
                </div>
              ) : (
                <p className="mt-2 text-sm text-[#5F5C55]">
                  Le lien apparaît dès que le nom de la campagne est renseigné.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-[#E5E1D8] bg-white p-4 shadow-[0_1px_2px_rgba(23,23,20,0.04)] sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#171714]">3. Choisir les produits</h2>
                <p className="mt-1 text-xs leading-5 text-[#918C82]">
                  Ajoutez un modèle, puis gardez seulement les couleurs de la campagne.
                </p>
              </div>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher"
                className={`${fieldClass} sm:max-w-[220px]`}
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {filteredCatalog.slice(0, 9).map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => addProduct(product)}
                  className="overflow-hidden rounded-xl border border-[#E5E1D8] bg-[#F6F4EF] text-left transition hover:border-[#171714]"
                >
                  <span className="block aspect-[4/3] bg-[#EDE3D7]">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
                    ) : null}
                  </span>
                  <span className="block px-3 py-2.5">
                    <span className="line-clamp-2 block text-sm font-semibold text-[#171714]">
                      {product.name}
                    </span>
                    <span className="mt-1 block text-xs text-[#918C82]">
                      {product.price} DA · {product.variants.length} couleurs
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="px-1 text-sm font-semibold text-[#171714]">
              4. Titre et couleurs
            </h2>
            {items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#E5E1D8] bg-white px-4 py-10 text-center text-sm text-[#918C82]">
                Les produits choisis apparaîtront ici.
              </div>
            ) : (
              items.map((item, index) => (
                <article
                  key={item.key}
                  className="rounded-2xl border border-[#E5E1D8] bg-white p-4 shadow-[0_1px_2px_rgba(23,23,20,0.04)]"
                >
                  <div className="flex gap-3">
                    <span className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#EDE3D7]">
                      {item.product.imageUrl ? (
                        <img src={item.product.imageUrl} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#171714]">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-[#918C82]">{item.product.price} DA</p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setItems((current) => current.filter((entry) => entry.key !== item.key))
                          }
                          className="shrink-0 text-xs font-semibold text-[#B42318]"
                        >
                          Retirer
                        </button>
                      </div>
                      <label className="mt-3 block text-sm">
                        <span className="mb-1.5 block text-xs font-medium text-[#5F5C55]">
                          Titre sur la page
                        </span>
                        <input
                          dir="rtl"
                          value={item.title}
                          onChange={(event) =>
                            setItems((current) =>
                              current.map((entry) =>
                                entry.key === item.key
                                  ? { ...entry, title: event.target.value }
                                  : entry,
                              ),
                            )
                          }
                          className={fieldClass}
                          placeholder={`المنتج ${index + 1}`}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.product.variants.map((variant) => {
                      const checked = item.variantIds.includes(variant.id);
                      return (
                        <label
                          key={variant.id}
                          className={[
                            "inline-flex min-h-10 items-center gap-2 rounded-full border px-3 text-sm",
                            checked
                              ? "border-[#ECAB1C] bg-[#FFF8E8] text-[#171714]"
                              : "border-[#E5E1D8] bg-white text-[#5F5C55]",
                          ].join(" ")}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(event) => {
                              setItems((current) =>
                                current.map((entry) => {
                                  if (entry.key !== item.key) return entry;
                                  const variantIds = event.target.checked
                                    ? [...entry.variantIds, variant.id]
                                    : entry.variantIds.filter((id) => id !== variant.id);
                                  return { ...entry, variantIds };
                                }),
                              );
                            }}
                            className="accent-[#171714]"
                          />
                          <span
                            className="h-3.5 w-3.5 rounded-full border border-black/10"
                            style={{
                              background: variant.isMulticolor
                                ? "conic-gradient(#FF3B30, #FFCC00, #34C759, #007AFF, #FF3B30)"
                                : variant.hex || "#E7DED3",
                            }}
                          />
                          {variant.name}
                          {variant.isMulticolor ? " +500" : ""}
                        </label>
                      );
                    })}
                  </div>
                </article>
              ))
            )}
          </section>

          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </p>
          ) : null}
          {message ? (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {message}
            </p>
          ) : null}

          <div className="sticky bottom-3 flex justify-end">
            <button
              type="button"
              disabled={saving}
              onClick={() => void saveCampaign()}
              className="min-h-12 rounded-xl bg-[#ECAB1C] px-6 text-sm font-bold text-[#251713] shadow-[0_10px_24px_rgba(236,171,28,0.28)] disabled:opacity-50"
            >
              {saving ? "Enregistrement…" : "Enregistrer la campagne"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
