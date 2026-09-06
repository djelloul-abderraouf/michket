import {
  demoActivities,
  demoCompanies,
  demoContacts,
  demoDeals,
  demoOrders,
  demoProductionJobs,
  demoProducts,
  demoProposals,
  demoProjects,
  demoTasks,
  demoUsers,
} from "./demo-data";
import { canChangeOrderStatus } from "./permissions";
import { crmTables, hasSupabaseConfig, supabaseRestFetch } from "./supabase";
import type {
  CrmRole,
  CrmTask,
  CrmUser,
  Order,
  OrderStatus,
  ProductionJob,
  ProductionStatus,
} from "./types";

export type CrmResource =
  | "users"
  | "contacts"
  | "companies"
  | "products"
  | "deals"
  | "proposals"
  | "orders"
  | "production"
  | "tasks"
  | "activities"
  | "projects";

const demoResourceMap = {
  users: demoUsers,
  contacts: demoContacts,
  companies: demoCompanies,
  products: demoProducts,
  deals: demoDeals,
  proposals: demoProposals,
  orders: demoOrders,
  production: demoProductionJobs,
  tasks: demoTasks,
  activities: demoActivities,
  projects: demoProjects,
};

const supabaseTableMap: Partial<Record<CrmResource, string>> = {
  users: crmTables.users,
  contacts: crmTables.contacts,
  companies: crmTables.companies,
  products: crmTables.products,
  deals: crmTables.deals,
  proposals: crmTables.proposals,
  orders: crmTables.orders,
  production: crmTables.production,
  tasks: crmTables.tasks,
  activities: crmTables.activities,
};

export async function listCrmResource(resource: CrmResource) {
  const table = supabaseTableMap[resource];

  if (hasSupabaseConfig() && table) {
    return supabaseRestFetch(table, {
      query: { select: "*", order: "created_at.desc" },
    });
  }

  return {
    source: "demo",
    data: demoResourceMap[resource],
  };
}

export async function createCrmResource<T extends Record<string, unknown>>(
  resource: CrmResource,
  payload: T,
) {
  const table = supabaseTableMap[resource];

  if (hasSupabaseConfig() && table) {
    return supabaseRestFetch(table, { method: "POST", body: payload });
  }

  return {
    source: "demo",
    data: {
      id: payload.id ?? `${resource}-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...payload,
    },
  };
}

export async function getCrmSummary() {
  const ordersByStatus = demoOrders.reduce<Record<string, number>>((acc, order) => {
    acc[order.status] = (acc[order.status] ?? 0) + 1;
    return acc;
  }, {});

  const revenue = demoOrders
    .filter((order) => order.status === "livre" || order.status === "en_livraison")
    .reduce((sum, order) => sum + order.total, 0);

  const topWilayas = Object.entries(
    demoOrders.reduce<Record<string, number>>((acc, order) => {
      acc[order.wilaya] = (acc[order.wilaya] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .map(([wilaya, count]) => ({ wilaya, count }))
    .sort((a, b) => b.count - a.count);

  const productsSold = Object.entries(
    demoOrders.flatMap((order) => order.items).reduce<Record<string, number>>(
      (acc, item) => {
        acc[item.productName] = (acc[item.productName] ?? 0) + item.quantity;
        return acc;
      },
      {},
    ),
  )
    .map(([productName, quantity]) => ({ productName, quantity }))
    .sort((a, b) => b.quantity - a.quantity);

  const confirmationPool = demoOrders.filter((order) =>
    ["pas_confirme", "confirme", "en_fabrication", "en_preparation", "en_livraison", "livre"].includes(order.status),
  );
  const confirmedCount = confirmationPool.filter(
    (order) => order.status !== "pas_confirme",
  ).length;

  return {
    source: hasSupabaseConfig() ? "supabase-ready-demo-summary" : "demo",
    data: {
      ordersByStatus,
      revenue,
      pipelineAmount: demoDeals.reduce((sum, deal) => sum + deal.estimatedAmount, 0),
      confirmationRate: Math.round((confirmedCount / confirmationPool.length) * 100),
      averageEndToEndDays: 4.2,
      averageDeliveryDays: 2.1,
      returnRateByWilaya: [
        { wilaya: "Alger", rate: 3 },
        { wilaya: "Oran", rate: 6 },
        { wilaya: "Setif", rate: 4 },
      ],
      topWilayas,
      productsSold,
    },
  };
}

export async function loginDemo(email: string) {
  const user = demoUsers.find(
    (item) => item.email.toLowerCase() === email.toLowerCase() && item.active,
  );

  if (!user) {
    return {
      ok: false,
      message: "Utilisateur introuvable ou desactive.",
    };
  }

  if (hasSupabaseConfig()) {
    await supabaseRestFetch(crmTables.loginAudit, {
      method: "POST",
      body: { user_id: user.id, logged_at: new Date().toISOString() },
    });
  }

  return { ok: true, user };
}

export async function updateOrderStatus({
  orderId,
  to,
  roles,
  author,
  note,
}: {
  orderId: string;
  to: OrderStatus;
  roles: CrmRole[];
  author: Pick<CrmUser, "id" | "name">;
  note?: string;
}) {
  const order = demoOrders.find((item) => item.id === orderId);

  if (!order) {
    return { ok: false, message: "Commande introuvable." };
  }

  if (!canChangeOrderStatus(roles, order.status, to)) {
    return {
      ok: false,
      message: `Transition refusee pour vos roles: ${order.status} -> ${to}.`,
    };
  }

  const updatedOrder: Order = {
    ...order,
    status: to,
    history: [
      ...order.history,
      {
        id: `hst-${order.id}-${Date.now()}`,
        from: order.status,
        to,
        authorId: author.id,
        authorName: author.name,
        createdAt: new Date().toISOString(),
        note,
      },
    ],
  };

  if (hasSupabaseConfig()) {
    await supabaseRestFetch(crmTables.orders, {
      method: "PATCH",
      query: { id: `eq.${orderId}` },
      body: { status: to, updated_at: new Date().toISOString() },
    });

    await supabaseRestFetch(crmTables.orderHistory, {
      method: "POST",
      body: {
        order_id: orderId,
        from_status: order.status,
        to_status: to,
        author_id: author.id,
        note,
      },
    });
  }

  return { ok: true, source: "demo", data: updatedOrder };
}

export async function updateProductionJob({
  jobId,
  status,
}: {
  jobId: string;
  status: ProductionStatus;
}) {
  const job = demoProductionJobs.find((item) => item.id === jobId);

  if (!job) {
    return { ok: false, message: "Production introuvable." };
  }

  const updatedJob: ProductionJob = {
    ...job,
    status,
    startedAt: status === "en_cours" ? new Date().toISOString() : job.startedAt,
    finishedAt: status === "termine" ? new Date().toISOString() : job.finishedAt,
  };

  if (hasSupabaseConfig()) {
    await supabaseRestFetch(crmTables.production, {
      method: "PATCH",
      query: { id: `eq.${jobId}` },
      body: {
        status,
        started_at: updatedJob.startedAt,
        finished_at: updatedJob.finishedAt,
      },
    });
  }

  return { ok: true, source: "demo", data: updatedJob };
}

export async function createDemoTask(payload: Partial<CrmTask>) {
  return createCrmResource("tasks", {
    ...payload,
    done: false,
  });
}
