import { NextRequest } from "next/server";
import { crmResponse, readJsonBody } from "@/lib/crm/api-helpers";
import { createDemoTask, listCrmResource } from "@/lib/crm/repository";

export async function GET() {
  return crmResponse(await listCrmResource("tasks"));
}

export async function POST(request: NextRequest) {
  return crmResponse(await createDemoTask(await readJsonBody(request)), 201);
}
