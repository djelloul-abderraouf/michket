import { NextRequest } from "next/server";
import { crmResponse, readJsonBody } from "@/lib/crm/api-helpers";
import { createCrmResource, listCrmResource } from "@/lib/crm/repository";

export async function GET() {
  return crmResponse(await listCrmResource("projects"));
}

export async function POST(request: NextRequest) {
  return crmResponse(await createCrmResource("projects", await readJsonBody(request)), 201);
}
