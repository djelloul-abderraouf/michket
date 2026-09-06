type SupabaseOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, string>;
};

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function hasSupabaseConfig() {
  return Boolean(supabaseUrl && supabaseKey);
}

export async function supabaseRestFetch<T>(
  table: string,
  { method = "GET", body, query }: SupabaseOptions = {},
) {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase credentials are not configured.");
  }

  const url = new URL(`/rest/v1/${table}`, supabaseUrl);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url, {
    method,
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Supabase ${method} ${table} failed: ${details}`);
  }

  return (await response.json()) as T;
}

export const crmTables = {
  users: "crm_users",
  contacts: "crm_contacts",
  companies: "crm_companies",
  products: "crm_products",
  deals: "crm_deals",
  proposals: "crm_proposals",
  orders: "crm_orders",
  orderHistory: "crm_order_status_history",
  production: "crm_production_jobs",
  tasks: "crm_tasks",
  activities: "crm_activities",
  loginAudit: "crm_login_audit",
};
