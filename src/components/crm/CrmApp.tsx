"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  canAccessPage,
  canChangeOrderStatus,
  canCreateOrder,
  canManageCatalog,
  canManageContacts,
  canManageUsers,
} from "@/lib/crm/permissions";
import {
  dealStageLabels,
  orderStatusLabels,
  roleLabels,
  type Activity,
  type Company,
  type Contact,
  type CrmPage,
  type CrmTask,
  type CrmUser,
  type CreateCrmOrderPayload,
  type Deal,
  type Order,
  type OrderStatus,
  type Product,
  type ProductCategory,
  type ProductionJob,
  type Proposal,
} from "@/lib/crm/types";
import { CrmActivities } from "./CrmActivities";
import { CrmCatalog } from "./CrmCatalog";
import { CrmCompanies } from "./CrmCompanies";
import { CrmConfirmation } from "./CrmConfirmation";
import { CrmContacts } from "./CrmContacts";
import { CrmDashboard } from "./CrmDashboard";
import { CrmDelivery } from "./CrmDelivery";
import { CrmOrders } from "./CrmOrders";
import { CrmPreparation } from "./CrmPreparation";
import { CrmProduction } from "./CrmProduction";
import { CrmProposals } from "./CrmProposals";
import { CrmSales } from "./CrmSales";
import { CrmSettings } from "./CrmSettings";
import { CrmSidebar } from "./CrmSidebar";
import { CrmTasks } from "./CrmTasks";
import { CrmUsers } from "./CrmUsers";
import { EnhancedDashboard } from "./EnhancedDashboard";
import { CrmButton, cx } from "./CrmUi";
import { crmPagePaths } from "@/lib/crm/routes";
import { normalizeOrder } from "@/lib/crm/normalize-order";
import { useCrmOrdersRealtime } from "@/lib/crm/use-crm-orders-realtime";
import {
  crmActivitiesApi,
  crmCompaniesApi,
  crmCustomersApi,
  crmDealsApi,
  crmDeliveryApi,
  crmOrdersApi,
  crmProductionApi,
  crmProductsApi,
  crmProposalsApi,
  crmTasksApi,
  crmUsersApi,
  mapApiUserToCrmUser,
} from "@/lib/api-client";

function mapUserRoleToCrmRoles(role: string): CrmUser["roles"] {
  const roleMapping: Record<string, CrmUser["roles"]> = {
    admin: ["admin", "commercial", "confirmation", "atelier_design", "fabrication", "preparation", "livraison"],
    super_admin: ["admin", "commercial", "confirmation", "atelier_design", "fabrication", "preparation", "livraison"],
    commercial: ["commercial"],
    fabrication: ["fabrication"],
    preparation: ["preparation"],
    livraison: ["livraison"],
    confirmation: ["confirmation"],
  };
  return roleMapping[role] || [];
}

function pageFromPath(pathname: string): CrmPage {
  const match = (Object.entries(crmPagePaths) as [CrmPage, string][]).find(
    ([, path]) => pathname === path || pathname.startsWith(`${path}/`),
  );
  return match?.[0] ?? "overview";
}

function toIsoDate(value: string): string {
  if (!value) {
    return new Date().toISOString();
  }
  if (value.includes("T")) {
    return new Date(value).toISOString();
  }
  return new Date(`${value}T12:00:00`).toISOString();
}

function upsertOrder(current: Order[], next: Order) {
  const exists = current.some((order) => order.id === next.id);
  if (exists) {
    return current.map((order) => (order.id === next.id ? next : order));
  }
  return [next, ...current];
}

export function CrmApp() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, loading, signOut } = useAuth();
  const activePage = pageFromPath(pathname || "");
  const loadedUserId = useRef<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [productionJobs, setProductionJobs] = useState<ProductionJob[]>([]);
  const [tasks, setTasks] = useState<CrmTask[]>([]);
  const [crmUsers, setCrmUsers] = useState<CrmUser[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [wilayaFilter, setWilayaFilter] = useState("all");
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [qualityChecked, setQualityChecked] = useState(false);
  const [toast, setToast] = useState("Systeme connecte avec Supabase");
  const [useEnhancedDashboard, setUseEnhancedDashboard] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const crmUser: CrmUser = useMemo(() => {
    if (!profile) {
      return {
        id: "",
        name: "Chargement...",
        email: "",
        roles: [],
        active: false,
      };
    }

    return {
      id: profile.id,
      name: `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || profile.email,
      email: profile.email,
      roles: mapUserRoleToCrmRoles(profile.role),
      active: profile.is_active,
    };
  }, [profile]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/crm/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && profile && loadedUserId.current !== profile.id) {
      loadedUserId.current = profile.id;
      void loadCrmData();
    }
  }, [user, profile]);

  const ordersRef = useRef<Order[]>([]);
  ordersRef.current = orders;

  useCrmOrdersRealtime({
    enabled: Boolean(user && profile?.is_active),
    onUpsert: (order, event) => {
      const previous = ordersRef.current.find((item) => item.id === order.id);
      setOrders((current) => upsertOrder(current, order));
      setSelectedOrderId((current) => current || order.id);
      if (!previous && event === "INSERT") {
        setToast(`Nouvelle commande: ${order.reference || order.clientName}`);
      } else if (previous && previous.status !== order.status) {
        setToast(
          `Commande ${order.reference || order.clientName}: ${orderStatusLabels[order.status]}`,
        );
      }
    },
    onDelete: (orderId) => {
      const remaining = ordersRef.current.filter((item) => item.id !== orderId);
      setOrders(remaining);
      setSelectedOrderId((selected) =>
        selected === orderId ? remaining[0]?.id || "" : selected,
      );
      setToast("Commande supprimee");
    },
  });

  const loadCrmData = async () => {
    setIsLoading(true);
    const roles = mapUserRoleToCrmRoles(profile?.role || "");
    const skip = <T,>(value: T) => Promise.resolve(value);

    try {
      const [
        ordersResponse,
        contactsResponse,
        companiesResponse,
        dealsResponse,
        proposalsResponse,
        activitiesResponse,
        productsResponse,
        productionResponse,
        tasksResponse,
        usersResponse,
      ] = await Promise.allSettled([
        crmOrdersApi.getAll({ limit: 100 }),
        canAccessPage(roles, "contacts")
          ? crmCustomersApi.getAll()
          : skip([] as Contact[]),
        canAccessPage(roles, "companies")
          ? crmCompaniesApi.getAll()
          : skip([] as Company[]),
        canAccessPage(roles, "sales")
          ? crmDealsApi.getAll()
          : skip([] as Deal[]),
        canAccessPage(roles, "proposals")
          ? crmProposalsApi.getAll()
          : skip([] as Proposal[]),
        canAccessPage(roles, "activities")
          ? crmActivitiesApi.getAll()
          : skip([] as Activity[]),
        canAccessPage(roles, "catalog") || canCreateOrder(roles)
          ? crmProductsApi.getAll()
          : skip([] as Product[]),
        canAccessPage(roles, "production")
          ? crmProductionApi.getAll()
          : skip([] as ProductionJob[]),
        crmTasksApi.getAll(),
        canManageUsers(roles)
          ? crmUsersApi.getAll()
          : skip([]),
      ]);

      const failed = [
        ordersResponse,
        contactsResponse,
        companiesResponse,
        dealsResponse,
        proposalsResponse,
        activitiesResponse,
        productsResponse,
        productionResponse,
        tasksResponse,
        usersResponse,
      ].filter((result) => result.status === "rejected").length;

      if (failed > 0) {
        setToast(`${failed} module(s) n'ont pas pu etre charges`);
      } else {
        setToast("Donnees CRM synchronisees");
      }

      if (ordersResponse.status === "fulfilled") {
        const mappedOrders = (ordersResponse.value.data || []).map(normalizeOrder);
        setOrders(mappedOrders);
        if (mappedOrders.length > 0) {
          setSelectedOrderId((current) => current || mappedOrders[0].id);
        }
      } else {
        console.error(ordersResponse.reason);
      }

      if (contactsResponse.status === "fulfilled") {
        setContacts(contactsResponse.value || []);
      }
      if (companiesResponse.status === "fulfilled") {
        setCompanies(companiesResponse.value || []);
      }
      if (dealsResponse.status === "fulfilled") {
        setDeals(
          (dealsResponse.value || []).map((deal) => ({
            ...deal,
            estimatedAmount: Number(deal.estimatedAmount),
            expectedCloseAt: deal.expectedCloseAt || deal.createdAt,
          })),
        );
      }
      if (proposalsResponse.status === "fulfilled") {
        setProposals(
          (proposalsResponse.value || []).map((proposal) => ({
            ...proposal,
            total: Number(proposal.total),
            items: proposal.items || [],
          })),
        );
      }
      if (activitiesResponse.status === "fulfilled") {
        setActivities(activitiesResponse.value || []);
      }
      if (productsResponse.status === "fulfilled") {
        setProducts(productsResponse.value || []);
        if (canAccessPage(roles, "catalog") || canManageCatalog(roles)) {
          void crmProductsApi.getCategories().then(setCategories).catch(() => undefined);
        }
      }
      if (productionResponse.status === "fulfilled") {
        setProductionJobs(productionResponse.value || []);
      }
      if (tasksResponse.status === "fulfilled") {
        setTasks(tasksResponse.value || []);
      }
      if (usersResponse.status === "fulfilled") {
        setCrmUsers((usersResponse.value || []).map(mapApiUserToCrmUser));
      }
    } catch (error) {
      console.error("Error loading CRM data:", error);
      setToast("Erreur lors du chargement des donnees");
    } finally {
      setIsLoading(false);
    }
  };

  const userRoles = crmUser.roles;
  const canSeeActivePage = canAccessPage(userRoles, activePage);
  const selectedOrder =
    orders.find((order) => order.id === selectedOrderId) ||
    (orders.length > 0 ? orders[0] : undefined);
  const wilayas = useMemo(
    () => Array.from(new Set(orders.map((order) => order.wilaya).filter(Boolean))).sort(),
    [orders],
  );
  const pipelineAmount = useMemo(
    () => deals.reduce((sum, deal) => sum + Number(deal.estimatedAmount || 0), 0),
    [deals],
  );
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesText =
        query.trim().length === 0 ||
        `${order.clientName} ${order.phone} ${order.id} ${order.reference || ""}`
          .toLowerCase()
          .includes(query.toLowerCase());
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const matchesWilaya = wilayaFilter === "all" || order.wilaya === wilayaFilter;
      return matchesText && matchesStatus && matchesWilaya;
    });
  }, [orders, query, statusFilter, wilayaFilter]);

  function loadOrderDetails(id: string) {
    crmOrdersApi
      .getById(id)
      .then((order) => {
        setOrders((current) => upsertOrder(current, normalizeOrder(order)));
      })
      .catch(() => undefined);
  }

  function moveOrder(order: Order, to: OrderStatus, note?: string) {
    if (!canChangeOrderStatus(userRoles, order.status, to)) {
      setToast(
        `Action refusee: ${roleLabels[userRoles[0]]} ne peut pas faire ${orderStatusLabels[order.status]} -> ${orderStatusLabels[to]}.`,
      );
      return false;
    }

    crmOrdersApi
      .updateStatus(order.id, to, note)
      .then((updatedOrder) => {
        const mapped = normalizeOrder(updatedOrder);
        setOrders((current) => upsertOrder(current, mapped));
        setSelectedOrderId(order.id);
        setToast(`Commande ${mapped.clientName}: ${orderStatusLabels[mapped.status]}`);
        void crmProductionApi.getAll().then(setProductionJobs).catch(() => undefined);
      })
      .catch((error) => {
        console.error("Error updating order status:", error);
        setToast(error instanceof Error ? error.message : "Erreur lors de la mise a jour");
      });

    return true;
  }

  function startProduction(job: ProductionJob) {
    crmProductionApi
      .update(job.id, { status: "en_cours" })
      .then((updated) => {
        setProductionJobs((current) =>
          current.map((item) => (item.id === job.id ? updated : item)),
        );
        setToast(`${job.orderRef}: production demarree`);
      })
      .catch((error) => {
        setToast(error instanceof Error ? error.message : "Erreur production");
      });
  }

  function finishProduction(job: ProductionJob) {
    crmProductionApi
      .update(job.id, { status: "termine" })
      .then((updated) => {
        setProductionJobs((current) =>
          current.map((item) => (item.id === job.id ? updated : item)),
        );
        const relatedOrder = orders.find((order) => order.id === job.orderId);
        if (relatedOrder) {
          moveOrder(relatedOrder, "en_preparation", "Production terminee");
        }
        setToast(`${job.orderRef}: production terminee`);
      })
      .catch((error) => {
        setToast(error instanceof Error ? error.message : "Erreur production");
      });
  }

  function validatePreparation(order: Order) {
    if (!qualityChecked) {
      setToast("Controle qualite obligatoire avant expedition.");
      return;
    }

    if (moveOrder(order, "en_livraison", "Emballage et qualite valides.")) {
      setQualityChecked(false);
    }
  }

  function createParcel(order: Order) {
    crmDeliveryApi
      .createParcel(order.id)
      .then((updated) => {
        const mapped = normalizeOrder(updated);
        setOrders((current) =>
          current.map((item) => (item.id === order.id ? mapped : item)),
        );
        setToast(`Colis Yalidine cree: ${mapped.trackingNumber || mapped.clientName}`);
      })
      .catch((error) => {
        setToast(error instanceof Error ? error.message : "Erreur Yalidine");
      });
  }

  function syncParcel(order: Order) {
    crmDeliveryApi
      .syncParcel(order.id)
      .then((updated) => {
        const mapped = normalizeOrder(updated);
        setOrders((current) =>
          current.map((item) => (item.id === order.id ? mapped : item)),
        );
        setToast(
          mapped.yalidineStatus
            ? `Yalidine: ${mapped.yalidineStatus}`
            : `Suivi Yalidine mis a jour: ${mapped.trackingNumber || mapped.reference || order.id}`,
        );
      })
      .catch((error) => {
        setToast(error instanceof Error ? error.message : "Erreur suivi Yalidine");
      });
  }

  function addOrder(payload: CreateCrmOrderPayload) {
    if (!canCreateOrder(userRoles)) {
      setToast("Action refusee: role non autorise a creer une commande.");
      return;
    }

    crmOrdersApi
      .create(payload)
      .then((newOrder) => {
        const mappedOrder = normalizeOrder(newOrder);
        setOrders((current) => upsertOrder(current, mappedOrder));
        setSelectedOrderId(mappedOrder.id);
        setToast(`${mappedOrder.clientName} : commande creee.`);
        void crmCustomersApi.getAll().then((rows) => setContacts(rows || [])).catch(() => undefined);
      })
      .catch((error) => {
        console.error("Error creating order:", error);
        setToast(error instanceof Error ? error.message : "Erreur lors de la creation");
      });
  }

  function addContact(data: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    wilaya: string;
    type: Contact["type"];
    companyId?: string;
  }) {
    if (!canManageContacts(userRoles)) {
      setToast("Action refusee: seuls Admin et Commercial modifient les contacts.");
      return;
    }

    crmCustomersApi
      .create({
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim() || data.firstName.trim(),
        phone: data.phone.replace(/\s+/g, ""),
        email: data.email?.trim() || undefined,
        wilaya: data.wilaya,
        type: data.type,
        companyId: data.companyId || undefined,
      })
      .then((newContact) => {
        setContacts((current) => [newContact, ...current]);
        setToast("Contact cree avec succes.");
      })
      .catch((error) => {
        console.error("Error creating contact:", error);
        setToast(error instanceof Error ? error.message : "Erreur lors de la creation du contact");
      });
  }

  function updateContact(id: string, data: Partial<Contact>) {
    crmCustomersApi
      .update(id, {
        firstName: data.firstName?.trim(),
        lastName: data.lastName?.trim(),
        phone: data.phone?.replace(/\s+/g, ""),
        email: data.email?.trim() || undefined,
        wilaya: data.wilaya,
        type: data.type,
        companyId: data.companyId || undefined,
      })
      .then((updated) => {
        setContacts((current) =>
          current.map((item) => (item.id === id ? updated : item)),
        );
        setToast("Contact mis a jour.");
      })
      .catch((error) => {
        setToast(error instanceof Error ? error.message : "Erreur contact");
      });
  }

  function deleteContact(id: string) {
    crmCustomersApi
      .delete(id)
      .then(() => {
        setContacts((current) => current.filter((item) => item.id !== id));
        setToast("Contact supprime.");
      })
      .catch((error) => {
        setToast(error instanceof Error ? error.message : "Erreur suppression contact");
      });
  }

  function addCompany(data: { name: string; sector: string; commercialTerms?: string }) {
    crmCompaniesApi
      .create(data)
      .then((company) => {
        setCompanies((current) => [company, ...current]);
        setToast("Entreprise creee.");
      })
      .catch((error) => {
        setToast(error instanceof Error ? error.message : "Erreur entreprise");
      });
  }

  function updateCompany(id: string, data: Partial<Company>) {
    crmCompaniesApi
      .update(id, data)
      .then((updated) => {
        setCompanies((current) =>
          current.map((item) => (item.id === id ? updated : item)),
        );
        setToast("Entreprise mise a jour.");
      })
      .catch((error) => {
        setToast(error instanceof Error ? error.message : "Erreur entreprise");
      });
  }

  function deleteCompany(id: string) {
    crmCompaniesApi
      .delete(id)
      .then(() => {
        setCompanies((current) => current.filter((item) => item.id !== id));
        setContacts((current) =>
          current.map((contact) =>
            contact.companyId === id ? { ...contact, companyId: undefined } : contact,
          ),
        );
        setToast("Entreprise supprimee.");
      })
      .catch((error) => {
        setToast(error instanceof Error ? error.message : "Erreur suppression entreprise");
      });
  }

  function addActivity(data: { type: Activity["type"]; target: string; description: string }) {
    crmActivitiesApi
      .create({ ...data, ownerId: crmUser.id })
      .then((activity) => {
        setActivities((current) => [activity, ...current]);
        setToast("Activite enregistree.");
      })
      .catch((error) => {
        setToast(error instanceof Error ? error.message : "Erreur activite");
      });
  }

  function deleteActivity(id: string) {
    crmActivitiesApi
      .delete(id)
      .then(() => {
        setActivities((current) => current.filter((item) => item.id !== id));
        setToast("Activite supprimee.");
      })
      .catch((error) => {
        setToast(error instanceof Error ? error.message : "Erreur suppression activite");
      });
  }

  function addDeal(data: {
    title: string;
    estimatedAmount: number;
    contactId?: string;
    companyId?: string;
  }) {
    crmDealsApi
      .create({
        title: data.title,
        estimatedAmount: data.estimatedAmount,
        stage: "prospection",
        contactId: data.contactId || undefined,
        companyId: data.companyId || undefined,
      })
      .then((deal) => {
        setDeals((current) => [
          { ...deal, estimatedAmount: Number(deal.estimatedAmount), expectedCloseAt: deal.expectedCloseAt || deal.createdAt },
          ...current,
        ]);
        setToast("Affaire creee.");
      })
      .catch((error) => {
        setToast(error instanceof Error ? error.message : "Erreur affaire");
      });
  }

  function deleteDeal(id: string) {
    crmDealsApi
      .delete(id)
      .then(() => {
        setDeals((current) => current.filter((item) => item.id !== id));
        setProposals((current) => current.filter((item) => item.dealId !== id));
        setToast("Affaire supprimee.");
      })
      .catch((error) => {
        setToast(error instanceof Error ? error.message : "Erreur suppression affaire");
      });
  }

  function updateDealStage(deal: Deal, stage: Deal["stage"]) {
    crmDealsApi
      .update(deal.id, { stage })
      .then((updated) => {
        setDeals((current) =>
          current.map((item) =>
            item.id === deal.id
              ? { ...item, ...updated, estimatedAmount: Number(updated.estimatedAmount) }
              : item,
          ),
        );
        setToast(`${deal.title}: ${dealStageLabels[stage]}.`);
      })
      .catch((error) => {
        setToast(error instanceof Error ? error.message : "Erreur affaire");
      });
  }

  function addProposal(data: {
    dealId: string;
    items: Proposal["items"];
    total: number;
  }) {
    crmProposalsApi
      .create({ ...data, status: "brouillon" })
      .then((proposal) => {
        setProposals((current) => [{ ...proposal, total: Number(proposal.total) }, ...current]);
        setToast("Devis cree.");
      })
      .catch((error) => {
        setToast(error instanceof Error ? error.message : "Erreur devis");
      });
  }

  function updateProposalStatus(proposal: Proposal, status: Proposal["status"]) {
    crmProposalsApi
      .update(proposal.id, { status })
      .then((updated) => {
        setProposals((current) =>
          current.map((item) =>
            item.id === proposal.id ? { ...item, ...updated, total: Number(updated.total) } : item,
          ),
        );
      })
      .catch((error) => {
        setToast(error instanceof Error ? error.message : "Erreur devis");
      });
  }

  function deleteProposal(id: string) {
    crmProposalsApi
      .delete(id)
      .then(() => {
        setProposals((current) => current.filter((item) => item.id !== id));
        setToast("Devis supprime.");
      })
      .catch((error) => {
        setToast(error instanceof Error ? error.message : "Erreur suppression devis");
      });
  }

  function toggleProduct(product: Product) {
    if (!canManageCatalog(userRoles)) {
      setToast("Action refusee: catalogue modifiable par Admin ou Atelier/Design.");
      return;
    }

    crmProductsApi
      .setActive(product.id, !product.active)
      .then(() => {
        setProducts((current) =>
          current.map((item) =>
            item.id === product.id ? { ...item, active: !item.active } : item,
          ),
        );
        setToast(`${product.name} ${product.active ? "desactive" : "reactive"}.`);
      })
      .catch((error) => {
        setToast(error instanceof Error ? error.message : "Erreur catalogue");
      });
  }

  function addTask(data: { title: string; priority: CrmTask["priority"]; dueAt: string }) {
    crmTasksApi
      .create({
        title: data.title,
        assigneeId: crmUser.id,
        assigneeName: crmUser.name,
        dueAt: toIsoDate(data.dueAt),
        priority: data.priority,
      })
      .then((task) => {
        setTasks((current) => [task, ...current]);
        setToast("Tache creee.");
      })
      .catch((error) => {
        setToast(error instanceof Error ? error.message : "Erreur tache");
      });
  }

  function updateTask(id: string, data: Partial<CrmTask>) {
    crmTasksApi
      .update(id, {
        title: data.title,
        priority: data.priority,
        dueAt: data.dueAt ? toIsoDate(data.dueAt) : undefined,
        done: data.done,
      })
      .then((updated) => {
        setTasks((current) =>
          current.map((item) => (item.id === id ? updated : item)),
        );
        setToast("Tache mise a jour.");
      })
      .catch((error) => {
        setToast(error instanceof Error ? error.message : "Erreur tache");
      });
  }

  function deleteTask(id: string) {
    crmTasksApi
      .delete(id)
      .then(() => {
        setTasks((current) => current.filter((item) => item.id !== id));
        setToast("Tache supprimee.");
      })
      .catch((error) => {
        setToast(error instanceof Error ? error.message : "Erreur suppression tache");
      });
  }

  function toggleTask(task: CrmTask) {
    crmTasksApi
      .update(task.id, { done: !task.done })
      .then((updated) => {
        setTasks((current) =>
          current.map((item) => (item.id === task.id ? updated : item)),
        );
      })
      .catch((error) => {
        setToast(error instanceof Error ? error.message : "Erreur tache");
      });
  }

  function toggleUserActive(target: CrmUser) {
    if (!canManageUsers(userRoles)) {
      setToast("Action refusee: seuls les admins gerent les utilisateurs.");
      return;
    }

    crmUsersApi
      .update(target.id, { isActive: !target.active })
      .then((updated) => {
        setCrmUsers((current) =>
          current.map((item) =>
            item.id === target.id ? { ...item, active: updated.isActive } : item,
          ),
        );
        setToast(`${target.name} ${updated.isActive ? "active" : "desactive"}.`);
      })
      .catch((error) => {
        setToast(error instanceof Error ? error.message : "Erreur utilisateur");
      });
  }

  function createUser(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string;
    role: string;
  }) {
    crmUsersApi
      .create(data)
      .then((created) => {
        setCrmUsers((current) => [mapApiUserToCrmUser(created), ...current]);
        setToast("Utilisateur cree.");
      })
      .catch((error) => {
        setToast(error instanceof Error ? error.message : "Erreur creation utilisateur");
      });
  }

  function updateUser(id: string, data: { role?: string; firstName?: string; lastName?: string; phone?: string }) {
    crmUsersApi
      .update(id, data)
      .then((updated) => {
        setCrmUsers((current) =>
          current.map((item) =>
            item.id === id ? { ...item, ...mapApiUserToCrmUser({ ...updated, createdAt: item.lastLoginAt }) } : item,
          ),
        );
        setToast("Utilisateur mis a jour.");
      })
      .catch((error) => {
        setToast(error instanceof Error ? error.message : "Erreur utilisateur");
      });
  }

  function createProduct(data: {
    name: string;
    categoryId: string;
    price: number;
    photoUrl?: string;
    storagePath?: string;
    shortDescription?: string;
    isPersonalizable?: boolean;
  }) {
    crmProductsApi
      .create(data)
      .then((product) => {
        setProducts((current) => [product, ...current]);
        setToast("Produit cree.");
      })
      .catch((error) => {
        setToast(error instanceof Error ? error.message : "Erreur produit");
      });
  }

  function updateProduct(
    id: string,
    data: {
      name: string;
      categoryId: string;
      price: number;
      photoUrl?: string;
      storagePath?: string;
      shortDescription?: string;
      isPersonalizable?: boolean;
    },
  ) {
    crmProductsApi
      .update(id, data)
      .then((product) => {
        setProducts((current) =>
          current.map((item) => (item.id === id ? product : item)),
        );
        setToast("Produit mis a jour.");
      })
      .catch((error) => {
        setToast(error instanceof Error ? error.message : "Erreur produit");
      });
  }

  function deleteProduct(id: string) {
    crmProductsApi
      .delete(id)
      .then(() => {
        setProducts((current) => current.filter((item) => item.id !== id));
        setToast("Produit supprime.");
      })
      .catch((error) => {
        setToast(error instanceof Error ? error.message : "Erreur suppression produit");
      });
  }

  if (loading || !user || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f7f3] text-sm font-semibold text-black/60">
        Chargement du CRM...
      </div>
    );
  }

  if (!profile.is_active || crmUser.roles.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f4f7f3]">
        <p className="text-sm font-semibold text-rose-800">
          Acces CRM refuse pour ce compte.
        </p>
        <CrmButton variant="ghost" onClick={() => signOut()}>
          Deconnexion
        </CrmButton>
      </div>
    );
  }

  return (
    <div className="bg-[#f4f7f3] min-h-screen text-black flex">
      <CrmSidebar
        user={crmUser}
        activePage={activePage}
        onPageChange={(page) => {
          router.push(crmPagePaths[page]);
        }}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div
        className={cx(
          "transition-all duration-300 min-h-screen flex-1 overflow-auto",
          sidebarCollapsed ? "ml-16" : "ml-64",
        )}
        id="main-content"
      >
        <div className="p-6 lg:p-8">
          <div className="mb-6 rounded-lg border border-black/10 bg-white px-5 py-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0] text-black/50">
                  Espace connecte avec Supabase
                </p>
                <h1 className="text-xl font-bold leading-tight tracking-[0]">
                  {crmUser.name}
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-black/60">{isLoading ? "Chargement..." : toast}</span>
                <CrmButton variant="ghost" onClick={() => signOut()}>
                  Deconnexion
                </CrmButton>
              </div>
            </div>
          </div>

          {!canSeeActivePage && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm font-semibold text-rose-800">
              Acces refuse pour ce module avec vos roles actuels.
            </div>
          )}

          {canSeeActivePage && activePage === "overview" && (
            <>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">Tableau de bord</h2>
                <div className="flex gap-2">
                  <CrmButton
                    variant={useEnhancedDashboard ? "default" : "ghost"}
                    onClick={() => setUseEnhancedDashboard(true)}
                  >
                    Vue avancee
                  </CrmButton>
                  <CrmButton
                    variant={!useEnhancedDashboard ? "default" : "ghost"}
                    onClick={() => setUseEnhancedDashboard(false)}
                  >
                    Vue classique
                  </CrmButton>
                </div>
              </div>

              {useEnhancedDashboard ? (
                <EnhancedDashboard />
              ) : (
                <CrmDashboard
                  orders={orders}
                  productionJobs={productionJobs}
                  pipelineAmount={pipelineAmount}
                />
              )}
            </>
          )}

          {canSeeActivePage && activePage === "orders" && (
            <CrmOrders
              orders={filteredOrders}
              selectedOrder={selectedOrder}
              query={query}
              statusFilter={statusFilter}
              wilayaFilter={wilayaFilter}
              wilayas={wilayas}
              userRoles={userRoles}
              onQuery={setQuery}
              onStatusFilter={setStatusFilter}
              onWilayaFilter={setWilayaFilter}
              onSelect={(id) => {
                setSelectedOrderId(id);
                loadOrderDetails(id);
              }}
              onMove={moveOrder}
              onCreateOrder={addOrder}
              onCreateParcel={createParcel}
              onSyncParcel={syncParcel}
              onToast={setToast}
              products={products}
              contacts={contacts}
            />
          )}

          {canSeeActivePage && activePage === "confirmation" && (
            <CrmConfirmation
              orders={orders.filter((order) => order.status === "pas_confirme")}
              onLoadOrder={loadOrderDetails}
              onToast={setToast}
              onConfirm={(order) =>
                moveOrder(order, "confirme", "Client confirme par telephone.")
              }
              onCreateParcel={createParcel}
              onSyncParcel={syncParcel}
              onReason={(order, reason) => {
                const note = `Motif confirmation: ${reason}`;
                if (reason === "refus") {
                  moveOrder(order, "annulee", note);
                  return;
                }
                crmOrdersApi
                  .updateStatus(order.id, order.status, note)
                  .then((updatedOrder) => {
                    setOrders((current) =>
                      current.map((item) =>
                        item.id === order.id
                          ? { ...normalizeOrder(updatedOrder), confirmationReason: reason }
                          : item,
                      ),
                    );
                    setToast(`${order.clientName}: motif ${reason}.`);
                  })
                  .catch((error) => {
                    setToast(error instanceof Error ? error.message : "Erreur confirmation");
                  });
              }}
            />
          )}

          {canSeeActivePage && activePage === "sales" && (
            <CrmSales
              deals={deals}
              contacts={contacts}
              companies={companies}
              onStage={updateDealStage}
              onCreateDeal={addDeal}
              onDeleteDeal={deleteDeal}
            />
          )}

          {canSeeActivePage && activePage === "proposals" && (
            <CrmProposals
              proposals={proposals}
              deals={deals}
              products={products}
              canEdit={canManageContacts(userRoles)}
              onCreateProposal={addProposal}
              onStatusChange={updateProposalStatus}
              onDeleteProposal={deleteProposal}
            />
          )}

          {canSeeActivePage && activePage === "contacts" && (
            <CrmContacts
              contacts={contacts}
              companies={companies}
              canEdit={canManageContacts(userRoles)}
              onAddContact={addContact}
              onUpdateContact={updateContact}
              onDeleteContact={deleteContact}
            />
          )}

          {canSeeActivePage && activePage === "companies" && (
            <CrmCompanies
              companies={companies}
              canEdit={canManageContacts(userRoles)}
              onAddCompany={addCompany}
              onUpdateCompany={updateCompany}
              onDeleteCompany={deleteCompany}
            />
          )}

          {canSeeActivePage && activePage === "activities" && (
            <CrmActivities
              activities={activities}
              canEdit={canManageContacts(userRoles)}
              onAddActivity={addActivity}
              onDeleteActivity={deleteActivity}
            />
          )}

          {canSeeActivePage && activePage === "production" && (
            <CrmProduction
              jobs={productionJobs}
              orders={orders}
              canEdit={canChangeOrderStatus(userRoles, "confirme", "en_fabrication")}
              onStart={startProduction}
              onFinish={finishProduction}
              onLoadOrder={loadOrderDetails}
              onToast={setToast}
              onCreateParcel={createParcel}
              onSyncParcel={syncParcel}
            />
          )}

          {canSeeActivePage && activePage === "preparation" && (
            <CrmPreparation
              orders={orders.filter((order) => order.status === "en_preparation")}
              qualityChecked={qualityChecked}
              setQualityChecked={setQualityChecked}
              onValidate={validatePreparation}
              canEdit={canChangeOrderStatus(userRoles, "en_preparation", "en_livraison")}
              onLoadOrder={loadOrderDetails}
              onToast={setToast}
              onCreateParcel={createParcel}
              onSyncParcel={syncParcel}
            />
          )}

          {canSeeActivePage && activePage === "delivery" && (
            <CrmDelivery
              orders={orders.filter((order) =>
                ["confirme", "en_livraison", "livre", "retour_echec"].includes(order.status),
              )}
              onCreateParcel={createParcel}
              onSyncParcel={syncParcel}
              onDelivered={(order) => moveOrder(order, "livre", "Livraison confirmee.")}
              onReturned={(order) =>
                moveOrder(order, "retour_echec", "Echec livraison / retour.")
              }
            />
          )}

          {canSeeActivePage && activePage === "catalog" && (
            <CrmCatalog
              products={products}
              categories={categories}
              canEdit={canManageCatalog(userRoles)}
              onToggle={toggleProduct}
              onCreate={createProduct}
              onUpdate={updateProduct}
              onDelete={deleteProduct}
              onCategoryCreated={(category) => {
                setCategories((current) =>
                  current.some((item) => item.id === category.id)
                    ? current
                    : [...current, category].sort((a, b) => a.name.localeCompare(b.name)),
                );
              }}
              onToast={setToast}
            />
          )}

          {canSeeActivePage && activePage === "tasks" && (
            <CrmTasks
              tasks={tasks}
              user={crmUser}
              onAdd={addTask}
              onToggle={toggleTask}
              onUpdate={updateTask}
              onDelete={deleteTask}
            />
          )}

          {canSeeActivePage && activePage === "users" && (
            <CrmUsers
              users={crmUsers}
              canEdit={canManageUsers(userRoles)}
              onToggleActive={toggleUserActive}
              onCreateUser={createUser}
              onUpdateUser={updateUser}
            />
          )}

          {canSeeActivePage && activePage === "settings" && (
            <CrmSettings user={crmUser} />
          )}
        </div>
      </div>
    </div>
  );
}
