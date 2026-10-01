import type { Order } from "./types";

export function orderSearchText(order: Order) {
  return [
    order.reference,
    order.id,
    order.clientName,
    order.firstName,
    order.lastName,
    order.phone,
    order.email,
    order.wilaya,
    order.commune,
    order.addressLine1,
    order.addressLine2,
    order.deliveryOfficeName,
    order.trackingNumber,
    order.yalidineStatus,
    order.notes,
    order.cancelReason,
    order.orderKind,
    order.source,
    order.campaignSlug,
    order.campaignTitle,
    order.status,
    ...(order.items || []).flatMap((item) => [
      item.productName,
      item.variantName,
      item.colorName,
      item.personalizationText,
    ]),
    ...(order.remarks || []).flatMap((remark) => [remark.body, remark.authorName]),
    ...(order.contactAttempts || []).flatMap((attempt) => [attempt.notes, attempt.employeeName]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function orderMatchesQuery(order: Order, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return true;
  }
  return orderSearchText(order).includes(needle);
}
