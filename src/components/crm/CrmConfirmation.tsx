import { useMemo, useState } from "react";
import type { CrmRole, Order, OrderStatus } from "@/lib/crm/types";
import { CrmPanel, CrmButton, dzd, productSummary, orderRef, CrmPopup, OrderSearchField } from "./CrmUi";
import { CrmOrderDetailsDrawer } from "./CrmOrderDetailsDrawer";
import { orderMatchesQuery } from "@/lib/crm/order-search";
import { unconfirmedBucket, unconfirmedBucketLabels, type UnconfirmedBucket } from "@/lib/crm/order-followup";
import { bucketTones, neutralTone } from "@/lib/crm/option-colors";
import { CrmColorSelect } from "./CrmColorSelect";
import { OrderListTable } from "./OrderListTable";

export function CrmConfirmation({
  orders,
  onConfirm,
  onReason,
  onLoadOrder,
  onToast,
  onCreateParcel,
  onSyncParcel,
  userRoles,
  currentUserId,
  onOrderUpdated,
  onMove,
}: {
  orders: Order[];
  onConfirm: (order: Order) => void;
  onReason: (order: Order, reason: NonNullable<Order["confirmationReason"]>) => void;
  onLoadOrder?: (id: string) => void;
  onToast?: (message: string) => void;
  onCreateParcel?: (order: Order) => void;
  onSyncParcel?: (order: Order) => void;
  userRoles?: CrmRole[];
  currentUserId?: string;
  onOrderUpdated?: (order: Order) => void;
  onMove?: (order: Order, to: OrderStatus, note?: string) => void;
}) {
  const [pendingOrder, setPendingOrder] = useState<Order | undefined>();
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [query, setQuery] = useState("");
  const [wilaya, setWilaya] = useState("all");
  const [bucket, setBucket] = useState<UnconfirmedBucket | "all">("all");
  const wilayas = useMemo(
    () => Array.from(new Set(orders.map((order) => order.wilaya).filter(Boolean))).sort(),
    [orders],
  );
  const visibleOrders = useMemo(
    () =>
      orders.filter((order) => {
        if (wilaya !== "all" && order.wilaya !== wilaya) return false;
        if (bucket !== "all" && unconfirmedBucket(order.createdAt, order.status) !== bucket) return false;
        return orderMatchesQuery(order, query);
      }),
    [orders, query, wilaya, bucket],
  );
  const pendingValue = visibleOrders.reduce((sum, order) => sum + order.total, 0);
  const selectedOrder = orders.find((order) => order.id === selectedId);

  function openDetails(order: Order) {
    setSelectedId(order.id);
    onLoadOrder?.(order.id);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <CrmPanel className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/50">À confirmer</p>
          <p className="mt-2 text-2xl font-bold text-black">{visibleOrders.length}</p>
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
            La commande est envoyee automatiquement a Yalidine. Le bordereau officiel devient disponible a l&apos;impression.
          </p>
        </CrmPanel>
      </div>

      <CrmPanel title={`Commandes à confirmer (${visibleOrders.length})`}>
        <div className="mb-4 grid gap-3 md:grid-cols-[1fr_180px_180px]">
          <OrderSearchField value={query} onChange={setQuery} />
          <select
            value={wilaya}
            onChange={(event) => setWilaya(event.target.value)}
            className="h-11 rounded-lg border border-black/15 bg-white px-3 text-sm outline-none focus:border-michket-gold"
          >
            <option value="all">Toutes wilayas</option>
            {wilayas.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          <CrmColorSelect
            ariaLabel="Filtrer par suivi"
            value={bucket}
            onChange={(value) => setBucket(value as UnconfirmedBucket | "all")}
            options={[
              { value: "all", label: "Prospection, prioritaire, archive", tone: neutralTone },
              { value: "prospection", label: unconfirmedBucketLabels.prospection, tone: bucketTones.prospection },
              { value: "prioritaire", label: unconfirmedBucketLabels.prioritaire, tone: bucketTones.prioritaire },
              { value: "archive", label: unconfirmedBucketLabels.archive, tone: bucketTones.archive },
            ]}
          />
        </div>
        {visibleOrders.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-lg font-semibold text-black/40">Aucune commande à confirmer</p>
          </div>
        ) : (
          <OrderListTable
            orders={visibleOrders}
            onOpen={openDetails}
            trailingHeader=""
            trailing={(order) => (
              <div className="flex max-w-[220px] flex-wrap gap-1">
                <CrmButton
                  size="sm"
                  variant="success"
                  onClick={() => setPendingOrder(order)}
                >
                  Confirmer
                </CrmButton>
                {(["injoignable", "refus", "a_rappeler"] as const).map((reason) => (
                  <CrmButton
                    key={reason}
                    variant={reason === "refus" ? "danger" : "ghost"}
                    size="sm"
                    onClick={() => {
                      onReason(order, reason);
                      if (reason === "refus") setSelectedId(undefined);
                    }}
                  >
                    {reason === "injoignable" ? "Injoignable" : reason === "a_rappeler" ? "À rappeler" : "Refus"}
                  </CrmButton>
                ))}
              </div>
            )}
          />
        )}
      </CrmPanel>

      <CrmOrderDetailsDrawer
        order={selectedOrder}
        isOpen={Boolean(selectedId)}
        onClose={() => setSelectedId(undefined)}
        onToast={onToast}
        onCreateParcel={onCreateParcel}
        onSyncParcel={onSyncParcel}
        userRoles={userRoles}
        currentUserId={currentUserId}
        onOrderUpdated={onOrderUpdated}
        onMove={onMove}
        showStatusSelect
      >
        {selectedOrder && (
          <div className="space-y-2">
            <CrmButton variant="success" className="w-full" onClick={() => setPendingOrder(selectedOrder)}>
              Confirmer la commande
            </CrmButton>
            <div className="grid grid-cols-3 gap-2">
              {(["injoignable", "refus", "a_rappeler"] as const).map((reason) => (
                <CrmButton
                  key={reason}
                  variant={reason === "refus" ? "danger" : "ghost"}
                  size="sm"
                      onClick={() => {
                        onReason(selectedOrder, reason);
                        if (reason === "refus") setSelectedId(undefined);
                      }}
                >
                  {reason.replace("_", " ")}
                </CrmButton>
              ))}
            </div>
          </div>
        )}
      </CrmOrderDetailsDrawer>

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
                  setSelectedId(undefined);
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
