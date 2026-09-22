import { useState } from "react";
import { productionStatusLabels, type Order, type ProductionJob } from "@/lib/crm/types";
import { CrmPanel, CrmCard, CrmBadge, CrmButton, formatDate, CrmAddButton, CrmPopup, ViewToggle } from "./CrmUi";
import { CrmOrderDetailsDrawer } from "./CrmOrderDetailsDrawer";

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
}: {
  jobs: ProductionJob[];
  orders: Order[];
  canEdit: boolean;
  onStart: (job: ProductionJob) => void;
  onFinish: (job: ProductionJob) => void;
  onLoadOrder?: (id: string) => void;
  onToast?: (message: string) => void;
}) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | undefined>();
  const [view, setView] = useState<"list" | "grid">("list");
  const waitingJobs = jobs.filter((job) => job.status === "en_attente");
  const inProgressJobs = jobs.filter((job) => job.status === "en_cours");
  const completedJobs = jobs.filter((job) => job.status === "termine");
  const selectedJob = jobs.find((job) => job.id === selectedJobId);
  const selectedOrder = selectedJob
    ? orders.find((order) => order.id === selectedJob.orderId)
    : undefined;

  function openJob(job: ProductionJob) {
    setSelectedJobId(job.id);
    onLoadOrder?.(job.orderId);
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

      <CrmPanel
        title="File de production"
        actions={
          <div className="flex items-center gap-3">
            <ViewToggle view={view} onViewChange={setView} type="grid" />
            <CrmAddButton onClick={() => setIsPopupOpen(true)} label="Nouvelle production" />
          </div>
        }
      >
        {jobs.length === 0 ? (
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
                {jobs.map((job) => (
                  <tr
                    key={job.id}
                    onClick={() => openJob(job)}
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
            {jobs.map((job) => (
              <CrmCard
                key={job.id}
                onClick={() => openJob(job)}
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
        isOpen={Boolean(selectedJobId)}
        onClose={() => setSelectedJobId(undefined)}
        onToast={onToast}
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
                setSelectedJobId(undefined);
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
