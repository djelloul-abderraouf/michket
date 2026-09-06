import { CrmPanel } from "./CrmUi";

export function CrmSettings() {
  return (
    <CrmPanel>
      <h2 className="text-lg font-bold tracking-[0]">Supabase et RLS</h2>
      <div className="mt-4 grid gap-3 text-sm text-black/70 md:grid-cols-2">
        <div className="rounded-md border border-black/10 p-4">
          <p className="font-bold text-black">Variables attendues</p>
          <p className="mt-2">NEXT_PUBLIC_SUPABASE_URL</p>
          <p>NEXT_PUBLIC_SUPABASE_ANON_KEY</p>
          <p>SUPABASE_SERVICE_ROLE_KEY pour les routes serveur admin.</p>
        </div>
        <div className="rounded-md border border-black/10 p-4">
          <p className="font-bold text-black">Tables API</p>
          <p className="mt-2">
            crm_users, crm_contacts, crm_companies, crm_deals, crm_proposals,
            crm_orders, crm_order_status_history, crm_production_jobs,
            crm_tasks, crm_products.
          </p>
        </div>
      </div>
    </CrmPanel>
  );
}
