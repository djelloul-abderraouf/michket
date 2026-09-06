import { NextRequest } from "next/server";
import { crmResponse, readJsonBody } from "@/lib/crm/api-helpers";
import { loginDemo } from "@/lib/crm/repository";

export async function POST(request: NextRequest) {
  const body = await readJsonBody<{ email: string; password: string }>(request);
  const result = await loginDemo(body.email ?? "");

  return crmResponse(result, result.ok ? 200 : 401);
}
