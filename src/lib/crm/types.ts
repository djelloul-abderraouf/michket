export const crmRoles = [
  "admin",
  "commercial",
  "confirmation",
  "atelier_design",
  "fabrication",
  "preparation",
  "livraison",
] as const;

export type CrmRole = (typeof crmRoles)[number];

export const roleLabels: Record<CrmRole, string> = {
  admin: "Admin",
  commercial: "Commercial",
  confirmation: "Confirmation",
  atelier_design: "Atelier / Design",
  fabrication: "Fabrication",
  preparation: "Preparation",
  livraison: "Livraison",
};

export const orderStatuses = [
  "pas_confirme",
  "confirme",
  "en_fabrication",
  "en_preparation",
  "en_livraison",
  "livre",
  "retour_echec",
] as const;

export type OrderStatus = (typeof orderStatuses)[number];

export const orderStatusLabels: Record<OrderStatus, string> = {
  pas_confirme: "Pas confirme",
  confirme: "Confirme",
  en_fabrication: "En fabrication",
  en_preparation: "En preparation",
  en_livraison: "En livraison",
  livre: "Livre",
  retour_echec: "Retour / echec",
};

export const dealStages = [
  "prospection",
  "qualification",
  "devis_envoye",
  "negociation",
  "gagnee",
  "perdue",
] as const;

export type DealStage = (typeof dealStages)[number];

export const dealStageLabels: Record<DealStage, string> = {
  prospection: "Prospection",
  qualification: "Qualification",
  devis_envoye: "Devis envoye",
  negociation: "Negociation",
  gagnee: "Gagnee",
  perdue: "Perdue",
};

export const productionStatuses = ["en_attente", "en_cours", "termine"] as const;

export type ProductionStatus = (typeof productionStatuses)[number];

export const productionStatusLabels: Record<ProductionStatus, string> = {
  en_attente: "En attente",
  en_cours: "En cours",
  termine: "Termine",
};

export type CrmPage =
  | "overview"
  | "orders"
  | "confirmation"
  | "sales"
  | "proposals"
  | "contacts"
  | "companies"
  | "activities"
  | "production"
  | "preparation"
  | "delivery"
  | "catalog"
  | "tasks"
  | "users"
  | "settings";

export type Priority = "basse" | "normale" | "haute" | "urgente";

export interface CrmUser {
  id: string;
  name: string;
  email: string;
  roles: CrmRole[];
  active: boolean;
  lastLoginAt: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  wilaya: string;
  type: "particulier" | "professionnel";
  companyId?: string;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  sector: string;
  commercialTerms: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: "lampe" | "trophee" | "carte" | "neon";
  price: number;
  photoUrl: string;
  averageBuildHours: number;
  active: boolean;
}

export interface ProposalItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Proposal {
  id: string;
  dealId: string;
  status: "brouillon" | "envoyee" | "acceptee" | "refusee";
  items: ProposalItem[];
  total: number;
  createdAt: string;
}

export interface Deal {
  id: string;
  title: string;
  contactId?: string;
  companyId?: string;
  estimatedAmount: number;
  stage: DealStage;
  ownerId: string;
  createdAt: string;
  expectedCloseAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderStatusEvent {
  id: string;
  from?: OrderStatus;
  to: OrderStatus;
  authorId: string;
  authorName: string;
  createdAt: string;
  note?: string;
}

export interface Order {
  id: string;
  source: "directe" | "affaire";
  clientName: string;
  phone: string;
  wilaya: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  notes?: string;
  confirmationReason?: "injoignable" | "refus" | "a_rappeler";
  reminderAt?: string;
  trackingNumber?: string;
  carrierStatus?: string;
  deliveredAt?: string;
  shippedAt?: string;
  returnReason?: string;
  createdAt: string;
  history: OrderStatusEvent[];
}

export interface ProductionJob {
  id: string;
  orderId: string;
  orderRef: string;
  clientName: string;
  productSummary: string;
  status: ProductionStatus;
  startedAt?: string;
  finishedAt?: string;
}

export interface Activity {
  id: string;
  type: "appel" | "message" | "visite";
  target: string;
  ownerId: string;
  description: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  status: "actif" | "termine";
}

export interface CrmTask {
  id: string;
  title: string;
  assigneeId: string;
  assigneeName: string;
  projectId?: string;
  dueAt: string;
  priority: Priority;
  done: boolean;
}
