import type { OrderStatus } from "./types";

export type UnconfirmedBucket = "prospection" | "prioritaire" | "archive";

const HOUR = 60 * 60 * 1000;
export const PROSPECTION_WINDOW_MS = 48 * HOUR;
export const PRIORITAIRE_WINDOW_MS = 3 * 24 * HOUR;

export const unconfirmedBucketLabels: Record<UnconfirmedBucket, string> = {
  prospection: "Prospection",
  prioritaire: "Prioritaire",
  archive: "Archive",
};

export function unconfirmedBucket(
  createdAt: string,
  status: OrderStatus | string,
  now = Date.now(),
): UnconfirmedBucket | null {
  if (status !== "pas_confirme") {
    return null;
  }
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) {
    return "prospection";
  }
  const age = now - created;
  if (age < PROSPECTION_WINDOW_MS) {
    return "prospection";
  }
  if (age < PROSPECTION_WINDOW_MS + PRIORITAIRE_WINDOW_MS) {
    return "prioritaire";
  }
  return "archive";
}

export function followUpHint(createdAt: string, now = Date.now()) {
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) {
    return "Prospection";
  }
  const age = now - created;
  const archiveAt = PROSPECTION_WINDOW_MS + PRIORITAIRE_WINDOW_MS;
  if (age < PROSPECTION_WINDOW_MS) {
    const hours = Math.max(1, Math.ceil((PROSPECTION_WINDOW_MS - age) / HOUR));
    return `Prioritaire dans ${hours} h`;
  }
  if (age < archiveAt) {
    const days = Math.max(1, Math.ceil((archiveAt - age) / (24 * HOUR)));
    return `Archive dans ${days} j`;
  }
  return "Archivée";
}
