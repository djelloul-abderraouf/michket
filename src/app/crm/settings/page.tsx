import { CrmApp } from "@/components/crm/CrmApp";

export default async function CrmSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ user?: string }>;
}) {
  const params = await searchParams;

  return <CrmApp initialUserId={params.user} initialPage="settings" />;
}
