"use client";

import { useEffect, useMemo, useState } from "react";
import { crmOrdersApi } from "@/lib/api-client";
import {
  commercialRemarks,
  isCommercialRemarkRead,
  setCommercialRemarkRead,
} from "@/lib/crm/order-people";
import { normalizeOrder } from "@/lib/crm/normalize-order";
import type { CrmRole, Order, OrderStatus } from "@/lib/crm/types";
import { OrderListTable } from "./OrderListTable";
import { CrmOrderDetailsDrawer } from "./CrmOrderDetailsDrawer";
import { CrmPanel, OrderSearchField } from "./CrmUi";
import { orderMatchesQuery } from "@/lib/crm/order-search";

export function CrmConfirmedOrders({
  onLoadOrder,
  onToast,
  onCreateParcel,
  onSyncParcel,
  userRoles,
  currentUserId,
  onOrderUpdated,
  onMove,
}: {
  onLoadOrder?: (id: string) => void;
  onToast?: (message: string) => void;
  onCreateParcel?: (order: Order) => void;
  onSyncParcel?: (order: Order) => void;
  userRoles?: CrmRole[];
  currentUserId?: string;
  onOrderUpdated?: (order: Order) => void;
  onMove?: (order: Order, to: OrderStatus, note?: string) => void;
}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [readVersion, setReadVersion] = useState(0);

  useEffect(() => {
    let active = true;
    crmOrdersApi
      .getAll({ status: "confirme", limit: 200 })
      .then((page) => {
        if (active) {
          setOrders((page.data || []).map(normalizeOrder));
        }
      })
      .catch((error) => {
        onToast?.(error instanceof Error ? error.message : "Impossible de charger les commandes confirmées");
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [onToast]);

  useEffect(() => {
    const refresh = () => setReadVersion((value) => value + 1);
    window.addEventListener("michket-remark-reads", refresh);
    return () => window.removeEventListener("michket-remark-reads", refresh);
  }, []);

  const visibleOrders = useMemo(
    () => orders.filter((order) => orderMatchesQuery(order, query)),
    [orders, query],
  );
  const selectedOrder = orders.find((order) => order.id === selectedId);

  return (
    <div className="space-y-4">
      <CrmPanel
        title={`Commandes confirmées (${visibleOrders.length})`}
      >
        <p className="mb-3 text-xs text-black/55">
          Ces commandes peuvent entrer sur une planche. S&apos;il y a une remarque du commercial, confirmez l&apos;avoir lue avant de l&apos;ajouter.
        </p>
        <div className="mb-4">
          <OrderSearchField value={query} onChange={setQuery} placeholder="Client, téléphone, référence..." />
        </div>
        {loading ? (
          <p className="py-8 text-center text-xs text-black/40">Chargement...</p>
        ) : visibleOrders.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm font-semibold text-black/40">Aucune commande confirmée</p>
          </div>
        ) : (
          <div className="space-y-3">
            <OrderListTable
              orders={visibleOrders}
              onOpen={(order) => {
                setSelectedId(order.id);
                onLoadOrder?.(order.id);
              }}
            />
            <div className="space-y-2">
              {visibleOrders.map((order) => {
                const remarks = commercialRemarks(order);
                const read = isCommercialRemarkRead(order);
                void readVersion;
                if (remarks.length === 0) {
                  return null;
                }
                return (
                  <div key={order.id} className="rounded-lg border border-black/10 bg-stone-50 p-3">
                    <p className="text-[11px] font-semibold text-black/70">
                      {order.reference || order.id.slice(0, 8).toUpperCase()} · {order.clientName}
                    </p>
                    <div className="mt-2 space-y-1">
                      {remarks.map((remark) => (
                        <p key={remark.id} className="text-[11px] leading-relaxed text-black/70">
                          <span className="font-semibold">{remark.authorName} : </span>
                          {remark.body}
                        </p>
                      ))}
                    </div>
                    <label className="mt-2 flex items-center gap-2 text-[11px] font-semibold text-black/70">
                      <input
                        type="checkbox"
                        checked={read}
                        onChange={() => setCommercialRemarkRead(order, !read)}
                      />
                      J&apos;ai lu les remarques du commercial
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
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
        onOrderUpdated={(order) => {
          setOrders((current) => current.map((item) => (item.id === order.id ? order : item)));
          onOrderUpdated?.(order);
        }}
        onMove={onMove}
        showStatusSelect
      />
    </div>
  );
}
