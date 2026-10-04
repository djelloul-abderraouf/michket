import { useEffect, useState, type ReactNode } from "react";
import { Phone, MapPin, User, Mail, Truck, Printer, FileDown, RefreshCw, Trash2, ExternalLink } from "lucide-react";
import {
  canChangeOrderStatus,
  canEditClientPhone,
  canLogContactAttempt,
  canManageRemarks,
  canReviewDuplicate,
  canSetOrderKind,
} from "@/lib/crm/permissions";
import { clientTypeLabel, deliveryLabel, itemPersonalization, orderSourceLabels } from "@/lib/crm/order-display";
import { clientPhoneError, normalizeClientPhoneInput } from "@/lib/crm/phone";
import {
  duplicateStatusLabels,
  duplicateStatuses,
  orderKindLabels,
  orderKinds,
  orderStatusLabels,
  orderStatuses,
} from "@/lib/crm/types";
import type { CrmRole, DuplicateStatus, Order, OrderKind, OrderStatus } from "@/lib/crm/types";
import {
  clientTypeTones,
  deliveryTones,
  duplicateStatusTones,
  neutralTone,
  orderKindTones,
  orderStatusTones,
  sourceTones,
} from "@/lib/crm/option-colors";
import { printYalidineBordereau, downloadYalidineBordereau } from "@/lib/crm/bordereau";
import { crmDeliveryApi, crmOrdersApi } from "@/lib/api-client";
import { ColorChip, CrmColorSelect, PersonChip } from "./CrmColorSelect";
import {
  CrmButton,
  CrmSideDrawer,
  dzd,
  formatDate,
  orderRef,
} from "./CrmUi";

const fieldClass =
  "h-10 w-full rounded-lg border border-black/15 bg-white px-3 text-sm outline-none focus:border-michket-gold";

const paymentMethodLabels: Record<string, string> = {
  cod: "Paiement à la livraison",
  cash: "Espèces",
  card: "Carte",
};

const paymentStatusLabels: Record<string, string> = {
  pending: "En attente",
  paid: "Payé",
  failed: "Échoué",
  refunded: "Remboursé",
};

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

function otherOrdersLabel(count: number) {
  if (count <= 0) {
    return "Aucune autre commande avec ce numéro.";
  }
  if (count === 1) {
    return "1 autre commande avec ce numéro.";
  }
  return `${count} autres commandes avec ce numéro.`;
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-12 overflow-hidden rounded-xl border border-black/10 bg-white">
      <div className="border-b border-black/8 bg-stone-50 px-3 py-2">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.12em] text-black/45">{title}</h4>
      </div>
      <div className="space-y-2 p-3 text-xs">{children}</div>
    </section>
  );
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-black/5 py-1.5 text-xs last:border-0 last:pb-0 first:pt-0">
      <span className="shrink-0 text-black/45">{label}</span>
      <div className="min-w-0 text-right font-medium text-black">{children}</div>
    </div>
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
      onToast?.("Bordereau Yalidine téléchargé");
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
      onToast?.(error instanceof Error ? error.message : "Étiquette Yalidine indisponible");
    } finally {
      setBusyAction(null);
    }
  }

  const otherOrders = order?.previousOrderCount || 0;
  const duplicateStatus = order?.duplicateStatus || "unique";
  const productLinks = order?.items.flatMap((item, index) => {
    const href = productPageHref(item.productSlug);
    return href ? [{ key: `${item.productId}-${index}`, href, name: item.productName }] : [];
  }) || [];

  return (
    <CrmSideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={order ? `Commande ${orderRef(order)}` : "Commande"}
      width="min(760px, 100vw)"
    >
      {order ? (
        <div className="space-y-3">
          <div className="rounded-xl border border-black/10 bg-stone-50 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-black/40">
                  {order.reference || orderRef(order)}
                </p>
                <h3 className="mt-0.5 text-lg font-bold leading-tight">{order.clientName}</h3>
                <p className="mt-0.5 text-[11px] text-black/50">{formatDate(order.createdAt)}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-black/40">Total</p>
                <p className="text-lg font-bold">{dzd.format(order.total)}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <ColorChip label={orderStatusLabels[order.status]} tone={orderStatusTones[order.status]} />
              <ColorChip label={duplicateStatusLabels[duplicateStatus]} tone={duplicateStatusTones[duplicateStatus]} />
              <ColorChip label={orderSourceLabels[order.source] || "Site e-com"} tone={sourceTones[order.source] || neutralTone} />
              <ColorChip
                label={clientTypeLabel(order.clientType)}
                tone={order.clientType ? clientTypeTones[order.clientType] : neutralTone}
              />
              {order.orderKind ? (
                <ColorChip label={orderKindLabels[order.orderKind]} tone={orderKindTones[order.orderKind]} />
              ) : null}
            </div>
          </div>

          <nav className="sticky top-0 z-10 -mx-1 flex gap-1 overflow-x-auto bg-white/95 py-1">
            {[
              { id: "order-statut", label: "Statut" },
              { id: "order-doublon", label: "Doublon" },
              { id: "order-type", label: "Type" },
              ...(order.campaignSlug || productLinks.length > 0 ? [{ id: "order-liens", label: "Liens" }] : []),
              { id: "order-client", label: "Client" },
              { id: "order-livraison", label: "Livraison" },
              ...(canExportBordereau(order) || order.trackingNumber ? [{ id: "order-colis", label: "Colis" }] : []),
              { id: "order-produits", label: "Produits" },
              { id: "order-paiement", label: "Paiement" },
              ...(order.notes || order.cancelReason ? [{ id: "order-notes", label: "Notes" }] : []),
              { id: "order-tentatives", label: "Tentatives" },
              { id: "order-remarques", label: "Remarques" },
              { id: "order-historique", label: "Historique" },
            ].map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className="shrink-0 rounded-full bg-black/5 px-2.5 py-1 text-[11px] font-semibold text-black/70 hover:bg-michket-gold/40"
              >
                {section.label}
              </button>
            ))}
          </nav>

          <Section id="order-statut" title="Statut de la commande">
            {showStatusSelect && onMove ? (
              <CrmColorSelect
                ariaLabel="Statut de la commande"
                value={order.status}
                onChange={(next) => {
                  if (next !== order.status) {
                    onMove(order, next as OrderStatus);
                  }
                }}
                options={orderStatuses.map((status) => ({
                  value: status,
                  label: orderStatusLabels[status],
                  tone: orderStatusTones[status],
                  disabled: !canChangeOrderStatus(roles, order.status, status) && status !== order.status,
                }))}
              />
            ) : (
              <ColorChip label={orderStatusLabels[order.status] || order.status} tone={orderStatusTones[order.status] || neutralTone} />
            )}
          </Section>

          <Section id="order-doublon" title="Doublon">
            <p className="text-sm text-black/70">{otherOrdersLabel(otherOrders)}</p>
            {canReviewDuplicate(roles) ? (
              <CrmColorSelect
                ariaLabel="Statut doublon"
                disabled={busyAction === "duplicate"}
                value={duplicateStatus}
                onChange={(next) => {
                  if (next === duplicateStatus) {
                    return;
                  }
                  const review = next === "verifie"
                    ? "verifie"
                    : next === "unique" && otherOrders > 0
                      ? "unique"
                      : "auto";
                  void run(
                    "duplicate",
                    () => crmOrdersApi.updateDuplicate(order.id, review),
                    "Statut doublon mis à jour.",
                  );
                }}
                options={duplicateStatuses.map((status) => ({
                  value: status,
                  label: duplicateStatusLabels[status],
                  tone: duplicateStatusTones[status],
                  disabled: otherOrders === 0 && status !== "unique",
                }))}
              />
            ) : (
              <ColorChip label={duplicateStatusLabels[duplicateStatus]} tone={duplicateStatusTones[duplicateStatus]} />
            )}
            {order.duplicateReviewedByName ? (
              <div className="flex flex-wrap items-center gap-2 text-sm text-black/60">
                <span>{duplicateStatus === "verifie" ? "Vérifié par" : "Marqué par"}</span>
                <PersonChip name={order.duplicateReviewedByName} />
                {order.duplicateReviewedAt ? <span>· {formatDate(order.duplicateReviewedAt)}</span> : null}
              </div>
            ) : (
              <p className="text-sm text-black/45">
                {otherOrders > 0
                  ? "En attente de vérification. Le numéro correspond à une autre commande."
                  : "Ce numéro n'apparaît que sur cette commande."}
              </p>
            )}
          </Section>

          <Section id="order-type" title="Type de commande">
            {canSetOrderKind(roles) ? (
              <CrmColorSelect
                ariaLabel="Type de commande"
                disabled={busyAction === "kind"}
                value={order.orderKind || ""}
                onChange={(next) => {
                  const kind = next as OrderKind;
                  if (kind && kind !== order.orderKind) {
                    void run("kind", () => crmOrdersApi.updateKind(order.id, kind), "Type de commande mis à jour.");
                  }
                }}
                options={[
                  { value: "", label: "Non renseigné", tone: neutralTone, disabled: true },
                  ...orderKinds.map((kind) => ({
                    value: kind,
                    label: orderKindLabels[kind],
                    tone: orderKindTones[kind],
                  })),
                ]}
              />
            ) : (
              <ColorChip
                label={order.orderKind ? orderKindLabels[order.orderKind] : "Non renseigné"}
                tone={order.orderKind ? orderKindTones[order.orderKind] : neutralTone}
              />
            )}
          </Section>

          {(order.campaignSlug || productLinks.length > 0) && (
            <Section id="order-liens" title="Liens">
              {order.campaignSlug ? (
                <a
                  href={storefrontHref(`/campagne/${encodeURIComponent(order.campaignSlug)}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-black underline decoration-michket-gold underline-offset-4"
                >
                  Campagne{order.campaignTitle ? ` · ${order.campaignTitle}` : ""}
                  <ExternalLink size={14} />
                </a>
              ) : null}
              <div className="flex flex-col gap-2">
                {productLinks.map((item) => (
                  <a
                    key={item.key}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-black underline decoration-michket-gold underline-offset-4"
                  >
                    Produit · {item.name}
                    <ExternalLink size={14} />
                  </a>
                ))}
              </div>
            </Section>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <Section id="order-client" title="Client">
              <DetailRow label="Nom">
                <span className="inline-flex items-center gap-1.5">
                  <User className="h-4 w-4 text-black/40" />
                  {order.clientName}
                </span>
              </DetailRow>
              <DetailRow label="Profil">
                {order.isExistingClient
                  ? `Client existant · ${otherOrders} autre${otherOrders > 1 ? "s" : ""}`
                  : "Nouveau client"}
              </DetailRow>
              {order.email ? (
                <DetailRow label="Email">
                  <span className="inline-flex items-center gap-1.5 break-all">
                    <Mail className="h-4 w-4 shrink-0 text-black/40" />
                    {order.email}
                  </span>
                </DetailRow>
              ) : null}
              {canEditClientPhone(roles) ? (
                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-semibold text-black/45">Téléphone</label>
                  <input
                    value={phoneDraft}
                    inputMode="numeric"
                    maxLength={10}
                    required
                    onChange={(event) => setPhoneDraft(normalizeClientPhoneInput(event.target.value))}
                    className={fieldClass}
                  />
                  <p className="text-xs text-black/45">Obligatoire. 10 chiffres, commence par 0.</p>
                  <CrmButton
                    size="sm"
                    disabled={busyAction === "phone" || Boolean(clientPhoneError(phoneDraft)) || phoneDraft === order.phone}
                    onClick={() => {
                      const error = clientPhoneError(phoneDraft);
                      if (error) {
                        onToast?.(error);
                        return;
                      }
                      void run("phone", () => crmOrdersApi.updatePhone(order.id, phoneDraft), "Numéro client mis à jour.");
                    }}
                  >
                    <Phone className="h-4 w-4" />
                    Enregistrer le numéro
                  </CrmButton>
                </div>
              ) : (
                <DetailRow label="Téléphone">
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-black/40" />
                    {order.phone}
                  </span>
                </DetailRow>
              )}
            </Section>

            <Section id="order-livraison" title="Livraison">
              <DetailRow label="Wilaya">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-black/40" />
                  {order.wilaya}
                  {order.commune ? ` · ${order.commune}` : ""}
                </span>
              </DetailRow>
              <DetailRow label="Mode">
                <ColorChip
                  label={deliveryLabel(order)}
                  tone={order.deliveryType === "office" ? deliveryTones.office : deliveryTones.home}
                />
              </DetailRow>
              {order.deliveryOfficeName ? <DetailRow label="Bureau">{order.deliveryOfficeName}</DetailRow> : null}
              {order.addressLine1 ? <DetailRow label="Adresse">{order.addressLine1}</DetailRow> : null}
              {order.addressLine2 ? <DetailRow label="Complément">{order.addressLine2}</DetailRow> : null}
              {order.trackingNumber ? (
                <DetailRow label="Suivi">
                  <span className="inline-flex items-center gap-1.5">
                    <Truck className="h-4 w-4 text-black/40" />
                    {order.trackingNumber}
                  </span>
                </DetailRow>
              ) : null}
              {order.yalidineStatus ? <DetailRow label="Yalidine">{order.yalidineStatus}</DetailRow> : null}
              {order.yalidineSyncedAt ? (
                <DetailRow label="Synchro">{formatDate(order.yalidineSyncedAt)}</DetailRow>
              ) : null}
            </Section>
          </div>

          {canExportBordereau(order) || order.trackingNumber ? (
            <Section id="order-colis" title="Colis Yalidine">
              {canExportBordereau(order) && (
                <div className="grid grid-cols-2 gap-2">
                  <CrmButton
                    size="sm"
                    variant="ghost"
                    disabled={busyAction === `pdf:${order.id}`}
                    onClick={() => void handleDownloadBordereau(order)}
                  >
                    <FileDown className="h-4 w-4" />
                    Bordereau
                  </CrmButton>
                  <CrmButton
                    size="sm"
                    variant="ghost"
                    disabled={busyAction === `print:${order.id}`}
                    onClick={() => void handlePrintBordereau(order)}
                  >
                    <Printer className="h-4 w-4" />
                    Imprimer
                  </CrmButton>
                </div>
              )}
              {!order.trackingNumber && onCreateParcel && canExportBordereau(order) && (
                <CrmButton size="sm" className="w-full" onClick={() => onCreateParcel(order)}>
                  Créer le colis Yalidine
                </CrmButton>
              )}
              {order.trackingNumber && onSyncParcel && (
                <CrmButton size="sm" className="w-full" variant="ghost" onClick={() => onSyncParcel(order)}>
                  <RefreshCw className="h-4 w-4" />
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
            </Section>
          ) : null}

          <Section id="order-produits" title="Produits">
            {order.items.length === 0 ? (
              <p className="text-sm text-black/40">Aucun article.</p>
            ) : (
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="rounded-lg border border-black/8 bg-stone-50 px-3 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">
                          {item.quantity} × {item.productName}
                        </p>
                        {(item.variantName || item.colorName) && (
                          <p className="mt-1 text-xs text-black/55">
                            {[item.variantName, item.colorName].filter(Boolean).join(" · ")}
                          </p>
                        )}
                        {itemPersonalization(item) ? (
                          <p className="mt-1 text-xs text-black/70">Texte du trophée : {itemPersonalization(item)}</p>
                        ) : null}
                      </div>
                      <p className="shrink-0 text-sm font-bold">
                        {dzd.format(item.lineTotal ?? item.unitPrice * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section id="order-paiement" title="Paiement">
            <DetailRow label="Méthode">
              {paymentMethodLabels[order.paymentMethod || "cod"] || (order.paymentMethod || "cod").toUpperCase()}
            </DetailRow>
            <DetailRow label="Statut">{paymentStatusLabels[order.paymentStatus || ""] || order.paymentStatus || "—"}</DetailRow>
            <DetailRow label="Sous-total">{dzd.format(order.subtotal || 0)}</DetailRow>
            <DetailRow label="Livraison">{dzd.format(order.deliveryFee || 0)}</DetailRow>
            <DetailRow label="Remise">{dzd.format(order.discount || 0)}</DetailRow>
            {order.promoCode ? <DetailRow label="Code promo">{order.promoCode}</DetailRow> : null}
            <DetailRow label="Total">
              <span className="text-base font-bold">{dzd.format(order.total)}</span>
            </DetailRow>
          </Section>

          {(order.notes || order.cancelReason) && (
            <Section id="order-notes" title="Notes de commande">
              {order.notes ? <p className="whitespace-pre-wrap text-sm leading-relaxed">{order.notes}</p> : null}
              {order.cancelReason ? <p className="text-sm text-rose-700">Motif : {order.cancelReason}</p> : null}
            </Section>
          )}

          <Section id="order-tentatives" title="Tentatives de contact">
            <p className="text-xs font-semibold text-black/45">{attempts.length} / 5 tentatives</p>
            {attempts.length === 0 ? (
              <p className="text-sm text-black/40">Aucune tentative enregistrée.</p>
            ) : (
              <div className="space-y-2">
                {attempts.map((attempt) => (
                  <div key={attempt.id} className="rounded-lg border border-black/8 bg-stone-50 p-3 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold">Tentative {attempt.attemptNumber}</p>
                      <p className="text-xs text-black/45">{formatDate(attempt.createdAt)}</p>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap leading-relaxed">{attempt.notes}</p>
                    <div className="mt-2">
                      <PersonChip name={attempt.employeeName} />
                    </div>
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
                      "Tentative enregistrée.",
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

          <Section id="order-remarques" title="Remarques">
            {remarks.length === 0 ? (
              <p className="text-sm text-black/40">Aucune remarque.</p>
            ) : (
              <div className="space-y-2">
                {remarks.map((item) => (
                  <div key={item.id} className="rounded-lg border border-black/8 bg-stone-50 p-3 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <PersonChip name={item.authorName} />
                        <p className="text-xs text-black/45">{formatDate(item.createdAt)}</p>
                      </div>
                      {currentUserId && item.authorId === currentUserId && (
                        <button
                          type="button"
                          className="rounded-md p-1 text-rose-700 hover:bg-rose-50"
                          disabled={busyAction === `remark:${item.id}`}
                          onClick={() =>
                            void run(
                              `remark:${item.id}`,
                              () => crmOrdersApi.deleteRemark(order.id, item.id),
                              "Remarque supprimée.",
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <p className="mt-2 whitespace-pre-wrap leading-relaxed">{item.body}</p>
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
                      "Remarque ajoutée.",
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

          <Section id="order-historique" title="Historique">
            {order.history.length === 0 ? (
              <p className="text-sm text-black/40">Aucun historique pour le moment.</p>
            ) : (
              <div className="max-h-64 space-y-2 overflow-auto pr-1">
                {order.history
                  .slice()
                  .reverse()
                  .map((event) => (
                    <div key={event.id} className="rounded-lg border border-black/8 bg-stone-50 p-2.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {event.from ? (
                          <ColorChip
                            label={orderStatusLabels[event.from] || event.from}
                            tone={orderStatusTones[event.from] || neutralTone}
                          />
                        ) : null}
                        {event.from ? <span className="text-[11px] text-black/35">→</span> : null}
                        <ColorChip
                          label={orderStatusLabels[event.to] || event.to}
                          tone={orderStatusTones[event.to] || neutralTone}
                        />
                        <p className="ml-auto text-[11px] text-black/40">{formatDate(event.createdAt)}</p>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <PersonChip name={event.authorName} />
                        {event.note ? <span className="text-[11px] text-black/50">{event.note}</span> : null}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </Section>

          {children}
        </div>
      ) : (
        <p className="text-sm text-black/50">Chargement des détails...</p>
      )}
    </CrmSideDrawer>
  );
}
