import type { CrmPage, CrmRole, OrderStatus } from "./types";

export const crmPages: Array<{
  id: CrmPage;
  label: string;
  shortLabel: string;
  requiredRoles: CrmRole[];
}> = [
  { id: "overview", label: "Dashboard", shortLabel: "Dash", requiredRoles: ["admin", "commercial", "confirmation", "atelier_design", "fabrication", "preparation", "livraison"] },
  { id: "orders", label: "Commandes", shortLabel: "Cmd", requiredRoles: ["admin", "commercial", "confirmation", "fabrication", "preparation", "livraison"] },
  { id: "confirmation", label: "Confirmation", shortLabel: "Conf", requiredRoles: ["admin", "confirmation"] },
  { id: "sales", label: "Affaires", shortLabel: "Sales", requiredRoles: ["admin", "commercial"] },
  { id: "proposals", label: "Devis", shortLabel: "Devis", requiredRoles: ["admin", "commercial"] },
  { id: "contacts", label: "Contacts", shortLabel: "CRM", requiredRoles: ["admin", "commercial", "confirmation"] },
  { id: "companies", label: "Entreprises", shortLabel: "B2B", requiredRoles: ["admin", "commercial"] },
  { id: "activities", label: "Activités", shortLabel: "Act", requiredRoles: ["admin", "commercial"] },
  { id: "production", label: "Fabrication", shortLabel: "Prod", requiredRoles: ["admin", "fabrication"] },
  { id: "preparation", label: "Preparation", shortLabel: "Prep", requiredRoles: ["admin", "preparation"] },
  { id: "delivery", label: "Livraison", shortLabel: "Liv", requiredRoles: ["admin", "livraison", "preparation"] },
  { id: "catalog", label: "Catalogue", shortLabel: "Cat", requiredRoles: ["admin", "commercial", "atelier_design", "fabrication"] },
  { id: "tasks", label: "Taches", shortLabel: "Todo", requiredRoles: ["admin", "commercial", "confirmation", "atelier_design", "fabrication", "preparation", "livraison"] },
  { id: "users", label: "Utilisateurs", shortLabel: "Users", requiredRoles: ["admin"] },
  { id: "settings", label: "Parametres", shortLabel: "Cfg", requiredRoles: ["admin"] },
];

export const statusTransitions: Record<OrderStatus, OrderStatus[]> = {
  pas_confirme: ["confirme"],
  confirme: ["en_fabrication"],
  en_fabrication: ["en_preparation"],
  en_preparation: ["en_livraison"],
  en_livraison: ["livre", "retour_echec"],
  livre: [],
  retour_echec: [],
};

const transitionRoles: Record<string, CrmRole[]> = {
  "pas_confirme:confirme": ["admin", "confirmation"],
  "confirme:en_fabrication": ["admin", "fabrication"],
  "en_fabrication:en_preparation": ["admin", "fabrication"],
  "en_preparation:en_livraison": ["admin", "preparation"],
  "en_livraison:livre": ["admin", "livraison"],
  "en_livraison:retour_echec": ["admin", "livraison"],
};

export function hasAnyRole(userRoles: CrmRole[], allowed: CrmRole[]) {
  return userRoles.some((role) => allowed.includes(role));
}

export function canAccessPage(userRoles: CrmRole[], page: CrmPage) {
  const config = crmPages.find((item) => item.id === page);
  return config ? hasAnyRole(userRoles, config.requiredRoles) : false;
}

export function canChangeOrderStatus(
  userRoles: CrmRole[],
  from: OrderStatus,
  to: OrderStatus,
) {
  if (!statusTransitions[from].includes(to)) {
    return false;
  }

  return hasAnyRole(userRoles, transitionRoles[`${from}:${to}`] ?? []);
}

export function canManageContacts(userRoles: CrmRole[]) {
  return hasAnyRole(userRoles, ["admin", "commercial"]);
}

export function canCreateOrder(userRoles: CrmRole[]) {
  return hasAnyRole(userRoles, ["admin", "commercial", "confirmation"]);
}

export function canManageCatalog(userRoles: CrmRole[]) {
  return hasAnyRole(userRoles, ["admin", "atelier_design"]);
}

export function canManageUsers(userRoles: CrmRole[]) {
  return hasAnyRole(userRoles, ["admin"]);
}
