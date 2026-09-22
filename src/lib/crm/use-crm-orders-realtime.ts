"use client";

import { useEffect, useRef } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { crmOrdersApi } from "@/lib/api-client";
import { normalizeOrder } from "@/lib/crm/normalize-order";
import type { Order } from "@/lib/crm/types";
import { ensureRealtimeAuth, supabase } from "@/lib/supabase-client";

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

    let cancelled = false;
    let channel: RealtimeChannel | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let retries = 0;
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

    const teardownChannel = async () => {
      if (!channel) {
        return;
      }
      const current = channel;
      channel = null;
      await supabase.removeChannel(current);
    };

    const subscribe = async () => {
      if (cancelled) {
        return;
      }

      await teardownChannel();
      const session = await ensureRealtimeAuth();
      if (cancelled || !session?.access_token) {
        return;
      }

      const next = supabase
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
          if (status === "SUBSCRIBED") {
            retries = 0;
            return;
          }
          if (status !== "CHANNEL_ERROR" && status !== "TIMED_OUT") {
            return;
          }
          console.error("Orders realtime subscription failed", status, error);
          if (cancelled || retries >= 3) {
            return;
          }
          retries += 1;
          retryTimer = setTimeout(() => {
            void subscribe();
          }, retries * 1500);
        });

      channel = next;
    };

    void subscribe();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "TOKEN_REFRESHED" && session?.access_token) {
        void supabase.realtime.setAuth(session.access_token);
      }
      if (event === "SIGNED_IN") {
        retries = 0;
        void subscribe();
      }
    });

    const onVisible = () => {
      if (document.visibilityState !== "visible") {
        return;
      }
      const state = channel?.state;
      if (state === "joined" || state === "joining") {
        void ensureRealtimeAuth();
        return;
      }
      retries = 0;
      void subscribe();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
      document.removeEventListener("visibilitychange", onVisible);
      subscription.unsubscribe();
      void teardownChannel();
    };
  }, [options.enabled]);
}
