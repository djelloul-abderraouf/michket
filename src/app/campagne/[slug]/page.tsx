import { Cairo } from "next/font/google";
import { notFound } from "next/navigation";

import { CampaignOrder } from "@/components/campaign/CampaignOrder";
import { ApiNotFoundError, fetchCampaign } from "@/lib/api";

const arabicFont = Cairo({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const dynamic = "force-dynamic";

export default async function CampaignPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  try {
    const campaign = await fetchCampaign(slug);

    return (
      <main
        lang="ar"
        dir="rtl"
        className={`${arabicFont.className} michket-arabic min-h-screen overflow-x-hidden bg-[#F7F1E8] pb-8 text-[#251713]`}
      >
        <CampaignOrder campaign={campaign} />
      </main>
    );
  } catch (error) {
    if (error instanceof ApiNotFoundError) notFound();
    throw error;
  }
}
