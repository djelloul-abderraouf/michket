import { useEffect, useState } from "react";
import type { Company } from "@/lib/crm/types";
import { CrmPanel, CrmCard, CrmBadge, CrmButton, CrmAddButton, CrmPopup, ViewToggle, formatDate } from "./CrmUi";

export function CrmCompanies(props: {
  companies: Company[];
  canEdit: boolean;
  onAddCompany: (data: { name: string; sector: string; commercialTerms?: string }) => void;
  onUpdateCompany: (id: string, data: Partial<Company>) => void;
  onDeleteCompany: (id: string) => void;
}) {
  const [companies, setCompanies] = useState<Company[]>(props.companies);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "grid">("list");
  const [newCompany, setNewCompany] = useState({
    name: "",
    sector: "",
    commercialTerms: "",
  });

  useEffect(() => {
    setCompanies(props.companies);
  }, [props.companies]);

  const handleAddCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.name || !props.canEdit) return;

    if (editingId) {
      props.onUpdateCompany(editingId, {
        name: newCompany.name,
        sector: newCompany.sector || "General",
        commercialTerms: newCompany.commercialTerms,
      });
    } else {
      props.onAddCompany({
        name: newCompany.name,
        sector: newCompany.sector || "General",
        commercialTerms: newCompany.commercialTerms,
      });
    }
    setNewCompany({ name: "", sector: "", commercialTerms: "" });
    setEditingId(null);
    setIsPopupOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <CrmPanel className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/50">
            Total entreprises
          </p>
          <p className="mt-2 text-2xl font-bold text-black">{companies.length}</p>
          <p className="mt-1 text-sm text-black/60">Enregistrées</p>
        </CrmPanel>
        <CrmPanel className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/50">
            Secteurs
          </p>
          <p className="mt-2 text-2xl font-bold text-black">
            {new Set(companies.map((c) => c.sector)).size}
          </p>
          <p className="mt-1 text-sm text-black/60">Différents</p>
        </CrmPanel>
        <CrmPanel className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/50">
            B2B
          </p>
          <p className="mt-2 text-2xl font-bold text-michket-gold">
            {companies.length}
          </p>
          <p className="mt-1 text-sm text-black/60">Clients professionnels</p>
        </CrmPanel>
      </div>

      {/* Companies List */}
      <CrmPanel
        title="Entreprises"
        actions={
          <div className="flex items-center gap-3">
            <ViewToggle view={view} onViewChange={setView} type="grid" />
            <CrmAddButton
              onClick={() => {
                setEditingId(null);
                setNewCompany({ name: "", sector: "", commercialTerms: "" });
                setIsPopupOpen(true);
              }}
              label="Nouvelle entreprise"
              disabled={!props.canEdit}
            />
          </div>
        }
      >

        {view === "list" ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/10 text-left text-xs font-semibold uppercase tracking-wider text-black/60">
                  <th className="px-4 py-3">Nom</th>
                  <th className="px-4 py-3">Secteur</th>
                  <th className="px-4 py-3">Conditions</th>
                  <th className="px-4 py-3">Date création</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr
                    key={company.id}
                    className="border-b border-black/5 transition hover:bg-black/[0.02]"
                  >
                    <td className="px-4 py-3 text-sm font-bold">{company.name}</td>
                    <td className="px-4 py-3 text-sm text-black/70">{company.sector || "-"}</td>
                    <td className="px-4 py-3 text-sm text-black/70">{company.commercialTerms || "-"}</td>
                    <td className="px-4 py-3 text-sm text-black/60">{formatDate(company.createdAt)}</td>
                    <td className="px-4 py-3">
                      {props.canEdit && (
                        <div className="flex gap-2">
                          <CrmButton
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingId(company.id);
                              setNewCompany({
                                name: company.name,
                                sector: company.sector,
                                commercialTerms: company.commercialTerms || "",
                              });
                              setIsPopupOpen(true);
                            }}
                          >
                            Modifier
                          </CrmButton>
                          <CrmButton
                            variant="danger"
                            size="sm"
                            onClick={() => props.onDeleteCompany(company.id)}
                          >
                            Supprimer
                          </CrmButton>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {companies.map((company) => (
              <CrmCard key={company.id} className="p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-michket-gold/20 text-lg font-bold text-michket-gold">
                    {company.name[0]}
                  </div>
                  <CrmBadge variant="info">B2B</CrmBadge>
                </div>

                <h3 className="font-bold text-base mb-2">{company.name}</h3>

                <div className="space-y-2 text-sm mb-4">
                  {company.sector && (
                    <div className="flex items-center gap-2 text-black/70">
                      <span className="font-medium">{company.sector}</span>
                    </div>
                  )}
                  {company.commercialTerms && (
                    <div className="rounded-lg border border-black/10 bg-black/[0.02] p-3">
                      <p className="text-xs font-medium text-black/60 mb-1">Conditions</p>
                      <p className="text-sm">{company.commercialTerms}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t border-black/10">
                  <CrmButton
                    variant="ghost"
                    size="sm"
                    disabled={!props.canEdit}
                    onClick={() => {
                      setEditingId(company.id);
                      setNewCompany({
                        name: company.name,
                        sector: company.sector,
                        commercialTerms: company.commercialTerms || "",
                      });
                      setIsPopupOpen(true);
                    }}
                  >
                    Modifier
                  </CrmButton>
                  <CrmButton
                    variant="danger"
                    size="sm"
                    disabled={!props.canEdit}
                    onClick={() => props.onDeleteCompany(company.id)}
                  >
                    Supprimer
                  </CrmButton>
                </div>
              </CrmCard>
            ))}
          </div>
        )}
      </CrmPanel>

      {/* New Company Popup */}
      <CrmPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        title={editingId ? "Modifier l'entreprise" : "Nouvelle entreprise"}
      >
        <form onSubmit={handleAddCompany} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              Nom de l'entreprise
            </label>
            <input
              value={newCompany.name}
              onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
              placeholder="Ex: SARL Technologie"
              className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold focus:ring-1 focus:ring-michket-gold"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              Secteur d'activité
            </label>
            <input
              value={newCompany.sector}
              onChange={(e) => setNewCompany({ ...newCompany, sector: e.target.value })}
              placeholder="Ex: Informatique, Construction..."
              className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold focus:ring-1 focus:ring-michket-gold"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              Conditions commerciales
            </label>
            <textarea
              value={newCompany.commercialTerms}
              onChange={(e) => setNewCompany({ ...newCompany, commercialTerms: e.target.value })}
              placeholder="Ex: Paiement 30 jours, Remise 10%..."
              rows={3}
              className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm outline-none focus:border-michket-gold focus:ring-1 focus:ring-michket-gold resize-none"
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
            <CrmButton type="submit" disabled={!props.canEdit} className="flex-1">
              {editingId ? "Enregistrer" : "Créer entreprise"}
            </CrmButton>
          </div>
        </form>
      </CrmPopup>
    </div>
  );
}