import { CrmApp } from "@/components/crm/CrmApp";

export default async function CrmPreparationPage({
  searchParams,
}: {
  searchParams: Promise<{ user?: string }>;
}) {
  const params = await searchParams;

  return <CrmApp initialUserId={params.user} initialPage="preparation" />;
}
