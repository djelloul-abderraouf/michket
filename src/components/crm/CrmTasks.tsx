import { useState } from "react";
import type { CrmTask, CrmUser } from "@/lib/crm/types";
import { User, Calendar, Check, Square } from "lucide-react";
import { priorityTones } from "@/lib/crm/option-colors";
import { ColorChip, CrmColorSelect, PersonChip } from "./CrmColorSelect";
import { CrmPanel, CrmCard, CrmButton, formatDate, CrmAddButton, CrmPopup, CrmSideDrawer } from "./CrmUi";

const priorityLabels: Record<CrmTask["priority"], string> = {
  basse: "Basse",
  normale: "Normale",
  haute: "Haute",
  urgente: "Urgente",
};

export function CrmTasks({
  tasks,
  user,
  onAdd,
  onToggle,
  onUpdate,
  onDelete,
}: {
  tasks: CrmTask[];
  user: CrmUser;
  onAdd: (data: { title: string; priority: CrmTask["priority"]; dueAt: string }) => void;
  onToggle?: (task: CrmTask) => void;
  onUpdate?: (id: string, data: Partial<CrmTask>) => void;
  onDelete?: (id: string) => void;
}) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskPriority, setTaskPriority] = useState<CrmTask["priority"]>("normale");
  const [taskDueAt, setTaskDueAt] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<CrmTask | undefined>();
  const [isEditing, setIsEditing] = useState(false);
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
                      <ColorChip label={priorityLabels[task.priority]} tone={priorityTones[task.priority]} />
                      {task.done && (
                        <ColorChip label="Terminée" tone={{ dot: "bg-emerald-500", chip: "bg-emerald-100 text-emerald-800" }} />
                      )}
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-black/70">
                        <User className="h-4 w-4" />
                        <PersonChip name={task.assigneeName} />
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
                      onToggle?.(task);
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
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!taskTitle) return;
            onAdd({
              title: taskTitle,
              priority: taskPriority,
              dueAt: taskDueAt || new Date().toISOString(),
            });
            setTaskTitle("");
            setTaskPriority("normale");
            setTaskDueAt("");
            setIsPopupOpen(false);
          }}
        >
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              Titre
            </label>
            <input
              value={taskTitle}
              onChange={(event) => setTaskTitle(event.target.value)}
              placeholder="Titre de la tâche"
              className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold focus:ring-1 focus:ring-michket-gold"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              Priorité
            </label>
            <CrmColorSelect
              ariaLabel="Priorité"
              value={taskPriority}
              onChange={(value) => setTaskPriority(value as CrmTask["priority"])}
              options={[
                { value: "basse", label: "Basse", tone: priorityTones.basse },
                { value: "normale", label: "Normale", tone: priorityTones.normale },
                { value: "haute", label: "Haute", tone: priorityTones.haute },
                { value: "urgente", label: "Urgente", tone: priorityTones.urgente },
              ]}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              Date d'échéance
            </label>
            <input
              type="date"
              value={taskDueAt}
              onChange={(event) => setTaskDueAt(event.target.value)}
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
                  <ColorChip label={priorityLabels[selectedTask.priority]} tone={priorityTones[selectedTask.priority]} />
                  {selectedTask.done && (
                    <ColorChip label="Terminée" tone={{ dot: "bg-emerald-500", chip: "bg-emerald-100 text-emerald-800" }} />
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
                  <PersonChip name={selectedTask.assigneeName} />
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
              <CrmButton variant="success" className="flex-1" onClick={() => onToggle?.(selectedTask)}>
                {selectedTask.done ? "Rouvrir" : "Marquer terminée"}
              </CrmButton>
              <CrmButton
                variant="ghost"
                className="flex-1"
                onClick={() => {
                  setTaskTitle(selectedTask.title);
                  setTaskPriority(selectedTask.priority);
                  setTaskDueAt(selectedTask.dueAt.slice(0, 10));
                  setIsEditing(true);
                }}
              >
                Modifier
              </CrmButton>
            </div>
            {isEditing && (
              <form
                className="space-y-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  onUpdate?.(selectedTask.id, {
                    title: taskTitle,
                    priority: taskPriority,
                    dueAt: taskDueAt,
                  });
                  setIsEditing(false);
                  setIsDrawerOpen(false);
                }}
              >
                <input
                  value={taskTitle}
                  onChange={(event) => setTaskTitle(event.target.value)}
                  className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold focus:ring-1 focus:ring-michket-gold"
                />
                <CrmColorSelect
                  ariaLabel="Priorité"
                  value={taskPriority}
                  onChange={(value) => setTaskPriority(value as CrmTask["priority"])}
                  options={[
                    { value: "basse", label: "Basse", tone: priorityTones.basse },
                    { value: "normale", label: "Normale", tone: priorityTones.normale },
                    { value: "haute", label: "Haute", tone: priorityTones.haute },
                    { value: "urgente", label: "Urgente", tone: priorityTones.urgente },
                  ]}
                />
                <input
                  type="date"
                  value={taskDueAt}
                  onChange={(event) => setTaskDueAt(event.target.value)}
                  className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold focus:ring-1 focus:ring-michket-gold"
                />
                <CrmButton type="submit" className="w-full">
                  Enregistrer
                </CrmButton>
              </form>
            )}
            <CrmButton
              variant="danger"
              className="w-full"
              onClick={() => {
                onDelete?.(selectedTask.id);
                setIsDrawerOpen(false);
              }}
            >
              Supprimer
            </CrmButton>
          </div>
        </CrmSideDrawer>
      )}
    </div>
  );
}
