"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  demoContacts,
  demoDeals,
  demoOrders,
  demoProductionJobs,
  demoProducts,
  demoProjects,
  demoTasks,
  demoUsers,
} from "@/lib/crm/demo-data";
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
  type Contact,
  type CrmPage,
  type CrmTask,
  type CrmUser,
  type Deal,
  type Order,
  type OrderStatus,
  type Product,
  type ProductionJob,
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
import { CrmButton, productSummary, cx } from "./CrmUi";

function resolveDemoUser(initialUserId?: string): CrmUser {
  return (
    demoUsers.find((user) => user.id === initialUserId && user.active) ??
    demoUsers.find((user) => user.active) ??
    demoUsers[0]
  );
}

export function CrmApp({
  initialUserId,
  initialPage = "overview",
}: {
  initialUserId?: string;
  initialPage?: CrmPage;
}) {
  const router = useRouter();
  const [user] = useState<CrmUser>(() => resolveDemoUser(initialUserId));
  const [activePage, setActivePage] = useState<CrmPage>(initialPage);
  const [orders, setOrders] = useState<Order[]>(demoOrders);
  const [contacts, setContacts] = useState<Contact[]>(demoContacts);
  const [products, setProducts] = useState<Product[]>(demoProducts);
  const [deals, setDeals] = useState<Deal[]>(demoDeals);
  const [productionJobs, setProductionJobs] =
    useState<ProductionJob[]>(demoProductionJobs);
  const [tasks, setTasks] = useState<CrmTask[]>(demoTasks);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [wilayaFilter, setWilayaFilter] = useState("all");
  const [selectedOrderId, setSelectedOrderId] = useState(orders[0]?.id ?? "");
  const [qualityChecked, setQualityChecked] = useState(false);
  const [toast, setToast] = useState("Mode demo: endpoints Supabase prets.");
  const [newOrderName, setNewOrderName] = useState("");
  const [newOrderPhone, setNewOrderPhone] = useState("");
  const [newOrderWilaya, setNewOrderWilaya] = useState("Alger");
  const [newOrderProduct, setNewOrderProduct] = useState(demoProducts[0].id);
  const [newContactPhone, setNewContactPhone] = useState("");
  const [newContactName, setNewContactName] = useState("");

  const userRoles = user.roles;
  const canSeeActivePage = canAccessPage(userRoles, activePage);
  const selectedOrder =
    orders.find((order) => order.id === selectedOrderId) ?? orders[0];
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Handle page navigation
  const handlePageChange = (page: CrmPage) => {
    setActivePage(page);
  };
  const wilayas = useMemo(
    () => Array.from(new Set(orders.map((order) => order.wilaya))).sort(),
    [orders],
  );
  const pipelineAmount = useMemo(
    () => deals.reduce((sum, deal) => sum + deal.estimatedAmount, 0),
    [deals],
  );
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesText =
        query.trim().length === 0 ||
        `${order.clientName} ${order.phone} ${order.id}`
          .toLowerCase()
          .includes(query.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;
      const matchesWilaya =
        wilayaFilter === "all" || order.wilaya === wilayaFilter;

      return matchesText && matchesStatus && matchesWilaya;
    });
  }, [orders, query, statusFilter, wilayaFilter]);

  function moveOrder(order: Order, to: OrderStatus, note?: string) {
    if (!canChangeOrderStatus(userRoles, order.status, to)) {
      setToast(
        `Action refusee: ${roleLabels[userRoles[0]]} ne peut pas faire ${orderStatusLabels[order.status]} -> ${orderStatusLabels[to]}.`,
      );
      return false;
    }

    setOrders((current) =>
      current.map((item) =>
        item.id === order.id
          ? {
              ...item,
              status: to,
              shippedAt:
                to === "en_livraison" ? new Date().toISOString() : item.shippedAt,
              deliveredAt: to === "livre" ? new Date().toISOString() : item.deliveredAt,
              history: [
                ...item.history,
                {
                  id: `hst-${item.id}-${Date.now()}`,
                  from: item.status,
                  to,
                  authorId: user.id,
                  authorName: user.name,
                  createdAt: new Date().toISOString(),
                  note,
                },
              ],
            }
          : item,
      ),
    );

    if (to === "en_fabrication") {
      setProductionJobs((current) => {
        if (current.some((job) => job.orderId === order.id)) return current;

        return [
          {
            id: `job-${order.id}`,
            orderId: order.id,
            orderRef: order.id,
            clientName: order.clientName,
            productSummary: productSummary(order),
            status: "en_attente",
          },
          ...current,
        ];
      });
    }

    setSelectedOrderId(order.id);
    setToast(`Commande ${order.id}: ${orderStatusLabels[to]}`);
    return true;
  }

  function startProduction(job: ProductionJob) {
    setProductionJobs((current) =>
      current.map((item) =>
        item.id === job.id
          ? { ...item, status: "en_cours", startedAt: new Date().toISOString() }
          : item,
      ),
    );
    setToast(`${job.orderRef}: production demarree.`);
  }

  function finishProduction(job: ProductionJob) {
    const order = orders.find((item) => item.id === job.orderId);

    if (!order || !moveOrder(order, "en_preparation", "Production terminee.")) {
      return;
    }

    setProductionJobs((current) =>
      current.map((item) =>
        item.id === job.id
          ? { ...item, status: "termine", finishedAt: new Date().toISOString() }
          : item,
      ),
    );
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
    setOrders((current) =>
      current.map((item) =>
        item.id === order.id
          ? {
              ...item,
              trackingNumber:
                item.trackingNumber ??
                `YLD-${Math.floor(100000 + Math.random() * 899999)}`,
              carrierStatus: "Bordereau cree, en attente ramassage",
            }
          : item,
      ),
    );
    setToast(`${order.id}: colis Yalidine cree en mode demo.`);
  }

  function addOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canCreateOrder(userRoles)) {
      setToast("Action refusee: role non autorise a creer une commande.");
      return;
    }

    const product = products.find((item) => item.id === newOrderProduct);
    if (!product || !product.active || !newOrderName || !newOrderPhone) {
      setToast("Complete le client, telephone et produit actif.");
      return;
    }

    const order: Order = {
      id: `CMD-${1050 + orders.length}`,
      source: "directe",
      clientName: newOrderName,
      phone: newOrderPhone,
      wilaya: newOrderWilaya,
      status: "pas_confirme",
      items: [
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          unitPrice: product.price,
        },
      ],
      total: product.price,
      createdAt: new Date().toISOString(),
      history: [
        {
          id: `hst-new-${Date.now()}`,
          to: "pas_confirme",
          authorId: user.id,
          authorName: user.name,
          createdAt: new Date().toISOString(),
          note: "Commande directe",
        },
      ],
    };

    setOrders((current) => [order, ...current]);
    setSelectedOrderId(order.id);
    setNewOrderName("");
    setNewOrderPhone("");
    setToast(`${order.id} creee au statut Pas confirme.`);
  }

  function addContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canManageContacts(userRoles)) {
      setToast("Action refusee: seuls Admin et Commercial modifient les contacts.");
      return;
    }

    if (contacts.some((contact) => contact.phone === newContactPhone)) {
      setToast("Doublon strict detecte: ouvrir la fiche existante ou fusionner.");
      return;
    }

    const [firstName = "Client", ...lastParts] = newContactName.split(" ");
    setContacts((current) => [
      {
        id: `ctc-${Date.now()}`,
        firstName,
        lastName: lastParts.join(" ") || "Michket",
        phone: newContactPhone,
        wilaya: "Alger",
        type: "particulier",
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
    setNewContactName("");
    setNewContactPhone("");
    setToast("Contact ajoute en demo.");
  }

  function toggleProduct(product: Product) {
    if (!canManageCatalog(userRoles)) {
      setToast("Action refusee: catalogue modifiable par Admin ou Atelier/Design.");
      return;
    }

    setProducts((current) =>
      current.map((item) =>
        item.id === product.id ? { ...item, active: !item.active } : item,
      ),
    );
    setToast(`${product.name}: ${product.active ? "desactive" : "reactive"}.`);
  }

  function addTask() {
    const assignee = demoUsers.find((item) => item.active) ?? user;

    setTasks((current) => [
      {
        id: `tsk-${Date.now()}`,
        title: "Nouvelle tache operationnelle",
        assigneeId: assignee.id,
        assigneeName: assignee.name,
        projectId: demoProjects[0]?.id,
        dueAt: new Date(Date.now() + 86400000).toISOString(),
        priority: "normale",
        done: false,
      },
      ...current,
    ]);
    setToast("Tache demo creee.");
  }

  return (
    <div className="bg-[#f4f7f3] min-h-screen text-black flex">
      <CrmSidebar 
        user={user} 
        activePage={activePage} 
        onPageChange={handlePageChange}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div 
        className={cx(
          "transition-all duration-300 min-h-screen flex-1 overflow-auto",
          sidebarCollapsed ? "ml-16" : "ml-64"
        )} 
        id="main-content"
      >
        <div className="p-6 lg:p-8">
          <div className="mb-6 rounded-lg border border-black/10 bg-white px-5 py-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0] text-black/50">
                  Espace connecté depuis accueil
                </p>
                <h1 className="text-xl font-bold leading-tight tracking-[0]">
                  {user.name}
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-black/60">{toast}</span>
                <CrmButton variant="ghost" onClick={() => router.push("/")}>
                  Sortir
                </CrmButton>
              </div>
            </div>
          </div>

          {!canSeeActivePage && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm font-semibold text-rose-800">
              Accès refusé pour ce module avec vos rôles actuels.
            </div>
          )}

          {canSeeActivePage && activePage === "overview" && (
            <CrmDashboard
              orders={orders}
              productionJobs={productionJobs}
              pipelineAmount={pipelineAmount}
            />
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
              onSelect={setSelectedOrderId}
              onMove={moveOrder}
              onCreateOrder={addOrder}
              newOrderName={newOrderName}
              newOrderPhone={newOrderPhone}
              newOrderWilaya={newOrderWilaya}
              newOrderProduct={newOrderProduct}
              products={products}
              setNewOrderName={setNewOrderName}
              setNewOrderPhone={setNewOrderPhone}
              setNewOrderWilaya={setNewOrderWilaya}
              setNewOrderProduct={setNewOrderProduct}
            />
          )}

          {canSeeActivePage && activePage === "confirmation" && (
            <CrmConfirmation
              orders={orders.filter((order) => order.status === "pas_confirme")}
              onConfirm={(order) =>
                moveOrder(order, "confirme", "Client confirme par telephone.")
              }
              onReason={(order, reason) => {
                setOrders((current) =>
                  current.map((item) =>
                    item.id === order.id
                      ? { ...item, confirmationReason: reason }
                      : item,
                  ),
                );
                setToast(`${order.id}: motif ${reason}.`);
              }}
            />
          )}

          {canSeeActivePage && activePage === "sales" && (
            <CrmSales
              deals={deals}
              onStage={(deal, stage) => {
                setDeals((current) =>
                  current.map((item) =>
                    item.id === deal.id ? { ...item, stage } : item,
                  ),
                );
                setToast(`${deal.title}: etape ${dealStageLabels[stage]}.`);
              }}
            />
          )}

          {canSeeActivePage && activePage === "proposals" && <CrmProposals />}

          {canSeeActivePage && activePage === "contacts" && (
            <CrmContacts
              contacts={contacts}
              canEdit={canManageContacts(userRoles)}
              newContactName={newContactName}
              newContactPhone={newContactPhone}
              setNewContactName={setNewContactName}
              setNewContactPhone={setNewContactPhone}
              onAddContact={addContact}
            />
          )}

          {canSeeActivePage && activePage === "companies" && <CrmCompanies />}

          {canSeeActivePage && activePage === "activities" && <CrmActivities />}

          {canSeeActivePage && activePage === "production" && (
            <CrmProduction
              jobs={productionJobs}
              onStart={startProduction}
              onFinish={finishProduction}
            />
          )}

          {canSeeActivePage && activePage === "preparation" && (
            <CrmPreparation
              orders={orders.filter((order) => order.status === "en_preparation")}
              qualityChecked={qualityChecked}
              setQualityChecked={setQualityChecked}
              onValidate={validatePreparation}
            />
          )}

          {canSeeActivePage && activePage === "delivery" && (
            <CrmDelivery
              orders={orders.filter((order) => order.status === "en_livraison")}
              onCreateParcel={createParcel}
              onDelivered={(order) => moveOrder(order, "livre", "Livraison confirmee.")}
              onReturned={(order) =>
                moveOrder(order, "retour_echec", "Echec livraison / retour.")
              }
            />
          )}

          {canSeeActivePage && activePage === "catalog" && (
            <CrmCatalog products={products} onToggle={toggleProduct} />
          )}

          {canSeeActivePage && activePage === "tasks" && (
            <CrmTasks tasks={tasks} user={user} onAdd={addTask} />
          )}

          {canSeeActivePage && activePage === "users" && (
            <CrmUsers users={demoUsers} canEdit={canManageUsers(userRoles)} />
          )}

          {canSeeActivePage && activePage === "settings" && <CrmSettings />}
        </div>
      </div>
    </div>
  );
}
