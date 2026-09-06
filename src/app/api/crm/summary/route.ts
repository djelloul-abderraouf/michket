import { crmResponse } from "@/lib/crm/api-helpers";
import { getCrmSummary } from "@/lib/crm/repository";

export async function GET() {
  return crmResponse(await getCrmSummary());
}
