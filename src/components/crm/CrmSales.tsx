import { useState } from "react";
import { dealStageLabels, dealStages, type Deal } from "@/lib/crm/types";
import { CrmPanel, CrmCard, CrmBadge, CrmButton, dzd, formatDate, CrmAddButton, CrmPopup, ViewToggle, CrmSideDrawer } from "./CrmUi";

const stageColors: Record<Deal["stage"], string> = {
  prospection: "border-l-stone-400 bg-stone-50",
  qualification: "border-l-blue-400 bg-blue-50",
  devis_envoye: "border-l-amber-400 bg-amber-50",
  negociation: "border-l-purple-400 bg-purple-50",
  gagnee: "border-l-emerald-500 bg-emerald-50",
  perdue: "border-l-rose-500 bg-rose-50",
};

export function CrmSales({
  deals,
  onStage,
}: {
  deals: Deal[];
  onStage: (deal: Deal, stage: Deal["stage"]) => void;
}) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [view, setView] = useState<"list" | "kanban">("list");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | undefined>();
  
  // Calculate pipeline statistics
  const totalPipeline = deals.reduce((sum, deal) => sum + deal.estimatedAmount, 0);
  const wonDeals = deals.filter((deal) => deal.stage === "gagnee");
  const lostDeals = deals.filter((deal) => deal.stage === "perdue");
  const conversionRate = deals.length > 0 ? (wonDeals.length / deals.length) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Pipeline Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CrmPanel className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/50">
            Pipeline total
          </p>
          <p className="mt-2 text-2xl font-bold text-black">{dzd.format(totalPipeline)}</p>
          <p className="mt-1 text-sm text-black/60">{deals.length} affaires</p>
        </CrmPanel>
        <CrmPanel className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/50">
            Gagnées
          </p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">{wonDeals.length}</p>
          <p className="mt-1 text-sm text-black/60">
            {dzd.format(wonDeals.reduce((sum, d) => sum + d.estimatedAmount, 0))}
          </p>
        </CrmPanel>
        <CrmPanel className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/50">
            Perdues
          </p>
          <p className="mt-2 text-2xl font-bold text-rose-600">{lostDeals.length}</p>
          <p className="mt-1 text-sm text-black/60">
            {dzd.format(lostDeals.reduce((sum, d) => sum + d.estimatedAmount, 0))}
          </p>
        </CrmPanel>
        <CrmPanel className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/50">
            Taux conversion
          </p>
          <p className="mt-2 text-2xl font-bold text-black">{conversionRate.toFixed(1)}%</p>
          <p className="mt-1 text-sm text-black/60">{wonDeals.length}/{deals.length}</p>
        </CrmPanel>
      </div>

      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold tracking-[0]">Pipeline des ventes</h2>
        <div className="flex items-center gap-3">
          <ViewToggle view={view} onViewChange={setView} type="kanban" />
          <CrmAddButton onClick={() => setIsPopupOpen(true)} label="Nouvelle affaire" />
        </div>
      </div>

      {/* Deals View */}
      {view === "list" ? (
        <CrmPanel title="Liste des affaires">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/10 text-left text-xs font-semibold uppercase tracking-wider text-black/60">
                  <th className="px-4 py-3">Titre</th>
                  <th className="px-4 py-3">Montant</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Étape</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((deal) => (
                  <tr
                    key={deal.id}
                    onClick={() => {
                      setSelectedDeal(deal);
                      setIsDrawerOpen(true);
                    }}
                    className="border-b border-black/5 cursor-pointer transition hover:bg-black/[0.02]"
                  >
                    <td className="px-4 py-3 text-sm font-bold">{deal.title}</td>
                    <td className="px-4 py-3 text-sm font-bold">{dzd.format(deal.estimatedAmount)}</td>
                    <td className="px-4 py-3 text-sm text-black/70">{deal.contactId || "-"}</td>
                    <td className="px-4 py-3">
                      <CrmBadge
                        variant={
                          deal.stage === "gagnee"
                            ? "success"
                            : deal.stage === "perdue"
                            ? "danger"
                            : "default"
                        }
                      >
                        {dealStageLabels[deal.stage]}
                      </CrmBadge>
                    </td>
                    <td className="px-4 py-3 text-sm text-black/60">{formatDate(deal.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {deals.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-lg font-semibold text-black/40">Aucune affaire</p>
              </div>
            )}
          </div>
        </CrmPanel>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {dealStages.map((stage) => {
            const stageDeals = deals.filter((deal) => deal.stage === stage);
            const stageValue = stageDeals.reduce((sum, deal) => sum + deal.estimatedAmount, 0);

            return (
              <div key={stage} className="min-w-[320px] w-[320px] flex-shrink-0 rounded-xl border border-black/10 bg-white shadow-sm flex flex-col h-full">
                <div className="flex items-center justify-between border-b border-black/10 px-4 py-3 bg-gradient-to-r from-black/5 to-transparent sticky top-0 bg-white z-10">
                  <div>
                    <h2 className="text-sm font-bold tracking-[0]">
                      {dealStageLabels[stage]}
                    </h2>
                    <p className="text-xs text-black/55">{dzd.format(stageValue)}</p>
                  </div>
                  <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-black px-2 py-0.5 text-xs font-bold text-white">
                    {stageDeals.length}
                  </span>
                </div>
                <div className="p-4 space-y-3 overflow-y-auto flex-1" style={{ maxHeight: 'calc(100vh - 320px)' }}>
                  {stageDeals.length === 0 ? (
                    <p className="text-center text-sm text-black/40 py-8">
                      Aucune affaire
                    </p>
                  ) : (
                    stageDeals.map((deal) => (
                      <CrmCard
                        key={deal.id}
                        onClick={() => {
                          setSelectedDeal(deal);
                          setIsDrawerOpen(true);
                        }}
                        className={`border-l-4 ${stageColors[deal.stage]} cursor-pointer hover:shadow-md transition-shadow`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <h3 className="font-bold text-sm leading-tight flex-1 break-words">
                            {deal.title}
                          </h3>
                          <div className="shrink-0">
                            <CrmBadge
                              variant={
                                stage === "gagnee"
                                  ? "success"
                                  : stage === "perdue"
                                  ? "danger"
                                  : "default"
                              }
                            >
                              {dealStageLabels[stage]}
                            </CrmBadge>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-black/60">Montant</span>
                            <span className="font-bold">{dzd.format(deal.estimatedAmount)}</span>
                          </div>
                          {deal.contactId && (
                            <div className="flex justify-between items-center">
                              <span className="text-black/60">Contact</span>
                              <span className="font-medium text-right truncate">{deal.contactId}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center text-xs text-black/50 pt-2 border-t border-black/5">
                            <span>Créé le</span>
                            <span>{formatDate(deal.createdAt)}</span>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-black/10">
                          <select
                            value={deal.stage}
                            onChange={(event) =>
                              onStage(deal, event.target.value as Deal["stage"])
                            }
                            className="h-9 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold focus:ring-1 focus:ring-michket-gold bg-white"
                          >
                            {dealStages.map((item) => (
                              <option key={item} value={item}>
                                {dealStageLabels[item]}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="mt-2 space-y-2">
                          {(stage === "qualification" || stage === "negociation") && (
                            <CrmButton variant="ghost" size="sm" className="w-full">
                              Créer devis
                            </CrmButton>
                          )}
                          {stage === "gagnee" && (
                            <CrmButton variant="success" size="sm" className="w-full">
                              Générer commande
                            </CrmButton>
                          )}
                        </div>
                      </CrmCard>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Deal Popup */}
      <CrmPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        title="Nouvelle affaire"
      >
        <form className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              Titre
            </label>
            <input
              placeholder="Titre de l'affaire"
              className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold focus:ring-1 focus:ring-michket-gold"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              Montant estimé
            </label>
            <input
              type="number"
              placeholder="0"
              className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold focus:ring-1 focus:ring-michket-gold"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              Contact
            </label>
            <input
              placeholder="Nom du contact"
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
              Créer affaire
            </CrmButton>
          </div>
        </form>
      </CrmPopup>

      {/* Deal Details Side Drawer */}
      {selectedDeal && (
        <CrmSideDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          title={`Détails: ${selectedDeal.title}`}
        >
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold tracking-[0]">{selectedDeal.title}</h3>
                  <CrmBadge
                    variant={
                      selectedDeal.stage === "gagnee"
                        ? "success"
                        : selectedDeal.stage === "perdue"
                        ? "danger"
                        : "default"
                    }
                  >
                    {dealStageLabels[selectedDeal.stage]}
                  </CrmBadge>
                </div>
                {selectedDeal.contactId && (
                  <p className="mt-2 text-sm text-black/60">Contact: {selectedDeal.contactId}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-black">{dzd.format(selectedDeal.estimatedAmount)}</p>
                <p className="text-sm text-black/50">{formatDate(selectedDeal.createdAt)}</p>
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-black/60">
                Changer d'étape
              </h4>
              <select
                value={selectedDeal.stage}
                onChange={(event) =>
                  onStage(selectedDeal, event.target.value as Deal["stage"])
                }
                className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold focus:ring-1 focus:ring-michket-gold"
              >
                {dealStages.map((item) => (
                  <option key={item} value={item}>
                    {dealStageLabels[item]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-black/60">
                Actions disponibles
              </h4>
              <div className="space-y-2">
                {(selectedDeal.stage === "qualification" || selectedDeal.stage === "negociation") && (
                  <CrmButton variant="ghost" size="sm" className="w-full">
                    Créer devis
                  </CrmButton>
                )}
                {selectedDeal.stage === "gagnee" && (
                  <CrmButton variant="success" size="sm" className="w-full">
                    Générer commande
                  </CrmButton>
                )}
              </div>
            </div>
          </div>
        </CrmSideDrawer>
      )}
    </div>
  );
}
