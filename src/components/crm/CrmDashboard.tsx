import { orderStatusLabels, orderStatuses, productionStatusLabels, roleLabels } from "@/lib/crm/types";
import type { CrmRole, Order, ProductionJob } from "@/lib/crm/types";
import { CrmPanel, CrmCard, CrmBadge, dzd, Metric, formatDate } from "./CrmUi";

function sees(roles: CrmRole[], audience: CrmRole[]) {
  return roles.includes("admin") || roles.some((role) => audience.includes(role));
}

export function CrmDashboard({
  orders,
  productionJobs,
  pipelineAmount,
  userName,
  roles,
  stockAlertCount = 0,
}: {
  orders: Order[];
  productionJobs: ProductionJob[];
  pipelineAmount: number;
  userName: string;
  roles: CrmRole[];
  stockAlertCount?: number;
}) {
  const confirmed = orders.filter((order) => order.status !== "pas_confirme");
  const delivered = orders.filter((order) => order.status === "livre");
  const revenue = orders
    .filter((order) => ["en_livraison", "livre"].includes(order.status))
    .reduce((sum, order) => sum + order.total, 0);

  // Additional calculations for enhanced dashboard
  const inProduction = orders.filter((order) => order.status === "en_fabrication");
  const inPreparation = orders.filter((order) => order.status === "en_preparation");
  const inDelivery = orders.filter((order) => order.status === "en_livraison");
  const returns = orders.filter((order) =>
    order.status === "retour_echec" || order.status === "annulee",
  );

  // Calculate top wilayas
  const wilayaStats = orders.reduce((acc, order) => {
    acc[order.wilaya] = (acc[order.wilaya] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topWilayas = Object.entries(wilayaStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Calculate average order value
  const billable = orders.filter((order) => !["annulee", "retour_echec"].includes(order.status));
  const avgOrderValue = billable.length > 0 ? billable.reduce((sum, order) => sum + order.total, 0) / billable.length : 0;
  const roleLine = (roles.includes("admin") ? ["admin"] : roles).map((role) => roleLabels[role] || role).join(" · ");

  // Recent orders
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const cards = [
    sees(roles, ["commercial"]) && { label: "CA livré ou en route", value: dzd.format(revenue), accent: "bg-michket-gold" },
    sees(roles, ["commercial"]) && { label: "Pipeline ventes", value: dzd.format(pipelineAmount), accent: "bg-cyan-500" },
    sees(roles, ["commercial", "confirmation"]) && { label: "Taux confirmation", value: `${Math.round((confirmed.length / Math.max(orders.length, 1)) * 100)}%`, accent: "bg-emerald-500" },
    sees(roles, ["livraison", "commercial"]) && { label: "Taux livraison", value: `${Math.round((delivered.length / Math.max(orders.length, 1)) * 100)}%`, accent: "bg-indigo-500" },
    sees(roles, ["confirmation", "commercial"]) && { label: "Pas confirmées", value: String(orders.filter((order) => order.status === "pas_confirme").length), accent: "bg-amber-500" },
    sees(roles, ["fabrication"]) && { label: "En fabrication", value: String(inProduction.length), accent: "bg-orange-500" },
    sees(roles, ["preparation"]) && { label: "En préparation", value: String(inPreparation.length), accent: "bg-purple-500" },
    sees(roles, ["livraison"]) && { label: "En livraison", value: String(inDelivery.length), accent: "bg-blue-500" },
    sees(roles, ["livraison", "confirmation"]) && { label: "Retours / annulées", value: String(returns.length), accent: "bg-rose-500" },
    sees(roles, ["commercial"]) && { label: "Panier moyen", value: dzd.format(avgOrderValue), accent: "bg-sky-500" },
    sees(roles, ["commercial", "fabrication", "preparation"]) && stockAlertCount > 0 && { label: "Alertes stock", value: String(stockAlertCount), accent: "bg-rose-600" },
  ].filter(Boolean) as Array<{ label: string; value: string; accent: string }>;

  return (
    <div className="space-y-6">
      <p className="text-sm text-black/55">{userName} · {roleLine}. Ces chiffres portent sur les commandes déjà chargées.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Metric key={card.label} label={card.label} value={card.value} accent={card.accent} />
        ))}
      </div>

      {sees(roles, ["commercial", "confirmation", "fabrication", "preparation", "livraison"]) && (
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Orders by Status */}
        <CrmPanel title="Commandes par statut">
          <div className="space-y-3">
            {orderStatuses.map((status) => {
              const count = orders.filter((order) => order.status === status).length;
              const percentage = orders.length > 0 ? (count / orders.length) * 100 : 0;

              return (
                <div
                  key={status}
                  className="grid grid-cols-[160px_1fr_50px] items-center gap-3 text-sm"
                >
                  <span className="font-semibold text-black/70">
                    {orderStatusLabels[status]}
                  </span>
                  <div className="h-2.5 overflow-hidden rounded-full bg-black/10">
                    <div
                      className="h-full rounded-full bg-black transition-all"
                      style={{ width: `${Math.max(4, percentage)}%` }}
                    />
                  </div>
                  <span className="text-right font-bold text-black">{count}</span>
                </div>
              );
            })}
          </div>
        </CrmPanel>

        {sees(roles, ["fabrication"]) && (
        <CrmPanel title="File de production">
          <div className="space-y-3">
            {productionJobs.length === 0 ? (
              <p className="text-sm text-black/50">Aucune production en cours</p>
            ) : (
              productionJobs.slice(0, 5).map((job) => (
                <CrmCard key={job.id} className="p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-bold text-sm">{job.orderRef}</p>
                      <p className="mt-1 text-xs text-black/60">{job.clientName}</p>
                      <p className="mt-1 text-xs text-black/50">{job.productSummary}</p>
                    </div>
                    <CrmBadge
                      variant={
                        job.status === "en_attente"
                          ? "warning"
                          : job.status === "en_cours"
                          ? "info"
                          : "success"
                      }
                    >
                      {productionStatusLabels[job.status]}
                    </CrmBadge>
                  </div>
                </CrmCard>
              ))
            )}
          </div>
        </CrmPanel>
        )}
      </div>
      )}

      {sees(roles, ["commercial", "confirmation", "livraison"]) && (
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Wilayas */}
        <CrmPanel title="Top wilayas">
          <div className="space-y-3">
            {topWilayas.map(([wilaya, count], index) => (
              <div
                key={wilaya}
                className="flex items-center justify-between rounded-lg border border-black/5 bg-black/[0.02] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <span className="font-semibold text-sm">{wilaya}</span>
                </div>
                <span className="text-sm font-bold text-black">{count} commandes</span>
              </div>
            ))}
          </div>
        </CrmPanel>

        {/* Recent Orders */}
        <CrmPanel title="Commandes récentes">
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <CrmCard key={order.id} className="p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm">{order.id}</p>
                      <CrmBadge variant="default">{orderStatusLabels[order.status]}</CrmBadge>
                    </div>
                    <p className="mt-1 text-xs text-black/60">{order.clientName}</p>
                    <p className="mt-1 text-xs text-black/50">{order.wilaya}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{dzd.format(order.total)}</p>
                    <p className="text-xs text-black/50">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
              </CrmCard>
            ))}
          </div>
        </CrmPanel>
      </div>
      )}

      {sees(roles, ["commercial"]) && (
      <CrmPanel title="Panier moyen">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold text-black">{dzd.format(avgOrderValue)}</p>
            <p className="mt-1 text-sm text-black/60">Valeur moyenne par commande</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-black/60">Total commandes</p>
            <p className="text-lg font-bold text-black">{orders.length}</p>
          </div>
        </div>
      </CrmPanel>
      )}
    </div>
  );
}
