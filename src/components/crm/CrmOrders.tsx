import { FormEvent, useState } from "react";
import { Search, Phone, MapPin, User } from "lucide-react";
import {
  canChangeOrderStatus,
  canCreateOrder,
  statusTransitions,
} from "@/lib/crm/permissions";
import { orderStatusLabels, orderStatuses } from "@/lib/crm/types";
import type { CrmRole, Order, OrderStatus, Product } from "@/lib/crm/types";
import { CrmButton, CrmPanel, CrmCard, CrmBadge, cx, dzd, formatDate, productSummary, CrmAddButton, CrmPopup, ViewToggle, CrmSideDrawer } from "./CrmUi";

const statusTone: Record<OrderStatus, { border: string; bg: string; badge: string }> = {
  pas_confirme: { border: "border-l-stone-400", bg: "bg-stone-50", badge: "default" },
  confirme: { border: "border-l-emerald-500", bg: "bg-emerald-50", badge: "success" },
  en_fabrication: { border: "border-l-cyan-500", bg: "bg-cyan-50", badge: "info" },
  en_preparation: { border: "border-l-amber-500", bg: "bg-amber-50", badge: "warning" },
  en_livraison: { border: "border-l-indigo-500", bg: "bg-indigo-50", badge: "info" },
  livre: { border: "border-l-green-600", bg: "bg-green-50", badge: "success" },
  retour_echec: { border: "border-l-rose-500", bg: "bg-rose-50", badge: "danger" },
};

export function CrmOrders(props: {
  orders: Order[];
  selectedOrder?: Order;
  query: string;
  statusFilter: OrderStatus | "all";
  wilayaFilter: string;
  wilayas: string[];
  userRoles: CrmRole[];
  newOrderName: string;
  newOrderPhone: string;
  newOrderWilaya: string;
  newOrderProduct: string;
  products: Product[];
  onQuery: (value: string) => void;
  onStatusFilter: (value: OrderStatus | "all") => void;
  onWilayaFilter: (value: string) => void;
  onSelect: (id: string) => void;
  onMove: (order: Order, to: OrderStatus, note?: string) => void;
  onCreateOrder: (event: FormEvent<HTMLFormElement>) => void;
  setNewOrderName: (value: string) => void;
  setNewOrderPhone: (value: string) => void;
  setNewOrderWilaya: (value: string) => void;
  setNewOrderProduct: (value: string) => void;
}) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [view, setView] = useState<"list" | "kanban">("list");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const selectedOrder = props.selectedOrder;

  return (
    <div className="space-y-6">
      <section className="min-w-0 space-y-4">
        {/* Filters */}
        <CrmPanel className="!p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <input
                value={props.query}
                onChange={(event) => props.onQuery(event.target.value)}
                placeholder="Rechercher client, téléphone, référence..."
                className="h-11 w-full rounded-lg border border-black/15 px-4 pl-10 text-sm outline-none focus:border-michket-gold focus:ring-1 focus:ring-michket-gold"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
            </div>
            <div className="flex items-center gap-3">
              <ViewToggle view={view} onViewChange={setView} />
              <CrmAddButton
                onClick={() => setIsPopupOpen(true)}
                label="Nouvelle commande"
                disabled={!canCreateOrder(props.userRoles)}
              />
            </div>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <select
              value={props.statusFilter}
              onChange={(event) =>
                props.onStatusFilter(event.target.value as OrderStatus | "all")
              }
              className="h-11 w-full rounded-lg border border-black/15 px-4 text-sm outline-none focus:border-michket-gold focus:ring-1 focus:ring-michket-gold"
            >
              <option value="all">Tous statuts</option>
              {orderStatuses.map((status) => (
                <option key={status} value={status}>
                  {orderStatusLabels[status]}
                </option>
              ))}
            </select>
            <select
              value={props.wilayaFilter}
              onChange={(event) => props.onWilayaFilter(event.target.value)}
              className="h-11 w-full rounded-lg border border-black/15 px-4 text-sm outline-none focus:border-michket-gold focus:ring-1 focus:ring-michket-gold"
            >
              <option value="all">Toutes wilayas</option>
              {props.wilayas.map((wilaya) => (
                <option key={wilaya} value={wilaya}>
                  {wilaya}
                </option>
              ))}
            </select>
          </div>
        </CrmPanel>

        {/* Orders View */}
        {view === "list" ? (
          <CrmPanel title="Liste des commandes">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-black/10 text-left text-xs font-semibold uppercase tracking-wider text-black/60">
                    <th className="px-4 py-3">Référence</th>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Téléphone</th>
                    <th className="px-4 py-3">Wilaya</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {props.orders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => {
                        props.onSelect(order.id);
                        setIsDrawerOpen(true);
                      }}
                      className="border-b border-black/5 cursor-pointer transition hover:bg-black/[0.02]"
                    >
                      <td className="px-4 py-3 text-sm font-bold">{order.id}</td>
                      <td className="px-4 py-3 text-sm font-medium">{order.clientName}</td>
                      <td className="px-4 py-3 text-sm text-black/70">{order.phone}</td>
                      <td className="px-4 py-3 text-sm text-black/70">{order.wilaya}</td>
                      <td className="px-4 py-3">
                        <CrmBadge variant={statusTone[order.status].badge as any}>
                          {orderStatusLabels[order.status]}
                        </CrmBadge>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold">{dzd.format(order.total)}</td>
                      <td className="px-4 py-3 text-sm text-black/60">{formatDate(order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {props.orders.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-lg font-semibold text-black/40">Aucune commande</p>
                </div>
              )}
            </div>
          </CrmPanel>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {orderStatuses
              .filter((status) => status !== "retour_echec")
              .map((status) => {
                const columnOrders = props.orders.filter((order) => order.status === status);
                const columnValue = columnOrders.reduce((sum, order) => sum + order.total, 0);

                return (
                  <div key={status} className="min-w-[320px] w-[320px] flex-shrink-0 rounded-xl border border-black/10 bg-white shadow-sm flex flex-col h-full">
                    <div className="flex items-center justify-between border-b border-black/10 px-4 py-3 bg-gradient-to-r from-black/5 to-transparent sticky top-0 bg-white z-10">
                      <div>
                        <h2 className="text-sm font-bold tracking-[0]">
                          {orderStatusLabels[status]}
                        </h2>
                        <p className="text-xs text-black/55">{dzd.format(columnValue)}</p>
                      </div>
                      <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-black px-2 py-0.5 text-xs font-bold text-white">
                        {columnOrders.length}
                      </span>
                    </div>
                    <div className="p-4 space-y-3 overflow-y-auto flex-1" style={{ maxHeight: 'calc(100vh - 320px)' }}>
                      {columnOrders.length === 0 ? (
                        <p className="text-center text-sm text-black/40 py-8">
                          Aucune commande
                        </p>
                      ) : (
                        columnOrders.map((order) => (
                          <CrmCard
                            key={order.id}
                            onClick={() => {
                              props.onSelect(order.id);
                              setIsDrawerOpen(true);
                            }}
                            className={cx(
                              "border-l-4 cursor-pointer hover:shadow-md transition-shadow",
                              statusTone[order.status].border,
                              statusTone[order.status].bg,
                            )}
                          >
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-bold text-sm leading-tight">{order.id}</p>
                                  <div className="shrink-0">
                                    <CrmBadge variant={statusTone[order.status].badge as any}>
                                      {orderStatusLabels[order.status]}
                                    </CrmBadge>
                                  </div>
                                </div>
                                <p className="text-sm font-semibold text-black truncate">{order.clientName}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-sm font-bold text-black">{dzd.format(order.total)}</p>
                                <p className="text-xs text-black/40">{formatDate(order.createdAt)}</p>
                              </div>
                            </div>

                            <div className="space-y-1 text-sm mb-3">
                              <div className="flex items-center gap-2 text-black/70">
                                <MapPin className="h-3 w-3" />{order.wilaya}
                              </div>
                              <div className="flex items-center gap-2 text-black/70">
                                <Phone className="h-3 w-3" />{order.phone}
                              </div>
                            </div>

                            <div className="rounded-lg border border-black/10 bg-black/[0.02] p-2">
                              <p className="text-xs font-semibold uppercase tracking-wider text-black/60 mb-1">Contenu</p>
                              <p className="text-xs text-black/70">
                                {productSummary(order)}
                              </p>
                            </div>
                          </CrmCard>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </section>

      {/* Order Details Side Drawer */}
      {selectedOrder && (
        <CrmSideDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          title={`Détails ${selectedOrder.id}`}
        >
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold tracking-[0]">{selectedOrder.clientName}</h3>
                    <CrmBadge variant={statusTone[selectedOrder.status].badge as any}>
                      {orderStatusLabels[selectedOrder.status]}
                    </CrmBadge>
                  </div>
                  <p className="mt-2 text-sm text-black/60"><Phone className="inline h-4 w-4 mr-1" />{selectedOrder.phone}</p>
                  <p className="text-sm text-black/60"><MapPin className="inline h-4 w-4 mr-1" />{selectedOrder.wilaya}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-black">{dzd.format(selectedOrder.total)}</p>
                  <p className="text-sm text-black/50">{formatDate(selectedOrder.createdAt)}</p>
                </div>
              </div>

              <div className="rounded-lg border border-black/10 bg-black/[0.02] p-4">
                <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-black/60">
                  Produits
                </h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="font-medium">
                        {item.quantity}x {item.productName}
                      </span>
                      <span className="font-bold">{dzd.format(item.unitPrice * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-black/60">
                  Actions disponibles
                </h4>
                <div className="flex flex-wrap gap-2">
                  {statusTransitions[selectedOrder.status].map((to) => (
                    <CrmButton
                      key={to}
                      variant="ghost"
                      size="sm"
                      onClick={() => props.onMove(selectedOrder, to)}
                      disabled={!canChangeOrderStatus(props.userRoles, selectedOrder.status, to)}
                    >
                      → {orderStatusLabels[to]}
                    </CrmButton>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-black/60">
                  Historique
                </h4>
                <div className="space-y-2 max-h-48 overflow-auto">
                  {selectedOrder.history.slice().reverse().map((event) => (
                    <div
                      key={event.id}
                      className="rounded-lg border border-black/5 bg-black/[0.02] p-3 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-bold">
                          {orderStatusLabels[event.to]}
                        </p>
                        <p className="text-black/40">{formatDate(event.createdAt)}</p>
                      </div>
                      <p className="mt-1 text-black/60">
                        <User className="inline h-3 w-3 mr-1" />{event.authorName}
                        {event.note && ` • ${event.note}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CrmSideDrawer>
        )}

      {/* New Order Popup */}
      <CrmPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        title="Nouvelle commande"
      >
        <form onSubmit={props.onCreateOrder} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              Nom client
            </label>
            <input
              value={props.newOrderName}
              onChange={(event) => props.setNewOrderName(event.target.value)}
              placeholder="Entrez le nom complet"
              className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold focus:ring-1 focus:ring-michket-gold"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              Téléphone
            </label>
            <input
              value={props.newOrderPhone}
              onChange={(event) => props.setNewOrderPhone(event.target.value)}
              placeholder="0XXX XX XX XX"
              className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold focus:ring-1 focus:ring-michket-gold"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              Wilaya
            </label>
            <input
              value={props.newOrderWilaya}
              onChange={(event) => props.setNewOrderWilaya(event.target.value)}
              placeholder="Alger"
              className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold focus:ring-1 focus:ring-michket-gold"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              Produit
            </label>
            <select
              value={props.newOrderProduct}
              onChange={(event) => props.setNewOrderProduct(event.target.value)}
              className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold focus:ring-1 focus:ring-michket-gold"
            >
              {props.products.filter((product) => product.active).map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} - {dzd.format(product.price)}
                </option>
              ))}
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
            <CrmButton
              type="submit"
              disabled={!canCreateOrder(props.userRoles)}
              className="flex-1"
            >
              Créer commande
            </CrmButton>
          </div>
        </form>
      </CrmPopup>
    </div>
  );
}
