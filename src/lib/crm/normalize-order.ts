import { orderStatuses, type Order, type OrderSource, type OrderStatus } from "@/lib/crm/types";
import { personalizationText } from "@/lib/crm/order-display";

function normalizeSource(value: unknown): OrderSource {
  if (value === "whatsapp" || value === "facebook" || value === "instagram" || value === "ecom") {
    return value;
  }
  return "ecom";
}

function normalizeStatus(status: unknown): OrderStatus {
  if (typeof status === "string" && orderStatuses.includes(status as OrderStatus)) {
    return status as OrderStatus;
  }

  const fromDb: Record<string, OrderStatus> = {
    pending: "pas_confirme",
    confirmed: "confirme",
    processing: "en_fabrication",
    shipped: "en_livraison",
    delivered: "livre",
    cancelled: "annulee",
    refunded: "retour_echec",
  };

  return fromDb[String(status || "")] || "pas_confirme";
}

export function normalizeOrder(order: any): Order {
  return {
    id: order.id,
    reference: order.reference,
    source: normalizeSource(order.source),
    clientName: order.clientName || `${order.firstName || ""} ${order.lastName || ""}`.trim(),
    firstName: order.firstName,
    lastName: order.lastName,
    phone: order.phone,
    email: order.email,
    clientType: order.clientType === "professionnel" || order.clientType === "particulier"
      ? order.clientType
      : null,
    isExistingClient: Boolean(order.isExistingClient),
    previousOrderCount: Number(order.previousOrderCount ?? 0),
    contactId: order.contactId,
    wilaya: order.wilaya || order.wilayaName || "",
    wilayaCode: order.wilayaCode,
    commune: order.commune,
    addressLine1: order.addressLine1,
    addressLine2: order.addressLine2,
    deliveryType: order.deliveryType,
    deliveryOfficeName: order.deliveryOfficeName,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    promoCode: order.promoCode,
    subtotal: Number(order.subtotal ?? 0),
    deliveryFee: Number(order.deliveryFee ?? 0),
    discount: Number(order.discount ?? 0),
    currency: order.currency,
    dbStatus: order.dbStatus,
    status: normalizeStatus(order.status),
    items: Array.isArray(order.items)
      ? order.items.map((item: any) => ({
          productId: item.productId || "",
          productName: item.productName,
          productSlug: item.productSlug,
          variantName: item.variantName,
          colorName: item.colorName,
          colorHex: item.colorHex,
          quantity: item.quantity,
          unitPrice: item.unitPrice ?? 0,
          lineTotal: item.lineTotal,
          personalization: item.personalization,
          personalizationText: item.personalizationText || personalizationText(item.personalization),
        }))
      : [],
    total: Number(order.total ?? 0),
    notes: order.notes,
    cancelReason: order.cancelReason,
    trackingNumber: order.trackingNumber,
    carrier: order.carrier,
    carrierStatus: order.carrierStatus,
    yalidineStatus: order.yalidineStatus || null,
    yalidineSyncedAt: order.yalidineSyncedAt || null,
    labelUrl: order.labelUrl,
    deliveredAt: order.deliveredAt,
    shippedAt: order.shippedAt,
    cancelledAt: order.cancelledAt,
    paidAt: order.paidAt,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    history: Array.isArray(order.history) ? order.history : [],
  };
}
