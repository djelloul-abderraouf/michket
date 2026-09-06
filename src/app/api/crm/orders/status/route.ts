import { NextRequest } from "next/server";
import { crmResponse, readJsonBody, rolesFromRequest, userFromRequest } from "@/lib/crm/api-helpers";
import { updateOrderStatus } from "@/lib/crm/repository";
import type { OrderStatus } from "@/lib/crm/types";

export async function POST(request: NextRequest) {
  const body = await readJsonBody<{
    orderId: string;
    to: OrderStatus;
    note?: string;
  }>(request);

  const result = await updateOrderStatus({
    orderId: body.orderId ?? "",
    to: body.to ?? "pas_confirme",
    roles: rolesFromRequest(request),
    author: userFromRequest(request),
    note: body.note,
  });

  return crmResponse(result, result.ok ? 200 : 403);
}
