const ADMIN_ROLES = new Set([
  "admin",
  "super_admin",
  "social_media",
]);

export function normalizeRole(role: unknown) {
  return String(role ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

export function canAccessAdmin(role: unknown) {
  return ADMIN_ROLES.has(normalizeRole(role));
}

export function isSocialMedia(role: unknown) {
  return normalizeRole(role) === "social_media";
}
