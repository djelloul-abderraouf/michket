import { useState, type ReactNode } from "react";
import { Phone, MapPin, User, Mail, Truck, Printer, FileDown, RefreshCw } from "lucide-react";
import { canChangeOrderStatus } from "@/lib/crm/permissions";
import { clientTypeLabel, deliveryLabel, itemPersonalization, orderSourceLabels } from "@/lib/crm/order-display";
import { orderStatusLabels, orderStatuses } from "@/lib/crm/types";
import type { CrmRole, Order, OrderStatus } from "@/lib/crm/types";
import { printYalidineBordereau, downloadYalidineBordereau } from "@/lib/crm/bordereau";
import { crmDeliveryApi } from "@/lib/api-client";
import {
  CrmButton,
  CrmSideDrawer,
  dzd,
  formatDate,
  orderRef,
} from "./CrmUi";

function canExportBordereau(order?: Order) {
  return Boolean(order && order.status !== "pas_confirme" && order.status !== "annulee");
}

export function CrmOrderDetailsDrawer({
  order,
  isOpen,
  onClose,
  userRoles,
  onMove,
  onCreateParcel,
  onSyncParcel,
  onToast,
  showStatusSelect = false,
  children,
}: {
  order?: Order;
  isOpen: boolean;
  onClose: () => void;
  userRoles?: CrmRole[];
  onMove?: (order: Order, to: OrderStatus, note?: string) => void;
  onCreateParcel?: (order: Order) => void;
  onSyncParcel?: (order: Order) => void;
  onToast?: (message: string) => void;
  showStatusSelect?: boolean;
  children?: ReactNode;
}) {
  const [busyAction, setBusyAction] = useState<string | null>(null);

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
      width="640px"
    >
      {order ? (
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-xl font-bold">{order.clientName}</h3>
              <p className="mt-1 text-sm text-black/60">
                <Phone className="inline h-4 w-4 mr-1" />
                {order.phone}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-black/50">
                {orderSourceLabels[order.source] || "Site e-com"}
                {" · "}
                {clientTypeLabel(order.clientType)}
                {" · "}
                {order.isExistingClient
                  ? `Client existant (${order.previousOrderCount || 1} commande${(order.previousOrderCount || 1) > 1 ? "s" : ""})`
                  : "Nouveau client"}
              </p>
              {order.email && (
                <p className="text-sm text-black/60">
                  <Mail className="inline h-4 w-4 mr-1" />
                  {order.email}
                </p>
              )}
              <p className="text-sm text-black/60">
                <MapPin className="inline h-4 w-4 mr-1" />
                {order.wilaya}
                {order.commune ? ` · ${order.commune}` : ""}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-bold">{dzd.format(order.total)}</p>
              <p className="text-sm text-black/50">{formatDate(order.createdAt)}</p>
            </div>
          </div>

          {showStatusSelect && onMove && userRoles ? (
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
                Statut
              </label>
              <select
                value={order.status}
                onChange={(event) => {
                  const next = event.target.value as OrderStatus;
                  if (next !== order.status) {
                    onMove(order, next);
                  }
                }}
                className="h-11 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold"
              >
                {orderStatuses.map((status) => (
                  <option
                    key={status}
                    value={status}
                    disabled={
                      !canChangeOrderStatus(userRoles, order.status, status) &&
                      status !== order.status
                    }
                  >
                    {orderStatusLabels[status]}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="rounded-lg border border-black/10 bg-black/[0.02] px-4 py-3 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-black/60">Statut</p>
              <p className="mt-1 font-bold">{orderStatusLabels[order.status] || order.status}</p>
            </div>
          )}

          {canExportBordereau(order) && (
            <div className="rounded-lg border border-michket-gold/40 bg-michket-gold/10 p-4 space-y-3">
              <h4 className="text-sm font-bold uppercase tracking-wider text-black/70">
                Bordereau Yalidine
              </h4>
              <p className="text-sm text-black/60">
                Bordereau officiel recupere via l&apos;API Yalidine apres confirmation.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <CrmButton
                  size="sm"
                  variant="ghost"
                  disabled={busyAction === `pdf:${order.id}`}
                  onClick={() => void handleDownloadBordereau(order)}
                >
                  <FileDown className="h-4 w-4 mr-1 inline" />
                  {busyAction === `pdf:${order.id}` ? "..." : "Telecharger"}
                </CrmButton>
                <CrmButton
                  size="sm"
                  variant="ghost"
                  disabled={busyAction === `print:${order.id}`}
                  onClick={() => void handlePrintBordereau(order)}
                >
                  <Printer className="h-4 w-4 mr-1 inline" />
                  Imprimer
                </CrmButton>
              </div>
            </div>
          )}

          <div className="rounded-lg border border-black/10 bg-black/[0.02] p-4 space-y-2 text-sm">
            <h4 className="text-sm font-bold uppercase tracking-wider text-black/60">Livraison</h4>
            <p>
              {deliveryLabel(order)}
              {order.deliveryOfficeName ? ` · ${order.deliveryOfficeName}` : ""}
            </p>
            {order.addressLine1 && <p>{order.addressLine1}</p>}
            {order.addressLine2 && <p>{order.addressLine2}</p>}
            {order.trackingNumber && (
              <p className="font-semibold">
                <Truck className="inline h-4 w-4 mr-1" />
                {order.trackingNumber}
              </p>
            )}
            {order.yalidineStatus && (
              <p className="text-sm">
                Statut Yalidine: <span className="font-semibold">{order.yalidineStatus}</span>
              </p>
            )}
            {order.yalidineSyncedAt && (
              <p className="text-xs text-black/50">
                Dernier sync: {formatDate(order.yalidineSyncedAt)}
              </p>
            )}
            <div className="pt-2 space-y-2">
              {!order.trackingNumber && onCreateParcel && canExportBordereau(order) && (
                <CrmButton size="sm" className="w-full" onClick={() => onCreateParcel(order)}>
                  Creer colis Yalidine
                </CrmButton>
              )}
              {order.trackingNumber && onSyncParcel && (
                <CrmButton size="sm" className="w-full" variant="ghost" onClick={() => onSyncParcel(order)}>
                  <RefreshCw className="h-4 w-4 mr-1 inline" />
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
          </div>

          <div className="rounded-lg border border-black/10 bg-black/[0.02] p-4 space-y-2 text-sm">
            <h4 className="text-sm font-bold uppercase tracking-wider text-black/60">Paiement</h4>
            <p>Methode: {(order.paymentMethod || "cod").toUpperCase()}</p>
            <p>Statut: {order.paymentStatus || "-"}</p>
            <p>Sous-total: {dzd.format(order.subtotal || 0)}</p>
            <p>Livraison: {dzd.format(order.deliveryFee || 0)}</p>
            <p>Remise: {dzd.format(order.discount || 0)}</p>
            {order.promoCode && <p>Promo: {order.promoCode}</p>}
          </div>

          <div className="rounded-lg border border-black/10 bg-black/[0.02] p-4">
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-black/60">Produits</h4>
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
                      <span className="block text-xs text-black/70">
                        Texte trophee: {itemPersonalization(item)}
                      </span>
                    )}
                  </span>
                  <span className="font-bold shrink-0">
                    {dzd.format(item.lineTotal ?? item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {(order.notes || order.cancelReason) && (
            <div className="rounded-lg border border-black/10 p-4 text-sm whitespace-pre-wrap">
              {order.notes}
              {order.cancelReason && (
                <p className="mt-2 text-rose-700">Motif: {order.cancelReason}</p>
              )}
            </div>
          )}

          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-black/60">
              Historique
            </h4>
            <div className="space-y-2 max-h-48 overflow-auto">
              {order.history.length === 0 ? (
                <p className="text-sm text-black/40">Aucun historique pour le moment.</p>
              ) : (
                order.history
                  .slice()
                  .reverse()
                  .map((event) => (
                    <div key={event.id} className="rounded-lg border border-black/5 bg-black/[0.02] p-3 text-xs">
                      <div className="flex items-center justify-between">
                        <p className="font-bold">{orderStatusLabels[event.to] || event.to}</p>
                        <p className="text-black/40">{formatDate(event.createdAt)}</p>
                      </div>
                      <p className="mt-1 text-black/60">
                        <User className="inline h-3 w-3 mr-1" />
                        {event.authorName}
                        {event.note && ` • ${event.note}`}
                      </p>
                    </div>
                  ))
              )}
            </div>
          </div>

          {children}
        </div>
      ) : (
        <p className="text-sm text-black/50">Chargement des details...</p>
      )}
    </CrmSideDrawer>
  );
}
