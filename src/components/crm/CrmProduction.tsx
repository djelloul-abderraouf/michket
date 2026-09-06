import { useState } from "react";
import { productionStatusLabels, type ProductionJob } from "@/lib/crm/types";
import { CrmPanel, CrmCard, CrmBadge, CrmButton, formatDate, CrmAddButton, CrmPopup, CrmSideDrawer, ViewToggle } from "./CrmUi";

const statusConfig: Record<ProductionJob["status"], { variant: any; color: string }> = {
  en_attente: { variant: "warning" as const, color: "bg-amber-500" },
  en_cours: { variant: "info" as const, color: "bg-cyan-500" },
  termine: { variant: "success" as const, color: "bg-emerald-500" },
};

export function CrmProduction({
  jobs,
  onStart,
  onFinish,
}: {
  jobs: ProductionJob[];
  onStart: (job: ProductionJob) => void;
  onFinish: (job: ProductionJob) => void;
}) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<ProductionJob | undefined>();
  const [view, setView] = useState<"list" | "grid">("list");
  const waitingJobs = jobs.filter((job) => job.status === "en_attente");
  const inProgressJobs = jobs.filter((job) => job.status === "en_cours");
  const completedJobs = jobs.filter((job) => job.status === "termine");

  return (
    <div className="space-y-6">
      {/* Statistics */}
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

      {/* Production Queue */}
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
                    onClick={() => {
                      setSelectedJob(job);
                      setIsDrawerOpen(true);
                    }}
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
                onClick={() => {
                  setSelectedJob(job);
                  setIsDrawerOpen(true);
                }}
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
                    disabled={job.status !== "en_attente"}
                    onClick={() => onStart(job)}
                  >
                    Démarrer
                  </CrmButton>
                  <CrmButton
                    size="sm"
                    disabled={job.status !== "en_cours"}
                    onClick={() => onFinish(job)}
                  >
                    Terminer
                  </CrmButton>
                </div>
              </CrmCard>
            ))}
          </div>
        )}
      </CrmPanel>

      {/* New Production Popup */}
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

      {/* Production Job Details Side Drawer */}
      {selectedJob && (
        <CrmSideDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          title={`Production: ${selectedJob.orderRef}`}
        >
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold tracking-[0]">{selectedJob.orderRef}</h3>
                  <CrmBadge variant={statusConfig[selectedJob.status].variant}>
                    {productionStatusLabels[selectedJob.status]}
                  </CrmBadge>
                </div>
                <p className="mt-2 text-sm font-semibold text-black/70">{selectedJob.clientName}</p>
              </div>
            </div>

            <div className="rounded-lg border border-black/10 bg-black/[0.02] p-4">
              <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-black/60">
                Produits
              </h4>
              <p className="text-sm font-semibold">{selectedJob.productSummary}</p>
            </div>

            {selectedJob.startedAt && (
              <div className="flex items-center gap-2 text-sm text-black/60">
                <span>Démarré le {formatDate(selectedJob.startedAt)}</span>
              </div>
            )}

            <div className="space-y-2">
              <CrmButton
                variant="ghost"
                size="sm"
                disabled={selectedJob.status !== "en_attente"}
                onClick={() => onStart(selectedJob)}
                className="w-full"
              >
                Démarrer
              </CrmButton>
              <CrmButton
                size="sm"
                disabled={selectedJob.status !== "en_cours"}
                onClick={() => onFinish(selectedJob)}
                className="w-full"
              >
                Terminer
              </CrmButton>
            </div>
          </div>
        </CrmSideDrawer>
      )}
    </div>
  );
}
