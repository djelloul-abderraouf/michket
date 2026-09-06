import { useState } from "react";
import { roleLabels, type CrmUser } from "@/lib/crm/types";
import { CrmPanel, CrmCard, CrmBadge, CrmButton, formatDate, CrmAddButton, CrmPopup, ViewToggle } from "./CrmUi";

export function CrmUsers({
  users,
  canEdit,
}: {
  users: CrmUser[];
  canEdit: boolean;
}) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
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
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {users.map((user) => (
            <CrmCard key={user.id} className="p-5">
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
                <CrmBadge variant={user.active ? "success" : "danger"}>
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

              <div className="flex gap-2 pt-4 border-t border-black/10">
                <CrmButton variant="ghost" size="sm">
                  Modifier
                </CrmButton>
                <CrmButton
                  variant="ghost"
                  size="sm"
                  disabled={!canEdit}
                >
                  {user.active ? "Désactiver" : "Activer"}
                </CrmButton>
              </div>
            </CrmCard>
          ))}
        </div>
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
    </div>
  );
}
