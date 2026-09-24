import type { Order, OrderItem, OrderSource } from "@/lib/crm/types";

export const orderSources = ["ecom", "whatsapp", "facebook", "instagram"] as const;

export const orderSourceLabels: Record<OrderSource, string> = {
  ecom: "Site e-com",
  whatsapp: "WhatsApp",
  facebook: "Facebook",
  instagram: "Instagram",
};

export function phoneKey(phone: string): string {
  const digits = String(phone || "").replace(/\D/g, "");
  return digits.slice(-9);
}

export function personalizationText(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "string") {
    return value.trim();
  }
  if (typeof value !== "object") {
    return String(value);
  }

  const record = value as Record<string, unknown>;
  for (const key of ["text", "texte", "message", "personalization", "gravure"]) {
    const item = record[key];
    if (typeof item === "string" && item.trim()) {
      return item.trim();
    }
  }

  if (Array.isArray(record.texts)) {
    return record.texts
      .filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
      .join(" · ");
  }

  return Object.values(record)
    .filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
    .join(" · ");
}

export function itemPersonalization(item: OrderItem) {
  return item.personalizationText || personalizationText(item.personalization);
}

export function deliveryLabel(order: Pick<Order, "deliveryType">) {
  return order.deliveryType === "office" ? "Bureau" : "Domicile";
}

export function clientTypeLabel(type?: Order["clientType"] | null) {
  if (type === "professionnel") {
    return "Professionnel";
  }
  if (type === "particulier") {
    return "Particulier";
  }
  return "—";
}
