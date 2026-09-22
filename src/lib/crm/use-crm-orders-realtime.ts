"use client";

import { useEffect, useRef } from "react";
import { crmOrdersApi } from "@/lib/api-client";
import { normalizeOrder } from "@/lib/crm/normalize-order";
import type { Order } from "@/lib/crm/types";
import { supabase } from "@/lib/supabase-client";

type OrderChangeEvent = "INSERT" | "UPDATE";

export function useCrmOrdersRealtime(options: {
  enabled: boolean;
  onUpsert: (order: Order, event: OrderChangeEvent) => void;
  onDelete: (orderId: string) => void;
}) {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    if (!options.enabled) {
      return;
    }

    const timers = new Map<string, ReturnType<typeof setTimeout>>();

    const refreshOrder = (orderId: string, event: OrderChangeEvent) => {
      const previous = timers.get(orderId);
      if (previous) {
        clearTimeout(previous);
      }

      timers.set(
        orderId,
        setTimeout(() => {
          timers.delete(orderId);
          void crmOrdersApi
            .getById(orderId)
            .then((order) => optionsRef.current.onUpsert(normalizeOrder(order), event))
            .catch((error) => {
              console.error("Failed to refresh realtime order", error);
            });
        }, 400),
      );
    };

    const channel = supabase
      .channel("crm-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          const eventType = payload.eventType;
          const nextId = (payload.new as { id?: string } | null)?.id;
          const previousId = (payload.old as { id?: string } | null)?.id;
          const orderId = nextId || previousId;
          if (!orderId) {
            return;
          }
          if (eventType === "DELETE") {
            optionsRef.current.onDelete(orderId);
            return;
          }
          if (eventType === "INSERT" || eventType === "UPDATE") {
            refreshOrder(orderId, eventType);
          }
        },
      )
      .subscribe((status, error) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.error("Orders realtime subscription failed", status, error);
        }
      });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
      void supabase.removeChannel(channel);
    };
  }, [options.enabled]);
}
