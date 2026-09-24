import { FormEvent, useEffect, useMemo, useState } from "react";
import { Search, Printer, FileDown } from "lucide-react";
import { crmDeliveryApi, crmOrdersApi } from "@/lib/api-client";
import { canCreateOrder } from "@/lib/crm/permissions";
import {
  clientTypeLabel,
  deliveryLabel,
  itemPersonalization,
  orderSourceLabels,
  orderSources,
} from "@/lib/crm/order-display";
import { orderStatusLabels, orderStatuses } from "@/lib/crm/types";
import type {
  ClientType,
  Contact,
  CreateCrmOrderPayload,
  CrmRole,
  Order,
  OrderSource,
  OrderStatus,
  Product,
  YalidineCenter,
} from "@/lib/crm/types";
import { ALGERIA_WILAYAS } from "@/lib/crm/wilayas";
import { printYalidineBordereau, downloadYalidineBordereau } from "@/lib/crm/bordereau";
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
} from "./CrmUi";
import { CrmOrderDetailsDrawer } from "./CrmOrderDetailsDrawer";

const statusTone: Record<OrderStatus, { border: string; bg: string; badge: string }> = {
  pas_confirme: { border: "border-l-stone-400", bg: "bg-stone-50", badge: "default" },
  confirme: { border: "border-l-emerald-500", bg: "bg-emerald-50", badge: "success" },
  en_fabrication: { border: "border-l-cyan-500", bg: "bg-cyan-50", badge: "info" },
  en_preparation: { border: "border-l-amber-500", bg: "bg-amber-50", badge: "warning" },
  en_livraison: { border: "border-l-indigo-500", bg: "bg-indigo-50", badge: "info" },
  livre: { border: "border-l-green-600", bg: "bg-green-50", badge: "success" },
  retour_echec: { border: "border-l-rose-500", bg: "bg-rose-50", badge: "danger" },
  annulee: { border: "border-l-zinc-500", bg: "bg-zinc-100", badge: "default" },
};

export function CrmOrders(props: {
  orders: Order[];
  selectedOrder?: Order;
  query: string;
  statusFilter: OrderStatus | "all";
  wilayaFilter: string;
  wilayas: string[];
  userRoles: CrmRole[];
  products: Product[];
  contacts?: Contact[];
  onQuery: (value: string) => void;
  onStatusFilter: (value: OrderStatus | "all") => void;
  onWilayaFilter: (value: string) => void;
  onSelect: (id: string) => void;
  onMove: (order: Order, to: OrderStatus, note?: string) => void;
  onCreateOrder: (payload: CreateCrmOrderPayload) => void;
  onCreateParcel?: (order: Order) => void;
  onSyncParcel?: (order: Order) => void;
  onToast?: (message: string) => void;
}) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [view, setView] = useState<"list" | "kanban">("list");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [contactQuery, setContactQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<OrderSource | "all">("all");
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [newOrderName, setNewOrderName] = useState("");
  const [newOrderPhone, setNewOrderPhone] = useState("");
  const [newOrderWilaya, setNewOrderWilaya] = useState("Alger");
  const [newOrderCommune, setNewOrderCommune] = useState("");
  const [newOrderProduct, setNewOrderProduct] = useState("");
  const [newOrderVariant, setNewOrderVariant] = useState("");
  const [newOrderQuantity, setNewOrderQuantity] = useState(1);
  const [newOrderSource, setNewOrderSource] = useState<OrderSource>("whatsapp");
  const [newOrderDelivery, setNewOrderDelivery] = useState<"home" | "office">("home");
  const [newOrderAddress, setNewOrderAddress] = useState("");
  const [newOrderOffice, setNewOrderOffice] = useState("");
  const [newOrderOfficeId, setNewOrderOfficeId] = useState("");
  const [yalidineCenters, setYalidineCenters] = useState<YalidineCenter[]>([]);
  const [newOrderText, setNewOrderText] = useState("");
  const [newOrderClientType, setNewOrderClientType] = useState<ClientType>("particulier");
  const [newOrderContactId, setNewOrderContactId] = useState("");
  const [clientLookup, setClientLookup] = useState<{
    exists: boolean;
    previousOrderCount: number;
    contact: Contact | null;
  } | null>(null);
  const selectedOrder = props.selectedOrder;
  const canExportBordereau = (order?: Order) =>
    Boolean(order && order.status !== "pas_confirme" && order.status !== "annulee");

  async function handleDownloadBordereau(order: Order) {
    try {
      setBusyAction(`pdf:${order.id}`);
      await downloadYalidineBordereau(order.id, orderRef(order));
      props.onToast?.("Bordereau Yalidine telecharge");
    } catch (error) {
      props.onToast?.(error instanceof Error ? error.message : "Erreur bordereau Yalidine");
    } finally {
      setBusyAction(null);
    }
  }

  function BordereauButtons({
    order,
    compact = false,
  }: {
    order: Order;
    compact?: boolean;
  }) {
    if (!canExportBordereau(order)) {
      return null;
    }
    const downloading = busyAction === `pdf:${order.id}`;
    return (
      <div
        className={compact ? "flex items-center justify-end gap-1" : "grid grid-cols-2 gap-2"}
        onClick={(event) => event.stopPropagation()}
      >
        <CrmButton
          size="sm"
          variant="ghost"
          disabled={downloading}
          onClick={(event) => {
            event.stopPropagation();
            void handleDownloadBordereau(order);
          }}
        >
          <FileDown className="h-4 w-4 mr-1 inline" />
          {downloading ? "..." : compact ? "PDF" : "Telecharger"}
        </CrmButton>
        <CrmButton
          size="sm"
          variant="ghost"
          onClick={(event) => {
            event.stopPropagation();
            void handlePrintBordereau(order);
          }}
        >
          <Printer className="h-4 w-4 mr-1 inline" />
          Imprimer
        </CrmButton>
      </div>
    );
  }

  async function handlePrintBordereau(order: Order) {
    try {
      setBusyAction(`print:${order.id}`);
      await printYalidineBordereau(order.id);
    } catch (error) {
      props.onToast?.(error instanceof Error ? error.message : "Impression Yalidine impossible");
    } finally {
      setBusyAction(null);
    }
  }
  const matchedContacts = (props.contacts || []).filter((contact) => {
    const haystack = `${contact.firstName} ${contact.lastName} ${contact.phone} ${contact.email || ""}`.toLowerCase();
    return contactQuery.trim().length > 0 && haystack.includes(contactQuery.toLowerCase());
  }).slice(0, 8);

  const activeProducts = props.products.filter((product) => product.active);
  const selectedProduct = activeProducts.find((product) => product.id === newOrderProduct);
  const productVariants = selectedProduct?.variants || [];

  const visibleOrders = useMemo(
    () =>
      sourceFilter === "all"
        ? props.orders
        : props.orders.filter((order) => order.source === sourceFilter),
    [props.orders, sourceFilter],
  );

  useEffect(() => {
    if (!newOrderProduct && activeProducts.length > 0) {
      setNewOrderProduct(activeProducts[0].id);
    }
  }, [activeProducts, newOrderProduct]);

  useEffect(() => {
    const variants = props.products.find((product) => product.id === newOrderProduct)?.variants || [];
    if (variants.length === 0) {
      setNewOrderVariant("");
      return;
    }
    if (!variants.some((variant) => variant.id === newOrderVariant)) {
      setNewOrderVariant(variants[0].id);
    }
  }, [newOrderProduct, newOrderVariant, props.products]);

  useEffect(() => {
    if (!isPopupOpen || newOrderDelivery !== "office") {
      return;
    }
    const wilaya = ALGERIA_WILAYAS.find((item) => item.name === newOrderWilaya);
    if (!wilaya) {
      return;
    }
    let cancelled = false;
    crmDeliveryApi
      .listCenters(wilaya.code)
      .then((rows) => {
        if (!cancelled) {
          setYalidineCenters(rows);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setYalidineCenters([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isPopupOpen, newOrderDelivery, newOrderWilaya]);

  useEffect(() => {
    const phone = newOrderPhone.trim();
    if (phone.replace(/\D/g, "").length < 8) {
      setClientLookup(null);
      return;
    }
    const timer = setTimeout(() => {
      void crmOrdersApi
        .lookupClient(phone)
        .then((result) => {
          setClientLookup(result);
          if (result.contact) {
            setNewOrderContactId(result.contact.id);
            setNewOrderClientType(result.contact.type);
            setNewOrderName((current) =>
              current.trim()
                ? current
                : `${result.contact!.firstName} ${result.contact!.lastName}`.trim(),
            );
            if (result.contact.wilaya) {
              setNewOrderWilaya(result.contact.wilaya);
            }
          } else {
            setNewOrderContactId("");
          }
        })
        .catch(() => setClientLookup(null));
    }, 400);
    return () => clearTimeout(timer);
  }, [newOrderPhone]);

  function resetCreateForm() {
    setContactQuery("");
    setNewOrderName("");
    setNewOrderPhone("");
    setNewOrderCommune("");
    setNewOrderAddress("");
    setNewOrderOffice("");
    setNewOrderOfficeId("");
    setYalidineCenters([]);
    setNewOrderText("");
    setNewOrderQuantity(1);
    setNewOrderSource("whatsapp");
    setNewOrderDelivery("home");
    setNewOrderClientType("particulier");
    setNewOrderContactId("");
    setClientLookup(null);
  }

  function handleCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newOrderName.trim() || !newOrderPhone.trim()) {
      props.onToast?.("Complete le client et le telephone.");
      return;
    }
    if (newOrderDelivery === "home" && !newOrderAddress.trim()) {
      props.onToast?.("Adresse exacte obligatoire pour une livraison a domicile.");
      return;
    }
    const [firstName, ...rest] = newOrderName.trim().split(" ");
    const wilaya = ALGERIA_WILAYAS.find((item) => item.name === newOrderWilaya);
    const variant = productVariants.find((item) => item.id === newOrderVariant);
    props.onCreateOrder({
      firstName,
      lastName: rest.join(" "),
      phone: newOrderPhone,
      email: clientLookup?.contact?.email || undefined,
      wilayaName: newOrderWilaya,
      wilayaCode: wilaya?.code,
      commune: newOrderCommune || undefined,
      addressLine1: newOrderDelivery === "home" ? newOrderAddress : newOrderOffice || undefined,
      source: newOrderSource,
      deliveryType: newOrderDelivery,
      deliveryOfficeName: newOrderDelivery === "office" ? newOrderOffice || undefined : undefined,
      deliveryOfficeId: newOrderDelivery === "office" ? newOrderOfficeId || undefined : undefined,
      clientType: newOrderClientType,
      contactId: newOrderContactId || undefined,
      productId: newOrderProduct || undefined,
      variantId: newOrderVariant || undefined,
      colorName: variant?.colorName || variant?.name,
      personalizationText: newOrderText || undefined,
      quantity: newOrderQuantity || 1,
    });
    setIsPopupOpen(false);
    resetCreateForm();
  }

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
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
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
            <select
              value={sourceFilter}
              onChange={(event) => setSourceFilter(event.target.value as OrderSource | "all")}
              className="h-11 w-full rounded-lg border border-black/15 px-4 text-sm outline-none focus:border-michket-gold"
            >
              <option value="all">Toutes origines</option>
              {orderSources.map((source) => (
                <option key={source} value={source}>{orderSourceLabels[source]}</option>
              ))}
            </select>
          </div>
        </CrmPanel>

        {view === "list" ? (
          <CrmPanel
            title="Liste des commandes"
            actions={
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                Temps réel
              </span>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1860px]">
                <thead>
                  <tr className="border-b border-black/10 text-left text-xs font-semibold uppercase tracking-wider text-black/60">
                    <th className="px-3 py-3">Référence</th>
                    <th className="px-3 py-3">Origine</th>
                    <th className="px-3 py-3">Client</th>
                    <th className="px-3 py-3">Téléphone</th>
                    <th className="px-3 py-3">Type</th>
                    <th className="px-3 py-3">Wilaya / commune</th>
                    <th className="px-3 py-3">Livraison</th>
                    <th className="px-3 py-3">Produit</th>
                    <th className="px-3 py-3">Suivi Yalidine</th>
                    <th className="px-3 py-3">Statut</th>
                    <th className="px-3 py-3">Total</th>
                    <th className="px-3 py-3">Date</th>
                    <th className="px-3 py-3">Bordereau</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleOrders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => {
                        props.onSelect(order.id);
                        setIsDrawerOpen(true);
                      }}
                      className="border-b border-black/5 cursor-pointer transition hover:bg-black/[0.02]"
                    >
                      <td className="px-3 py-3 text-sm font-bold whitespace-nowrap">{orderRef(order)}</td>
                      <td className="px-3 py-3 text-sm whitespace-nowrap">
                        {orderSourceLabels[order.source] || "Site e-com"}
                      </td>
                      <td className="px-3 py-3 text-sm">
                        <p className="font-medium">{order.clientName}</p>
                        <p className="text-xs text-black/50">
                          {order.isExistingClient ? "Client existant" : "Nouveau client"}
                        </p>
                      </td>
                      <td className="px-3 py-3 text-sm text-black/70 whitespace-nowrap">{order.phone}</td>
                      <td className="px-3 py-3 text-sm text-black/70 whitespace-nowrap">
                        {clientTypeLabel(order.clientType)}
                      </td>
                      <td className="px-3 py-3 text-sm text-black/70">
                        {order.wilaya}
                        {order.commune ? ` · ${order.commune}` : ""}
                      </td>
                      <td className="px-3 py-3 text-sm text-black/70">
                        <p>{deliveryLabel(order)}</p>
                        {order.deliveryType !== "office" && order.addressLine1 && (
                          <p className="text-xs text-black/50 truncate max-w-[180px]">{order.addressLine1}</p>
                        )}
                      </td>
                      <td className="px-3 py-3 text-sm text-black/70">
                        <p className="truncate max-w-[220px]">{productSummary(order)}</p>
                        {order.items.some((item) => item.colorName || itemPersonalization(item)) && (
                          <p className="text-xs text-black/50 truncate max-w-[220px]">
                            {order.items
                              .map((item) => [item.colorName, itemPersonalization(item)].filter(Boolean).join(" · "))
                              .filter(Boolean)
                              .join(" | ")}
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-3 text-sm text-black/70">
                        <p className="font-medium truncate max-w-[160px]">{order.trackingNumber || "—"}</p>
                        {order.yalidineStatus && (
                          <p className="text-xs text-black/50 truncate max-w-[160px]">{order.yalidineStatus}</p>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <CrmBadge variant={statusTone[order.status].badge as any}>
                          {orderStatusLabels[order.status]}
                        </CrmBadge>
                      </td>
                      <td className="px-3 py-3 text-sm font-bold whitespace-nowrap">{dzd.format(order.total)}</td>
                      <td className="px-3 py-3 text-sm text-black/60 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                      <td className="px-3 py-3">
                        <BordereauButtons order={order} compact />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {visibleOrders.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-lg font-semibold text-black/40">Aucune commande</p>
                </div>
              )}
            </div>
          </CrmPanel>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-4">
            {orderStatuses.map((status) => {
              const columnOrders = visibleOrders.filter((order) => order.status === status);
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
                          <p className="text-xs text-black/55">
                            {orderSourceLabels[order.source] || "Site e-com"} · {clientTypeLabel(order.clientType)}
                          </p>
                          <p className="mt-1 text-xs text-black/60 truncate">{order.wilaya}{order.commune ? ` · ${order.commune}` : ""}</p>
                          <p className="text-xs text-black/60 truncate">{order.phone}</p>
                          <p className="mt-2 text-xs text-black/50 line-clamp-2 break-words">{productSummary(order)}</p>
                          {order.trackingNumber && (
                            <p className="mt-1 text-xs text-black/50 truncate">
                              {order.trackingNumber}
                              {order.yalidineStatus ? ` · ${order.yalidineStatus}` : ""}
                            </p>
                          )}
                          <div className="mt-2">
                            <BordereauButtons order={order} compact />
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

      <CrmOrderDetailsDrawer
        order={selectedOrder}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        userRoles={props.userRoles}
        onMove={props.onMove}
        onCreateParcel={props.onCreateParcel}
        onSyncParcel={props.onSyncParcel}
        onToast={props.onToast}
        showStatusSelect
      />

      <CrmPopup isOpen={isPopupOpen} onClose={() => { setIsPopupOpen(false); resetCreateForm(); }} title="Nouvelle commande" size="large">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">Origine</label>
            <select
              value={newOrderSource}
              onChange={(event) => setNewOrderSource(event.target.value as OrderSource)}
              className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm"
            >
              <option value="whatsapp">WhatsApp</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="ecom">Site e-com</option>
            </select>
          </div>
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
                      setNewOrderName(`${contact.firstName} ${contact.lastName}`.trim());
                      setNewOrderPhone(contact.phone);
                      setNewOrderContactId(contact.id);
                      setNewOrderClientType(contact.type);
                      if (contact.wilaya) setNewOrderWilaya(contact.wilaya);
                      setContactQuery(`${contact.firstName} ${contact.lastName}`);
                    }}
                  >
                    <span className="font-semibold">{contact.firstName} {contact.lastName}</span>
                    <span className="ml-2 text-black/50">{contact.phone} · {contact.wilaya} · {clientTypeLabel(contact.type)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <input value={newOrderName} onChange={(event) => setNewOrderName(event.target.value)} placeholder="Nom client" className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm" />
          <input value={newOrderPhone} onChange={(event) => setNewOrderPhone(event.target.value)} placeholder="Téléphone" className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm" />
          {clientLookup && (
            <p className={`rounded-lg px-3 py-2 text-sm ${clientLookup.exists ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>
              {clientLookup.exists
                ? `Client existant${clientLookup.contact ? ` · ${clientTypeLabel(clientLookup.contact.type)}` : ""} · ${clientLookup.previousOrderCount} commande(s)`
                : "Nouveau client — ce numero n'a pas encore commande"}
            </p>
          )}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">Type client</label>
            <select
              value={newOrderClientType}
              onChange={(event) => setNewOrderClientType(event.target.value as ClientType)}
              disabled={Boolean(clientLookup?.contact)}
              className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm"
            >
              <option value="particulier">Particulier</option>
              <option value="professionnel">Professionnel</option>
            </select>
          </div>
          <select value={newOrderWilaya} onChange={(event) => setNewOrderWilaya(event.target.value)} className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm">
            {ALGERIA_WILAYAS.map((wilaya) => (
              <option key={wilaya.code} value={wilaya.name}>{wilaya.code} - {wilaya.name}</option>
            ))}
          </select>
          <input value={newOrderCommune} onChange={(event) => setNewOrderCommune(event.target.value)} placeholder="Commune" className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm" />
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">Livraison</label>
            <select
              value={newOrderDelivery}
              onChange={(event) => {
                const next = event.target.value as "home" | "office";
                setNewOrderDelivery(next);
                if (next === "home") {
                  setNewOrderOffice("");
                  setNewOrderOfficeId("");
                }
              }}
              className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm"
            >
              <option value="home">Domicile</option>
              <option value="office">Bureau</option>
            </select>
          </div>
          {newOrderDelivery === "home" ? (
            <input
              value={newOrderAddress}
              onChange={(event) => setNewOrderAddress(event.target.value)}
              placeholder="Adresse exacte du client"
              required
              className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm"
            />
          ) : yalidineCenters.length > 0 ? (
            <select
              value={newOrderOfficeId}
              onChange={(event) => {
                const id = event.target.value;
                setNewOrderOfficeId(id);
                const center = yalidineCenters.find((item) => String(item.centerId) === id);
                setNewOrderOffice(center?.name || "");
              }}
              className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm"
            >
              <option value="">Choisir un bureau Yalidine</option>
              {yalidineCenters.map((center) => (
                <option key={center.centerId} value={String(center.centerId)}>
                  {center.name}
                  {center.commune ? ` · ${center.commune}` : ""}
                </option>
              ))}
            </select>
          ) : (
            <input
              value={newOrderOffice}
              onChange={(event) => setNewOrderOffice(event.target.value)}
              placeholder="Bureau Yalidine (nom du centre)"
              className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm"
            />
          )}
          <select value={newOrderProduct} onChange={(event) => setNewOrderProduct(event.target.value)} className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm">
            {activeProducts.map((product) => (
              <option key={product.id} value={product.id}>{product.name} - {dzd.format(product.price)}</option>
            ))}
          </select>
          {productVariants.length > 0 && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">Couleur</label>
              <select
                value={newOrderVariant}
                onChange={(event) => setNewOrderVariant(event.target.value)}
                className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm"
              >
                {productVariants.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.colorName || variant.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <textarea
            value={newOrderText}
            onChange={(event) => setNewOrderText(event.target.value)}
            placeholder="Texte a graver sur le trophee"
            rows={3}
            className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm"
          />
          <input type="number" min={1} max={99} value={newOrderQuantity} onChange={(event) => setNewOrderQuantity(Number(event.target.value) || 1)} className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm" />
          <div className="flex gap-3 pt-2">
            <CrmButton type="button" variant="ghost" onClick={() => { setIsPopupOpen(false); resetCreateForm(); }} className="flex-1">Annuler</CrmButton>
            <CrmButton type="submit" disabled={!canCreateOrder(props.userRoles)} className="flex-1">Créer commande</CrmButton>
          </div>
        </form>
      </CrmPopup>
    </div>
  );
}
