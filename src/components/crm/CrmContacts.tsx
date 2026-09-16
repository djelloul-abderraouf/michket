import { useState } from "react";
import { Search, Phone, MapPin, Calendar, Mail } from "lucide-react";
import type { Company, Contact } from "@/lib/crm/types";
import { ALGERIA_WILAYAS } from "@/lib/crm/wilayas";
import { CrmButton, CrmPanel, CrmCard, CrmBadge, formatDate, CrmAddButton, CrmPopup, CrmSideDrawer, ViewToggle } from "./CrmUi";

const inputClass =
  "h-10 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold focus:ring-1 focus:ring-michket-gold";

type ContactForm = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  wilaya: string;
  type: Contact["type"];
  companyId: string;
};

const emptyForm: ContactForm = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  wilaya: "Alger",
  type: "particulier",
  companyId: "",
};

export function CrmContacts(props: {
  contacts: Contact[];
  companies?: Company[];
  canEdit: boolean;
  onAddContact: (data: ContactForm) => void;
  onUpdateContact: (id: string, data: Partial<Contact>) => void;
  onDeleteContact: (id: string) => void;
}) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | undefined>();
  const [form, setForm] = useState<ContactForm>(emptyForm);
  const [view, setView] = useState<"list" | "kanban" | "grid">("list");
  const [filterType, setFilterType] = useState<"all" | "particulier" | "professionnel">("particulier");
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
        <h2 className="text-lg font-bold tracking-[0]">Clients individuels</h2>
        <div className="flex items-center gap-3">
          <p className="hidden sm:block text-xs text-black/50">
            Les comptes boutique (role customer) deviennent des clients individuels. Les entreprises restent dans la table crm_companies.
          </p>
          <ViewToggle view={view} onViewChange={setView} type="grid" />
          <CrmAddButton
            onClick={() => {
              setForm(emptyForm);
              setIsPopupOpen(true);
            }}
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
          <p className="text-xs text-black/40 mt-1">Liés à crm_companies</p>
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
                Clients (indiv.)
              </button>
              <button
                onClick={() => setFilterType("professionnel")}
                className={`px-3 py-2 text-sm font-semibold rounded-lg transition ${
                  filterType === "professionnel"
                    ? "bg-black text-white"
                    : "bg-white text-black/70 hover:bg-black/5"
                }`}
              >
                Pro (entreprise)
              </button>
            </div>
          </div>
        </CrmPanel>

        {/* Contacts Grid */}
        <CrmPanel title="Clients individuels">
          {view === "list" ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-black/10 text-left text-xs font-semibold uppercase tracking-wider text-black/60">
                    <th className="px-4 py-3">Nom</th>
                    <th className="px-4 py-3">Téléphone</th>
                    <th className="px-4 py-3">Wilaya</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3">Entreprise</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.map((contact) => {
                    const companyName = props.companies?.find((company) => company.id === contact.companyId)?.name || "";
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
                            {contact.type === "professionnel" ? "Pro" : "Client"}
                          </CrmBadge>
                        </td>
                        <td className="px-4 py-3 text-sm text-black/70">
                          {contact.source === "boutique" ? "Boutique" : "CRM"}
                        </td>
                        <td className="px-4 py-3 text-sm text-black/70">{companyName || "-"}</td>
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
                const companyName = props.companies?.find((company) => company.id === contact.companyId)?.name || "";

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
                      {companyName && (
                        <p className="mt-1 text-sm font-semibold text-michket-gold">
                          {companyName}
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
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!form.firstName.trim() || !form.phone.trim()) return;
            props.onAddContact(form);
            setForm(emptyForm);
            setIsPopupOpen(false);
          }}
          className="space-y-4"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
                Prenom
              </label>
              <input
                value={form.firstName}
                onChange={(event) => setForm({ ...form, firstName: event.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
                Nom
              </label>
              <input
                value={form.lastName}
                onChange={(event) => setForm({ ...form, lastName: event.target.value })}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              Telephone
            </label>
            <input
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
              placeholder="0555123456"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              Wilaya
            </label>
            <select
              value={form.wilaya}
              onChange={(event) => setForm({ ...form, wilaya: event.target.value })}
              className={inputClass}
            >
              {ALGERIA_WILAYAS.map((wilaya) => (
                <option key={wilaya.code} value={wilaya.name}>
                  {wilaya.code} - {wilaya.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              Type
            </label>
            <select
              value={form.type}
              onChange={(event) => setForm({ ...form, type: event.target.value as Contact["type"] })}
              className={inputClass}
            >
              <option value="particulier">Particulier</option>
              <option value="professionnel">Professionnel</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              Entreprise
            </label>
            <select
              value={form.companyId}
              onChange={(event) => setForm({ ...form, companyId: event.target.value })}
              className={inputClass}
            >
              <option value="">Aucune</option>
              {(props.companies || []).map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
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
                    {props.companies?.find((company) => company.id === selectedContact.companyId)?.name || "Entreprise"}
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
                  <Mail className="h-5 w-5 text-black/60" />
                  <span>{selectedContact.email || "-"}</span>
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

            {isEditing ? (
              <form
                className="space-y-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  props.onUpdateContact(selectedContact.id, {
                    firstName: form.firstName,
                    lastName: form.lastName,
                    phone: form.phone,
                    email: form.email,
                    wilaya: form.wilaya,
                    type: form.type,
                    companyId: form.companyId || undefined,
                  });
                  setIsEditing(false);
                  setIsDrawerOpen(false);
                }}
              >
                <input
                  value={form.firstName}
                  onChange={(event) => setForm({ ...form, firstName: event.target.value })}
                  placeholder="Prenom"
                  className={inputClass}
                />
                <input
                  value={form.lastName}
                  onChange={(event) => setForm({ ...form, lastName: event.target.value })}
                  placeholder="Nom"
                  className={inputClass}
                />
                <input
                  value={form.phone}
                  onChange={(event) => setForm({ ...form, phone: event.target.value })}
                  placeholder="Telephone"
                  className={inputClass}
                />
                <input
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  placeholder="Email"
                  className={inputClass}
                />
                <select
                  value={form.wilaya}
                  onChange={(event) => setForm({ ...form, wilaya: event.target.value })}
                  className={inputClass}
                >
                  {ALGERIA_WILAYAS.map((wilaya) => (
                    <option key={wilaya.code} value={wilaya.name}>
                      {wilaya.name}
                    </option>
                  ))}
                </select>
                <select
                  value={form.type}
                  onChange={(event) => setForm({ ...form, type: event.target.value as Contact["type"] })}
                  className={inputClass}
                >
                  <option value="particulier">Particulier</option>
                  <option value="professionnel">Professionnel</option>
                </select>
                <select
                  value={form.companyId}
                  onChange={(event) => setForm({ ...form, companyId: event.target.value })}
                  className={inputClass}
                >
                  <option value="">Aucune entreprise</option>
                  {(props.companies || []).map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
                <div className="flex gap-3">
                  <CrmButton type="button" variant="ghost" className="flex-1" onClick={() => setIsEditing(false)}>
                    Annuler
                  </CrmButton>
                  <CrmButton type="submit" className="flex-1">
                    Enregistrer
                  </CrmButton>
                </div>
              </form>
            ) : (
              <div className="flex gap-3">
                <CrmButton
                  variant="ghost"
                  className="flex-1"
                  disabled={!props.canEdit}
                  onClick={() => {
                    setForm({
                      firstName: selectedContact.firstName,
                      lastName: selectedContact.lastName,
                      phone: selectedContact.phone,
                      email: selectedContact.email || "",
                      wilaya: selectedContact.wilaya,
                      type: selectedContact.type,
                      companyId: selectedContact.companyId || "",
                    });
                    setIsEditing(true);
                  }}
                >
                  Modifier
                </CrmButton>
                <CrmButton
                  variant="danger"
                  className="flex-1"
                  disabled={!props.canEdit}
                  onClick={() => {
                    props.onDeleteContact(selectedContact.id);
                    setIsDrawerOpen(false);
                  }}
                >
                  Supprimer
                </CrmButton>
              </div>
            )}
          </div>
        </CrmSideDrawer>
      )}
    </div>
  );
}
