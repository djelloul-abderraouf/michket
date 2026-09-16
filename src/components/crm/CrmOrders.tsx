import { FormEvent, useState } from "react";
import { Search, Phone, MapPin, User, Mail, Truck } from "lucide-react";
import {
  canChangeOrderStatus,
  canCreateOrder,
} from "@/lib/crm/permissions";
import { orderStatusLabels, orderStatuses } from "@/lib/crm/types";
import type { Contact, CrmRole, Order, OrderStatus, Product } from "@/lib/crm/types";
import { ALGERIA_WILAYAS } from "@/lib/crm/wilayas";
import {
  CrmButton,
  CrmPanel,
  CrmCard,
  CrmBadge,
  cx,
  dzd,
  formatDate,
  productSummary,
  orderRef,
  CrmAddButton,
  CrmPopup,
  ViewToggle,
  CrmSideDrawer,
} from "./CrmUi";

const statusTone: Record<OrderStatus, { border: string; bg: string; badge: string }> = {
  pas_confirme: { border: "border-l-stone-400", bg: "bg-stone-50", badge: "default" },
  confirme: { border: "border-l-emerald-500", bg: "bg-emerald-50", badge: "success" },
  en_fabrication: { border: "border-l-cyan-500", bg: "bg-cyan-50", badge: "info" },
  en_preparation: { border: "border-l-amber-500", bg: "bg-amber-50", badge: "warning" },
  en_livraison: { border: "border-l-indigo-500", bg: "bg-indigo-50", badge: "info" },
  livre: { border: "border-l-green-600", bg: "bg-green-50", badge: "success" },
  retour_echec: { border: "border-l-rose-500", bg: "bg-rose-50", badge: "danger" },
};

function deliveryLabel(order: Order) {
  return order.deliveryType === "office" ? "Stop desk" : "Domicile";
}

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
  newOrderQuantity?: number;
  products: Product[];
  contacts?: Contact[];
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
  setNewOrderQuantity?: (value: number) => void;
}) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [view, setView] = useState<"list" | "kanban">("list");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [contactQuery, setContactQuery] = useState("");
  const selectedOrder = props.selectedOrder;
  const matchedContacts = (props.contacts || []).filter((contact) => {
    const haystack = `${contact.firstName} ${contact.lastName} ${contact.phone} ${contact.email || ""}`.toLowerCase();
    return contactQuery.trim().length > 0 && haystack.includes(contactQuery.toLowerCase());
  }).slice(0, 8);

  return (
    <div className="space-y-6">
      <section className="min-w-0 space-y-4">
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
              onChange={(event) => props.onStatusFilter(event.target.value as OrderStatus | "all")}
              className="h-11 w-full rounded-lg border border-black/15 px-4 text-sm outline-none focus:border-michket-gold"
            >
              <option value="all">Tous statuts</option>
              {orderStatuses.map((status) => (
                <option key={status} value={status}>{orderStatusLabels[status]}</option>
              ))}
            </select>
            <select
              value={props.wilayaFilter}
              onChange={(event) => props.onWilayaFilter(event.target.value)}
              className="h-11 w-full rounded-lg border border-black/15 px-4 text-sm outline-none focus:border-michket-gold"
            >
              <option value="all">Toutes wilayas</option>
              {props.wilayas.map((wilaya) => (
                <option key={wilaya} value={wilaya}>{wilaya}</option>
              ))}
            </select>
          </div>
        </CrmPanel>

        {view === "list" ? (
          <CrmPanel title="Liste des commandes">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className="border-b border-black/10 text-left text-xs font-semibold uppercase tracking-wider text-black/60">
                    <th className="px-3 py-3">Référence</th>
                    <th className="px-3 py-3">Client</th>
                    <th className="px-3 py-3">Téléphone</th>
                    <th className="px-3 py-3">Wilaya / commune</th>
                    <th className="px-3 py-3">Livraison</th>
                    <th className="px-3 py-3">Paiement</th>
                    <th className="px-3 py-3">Statut</th>
                    <th className="px-3 py-3">Total</th>
                    <th className="px-3 py-3">Date</th>
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
                      <td className="px-3 py-3 text-sm font-bold whitespace-nowrap">{orderRef(order)}</td>
                      <td className="px-3 py-3 text-sm">
                        <p className="font-medium">{order.clientName}</p>
                        {order.email && <p className="text-xs text-black/50 truncate max-w-[180px]">{order.email}</p>}
                      </td>
                      <td className="px-3 py-3 text-sm text-black/70 whitespace-nowrap">{order.phone}</td>
                      <td className="px-3 py-3 text-sm text-black/70">
                        {order.wilaya}
                        {order.commune ? ` · ${order.commune}` : ""}
                      </td>
                      <td className="px-3 py-3 text-sm text-black/70">{deliveryLabel(order)}</td>
                      <td className="px-3 py-3 text-sm text-black/70">
                        {(order.paymentMethod || "cod").toUpperCase()}
                        {order.paymentStatus ? ` · ${order.paymentStatus}` : ""}
                      </td>
                      <td className="px-3 py-3">
                        <CrmBadge variant={statusTone[order.status].badge as any}>
                          {orderStatusLabels[order.status]}
                        </CrmBadge>
                      </td>
                      <td className="px-3 py-3 text-sm font-bold whitespace-nowrap">{dzd.format(order.total)}</td>
                      <td className="px-3 py-3 text-sm text-black/60 whitespace-nowrap">{formatDate(order.createdAt)}</td>
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
          <div className="flex gap-3 overflow-x-auto pb-4">
            {orderStatuses.map((status) => {
              const columnOrders = props.orders.filter((order) => order.status === status);
              const columnValue = columnOrders.reduce((sum, order) => sum + order.total, 0);
              return (
                <div key={status} className="w-[260px] shrink-0 rounded-xl border border-black/10 bg-white shadow-sm flex flex-col">
                  <div className="flex items-center justify-between border-b border-black/10 px-3 py-3">
                    <div className="min-w-0">
                      <h2 className="text-sm font-bold truncate">{orderStatusLabels[status]}</h2>
                      <p className="text-xs text-black/55">{dzd.format(columnValue)}</p>
                    </div>
                    <span className="ml-2 flex h-6 min-w-[24px] items-center justify-center rounded-full bg-black px-2 text-xs font-bold text-white">
                      {columnOrders.length}
                    </span>
                  </div>
                  <div className="p-2 space-y-2 overflow-y-auto" style={{ maxHeight: "calc(100vh - 320px)" }}>
                    {columnOrders.length === 0 ? (
                      <p className="text-center text-sm text-black/40 py-8">Aucune commande</p>
                    ) : (
                      columnOrders.map((order) => (
                        <CrmCard
                          key={order.id}
                          onClick={() => {
                            props.onSelect(order.id);
                            setIsDrawerOpen(true);
                          }}
                          className={cx(
                            "!p-3 overflow-hidden border-l-4",
                            statusTone[order.status].border,
                            statusTone[order.status].bg,
                          )}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="font-bold text-xs truncate">{orderRef(order)}</p>
                            <p className="text-xs font-bold shrink-0">{dzd.format(order.total)}</p>
                          </div>
                          <p className="text-sm font-semibold truncate">{order.clientName}</p>
                          <p className="mt-1 text-xs text-black/60 truncate">{order.wilaya}{order.commune ? ` · ${order.commune}` : ""}</p>
                          <p className="text-xs text-black/60 truncate">{order.phone}</p>
                          <p className="mt-2 text-xs text-black/50 line-clamp-2 break-words">{productSummary(order)}</p>
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

      {selectedOrder && (
        <CrmSideDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          title={`Commande ${orderRef(selectedOrder)}`}
          width="640px"
        >
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-xl font-bold">{selectedOrder.clientName}</h3>
                <p className="mt-1 text-sm text-black/60"><Phone className="inline h-4 w-4 mr-1" />{selectedOrder.phone}</p>
                {selectedOrder.email && <p className="text-sm text-black/60"><Mail className="inline h-4 w-4 mr-1" />{selectedOrder.email}</p>}
                <p className="text-sm text-black/60"><MapPin className="inline h-4 w-4 mr-1" />{selectedOrder.wilaya}{selectedOrder.commune ? ` · ${selectedOrder.commune}` : ""}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-2xl font-bold">{dzd.format(selectedOrder.total)}</p>
                <p className="text-sm text-black/50">{formatDate(selectedOrder.createdAt)}</p>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">Statut</label>
              <select
                value={selectedOrder.status}
                onChange={(event) => {
                  const next = event.target.value as OrderStatus;
                  if (next !== selectedOrder.status) {
                    props.onMove(selectedOrder, next);
                  }
                }}
                className="h-11 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold"
              >
                {orderStatuses.map((status) => (
                  <option
                    key={status}
                    value={status}
                    disabled={!canChangeOrderStatus(props.userRoles, selectedOrder.status, status) && status !== selectedOrder.status}
                  >
                    {orderStatusLabels[status]}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-lg border border-black/10 bg-black/[0.02] p-4 space-y-2 text-sm">
              <h4 className="text-sm font-bold uppercase tracking-wider text-black/60">Livraison</h4>
              <p>{deliveryLabel(selectedOrder)}{selectedOrder.deliveryOfficeName ? ` · ${selectedOrder.deliveryOfficeName}` : ""}</p>
              <p>{selectedOrder.addressLine1}</p>
              {selectedOrder.addressLine2 && <p>{selectedOrder.addressLine2}</p>}
              {selectedOrder.trackingNumber && (
                <p className="font-semibold"><Truck className="inline h-4 w-4 mr-1" />{selectedOrder.trackingNumber} ({selectedOrder.carrierStatus || "Yalidine"})</p>
              )}
            </div>

            <div className="rounded-lg border border-black/10 bg-black/[0.02] p-4 space-y-2 text-sm">
              <h4 className="text-sm font-bold uppercase tracking-wider text-black/60">Paiement</h4>
              <p>Méthode: {(selectedOrder.paymentMethod || "cod").toUpperCase()}</p>
              <p>Statut: {selectedOrder.paymentStatus || "-"}</p>
              <p>Sous-total: {dzd.format(selectedOrder.subtotal || 0)}</p>
              <p>Livraison: {dzd.format(selectedOrder.deliveryFee || 0)}</p>
              <p>Remise: {dzd.format(selectedOrder.discount || 0)}</p>
              {selectedOrder.promoCode && <p>Promo: {selectedOrder.promoCode}</p>}
            </div>

            <div className="rounded-lg border border-black/10 bg-black/[0.02] p-4">
              <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-black/60">Produits</h4>
              <div className="space-y-2">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex justify-between gap-3 text-sm">
                    <span className="min-w-0">
                      <span className="font-medium">{item.quantity}x {item.productName}</span>
                      {(item.variantName || item.colorName) && (
                        <span className="block text-xs text-black/50">{[item.variantName, item.colorName].filter(Boolean).join(" · ")}</span>
                      )}
                    </span>
                    <span className="font-bold shrink-0">{dzd.format(item.lineTotal ?? item.unitPrice * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {selectedOrder.notes && (
              <div className="rounded-lg border border-black/10 p-4 text-sm whitespace-pre-wrap">{selectedOrder.notes}</div>
            )}

            <div>
              <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-black/60">Historique</h4>
              <div className="space-y-2 max-h-48 overflow-auto">
                {selectedOrder.history.slice().reverse().map((event) => (
                  <div key={event.id} className="rounded-lg border border-black/5 bg-black/[0.02] p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <p className="font-bold">{orderStatusLabels[event.to]}</p>
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

      <CrmPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} title="Nouvelle commande">
        <form
          onSubmit={(event) => {
            props.onCreateOrder(event);
            setIsPopupOpen(false);
            setContactQuery("");
          }}
          className="space-y-4"
        >
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">Rechercher un client</label>
            <input
              value={contactQuery}
              onChange={(event) => setContactQuery(event.target.value)}
              placeholder="Nom, telephone, email..."
              className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold"
            />
            {matchedContacts.length > 0 && (
              <div className="mt-2 max-h-40 overflow-auto rounded-lg border border-black/10 bg-white">
                {matchedContacts.map((contact) => (
                  <button
                    key={contact.id}
                    type="button"
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-black/[0.04]"
                    onClick={() => {
                      props.setNewOrderName(`${contact.firstName} ${contact.lastName}`.trim());
                      props.setNewOrderPhone(contact.phone);
                      if (contact.wilaya) props.setNewOrderWilaya(contact.wilaya);
                      setContactQuery(`${contact.firstName} ${contact.lastName}`);
                    }}
                  >
                    <span className="font-semibold">{contact.firstName} {contact.lastName}</span>
                    <span className="ml-2 text-black/50">{contact.phone} · {contact.wilaya}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <input value={props.newOrderName} onChange={(event) => props.setNewOrderName(event.target.value)} placeholder="Nom client" className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm" />
          <input value={props.newOrderPhone} onChange={(event) => props.setNewOrderPhone(event.target.value)} placeholder="Téléphone" className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm" />
          <select value={props.newOrderWilaya} onChange={(event) => props.setNewOrderWilaya(event.target.value)} className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm">
            {ALGERIA_WILAYAS.map((wilaya) => (
              <option key={wilaya.code} value={wilaya.name}>{wilaya.code} - {wilaya.name}</option>
            ))}
          </select>
          <select value={props.newOrderProduct} onChange={(event) => props.setNewOrderProduct(event.target.value)} className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm">
            {props.products.filter((product) => product.active).map((product) => (
              <option key={product.id} value={product.id}>{product.name} - {dzd.format(product.price)}</option>
            ))}
          </select>
          <input type="number" min={1} max={99} value={props.newOrderQuantity || 1} onChange={(event) => props.setNewOrderQuantity?.(Number(event.target.value) || 1)} className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm" />
          <div className="flex gap-3 pt-2">
            <CrmButton type="button" variant="ghost" onClick={() => setIsPopupOpen(false)} className="flex-1">Annuler</CrmButton>
            <CrmButton type="submit" disabled={!canCreateOrder(props.userRoles)} className="flex-1">Créer commande</CrmButton>
          </div>
        </form>
      </CrmPopup>
    </div>
  );
}
