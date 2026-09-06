import { NextRequest } from "next/server";
import { crmResponse, readJsonBody, userFromRequest } from "@/lib/crm/api-helpers";

export async function GET(request: NextRequest) {
  return crmResponse({ source: "demo", data: userFromRequest(request) });
}

export async function PATCH(request: NextRequest) {
  const body = await readJsonBody(request);

  return crmResponse({
    source: "demo",
    data: {
      ...userFromRequest(request),
      ...body,
    },
  });
}
