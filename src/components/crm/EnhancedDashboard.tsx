import { useEffect, useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";
import { CrmPanel, dzd, Metric } from "./CrmUi";
import { dashboardApi } from "@/lib/api-client";
import { ALGERIA_WILAYAS } from "@/lib/crm/wilayas";
import { orderStatusLabels, roleLabels, type CrmRole, type OrderStatus } from "@/lib/crm/types";

function sees(roles: CrmRole[], audience: CrmRole[]) {
  return roles.includes("admin") || roles.some((role) => audience.includes(role));
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#ef4444"];

type PeriodKey = "7d" | "30d" | "90d" | "month" | "all";

function periodRange(period: PeriodKey) {
  if (period === "all") {
    return { from: undefined as string | undefined, to: undefined as string | undefined };
  }
  const to = new Date();
  const from = new Date();
  if (period === "month") {
    from.setDate(1);
  } else {
    const days = period === "7d" ? 7 : period === "90d" ? 90 : 30;
    from.setDate(from.getDate() - days);
  }
  return { from: from.toISOString(), to: to.toISOString() };
}

export function EnhancedDashboard({
  userName,
  roles,
  stockAlertCount = 0,
}: {
  userName: string;
  roles: CrmRole[];
  stockAlertCount?: number;
}) {
  const [period, setPeriod] = useState<PeriodKey>("30d");
  const [wilaya, setWilaya] = useState("all");
  const [stats, setStats] = useState<any>(null);
  const [kpis, setKPIs] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const query = useMemo(() => {
    const range = periodRange(period);
    return { from: range.from, to: range.to, wilaya };
  }, [period, wilaya]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      dashboardApi.getEnhancedStats(query),
      dashboardApi.getKPIs(query),
    ])
      .then(([enhancedStats, kpiData]) => {
        if (cancelled) return;
        setStats(enhancedStats);
        setKPIs(kpiData);
      })
      .catch((error) => {
        console.error("Error loading dashboard data:", error);
        if (!cancelled) {
          setStats(null);
          setKPIs(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  const wilayaOptions = stats?.wilayas?.length
    ? stats.wilayas
    : ALGERIA_WILAYAS.map((item) => item.name);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Chargement des données...</div>
      </div>
    );
  }

  if (!stats || !kpis) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Erreur lors du chargement des données</div>
      </div>
    );
  }

  const orderStatusData = (stats.orderStatusBreakdown || []).map((item: any) => ({
    name: orderStatusLabels[item.status as OrderStatus] || item.status,
    value: item.count,
  }));
  const productionData = (stats.productionQueue || []).map((item: any) => ({
    name: item.status,
    value: item.count,
  }));
  const dealsData = (stats.dealsPipeline || []).map((item: any) => ({
    name: item.stage,
    value: item.count,
    amount: item.total,
  }));
  const funnel = stats.funnel || {};
  const roleLine = (roles.includes("admin") ? ["admin"] : roles)
    .map((role) => roleLabels[role] || role)
    .join(" · ");
  const returnRate = kpis.orders.currentMonth
    ? (Number(kpis.orders.cancelled || 0) / Number(kpis.orders.currentMonth)) * 100
    : 0;
  const cards = [
    sees(roles, ["commercial"]) && {
      label: "CA livré (mois)",
      value: dzd.format(kpis.revenue.currentMonth),
      accent: "bg-michket-gold",
      trend: {
        value: `${kpis.revenue.growthRate > 0 ? "+" : ""}${Number(kpis.revenue.growthRate).toFixed(1)}% vs mois dernier`,
        positive: kpis.revenue.growthRate >= 0,
      },
    },
    sees(roles, ["commercial"]) && {
      label: "GMV période",
      value: dzd.format(kpis.revenue.gmv || stats.revenue.gmv || 0),
      accent: "bg-cyan-500",
    },
    sees(roles, ["commercial", "confirmation"]) && {
      label: "Taux confirmation",
      value: `${Number(kpis.orders.confirmationRate).toFixed(1)}%`,
      accent: "bg-emerald-500",
    },
    sees(roles, ["livraison", "preparation", "commercial"]) && {
      label: "Taux livraison",
      value: `${Number(kpis.orders.deliveryRate).toFixed(1)}%`,
      accent: "bg-indigo-500",
    },
    sees(roles, ["commercial", "confirmation", "fabrication", "preparation", "livraison"]) && {
      label: "Commandes période",
      value: String(kpis.orders.currentMonth),
      accent: "bg-purple-500",
    },
    sees(roles, ["confirmation", "commercial"]) && {
      label: "À confirmer",
      value: String(kpis.orders.pending || funnel.pending || 0),
      accent: "bg-amber-500",
    },
    sees(roles, ["fabrication"]) && {
      label: "Confirmées",
      value: String(kpis.orders.confirmed || funnel.confirmed || 0),
      accent: "bg-emerald-600",
    },
    sees(roles, ["fabrication", "preparation"]) && {
      label: "En fabrication / préparation",
      value: String(kpis.orders.processing || funnel.processing || 0),
      accent: "bg-orange-500",
    },
    sees(roles, ["livraison", "preparation"]) && {
      label: "Expédiées",
      value: String(kpis.orders.shipped || funnel.shipped || 0),
      accent: "bg-blue-500",
    },
    sees(roles, ["confirmation", "livraison", "commercial"]) && {
      label: "Annulées / retours",
      value: String(kpis.orders.cancelled || funnel.cancelled || 0),
      accent: "bg-rose-500",
      trend: { value: `${returnRate.toFixed(1)}% de la période`, positive: returnRate < 10 },
    },
    sees(roles, ["commercial"]) && {
      label: "Panier moyen",
      value: dzd.format(kpis.orders.avgOrderValue || stats.revenue.avgOrderValue),
      accent: "bg-sky-500",
    },
    sees(roles, ["commercial"]) && {
      label: "Pipeline ventes",
      value: dzd.format(kpis.sales.pipelineAmount),
      accent: "bg-teal-500",
    },
    sees(roles, ["fabrication"]) && {
      label: "Jobs en cours",
      value: String(kpis.production.inProgress),
      accent: "bg-amber-600",
    },
    sees(roles, ["atelier_design", "commercial"]) && {
      label: "Tâches ouvertes",
      value: String(kpis.tasks?.open || 0),
      accent: "bg-slate-500",
    },
    sees(roles, ["commercial", "fabrication", "preparation"]) && stockAlertCount > 0 && {
      label: "Alertes stock",
      value: String(stockAlertCount),
      accent: "bg-rose-600",
    },
  ].filter(Boolean) as Array<{ label: string; value: string; accent: string; trend?: { value: string; positive: boolean } }>;

  return (
    <div className="space-y-6">
      <CrmPanel className="!p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {([
              ["7d", "7 jours"],
              ["30d", "30 jours"],
              ["month", "Ce mois"],
              ["90d", "90 jours"],
              ["all", "Tout"],
            ] as Array<[PeriodKey, string]>).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setPeriod(key)}
                className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                  period === key ? "bg-black text-white" : "bg-black/5 text-black/70"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <select
            value={wilaya}
            onChange={(event) => setWilaya(event.target.value)}
            className="h-11 rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold"
          >
            <option value="all">Toutes wilayas</option>
            {wilayaOptions.map((name: string) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </CrmPanel>

      <p className="text-sm text-black/55">{userName} · {roleLine}</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Metric key={card.label} label={card.label} value={card.value} accent={card.accent} trend={card.trend} />
        ))}
      </div>

      {sees(roles, ["commercial"]) && (
      <div className="grid gap-6 lg:grid-cols-2">
        <CrmPanel title="Commandes et GMV">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={stats.revenueTrends || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={(value) => new Date(value).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="orders" name="Commandes" stroke="#8884d8" fill="#8884d8" fillOpacity={0.2} />
              <Area type="monotone" dataKey="gmv" name="GMV" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.15} />
            </AreaChart>
          </ResponsiveContainer>
        </CrmPanel>
        <CrmPanel title="Revenu livré">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.revenueTrends || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={(value) => new Date(value).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value) => [dzd.format(Number(value || 0)), "Revenu"]} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} name="Revenu livré" />
            </LineChart>
          </ResponsiveContainer>
        </CrmPanel>
      </div>
      )}

      {sees(roles, ["commercial", "confirmation", "livraison"]) && (
      <div className="grid gap-6 lg:grid-cols-2">
        <CrmPanel title="Distribution par statut">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={orderStatusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(((percent || 0) as number) * 100).toFixed(0)}%`}>
                {orderStatusData.map((_: unknown, index: number) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CrmPanel>
        <CrmPanel title="Top wilayas">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.topWilayas || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="wilaya" tick={{ fontSize: 11 }} interval={0} angle={-25} textAnchor="end" height={70} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" name="Commandes" />
            </BarChart>
          </ResponsiveContainer>
        </CrmPanel>
      </div>
      )}

      {sees(roles, ["commercial", "livraison"]) && (
      <div className="grid gap-6 lg:grid-cols-2">
        <CrmPanel title="Paiement">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.paymentBreakdown || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#00C49F" name="Commandes" />
            </BarChart>
          </ResponsiveContainer>
        </CrmPanel>
        <CrmPanel title="Type de livraison">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={stats.deliveryTypeBreakdown || []} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={80} label>
                {(stats.deliveryTypeBreakdown || []).map((_: unknown, index: number) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CrmPanel>
      </div>
      )}

      {(sees(roles, ["fabrication"]) || sees(roles, ["commercial"])) && (
      <div className="grid gap-6 lg:grid-cols-2">
        {sees(roles, ["fabrication"]) && (
        <CrmPanel title="File de production">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={productionData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(((percent || 0) as number) * 100).toFixed(0)}%`}>
                {productionData.map((_: unknown, index: number) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CrmPanel>
        )}
        {sees(roles, ["commercial"]) && (
        <CrmPanel title="Pipeline des ventes">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dealsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" name="Deals" />
            </BarChart>
          </ResponsiveContainer>
        </CrmPanel>
        )}
      </div>
      )}
    </div>
  );
}
