"use client";

import { useEffect, useMemo, useState } from "react";
import {
  crmStockApi,
  type ManufacturingOrder,
  type ManufacturingPreview,
  type RecipeKind,
  type StockItem,
  type StockItemType,
  type StockMovement,
  type StockMovementType,
  type StockRecipe,
  type StockStatus,
} from "@/lib/api-client";
import type { Product } from "@/lib/crm/types";
import type { OptionTone } from "@/lib/crm/option-colors";
import { ColorChip, CrmColorSelect } from "./CrmColorSelect";
import { cx, formatDate } from "./CrmUi";

const itemTypeLabels: Record<StockItemType, string> = {
  matiere: "Matière",
  composant: "Composant",
  semi_fini: "Semi-fini",
  produit_fini: "Produit fini",
};

const itemTypeTones: Record<StockItemType, OptionTone> = {
  matiere: { dot: "bg-stone-500", chip: "bg-stone-100 text-stone-800" },
  composant: { dot: "bg-sky-500", chip: "bg-sky-100 text-sky-900" },
  semi_fini: { dot: "bg-amber-500", chip: "bg-amber-100 text-amber-900" },
  produit_fini: { dot: "bg-emerald-600", chip: "bg-emerald-100 text-emerald-800" },
};

const statusLabels: Record<StockStatus, string> = {
  ok: "OK",
  low: "Stock bas",
  out: "Rupture",
};

const statusTones: Record<StockStatus, OptionTone> = {
  ok: { dot: "bg-emerald-500", chip: "bg-emerald-100 text-emerald-800" },
  low: { dot: "bg-amber-500", chip: "bg-amber-100 text-amber-900" },
  out: { dot: "bg-rose-500", chip: "bg-rose-100 text-rose-800" },
};

const movementLabels: Record<StockMovementType, string> = {
  restock: "Réapprovisionnement",
  manufacturing_consumption: "Consommation fabrication",
  manufacturing_production: "Production",
  sale: "Vente",
  adjustment: "Ajustement",
  return: "Retour",
  loss: "Perte",
  reversal: "Annulation",
};

const movementTones: Record<StockMovementType, OptionTone> = {
  restock: { dot: "bg-emerald-500", chip: "bg-emerald-100 text-emerald-800" },
  manufacturing_consumption: { dot: "bg-orange-500", chip: "bg-orange-100 text-orange-900" },
  manufacturing_production: { dot: "bg-cyan-500", chip: "bg-cyan-100 text-cyan-900" },
  sale: { dot: "bg-indigo-500", chip: "bg-indigo-100 text-indigo-800" },
  adjustment: { dot: "bg-violet-500", chip: "bg-violet-100 text-violet-800" },
  return: { dot: "bg-teal-500", chip: "bg-teal-100 text-teal-900" },
  loss: { dot: "bg-rose-500", chip: "bg-rose-100 text-rose-800" },
  reversal: { dot: "bg-zinc-500", chip: "bg-zinc-200 text-zinc-700" },
};

const tabs = [
  { id: "stock", label: "Stock" },
  { id: "movements", label: "Mouvements" },
  { id: "manufacturing-recipes", label: "Recettes fabrication" },
  { id: "manufacturing", label: "Fabrication" },
  { id: "sales-recipes", label: "Recettes vente" },
] as const;

type TabId = (typeof tabs)[number]["id"];

const fieldClass = "h-10 w-full rounded-lg border border-black/15 bg-white px-3 text-sm outline-none focus:border-michket-gold";

function formatQty(value: number) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 3 }).format(value);
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Action impossible.";
}

export function CrmStock({
  products,
  canEdit,
  onToast,
}: {
  products: Product[];
  canEdit: boolean;
  onToast: (message: string) => void;
}) {
  const [tab, setTab] = useState<TabId>("stock");
  const [items, setItems] = useState<StockItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [manufacturingRecipes, setManufacturingRecipes] = useState<StockRecipe[]>([]);
  const [salesRecipes, setSalesRecipes] = useState<StockRecipe[]>([]);
  const [jobs, setJobs] = useState<ManufacturingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<StockItemType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<StockStatus | "all">("all");
  const [movementFilter, setMovementFilter] = useState<StockMovementType | "all">("all");

  async function reload() {
    const [nextItems, nextMovements, nextManufacturing, nextSales, nextJobs] = await Promise.all([
      crmStockApi.listItems(),
      crmStockApi.listMovements(),
      crmStockApi.listRecipes("manufacturing"),
      crmStockApi.listRecipes("sales"),
      crmStockApi.listManufacturing(),
    ]);
    setItems(nextItems);
    setMovements(nextMovements);
    setManufacturingRecipes(nextManufacturing);
    setSalesRecipes(nextSales);
    setJobs(nextJobs);
  }

  useEffect(() => {
    let active = true;
    void reload()
      .catch((error) => {
        if (active) onToast(errorMessage(error));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [onToast]);

  const alerts = items.filter((item) => item.active && item.stockStatus !== "ok");
  const reversedIds = useMemo(
    () => new Set(movements.map((movement) => movement.reversesMovementId).filter(Boolean)),
    [movements],
  );

  const visibleItems = items.filter((item) => {
    const query = search.trim().toLowerCase();
    if (query && !`${item.name} ${item.category}`.toLowerCase().includes(query)) return false;
    if (typeFilter !== "all" && item.itemType !== typeFilter) return false;
    if (statusFilter !== "all" && item.stockStatus !== statusFilter) return false;
    return true;
  });

  const visibleMovements = movements.filter((movement) => {
    const query = search.trim().toLowerCase();
    if (query && !`${movement.itemName} ${movement.sourceRef || ""} ${movement.note || ""}`.toLowerCase().includes(query)) {
      return false;
    }
    return movementFilter === "all" || movement.movementType === movementFilter;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Stock</h1>
          <p className="mt-1 text-sm text-black/55">
            Quantités calculées depuis les mouvements. Les recettes de vente déduisent les composants déjà fabriqués, pas les matières premières une seconde fois.
          </p>
        </div>
        <div className="flex gap-2 text-xs font-semibold">
          <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-900">
            {alerts.filter((item) => item.stockStatus === "low").length} stock bas
          </span>
          <span className="rounded-full bg-rose-100 px-3 py-1 text-rose-800">
            {alerts.filter((item) => item.stockStatus === "out").length} rupture
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 rounded-xl border border-black/10 bg-white p-1">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cx(
              "rounded-lg px-3 py-2 text-sm font-semibold",
              tab === item.id ? "bg-black text-white" : "text-black/60 hover:bg-black/5",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? <p className="text-sm text-black/50">Chargement du stock…</p> : null}

      {!loading && tab === "stock" && (
        <StockPanel
          items={visibleItems}
          products={products}
          canEdit={canEdit}
          search={search}
          setSearch={setSearch}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onSaved={async (message) => {
            await reload();
            onToast(message);
          }}
          onError={(error) => onToast(errorMessage(error))}
        />
      )}

      {!loading && tab === "movements" && (
        <MovementsPanel
          items={items}
          movements={visibleMovements}
          reversedIds={reversedIds}
          canEdit={canEdit}
          search={search}
          setSearch={setSearch}
          movementFilter={movementFilter}
          setMovementFilter={setMovementFilter}
          onSaved={async (message) => {
            await reload();
            onToast(message);
          }}
          onError={(error) => onToast(errorMessage(error))}
        />
      )}

      {!loading && tab === "manufacturing-recipes" && (
        <RecipePanel
          kind="manufacturing"
          title="Recette de fabrication"
          hint="Exemple : Socle Rouge = 1 Carte PCB Rouge + 1 Plexy Socle + 1 Socle Forex Simple + 1 Délophane Socle Rouge."
          items={items}
          recipes={manufacturingRecipes}
          canEdit={canEdit}
          onSaved={async (message) => {
            await reload();
            onToast(message);
          }}
          onError={(error) => onToast(errorMessage(error))}
        />
      )}

      {!loading && tab === "sales-recipes" && (
        <RecipePanel
          kind="sales"
          title="Recette de vente"
          hint="Exemple : Veilleuse Rouge consomme 1 Socle Rouge, 1 Boîte Marron Full, 1 Étiquette Bordeaux et 1 Sac Michket. La confirmation d'une commande déduit ces composants."
          items={items}
          recipes={salesRecipes}
          canEdit={canEdit}
          onSaved={async (message) => {
            await reload();
            onToast(message);
          }}
          onError={(error) => onToast(errorMessage(error))}
        />
      )}

      {!loading && tab === "manufacturing" && (
        <ManufacturingPanel
          items={items}
          recipes={manufacturingRecipes}
          jobs={jobs}
          canEdit={canEdit}
          onSaved={async (message) => {
            await reload();
            onToast(message);
          }}
          onError={(error) => onToast(errorMessage(error))}
        />
      )}
    </div>
  );
}

function StockPanel({
  items,
  products,
  canEdit,
  search,
  setSearch,
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
  onSaved,
  onError,
}: {
  items: StockItem[];
  products: Product[];
  canEdit: boolean;
  search: string;
  setSearch: (value: string) => void;
  typeFilter: StockItemType | "all";
  setTypeFilter: (value: StockItemType | "all") => void;
  statusFilter: StockStatus | "all";
  setStatusFilter: (value: StockStatus | "all") => void;
  onSaved: (message: string) => Promise<void>;
  onError: (error: unknown) => void;
}) {
  const [editing, setEditing] = useState<StockItem | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [itemType, setItemType] = useState<StockItemType>("composant");
  const [unit, setUnit] = useState("pcs");
  const [minQuantity, setMinQuantity] = useState("0");
  const [catalogProductId, setCatalogProductId] = useState("");
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  function startCreate() {
    setEditing(null);
    setName("");
    setCategory("");
    setItemType("composant");
    setUnit("pcs");
    setMinQuantity("0");
    setCatalogProductId("");
    setActive(true);
    setOpen(true);
  }

  function startEdit(item: StockItem) {
    setEditing(item);
    setName(item.name);
    setCategory(item.category);
    setItemType(item.itemType);
    setUnit(item.unit);
    setMinQuantity(String(item.minQuantity));
    setCatalogProductId(item.catalogProductId || "");
    setActive(item.active);
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    try {
      const body = {
        name: name.trim(),
        category: category.trim(),
        itemType,
        unit: unit.trim() || "pcs",
        minQuantity: Number(minQuantity) || 0,
        catalogProductId: catalogProductId || null,
        active,
      };
      if (editing) {
        await crmStockApi.updateItem(editing.id, body);
        await onSaved("Article mis à jour.");
      } else {
        await crmStockApi.createItem(body);
        await onSaved("Article ajouté. La quantité reste à 0 jusqu'au premier mouvement.");
      }
      setOpen(false);
    } catch (error) {
      onError(error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-3">
      <div className="grid gap-2 md:grid-cols-[1fr_180px_180px_auto]">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un article" className={fieldClass} />
        <CrmColorSelect
          ariaLabel="Filtrer par type d'article"
          value={typeFilter}
          onChange={(value) => setTypeFilter(value as StockItemType | "all")}
          options={[
            { value: "all", label: "Tous les types" },
            ...Object.entries(itemTypeLabels).map(([value, label]) => ({
              value,
              label,
              tone: itemTypeTones[value as StockItemType],
            })),
          ]}
        />
        <CrmColorSelect
          ariaLabel="Filtrer par statut de stock"
          value={statusFilter}
          onChange={(value) => setStatusFilter(value as StockStatus | "all")}
          options={[
            { value: "all", label: "Tous les statuts" },
            ...Object.entries(statusLabels).map(([value, label]) => ({
              value,
              label,
              tone: statusTones[value as StockStatus],
            })),
          ]}
        />
        {canEdit ? (
          <button type="button" onClick={startCreate} className="h-10 rounded-lg bg-black px-4 text-sm font-semibold text-white">
            Ajouter un article
          </button>
        ) : <span />}
      </div>

      {open && canEdit && (
        <div className="grid gap-2 rounded-xl border border-black/10 bg-white p-3 md:grid-cols-3">
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nom" className={fieldClass} />
          <input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Catégorie" className={fieldClass} />
          <CrmColorSelect
            ariaLabel="Type d'article"
            value={itemType}
            onChange={(value) => setItemType(value as StockItemType)}
            options={Object.entries(itemTypeLabels).map(([value, label]) => ({
              value,
              label,
              tone: itemTypeTones[value as StockItemType],
            }))}
          />
          <input value={unit} onChange={(event) => setUnit(event.target.value)} placeholder="Unité" className={fieldClass} />
          <input value={minQuantity} onChange={(event) => setMinQuantity(event.target.value)} type="number" min="0" step="0.001" placeholder="Stock minimum" className={fieldClass} />
          <select value={catalogProductId} onChange={(event) => setCatalogProductId(event.target.value)} className={fieldClass}>
            <option value="">Aucun produit catalogue</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>{product.name}</option>
            ))}
          </select>
          {editing ? (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />
              Actif
            </label>
          ) : null}
          <div className="flex gap-2 md:col-span-3">
            <button type="button" disabled={saving || !name.trim()} onClick={() => void save()} className="h-10 rounded-lg bg-black px-4 text-sm font-semibold text-white disabled:opacity-40">
              Enregistrer
            </button>
            <button type="button" onClick={() => setOpen(false)} className="h-10 rounded-lg border border-black/15 px-4 text-sm">
              Fermer
            </button>
          </div>
          <p className="text-xs text-black/45 md:col-span-3">La quantité actuelle n'est pas saisie ici. Elle vient uniquement des mouvements.</p>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-black/10 bg-white">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left text-[10px] font-semibold uppercase tracking-wider text-black/45">
              <th className="px-3 py-2">Article</th>
              <th className="px-3 py-2">Catégorie</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Quantité</th>
              <th className="px-3 py-2">Minimum</th>
              <th className="px-3 py-2">Statut</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-black/40">Aucun article</td></tr>
            ) : items.map((item) => (
              <tr key={item.id} className="border-b border-black/5">
                <td className="px-3 py-2">
                  <p className="font-semibold">{item.name}</p>
                  {!item.active ? <p className="text-[11px] text-black/40">Inactif</p> : null}
                </td>
                <td className="px-3 py-2 text-black/60">{item.category || "—"}</td>
                <td className="px-3 py-2"><ColorChip label={itemTypeLabels[item.itemType]} tone={itemTypeTones[item.itemType]} /></td>
                <td className="px-3 py-2 font-semibold">{formatQty(item.currentQuantity)} {item.unit}</td>
                <td className="px-3 py-2">{formatQty(item.minQuantity)}</td>
                <td className="px-3 py-2"><ColorChip label={statusLabels[item.stockStatus]} tone={statusTones[item.stockStatus]} /></td>
                <td className="px-3 py-2 text-right">
                  {canEdit ? (
                    <button type="button" onClick={() => startEdit(item)} className="text-xs font-semibold underline">Modifier</button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function MovementsPanel({
  items,
  movements,
  reversedIds,
  canEdit,
  search,
  setSearch,
  movementFilter,
  setMovementFilter,
  onSaved,
  onError,
}: {
  items: StockItem[];
  movements: StockMovement[];
  reversedIds: Set<string | null>;
  canEdit: boolean;
  search: string;
  setSearch: (value: string) => void;
  movementFilter: StockMovementType | "all";
  setMovementFilter: (value: StockMovementType | "all") => void;
  onSaved: (message: string) => Promise<void>;
  onError: (error: unknown) => void;
}) {
  const [itemId, setItemId] = useState("");
  const [movementType, setMovementType] = useState<"restock" | "adjustment" | "loss" | "return">("restock");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const activeItems = items.filter((item) => item.active);

  async function save() {
    setSaving(true);
    try {
      await crmStockApi.createMovement({
        itemId,
        movementType,
        quantity: Number(quantity),
        note: note.trim() || undefined,
      });
      setQuantity("");
      setNote("");
      await onSaved("Mouvement enregistré.");
    } catch (error) {
      onError(error);
    } finally {
      setSaving(false);
    }
  }

  async function reverse(id: string) {
    try {
      await crmStockApi.reverseMovement(id);
      await onSaved("Mouvement annulé par un mouvement inverse.");
    } catch (error) {
      onError(error);
    }
  }

  return (
    <section className="space-y-3">
      {canEdit && (
        <div className="grid gap-2 rounded-xl border border-black/10 bg-white p-3 md:grid-cols-5">
          <select value={itemId} onChange={(event) => setItemId(event.target.value)} className={fieldClass}>
            <option value="">Article</option>
            {activeItems.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
          <CrmColorSelect
            ariaLabel="Type de mouvement"
            value={movementType}
            onChange={(value) => setMovementType(value as typeof movementType)}
            options={(["restock", "return", "loss", "adjustment"] as const).map((value) => ({
              value,
              label: movementLabels[value],
              tone: movementTones[value],
            }))}
          />
          <input value={quantity} onChange={(event) => setQuantity(event.target.value)} type="number" step="0.001" placeholder={movementType === "adjustment" ? "Delta + ou -" : "Quantité"} className={fieldClass} />
          <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Note" className={fieldClass} />
          <button type="button" disabled={saving || !itemId || !quantity} onClick={() => void save()} className="h-10 rounded-lg bg-black px-4 text-sm font-semibold text-white disabled:opacity-40">
            Enregistrer
          </button>
        </div>
      )}
      <div className="grid gap-2 md:grid-cols-[1fr_240px]">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un mouvement" className={fieldClass} />
        <CrmColorSelect
          ariaLabel="Filtrer par type de mouvement"
          value={movementFilter}
          onChange={(value) => setMovementFilter(value as StockMovementType | "all")}
          options={[
            { value: "all", label: "Tous les mouvements" },
            ...Object.entries(movementLabels).map(([value, label]) => ({
              value,
              label,
              tone: movementTones[value as StockMovementType],
            })),
          ]}
        />
      </div>
      <div className="overflow-x-auto rounded-xl border border-black/10 bg-white">
        <table className="w-full min-w-[920px] text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left text-[10px] font-semibold uppercase tracking-wider text-black/45">
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Article</th>
              <th className="px-3 py-2">Mouvement</th>
              <th className="px-3 py-2">Impact</th>
              <th className="px-3 py-2">Source</th>
              <th className="px-3 py-2">Par</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {movements.length === 0 ? (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-black/40">Aucun mouvement</td></tr>
            ) : movements.map((movement) => {
              const reversed = reversedIds.has(movement.id) || movement.movementType === "reversal";
              return (
                <tr key={movement.id} className="border-b border-black/5">
                  <td className="px-3 py-2 text-xs text-black/55">{formatDate(movement.occurredAt)}</td>
                  <td className="px-3 py-2 font-medium">{movement.itemName}</td>
                  <td className="px-3 py-2"><ColorChip label={movementLabels[movement.movementType]} tone={movementTones[movement.movementType]} /></td>
                  <td className={cx("px-3 py-2 font-semibold", movement.quantityDelta < 0 ? "text-rose-700" : "text-emerald-700")}>
                    {movement.quantityDelta > 0 ? "+" : ""}{formatQty(movement.quantityDelta)}
                  </td>
                  <td className="px-3 py-2 text-xs text-black/60">
                    {movement.sourceRef || movement.sourceType}
                    {movement.note ? <p>{movement.note}</p> : null}
                  </td>
                  <td className="px-3 py-2 text-xs">{movement.createdByName}</td>
                  <td className="px-3 py-2 text-right">
                    {canEdit && !reversed ? (
                      <button type="button" onClick={() => void reverse(movement.id)} className="text-xs font-semibold underline">Annuler</button>
                    ) : reversed ? <span className="text-[11px] text-black/35">Annulé</span> : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function RecipePanel({
  kind,
  title,
  hint,
  items,
  recipes,
  canEdit,
  onSaved,
  onError,
}: {
  kind: RecipeKind;
  title: string;
  hint: string;
  items: StockItem[];
  recipes: StockRecipe[];
  canEdit: boolean;
  onSaved: (message: string) => Promise<void>;
  onError: (error: unknown) => void;
}) {
  const [outputItemId, setOutputItemId] = useState("");
  const [name, setName] = useState("");
  const [lines, setLines] = useState<Array<{ componentItemId: string; quantityPerUnit: string }>>([
    { componentItemId: "", quantityPerUnit: "1" },
  ]);
  const [saving, setSaving] = useState(false);
  const activeItems = items.filter((item) => item.active);

  function loadOutput(id: string) {
    setOutputItemId(id);
    const recipe = recipes.find((item) => item.outputItemId === id);
    const output = items.find((item) => item.id === id);
    setName(recipe?.name || output?.name || "");
    setLines(recipe?.lines.length
      ? recipe.lines.map((line) => ({
          componentItemId: line.componentItemId,
          quantityPerUnit: String(line.quantityPerUnit),
        }))
      : [{ componentItemId: "", quantityPerUnit: "1" }]);
  }

  async function save() {
    setSaving(true);
    try {
      await crmStockApi.saveRecipe({
        kind,
        outputItemId,
        name: name.trim(),
        lines: lines
          .filter((line) => line.componentItemId)
          .map((line) => ({
            componentItemId: line.componentItemId,
            quantityPerUnit: Number(line.quantityPerUnit),
          })),
      });
      await onSaved("Recette enregistrée.");
    } catch (error) {
      onError(error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="grid gap-3 lg:grid-cols-[340px_1fr]">
      <div className="space-y-2 rounded-xl border border-black/10 bg-white p-3">
        <h2 className="text-sm font-bold">{title}</h2>
        <p className="text-xs leading-5 text-black/55">{hint}</p>
        <select value={outputItemId} onChange={(event) => loadOutput(event.target.value)} className={fieldClass} disabled={!canEdit}>
          <option value="">Article produit</option>
          {activeItems.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nom de la recette" className={fieldClass} disabled={!canEdit} />
        {lines.map((line, index) => (
          <div key={index} className="grid grid-cols-[1fr_90px_auto] gap-2">
            <select
              value={line.componentItemId}
              disabled={!canEdit}
              onChange={(event) => setLines((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, componentItemId: event.target.value } : row))}
              className={fieldClass}
            >
              <option value="">Composant</option>
              {activeItems.filter((item) => item.id !== outputItemId).map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
            <input
              value={line.quantityPerUnit}
              disabled={!canEdit}
              onChange={(event) => setLines((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, quantityPerUnit: event.target.value } : row))}
              type="number"
              min="0.001"
              step="0.001"
              className={fieldClass}
            />
            {canEdit ? (
              <button type="button" onClick={() => setLines((current) => current.filter((_, rowIndex) => rowIndex !== index))} className="text-xs underline">Retirer</button>
            ) : null}
          </div>
        ))}
        {canEdit ? (
          <div className="flex gap-2">
            <button type="button" onClick={() => setLines((current) => [...current, { componentItemId: "", quantityPerUnit: "1" }])} className="h-10 rounded-lg border border-black/15 px-3 text-sm">
              Ajouter un composant
            </button>
            <button type="button" disabled={saving || !outputItemId} onClick={() => void save()} className="h-10 rounded-lg bg-black px-4 text-sm font-semibold text-white disabled:opacity-40">
              Enregistrer
            </button>
          </div>
        ) : null}
      </div>
      <div className="space-y-2">
        {recipes.length === 0 ? <p className="rounded-xl border border-black/10 bg-white px-3 py-8 text-center text-sm text-black/40">Aucune recette</p> : recipes.map((recipe) => (
          <button key={recipe.id} type="button" onClick={() => loadOutput(recipe.outputItemId)} className="block w-full rounded-xl border border-black/10 bg-white p-3 text-left">
            <p className="font-semibold">{recipe.outputName}</p>
            <p className="mt-1 text-xs text-black/55">{recipe.name}</p>
            <ul className="mt-2 space-y-1 text-sm">
              {recipe.lines.map((line) => (
                <li key={line.id}>{formatQty(line.quantityPerUnit)} × {line.componentName}</li>
              ))}
            </ul>
          </button>
        ))}
      </div>
    </section>
  );
}

function ManufacturingPanel({
  items,
  recipes,
  jobs,
  canEdit,
  onSaved,
  onError,
}: {
  items: StockItem[];
  recipes: StockRecipe[];
  jobs: ManufacturingOrder[];
  canEdit: boolean;
  onSaved: (message: string) => Promise<void>;
  onError: (error: unknown) => void;
}) {
  const outputs = items.filter((item) => recipes.some((recipe) => recipe.outputItemId === item.id && recipe.active));
  const [outputItemId, setOutputItemId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [note, setNote] = useState("");
  const [preview, setPreview] = useState<ManufacturingPreview | null>(null);
  const [saving, setSaving] = useState(false);

  async function calculate() {
    setSaving(true);
    try {
      const next = await crmStockApi.previewManufacturing({
        outputItemId,
        quantity: Number(quantity),
      });
      setPreview(next);
    } catch (error) {
      onError(error);
    } finally {
      setSaving(false);
    }
  }

  async function produce() {
    setSaving(true);
    try {
      await crmStockApi.manufacture({
        outputItemId,
        quantity: Number(quantity),
        note: note.trim() || undefined,
      });
      setPreview(null);
      setNote("");
      await onSaved("Fabrication enregistrée. Les composants sont déduits et le produit est ajouté au stock.");
    } catch (error) {
      onError(error);
    } finally {
      setSaving(false);
    }
  }

  async function cancel(id: string) {
    try {
      await crmStockApi.cancelManufacturing(id);
      await onSaved("Fabrication annulée par des mouvements inverses.");
    } catch (error) {
      onError(error);
    }
  }

  return (
    <section className="space-y-3">
      <div className="grid gap-2 rounded-xl border border-black/10 bg-white p-3 md:grid-cols-4">
        <select value={outputItemId} onChange={(event) => { setOutputItemId(event.target.value); setPreview(null); }} className={fieldClass} disabled={!canEdit}>
          <option value="">Produit à fabriquer</option>
          {outputs.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
        <input value={quantity} onChange={(event) => { setQuantity(event.target.value); setPreview(null); }} type="number" min="0.001" step="0.001" className={fieldClass} disabled={!canEdit} />
        <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Note" className={fieldClass} disabled={!canEdit} />
        {canEdit ? (
          <button type="button" disabled={saving || !outputItemId} onClick={() => void calculate()} className="h-10 rounded-lg border border-black/15 px-4 text-sm font-semibold">
            Vérifier le stock
          </button>
        ) : null}
      </div>
      {preview && (
        <div className="rounded-xl border border-black/10 bg-white p-3">
          <p className="text-sm font-semibold">{formatQty(preview.quantity)} × {preview.outputName}</p>
          <ul className="mt-2 space-y-1 text-sm">
            {preview.lines.map((line) => (
              <li key={line.componentItemId} className={line.enough ? "text-emerald-800" : "text-rose-700"}>
                {line.componentName} : {formatQty(line.required)} requis, {formatQty(line.available)} disponible
              </li>
            ))}
          </ul>
          {canEdit ? (
            <button type="button" disabled={saving || !preview.canManufacture} onClick={() => void produce()} className="mt-3 h-10 rounded-lg bg-black px-4 text-sm font-semibold text-white disabled:opacity-40">
              Fabriquer
            </button>
          ) : null}
          {!preview.canManufacture ? <p className="mt-2 text-xs text-rose-700">Stock insuffisant. La fabrication est bloquée.</p> : null}
        </div>
      )}
      <div className="overflow-x-auto rounded-xl border border-black/10 bg-white">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left text-[10px] font-semibold uppercase tracking-wider text-black/45">
              <th className="px-3 py-2">Référence</th>
              <th className="px-3 py-2">Produit</th>
              <th className="px-3 py-2">Quantité</th>
              <th className="px-3 py-2">Statut</th>
              <th className="px-3 py-2">Par</th>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-black/40">Aucune fabrication</td></tr>
            ) : jobs.map((job) => (
              <tr key={job.id} className="border-b border-black/5">
                <td className="px-3 py-2 font-semibold">{job.reference}</td>
                <td className="px-3 py-2">{job.outputName}</td>
                <td className="px-3 py-2">{formatQty(job.quantity)}</td>
                <td className="px-3 py-2">
                  <ColorChip
                    label={job.status === "completed" ? "Terminée" : "Annulée"}
                    tone={job.status === "completed" ? statusTones.ok : statusTones.out}
                  />
                </td>
                <td className="px-3 py-2 text-xs">{job.createdByName}</td>
                <td className="px-3 py-2 text-xs text-black/55">{formatDate(job.createdAt)}</td>
                <td className="px-3 py-2 text-right">
                  {canEdit && job.status === "completed" ? (
                    <button type="button" onClick={() => void cancel(job.id)} className="text-xs font-semibold underline">Annuler</button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
