import type { Order, OrderRemark } from "@/lib/crm/types";

const STORAGE_KEY = "michket-commercial-remark-reads";

export function namesForStatus(order: Order, status: Order["status"]) {
  const names: string[] = [];
  const seen = new Set<string>();
  for (const event of order.history || []) {
    if (event.to !== status || !event.authorName) {
      continue;
    }
    const key = event.authorId || event.authorName;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    names.push(event.authorName);
  }
  return names;
}

export function commercialRemarks(order: Pick<Order, "remarks">): OrderRemark[] {
  return (order.remarks || []).filter((remark) =>
    (remark.authorRoles || []).includes("commercial"),
  );
}

export function remarkReadToken(order: Pick<Order, "id" | "remarks">) {
  const ids = commercialRemarks(order).map((remark) => remark.id).sort();
  if (ids.length === 0) {
    return null;
  }
  return `${order.id}:${ids.join(",")}`;
}

export function isCommercialRemarkRead(order: Pick<Order, "id" | "remarks">) {
  const token = remarkReadToken(order);
  if (!token || typeof window === "undefined") {
    return !token;
  }
  return loadReadTokens().has(token);
}

export function setCommercialRemarkRead(order: Pick<Order, "id" | "remarks">, read: boolean) {
  const token = remarkReadToken(order);
  if (!token || typeof window === "undefined") {
    return;
  }
  const tokens = loadReadTokens();
  if (read) {
    tokens.add(token);
  } else {
    tokens.delete(token);
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...tokens]));
  window.dispatchEvent(new Event("michket-remark-reads"));
}

function loadReadTokens() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set<string>(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set<string>();
  }
}
