import { orderStatusLabels, orderStatuses, productionStatusLabels } from "@/lib/crm/types";
import type { Order, ProductionJob } from "@/lib/crm/types";
import { CrmPanel, CrmCard, CrmBadge, dzd, Metric, formatDate } from "./CrmUi";

export function CrmDashboard({
  orders,
  productionJobs,
  pipelineAmount,
}: {
  orders: Order[];
  productionJobs: ProductionJob[];
  pipelineAmount: number;
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
  const returns = orders.filter((order) => order.status === "retour_echec");

  // Calculate top wilayas
  const wilayaStats = orders.reduce((acc, order) => {
    acc[order.wilaya] = (acc[order.wilaya] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topWilayas = Object.entries(wilayaStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Calculate average order value
  const avgOrderValue = orders.length > 0 ? revenue / orders.length : 0;

  // Recent orders
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          label="CA suivi"
          value={dzd.format(revenue)}
          accent="bg-michket-gold"
          trend={{ value: "+12%", positive: true }}
        />
        <Metric
          label="Pipeline ventes"
          value={dzd.format(pipelineAmount)}
          accent="bg-cyan-500"
          trend={{ value: "+8%", positive: true }}
        />
        <Metric
          label="Taux confirmation"
          value={`${Math.round((confirmed.length / Math.max(orders.length, 1)) * 100)}%`}
          accent="bg-emerald-500"
          trend={{ value: "+5%", positive: true }}
        />
        <Metric
          label="Taux livraison"
          value={`${Math.round((delivered.length / Math.max(orders.length, 1)) * 100)}%`}
          accent="bg-indigo-500"
          trend={{ value: "-2%", positive: false }}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          label="En fabrication"
          value={inProduction.length.toString()}
          accent="bg-amber-500"
        />
        <Metric
          label="En préparation"
          value={inPreparation.length.toString()}
          accent="bg-purple-500"
        />
        <Metric
          label="En livraison"
          value={inDelivery.length.toString()}
          accent="bg-blue-500"
        />
        <Metric
          label="Retours"
          value={returns.length.toString()}
          accent="bg-rose-500"
        />
      </div>

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
                  className="grid grid-cols-[140px_1fr_50px] items-center gap-3 text-sm"
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

        {/* Production Queue */}
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
      </div>

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

      {/* Average Order Value */}
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
    </div>
  );
}
