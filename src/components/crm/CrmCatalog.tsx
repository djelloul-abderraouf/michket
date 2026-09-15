import { useState } from "react";
import Image from "next/image";
import type { Product, ProductCategory } from "@/lib/crm/types";
import { CrmPanel, CrmCard, CrmBadge, CrmButton, dzd, ViewToggle, CrmAddButton, CrmPopup } from "./CrmUi";

const emptyForm = {
  name: "",
  categoryId: "",
  price: "",
  photoUrl: "",
  shortDescription: "",
  isPersonalizable: false,
};

export function CrmCatalog({
  products,
  categories = [],
  canEdit,
  onToggle,
  onCreate,
  onUpdate,
  onDelete,
}: {
  products: Product[];
  categories?: ProductCategory[];
  canEdit: boolean;
  onToggle: (product: Product) => void;
  onCreate?: (data: {
    name: string;
    categoryId: string;
    price: number;
    photoUrl?: string;
    shortDescription?: string;
    isPersonalizable?: boolean;
  }) => void;
  onUpdate?: (id: string, data: {
    name: string;
    categoryId: string;
    price: number;
    photoUrl?: string;
    shortDescription?: string;
    isPersonalizable?: boolean;
  }) => void;
  onDelete?: (id: string) => void;
}) {
  const [view, setView] = useState<"list" | "grid">("list");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const activeProducts = products.filter((p) => p.active);
  const inactiveProducts = products.filter((p) => !p.active);

  const openCreate = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      categoryId: categories[0]?.id || "",
    });
    setIsPopupOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      categoryId: product.categoryId || categories.find((item) => item.name === product.category)?.id || "",
      price: String(product.price),
      photoUrl: product.photoUrl || "",
      shortDescription: "",
      isPersonalizable: Boolean(product.isPersonalizable),
    });
    setIsPopupOpen(true);
  };

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
                    <td className="px-4 py-3 text-sm font-bold">{product.name}</td>
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
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!form.name || !form.categoryId) return;
            const payload = {
              name: form.name,
              categoryId: form.categoryId,
              price: Number(form.price) || 0,
              photoUrl: form.photoUrl || undefined,
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
          }}
        >
          <input
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="Nom"
            className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm"
            required
          />
          <select
            value={form.categoryId}
            onChange={(event) => setForm({ ...form, categoryId: event.target.value })}
            className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm"
            required
          >
            <option value="">Categorie</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={0}
            value={form.price}
            onChange={(event) => setForm({ ...form, price: event.target.value })}
            placeholder="Prix DZD"
            className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm"
          />
          <input
            value={form.photoUrl}
            onChange={(event) => setForm({ ...form, photoUrl: event.target.value })}
            placeholder="URL image"
            className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm"
          />
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
            <CrmButton type="submit" className="flex-1" disabled={!canEdit}>
              {editingId ? "Enregistrer" : "Creer"}
            </CrmButton>
          </div>
        </form>
      </CrmPopup>
    </div>
  );
}
