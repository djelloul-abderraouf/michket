import { useState } from "react";
import type { Order } from "@/lib/crm/types";
import { CrmPanel, CrmCard, CrmBadge, CrmButton, dzd, formatDate, productSummary, CrmAddButton, CrmPopup, ViewToggle } from "./CrmUi";

export function CrmPreparation({
  orders,
  qualityChecked,
  setQualityChecked,
  onValidate,
}: {
  orders: Order[];
  qualityChecked: boolean;
  setQualityChecked: (value: boolean) => void;
  onValidate: (order: Order) => void;
}) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [view, setView] = useState<"list" | "grid">("list");
  return (
    <div className="space-y-6">
      {/* Quality Control Banner */}
      <CrmPanel className="!p-4 border-l-4 border-l-amber-500">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={qualityChecked}
                onChange={(event) => setQualityChecked(event.target.checked)}
                className="h-5 w-5 accent-michket-gold"
              />
              <span className="text-sm font-semibold">
                Contrôle qualité validé
              </span>
            </label>
          </div>
          <CrmBadge variant={qualityChecked ? "success" : "warning"}>
            {qualityChecked ? "Validé" : "Non validé"}
          </CrmBadge>
        </div>
        <p className="mt-2 text-xs text-black/60">
          Cochez cette case pour confirmer que le contrôle qualité a été effectué avant d'envoyer en livraison
        </p>
      </CrmPanel>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2">
        <CrmPanel className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/50">
            En préparation
          </p>
          <p className="mt-2 text-2xl font-bold text-black">{orders.length}</p>
          <p className="mt-1 text-sm text-black/60">Commandes à traiter</p>
        </CrmPanel>
        <CrmPanel className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/50">
            Valeur totale
          </p>
          <p className="mt-2 text-2xl font-bold text-black">
            {dzd.format(orders.reduce((sum, order) => sum + order.total, 0))}
          </p>
          <p className="mt-1 text-sm text-black/60">À expédier</p>
        </CrmPanel>
      </div>

      {/* Orders to Prepare */}
      <CrmPanel
        title={`Commandes en préparation (${orders.length})`}
        actions={
          <div className="flex items-center gap-3">
            <CrmBadge variant="info">
              {orders.length} en attente
            </CrmBadge>
            <ViewToggle view={view} onViewChange={setView} type="grid" />
            <CrmAddButton onClick={() => setIsPopupOpen(true)} label="Nouvelle préparation" />
          </div>
        }
      >
        {orders.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-lg font-semibold text-black/40">Aucune commande en préparation</p>
            <p className="mt-2 text-sm text-black/30">
              Les commandes terminées en fabrication apparaîtront ici
            </p>
          </div>
        ) : view === "list" ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/10 text-left text-xs font-semibold uppercase tracking-wider text-black/60">
                  <th className="px-4 py-3">Référence</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Wilaya</th>
                  <th className="px-4 py-3">Contenu</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-black/5 transition hover:bg-black/[0.02]"
                  >
                    <td className="px-4 py-3 text-sm font-bold">{order.id}</td>
                    <td className="px-4 py-3 text-sm text-black/70">{order.clientName}</td>
                    <td className="px-4 py-3 text-sm text-black/70">{order.wilaya}</td>
                    <td className="px-4 py-3 text-sm text-black/70">{productSummary(order)}</td>
                    <td className="px-4 py-3 text-sm font-bold">{dzd.format(order.total)}</td>
                    <td className="px-4 py-3 text-sm text-black/60">{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {orders.map((order) => (
              <CrmCard key={order.id} className="p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base">{order.id}</h3>
                      <CrmBadge variant="info">En préparation</CrmBadge>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-black/70">{order.clientName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-black">{dzd.format(order.total)}</p>
                    <p className="text-xs text-black/50">{formatDate(order.createdAt)}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2 text-black/70">
                    <span className="font-medium">{order.wilaya}</span>
                  </div>
                  <div className="rounded-lg border border-black/10 bg-black/[0.02] p-3">
                    <p className="text-xs font-medium text-black/60 mb-1">Contenu</p>
                    <p className="text-sm font-semibold">{productSummary(order)}</p>
                  </div>
                </div>

                <CrmButton
                  onClick={() => onValidate(order)}
                  disabled={!qualityChecked}
                  variant={qualityChecked ? "success" : "primary"}
                >
                  {qualityChecked ? "Envoyer en livraison" : "Valider contrôle qualité d'abord"}
                </CrmButton>
              </CrmCard>
            ))}
          </div>
        )}
      </CrmPanel>

      {/* New Preparation Popup */}
      <CrmPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        title="Nouvelle préparation"
      >
        <form className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              Référence commande
            </label>
            <input
              placeholder="CMD-XXX"
              className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold focus:ring-1 focus:ring-michket-gold"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              Notes de préparation
            </label>
            <textarea
              placeholder="Instructions spéciales..."
              className="h-24 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold focus:ring-1 focus:ring-michket-gold resize-none"
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
              Ajouter à préparation
            </CrmButton>
          </div>
        </form>
      </CrmPopup>
    </div>
  );
}
