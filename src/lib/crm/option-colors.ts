import type {
  DealStage,
  DuplicateStatus,
  OrderKind,
  OrderSource,
  OrderStatus,
  Priority,
  ProductionStatus,
} from "@/lib/crm/types";
import type { UnconfirmedBucket } from "@/lib/crm/order-followup";

export type OptionTone = {
  dot: string;
  chip: string;
};

export const neutralTone: OptionTone = {
  dot: "bg-zinc-400",
  chip: "bg-zinc-100 text-zinc-700",
};

export const orderStatusTones: Record<OrderStatus, OptionTone> = {
  pas_confirme: { dot: "bg-stone-500", chip: "bg-stone-100 text-stone-800" },
  confirme: { dot: "bg-emerald-500", chip: "bg-emerald-100 text-emerald-800" },
  en_fabrication: { dot: "bg-cyan-500", chip: "bg-cyan-100 text-cyan-900" },
  en_preparation: { dot: "bg-amber-500", chip: "bg-amber-100 text-amber-900" },
  en_livraison: { dot: "bg-indigo-500", chip: "bg-indigo-100 text-indigo-800" },
  livre: { dot: "bg-green-600", chip: "bg-green-100 text-green-800" },
  retour_echec: { dot: "bg-rose-500", chip: "bg-rose-100 text-rose-800" },
  annulee: { dot: "bg-zinc-500", chip: "bg-zinc-200 text-zinc-700" },
};

export const orderKindTones: Record<OrderKind, OptionTone> = {
  urgent: { dot: "bg-rose-600", chip: "bg-rose-100 text-rose-800" },
  propre: { dot: "bg-emerald-600", chip: "bg-emerald-100 text-emerald-800" },
  refabrication_0: { dot: "bg-amber-500", chip: "bg-amber-100 text-amber-900" },
  correction_interne: { dot: "bg-violet-500", chip: "bg-violet-100 text-violet-800" },
  recupe: { dot: "bg-sky-500", chip: "bg-sky-100 text-sky-900" },
};

export const duplicateStatusTones: Record<DuplicateStatus, OptionTone> = {
  unique: { dot: "bg-emerald-500", chip: "bg-emerald-100 text-emerald-800" },
  a_verifier: { dot: "bg-amber-500", chip: "bg-amber-100 text-amber-900" },
  verifie: { dot: "bg-violet-600", chip: "bg-violet-100 text-violet-800" },
};

export const sourceTones: Record<OrderSource, OptionTone> = {
  ecom: { dot: "bg-black", chip: "bg-black/10 text-black" },
  whatsapp: { dot: "bg-green-500", chip: "bg-green-100 text-green-800" },
  facebook: { dot: "bg-blue-600", chip: "bg-blue-100 text-blue-800" },
  instagram: { dot: "bg-pink-500", chip: "bg-pink-100 text-pink-800" },
};

export const clientTypeTones = {
  particulier: { dot: "bg-sky-500", chip: "bg-sky-100 text-sky-900" },
  professionnel: { dot: "bg-violet-500", chip: "bg-violet-100 text-violet-800" },
} satisfies Record<string, OptionTone>;

export const deliveryTones = {
  home: { dot: "bg-teal-500", chip: "bg-teal-100 text-teal-900" },
  office: { dot: "bg-orange-500", chip: "bg-orange-100 text-orange-900" },
} satisfies Record<string, OptionTone>;

export const productionTones: Record<ProductionStatus, OptionTone> = {
  en_attente: { dot: "bg-amber-500", chip: "bg-amber-100 text-amber-900" },
  en_cours: { dot: "bg-cyan-500", chip: "bg-cyan-100 text-cyan-900" },
  termine: { dot: "bg-emerald-500", chip: "bg-emerald-100 text-emerald-800" },
};

export const plancheStatusTones: Record<"en_attente" | "lancee" | "terminee", OptionTone> = {
  en_attente: { dot: "bg-amber-500", chip: "bg-amber-100 text-amber-900" },
  lancee: { dot: "bg-cyan-600", chip: "bg-cyan-100 text-cyan-900" },
  terminee: { dot: "bg-emerald-600", chip: "bg-emerald-100 text-emerald-800" },
};

export const plancheEventTones: Record<
  "created" | "status" | "orders_added" | "orders_removed" | "capacity",
  OptionTone
> = {
  created: { dot: "bg-violet-500", chip: "bg-violet-100 text-violet-800" },
  status: { dot: "bg-cyan-600", chip: "bg-cyan-100 text-cyan-900" },
  orders_added: { dot: "bg-emerald-500", chip: "bg-emerald-100 text-emerald-800" },
  orders_removed: { dot: "bg-rose-500", chip: "bg-rose-100 text-rose-800" },
  capacity: { dot: "bg-amber-500", chip: "bg-amber-100 text-amber-900" },
};

export const priorityTones: Record<Priority, OptionTone> = {
  basse: { dot: "bg-slate-400", chip: "bg-slate-100 text-slate-700" },
  normale: { dot: "bg-blue-500", chip: "bg-blue-100 text-blue-800" },
  haute: { dot: "bg-amber-500", chip: "bg-amber-100 text-amber-900" },
  urgente: { dot: "bg-rose-600", chip: "bg-rose-100 text-rose-800" },
};

export const dealStageTones: Record<DealStage, OptionTone> = {
  prospection: { dot: "bg-stone-500", chip: "bg-stone-100 text-stone-800" },
  qualification: { dot: "bg-blue-500", chip: "bg-blue-100 text-blue-800" },
  devis_envoye: { dot: "bg-cyan-500", chip: "bg-cyan-100 text-cyan-900" },
  negociation: { dot: "bg-amber-500", chip: "bg-amber-100 text-amber-900" },
  gagnee: { dot: "bg-emerald-500", chip: "bg-emerald-100 text-emerald-800" },
  perdue: { dot: "bg-rose-500", chip: "bg-rose-100 text-rose-800" },
};

export const bucketTones: Record<UnconfirmedBucket, OptionTone> = {
  prospection: { dot: "bg-sky-500", chip: "bg-sky-100 text-sky-900" },
  prioritaire: { dot: "bg-amber-500", chip: "bg-amber-100 text-amber-900" },
  archive: { dot: "bg-zinc-500", chip: "bg-zinc-200 text-zinc-700" },
};

export const activityTones = {
  appel: { dot: "bg-blue-500", chip: "bg-blue-100 text-blue-800" },
  message: { dot: "bg-violet-500", chip: "bg-violet-100 text-violet-800" },
  visite: { dot: "bg-emerald-500", chip: "bg-emerald-100 text-emerald-800" },
} satisfies Record<string, OptionTone>;

const personPalette: OptionTone[] = [
  { dot: "bg-rose-500", chip: "bg-rose-100 text-rose-800" },
  { dot: "bg-orange-500", chip: "bg-orange-100 text-orange-900" },
  { dot: "bg-amber-500", chip: "bg-amber-100 text-amber-900" },
  { dot: "bg-lime-600", chip: "bg-lime-100 text-lime-900" },
  { dot: "bg-emerald-500", chip: "bg-emerald-100 text-emerald-800" },
  { dot: "bg-teal-500", chip: "bg-teal-100 text-teal-900" },
  { dot: "bg-cyan-500", chip: "bg-cyan-100 text-cyan-900" },
  { dot: "bg-sky-500", chip: "bg-sky-100 text-sky-900" },
  { dot: "bg-blue-500", chip: "bg-blue-100 text-blue-800" },
  { dot: "bg-indigo-500", chip: "bg-indigo-100 text-indigo-800" },
  { dot: "bg-violet-500", chip: "bg-violet-100 text-violet-800" },
  { dot: "bg-fuchsia-500", chip: "bg-fuchsia-100 text-fuchsia-800" },
];

export function personTone(seed: string): OptionTone {
  const value = seed.trim().toLowerCase() || "equipe";
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return personPalette[hash % personPalette.length];
}
