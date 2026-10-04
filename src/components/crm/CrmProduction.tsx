"use client";

import { useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { crmPlanchesApi } from "@/lib/api-client";
import {
  plancheStatusLabels,
  plancheStatuses,
  type CrmRole,
  type Order,
  type OrderStatus,
  type Planche,
  type PlancheEvent,
  type PlancheStatus,
} from "@/lib/crm/types";
import { neutralTone, plancheEventTones, plancheStatusTones } from "@/lib/crm/option-colors";
import { orderMatchesQuery } from "@/lib/crm/order-search";
import { ColorChip, CrmColorSelect, PersonChip } from "./CrmColorSelect";
import { CrmOrderDetailsDrawer } from "./CrmOrderDetailsDrawer";
import {
  CrmAddButton,
  CrmButton,
  CrmCard,
  CrmPanel,
  CrmPopup,
  CrmSideDrawer,
  OrderSearchField,
  ViewToggle,
  formatDate,
  orderRef,
  productSummary,
} from "./CrmUi";

const plancheEventLabels: Record<PlancheEvent["action"], string> = {
  created: "Création",
  status: "Statut",
  orders_added: "Commandes ajoutées",
  orders_removed: "Commande retirée",
  capacity: "Capacité",
};

export function CrmProduction({
  orders,
  canEdit,
  onLoadOrder,
  onToast,
  onCreateParcel,
  onSyncParcel,
  userRoles,
  currentUserId,
  onOrderUpdated,
  onMove,
  onOrdersRefresh,
}: {
  orders: Order[];
  canEdit: boolean;
  onLoadOrder?: (id: string) => void;
  onToast?: (message: string) => void;
  onCreateParcel?: (order: Order) => void;
  onSyncParcel?: (order: Order) => void;
  userRoles?: CrmRole[];
  currentUserId?: string;
  onOrderUpdated?: (order: Order) => void;
  onMove?: (order: Order, to: OrderStatus, note?: string) => void;
  onOrdersRefresh?: () => void;
}) {
  const [planches, setPlanches] = useState<Planche[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"list" | "grid">("list");
  const [statusFilter, setStatusFilter] = useState<PlancheStatus | "all">("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [capacity, setCapacity] = useState("10");
  const [capacityDraft, setCapacityDraft] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [openPlancheId, setOpenPlancheId] = useState<string | undefined>();
  const [pickerQuery, setPickerQuery] = useState("");
  const [pickedIds, setPickedIds] = useState<string[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>();

  const openPlanche = planches.find((planche) => planche.id === openPlancheId);
  const selectedOrder = orders.find((order) => order.id === selectedOrderId);
  const assignedIds = useMemo(
    () => new Set(planches.flatMap((planche) => planche.orders.map((order) => order.orderId))),
    [planches],
  );

  const availableOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.status === "confirme" &&
          !assignedIds.has(order.id) &&
          orderMatchesQuery(order, pickerQuery),
      ),
    [assignedIds, orders, pickerQuery],
  );

  const visiblePlanches = useMemo(
    () =>
      planches.filter((planche) => {
        if (statusFilter !== "all" && planche.status !== statusFilter) {
          return false;
        }
        const needle = query.trim().toLowerCase();
        if (!needle) {
          return true;
        }
        const haystack = [
          planche.reference,
          planche.createdByName,
          ...planche.orders.flatMap((order) => [order.reference, order.clientName, order.phone, order.productSummary]),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(needle);
      }),
    [planches, query, statusFilter],
  );

  const counts = {
    en_attente: planches.filter((planche) => planche.status === "en_attente").length,
    lancee: planches.filter((planche) => planche.status === "lancee").length,
    terminee: planches.filter((planche) => planche.status === "terminee").length,
  };

  useEffect(() => {
    let active = true;
    crmPlanchesApi
      .getAll()
      .then((rows) => {
        if (active) {
          setPlanches(rows || []);
          onOrdersRefresh?.();
        }
      })
      .catch((error) => {
        onToast?.(error instanceof Error ? error.message : "Impossible de charger les planches");
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [onToast]);

  function replacePlanche(next: Planche) {
    setPlanches((current) => {
      const exists = current.some((planche) => planche.id === next.id);
      return exists
        ? current.map((planche) => (planche.id === next.id ? next : planche))
        : [next, ...current];
    });
  }

  async function run(action: string, task: () => Promise<Planche>, success: string, refreshOrders = false) {
    try {
      setBusy(action);
      const next = await task();
      replacePlanche(next);
      onToast?.(success);
      if (refreshOrders) {
        onOrdersRefresh?.();
      }
      return next;
    } catch (error) {
      onToast?.(error instanceof Error ? error.message : "Action impossible");
      return null;
    } finally {
      setBusy(null);
    }
  }

  const remaining = openPlanche ? openPlanche.capacity - openPlanche.orders.length : 0;

  function togglePick(orderId: string) {
    setPickedIds((current) => {
      if (current.includes(orderId)) {
        return current.filter((id) => id !== orderId);
      }
      if (current.length >= remaining) {
        onToast?.(`Il reste ${remaining} place${remaining > 1 ? "s" : ""} sur cette planche.`);
        return current;
      }
      return [...current, orderId];
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {plancheStatuses.map((status) => (
          <CrmPanel key={status} className="!p-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-white ${plancheStatusTones[status].dot}`}>
                {counts[status]}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-black/50">
                  {plancheStatusLabels[status]}
                </p>
                <p className="text-sm font-bold text-black">
                  {status === "en_attente" && "À remplir"}
                  {status === "lancee" && "En fabrication"}
                  {status === "terminee" && "Prêtes pour préparation"}
                </p>
              </div>
            </div>
          </CrmPanel>
        ))}
      </div>

      <CrmPanel className="!p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_240px]">
          <OrderSearchField
            value={query}
            onChange={setQuery}
            placeholder="Rechercher une planche, un client, une commande..."
          />
          <CrmColorSelect
            ariaLabel="Filtrer par statut de planche"
            value={statusFilter}
            onChange={(value) => setStatusFilter(value as PlancheStatus | "all")}
            options={[
              { value: "all", label: "Toutes les planches", tone: neutralTone },
              ...plancheStatuses.map((status) => ({
                value: status,
                label: plancheStatusLabels[status],
                tone: plancheStatusTones[status],
              })),
            ]}
          />
        </div>
      </CrmPanel>

      <CrmPanel
        title={`Planches (${visiblePlanches.length})`}
        actions={
          <div className="flex items-center gap-2">
            <ViewToggle view={view} onViewChange={setView} type="grid" />
            <CrmAddButton
              onClick={() => setIsCreateOpen(true)}
              label="Nouvelle planche"
              disabled={!canEdit}
            />
          </div>
        }
      >
        <p className="mb-4 text-xs text-black/55">
          Seules les commandes confirmées entrent sur une planche. Dès qu&apos;une commande est ajoutée, elle passe en fabrication. Quand la planche est terminée, ses commandes partent en préparation.
        </p>
        {loading ? (
          <p className="py-8 text-center text-sm text-black/40">Chargement des planches...</p>
        ) : visiblePlanches.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-lg font-semibold text-black/40">Aucune planche</p>
            <p className="mt-2 text-sm text-black/30">Créez une planche, puis ajoutez les commandes confirmées.</p>
          </div>
        ) : view === "list" ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-black/10 text-left text-[10px] font-semibold uppercase tracking-wider text-black/45">
                  <th className="px-2 py-2">Planche</th>
                  <th className="px-2 py-2">Statut</th>
                  <th className="px-2 py-2">Places</th>
                  <th className="px-2 py-2">Commandes</th>
                  <th className="px-2 py-2">Créée par</th>
                  <th className="px-2 py-2">Dernier suivi</th>
                  <th className="px-2 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {visiblePlanches.map((planche) => {
                  const latest = planche.events?.[0];
                  return (
                    <tr
                      key={planche.id}
                      onClick={() => {
                        setOpenPlancheId(planche.id);
                        setPickedIds([]);
                        setPickerQuery("");
                        setCapacityDraft(String(planche.capacity));
                      }}
                      className="cursor-pointer border-b border-black/5 hover:bg-black/[0.02]"
                    >
                      <td className="px-2 py-2 text-xs font-semibold">{planche.reference}</td>
                      <td className="px-2 py-2">
                        <ColorChip label={plancheStatusLabels[planche.status]} tone={plancheStatusTones[planche.status]} />
                      </td>
                      <td className="px-2 py-2 text-xs text-black/70">
                        {planche.orders.length} / {planche.capacity}
                      </td>
                      <td className="px-2 py-2 text-[11px] text-black/60">
                        <p className="line-clamp-2 max-w-[240px]">
                          {planche.orders.length
                            ? planche.orders.map((order) => order.reference).join(", ")
                            : "Aucune"}
                        </p>
                      </td>
                      <td className="px-2 py-2">
                        {planche.createdByName ? <PersonChip name={planche.createdByName} /> : <span className="text-[11px] text-black/40">—</span>}
                      </td>
                      <td className="px-2 py-2">
                        {latest ? (
                          <div className="flex flex-wrap items-center gap-1">
                            <ColorChip
                              label={plancheEventLabels[latest.action] ?? latest.action}
                              tone={plancheEventTones[latest.action] ?? neutralTone}
                            />
                            <PersonChip name={latest.actorName} />
                          </div>
                        ) : (
                          <span className="text-[11px] text-black/40">—</span>
                        )}
                      </td>
                      <td className="px-2 py-2 text-[11px] text-black/50 whitespace-nowrap">{formatDate(planche.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visiblePlanches.map((planche) => {
              const filled = planche.orders.length;
              const ratio = Math.min(100, Math.round((filled / planche.capacity) * 100));
              return (
                <CrmCard
                  key={planche.id}
                  onClick={() => {
                    setOpenPlancheId(planche.id);
                    setPickedIds([]);
                    setPickerQuery("");
                    setCapacityDraft(String(planche.capacity));
                  }}
                  className="cursor-pointer p-5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold">{planche.reference}</h3>
                      <p className="mt-1 text-xs text-black/45">{formatDate(planche.createdAt)}</p>
                    </div>
                    <ColorChip label={plancheStatusLabels[planche.status]} tone={plancheStatusTones[planche.status]} />
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="rounded-full bg-black/5 px-2.5 py-1 text-xs font-semibold text-black/70">
                      Capacité {planche.capacity}
                    </span>
                    <span className="font-semibold">{filled} / {planche.capacity}</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/10">
                    <div className={`h-full ${plancheStatusTones[planche.status].dot}`} style={{ width: `${ratio}%` }} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {planche.createdByName ? <PersonChip name={planche.createdByName} /> : null}
                    {planche.events?.[0] && planche.events[0].action !== "created" ? (
                      <>
                        <ColorChip
                          label={plancheEventLabels[planche.events[0].action]}
                          tone={plancheEventTones[planche.events[0].action]}
                        />
                        <PersonChip name={planche.events[0].actorName} />
                      </>
                    ) : null}
                  </div>
                </CrmCard>
              );
            })}
          </div>
        )}
      </CrmPanel>

      <CrmPopup
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Nouvelle planche"
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const nextCapacity = Number(capacity);
            if (!Number.isInteger(nextCapacity) || nextCapacity < 1 || nextCapacity > 100) {
              onToast?.("Choisissez une capacité entre 1 et 100.");
              return;
            }
            void run("create", () => crmPlanchesApi.create(nextCapacity), "Planche créée.").then((created) => {
              if (created) {
                setIsCreateOpen(false);
                setOpenPlancheId(created.id);
                setCapacityDraft(String(created.capacity));
                setPickedIds([]);
              }
            });
          }}
        >
          <p className="text-sm text-black/60">
            Indiquez combien de commandes cette planche peut recevoir. Vous pourrez encore ajuster ce nombre tant qu&apos;elle est en attente.
          </p>
          <label className="block text-xs font-semibold uppercase tracking-wider text-black/50">
            Capacité
          </label>
          <input
            type="number"
            min={1}
            max={100}
            value={capacity}
            onChange={(event) => setCapacity(event.target.value)}
            className="h-11 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold"
          />
          <div className="flex gap-3">
            <CrmButton type="button" variant="ghost" className="flex-1" onClick={() => setIsCreateOpen(false)}>
              Annuler
            </CrmButton>
            <CrmButton type="submit" className="flex-1" disabled={busy === "create" || !canEdit}>
              Créer la planche
            </CrmButton>
          </div>
        </form>
      </CrmPopup>

      <CrmSideDrawer
        isOpen={Boolean(openPlanche)}
        onClose={() => setOpenPlancheId(undefined)}
        title={openPlanche ? `Planche ${openPlanche.reference}` : "Planche"}
        width="min(720px, 100vw)"
      >
        {openPlanche ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-black/10 bg-stone-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-black/45">Taille</p>
                  <p className="mt-1 text-lg font-bold">
                    {openPlanche.orders.length} / {openPlanche.capacity} commandes
                  </p>
                </div>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-black/70">
                  Capacité {openPlanche.capacity}
                </span>
              </div>
              {openPlanche.createdByName ? (
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-black/60">
                  <span>Créée par</span>
                  <PersonChip name={openPlanche.createdByName} />
                  <span>· {formatDate(openPlanche.createdAt)}</span>
                </div>
              ) : null}
            </div>

            <section className="space-y-3 rounded-xl border border-black/10 p-4">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.14em] text-black/50">Statut</h4>
              <CrmColorSelect
                ariaLabel="Statut de la planche"
                disabled={!canEdit || busy === "status"}
                value={openPlanche.status}
                onChange={(value) => {
                  const next = value as PlancheStatus;
                  if (next === openPlanche.status || next === "en_attente") {
                    return;
                  }
                  void run(
                    "status",
                    () => crmPlanchesApi.updateStatus(openPlanche.id, next),
                    next === "lancee" ? "Planche lancée." : "Planche terminée. Les commandes sont en préparation.",
                    true,
                  );
                }}
                options={plancheStatuses.map((status) => ({
                  value: status,
                  label: plancheStatusLabels[status],
                  tone: plancheStatusTones[status],
                  disabled:
                    (status === "en_attente" && openPlanche.status !== "en_attente") ||
                    (status === "lancee" && openPlanche.status === "terminee") ||
                    (status === "terminee" && openPlanche.status === "en_attente"),
                }))}
              />
              <p className="text-xs text-black/55">
                {openPlanche.status === "en_attente" && "Les commandes ajoutées passent en fabrication. Lancez la planche quand l'atelier commence."}
                {openPlanche.status === "lancee" && "Les commandes de cette planche sont en fabrication."}
                {openPlanche.status === "terminee" && "Les commandes sont envoyées en préparation."}
              </p>
            </section>

            {openPlanche.status === "en_attente" && canEdit ? (
              <section className="space-y-3 rounded-xl border border-black/10 p-4">
                <h4 className="text-[11px] font-bold uppercase tracking-[0.14em] text-black/50">
                  Capacité
                </h4>
                <p className="text-sm text-black/55">
                  Ajustez le nombre de places. Il doit rester au moins égal aux commandes déjà posées.
                </p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={openPlanche.orders.length || 1}
                    max={100}
                    value={capacityDraft}
                    onChange={(event) => setCapacityDraft(event.target.value)}
                    className="h-11 w-28 rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold"
                  />
                  <CrmButton
                    type="button"
                    disabled={busy === "capacity"}
                    onClick={() => {
                      const nextCapacity = Number(capacityDraft);
                      if (!Number.isInteger(nextCapacity) || nextCapacity < 1 || nextCapacity > 100) {
                        onToast?.("Choisissez une capacité entre 1 et 100.");
                        return;
                      }
                      if (nextCapacity < openPlanche.orders.length) {
                        onToast?.(`La planche contient déjà ${openPlanche.orders.length} commandes.`);
                        return;
                      }
                      void run(
                        "capacity",
                        () => crmPlanchesApi.updateCapacity(openPlanche.id, nextCapacity),
                        "Capacité mise à jour.",
                      );
                    }}
                  >
                    Enregistrer
                  </CrmButton>
                </div>
              </section>
            ) : null}

            <section className="space-y-3 rounded-xl border border-black/10 p-4">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.14em] text-black/50">Suivi</h4>
              <div className="space-y-3">
                {(openPlanche.events ?? []).map((event) => (
                  <div key={event.id} className="rounded-lg border border-black/10 bg-stone-50 p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <ColorChip
                        label={plancheEventLabels[event.action] ?? event.action}
                        tone={plancheEventTones[event.action] ?? neutralTone}
                      />
                      <PersonChip name={event.actorName} />
                      {event.fromStatus ? (
                        <ColorChip
                          label={plancheStatusLabels[event.fromStatus]}
                          tone={plancheStatusTones[event.fromStatus]}
                        />
                      ) : null}
                      {event.fromStatus && event.toStatus ? (
                        <span className="text-xs text-black/40">→</span>
                      ) : null}
                      {event.toStatus && (event.action === "status" || event.action === "created") ? (
                        <ColorChip
                          label={plancheStatusLabels[event.toStatus]}
                          tone={plancheStatusTones[event.toStatus]}
                        />
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm text-black/60">
                      {event.note ? `${event.note} · ` : ""}
                      {formatDate(event.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-3 rounded-xl border border-black/10 p-4">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.14em] text-black/50">
                Commandes sur la planche
              </h4>
              {openPlanche.orders.length === 0 ? (
                <p className="text-sm text-black/40">Aucune commande pour le moment.</p>
              ) : (
                <div className="space-y-2">
                  {openPlanche.orders.map((order) => (
                    <div key={order.orderId} className="flex items-start justify-between gap-3 rounded-lg border border-black/8 bg-stone-50 p-3">
                      <button
                        type="button"
                        className="min-w-0 text-left"
                        onClick={() => {
                          setSelectedOrderId(order.orderId);
                          onLoadOrder?.(order.orderId);
                        }}
                      >
                        <p className="font-bold">{order.reference}</p>
                        <p className="text-sm">{order.clientName}</p>
                        <p className="text-xs text-black/50">
                          {order.phone} · {order.wilaya}
                        </p>
                        <p className="mt-1 text-xs text-black/60">{order.productSummary}</p>
                      </button>
                      {openPlanche.status === "en_attente" && canEdit ? (
                        <button
                          type="button"
                          className="rounded-md p-1 text-rose-700 hover:bg-rose-50"
                          disabled={busy === `remove:${order.orderId}`}
                          onClick={() =>
                            void run(
                              `remove:${order.orderId}`,
                              () => crmPlanchesApi.removeOrder(openPlanche.id, order.orderId),
                              "Commande retirée. Elle revient en confirmé.",
                              true,
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {openPlanche.status === "en_attente" && canEdit ? (
              <section className="space-y-3 rounded-xl border border-black/10 p-4">
                <h4 className="text-[11px] font-bold uppercase tracking-[0.14em] text-black/50">
                  Ajouter des commandes confirmées
                </h4>
                <p className="text-sm text-black/55">
                  {remaining > 0
                    ? `${remaining} place${remaining > 1 ? "s" : ""} restante${remaining > 1 ? "s" : ""}. Les commandes déjà choisies ne sont plus proposées.`
                    : "Cette planche est complète."}
                </p>
                {remaining > 0 ? (
                  <>
                    <OrderSearchField value={pickerQuery} onChange={setPickerQuery} placeholder="Rechercher une commande disponible..." />
                    <div className="max-h-72 space-y-2 overflow-auto">
                      {availableOrders.length === 0 ? (
                        <p className="text-xs text-black/40">Aucune commande confirmée disponible.</p>
                      ) : (
                        availableOrders.map((order) => {
                          const checked = pickedIds.includes(order.id);
                          return (
                            <label
                              key={order.id}
                              className="flex cursor-pointer items-start gap-3 rounded-lg border border-black/10 bg-white p-3"
                            >
                              <input
                                type="checkbox"
                                className="mt-1"
                                checked={checked}
                                onChange={() => togglePick(order.id)}
                              />
                              <span className="min-w-0">
                                <span className="block font-bold">{orderRef(order)}</span>
                                <span className="block text-sm">{order.clientName}</span>
                                <span className="block text-xs text-black/50">
                                  {order.phone} · {order.wilaya}
                                </span>
                                <span className="mt-1 block text-xs text-black/60">{productSummary(order)}</span>
                              </span>
                            </label>
                          );
                        })
                      )}
                    </div>
                    <CrmButton
                      className="w-full"
                      disabled={pickedIds.length === 0 || busy === "add"}
                      onClick={() => {
                        void run(
                          "add",
                          () => crmPlanchesApi.addOrders(openPlanche.id, pickedIds),
                          "Commandes ajoutées. Elles passent en fabrication.",
                          true,
                        ).then((updated) => {
                          if (updated) {
                            setPickedIds([]);
                          }
                        });
                      }}
                    >
                      Ajouter {pickedIds.length > 0 ? `${pickedIds.length} ` : ""}à la planche
                    </CrmButton>
                  </>
                ) : null}
              </section>
            ) : null}
          </div>
        ) : null}
      </CrmSideDrawer>

      <CrmOrderDetailsDrawer
        order={selectedOrder}
        isOpen={Boolean(selectedOrderId)}
        onClose={() => setSelectedOrderId(undefined)}
        onToast={onToast}
        onCreateParcel={onCreateParcel}
        onSyncParcel={onSyncParcel}
        userRoles={userRoles}
        currentUserId={currentUserId}
        onOrderUpdated={onOrderUpdated}
        onMove={onMove}
      />
    </div>
  );
}
