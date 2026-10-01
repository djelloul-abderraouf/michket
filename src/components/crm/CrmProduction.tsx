import { useMemo, useState } from "react";
import { productionStatusLabels, type CrmRole, type Order, type OrderStatus, type ProductionJob } from "@/lib/crm/types";
import { CrmPanel, CrmCard, CrmBadge, CrmButton, formatDate, CrmAddButton, CrmPopup, ViewToggle, OrderSearchField, orderRef } from "./CrmUi";
import { CrmOrderDetailsDrawer } from "./CrmOrderDetailsDrawer";
import { orderMatchesQuery } from "@/lib/crm/order-search";

const statusConfig: Record<ProductionJob["status"], { variant: "warning" | "info" | "success"; color: string }> = {
  en_attente: { variant: "warning", color: "bg-amber-500" },
  en_cours: { variant: "info", color: "bg-cyan-500" },
  termine: { variant: "success", color: "bg-emerald-500" },
};

export function CrmProduction({
  jobs,
  orders,
  canEdit,
  onStart,
  onFinish,
  onLoadOrder,
  onToast,
  onCreateParcel,
  onSyncParcel,
  userRoles,
  currentUserId,
  onOrderUpdated,
  onMove,
}: {
  jobs: ProductionJob[];
  orders: Order[];
  canEdit: boolean;
  onStart: (job: ProductionJob) => void;
  onFinish: (job: ProductionJob) => void;
  onLoadOrder?: (id: string) => void;
  onToast?: (message: string) => void;
  onCreateParcel?: (order: Order) => void;
  onSyncParcel?: (order: Order) => void;
  userRoles?: CrmRole[];
  currentUserId?: string;
  onOrderUpdated?: (order: Order) => void;
  onMove?: (order: Order, to: OrderStatus, note?: string) => void;
}) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>();
  const [view, setView] = useState<"list" | "grid">("list");
  const [query, setQuery] = useState("");
  const [jobStatus, setJobStatus] = useState<ProductionJob["status"] | "all">("all");
  const waitingJobs = jobs.filter((job) => job.status === "en_attente");
  const inProgressJobs = jobs.filter((job) => job.status === "en_cours");
  const completedJobs = jobs.filter((job) => job.status === "termine");
  const visibleJobs = useMemo(
    () =>
      jobs.filter((job) => {
        if (jobStatus !== "all" && job.status !== jobStatus) return false;
        const order = orders.find((item) => item.id === job.orderId);
        if (!query.trim()) return true;
        const haystack = `${job.orderRef} ${job.clientName} ${job.productSummary}`.toLowerCase();
        return haystack.includes(query.trim().toLowerCase()) || (order ? orderMatchesQuery(order, query) : false);
      }),
    [jobs, orders, query, jobStatus],
  );
  const confirmedOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          (order.status === "confirme" || order.status === "en_fabrication") &&
          orderMatchesQuery(order, query),
      ),
    [orders, query],
  );
  const selectedOrder = orders.find((order) => order.id === selectedOrderId);
  const selectedJob = jobs.find((job) => job.orderId === selectedOrderId);

  function openOrder(orderId: string) {
    setSelectedOrderId(orderId);
    onLoadOrder?.(orderId);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <CrmPanel className="!p-4">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-full ${statusConfig.en_attente.color} flex items-center justify-center text-white font-bold`}>
              {waitingJobs.length}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-black/50">
                En attente
              </p>
              <p className="text-sm font-bold text-black">À démarrer</p>
            </div>
          </div>
        </CrmPanel>
        <CrmPanel className="!p-4">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-full ${statusConfig.en_cours.color} flex items-center justify-center text-white font-bold`}>
              {inProgressJobs.length}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-black/50">
                En cours
              </p>
              <p className="text-sm font-bold text-black">En production</p>
            </div>
          </div>
        </CrmPanel>
        <CrmPanel className="!p-4">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-full ${statusConfig.termine.color} flex items-center justify-center text-white font-bold`}>
              {completedJobs.length}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-black/50">
                Terminés
              </p>
              <p className="text-sm font-bold text-black">Prêts pour préparation</p>
            </div>
          </div>
        </CrmPanel>
      </div>

      <CrmPanel className="!p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <OrderSearchField value={query} onChange={setQuery} placeholder="Rechercher reference, client, produit, remarque..." />
          <select
            value={jobStatus}
            onChange={(event) => setJobStatus(event.target.value as ProductionJob["status"] | "all")}
            className="h-11 rounded-lg border border-black/15 bg-white px-3 text-sm outline-none focus:border-michket-gold"
          >
            <option value="all">Tous les statuts fabrication</option>
            <option value="en_attente">En attente</option>
            <option value="en_cours">En cours</option>
            <option value="termine">Termine</option>
          </select>
        </div>
      </CrmPanel>

      <CrmPanel title={`Commandes confirmees (${confirmedOrders.length})`}>
        {confirmedOrders.length === 0 ? (
          <p className="text-sm text-black/40">Aucune commande confirmee pour cette recherche.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {confirmedOrders.map((order) => (
              <button
                key={order.id}
                type="button"
                onClick={() => openOrder(order.id)}
                className="rounded-lg border border-black/10 bg-white p-4 text-left hover:border-michket-gold"
              >
                <p className="font-bold">{orderRef(order)}</p>
                <p className="text-sm">{order.clientName}</p>
                <p className="text-xs text-black/50">{order.phone} · {order.wilaya}</p>
              </button>
            ))}
          </div>
        )}
      </CrmPanel>

      <CrmPanel
        title="File de production"
        actions={
          <div className="flex items-center gap-3">
            <ViewToggle view={view} onViewChange={setView} type="grid" />
            <CrmAddButton onClick={() => setIsPopupOpen(true)} label="Nouvelle production" />
          </div>
        }
      >
        {visibleJobs.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-lg font-semibold text-black/40">Aucune production en file</p>
            <p className="mt-2 text-sm text-black/30">
              Les commandes passées en fabrication apparaîtront ici
            </p>
          </div>
        ) : view === "list" ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/10 text-left text-xs font-semibold uppercase tracking-wider text-black/60">
                  <th className="px-4 py-3">Référence</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Produits</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Date début</th>
                </tr>
              </thead>
              <tbody>
                {visibleJobs.map((job) => (
                  <tr
                    key={job.id}
                    onClick={() => openOrder(job.orderId)}
                    className="border-b border-black/5 cursor-pointer transition hover:bg-black/[0.02]"
                  >
                    <td className="px-4 py-3 text-sm font-bold">{job.orderRef}</td>
                    <td className="px-4 py-3 text-sm text-black/70">{job.clientName}</td>
                    <td className="px-4 py-3 text-sm text-black/70">{job.productSummary}</td>
                    <td className="px-4 py-3">
                      <CrmBadge variant={statusConfig[job.status].variant}>
                        {productionStatusLabels[job.status]}
                      </CrmBadge>
                    </td>
                    <td className="px-4 py-3 text-sm text-black/60">
                      {job.startedAt ? formatDate(job.startedAt) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleJobs.map((job) => (
              <CrmCard
                key={job.id}
                onClick={() => openOrder(job.orderId)}
                className="p-5 cursor-pointer hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base">{job.orderRef}</h3>
                      <CrmBadge variant={statusConfig[job.status].variant}>
                        {productionStatusLabels[job.status]}
                      </CrmBadge>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-black/70">{job.clientName}</p>
                  </div>
                </div>

                <div className="rounded-lg border border-black/10 bg-black/[0.02] p-3 mb-4">
                  <p className="text-sm font-medium text-black/60 mb-1">Produits</p>
                  <p className="text-sm font-semibold">{job.productSummary}</p>
                </div>

                {job.startedAt && (
                  <div className="flex items-center gap-2 text-xs text-black/50 mb-4">
                    <span>Démarré le {formatDate(job.startedAt)}</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <CrmButton
                    variant="ghost"
                    size="sm"
                    disabled={job.status !== "en_attente" || !canEdit}
                    onClick={(event) => {
                      event.stopPropagation();
                      onStart(job);
                    }}
                  >
                    Démarrer
                  </CrmButton>
                  <CrmButton
                    size="sm"
                    disabled={job.status !== "en_cours" || !canEdit}
                    onClick={(event) => {
                      event.stopPropagation();
                      onFinish(job);
                    }}
                  >
                    Terminer
                  </CrmButton>
                </div>
              </CrmCard>
            ))}
          </div>
        )}
      </CrmPanel>

      <CrmPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        title="Nouvelle production"
      >
        <form className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              Référence commande
            </label>
            <input
              placeholder="CMD-XXX"
              className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold focus:ring-1 focus:ring-michket-gold"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              Nom client
            </label>
            <input
              placeholder="Nom du client"
              className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold focus:ring-1 focus:ring-michket-gold"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              Produits
            </label>
            <input
              placeholder="Liste des produits"
              className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold focus:ring-1 focus:ring-michket-gold"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <CrmButton
              type="button"
              variant="ghost"
              onClick={() => setIsPopupOpen(false)}
              className="flex-1"
            >
              Annuler
            </CrmButton>
            <CrmButton type="submit" className="flex-1">
              Créer production
            </CrmButton>
          </div>
        </form>
      </CrmPopup>

      <CrmOrderDetailsDrawer
        order={selectedOrder}
        isOpen={Boolean(selectedOrderId)}
        onClose={() => setSelectedOrderId(undefined)}
        onToast={onToast}
        onCreateParcel={onCreateParcel}
        onSyncParcel={onSyncParcel}
        userRoles={userRoles}
        currentUserId={currentUserId}
        onOrderUpdated={onOrderUpdated}
        onMove={onMove}
        showStatusSelect
      >
        {selectedJob && (
          <div className="space-y-3">
            <div className="rounded-lg border border-black/10 bg-black/[0.02] p-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-black/60">Fabrication</p>
              <div className="mt-2 flex items-center gap-2">
                <CrmBadge variant={statusConfig[selectedJob.status].variant}>
                  {productionStatusLabels[selectedJob.status]}
                </CrmBadge>
                {selectedJob.startedAt && (
                  <span className="text-black/60">Démarré le {formatDate(selectedJob.startedAt)}</span>
                )}
              </div>
            </div>
            <CrmButton
              variant="ghost"
              className="w-full"
              disabled={selectedJob.status !== "en_attente" || !canEdit}
              onClick={() => onStart(selectedJob)}
            >
              Démarrer
            </CrmButton>
            <CrmButton
              className="w-full"
              disabled={selectedJob.status !== "en_cours" || !canEdit}
              onClick={() => {
                onFinish(selectedJob);
                setSelectedOrderId(undefined);
              }}
            >
              Terminer
            </CrmButton>
          </div>
        )}
      </CrmOrderDetailsDrawer>
    </div>
  );
}
