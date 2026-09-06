import { NextRequest } from "next/server";
import { crmResponse, readJsonBody, rolesFromRequest, userFromRequest } from "@/lib/crm/api-helpers";
import { updateOrderStatus } from "@/lib/crm/repository";

export async function POST(request: NextRequest) {
  const body = await readJsonBody<{ orderId: string; qualityChecked: boolean }>(request);

  if (!body.qualityChecked) {
    return crmResponse({ ok: false, message: "Controle qualite obligatoire." }, 400);
  }

  const result = await updateOrderStatus({
    orderId: body.orderId ?? "",
    to: "en_livraison",
    roles: rolesFromRequest(request),
    author: userFromRequest(request),
    note: "Commande emballee et controle qualite valide.",
  });

  return crmResponse(result, result.ok ? 200 : 403);
}
