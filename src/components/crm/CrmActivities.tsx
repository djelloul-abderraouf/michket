import { useState } from "react";
import { Phone, MessageSquare, MapPin } from "lucide-react";
import { demoActivities, demoContacts } from "@/lib/crm/demo-data";
import type { Activity } from "@/lib/crm/types";
import { CrmPanel, CrmCard, CrmBadge, CrmButton, formatDate, CrmAddButton, CrmPopup } from "./CrmUi";

const activityIcons: Record<Activity["type"], React.ComponentType<{ className?: string }>> = {
  appel: Phone,
  message: MessageSquare,
  visite: MapPin,
};

const activityLabels: Record<Activity["type"], string> = {
  appel: "Appel",
  message: "Message",
  visite: "Visite",
};

export function CrmActivities() {
  const [activities, setActivities] = useState<Activity[]>(demoActivities);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [newActivity, setNewActivity] = useState({
    type: "appel" as Activity["type"],
    target: "",
    description: "",
  });

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivity.target || !newActivity.description) return;

    const activity: Activity = {
      id: `act-${Date.now()}`,
      type: newActivity.type,
      target: newActivity.target,
      ownerId: "usr-sales", // In real app, would be current user
      description: newActivity.description,
      createdAt: new Date().toISOString(),
    };

    setActivities([activity, ...activities]);
    setNewActivity({ type: "appel", target: "", description: "" });
    setIsPopupOpen(false);
  };

  const recentActivities = activities.slice().sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const activitiesByType = {
    appel: activities.filter((a) => a.type === "appel").length,
    message: activities.filter((a) => a.type === "message").length,
    visite: activities.filter((a) => a.type === "visite").length,
  };

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-4">
        <CrmPanel className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/50">
            Total activités
          </p>
          <p className="mt-2 text-2xl font-bold text-black">{activities.length}</p>
          <p className="mt-1 text-sm text-black/60">Enregistrées</p>
        </CrmPanel>
        <CrmPanel className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/50">
            Appels
          </p>
          <p className="mt-2 text-2xl font-bold text-blue-600">{activitiesByType.appel}</p>
          <p className="mt-1 text-sm text-black/60">Téléphoniques</p>
        </CrmPanel>
        <CrmPanel className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/50">
            Messages
          </p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">{activitiesByType.message}</p>
          <p className="mt-1 text-sm text-black/60">Écrits</p>
        </CrmPanel>
        <CrmPanel className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/50">
            Visites
          </p>
          <p className="mt-2 text-2xl font-bold text-purple-600">{activitiesByType.visite}</p>
          <p className="mt-1 text-sm text-black/60">Sur place</p>
        </CrmPanel>
      </div>

      {/* Activities List */}
      <CrmPanel
        title="Activités commerciales"
        actions={<CrmAddButton onClick={() => setIsPopupOpen(true)} label="Nouvelle activité" />}
      >

        <div className="space-y-3">
          {recentActivities.map((activity) => {
            const Icon = activityIcons[activity.type];
            return (
              <CrmCard key={activity.id} className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/5">
                    <Icon className="h-6 w-6 text-black/60" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base">{activity.target}</h3>
                          <CrmBadge variant="default">{activityLabels[activity.type]}</CrmBadge>
                        </div>
                        <p className="text-xs text-black/50 mt-1">{formatDate(activity.createdAt)}</p>
                      </div>
                    </div>
                    <p className="text-sm text-black/70 mt-2">{activity.description}</p>
                  </div>
                </div>
              </CrmCard>
            );
          })}
        </div>

        {activities.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-lg font-semibold text-black/40">Aucune activité enregistrée</p>
            <p className="mt-2 text-sm text-black/30">
              Commencez à suivre vos interactions commerciales
            </p>
          </div>
        )}
      </CrmPanel>

      {/* New Activity Popup */}
      <CrmPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        title="Nouvelle activité"
      >
        <form onSubmit={handleAddActivity} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              Type d'activité
            </label>
            <select
              value={newActivity.type}
              onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value as Activity["type"] })}
              className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold focus:ring-1 focus:ring-michket-gold"
            >
              <option value="appel">Appel téléphonique</option>
              <option value="message">Message</option>
              <option value="visite">Visite</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              Contact / Entreprise cible
            </label>
            <input
              value={newActivity.target}
              onChange={(e) => setNewActivity({ ...newActivity, target: e.target.value })}
              placeholder="Nom du contact ou de l'entreprise"
              className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold focus:ring-1 focus:ring-michket-gold"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              Description
            </label>
            <textarea
              value={newActivity.description}
              onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
              placeholder="Détails de l'activité, résultat, suites à donner..."
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
            <CrmButton type="submit" className="flex-1">
              Enregistrer activité
            </CrmButton>
          </div>
        </form>
      </CrmPopup>
    </div>
  );
}