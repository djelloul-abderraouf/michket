import { useState } from "react";
import type { Order } from "@/lib/crm/types";
import { CrmPanel, CrmCard, CrmBadge, CrmButton, dzd, formatDate, productSummary, orderRef, CrmPopup } from "./CrmUi";

export function CrmConfirmation({
  orders,
  onConfirm,
  onReason,
}: {
  orders: Order[];
  onConfirm: (order: Order) => void;
  onReason: (order: Order, reason: NonNullable<Order["confirmationReason"]>) => void;
}) {
  const [pendingOrder, setPendingOrder] = useState<Order | undefined>();
  const pendingValue = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <CrmPanel className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/50">À confirmer</p>
          <p className="mt-2 text-2xl font-bold text-black">{orders.length}</p>
          <p className="mt-1 text-sm text-black/60">Commandes en attente</p>
        </CrmPanel>
        <CrmPanel className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/50">Valeur en attente</p>
          <p className="mt-2 text-2xl font-bold text-black">{dzd.format(pendingValue)}</p>
          <p className="mt-1 text-sm text-black/60">Total à confirmer</p>
        </CrmPanel>
        <CrmPanel className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/50">Après confirmation</p>
          <p className="mt-2 text-sm font-medium text-black/70">
            La commande rejoint automatiquement la liste livraison pour création du colis Yalidine.
          </p>
        </CrmPanel>
      </div>

      <CrmPanel title={`Commandes à confirmer (${orders.length})`}>
        {orders.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-lg font-semibold text-black/40">Aucune commande à confirmer</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {orders.map((order) => (
              <CrmCard key={order.id} className="p-5 overflow-hidden">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base truncate">{orderRef(order)}</h3>
                      <CrmBadge variant="warning">Pas confirmé</CrmBadge>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-black/70 truncate">{order.clientName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-black">{dzd.format(order.total)}</p>
                    <p className="text-xs text-black/50">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
                <div className="space-y-1 text-sm mb-4">
                  <p>{order.phone}</p>
                  <p>{order.wilaya}{order.commune ? ` · ${order.commune}` : ""}</p>
                  <p className="text-xs text-black/50">{order.deliveryType === "office" ? "Stop desk" : "Domicile"} · {(order.paymentMethod || "cod").toUpperCase()}</p>
                  <div className="rounded-lg border border-black/10 bg-black/[0.02] p-3">
                    <p className="text-xs font-medium text-black/60 mb-1">Commande</p>
                    <p className="text-sm font-semibold break-words">{productSummary(order)}</p>
                  </div>
                </div>
                <CrmButton onClick={() => setPendingOrder(order)} variant="success">
                  Confirmer la commande
                </CrmButton>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {(["injoignable", "refus", "a_rappeler"] as const).map((reason) => (
                    <CrmButton key={reason} variant="ghost" size="sm" onClick={() => onReason(order, reason)}>
                      {reason.replace("_", " ")}
                    </CrmButton>
                  ))}
                </div>
              </CrmCard>
            ))}
          </div>
        )}
      </CrmPanel>

      <CrmPopup
        isOpen={Boolean(pendingOrder)}
        onClose={() => setPendingOrder(undefined)}
        title="Confirmer cette commande ?"
      >
        {pendingOrder && (
          <div className="space-y-4">
            <p className="text-sm text-black/70">
              Une fois confirmée, <span className="font-semibold">{orderRef(pendingOrder)}</span> ({pendingOrder.clientName})
              est ajoutée automatiquement à la liste de livraison pour le colis Yalidine.
            </p>
            <div className="rounded-lg border border-black/10 bg-black/[0.02] p-3 text-sm space-y-1">
              <p>{pendingOrder.phone} · {pendingOrder.wilaya}</p>
              <p>{productSummary(pendingOrder)}</p>
              <p className="font-bold">{dzd.format(pendingOrder.total)}</p>
            </div>
            <div className="flex gap-3">
              <CrmButton variant="ghost" className="flex-1" onClick={() => setPendingOrder(undefined)}>
                Annuler
              </CrmButton>
              <CrmButton
                variant="success"
                className="flex-1"
                onClick={() => {
                  onConfirm(pendingOrder);
                  setPendingOrder(undefined);
                }}
              >
                Oui, confirmer
              </CrmButton>
            </div>
          </div>
        )}
      </CrmPopup>
    </div>
  );
}
