import { FormEvent, useState } from "react";
import Image from "next/image";
import { ImagePlus } from "lucide-react";
import { crmProductsApi } from "@/lib/api-client";
import type { CreateCrmCategoryPayload, Product, ProductCategory } from "@/lib/crm/types";
import { CrmPanel, CrmCard, CrmBadge, CrmButton, dzd, ViewToggle, CrmAddButton, CrmPopup } from "./CrmUi";

type ProductFormPayload = {
  name: string;
  categoryId: string;
  price: number;
  photoUrl?: string;
  storagePath?: string;
  shortDescription?: string;
  isPersonalizable?: boolean;
};

const emptyForm = {
  name: "",
  categoryId: "",
  price: "",
  photoUrl: "",
  storagePath: "",
  shortDescription: "",
  isPersonalizable: false,
};

const emptyCategoryForm = {
  name: "",
  slug: "",
  description: "",
  parentId: "",
  pageTitle: "",
  productsTitle: "",
  filterLabel: "",
  metaTitle: "",
  metaDescription: "",
  href: "",
  imageUrl: "",
  imageStoragePath: "",
  sortOrder: "0",
  isActive: true,
};

function toSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function categoryPayload(form: typeof emptyCategoryForm): CreateCrmCategoryPayload {
  return {
    name: form.name.trim(),
    slug: form.slug.trim() || undefined,
    description: form.description.trim() || undefined,
    parentId: form.parentId || undefined,
    pageTitle: form.pageTitle.trim() || undefined,
    productsTitle: form.productsTitle.trim() || undefined,
    filterLabel: form.filterLabel.trim() || undefined,
    metaTitle: form.metaTitle.trim() || undefined,
    metaDescription: form.metaDescription.trim() || undefined,
    href: form.href.trim() || undefined,
    imageUrl: form.imageUrl.trim() || undefined,
    imageStoragePath: form.imageStoragePath.trim() || undefined,
    sortOrder: Number(form.sortOrder) || 0,
    isActive: form.isActive,
  };
}

export function CrmCatalog({
  products,
  categories = [],
  canEdit,
  onToggle,
  onCreate,
  onUpdate,
  onDelete,
  onCategoryCreated,
  onToast,
}: {
  products: Product[];
  categories?: ProductCategory[];
  canEdit: boolean;
  onToggle: (product: Product) => void;
  onCreate?: (data: ProductFormPayload) => void;
  onUpdate?: (id: string, data: ProductFormPayload) => void;
  onDelete?: (id: string) => void;
  onCategoryCreated?: (category: ProductCategory) => void;
  onToast?: (message: string) => void;
}) {
  const [view, setView] = useState<"list" | "grid">("list");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [uploading, setUploading] = useState<"product" | "category" | null>(null);
  const [saving, setSaving] = useState(false);
  const activeProducts = products.filter((p) => p.active);
  const inactiveProducts = products.filter((p) => !p.active);

  const openCreate = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      categoryId: categories[0]?.id || "",
    });
    setCategoryForm(emptyCategoryForm);
    setSlugTouched(false);
    setIsPopupOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      categoryId: product.categoryId || categories.find((item) => item.name === product.category)?.id || "",
      price: String(product.price),
      photoUrl: product.photoUrl || "",
      storagePath: "",
      shortDescription: "",
      isPersonalizable: Boolean(product.isPersonalizable),
    });
    setCategoryForm(emptyCategoryForm);
    setSlugTouched(false);
    setIsPopupOpen(true);
  };

  async function persistCategory() {
    const payload = categoryPayload(categoryForm);
    if (!payload.name) {
      throw new Error("Nom de categorie requis.");
    }
    const category = await crmProductsApi.createCategory(payload);
    onCategoryCreated?.(category);
    setForm((current) => ({ ...current, categoryId: category.id }));
    setCategoryForm(emptyCategoryForm);
    setSlugTouched(false);
    return category;
  }

  async function handleCreateCategory() {
    setCreatingCategory(true);
    try {
      const category = await persistCategory();
      onToast?.(`Categorie ajoutee: ${category.name}`);
    } catch (error) {
      onToast?.(error instanceof Error ? error.message : "Erreur categorie");
    } finally {
      setCreatingCategory(false);
    }
  }

  async function handleUploadImage(file: File) {
    setUploading("product");
    try {
      const uploaded = await crmProductsApi.uploadImage(file);
      setForm((current) => ({
        ...current,
        photoUrl: uploaded.url,
        storagePath: uploaded.path,
      }));
      onToast?.("Image produit envoyee vers Supabase.");
    } catch (error) {
      onToast?.(error instanceof Error ? error.message : "Erreur upload image");
    } finally {
      setUploading(null);
    }
  }

  async function handleUploadCategoryImage(file: File) {
    setUploading("category");
    try {
      const uploaded = await crmProductsApi.uploadCategoryImage(file);
      setCategoryForm((current) => ({
        ...current,
        imageUrl: uploaded.url,
        imageStoragePath: uploaded.path,
      }));
      onToast?.("Image categorie envoyee vers Supabase.");
    } catch (error) {
      onToast?.(error instanceof Error ? error.message : "Erreur upload categorie");
    } finally {
      setUploading(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim()) {
      onToast?.("Nom du produit requis.");
      return;
    }

    setSaving(true);
    try {
      let categoryId = form.categoryId;
      if (!categoryId && categoryForm.name.trim()) {
        const category = await persistCategory();
        categoryId = category.id;
      }
      if (!categoryId) {
        onToast?.("Choisissez ou creez une categorie.");
        return;
      }

      const payload: ProductFormPayload = {
        name: form.name.trim(),
        categoryId,
        price: Number(form.price) || 0,
        photoUrl: form.photoUrl || undefined,
        storagePath: form.storagePath || undefined,
        shortDescription: form.shortDescription || undefined,
        isPersonalizable: form.isPersonalizable,
      };
      if (editingId) {
        onUpdate?.(editingId, payload);
      } else {
        onCreate?.(payload);
      }
      setIsPopupOpen(false);
      setForm(emptyForm);
    } catch (error) {
      onToast?.(error instanceof Error ? error.message : "Erreur produit");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <CrmPanel className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/50">
            Total produits
          </p>
          <p className="mt-2 text-2xl font-bold text-black">{products.length}</p>
        </CrmPanel>
        <CrmPanel className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/50">
            Actifs
          </p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">{activeProducts.length}</p>
        </CrmPanel>
        <CrmPanel className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/50">
            Inactifs
          </p>
          <p className="mt-2 text-2xl font-bold text-rose-600">{inactiveProducts.length}</p>
        </CrmPanel>
      </div>

      <CrmPanel
        title="Catalogue produits"
        actions={
          <div className="flex items-center gap-3">
            <ViewToggle view={view} onViewChange={setView} type="grid" />
            <CrmAddButton onClick={openCreate} label="Nouveau produit" disabled={!canEdit} />
          </div>
        }
      >
        {view === "list" ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/10 text-left text-xs font-semibold uppercase tracking-wider text-black/60">
                  <th className="px-4 py-3">Nom</th>
                  <th className="px-4 py-3">Categorie</th>
                  <th className="px-4 py-3">Prix</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-black/5">
                    <td className="px-4 py-3 text-sm font-bold">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-stone-100">
                          <Image
                            src={product.photoUrl || "/images/placeholder-product.png"}
                            alt={product.name}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                        {product.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-black/70">{product.category}</td>
                    <td className="px-4 py-3 text-sm font-bold">{dzd.format(product.price)}</td>
                    <td className="px-4 py-3">
                      <CrmBadge variant={product.active ? "success" : "danger"}>
                        {product.active ? "Actif" : "Inactif"}
                      </CrmBadge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <CrmButton variant="ghost" size="sm" disabled={!canEdit} onClick={() => openEdit(product)}>
                          Modifier
                        </CrmButton>
                        <CrmButton
                          variant={product.active ? "ghost" : "success"}
                          size="sm"
                          onClick={() => onToggle(product)}
                          disabled={!canEdit}
                        >
                          {product.active ? "Desactiver" : "Reactiver"}
                        </CrmButton>
                        <CrmButton variant="danger" size="sm" disabled={!canEdit} onClick={() => onDelete?.(product.id)}>
                          Supprimer
                        </CrmButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <CrmCard key={product.id} className="overflow-hidden p-0">
                <div className="relative aspect-[4/3] bg-stone-100">
                  <Image
                    src={product.photoUrl || "/images/placeholder-product.png"}
                    alt={product.name}
                    fill
                    unoptimized
                    sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-base">{product.name}</h3>
                  <p className="text-xs text-black/50">{product.category}</p>
                  <p className="text-lg font-bold">{dzd.format(product.price)}</p>
                  <CrmButton variant="ghost" size="sm" disabled={!canEdit} onClick={() => openEdit(product)}>
                    Modifier
                  </CrmButton>
                </div>
              </CrmCard>
            ))}
          </div>
        )}
      </CrmPanel>

      <CrmPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        title={editingId ? "Modifier le produit" : "Nouveau produit"}
      >
        <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          <input
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="Nom"
            className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm"
            required
          />
          <div className="space-y-3 rounded-lg border border-black/10 p-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-black/60">
              Categorie (Supabase)
            </label>
            <select
              value={form.categoryId}
              onChange={(event) => setForm({ ...form, categoryId: event.target.value })}
              className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm"
            >
              <option value="">Choisir une categorie existante</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.parentId
                    ? `${categories.find((item) => item.id === category.parentId)?.name || "Parent"} / ${category.name}`
                    : category.name}
                </option>
              ))}
            </select>
            <p className="text-xs font-semibold uppercase tracking-wider text-black/50">
              Ou creer une categorie
            </p>
            <input
              value={categoryForm.name}
              onChange={(event) => {
                const name = event.target.value;
                setCategoryForm((current) => ({
                  ...current,
                  name,
                  slug: slugTouched ? current.slug : toSlug(name),
                }));
              }}
              placeholder="Nom"
              className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm"
            />
            <input
              value={categoryForm.slug}
              onChange={(event) => {
                setSlugTouched(true);
                setCategoryForm((current) => ({ ...current, slug: toSlug(event.target.value) }));
              }}
              placeholder="Slug (lampes-3d)"
              className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm"
            />
            <select
              value={categoryForm.parentId}
              onChange={(event) => setCategoryForm((current) => ({ ...current, parentId: event.target.value }))}
              className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm"
            >
              <option value="">Categorie parente (optionnel)</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <textarea
              value={categoryForm.description}
              onChange={(event) => setCategoryForm((current) => ({ ...current, description: event.target.value }))}
              placeholder="Description"
              rows={2}
              className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm"
            />
            <input
              value={categoryForm.pageTitle}
              onChange={(event) => setCategoryForm((current) => ({ ...current, pageTitle: event.target.value }))}
              placeholder="Titre de page"
              className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm"
            />
            <input
              value={categoryForm.productsTitle}
              onChange={(event) => setCategoryForm((current) => ({ ...current, productsTitle: event.target.value }))}
              placeholder="Titre des produits"
              className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm"
            />
            <input
              value={categoryForm.filterLabel}
              onChange={(event) => setCategoryForm((current) => ({ ...current, filterLabel: event.target.value }))}
              placeholder="Label filtre"
              className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm"
            />
            <input
              value={categoryForm.metaTitle}
              onChange={(event) => setCategoryForm((current) => ({ ...current, metaTitle: event.target.value }))}
              placeholder="Meta titre"
              className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm"
            />
            <textarea
              value={categoryForm.metaDescription}
              onChange={(event) => setCategoryForm((current) => ({ ...current, metaDescription: event.target.value }))}
              placeholder="Meta description"
              rows={2}
              className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm"
            />
            <input
              value={categoryForm.href}
              onChange={(event) => setCategoryForm((current) => ({ ...current, href: event.target.value }))}
              placeholder="Lien (ex: /lampes-3d)"
              className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min={0}
                value={categoryForm.sortOrder}
                onChange={(event) => setCategoryForm((current) => ({ ...current, sortOrder: event.target.value }))}
                placeholder="Ordre"
                className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={categoryForm.isActive}
                  onChange={(event) => setCategoryForm((current) => ({ ...current, isActive: event.target.checked }))}
                />
                Active
              </label>
            </div>
            {categoryForm.imageUrl && (
              <div className="relative h-28 w-full overflow-hidden rounded-lg bg-stone-100">
                <Image
                  src={categoryForm.imageUrl}
                  alt={categoryForm.name || "Apercu categorie"}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            )}
            <label className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-black/20 px-3 text-sm text-black/70 hover:border-michket-gold">
              <ImagePlus className="h-4 w-4" />
              {uploading === "category" ? "Envoi image categorie..." : "Image categorie (Supabase)"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="hidden"
                disabled={!canEdit || Boolean(uploading)}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    void handleUploadCategoryImage(file);
                  }
                  event.target.value = "";
                }}
              />
            </label>
            <CrmButton
              type="button"
              variant="ghost"
              className="w-full"
              disabled={!canEdit || creatingCategory || !categoryForm.name.trim()}
              onClick={() => void handleCreateCategory()}
            >
              {creatingCategory ? "..." : "Enregistrer la categorie"}
            </CrmButton>
          </div>
          <input
            type="number"
            min={0}
            value={form.price}
            onChange={(event) => setForm({ ...form, price: event.target.value })}
            placeholder="Prix DZD"
            className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm"
          />
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-black/60">
              Image produit (Supabase)
            </label>
            {form.photoUrl && (
              <div className="relative h-36 w-full overflow-hidden rounded-lg bg-stone-100">
                <Image
                  src={form.photoUrl}
                  alt={form.name || "Apercu produit"}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            )}
            <label className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-black/20 px-3 text-sm text-black/70 hover:border-michket-gold">
              <ImagePlus className="h-4 w-4" />
              {uploading === "product" ? "Envoi vers Supabase..." : "Choisir une image"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="hidden"
                disabled={!canEdit || Boolean(uploading)}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    void handleUploadImage(file);
                  }
                  event.target.value = "";
                }}
              />
            </label>
          </div>
          <textarea
            value={form.shortDescription}
            onChange={(event) => setForm({ ...form, shortDescription: event.target.value })}
            placeholder="Description courte"
            className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm"
            rows={2}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isPersonalizable}
              onChange={(event) => setForm({ ...form, isPersonalizable: event.target.checked })}
            />
            Personnalisable
          </label>
          <div className="flex gap-3">
            <CrmButton type="button" variant="ghost" className="flex-1" onClick={() => setIsPopupOpen(false)}>
              Annuler
            </CrmButton>
            <CrmButton type="submit" className="flex-1" disabled={!canEdit || saving || Boolean(uploading)}>
              {saving ? "..." : editingId ? "Enregistrer" : "Creer"}
            </CrmButton>
          </div>
        </form>
      </CrmPopup>
    </div>
  );
}
