import { useState } from "react";
import { roleLabels, type CrmUser } from "@/lib/crm/types";
import { CrmPanel, CrmCard, CrmBadge, CrmButton, formatDate, CrmAddButton, CrmPopup, ViewToggle } from "./CrmUi";
import { Mail, Calendar, Shield } from "lucide-react";

export function CrmUsers({
  users,
  canEdit,
  onToggleActive,
  onCreateUser,
  onUpdateUser,
}: {
  users: CrmUser[];
  canEdit: boolean;
  onToggleActive?: (user: CrmUser) => void;
  onCreateUser?: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string;
    role: string;
  }) => void;
  onUpdateUser?: (id: string, data: { role?: string; firstName?: string; lastName?: string; phone?: string }) => void;
}) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isDetailsPopupOpen, setIsDetailsPopupOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<CrmUser | undefined>();
  const [view, setView] = useState<"list" | "grid">("list");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    role: "commercial",
  });
  const [editRole, setEditRole] = useState("commercial");
  const staffRoles = [
    { id: "admin", label: "Admin" },
    { id: "commercial", label: "Commercial" },
    { id: "confirmation", label: "Confirmation" },
    { id: "fabrication", label: "Fabrication" },
    { id: "preparation", label: "Preparation" },
    { id: "livraison", label: "Livraison" },
  ];
  const activeUsers = users.filter((user) => user.active);
  const inactiveUsers = users.filter((user) => !user.active);

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <CrmPanel className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/50">
            Total utilisateurs
          </p>
          <p className="mt-2 text-2xl font-bold text-black">{users.length}</p>
          <p className="mt-1 text-sm text-black/60">Enregistrés</p>
        </CrmPanel>
        <CrmPanel className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/50">
            Actifs
          </p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">{activeUsers.length}</p>
          <p className="mt-1 text-sm text-black/60">Peuvent se connecter</p>
        </CrmPanel>
        <CrmPanel className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/50">
            Inactifs
          </p>
          <p className="mt-2 text-2xl font-bold text-rose-600">{inactiveUsers.length}</p>
          <p className="mt-1 text-sm text-black/60">Désactivés</p>
        </CrmPanel>
      </div>

      {/* Users List */}
      <CrmPanel
        title="Gestion des utilisateurs"
        actions={
          <div className="flex items-center gap-3">
            <ViewToggle view={view} onViewChange={setView} type="grid" />
            <CrmAddButton
              onClick={() => setIsPopupOpen(true)}
              label="Nouvel utilisateur"
              disabled={!canEdit}
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
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Rôles</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Dernière connexion</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => {
                      setSelectedUser(user);
                      setEditRole(user.businessRole || "commercial");
                      setIsDetailsPopupOpen(true);
                    }}
                    className="border-b border-black/5 cursor-pointer transition hover:bg-black/[0.02]"
                  >
                    <td className="px-4 py-3 text-sm font-bold">{user.name}</td>
                    <td className="px-4 py-3 text-sm text-black/70">{user.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <span
                            key={role}
                            className="rounded-md border border-michket-gold/40 bg-michket-gold/15 px-2 py-1 text-[11px] font-bold"
                          >
                            {roleLabels[role]}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <CrmBadge variant={user.active ? ("success" as const) : ("danger" as const)}>
                        {user.active ? "Actif" : "Inactif"}
                      </CrmBadge>
                    </td>
                    <td className="px-4 py-3 text-sm text-black/60">{formatDate(user.lastLoginAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {users.map((user) => (
              <CrmCard 
                key={user.id} 
                className="p-5 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  setSelectedUser(user);
                  setEditRole(user.businessRole || "commercial");
                  setIsDetailsPopupOpen(true);
                }}
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-michket-gold/20 text-lg font-bold text-michket-gold">
                      {user.name[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-base">{user.name}</h3>
                      <p className="text-sm text-black/60">{user.email}</p>
                    </div>
                  </div>
                  <CrmBadge variant={user.active ? ("success" as const) : ("danger" as const)}>
                    {user.active ? "Actif" : "Inactif"}
                  </CrmBadge>
                </div>

                <div className="space-y-2 mb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-black/50 mb-1">
                      Rôles
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {user.roles.map((role) => (
                        <span
                          key={role}
                          className="rounded-md border border-michket-gold/40 bg-michket-gold/15 px-2 py-1 text-[11px] font-bold"
                        >
                          {roleLabels[role]}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-black/60">
                    <span>Dernière connexion {formatDate(user.lastLoginAt)}</span>
                  </div>
                </div>
              </CrmCard>
            ))}
          </div>
        )}
      </CrmPanel>

      {/* New User Popup */}
      <CrmPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        title="Nouvel utilisateur"
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!form.email || !form.password) return;
            onCreateUser?.({
              firstName: form.firstName,
              lastName: form.lastName,
              email: form.email,
              phone: form.phone || undefined,
              password: form.password,
              role: form.role,
            });
            setForm({
              firstName: "",
              lastName: "",
              email: "",
              phone: "",
              password: "",
              role: "commercial",
            });
            setIsPopupOpen(false);
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
                Prenom
              </label>
              <input
                value={form.firstName}
                onChange={(event) => setForm({ ...form, firstName: event.target.value })}
                className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
                Nom
              </label>
              <input
                value={form.lastName}
                onChange={(event) => setForm({ ...form, lastName: event.target.value })}
                className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="email@exemple.com"
              className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              Telephone
            </label>
            <input
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
              className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              Mot de passe
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              minLength={8}
              className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              Role
            </label>
            <select
              value={form.role}
              onChange={(event) => setForm({ ...form, role: event.target.value })}
              className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold"
            >
              {staffRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>
          <p className="text-sm text-black/50">
            Le compte est cree dans Supabase Auth et active dans la table users.
          </p>
          <div className="flex gap-3 pt-2">
            <CrmButton
              type="button"
              variant="ghost"
              onClick={() => setIsPopupOpen(false)}
              className="flex-1"
            >
              Annuler
            </CrmButton>
            <CrmButton type="submit" className="flex-1" disabled={!canEdit}>
              Creer utilisateur
            </CrmButton>
          </div>
        </form>
      </CrmPopup>

      {/* User Details Popup */}
      {selectedUser && (
        <CrmPopup
          isOpen={isDetailsPopupOpen}
          onClose={() => setIsDetailsPopupOpen(false)}
          title={`Détails: ${selectedUser.name}`}
          size="large"
        >
          <div className="space-y-6">
            {/* User Info */}
            <div className="flex items-start gap-4 pb-4 border-b border-black/10">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-michket-gold/20 text-2xl font-bold text-michket-gold">
                {selectedUser.name[0]}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-black">{selectedUser.name}</h3>
                <div className="flex items-center gap-2 mt-1 text-sm text-black/60">
                  <Mail className="h-4 w-4" />
                  {selectedUser.email}
                </div>
                <div className="mt-2">
                  <CrmBadge variant={selectedUser.active ? ("success" as const) : ("danger" as const)}>
                    {selectedUser.active ? "Actif" : "Inactif"}
                  </CrmBadge>
                </div>
              </div>
            </div>

            {/* Activity */}
            <div>
              <h4 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-black/60">
                <Calendar className="h-4 w-4" />
                Activite
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-black/5">
                  <span className="text-black/60">Derniere connexion</span>
                  <span className="font-medium">{formatDate(selectedUser.lastLoginAt)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-black/5">
                  <span className="text-black/60">Statut</span>
                  <span className="font-medium">{selectedUser.active ? "Actif" : "Inactif"}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-black/60">
                <Shield className="h-4 w-4" />
                Role
              </h4>
              <select
                value={editRole}
                onChange={(event) => setEditRole(event.target.value)}
                disabled={!canEdit}
                className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold"
              >
                {staffRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.label}
                  </option>
                ))}
              </select>
              <CrmButton
                size="sm"
                className="mt-3 w-full"
                disabled={!canEdit}
                onClick={() => {
                  onUpdateUser?.(selectedUser.id, { role: editRole });
                  setIsDetailsPopupOpen(false);
                }}
              >
                Enregistrer le role
              </CrmButton>
            </div>

            {/* Actions */}
            <div>
              <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-black/60">
                Actions disponibles
              </h4>
              <div className="grid grid-cols-1 gap-2">
                <CrmButton 
                  variant={selectedUser.active ? "danger" : "success"} 
                  size="sm" 
                  className="w-full justify-start"
                  disabled={!canEdit}
                  onClick={() => onToggleActive?.(selectedUser)}
                >
                  {selectedUser.active ? "Désactiver" : "Activer"}
                </CrmButton>
              </div>
            </div>
          </div>
        </CrmPopup>
      )}
    </div>
  );
}