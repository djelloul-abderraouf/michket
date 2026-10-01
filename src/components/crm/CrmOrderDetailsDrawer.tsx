import { useEffect, useState, type ReactNode } from "react";
import { Phone, MapPin, User, Mail, Truck, Printer, FileDown, RefreshCw, Trash2, ExternalLink } from "lucide-react";
import {
  canChangeOrderStatus,
  canEditClientPhone,
  canLogContactAttempt,
  canManageRemarks,
  canSetOrderKind,
} from "@/lib/crm/permissions";
import { clientTypeLabel, deliveryLabel, itemPersonalization, orderSourceLabels } from "@/lib/crm/order-display";
import { clientPhoneError, normalizeClientPhoneInput } from "@/lib/crm/phone";
import { orderKindLabels, orderKinds, orderStatusLabels, orderStatuses } from "@/lib/crm/types";
import type { CrmRole, Order, OrderKind, OrderStatus } from "@/lib/crm/types";
import { printYalidineBordereau, downloadYalidineBordereau } from "@/lib/crm/bordereau";
import { crmDeliveryApi, crmOrdersApi } from "@/lib/api-client";
import {
  CrmButton,
  CrmSideDrawer,
  dzd,
  formatDate,
  orderRef,
} from "./CrmUi";

const fieldClass =
  "h-10 w-full rounded-lg border border-black/15 bg-white px-3 text-sm outline-none focus:border-michket-gold";

function canExportBordereau(order?: Order) {
  return Boolean(order && order.status !== "pas_confirme" && order.status !== "annulee");
}

function storefrontHref(path: string) {
  const base = (process.env.NEXT_PUBLIC_ECOMMERCE_MICHKET_URL || "").replace(/\/$/, "");
  return `${base}${path}`;
}

function productPageHref(slug?: string | null) {
  const value = slug?.trim();
  if (!value || value === "commande-crm") {
    return null;
  }
  return storefrontHref(`/produits/${encodeURIComponent(value)}`);
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-black/10 bg-black/[0.02] p-4 space-y-3">
      <h4 className="text-xs font-bold uppercase tracking-wider text-black/55">{title}</h4>
      {children}
    </section>
  );
}

export function CrmOrderDetailsDrawer({
  order,
  isOpen,
  onClose,
  userRoles,
  currentUserId,
  onMove,
  onCreateParcel,
  onSyncParcel,
  onOrderUpdated,
  onToast,
  showStatusSelect = false,
  children,
}: {
  order?: Order;
  isOpen: boolean;
  onClose: () => void;
  userRoles?: CrmRole[];
  currentUserId?: string;
  onMove?: (order: Order, to: OrderStatus, note?: string) => void;
  onCreateParcel?: (order: Order) => void;
  onSyncParcel?: (order: Order) => void;
  onOrderUpdated?: (order: Order) => void;
  onToast?: (message: string) => void;
  showStatusSelect?: boolean;
  children?: ReactNode;
}) {
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [phoneDraft, setPhoneDraft] = useState("");
  const [remark, setRemark] = useState("");
  const [attemptNote, setAttemptNote] = useState("");
  const roles = userRoles || [];
  const attempts = order?.contactAttempts || [];
  const remarks = order?.remarks || [];

  useEffect(() => {
    setPhoneDraft(order?.phone || "");
    setRemark("");
    setAttemptNote("");
  }, [order?.id, order?.phone]);

  async function run(action: string, task: () => Promise<Order>, success: string) {
    try {
      setBusyAction(action);
      const updated = await task();
      onOrderUpdated?.(updated);
      onToast?.(success);
      return true;
    } catch (error) {
      onToast?.(error instanceof Error ? error.message : "Action impossible");
      return false;
    } finally {
      setBusyAction(null);
    }
  }

  async function handleDownloadBordereau(target: Order) {
    try {
      setBusyAction(`pdf:${target.id}`);
      await downloadYalidineBordereau(target.id, orderRef(target));
      onToast?.("Bordereau Yalidine telecharge");
    } catch (error) {
      onToast?.(error instanceof Error ? error.message : "Erreur bordereau Yalidine");
    } finally {
      setBusyAction(null);
    }
  }

  async function handlePrintBordereau(target: Order) {
    try {
      setBusyAction(`print:${target.id}`);
      await printYalidineBordereau(target.id);
    } catch (error) {
      onToast?.(error instanceof Error ? error.message : "Impression Yalidine impossible");
    } finally {
      setBusyAction(null);
    }
  }

  async function handleYalidineLabel(target: Order) {
    try {
      setBusyAction("label");
      const result = await crmDeliveryApi.getLabel(target.id);
      window.open(result.url, "_blank", "noopener,noreferrer");
    } catch (error) {
      onToast?.(error instanceof Error ? error.message : "Etiquette Yalidine indisponible");
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <CrmSideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={order ? `Commande ${orderRef(order)}` : "Commande"}
      width="760px"
    >
      {order ? (
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-black/45">
                {order.reference || orderRef(order)}
              </p>
              <h3 className="text-xl font-bold">{order.clientName}</h3>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-black/50">
                {orderSourceLabels[order.source] || "Site e-com"}
                {" · "}
                {clientTypeLabel(order.clientType)}
                {order.orderKind ? ` · ${orderKindLabels[order.orderKind]}` : ""}
                {" · "}
                {order.isExistingClient
                  ? `Client existant (${order.previousOrderCount || 1})`
                  : "Nouveau client"}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-bold">{dzd.format(order.total)}</p>
              <p className="text-sm text-black/50">{formatDate(order.createdAt)}</p>
            </div>
          </div>

          {(order.campaignSlug || order.items.some((item) => productPageHref(item.productSlug))) && (
            <Section title="Liens">
              {order.campaignSlug ? (
                <a
                  href={storefrontHref(`/campagne/${encodeURIComponent(order.campaignSlug)}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-michket-gold underline underline-offset-2"
                >
                  Campagne{order.campaignTitle ? ` · ${order.campaignTitle}` : ""}
                  <ExternalLink size={14} />
                </a>
              ) : null}
              <div className="flex flex-col gap-1.5">
                {order.items.map((item, index) => {
                  const href = productPageHref(item.productSlug);
                  if (!href) {
                    return null;
                  }
                  return (
                    <a
                      key={`${item.productId}-${index}`}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-michket-gold underline underline-offset-2"
                    >
                      Produit · {item.productName}
                      <ExternalLink size={14} />
                    </a>
                  );
                })}
              </div>
            </Section>
          )}

          <Section title="Statut et type">
            {showStatusSelect && onMove ? (
              <select
                value={order.status}
                onChange={(event) => {
                  const next = event.target.value as OrderStatus;
                  if (next !== order.status) {
                    onMove(order, next);
                  }
                }}
                className={fieldClass}
              >
                {orderStatuses.map((status) => (
                  <option
                    key={status}
                    value={status}
                    disabled={!canChangeOrderStatus(roles, order.status, status) && status !== order.status}
                  >
                    {orderStatusLabels[status]}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm font-bold">{orderStatusLabels[order.status] || order.status}</p>
            )}
            {canSetOrderKind(roles) ? (
              <select
                value={order.orderKind || ""}
                onChange={(event) => {
                  const next = event.target.value as OrderKind;
                  if (next && next !== order.orderKind) {
                    void run("kind", () => crmOrdersApi.updateKind(order.id, next), "Type de commande mis a jour.");
                  }
                }}
                className={fieldClass}
              >
                <option value="" disabled>
                  Type de commande
                </option>
                {orderKinds.map((kind) => (
                  <option key={kind} value={kind}>
                    {orderKindLabels[kind]}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm">
                Type: {order.orderKind ? orderKindLabels[order.orderKind] : "Non renseigne"}
              </p>
            )}
          </Section>

          <Section title="Client">
            <p className="text-sm font-semibold">
              <User className="mr-1 inline h-4 w-4" />
              {order.clientName}
            </p>
            {order.email && (
              <p className="text-sm text-black/70">
                <Mail className="mr-1 inline h-4 w-4" />
                {order.email}
              </p>
            )}
            {canEditClientPhone(roles) ? (
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-black/50">
                  Telephone
                </label>
                <input
                  value={phoneDraft}
                  inputMode="numeric"
                  maxLength={10}
                  required
                  onChange={(event) => setPhoneDraft(normalizeClientPhoneInput(event.target.value))}
                  className={fieldClass}
                />
                <p className="text-xs text-black/45">Obligatoire, commence par 0, 10 chiffres.</p>
                <CrmButton
                  size="sm"
                  disabled={busyAction === "phone" || Boolean(clientPhoneError(phoneDraft)) || phoneDraft === order.phone}
                  onClick={() => {
                    const error = clientPhoneError(phoneDraft);
                    if (error) {
                      onToast?.(error);
                      return;
                    }
                    void run("phone", () => crmOrdersApi.updatePhone(order.id, phoneDraft), "Numero client mis a jour.");
                  }}
                >
                  <Phone className="h-4 w-4" />
                  Enregistrer le numero
                </CrmButton>
              </div>
            ) : (
              <p className="text-sm text-black/70">
                <Phone className="mr-1 inline h-4 w-4" />
                {order.phone}
              </p>
            )}
          </Section>

          <Section title="Livraison">
            <p className="text-sm">
              <MapPin className="mr-1 inline h-4 w-4" />
              {order.wilaya}
              {order.commune ? ` · ${order.commune}` : ""}
            </p>
            <p className="text-sm">
              {deliveryLabel(order)}
              {order.deliveryOfficeName ? ` · ${order.deliveryOfficeName}` : ""}
            </p>
            {order.addressLine1 && <p className="text-sm">{order.addressLine1}</p>}
            {order.addressLine2 && <p className="text-sm">{order.addressLine2}</p>}
            {order.trackingNumber && (
              <p className="text-sm font-semibold">
                <Truck className="mr-1 inline h-4 w-4" />
                {order.trackingNumber}
              </p>
            )}
            {order.yalidineStatus && (
              <p className="text-sm">
                Statut Yalidine: <span className="font-semibold">{order.yalidineStatus}</span>
              </p>
            )}
            {order.yalidineSyncedAt && (
              <p className="text-xs text-black/50">Dernier sync: {formatDate(order.yalidineSyncedAt)}</p>
            )}
            {canExportBordereau(order) && (
              <div className="grid grid-cols-2 gap-2">
                <CrmButton
                  size="sm"
                  variant="ghost"
                  disabled={busyAction === `pdf:${order.id}`}
                  onClick={() => void handleDownloadBordereau(order)}
                >
                  <FileDown className="mr-1 inline h-4 w-4" />
                  Bordereau
                </CrmButton>
                <CrmButton
                  size="sm"
                  variant="ghost"
                  disabled={busyAction === `print:${order.id}`}
                  onClick={() => void handlePrintBordereau(order)}
                >
                  <Printer className="mr-1 inline h-4 w-4" />
                  Imprimer
                </CrmButton>
              </div>
            )}
            <div className="space-y-2">
              {!order.trackingNumber && onCreateParcel && canExportBordereau(order) && (
                <CrmButton size="sm" className="w-full" onClick={() => onCreateParcel(order)}>
                  Creer colis Yalidine
                </CrmButton>
              )}
              {order.trackingNumber && onSyncParcel && (
                <CrmButton size="sm" className="w-full" variant="ghost" onClick={() => onSyncParcel(order)}>
                  <RefreshCw className="mr-1 inline h-4 w-4" />
                  Actualiser Yalidine
                </CrmButton>
              )}
              {(order.trackingNumber || order.labelUrl) && (
                <CrmButton
                  size="sm"
                  className="w-full"
                  variant="ghost"
                  disabled={busyAction === "label"}
                  onClick={() => void handleYalidineLabel(order)}
                >
                  Ouvrir sur Yalidine
                </CrmButton>
              )}
            </div>
          </Section>

          <Section title="Tentatives de contact">
            <p className="text-xs text-black/50">{attempts.length} / 5 tentatives</p>
            {attempts.length === 0 ? (
              <p className="text-sm text-black/40">Aucune tentative enregistree.</p>
            ) : (
              <div className="space-y-2">
                {attempts.map((attempt) => (
                  <div key={attempt.id} className="rounded-lg border border-black/10 bg-white p-3 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold">Tentative {attempt.attemptNumber}</p>
                      <p className="text-xs text-black/45">{formatDate(attempt.createdAt)}</p>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap">{attempt.notes}</p>
                    <p className="mt-1 text-xs text-black/55">Par {attempt.employeeName}</p>
                  </div>
                ))}
              </div>
            )}
            {canLogContactAttempt(roles) && attempts.length < 5 && (
              <div className="space-y-2">
                <textarea
                  value={attemptNote}
                  onChange={(event) => setAttemptNote(event.target.value)}
                  rows={3}
                  placeholder="Note de la tentative"
                  className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-michket-gold"
                />
                <CrmButton
                  size="sm"
                  disabled={busyAction === "attempt" || !attemptNote.trim()}
                  onClick={() => {
                    void run(
                      "attempt",
                      () => crmOrdersApi.addContactAttempt(order.id, attemptNote.trim()),
                      "Tentative enregistree.",
                    ).then((saved) => {
                      if (saved) setAttemptNote("");
                    });
                  }}
                >
                  Ajouter la tentative {attempts.length + 1}
                </CrmButton>
              </div>
            )}
          </Section>

          <Section title="Produits">
            {order.items.length === 0 ? (
              <p className="text-sm text-black/40">Aucun article.</p>
            ) : (
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between gap-3 text-sm">
                    <span className="min-w-0">
                      <span className="font-medium">
                        {item.quantity}x {item.productName}
                      </span>
                      {(item.variantName || item.colorName) && (
                        <span className="block text-xs text-black/50">
                          {[item.variantName, item.colorName].filter(Boolean).join(" · ")}
                        </span>
                      )}
                      {itemPersonalization(item) && (
                        <span className="block text-xs text-black/70">Texte trophee: {itemPersonalization(item)}</span>
                      )}
                    </span>
                    <span className="shrink-0 font-bold">
                      {dzd.format(item.lineTotal ?? item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title="Paiement">
            <p className="text-sm">Methode: {(order.paymentMethod || "cod").toUpperCase()}</p>
            <p className="text-sm">Statut: {order.paymentStatus || "-"}</p>
            <p className="text-sm">Sous-total: {dzd.format(order.subtotal || 0)}</p>
            <p className="text-sm">Livraison: {dzd.format(order.deliveryFee || 0)}</p>
            <p className="text-sm">Remise: {dzd.format(order.discount || 0)}</p>
            {order.promoCode && <p className="text-sm">Promo: {order.promoCode}</p>}
            <p className="text-sm font-bold">Total: {dzd.format(order.total)}</p>
          </Section>

          {(order.notes || order.cancelReason) && (
            <Section title="Notes de commande">
              {order.notes && <p className="whitespace-pre-wrap text-sm">{order.notes}</p>}
              {order.cancelReason && <p className="text-sm text-rose-700">Motif: {order.cancelReason}</p>}
            </Section>
          )}

          <Section title="Remarques">
            {remarks.length === 0 ? (
              <p className="text-sm text-black/40">Aucune remarque.</p>
            ) : (
              <div className="space-y-2">
                {remarks.map((item) => (
                  <div key={item.id} className="rounded-lg border border-black/10 bg-white p-3 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">{item.authorName}</p>
                        <p className="text-xs text-black/45">{formatDate(item.createdAt)}</p>
                      </div>
                      {currentUserId && item.authorId === currentUserId && (
                        <button
                          type="button"
                          className="text-rose-700"
                          disabled={busyAction === `remark:${item.id}`}
                          onClick={() =>
                            void run(
                              `remark:${item.id}`,
                              () => crmOrdersApi.deleteRemark(order.id, item.id),
                              "Remarque supprimee.",
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <p className="mt-2 whitespace-pre-wrap">{item.body}</p>
                  </div>
                ))}
              </div>
            )}
            {canManageRemarks(roles) && (
              <div className="space-y-2">
                <textarea
                  value={remark}
                  onChange={(event) => setRemark(event.target.value)}
                  rows={3}
                  placeholder="Ajouter une remarque"
                  className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-michket-gold"
                />
                <CrmButton
                  size="sm"
                  disabled={busyAction === "remark" || !remark.trim()}
                  onClick={() => {
                    void run(
                      "remark",
                      () => crmOrdersApi.addRemark(order.id, remark.trim()),
                      "Remarque ajoutee.",
                    ).then((saved) => {
                      if (saved) setRemark("");
                    });
                  }}
                >
                  Ajouter la remarque
                </CrmButton>
              </div>
            )}
          </Section>

          <Section title="Historique">
            {order.history.length === 0 ? (
              <p className="text-sm text-black/40">Aucun historique pour le moment.</p>
            ) : (
              <div className="max-h-48 space-y-2 overflow-auto">
                {order.history
                  .slice()
                  .reverse()
                  .map((event) => (
                    <div key={event.id} className="rounded-lg border border-black/5 bg-white p-3 text-xs">
                      <div className="flex items-center justify-between">
                        <p className="font-bold">{orderStatusLabels[event.to] || event.to}</p>
                        <p className="text-black/40">{formatDate(event.createdAt)}</p>
                      </div>
                      <p className="mt-1 text-black/60">
                        {event.authorName}
                        {event.note ? ` · ${event.note}` : ""}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </Section>

          {children}
        </div>
      ) : (
        <p className="text-sm text-black/50">Chargement des details...</p>
      )}
    </CrmSideDrawer>
  );
}
