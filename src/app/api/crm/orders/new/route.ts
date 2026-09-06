import { NextRequest } from "next/server";
import { crmResponse, readJsonBody } from "@/lib/crm/api-helpers";
import { createCrmResource } from "@/lib/crm/repository";

export async function POST(request: NextRequest) {
  const payload = await readJsonBody(request);

  return crmResponse(
    await createCrmResource("orders", {
      source: "directe",
      status: "pas_confirme",
      history: [],
      ...payload,
    }),
    201,
  );
}
