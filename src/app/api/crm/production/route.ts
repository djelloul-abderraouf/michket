import { NextRequest } from "next/server";
import { crmResponse, readJsonBody } from "@/lib/crm/api-helpers";
import { listCrmResource, updateProductionJob } from "@/lib/crm/repository";
import type { ProductionStatus } from "@/lib/crm/types";

export async function GET() {
  return crmResponse(await listCrmResource("production"));
}

export async function PATCH(request: NextRequest) {
  const body = await readJsonBody<{ jobId: string; status: ProductionStatus }>(request);

  return crmResponse(
    await updateProductionJob({
      jobId: body.jobId ?? "",
      status: body.status ?? "en_attente",
    }),
  );
}
