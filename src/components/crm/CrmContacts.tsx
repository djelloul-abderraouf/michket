import { FormEvent, useState } from "react";
import { Search, Phone, MapPin, Calendar } from "lucide-react";
import { demoCompanies } from "@/lib/crm/demo-data";
import type { Contact } from "@/lib/crm/types";
import { CrmButton, CrmPanel, CrmCard, CrmBadge, formatDate, CrmAddButton, CrmPopup, CrmSideDrawer, ViewToggle } from "./CrmUi";

export function CrmContacts(props: {
  contacts: Contact[];
  canEdit: boolean;
  newContactName: string;
  newContactPhone: string;
  setNewContactName: (value: string) => void;
  setNewContactPhone: (value: string) => void;
  onAddContact: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | undefined>();
  const [view, setView] = useState<"list" | "kanban" | "grid">("list");
  const [filterType, setFilterType] = useState<"all" | "particulier" | "professionnel">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredContacts = props.contacts.filter((contact) => {
    const matchesType = filterType === "all" || contact.type === filterType;
    const matchesSearch =
      searchQuery.trim() === "" ||
      `${contact.firstName} ${contact.lastName} ${contact.phone}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const contactCount = {
    total: props.contacts.length,
    particulier: props.contacts.filter((c) => c.type === "particulier").length,
    professionnel: props.contacts.filter((c) => c.type === "professionnel").length,
  };

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold tracking-[0]">Contacts et entreprises</h2>
        <div className="flex items-center gap-3">
          <ViewToggle view={view} onViewChange={setView} type="grid" />
          <CrmAddButton
            onClick={() => setIsPopupOpen(true)}
            label="Nouveau contact"
            disabled={!props.canEdit}
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-black/10 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/50">
            Total
          </p>
          <p className="mt-2 text-2xl font-bold text-black">{contactCount.total}</p>
        </div>
        <div className="rounded-lg border border-black/10 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/50">
            Particulier
          </p>
          <p className="mt-2 text-2xl font-bold text-black">{contactCount.particulier}</p>
        </div>
        <div className="rounded-lg border border-black/10 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/50">
            Pro
          </p>
          <p className="mt-2 text-2xl font-bold text-black">{contactCount.professionnel}</p>
        </div>
      </div>

      {/* Contacts List */}
      <div className="space-y-4">
        {/* Filters */}
        <CrmPanel className="!p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Rechercher contacts..."
                className="h-11 w-full rounded-lg border border-black/15 px-4 pl-10 text-sm outline-none focus:border-michket-gold focus:ring-1 focus:ring-michket-gold"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType("all")}
                className={`px-3 py-2 text-sm font-semibold rounded-lg transition ${
                  filterType === "all"
                    ? "bg-black text-white"
                    : "bg-white text-black/70 hover:bg-black/5"
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setFilterType("particulier")}
                className={`px-3 py-2 text-sm font-semibold rounded-lg transition ${
                  filterType === "particulier"
                    ? "bg-black text-white"
                    : "bg-white text-black/70 hover:bg-black/5"
                }`}
              >
                Particulier
              </button>
              <button
                onClick={() => setFilterType("professionnel")}
                className={`px-3 py-2 text-sm font-semibold rounded-lg transition ${
                  filterType === "professionnel"
                    ? "bg-black text-white"
                    : "bg-white text-black/70 hover:bg-black/5"
                }`}
              >
                Pro
              </button>
            </div>
          </div>
        </CrmPanel>

        {/* Contacts Grid */}
        <CrmPanel title="Contacts et entreprises">
          {view === "list" ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-black/10 text-left text-xs font-semibold uppercase tracking-wider text-black/60">
                    <th className="px-4 py-3">Nom</th>
                    <th className="px-4 py-3">Téléphone</th>
                    <th className="px-4 py-3">Wilaya</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Entreprise</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.map((contact) => {
                    const company = demoCompanies.find((item) => item.id === contact.companyId);
                    return (
                      <tr
                        key={contact.id}
                        onClick={() => {
                          setSelectedContact(contact);
                          setIsDrawerOpen(true);
                        }}
                        className="border-b border-black/5 cursor-pointer transition hover:bg-black/[0.02]"
                      >
                        <td className="px-4 py-3 text-sm font-bold">
                          {contact.firstName} {contact.lastName}
                        </td>
                        <td className="px-4 py-3 text-sm text-black/70">{contact.phone}</td>
                        <td className="px-4 py-3 text-sm text-black/70">{contact.wilaya}</td>
                        <td className="px-4 py-3">
                          <CrmBadge variant={contact.type === "professionnel" ? "info" : "default"}>
                            {contact.type}
                          </CrmBadge>
                        </td>
                        <td className="px-4 py-3 text-sm text-black/70">{company?.name || "-"}</td>
                        <td className="px-4 py-3 text-sm text-black/60">{formatDate(contact.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredContacts.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-lg font-semibold text-black/40">Aucun contact trouvé</p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredContacts.map((contact) => {
                const company = demoCompanies.find((item) => item.id === contact.companyId);

                return (
                  <CrmCard 
                    key={contact.id} 
                    onClick={() => {
                      setSelectedContact(contact);
                      setIsDrawerOpen(true);
                    }}
                    hoverable 
                    className="p-4 cursor-pointer hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-michket-gold/20 text-lg font-bold text-michket-gold">
                        {contact.firstName[0]}
                      </div>
                      <CrmBadge variant={contact.type === "professionnel" ? "info" : "default"}>
                        {contact.type}
                      </CrmBadge>
                    </div>

                    <div className="mt-3">
                      <h3 className="font-bold text-base">
                        {contact.firstName} {contact.lastName}
                      </h3>
                      {company && (
                        <p className="mt-1 text-sm font-semibold text-michket-gold">
                          {company.name}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-black/70">
                        <Phone className="h-4 w-4" />
                        <span className="font-medium">{contact.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-black/70">
                        <MapPin className="h-4 w-4" />
                        <span>{contact.wilaya}</span>
                      </div>
                      <div className="flex items-center gap-2 text-black/50 text-xs">
                        <Calendar className="h-4 w-4" />
                        <span>Créé le {formatDate(contact.createdAt)}</span>
                      </div>
                    </div>
                  </CrmCard>
                );
              })}
            </div>
          )}

          {filteredContacts.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-lg font-semibold text-black/40">Aucun contact trouvé</p>
              <p className="mt-2 text-sm text-black/30">
                Essayez de modifier vos filtres de recherche
              </p>
            </div>
          )}
        </CrmPanel>
      </div>

      {/* New Contact Popup */}
      <CrmPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        title="Nouveau contact"
      >
        <form onSubmit={props.onAddContact} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              Nom complet
            </label>
            <input
              value={props.newContactName}
              onChange={(event) => props.setNewContactName(event.target.value)}
              placeholder="Prénom Nom"
              className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold focus:ring-1 focus:ring-michket-gold"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              Téléphone unique
            </label>
            <input
              value={props.newContactPhone}
              onChange={(event) => props.setNewContactPhone(event.target.value)}
              placeholder="0XXX XX XX XX"
              className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold focus:ring-1 focus:ring-michket-gold"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              Type
            </label>
            <select className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold focus:ring-1 focus:ring-michket-gold">
              <option value="particulier">Particulier</option>
              <option value="professionnel">Professionnel</option>
            </select>
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
              Ajouter contact
            </CrmButton>
          </div>
        </form>
      </CrmPopup>

      {/* Contact Details Side Drawer */}
      {selectedContact && (
        <CrmSideDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          title={`${selectedContact.firstName} ${selectedContact.lastName}`}
        >
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-michket-gold/20 text-2xl font-bold text-michket-gold">
                {selectedContact.firstName[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold tracking-[0]">
                    {selectedContact.firstName} {selectedContact.lastName}
                  </h3>
                  <CrmBadge variant={selectedContact.type === "professionnel" ? "info" : "default"}>
                    {selectedContact.type}
                  </CrmBadge>
                </div>
                {selectedContact.companyId && (
                  <p className="mt-1 text-sm font-semibold text-michket-gold">
                    {demoCompanies.find((c) => c.id === selectedContact.companyId)?.name}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-black/10 bg-black/[0.02] p-4">
              <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-black/60">
                Informations de contact
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-black/60" />
                  <span className="font-medium">{selectedContact.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-black/60" />
                  <span>{selectedContact.wilaya}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-black/60" />
                  <span className="text-sm text-black/60">Créé le {formatDate(selectedContact.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <CrmButton variant="ghost" className="flex-1">
                Modifier
              </CrmButton>
              <CrmButton variant="danger" className="flex-1">
                Supprimer
              </CrmButton>
            </div>
          </div>
        </CrmSideDrawer>
      )}
    </div>
  );
}
