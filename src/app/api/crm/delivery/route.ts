import { NextRequest } from "next/server";
import { crmResponse, readJsonBody, rolesFromRequest, userFromRequest } from "@/lib/crm/api-helpers";
import { updateOrderStatus } from "@/lib/crm/repository";

export async function GET() {
  return crmResponse({
    source: "demo",
    data: {
      averageDeliveryDays: 2.1,
      returnRateByWilaya: [
        { wilaya: "Alger", rate: 3 },
        { wilaya: "Oran", rate: 6 },
        { wilaya: "Setif", rate: 4 },
      ],
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await readJsonBody<{
    orderId: string;
    delivered: boolean;
    reason?: string;
  }>(request);

  const result = await updateOrderStatus({
    orderId: body.orderId ?? "",
    to: body.delivered ? "livre" : "retour_echec",
    roles: rolesFromRequest(request),
    author: userFromRequest(request),
    note: body.reason,
  });

  return crmResponse(result, result.ok ? 200 : 403);
}
