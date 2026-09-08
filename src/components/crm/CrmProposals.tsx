import { useState } from "react";
import { demoDeals, demoProposals, demoProducts } from "@/lib/crm/demo-data";
import type { Proposal, Deal } from "@/lib/crm/types";
import { CrmPanel, CrmCard, CrmBadge, CrmButton, dzd, formatDate, CrmAddButton, CrmPopup, ViewToggle } from "./CrmUi";

const proposalStatusConfig: Record<Proposal["status"], { variant: any; label: string }> = {
  brouillon: { variant: "default" as const, label: "Brouillon" },
  envoyee: { variant: "info" as const, label: "Envoyée" },
  acceptee: { variant: "success" as const, label: "Acceptée" },
  refusee: { variant: "danger" as const, label: "Refusée" },
};

const proposalStages: Proposal["status"][] = ["brouillon", "envoyee", "acceptee", "refusee"];

const stageColors: Record<Proposal["status"], string> = {
  brouillon: "border-l-stone-400 bg-stone-50",
  envoyee: "border-l-amber-400 bg-amber-50",
  acceptee: "border-l-emerald-500 bg-emerald-50",
  refusee: "border-l-rose-500 bg-rose-50",
};

export function CrmProposals() {
  const [proposals, setProposals] = useState<Proposal[]>(demoProposals);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [view, setView] = useState<"list" | "kanban">("list");
  const [selectedDeal, setSelectedDeal] = useState<string>("");
  const [newProposal, setNewProposal] = useState({
    dealId: "",
    items: [] as Array<{ productId: string; quantity: number }>,
  });

  const handleCreateProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeal || newProposal.items.length === 0) return;

    const deal = demoDeals.find((d) => d.id === selectedDeal);
    if (!deal) return;

    const total = newProposal.items.reduce((sum, item) => {
      const product = demoProducts.find((p) => p.id === item.productId);
      return sum + (product?.price || 0) * item.quantity;
    }, 0);

    const proposal: Proposal = {
      id: `prop-${Date.now()}`,
      dealId: selectedDeal,
      status: "brouillon",
      items: newProposal.items.map((item) => {
        const product = demoProducts.find((p) => p.id === item.productId);
        return {
          productId: item.productId,
          productName: product?.name || "",
          quantity: item.quantity,
          unitPrice: product?.price || 0,
        };
      }),
      total,
      createdAt: new Date().toISOString(),
    };

    setProposals([proposal, ...proposals]);
    setNewProposal({ dealId: "", items: [] });
    setSelectedDeal("");
    setIsPopupOpen(false);
  };

  const addItemToProposal = (productId: string) => {
    const existingItem = newProposal.items.find((item) => item.productId === productId);
    if (existingItem) {
      setNewProposal({
        ...newProposal,
        items: newProposal.items.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      });
    } else {
      setNewProposal({
        ...newProposal,
        items: [...newProposal.items, { productId, quantity: 1 }],
      });
    }
  };

  const removeItemFromProposal = (productId: string) => {
    setNewProposal({
      ...newProposal,
      items: newProposal.items.filter((item) => item.productId !== productId),
    });
  };

  const updateItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItemFromProposal(productId);
    } else {
      setNewProposal({
        ...newProposal,
        items: newProposal.items.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        ),
      });
    }
  };

  const proposalStats = {
    total: proposals.length,
    envoyee: proposals.filter((p) => p.status === "envoyee").length,
    acceptee: proposals.filter((p) => p.status === "acceptee").length,
    refusee: proposals.filter((p) => p.status === "refusee").length,
  };

  const conversionRate = proposals.length > 0 
    ? (proposalStats.acceptee / proposals.length) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-4">
        <CrmPanel className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/50">
            Total propositions
          </p>
          <p className="mt-2 text-2xl font-bold text-black">{proposalStats.total}</p>
          <p className="mt-1 text-sm text-black/60">Devis créés</p>
        </CrmPanel>
        <CrmPanel className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/50">
            En attente
          </p>
          <p className="mt-2 text-2xl font-bold text-amber-600">{proposalStats.envoyee}</p>
          <p className="mt-1 text-sm text-black/60">Envoyées</p>
        </CrmPanel>
        <CrmPanel className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/50">
            Acceptées
          </p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">{proposalStats.acceptee}</p>
          <p className="mt-1 text-sm text-black/60">Converties</p>
        </CrmPanel>
        <CrmPanel className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/50">
            Taux conversion
          </p>
          <p className="mt-2 text-2xl font-bold text-black">{conversionRate.toFixed(1)}%</p>
          <p className="mt-1 text-sm text-black/60">Acceptées / Total</p>
        </CrmPanel>
      </div>

      {/* Proposals List */}
      <CrmPanel
        title="Propositions commerciales"
        actions={
          <div className="flex items-center gap-3">
            <ViewToggle view={view} onViewChange={setView} type="kanban" />
            <CrmAddButton onClick={() => setIsPopupOpen(true)} label="Nouveau devis" />
          </div>
        }
      >
        {view === "list" ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/10 text-left text-xs font-semibold uppercase tracking-wider text-black/60">
                  <th className="px-4 py-3">Affaire</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {proposals.map((proposal) => {
                  const deal = demoDeals.find((d) => d.id === proposal.dealId);
                  return (
                    <tr
                      key={proposal.id}
                      className="border-b border-black/5 transition hover:bg-black/[0.02]"
                    >
                      <td className="px-4 py-3 text-sm font-bold">{deal?.title || "Affaire inconnue"}</td>
                      <td className="px-4 py-3">
                        <CrmBadge variant={proposalStatusConfig[proposal.status].variant}>
                          {proposalStatusConfig[proposal.status].label}
                        </CrmBadge>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold">{dzd.format(proposal.total)}</td>
                      <td className="px-4 py-3 text-sm text-black/60">{formatDate(proposal.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {proposalStages.map((status) => {
              const statusProposals = proposals.filter((p) => p.status === status);
              const statusValue = statusProposals.reduce((sum, p) => sum + p.total, 0);

              return (
                <div key={status} className="min-w-[320px] w-[320px] flex-shrink-0 rounded-xl border border-black/10 bg-white shadow-sm flex flex-col h-full">
                  <div className="flex items-center justify-between border-b border-black/10 px-4 py-3 bg-gradient-to-r from-black/5 to-transparent sticky top-0 bg-white z-10">
                    <div>
                      <h2 className="text-sm font-bold tracking-[0]">
                        {proposalStatusConfig[status].label}
                      </h2>
                      <p className="text-xs text-black/55">{dzd.format(statusValue)}</p>
                    </div>
                    <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-black px-2 py-0.5 text-xs font-bold text-white">
                      {statusProposals.length}
                    </span>
                  </div>
                  <div className="p-4 space-y-3 overflow-y-auto flex-1" style={{ maxHeight: 'calc(100vh - 320px)' }}>
                    {statusProposals.length === 0 ? (
                      <p className="text-center text-sm text-black/40 py-8">
                        Aucune proposition
                      </p>
                    ) : (
                      statusProposals.map((proposal) => {
                        const deal = demoDeals.find((d) => d.id === proposal.dealId);
                        return (
                          <CrmCard
                            key={proposal.id}
                            className={`border-l-4 ${stageColors[proposal.status]} cursor-pointer hover:shadow-md transition-shadow`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <h3 className="font-bold text-sm leading-tight flex-1 break-words">
                                {deal?.title || "Affaire inconnue"}
                              </h3>
                              <div className="shrink-0">
                                <CrmBadge variant={proposalStatusConfig[proposal.status].variant}>
                                  {proposalStatusConfig[proposal.status].label}
                                </CrmBadge>
                              </div>
                            </div>

                            <div className="space-y-2 text-sm mb-3">
                              <div className="flex justify-between items-center">
                                <span className="text-black/60">Total</span>
                                <span className="font-bold">{dzd.format(proposal.total)}</span>
                              </div>
                              <div className="flex justify-between items-center text-xs text-black/50 pt-2 border-t border-black/5">
                                <span>Créé le</span>
                                <span>{formatDate(proposal.createdAt)}</span>
                              </div>
                            </div>

                            <div className="rounded-lg border border-black/10 bg-black/[0.02] p-2 mb-3">
                              <p className="text-xs font-semibold uppercase tracking-wider text-black/60 mb-1">Contenu</p>
                              <div className="space-y-1">
                                {proposal.items.slice(0, 2).map((item, index) => (
                                  <div key={index} className="flex justify-between text-xs">
                                    <span className="text-black/70">
                                      {item.quantity}x {item.productName}
                                    </span>
                                    <span className="font-medium">{dzd.format(item.unitPrice * item.quantity)}</span>
                                  </div>
                                ))}
                                {proposal.items.length > 2 && (
                                  <p className="text-xs text-black/50">+{proposal.items.length - 2} autres</p>
                                )}
                              </div>
                            </div>

                            <div className="flex gap-2 pt-3 border-t border-black/10">
                              {proposal.status === "brouillon" && (
                                <CrmButton size="sm" className="flex-1">
                                  Envoyer
                                </CrmButton>
                              )}
                              {proposal.status === "envoyee" && (
                                <>
                                  <CrmButton variant="success" size="sm" className="flex-1">
                                    Accepter
                                  </CrmButton>
                                  <CrmButton variant="danger" size="sm" className="flex-1">
                                    Refuser
                                  </CrmButton>
                                </>
                              )}
                              {proposal.status === "acceptee" && (
                                <CrmButton variant="success" size="sm" className="flex-1">
                                  Générer commande
                                </CrmButton>
                              )}
                            </div>
                          </CrmCard>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {proposals.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-lg font-semibold text-black/40">Aucune proposition</p>
            <p className="mt-2 text-sm text-black/30">
              Créez votre premier devis depuis une affaire
            </p>
          </div>
        )}
      </CrmPanel>

      {/* New Proposal Popup */}
      <CrmPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        title="Nouveau devis"
      >
        <form onSubmit={handleCreateProposal} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              Affaire concernée
            </label>
            <select
              value={selectedDeal}
              onChange={(e) => setSelectedDeal(e.target.value)}
              className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold focus:ring-1 focus:ring-michket-gold"
            >
              <option value="">Sélectionner une affaire</option>
              {demoDeals.map((deal) => (
                <option key={deal.id} value={deal.id}>
                  {deal.title} - {dzd.format(deal.estimatedAmount)}
                </option>
              ))}
            </select>
          </div>

          {selectedDeal && (
            <>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
                  Produits
                </label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {demoProducts.filter((p) => p.active).map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => addItemToProposal(product.id)}
                      className="flex items-center justify-between rounded-lg border border-black/10 bg-white p-3 text-left hover:border-michket-gold transition"
                    >
                      <span className="text-sm font-medium">{product.name}</span>
                      <span className="text-sm font-bold">{dzd.format(product.price)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {newProposal.items.length > 0 && (
                <div className="rounded-lg border border-black/10 bg-white p-4">
                  <h4 className="mb-3 font-bold text-sm">Produits sélectionnés</h4>
                  <div className="space-y-2">
                    {newProposal.items.map((item) => {
                      const product = demoProducts.find((p) => p.id === item.productId);
                      return (
                        <div key={item.productId} className="flex items-center justify-between">
                          <span className="text-sm">{product?.name}</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateItemQuantity(item.productId, item.quantity - 1)}
                              className="h-6 w-6 rounded bg-black/10 text-sm font-bold hover:bg-black/20"
                            >
                              -
                            </button>
                            <span className="text-sm font-bold w-8 text-center">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateItemQuantity(item.productId, item.quantity + 1)}
                              className="h-6 w-6 rounded bg-black/10 text-sm font-bold hover:bg-black/20"
                            >
                              +
                            </button>
                            <button
                              type="button"
                              onClick={() => removeItemFromProposal(item.productId)}
                              className="ml-2 text-rose-600 hover:text-rose-700"
                            >
                              X
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 pt-3 border-t border-black/10 flex justify-between">
                    <span className="font-bold">Total</span>
                    <span className="font-bold">
                      {dzd.format(
                        newProposal.items.reduce((sum, item) => {
                          const product = demoProducts.find((p) => p.id === item.productId);
                          return sum + (product?.price || 0) * item.quantity;
                        }, 0)
                      )}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <CrmButton
                  type="button"
                  variant="ghost"
                  onClick={() => setIsPopupOpen(false)}
                  className="flex-1"
                >
                  Annuler
                </CrmButton>
                <CrmButton type="submit" disabled={newProposal.items.length === 0} className="flex-1">
                  Créer proposition
                </CrmButton>
              </div>
            </>
          )}
        </form>
      </CrmPopup>
    </div>
  );
}