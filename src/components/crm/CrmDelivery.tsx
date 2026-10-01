import { useMemo, useState } from "react";
import type { CrmRole, Order, OrderStatus } from "@/lib/crm/types";
import { CrmOrderDetailsDrawer } from "./CrmOrderDetailsDrawer";
import { orderStatusLabels } from "@/lib/crm/types";
import { CrmPanel, CrmCard, CrmBadge, CrmButton, dzd, formatDate, productSummary, orderRef, ViewToggle, OrderSearchField } from "./CrmUi";
import { orderMatchesQuery } from "@/lib/crm/order-search";
import { printYalidineBordereau, downloadYalidineBordereau } from "@/lib/crm/bordereau";

function statusVariant(order: Order) {
  if (order.status === "livre") return "success" as const;
  if (order.status === "retour_echec") return "danger" as const;
  if (order.status === "confirme") return "warning" as const;
  return "info" as const;
}

export function CrmDelivery({
  orders,
  onCreateParcel,
  onSyncParcel,
  onDelivered,
  onReturned,
  userRoles,
  currentUserId,
  onOrderUpdated,
  onMove,
  onToast,
}: {
  orders: Order[];
  onCreateParcel: (order: Order) => void;
  onSyncParcel?: (order: Order) => void;
  onDelivered: (order: Order) => void;
  onReturned: (order: Order) => void;
  userRoles?: CrmRole[];
  currentUserId?: string;
  onOrderUpdated?: (order: Order) => void;
  onMove?: (order: Order, to: OrderStatus, note?: string) => void;
  onToast?: (message: string) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const selectedOrder = orders.find((order) => order.id === selectedId);
  const [view, setView] = useState<"list" | "grid">("list");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | OrderStatus>("all");
  const visibleOrders = useMemo(
    () =>
      orders.filter(
        (order) => (status === "all" || order.status === status) && orderMatchesQuery(order, query),
      ),
    [orders, query, status],
  );
  const ready = orders.filter((order) => order.status === "confirme");
  const inTransit = orders.filter((order) => order.status === "en_livraison");
  const delivered = orders.filter((order) => order.status === "livre");
  const returned = orders.filter((order) => order.status === "retour_echec");

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CrmPanel className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/50">À expédier</p>
          <p className="mt-2 text-2xl font-bold">{ready.length}</p>
          <p className="mt-1 text-sm text-black/60">Commandes confirmées</p>
        </CrmPanel>
        <CrmPanel className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/50">En transit</p>
          <p className="mt-2 text-2xl font-bold">{inTransit.length}</p>
          <p className="mt-1 text-sm text-black/60">Colis Yalidine</p>
        </CrmPanel>
        <CrmPanel className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/50">Livrés</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">{delivered.length}</p>
        </CrmPanel>
        <CrmPanel className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/50">Retours</p>
          <p className="mt-2 text-2xl font-bold text-rose-600">{returned.length}</p>
        </CrmPanel>
      </div>

      <CrmPanel className="!p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <OrderSearchField value={query} onChange={setQuery} placeholder="Rechercher client, telephone, suivi, remarque..." />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as "all" | OrderStatus)}
            className="h-11 rounded-lg border border-black/15 bg-white px-3 text-sm outline-none focus:border-michket-gold"
          >
            <option value="all">Tous les statuts</option>
            <option value="confirme">Confirme</option>
            <option value="en_livraison">En livraison</option>
            <option value="livre">Livre</option>
            <option value="retour_echec">Retour</option>
          </select>
        </div>
      </CrmPanel>

      <CrmPanel
        title={`Livraisons (${visibleOrders.length})`}
        actions={<ViewToggle view={view} onViewChange={setView} type="grid" />}
      >
        {visibleOrders.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-lg font-semibold text-black/40">Aucune livraison</p>
            <p className="mt-2 text-sm text-black/30">Les commandes confirmées apparaissent ici automatiquement.</p>
          </div>
        ) : view === "list" ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="border-b border-black/10 text-left text-xs font-semibold uppercase tracking-wider text-black/60">
                  <th className="px-3 py-3">Référence</th>
                  <th className="px-3 py-3">Client</th>
                  <th className="px-3 py-3">Destination</th>
                  <th className="px-3 py-3">Type</th>
                  <th className="px-3 py-3">Suivi</th>
                  <th className="px-3 py-3">Statut</th>
                  <th className="px-3 py-3">Total</th>
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleOrders.map((order) => (
                  <tr key={order.id} className="border-b border-black/5">
                    <td className="px-3 py-3 text-sm font-bold whitespace-nowrap">{orderRef(order)}</td>
                    <td className="px-3 py-3 text-sm">
                      <p>{order.clientName}</p>
                      <p className="text-xs text-black/50">{order.phone}</p>
                    </td>
                    <td className="px-3 py-3 text-sm">{order.wilaya}{order.commune ? ` · ${order.commune}` : ""}</td>
                    <td className="px-3 py-3 text-sm">{order.deliveryType === "office" ? "Bureau" : "Domicile"}</td>
                    <td className="px-3 py-3 text-sm">
                      <p>{order.trackingNumber || "À créer"}</p>
                      {order.yalidineStatus && (
                        <p className="text-xs text-black/50">{order.yalidineStatus}</p>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <CrmBadge variant={statusVariant(order)}>{orderStatusLabels[order.status]}</CrmBadge>
                    </td>
                    <td className="px-3 py-3 text-sm font-bold">{dzd.format(order.total)}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <CrmButton size="sm" variant="ghost" onClick={() => setSelectedId(order.id)}>
                          Details
                        </CrmButton>
                        <CrmButton
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            void printYalidineBordereau(order.id).catch(() => undefined);
                          }}
                        >
                          Imprimer
                        </CrmButton>
                        <CrmButton
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            void downloadYalidineBordereau(order.id, orderRef(order));
                          }}
                        >
                          Telecharger
                        </CrmButton>
                        {!order.trackingNumber && (
                          <CrmButton size="sm" onClick={() => onCreateParcel(order)}>Yalidine</CrmButton>
                        )}
                        {order.trackingNumber && onSyncParcel && (
                          <CrmButton size="sm" variant="ghost" onClick={() => onSyncParcel(order)}>Sync</CrmButton>
                        )}
                        {order.status === "en_livraison" && (
                          <>
                            <CrmButton size="sm" variant="success" onClick={() => onDelivered(order)}>Livré</CrmButton>
                            <CrmButton size="sm" variant="danger" onClick={() => onReturned(order)}>Retour</CrmButton>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleOrders.map((order) => (
              <CrmCard key={order.id} className="p-5 overflow-hidden">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <h3 className="font-bold truncate">{orderRef(order)}</h3>
                    <p className="text-sm truncate">{order.clientName}</p>
                  </div>
                  <CrmBadge variant={statusVariant(order)}>{orderStatusLabels[order.status]}</CrmBadge>
                </div>
                <p className="text-sm text-black/70">{order.phone}</p>
                <p className="text-sm text-black/70">{order.wilaya} · {order.commune || "-"}</p>
                <p className="text-xs text-black/50 mt-1">{order.addressLine1}</p>
                <p className="mt-3 text-xs break-words">{productSummary(order)}</p>
                <p className="mt-2 text-sm font-bold">{dzd.format(order.total)}</p>
                <p className="text-xs text-black/50 mt-1">
                  Suivi: {order.trackingNumber || "non créé"}
                  {order.yalidineStatus ? ` · ${order.yalidineStatus}` : order.carrierStatus ? ` · ${order.carrierStatus}` : ""}
                </p>
                <div className="mt-3 space-y-2">
                  <CrmButton size="sm" variant="ghost" className="w-full" onClick={() => setSelectedId(order.id)}>
                    Ouvrir la commande
                  </CrmButton>
                  <div className="grid grid-cols-2 gap-2">
                    <CrmButton
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        void printYalidineBordereau(order.id).catch(() => undefined);
                      }}
                    >
                      Imprimer
                    </CrmButton>
                    <CrmButton
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        void downloadYalidineBordereau(order.id, orderRef(order));
                      }}
                    >
                      Telecharger
                    </CrmButton>
                  </div>
                  {!order.trackingNumber && (
                    <CrmButton onClick={() => onCreateParcel(order)}>Créer colis Yalidine</CrmButton>
                  )}
                  {order.trackingNumber && onSyncParcel && (
                    <CrmButton variant="ghost" onClick={() => onSyncParcel(order)}>Actualiser Yalidine</CrmButton>
                  )}
                  {order.status === "en_livraison" && (
                    <div className="grid grid-cols-2 gap-2">
                      <CrmButton variant="success" size="sm" onClick={() => onDelivered(order)}>Livré</CrmButton>
                      <CrmButton variant="danger" size="sm" onClick={() => onReturned(order)}>Retour</CrmButton>
                    </div>
                  )}
                </div>
                <p className="mt-2 text-xs text-black/40">{formatDate(order.createdAt)}</p>
              </CrmCard>
            ))}
          </div>
        )}
      </CrmPanel>

      <CrmOrderDetailsDrawer
        order={selectedOrder}
        isOpen={Boolean(selectedId)}
        onClose={() => setSelectedId(undefined)}
        userRoles={userRoles}
        currentUserId={currentUserId}
        onMove={onMove}
        onCreateParcel={onCreateParcel}
        onSyncParcel={onSyncParcel}
        onOrderUpdated={onOrderUpdated}
        onToast={onToast}
        showStatusSelect
      />
    </div>
  );
}
