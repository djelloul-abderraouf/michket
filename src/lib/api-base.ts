export function resolveApiBase(
  value: string | undefined = process.env.NEXT_PUBLIC_API_URL,
) {
  const raw = String(value ?? "")
    .trim()
    .replace(/\/+$/, "");

  if (!raw) return "";
  if (/\/api\/v1$/i.test(raw)) return raw;

  return `${raw}/api/v1`;
}
