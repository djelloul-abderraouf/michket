import { useState } from "react";
import Image from "next/image";
import type { Product } from "@/lib/crm/types";
import { CrmPanel, CrmCard, CrmBadge, CrmButton, cx, dzd, CrmAddButton, CrmPopup, ViewToggle } from "./CrmUi";

export function CrmCatalog({
  products,
  onToggle,
}: {
  products: Product[];
  onToggle: (product: Product) => void;
}) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [view, setView] = useState<"list" | "grid">("list");
  const activeProducts = products.filter((p) => p.active);
  const inactiveProducts = products.filter((p) => !p.active);

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <CrmPanel className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/50">
            Total produits
          </p>
          <p className="mt-2 text-2xl font-bold text-black">{products.length}</p>
          <p className="mt-1 text-sm text-black/60">Dans le catalogue</p>
        </CrmPanel>
        <CrmPanel className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/50">
            Actifs
          </p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">{activeProducts.length}</p>
          <p className="mt-1 text-sm text-black/60">Disponibles à la vente</p>
        </CrmPanel>
        <CrmPanel className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/50">
            Inactifs
          </p>
          <p className="mt-2 text-2xl font-bold text-rose-600">{inactiveProducts.length}</p>
          <p className="mt-1 text-sm text-black/60">Non disponibles</p>
        </CrmPanel>
      </div>

      {/* Product Catalog */}
      <CrmPanel
        title="Catalogue produits"
        actions={
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <CrmBadge variant="success">{activeProducts.length} actifs</CrmBadge>
              <CrmBadge variant="danger">{inactiveProducts.length} inactifs</CrmBadge>
            </div>
            <ViewToggle view={view} onViewChange={setView} type="grid" />
            <CrmAddButton onClick={() => setIsPopupOpen(true)} label="Nouveau produit" />
          </div>
        }
      >
        {view === "list" ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/10 text-left text-xs font-semibold uppercase tracking-wider text-black/60">
                  <th className="px-4 py-3">Nom</th>
                  <th className="px-4 py-3">Prix</th>
                  <th className="px-4 py-3">Temps fabrication</th>
                  <th className="px-4 py-3">Statut</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-black/5 transition hover:bg-black/[0.02]"
                  >
                    <td className="px-4 py-3 text-sm font-bold">{product.name}</td>
                    <td className="px-4 py-3 text-sm font-bold">{dzd.format(product.price)}</td>
                    <td className="px-4 py-3 text-sm text-black/70">{product.averageBuildHours}h</td>
                    <td className="px-4 py-3">
                      <CrmBadge variant={product.active ? "success" : "danger"}>
                        {product.active ? "Actif" : "Inactif"}
                      </CrmBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <CrmCard key={product.id} className="overflow-hidden p-0 hover:shadow-lg transition-shadow">
                <div className="relative aspect-[4/3] bg-stone-100">
                  <Image
                    src={product.photoUrl}
                    alt={product.name}
                    fill
                    sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <CrmBadge variant={product.active ? "success" : "danger"}>
                      {product.active ? "Actif" : "Inactif"}
                    </CrmBadge>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-base leading-tight mb-2">{product.name}</h3>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-lg font-bold text-black">{dzd.format(product.price)}</p>
                    <div className="flex items-center gap-1 text-sm text-black/60">
                      <span>{product.averageBuildHours}h</span>
                    </div>
                  </div>
                  <CrmButton
                    variant={product.active ? "ghost" : "success"}
                    size="sm"
                    onClick={() => onToggle(product)}
                  >
                    {product.active ? "Désactiver" : "Réactiver"}
                  </CrmButton>
                </div>
              </CrmCard>
            ))}
          </div>
        )}
      </CrmPanel>

      {/* New Product Popup */}
      <CrmPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        title="Nouveau produit"
      >
        <form className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              Nom du produit
            </label>
            <input
              placeholder="Nom du produit"
              className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold focus:ring-1 focus:ring-michket-gold"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              Prix
            </label>
            <input
              type="number"
              placeholder="0"
              className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold focus:ring-1 focus:ring-michket-gold"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              Temps de fabrication (heures)
            </label>
            <input
              type="number"
              placeholder="0"
              className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold focus:ring-1 focus:ring-michket-gold"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              URL de l'image
            </label>
            <input
              placeholder="https://..."
              className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold focus:ring-1 focus:ring-michket-gold"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <CrmButton
              type="button"
              variant="ghost"
              onClick={() => setIsPopupOpen(false)}
              className="flex-1"
            >
              Annuler
            </CrmButton>
            <CrmButton type="submit" className="flex-1">
              Ajouter produit
            </CrmButton>
          </div>
        </form>
      </CrmPopup>
    </div>
  );
}
