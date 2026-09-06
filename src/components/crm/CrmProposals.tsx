import { useState } from "react";
import { demoDeals, demoProposals, demoProducts } from "@/lib/crm/demo-data";
import type { Proposal, Deal } from "@/lib/crm/types";
import { CrmPanel, CrmCard, CrmBadge, CrmButton, dzd, formatDate, CrmAddButton, CrmPopup } from "./CrmUi";

const proposalStatusConfig: Record<Proposal["status"], { variant: any; label: string }> = {
  brouillon: { variant: "default" as const, label: "Brouillon" },
  envoyee: { variant: "info" as const, label: "Envoyée" },
  acceptee: { variant: "success" as const, label: "Acceptée" },
  refusee: { variant: "danger" as const, label: "Refusée" },
};

export function CrmProposals() {
  const [proposals, setProposals] = useState<Proposal[]>(demoProposals);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
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
        actions={<CrmAddButton onClick={() => setIsPopupOpen(true)} label="Nouveau devis" />}
      >

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {proposals.map((proposal) => {
            const deal = demoDeals.find((d) => d.id === proposal.dealId);
            return (
              <CrmCard key={proposal.id} className="p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-base">{deal?.title || "Affaire inconnue"}</h3>
                      <CrmBadge variant={proposalStatusConfig[proposal.status].variant}>
                        {proposalStatusConfig[proposal.status].label}
                      </CrmBadge>
                    </div>
                    <p className="text-xs text-black/50">{formatDate(proposal.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-black">{dzd.format(proposal.total)}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="rounded-lg border border-black/10 bg-black/[0.02] p-3">
                    <p className="text-xs font-medium text-black/60 mb-2">Contenu du devis</p>
                    <div className="space-y-1">
                      {proposal.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-black/70">
                            {item.quantity}x {item.productName}
                          </span>
                          <span className="font-medium">{dzd.format(item.unitPrice * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-black/10">
                  {proposal.status === "brouillon" && (
                    <>
                      <CrmButton size="sm">
                        Envoyer
                      </CrmButton>
                      <CrmButton variant="ghost" size="sm">
                        Modifier
                      </CrmButton>
                    </>
                  )}
                  {proposal.status === "envoyee" && (
                    <>
                      <CrmButton variant="success" size="sm">
                        Accepter
                      </CrmButton>
                      <CrmButton variant="danger" size="sm">
                        Refuser
                      </CrmButton>
                    </>
                  )}
                  {proposal.status === "acceptee" && (
                    <CrmButton variant="success" size="sm">
                      Générer commande
                    </CrmButton>
                  )}
                </div>
              </CrmCard>
            );
          })}
        </div>

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