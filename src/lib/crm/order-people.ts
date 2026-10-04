import type { Order, OrderRemark, OrderStatus } from "@/lib/crm/types";

export function namesForStatus(order: Order, status: OrderStatus) {
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

export function confirmationRemarks(order: Pick<Order, "remarks">): OrderRemark[] {
  const remarks = order.remarks || [];
  const tagged = remarks.some((remark) => (remark.authorRoles || []).length > 0);
  if (!tagged) {
    return remarks;
  }
  return remarks.filter((remark) => (remark.authorRoles || []).includes("confirmation"));
}
