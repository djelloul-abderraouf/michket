"use client";

import type { ManufacturingOrder, StockItem, StockItemType, StockMovement, StockRecipe } from "@/lib/api-client";
import { ColorChip } from "./CrmColorSelect";
import { CrmPanel, Metric, formatDate } from "./CrmUi";
import type { OptionTone } from "@/lib/crm/option-colors";

const typeLabels: Record<StockItemType, string> = {
  matiere: "Matière",
  composant: "Composant",
  semi_fini: "Semi-fini",
  produit_fini: "Produit fini",
};

const statusTone: Record<StockItem["stockStatus"], OptionTone> = {
  ok: { dot: "bg-emerald-500", chip: "bg-emerald-100 text-emerald-800" },
  low: { dot: "bg-amber-500", chip: "bg-amber-100 text-amber-900" },
  out: { dot: "bg-rose-500", chip: "bg-rose-100 text-rose-800" },
};

const movementLabels: Record<StockMovement["movementType"], string> = {
  restock: "Réapprovisionnement",
  manufacturing_consumption: "Consommation",
  manufacturing_production: "Production",
  sale: "Vente",
  adjustment: "Ajustement",
  return: "Retour",
  loss: "Perte",
  reversal: "Annulation",
};

function formatQty(value: number) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 3 }).format(value);
}

export function CrmStockDashboard({
  items,
  movements,
  manufacturingRecipes,
  salesRecipes,
  jobs,
}: {
  items: StockItem[];
  movements: StockMovement[];
  manufacturingRecipes: StockRecipe[];
  salesRecipes: StockRecipe[];
  jobs: ManufacturingOrder[];
}) {
  const active = items.filter((item) => item.active);
  const low = active.filter((item) => item.stockStatus === "low");
  const out = active.filter((item) => item.stockStatus === "out");
  const ok = active.filter((item) => item.stockStatus === "ok");
  const alerts = [...out, ...low];
  const completed = jobs.filter((job) => job.status === "completed").length;
  const cancelled = jobs.filter((job) => job.status === "cancelled").length;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Articles actifs" value={String(active.length)} accent="bg-black" />
        <Metric label="OK" value={String(ok.length)} accent="bg-emerald-500" />
        <Metric label="Stock bas" value={String(low.length)} accent="bg-amber-500" />
        <Metric label="Rupture" value={String(out.length)} accent="bg-rose-500" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Recettes fabrication" value={String(manufacturingRecipes.length)} accent="bg-cyan-500" />
        <Metric label="Recettes vente" value={String(salesRecipes.length)} accent="bg-indigo-500" />
        <Metric label="Fabrications terminées" value={String(completed)} accent="bg-emerald-600" />
        <Metric label="Fabrications annulées" value={String(cancelled)} accent="bg-zinc-500" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <CrmPanel title="Par type">
          <div className="space-y-3">
            {(Object.keys(typeLabels) as StockItemType[]).map((type) => {
              const count = active.filter((item) => item.itemType === type).length;
              const width = active.length ? Math.max(4, (count / active.length) * 100) : 0;
              return (
                <div key={type} className="grid grid-cols-[140px_1fr_32px] items-center gap-3 text-sm">
                  <span className="font-semibold text-black/70">{typeLabels[type]}</span>
                  <div className="h-2 overflow-hidden rounded-full bg-black/10">
                    <div className="h-full rounded-full bg-black" style={{ width: `${width}%` }} />
                  </div>
                  <span className="text-right font-semibold">{count}</span>
                </div>
              );
            })}
          </div>
        </CrmPanel>
        <CrmPanel title="À surveiller">
          {alerts.length === 0 ? (
            <p className="text-sm text-black/45">Aucun article sous le minimum.</p>
          ) : (
            <ul className="space-y-2">
              {alerts.slice(0, 8).map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-2 text-sm">
                  <span>
                    <span className="font-semibold">{item.name}</span>
                    <span className="ml-2 text-black/45">{formatQty(item.currentQuantity)} {item.unit}</span>
                  </span>
                  <ColorChip
                    label={item.stockStatus === "out" ? "Rupture" : "Stock bas"}
                    tone={statusTone[item.stockStatus]}
                  />
                </li>
              ))}
            </ul>
          )}
        </CrmPanel>
      </div>

      <CrmPanel title="Derniers mouvements">
        {movements.length === 0 ? (
          <p className="text-sm text-black/45">Aucun mouvement.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 text-left text-[10px] font-semibold uppercase tracking-wider text-black/45">
                  <th className="px-2 py-2">Date</th>
                  <th className="px-2 py-2">Article</th>
                  <th className="px-2 py-2">Mouvement</th>
                  <th className="px-2 py-2">Impact</th>
                  <th className="px-2 py-2">Source</th>
                </tr>
              </thead>
              <tbody>
                {movements.slice(0, 8).map((movement) => (
                  <tr key={movement.id} className="border-b border-black/5">
                    <td className="px-2 py-2 text-xs text-black/55">{formatDate(movement.occurredAt)}</td>
                    <td className="px-2 py-2 font-medium">{movement.itemName}</td>
                    <td className="px-2 py-2">{movementLabels[movement.movementType]}</td>
                    <td className={movement.quantityDelta < 0 ? "px-2 py-2 font-semibold text-rose-700" : "px-2 py-2 font-semibold text-emerald-700"}>
                      {movement.quantityDelta > 0 ? "+" : ""}{formatQty(movement.quantityDelta)}
                    </td>
                    <td className="px-2 py-2 text-xs text-black/55">{movement.sourceRef || movement.sourceType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CrmPanel>
    </div>
  );
}
