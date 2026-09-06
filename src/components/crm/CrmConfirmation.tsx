import { useState } from "react";
import type { Order } from "@/lib/crm/types";
import { CrmPanel, CrmCard, CrmBadge, CrmButton, dzd, formatDate, productSummary, CrmAddButton, CrmPopup } from "./CrmUi";

export function CrmConfirmation({
  orders,
  onConfirm,
  onReason,
}: {
  orders: Order[];
  onConfirm: (order: Order) => void;
  onReason: (order: Order, reason: NonNullable<Order["confirmationReason"]>) => void;
}) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const confirmationRate = orders.length > 0 ? 0 : 0; // Would be calculated from historical data

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <CrmPanel className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/50">
            À confirmer
          </p>
          <p className="mt-2 text-2xl font-bold text-black">{orders.length}</p>
          <p className="mt-1 text-sm text-black/60">Commandes en attente</p>
        </CrmPanel>
        <CrmPanel className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/50">
            Taux confirmation
          </p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">{confirmationRate}%</p>
          <p className="mt-1 text-sm text-black/60">Derniers 30 jours</p>
        </CrmPanel>
        <CrmPanel className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/50">
            Valeur en attente
          </p>
          <p className="mt-2 text-2xl font-bold text-black">
            {dzd.format(orders.reduce((sum, order) => sum + order.total, 0))}
          </p>
          <p className="mt-1 text-sm text-black/60">Total à confirmer</p>
        </CrmPanel>
      </div>

      {/* Orders to Confirm */}
      <CrmPanel
        title={`Commandes à confirmer (${orders.length})`}
        actions={
          <div className="flex items-center gap-3">
            <CrmBadge variant="warning">
              {orders.length} en attente
            </CrmBadge>
            <CrmAddButton onClick={() => setIsPopupOpen(true)} label="Nouvelle commande" />
          </div>
        }
      >
        {orders.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-lg font-semibold text-black/40">Aucune commande à confirmer</p>
            <p className="mt-2 text-sm text-black/30">
              Toutes les commandes ont été traitées
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {orders.map((order) => (
              <CrmCard key={order.id} className="p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base">{order.id}</h3>
                      <CrmBadge variant="warning">Pas confirmé</CrmBadge>
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
                    <span className="font-medium">{order.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-black/70">
                    <span>{order.wilaya}</span>
                  </div>
                  <div className="rounded-lg border border-black/10 bg-black/[0.02] p-3">
                    <p className="text-xs font-medium text-black/60 mb-1">Commande</p>
                    <p className="text-sm font-semibold">{productSummary(order)}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <CrmButton
                    onClick={() => onConfirm(order)}
                    variant="success"
                  >
                    Confirmer la commande
                  </CrmButton>
                  <div className="grid grid-cols-3 gap-2">
                    {(["injoignable", "refus", "a_rappeler"] as const).map((reason) => (
                      <CrmButton
                        key={reason}
                        variant="ghost"
                        size="sm"
                        onClick={() => onReason(order, reason)}
                      >
                        {reason.replace("_", " ")}
                      </CrmButton>
                    ))}
                  </div>
                </div>
              </CrmCard>
            ))}
          </div>
        )}
      </CrmPanel>

      {/* New Order Popup */}
      <CrmPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        title="Nouvelle commande"
      >
        <form className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              Nom client
            </label>
            <input
              placeholder="Nom du client"
              className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold focus:ring-1 focus:ring-michket-gold"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              Téléphone
            </label>
            <input
              placeholder="0XXX XX XX XX"
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
              Créer commande
            </CrmButton>
          </div>
        </form>
      </CrmPopup>
    </div>
  );
}
