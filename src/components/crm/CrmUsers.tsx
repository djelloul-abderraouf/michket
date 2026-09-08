import { useState } from "react";
import { roleLabels, type CrmUser, type CrmRole } from "@/lib/crm/types";
import { CrmPanel, CrmCard, CrmBadge, CrmButton, formatDate, CrmAddButton, CrmPopup, ViewToggle } from "./CrmUi";
import { Mail, Phone, Calendar, Shield, Key, Trash2, Edit, TrendingUp, CheckCircle, Clock, AlertCircle } from "lucide-react";

export function CrmUsers({
  users,
  canEdit,
}: {
  users: CrmUser[];
  canEdit: boolean;
}) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isDetailsPopupOpen, setIsDetailsPopupOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<CrmUser | undefined>();
  const [view, setView] = useState<"list" | "grid">("list");
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
        <form className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              Nom complet
            </label>
            <input
              placeholder="Nom de l'utilisateur"
              className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold focus:ring-1 focus:ring-michket-gold"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              Email
            </label>
            <input
              type="email"
              placeholder="email@exemple.com"
              className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold focus:ring-1 focus:ring-michket-gold"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              Rôles
            </label>
            <select className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold focus:ring-1 focus:ring-michket-gold">
              <option value="admin">Administrateur</option>
              <option value="commercial">Commercial</option>
              <option value="production">Production</option>
              <option value="livraison">Livraison</option>
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
            <CrmButton type="submit" className="flex-1">
              Créer utilisateur
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

            {/* Performance Stats */}
            <div>
              <h4 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-black/60">
                <TrendingUp className="h-4 w-4" />
                Performance
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-black/10 bg-black/[0.02] p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs text-black/60">Tâches complétées</span>
                  </div>
                  <p className="text-lg font-bold text-black">24</p>
                </div>
                <div className="rounded-lg border border-black/10 bg-black/[0.02] p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <span className="text-xs text-black/60">En cours</span>
                  </div>
                  <p className="text-lg font-bold text-black">8</p>
                </div>
                <div className="rounded-lg border border-black/10 bg-black/[0.02] p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="h-4 w-4 text-rose-600" />
                    <span className="text-xs text-black/60">En retard</span>
                  </div>
                  <p className="text-lg font-bold text-black">2</p>
                </div>
                <div className="rounded-lg border border-black/10 bg-black/[0.02] p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-michket-gold" />
                    <span className="text-xs text-black/60">Taux de réussite</span>
                  </div>
                  <p className="text-lg font-bold text-black">92%</p>
                </div>
              </div>
            </div>

            {/* Roles */}
            <div>
              <h4 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-black/60">
                <Shield className="h-4 w-4" />
                Rôles
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedUser.roles.map((role) => (
                  <span
                    key={role}
                    className="rounded-md border border-michket-gold/40 bg-michket-gold/15 px-3 py-1.5 text-sm font-bold"
                  >
                    {roleLabels[role]}
                  </span>
                ))}
              </div>
            </div>

            {/* Activity */}
            <div>
              <h4 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-black/60">
                <Calendar className="h-4 w-4" />
                Activité
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-black/5">
                  <span className="text-black/60">Dernière connexion</span>
                  <span className="font-medium">{formatDate(selectedUser.lastLoginAt)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-black/5">
                  <span className="text-black/60">Statut</span>
                  <span className="font-medium">{selectedUser.active ? "Actif" : "Inactif"}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div>
              <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-black/60">
                Actions disponibles
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <CrmButton variant="ghost" size="sm" className="w-full justify-start" disabled={!canEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier le profil
                </CrmButton>
                <CrmButton variant="ghost" size="sm" className="w-full justify-start" disabled={!canEdit}>
                  <Shield className="h-4 w-4 mr-2" />
                  Modifier les rôles
                </CrmButton>
                <CrmButton variant="ghost" size="sm" className="w-full justify-start" disabled={!canEdit}>
                  <Key className="h-4 w-4 mr-2" />
                  Réinitialiser le mot de passe
                </CrmButton>
                <CrmButton 
                  variant={selectedUser.active ? "danger" : "success"} 
                  size="sm" 
                  className="w-full justify-start"
                  disabled={!canEdit}
                >
                  {selectedUser.active ? "Désactiver" : "Activer"}
                </CrmButton>
                <CrmButton variant="danger" size="sm" className="w-full justify-start col-span-2" disabled={!canEdit}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer le compte
                </CrmButton>
              </div>
            </div>
          </div>
        </CrmPopup>
      )}
    </div>
  );
}