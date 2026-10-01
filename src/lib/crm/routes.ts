import type { CrmPage } from "./types";

export const crmPagePaths: Record<CrmPage, string> = {
  overview: "/crm/dashboard",
  orders: "/crm/orders",
  orders_prospection: "/crm/orders/prospection",
  orders_prioritaire: "/crm/orders/prioritaire",
  orders_archive: "/crm/orders/archive",
  confirmation: "/crm/confirmation",
  sales: "/crm/sales",
  proposals: "/crm/proposals",
  contacts: "/crm/contacts",
  companies: "/crm/companies",
  activities: "/crm/activities",
  production: "/crm/production",
  preparation: "/crm/preparation",
  delivery: "/crm/delivery",
  catalog: "/crm/catalog",
  tasks: "/crm/tasks",
  users: "/crm/users",
  settings: "/crm/settings",
};
