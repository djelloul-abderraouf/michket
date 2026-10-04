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
  "annulee",
] as const;

export type OrderStatus = (typeof orderStatuses)[number];

export const orderStatusLabels: Record<OrderStatus, string> = {
  pas_confirme: "Pas confirmé",
  confirme: "Confirmé",
  en_fabrication: "En fabrication",
  en_preparation: "En préparation",
  en_livraison: "En livraison",
  livre: "Livré",
  retour_echec: "Retour / échec",
  annulee: "Annulée",
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
  devis_envoye: "Devis envoyé",
  negociation: "Négociation",
  gagnee: "Gagnée",
  perdue: "Perdue",
};

export const productionStatuses = ["en_attente", "en_cours", "termine"] as const;

export type ProductionStatus = (typeof productionStatuses)[number];

export const productionStatusLabels: Record<ProductionStatus, string> = {
  en_attente: "En attente",
  en_cours: "En cours",
  termine: "Terminé",
};

export const plancheStatuses = ["en_attente", "lancee", "terminee"] as const;

export type PlancheStatus = (typeof plancheStatuses)[number];

export const plancheStatusLabels: Record<PlancheStatus, string> = {
  en_attente: "En attente",
  lancee: "Lancée",
  terminee: "Terminée",
};

export type CrmPage =
  | "overview"
  | "orders"
  | "orders_prospection"
  | "orders_prioritaire"
  | "orders_archive"
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

export const orderKinds = [
  "urgent",
  "propre",
  "refabrication_0",
  "correction_interne",
  "recupe",
] as const;

export type OrderKind = (typeof orderKinds)[number];

export const orderKindLabels: Record<OrderKind, string> = {
  urgent: "Urgent",
  propre: "Propre",
  refabrication_0: "Refabrication 0 DA",
  correction_interne: "Correction interne",
  recupe: "Récupé",
};

export const duplicateStatuses = ["unique", "a_verifier", "verifie"] as const;

export type DuplicateStatus = (typeof duplicateStatuses)[number];

export const duplicateStatusLabels: Record<DuplicateStatus, string> = {
  unique: "Unique",
  a_verifier: "Doublant à vérifier",
  verifie: "Doublant vérifié",
};

export function staffRoleLabel(role: string) {
  if (role === "super_admin") {
    return "Super admin";
  }
  if (role in roleLabels) {
    return roleLabels[role as CrmRole];
  }
  return role;
}

export interface CrmUser {
  id: string;
  name: string;
  email: string;
  roles: CrmRole[];
  assignedRoles?: string[];
  active: boolean;
  lastLoginAt?: string;
  businessRole?: string;
  phone?: string;
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
  source?: "boutique" | "crm";
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  sector: string;
  commercialTerms: string;
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  colorName?: string | null;
  colorHex?: string | null;
}

export interface Product {
  id: string;
  name: string;
  slug?: string;
  category: string;
  categoryId?: string;
  categorySlug?: string;
  price: number;
  photoUrl: string;
  averageBuildHours: number;
  active: boolean;
  isPersonalizable?: boolean;
  variants?: ProductVariant[];
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  imageStoragePath?: string | null;
  href?: string | null;
  parentId?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
  pageTitle?: string | null;
  productsTitle?: string | null;
  filterLabel?: string | null;
}

export interface CreateCrmCategoryPayload {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  imageStoragePath?: string;
  href?: string;
  parentId?: string;
  isActive?: boolean;
  sortOrder?: number;
  metaTitle?: string;
  metaDescription?: string;
  pageTitle?: string;
  productsTitle?: string;
  filterLabel?: string;
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

export type OrderSource = "ecom" | "whatsapp" | "facebook" | "instagram";

export type ClientType = "particulier" | "professionnel";

export interface OrderItem {
  productId: string;
  productName: string;
  productSlug?: string;
  variantName?: string | null;
  colorName?: string | null;
  colorHex?: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal?: number;
  personalization?: unknown;
  personalizationText?: string;
}

export interface OrderRemark {
  id: string;
  body: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

export interface OrderContactAttempt {
  id: string;
  attemptNumber: number;
  notes: string;
  employeeId: string;
  employeeName: string;
  createdAt: string;
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

export interface YalidineCenter {
  centerId: number;
  name: string;
  address?: string;
  commune?: string;
  wilaya?: string;
}

export interface CreateCrmOrderPayload {
  firstName: string;
  lastName?: string;
  phone: string;
  email?: string;
  wilayaName: string;
  wilayaCode?: number;
  commune?: string;
  addressLine1?: string;
  source: OrderSource;
  deliveryType: "home" | "office";
  deliveryOfficeName?: string;
  deliveryOfficeId?: string;
  clientType?: ClientType;
  contactId?: string;
  productId?: string;
  variantId?: string;
  colorName?: string;
  personalizationText?: string;
  quantity?: number;
  notes?: string;
  orderKind: OrderKind;
}

export interface Order {
  id: string;
  reference?: string;
  source: OrderSource;
  campaignId?: string | null;
  campaignSlug?: string | null;
  campaignTitle?: string | null;
  clientName: string;
  firstName?: string;
  lastName?: string;
  phone: string;
  email?: string | null;
  clientType?: ClientType | null;
  isExistingClient?: boolean;
  previousOrderCount?: number;
  duplicateStatus?: DuplicateStatus;
  duplicateReview?: "unique" | "verifie" | null;
  duplicateReviewedById?: string | null;
  duplicateReviewedByName?: string | null;
  duplicateReviewedAt?: string | null;
  contactId?: string | null;
  wilaya: string;
  wilayaCode?: number;
  commune?: string;
  addressLine1?: string;
  addressLine2?: string | null;
  deliveryType?: string;
  deliveryOfficeName?: string | null;
  paymentMethod?: string;
  paymentStatus?: string;
  promoCode?: string | null;
  subtotal?: number;
  deliveryFee?: number;
  discount?: number;
  currency?: string;
  dbStatus?: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  notes?: string;
  orderKind?: OrderKind | null;
  remarks?: OrderRemark[];
  contactAttempts?: OrderContactAttempt[];
  cancelReason?: string | null;
  confirmationReason?: "injoignable" | "refus" | "a_rappeler";
  reminderAt?: string;
  trackingNumber?: string | null;
  carrier?: string | null;
  carrierStatus?: string | null;
  yalidineStatus?: string | null;
  yalidineSyncedAt?: string | null;
  labelUrl?: string | null;
  deliveredAt?: string;
  shippedAt?: string;
  cancelledAt?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt?: string;
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

export interface PlancheOrder {
  orderId: string;
  reference: string;
  clientName: string;
  phone: string;
  wilaya: string;
  productSummary: string;
}

export interface PlancheEvent {
  id: string;
  action: "created" | "status" | "orders_added" | "orders_removed" | "capacity";
  fromStatus?: PlancheStatus | null;
  toStatus?: PlancheStatus | null;
  note?: string | null;
  actorName: string;
  createdAt: string;
}

export interface Planche {
  id: string;
  reference: string;
  capacity: number;
  status: PlancheStatus;
  createdByName?: string | null;
  launchedAt?: string | null;
  finishedAt?: string | null;
  createdAt: string;
  orders: PlancheOrder[];
  events: PlancheEvent[];
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
