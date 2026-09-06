import { NextRequest } from "next/server";
import { crmResponse, readJsonBody } from "@/lib/crm/api-helpers";

export async function POST(request: NextRequest) {
  await readJsonBody(request);

  return crmResponse({
    source: "demo",
    data: {
      changed: true,
      message:
        "Password change endpoint ready. Connect Supabase Auth updateUser when credentials are available.",
    },
  });
}
