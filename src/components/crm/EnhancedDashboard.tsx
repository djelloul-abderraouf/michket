import { useState, useEffect } from "react";
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
  Bar
} from 'recharts';
import { CrmPanel, dzd, Metric } from "./CrmUi";
import { dashboardApi } from "@/lib/api-client";
import { orderStatusLabels, type OrderStatus } from "@/lib/crm/types";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

interface DashboardStats {
  revenue: {
    total: number;
    avgOrderValue: number;
    totalOrders: number;
  };
  orderStatusBreakdown: Array<{
    status: string;
    count: number;
    total: number;
  }>;
  topWilayas: Array<{
    wilaya: string;
    count: number;
    total: number;
  }>;
  revenueTrends: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  productionQueue: Array<{
    status: string;
    count: number;
  }>;
  dealsPipeline: Array<{
    stage: string;
    count: number;
    total: number;
  }>;
  recentOrders: any[];
}

interface KPIs {
  revenue: {
    currentMonth: number;
    lastMonth: number;
    growthRate: number;
  };
  orders: {
    currentMonth: number;
    confirmationRate: number;
    deliveryRate: number;
  };
  production: {
    inProgress: number;
  };
  sales: {
    pipelineAmount: number;
  };
}

export function EnhancedDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [kpis, setKPIs] = useState<KPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [enhancedStats, kpiData] = await Promise.all([
        dashboardApi.getEnhancedStats(),
        dashboardApi.getKPIs(),
      ]);

      setStats(enhancedStats);
      setKPIs(kpiData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const orderStatusData = stats.orderStatusBreakdown.map(item => ({
    name: orderStatusLabels[item.status as OrderStatus] || item.status,
    value: item.count,
  }));

  const productionData = stats.productionQueue.map(item => ({
    name: item.status,
    value: item.count,
  }));

  const dealsData = stats.dealsPipeline.map(item => ({
    name: item.stage,
    value: item.count,
    amount: item.total,
  }));

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          label="CA du mois"
          value={dzd.format(kpis.revenue.currentMonth)}
          accent="bg-michket-gold"
          trend={{ 
            value: `${kpis.revenue.growthRate > 0 ? '+' : ''}${kpis.revenue.growthRate.toFixed(1)}%`, 
            positive: kpis.revenue.growthRate > 0 
          }}
        />
        <Metric
          label="Pipeline ventes"
          value={dzd.format(kpis.sales.pipelineAmount)}
          accent="bg-cyan-500"
        />
        <Metric
          label="Taux confirmation"
          value={`${kpis.orders.confirmationRate.toFixed(1)}%`}
          accent="bg-emerald-500"
        />
        <Metric
          label="Taux livraison"
          value={`${kpis.orders.deliveryRate.toFixed(1)}%`}
          accent="bg-indigo-500"
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          label="Commandes ce mois"
          value={kpis.orders.currentMonth.toString()}
          accent="bg-purple-500"
        />
        <Metric
          label="En production"
          value={kpis.production.inProgress.toString()}
          accent="bg-amber-500"
        />
        <Metric
          label="Panier moyen"
          value={dzd.format(stats.revenue.avgOrderValue)}
          accent="bg-blue-500"
        />
        <Metric
          label="Total commandes"
          value={stats.revenue.totalOrders.toString()}
          accent="bg-rose-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Trend */}
        <CrmPanel title="Tendance du revenu (30 jours)">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.revenueTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value) => [dzd.format(Number(value || 0)), 'Revenu']}
                labelFormatter={(value) => new Date(String(value)).toLocaleDateString('fr-FR')}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#8884d8" 
                strokeWidth={2}
                name="Revenu"
              />
            </LineChart>
          </ResponsiveContainer>
        </CrmPanel>

        {/* Order Status Distribution */}
        <CrmPanel title="Distribution des commandes par statut">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={orderStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(((percent || 0) as number) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {orderStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CrmPanel>
      </div>

      {/* More Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Wilayas */}
        <CrmPanel title="Top Wilayas">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.topWilayas}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="wilaya" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value) => [Number(value || 0), 'Commandes']}
              />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="Commandes" />
            </BarChart>
          </ResponsiveContainer>
        </CrmPanel>

        {/* Production Queue */}
        <CrmPanel title="File de production">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={productionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(((percent || 0) as number) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {productionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CrmPanel>
      </div>

      {/* Deals Pipeline */}
      <CrmPanel title="Pipeline des ventes">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dealsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              formatter={(value, name) => [
                name === 'amount' ? dzd.format(Number(value || 0)) : Number(value || 0),
                name === 'amount' ? 'Montant' : 'Nombre'
              ]}
            />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" name="Nombre de deals" />
            <Bar dataKey="amount" fill="#82ca9d" name="Montant total" />
          </BarChart>
        </ResponsiveContainer>
      </CrmPanel>

      {/* Detailed Stats */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CrmPanel title="Statistiques des commandes">
          <div className="space-y-3">
            {stats.orderStatusBreakdown.map((item) => (
              <div key={item.status} className="flex justify-between items-center p-3 bg-black/[0.02] rounded-lg">
                <span className="font-medium capitalize">{orderStatusLabels[item.status as OrderStatus] || item.status.replace('_', ' ')}</span>
                <div className="text-right">
                  <span className="font-bold">{item.count}</span>
                  <span className="text-sm text-black/60 ml-2">{dzd.format(item.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </CrmPanel>

        <CrmPanel title="Top Wilayas détaillé">
          <div className="space-y-3">
            {stats.topWilayas.map((item, index) => (
              <div key={item.wilaya} className="flex justify-between items-center p-3 bg-black/[0.02] rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <span className="font-medium">{item.wilaya}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold">{item.count}</span>
                  <span className="text-sm text-black/60 ml-2">{dzd.format(item.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </CrmPanel>
      </div>
    </div>
  );
}