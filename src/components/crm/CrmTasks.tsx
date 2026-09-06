import { useState } from "react";
import type { CrmTask, CrmUser } from "@/lib/crm/types";
import { User, Calendar, Check, Square } from "lucide-react";
import { CrmPanel, CrmCard, CrmBadge, CrmButton, formatDate, CrmAddButton, CrmPopup, CrmSideDrawer } from "./CrmUi";

const priorityConfig: Record<CrmTask["priority"], { variant: any; color: string }> = {
  basse: { variant: "default" as const, color: "bg-gray-400" },
  normale: { variant: "info" as const, color: "bg-blue-500" },
  haute: { variant: "warning" as const, color: "bg-amber-500" },
  urgente: { variant: "danger" as const, color: "bg-rose-600" },
};

export function CrmTasks({
  tasks,
  user,
  onAdd,
}: {
  tasks: CrmTask[];
  user: CrmUser;
  onAdd: () => void;
}) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<CrmTask | undefined>();
  const mine = tasks.filter((task) => task.assigneeId === user.id);
  const visibleTasks = mine.length ? mine : tasks;

  const completedTasks = visibleTasks.filter((task) => task.done);
  const pendingTasks = visibleTasks.filter((task) => !task.done);
  const urgentTasks = visibleTasks.filter((task) => task.priority === "urgente" && !task.done);

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-4">
        <CrmPanel className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/50">
            Mes tâches
          </p>
          <p className="mt-2 text-2xl font-bold text-black">{mine.length}</p>
          <p className="mt-1 text-sm text-black/60">Assignées à moi</p>
        </CrmPanel>
        <CrmPanel className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/50">
            En attente
          </p>
          <p className="mt-2 text-2xl font-bold text-amber-600">{pendingTasks.length}</p>
          <p className="mt-1 text-sm text-black/60">À compléter</p>
        </CrmPanel>
        <CrmPanel className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/50">
            Terminées
          </p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">{completedTasks.length}</p>
          <p className="mt-1 text-sm text-black/60">Accomplies</p>
        </CrmPanel>
        <CrmPanel className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/50">
            Urgentes
          </p>
          <p className="mt-2 text-2xl font-bold text-rose-600">{urgentTasks.length}</p>
          <p className="mt-1 text-sm text-black/60">Priorité haute</p>
        </CrmPanel>
      </div>

      {/* Task List */}
      <CrmPanel
        title="Mes tâches"
        actions={
          <CrmAddButton onClick={() => setIsPopupOpen(true)} label="Nouvelle tâche" />
        }
      >
        {visibleTasks.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-lg font-semibold text-black/40">Aucune tâche assignée</p>
            <p className="mt-2 text-sm text-black/30">
              Créez une nouvelle tâche ou attendez une assignation
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleTasks.map((task) => (
              <CrmCard
                key={task.id}
                onClick={() => {
                  setSelectedTask(task);
                  setIsDrawerOpen(true);
                }}
                className={`p-4 ${task.done ? "opacity-60" : ""} cursor-pointer hover:shadow-md transition`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className={`font-bold text-base ${task.done ? "line-through text-black/50" : ""}`}>
                        {task.title}
                      </h3>
                      <CrmBadge variant={priorityConfig[task.priority].variant}>
                        {task.priority}
                      </CrmBadge>
                      {task.done && (
                        <CrmBadge variant="success">Terminée</CrmBadge>
                      )}
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-black/70">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{task.assigneeName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-black/60">
                        <Calendar className="h-4 w-4" />
                        <span>Échéance {formatDate(task.dueAt)}</span>
                      </div>
                      {task.projectId && (
                        <div className="flex items-center gap-2 text-black/60">
                          <span>📁</span>
                          <span>Projet {task.projectId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle task completion
                    }}
                    className={`p-2 rounded-lg transition ${
                      task.done
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-black/10 text-black/60 hover:bg-black/20"
                    }`}
                  >
                    {task.done ? <Check className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                  </button>
                </div>
              </CrmCard>
            ))}
          </div>
        )}
      </CrmPanel>

      {/* New Task Popup */}
      <CrmPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        title="Nouvelle tâche"
      >
        <form className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              Titre
            </label>
            <input
              placeholder="Titre de la tâche"
              className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold focus:ring-1 focus:ring-michket-gold"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              Priorité
            </label>
            <select className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold focus:ring-1 focus:ring-michket-gold">
              <option value="basse">Basse</option>
              <option value="normale">Normale</option>
              <option value="haute">Haute</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              Date d'échéance
            </label>
            <input
              type="date"
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
              Créer tâche
            </CrmButton>
          </div>
        </form>
      </CrmPopup>

      {/* Task Details Side Drawer */}
      {selectedTask && (
        <CrmSideDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          title={selectedTask.title}
        >
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold tracking-[0]">{selectedTask.title}</h3>
                  <CrmBadge variant={priorityConfig[selectedTask.priority].variant}>
                    {selectedTask.priority}
                  </CrmBadge>
                  {selectedTask.done && (
                    <CrmBadge variant="success">Terminée</CrmBadge>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-black/10 bg-black/[0.02] p-4">
              <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-black/60">
                Détails de la tâche
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-black/60" />
                  <span className="font-medium">{selectedTask.assigneeName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-black/60" />
                  <span>Échéance {formatDate(selectedTask.dueAt)}</span>
                </div>
                {selectedTask.projectId && (
                  <div className="flex items-center gap-3">
                    <span>📁</span>
                    <span>Projet {selectedTask.projectId}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <CrmButton variant="success" className="flex-1">
                Marquer terminée
              </CrmButton>
              <CrmButton variant="ghost" className="flex-1">
                Modifier
              </CrmButton>
            </div>
          </div>
        </CrmSideDrawer>
      )}
    </div>
  );
}
