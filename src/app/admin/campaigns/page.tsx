"use client";

import { useEffect, useMemo, useState } from "react";

import { PageHeader } from "@/components/admin/PageHeader";
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

const inputClass =
  "min-h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-neutral-950";

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
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function authorizedFetch(path: string, init?: RequestInit) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) throw new Error("NEXT_PUBLIC_API_URL n'est pas configurée.");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error("Session expirée.");
    }

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
  }

  useEffect(() => {
    void loadLists().catch((reason: unknown) => {
      setError(reason instanceof Error ? reason.message : "Chargement impossible.");
    });
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
    setItems(
      detail.items.flatMap((item, index) => {
        const product =
          item.product ??
          catalog.find((entry) => entry.id === item.productId) ??
          null;
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
      if (items.length === 0) {
        throw new Error("Ajoutez au moins un produit.");
      }

      const payload = {
        title: title.trim(),
        publicTitle: publicTitle.trim(),
        slug: slug.trim(),
        isActive,
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

  const publicPath = slug ? `/campagne/${slug}` : "";

  return (
    <div>
      <PageHeader
        title="Campagnes"
        description="Choisissez les produits et les couleurs, puis partagez la page de commande."
        action={
          <button
            type="button"
            onClick={resetForm}
            className="min-h-11 rounded-xl bg-neutral-950 px-4 text-sm font-semibold text-white"
          >
            Nouvelle campagne
          </button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
        <aside className="rounded-2xl border border-black/10 bg-white p-3">
          <p className="px-2 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
            Enregistrées
          </p>
          <div className="space-y-1">
            {campaigns.length === 0 ? (
              <p className="px-2 py-4 text-sm text-neutral-500">
                Aucune campagne pour le moment.
              </p>
            ) : (
              campaigns.map((campaign) => (
                <button
                  key={campaign.id}
                  type="button"
                  onClick={() => void editCampaign(campaign.id)}
                  className={[
                    "w-full rounded-xl px-3 py-2 text-left",
                    editingId === campaign.id ? "bg-neutral-950 text-white" : "hover:bg-neutral-50",
                  ].join(" ")}
                >
                  <span className="block truncate text-sm font-semibold">
                    {campaign.title}
                  </span>
                  <span className="mt-0.5 block text-xs opacity-70">
                    {campaign.itemCount} produit{campaign.itemCount > 1 ? "s" : ""}
                    {campaign.isActive ? "" : " · inactive"}
                  </span>
                </button>
              ))
            )}
          </div>
        </aside>

        <div className="space-y-5">
          <section className="grid gap-3 rounded-2xl border border-black/10 bg-white p-4 sm:grid-cols-2">
            <label className="block text-sm sm:col-span-2">
              <span className="mb-1 block font-medium">Nom interne</span>
              <input
                value={title}
                onChange={(event) => {
                  const next = event.target.value;
                  setTitle(next);
                  if (!slugTouched) setSlug(slugify(next));
                }}
                className={inputClass}
                placeholder="Ramadan lampes"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Titre affiché au client</span>
              <input
                dir="rtl"
                value={publicTitle}
                onChange={(event) => setPublicTitle(event.target.value)}
                className={inputClass}
                placeholder="حملة رمضان"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Lien</span>
              <input
                value={slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setSlug(slugify(event.target.value));
                }}
                className={inputClass}
                placeholder="ramadan-lampes"
              />
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
              />
              Campagne active
            </label>
            {publicPath ? (
              <a
                href={publicPath}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-neutral-950 underline"
              >
                Ouvrir {publicPath}
              </a>
            ) : null}
          </section>

          <section className="rounded-2xl border border-black/10 bg-white p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold">Produits de la campagne</h2>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher un produit"
                className={`${inputClass} max-w-xs`}
              />
            </div>

            <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
              {filteredCatalog.slice(0, 12).map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => addProduct(product)}
                  className="min-w-40 rounded-xl border border-black/10 px-3 py-2 text-left text-sm hover:border-neutral-950"
                >
                  <span className="line-clamp-2 font-medium">{product.name}</span>
                  <span className="mt-1 block text-xs text-neutral-500">
                    {product.price} DA · {product.variants.length} couleurs
                  </span>
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <article key={item.key} className="rounded-xl border border-black/10 p-3">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{item.product.name}</p>
                      <p className="text-xs text-neutral-500">{item.product.price} DA</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setItems((current) =>
                          current.filter((entry) => entry.key !== item.key),
                        )
                      }
                      className="text-xs font-semibold text-red-700"
                    >
                      Retirer
                    </button>
                  </div>

                  <label className="mb-3 block text-sm">
                    <span className="mb-1 block font-medium">Titre en arabe</span>
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
                      className={inputClass}
                      placeholder={`المنتج ${index + 1}`}
                    />
                  </label>

                  <div className="flex flex-wrap gap-2">
                    {item.product.variants.map((variant) => {
                      const checked = item.variantIds.includes(variant.id);
                      return (
                        <label
                          key={variant.id}
                          className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-1.5 text-sm"
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
                          />
                          {variant.name}
                          {variant.isMulticolor ? " +500" : ""}
                        </label>
                      );
                    })}
                  </div>
                </article>
              ))}
            </div>
          </section>

          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          {message ? <p className="text-sm text-emerald-700">{message}</p> : null}

          <button
            type="button"
            disabled={saving}
            onClick={() => void saveCampaign()}
            className="min-h-11 rounded-xl bg-[#ECAB1C] px-5 text-sm font-bold text-[#251713] disabled:opacity-50"
          >
            {saving ? "Enregistrement..." : "Enregistrer la campagne"}
          </button>
        </div>
      </div>
    </div>
  );
}
