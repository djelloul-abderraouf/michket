import { CrmApp } from "@/components/crm/CrmApp";

export default async function CrmOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ user?: string }>;
}) {
  const params = await searchParams;

  return <CrmApp initialUserId={params.user} initialPage="orders" />;
}
