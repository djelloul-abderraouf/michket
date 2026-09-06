import { useState } from "react";
import type { Order } from "@/lib/crm/types";
import { CrmPanel, CrmCard, CrmBadge, CrmButton, dzd, formatDate, productSummary, CrmAddButton, CrmPopup, ViewToggle } from "./CrmUi";

export function CrmDelivery({
  orders,
  onCreateParcel,
  onDelivered,
  onReturned,
}: {
  orders: Order[];
  onCreateParcel: (order: Order) => void;
  onDelivered: (order: Order) => void;
  onReturned: (order: Order) => void;
}) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [view, setView] = useState<"list" | "grid">("list");
  const deliveredOrders = orders.filter((order) => order.status === "livre");
  const inTransitOrders = orders.filter((order) => order.status === "en_livraison");
  const averageDeliveryTime = "2.1 jours"; // Would be calculated from real data

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <CrmPanel className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/50">
            En transit
          </p>
          <p className="mt-2 text-2xl font-bold text-black">{inTransitOrders.length}</p>
          <p className="mt-1 text-sm text-black/60">Colis en cours</p>
        </CrmPanel>
        <CrmPanel className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/50">
            Livrés
          </p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">{deliveredOrders.length}</p>
          <p className="mt-1 text-sm text-black/60">Livraison confirmée</p>
        </CrmPanel>
        <CrmPanel className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/50">
            Délai moyen
          </p>
          <p className="mt-2 text-2xl font-bold text-black">{averageDeliveryTime}</p>
          <p className="mt-1 text-sm text-black/60">Temps de livraison</p>
        </CrmPanel>
      </div>

      {/* Delivery Management */}
      <CrmPanel
        title={`Gestion des livraisons (${orders.length})`}
        actions={
          <div className="flex items-center gap-3">
            <CrmBadge variant="info">
              {inTransitOrders.length} en transit
            </CrmBadge>
            <ViewToggle view={view} onViewChange={setView} type="grid" />
            <CrmAddButton onClick={() => setIsPopupOpen(true)} label="Nouvelle livraison" />
          </div>
        }
      >
        {orders.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-lg font-semibold text-black/40">Aucune livraison en cours</p>
            <p className="mt-2 text-sm text-black/30">
              Les commandes validées en préparation apparaîtront ici
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
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Suivi</th>
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
                    <td className="px-4 py-3">
                      <CrmBadge variant={order.status === "livre" ? "success" : "info"}>
                        {order.status === "livre" ? "Livré" : "En transit"}
                      </CrmBadge>
                    </td>
                    <td className="px-4 py-3">
                      <CrmBadge variant={order.trackingNumber ? "success" : "warning"}>
                        {order.trackingNumber ? "Yalidine" : "À créer"}
                      </CrmBadge>
                    </td>
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
                      <CrmBadge variant={order.status === "livre" ? "success" : "info"}>
                        {order.status === "livre" ? "Livré" : "En transit"}
                      </CrmBadge>
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

                {/* Tracking Information */}
                <div className="rounded-lg border border-black/10 bg-black/[0.02] p-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-black/60">Numéro de suivi</p>
                      <p className="text-sm font-bold">
                        {order.trackingNumber || "Non créé"}
                      </p>
                    </div>
                    <CrmBadge variant={order.trackingNumber ? "success" : "warning"}>
                      {order.trackingNumber ? "Yalidine" : "À créer"}
                    </CrmBadge>
                  </div>
                  {order.carrierStatus && (
                    <p className="mt-2 text-xs text-black/60">{order.carrierStatus}</p>
                  )}
                </div>

                <div className="space-y-2">
                  {!order.trackingNumber && (
                    <CrmButton
                      variant="ghost"
                      onClick={() => onCreateParcel(order)}
                    >
                      Créer colis Yalidine
                    </CrmButton>
                  )}
                  {order.status === "en_livraison" && (
                    <div className="grid grid-cols-2 gap-2">
                      <CrmButton
                        onClick={() => onDelivered(order)}
                        variant="success"
                        size="sm"
                      >
                        Livré
                      </CrmButton>
                      <CrmButton
                        onClick={() => onReturned(order)}
                        variant="danger"
                        size="sm"
                      >
                        Retour
                      </CrmButton>
                    </div>
                  )}
                </div>
              </CrmCard>
            ))}
          </div>
        )}
      </CrmPanel>

      {/* New Delivery Popup */}
      <CrmPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        title="Nouvelle livraison"
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
              Transporteur
            </label>
            <select className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold focus:ring-1 focus:ring-michket-gold">
              <option value="yalidine">Yalidine</option>
              <option value="other">Autre</option>
            </select>
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
              Créer livraison
            </CrmButton>
          </div>
        </form>
      </CrmPopup>
    </div>
  );
}
