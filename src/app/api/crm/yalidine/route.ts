import { NextRequest } from "next/server";
import { crmResponse, readJsonBody } from "@/lib/crm/api-helpers";

export async function POST(request: NextRequest) {
  const body = await readJsonBody<{ orderId: string }>(request);

  return crmResponse({
    source: "demo",
    data: {
      orderId: body.orderId,
      trackingNumber: `YLD-${Math.floor(100000 + Math.random() * 899999)}`,
      carrierStatus:
        "Endpoint pret pour Yalidine. Ajouter YALIDINE_API_ID et YALIDINE_API_TOKEN pour l'integration reelle.",
    },
  });
}
