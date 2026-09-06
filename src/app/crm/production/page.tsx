import { CrmApp } from "@/components/crm/CrmApp";

export default async function CrmProductionPage({
  searchParams,
}: {
  searchParams: Promise<{ user?: string }>;
}) {
  const params = await searchParams;

  return <CrmApp initialUserId={params.user} initialPage="production" />;
}
