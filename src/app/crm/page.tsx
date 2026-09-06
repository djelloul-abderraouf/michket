import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "CRM",
  description: "Espace operationnel Michket CRM.",
};

export default async function CRMIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ user?: string }>;
}) {
  const params = await searchParams;
  const user = params.user ? `?user=${encodeURIComponent(params.user)}` : "";

  redirect(`/crm/dashboard${user}`);
}
