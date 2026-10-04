import { FormEvent, useEffect, useMemo, useState } from "react";
import { Printer, FileDown } from "lucide-react";
import { crmDeliveryApi, crmOrdersApi } from "@/lib/api-client";
import { canCreateOrder } from "@/lib/crm/permissions";
import {
  clientTypeLabel,
  deliveryLabel,
  itemPersonalization,
  orderSourceLabels,
  orderSources,
} from "@/lib/crm/order-display";
import { duplicateStatusLabels, duplicateStatuses, orderKindLabels, orderKinds, orderStatusLabels, orderStatuses } from "@/lib/crm/types";
import type {
  ClientType,
  Contact,
  CreateCrmOrderPayload,
  CrmRole,
  DuplicateStatus,
  Order,
  OrderKind,
  OrderSource,
  OrderStatus,
  Product,
  YalidineCenter,
} from "@/lib/crm/types";
import {
  clientTypeTones,
  deliveryTones,
  duplicateStatusTones,
  neutralTone,
  orderKindTones,
  orderStatusTones,
  sourceTones,
} from "@/lib/crm/option-colors";
import { ColorChip, CrmColorSelect } from "./CrmColorSelect";
import { followUpHint, unconfirmedBucket, unconfirmedBucketLabels, type UnconfirmedBucket } from "@/lib/crm/order-followup";
import { orderMatchesQuery } from "@/lib/crm/order-search";
import { clientPhoneError, normalizeClientPhoneInput } from "@/lib/crm/phone";
import { ALGERIA_WILAYAS } from "@/lib/crm/wilayas";
import { printYalidineBordereau, downloadYalidineBordereau } from "@/lib/crm/bordereau";
import {
  CrmButton,
  CrmPanel,
  CrmCard,
  cx,
  dzd,
  formatDate,
  productSummary,
  orderRef,
  CrmAddButton,
  CrmPopup,
  ViewToggle,
  OrderSearchField,
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
  presetBucket?: UnconfirmedBucket;
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
  onOrderUpdated?: (order: Order) => void;
  currentUserId?: string;
  onToast?: (message: string) => void;
}) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [view, setView] = useState<"list" | "kanban">("list");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [contactQuery, setContactQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<OrderSource | "all">("all");
  const [kindFilter, setKindFilter] = useState<OrderKind | "all">("all");
  const [clientTypeFilter, setClientTypeFilter] = useState<ClientType | "all">("all");
  const [deliveryFilter, setDeliveryFilter] = useState<"all" | "home" | "office">("all");
  const [duplicateFilter, setDuplicateFilter] = useState<DuplicateStatus | "all">("all");
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [newOrderName, setNewOrderName] = useState("");
  const [newOrderPhone, setNewOrderPhone] = useState("");
  const [newOrderEmail, setNewOrderEmail] = useState("");
  const [newOrderKind, setNewOrderKind] = useState<OrderKind>("propre");
  const [newOrderNotes, setNewOrderNotes] = useState("");
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
      props.orders.filter((order) => {
        if (!orderMatchesQuery(order, props.query)) return false;
        if (sourceFilter !== "all" && order.source !== sourceFilter) return false;
        if (kindFilter !== "all" && order.orderKind !== kindFilter) return false;
        if (clientTypeFilter !== "all" && order.clientType !== clientTypeFilter) return false;
        if (deliveryFilter !== "all" && order.deliveryType !== deliveryFilter) return false;
        if (duplicateFilter !== "all" && (order.duplicateStatus || "unique") !== duplicateFilter) return false;
        if (props.presetBucket && unconfirmedBucket(order.createdAt, order.status) !== props.presetBucket) {
          return false;
        }
        return true;
      }),
    [props.orders, props.query, props.presetBucket, sourceFilter, kindFilter, clientTypeFilter, deliveryFilter, duplicateFilter],
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
    setNewOrderEmail("");
    setNewOrderKind("propre");
    setNewOrderNotes("");
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
    const phoneError = clientPhoneError(newOrderPhone);
    if (!newOrderName.trim() || phoneError) {
      props.onToast?.(phoneError || "Complete le client et le telephone.");
      return;
    }
    if (!newOrderKind) {
      props.onToast?.("Choisissez le type de commande.");
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
      email: newOrderEmail.trim() || clientLookup?.contact?.email || undefined,
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
      notes: newOrderNotes.trim() || undefined,
      orderKind: newOrderKind,
    });
    setIsPopupOpen(false);
    resetCreateForm();
  }

  return (
    <div className="space-y-6">
      <section className="min-w-0 space-y-4">
        <CrmPanel className="!p-4">
          {props.presetBucket && (
            <div className="mb-4 rounded-lg border border-michket-gold/40 bg-michket-gold/10 px-4 py-3 text-sm">
              <p className="font-bold">{unconfirmedBucketLabels[props.presetBucket]}</p>
              <p className="mt-1 text-black/70">
                {props.presetBucket === "prospection" && "Commandes non confirmees depuis moins de 48 heures. Sans confirmation, elles deviennent prioritaires."}
                {props.presetBucket === "prioritaire" && "Commandes non confirmees depuis plus de 48 heures. Elles restent ici 3 jours, puis passent en archive."}
                {props.presetBucket === "archive" && "Commandes non confirmees depuis plus de 5 jours (48 h + 3 jours)."}
              </p>
            </div>
          )}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <OrderSearchField value={props.query} onChange={props.onQuery} />
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
          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {!props.presetBucket && (
              <CrmColorSelect
                ariaLabel="Filtrer par statut"
                value={props.statusFilter}
                onChange={(value) => props.onStatusFilter(value as OrderStatus | "all")}
                options={[
                  { value: "all", label: "Tous les statuts", tone: neutralTone },
                  ...orderStatuses.map((status) => ({
                    value: status,
                    label: orderStatusLabels[status],
                    tone: orderStatusTones[status],
                  })),
                ]}
              />
            )}
            <select
              value={props.wilayaFilter}
              onChange={(event) => props.onWilayaFilter(event.target.value)}
              className="h-11 w-full rounded-lg border border-black/15 bg-white px-4 text-sm outline-none focus:border-michket-gold"
            >
              <option value="all">Toutes wilayas</option>
              {props.wilayas.map((wilaya) => (
                <option key={wilaya} value={wilaya}>{wilaya}</option>
              ))}
            </select>
            <CrmColorSelect
              ariaLabel="Filtrer par origine"
              value={sourceFilter}
              onChange={(value) => setSourceFilter(value as OrderSource | "all")}
              options={[
                { value: "all", label: "Toutes les origines", tone: neutralTone },
                ...orderSources.map((source) => ({
                  value: source,
                  label: orderSourceLabels[source],
                  tone: sourceTones[source],
                })),
              ]}
            />
            <CrmColorSelect
              ariaLabel="Filtrer par type"
              value={kindFilter}
              onChange={(value) => setKindFilter(value as OrderKind | "all")}
              options={[
                { value: "all", label: "Tous les types", tone: neutralTone },
                ...orderKinds.map((kind) => ({
                  value: kind,
                  label: orderKindLabels[kind],
                  tone: orderKindTones[kind],
                })),
              ]}
            />
            <CrmColorSelect
              ariaLabel="Filtrer par doublon"
              value={duplicateFilter}
              onChange={(value) => setDuplicateFilter(value as DuplicateStatus | "all")}
              options={[
                { value: "all", label: "Tous les doublons", tone: neutralTone },
                ...duplicateStatuses.map((status) => ({
                  value: status,
                  label: duplicateStatusLabels[status],
                  tone: duplicateStatusTones[status],
                })),
              ]}
            />
            <CrmColorSelect
              ariaLabel="Filtrer par type de client"
              value={clientTypeFilter}
              onChange={(value) => setClientTypeFilter(value as ClientType | "all")}
              options={[
                { value: "all", label: "Tous les clients", tone: neutralTone },
                { value: "particulier", label: "Particulier", tone: clientTypeTones.particulier },
                { value: "professionnel", label: "Professionnel", tone: clientTypeTones.professionnel },
              ]}
            />
            <CrmColorSelect
              ariaLabel="Filtrer par livraison"
              value={deliveryFilter}
              onChange={(value) => setDeliveryFilter(value as "all" | "home" | "office")}
              options={[
                { value: "all", label: "Toute livraison", tone: neutralTone },
                { value: "home", label: "Domicile", tone: deliveryTones.home },
                { value: "office", label: "Bureau", tone: deliveryTones.office },
              ]}
            />
          </div>
        </CrmPanel>

        {view === "list" ? (
          <CrmPanel
            title={props.presetBucket ? unconfirmedBucketLabels[props.presetBucket] : "Liste des commandes"}
            actions={
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                Temps réel
              </span>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[2100px]">
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
                    <th className="px-3 py-3">Doublon</th>
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
                          {order.orderKind ? ` · ${orderKindLabels[order.orderKind]}` : ""}
                          {order.status === "pas_confirme" ? ` · ${followUpHint(order.createdAt)}` : ""}
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
                        <ColorChip label={orderStatusLabels[order.status]} tone={orderStatusTones[order.status]} />
                      </td>
                      <td className="px-3 py-3">
                        <ColorChip
                          label={duplicateStatusLabels[order.duplicateStatus || "unique"]}
                          tone={duplicateStatusTones[order.duplicateStatus || "unique"]}
                        />
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
                          <div className="mt-2 flex flex-wrap gap-1">
                            <ColorChip
                              label={duplicateStatusLabels[order.duplicateStatus || "unique"]}
                              tone={duplicateStatusTones[order.duplicateStatus || "unique"]}
                            />
                            {order.orderKind ? (
                              <ColorChip label={orderKindLabels[order.orderKind]} tone={orderKindTones[order.orderKind]} />
                            ) : null}
                          </div>
                          <p className="mt-2 text-xs text-black/55">
                            {orderSourceLabels[order.source] || "Site e-com"} · {clientTypeLabel(order.clientType)}
                            {order.status === "pas_confirme" ? ` · ${followUpHint(order.createdAt)}` : ""}
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
        onOrderUpdated={props.onOrderUpdated}
        currentUserId={props.currentUserId}
        showStatusSelect
      />

      <CrmPopup isOpen={isPopupOpen} onClose={() => { setIsPopupOpen(false); resetCreateForm(); }} title="Nouvelle commande" size="large">
        <form onSubmit={handleCreateSubmit} className="space-y-5">
          <section className="space-y-3 rounded-lg border border-black/10 p-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-black/60">Commande</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">Origine</label>
                <CrmColorSelect
                  ariaLabel="Origine de la commande"
                  value={newOrderSource}
                  onChange={(value) => setNewOrderSource(value as OrderSource)}
                  options={orderSources.map((source) => ({
                    value: source,
                    label: orderSourceLabels[source],
                    tone: sourceTones[source],
                  }))}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">Type de commande</label>
                <CrmColorSelect
                  ariaLabel="Type de commande"
                  value={newOrderKind}
                  onChange={(value) => setNewOrderKind(value as OrderKind)}
                  options={orderKinds.map((kind) => ({
                    value: kind,
                    label: orderKindLabels[kind],
                    tone: orderKindTones[kind],
                  }))}
                />
              </div>
            </div>
          </section>
          <section className="space-y-3 rounded-lg border border-black/10 p-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-black/60">Client</h3>
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
                      setNewOrderPhone(normalizeClientPhoneInput(contact.phone));
                      setNewOrderEmail(contact.email || "");
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
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={newOrderName} onChange={(event) => setNewOrderName(event.target.value)} placeholder="Nom client" required className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm" />
            <div>
              <input
                value={newOrderPhone}
                onChange={(event) => setNewOrderPhone(normalizeClientPhoneInput(event.target.value))}
                placeholder="Telephone (0XXXXXXXXX)"
                inputMode="numeric"
                maxLength={10}
                required
                className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm"
              />
              <p className="mt-1 text-xs text-black/45">Obligatoire, commence par 0, 10 chiffres maximum.</p>
            </div>
          </div>
          <input
            type="email"
            value={newOrderEmail}
            onChange={(event) => setNewOrderEmail(event.target.value)}
            placeholder="Email"
            className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm"
          />
          {clientLookup && (
            <p className={`rounded-lg px-3 py-2 text-sm ${clientLookup.exists ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>
              {clientLookup.exists
                ? `Client existant${clientLookup.contact ? ` · ${clientTypeLabel(clientLookup.contact.type)}` : ""} · ${clientLookup.previousOrderCount} commande${clientLookup.previousOrderCount > 1 ? "s" : ""}. La commande sera marquée doublant à vérifier.`
                : "Nouveau client. Ce numéro n'a pas encore de commande."}
            </p>
          )}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">Type client</label>
            <CrmColorSelect
              ariaLabel="Type de client"
              value={newOrderClientType}
              disabled={Boolean(clientLookup?.contact)}
              onChange={(value) => setNewOrderClientType(value as ClientType)}
              options={[
                { value: "particulier", label: "Particulier", tone: clientTypeTones.particulier },
                { value: "professionnel", label: "Professionnel", tone: clientTypeTones.professionnel },
              ]}
            />
          </div>
          </section>
          <section className="space-y-3 rounded-lg border border-black/10 p-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-black/60">Livraison</h3>
          <select value={newOrderWilaya} onChange={(event) => setNewOrderWilaya(event.target.value)} className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm">
            {ALGERIA_WILAYAS.map((wilaya) => (
              <option key={wilaya.code} value={wilaya.name}>{wilaya.code} - {wilaya.name}</option>
            ))}
          </select>
          <input value={newOrderCommune} onChange={(event) => setNewOrderCommune(event.target.value)} placeholder="Commune" className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm" />
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">Livraison</label>
            <CrmColorSelect
              ariaLabel="Mode de livraison"
              value={newOrderDelivery}
              onChange={(value) => {
                const next = value as "home" | "office";
                setNewOrderDelivery(next);
                if (next === "home") {
                  setNewOrderOffice("");
                  setNewOrderOfficeId("");
                }
              }}
              options={[
                { value: "home", label: "Domicile", tone: deliveryTones.home },
                { value: "office", label: "Bureau", tone: deliveryTones.office },
              ]}
            />
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
          </section>
          <section className="space-y-3 rounded-lg border border-black/10 p-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-black/60">Produit</h3>
          <select value={newOrderProduct} onChange={(event) => setNewOrderProduct(event.target.value)} className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm">
            {activeProducts.map((product) => (
              <option key={product.id} value={product.id}>{product.name} - {dzd.format(product.price)}</option>
            ))}
          </select>
          {productVariants.length > 0 && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">Couleur</label>
              <CrmColorSelect
                ariaLabel="Couleur"
                value={newOrderVariant}
                onChange={setNewOrderVariant}
                options={productVariants.map((variant) => ({
                  value: variant.id,
                  label: variant.colorName || variant.name,
                  tone: neutralTone,
                  dotColor: variant.colorHex || undefined,
                }))}
              />
            </div>
          )}
          <textarea
            value={newOrderText}
            onChange={(event) => setNewOrderText(event.target.value)}
            placeholder="Texte à graver sur le trophée"
            rows={3}
            className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">Quantite</label>
              <input type="number" min={1} max={99} value={newOrderQuantity} onChange={(event) => setNewOrderQuantity(Number(event.target.value) || 1)} className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm" />
            </div>
          </div>
          <textarea
            value={newOrderNotes}
            onChange={(event) => setNewOrderNotes(event.target.value)}
            placeholder="Notes internes"
            rows={2}
            className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm"
          />
          </section>
          <div className="flex gap-3 pt-2">
            <CrmButton type="button" variant="ghost" onClick={() => { setIsPopupOpen(false); resetCreateForm(); }} className="flex-1">Annuler</CrmButton>
            <CrmButton type="submit" disabled={!canCreateOrder(props.userRoles)} className="flex-1">Créer commande</CrmButton>
          </div>
        </form>
      </CrmPopup>
    </div>
  );
}
