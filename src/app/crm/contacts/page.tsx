import { CrmApp } from "@/components/crm/CrmApp";

export default async function CrmContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ user?: string }>;
}) {
  const params = await searchParams;

  return <CrmApp initialUserId={params.user} initialPage="contacts" />;
}
