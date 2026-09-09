import { CollectionPage } from "@/components/collection/CollectionPage";
import { fetchProductsForCategory } from "@/lib/api";

export default async function TropheesPage() {
  let products: Awaited<ReturnType<typeof fetchProductsForCategory>> = [];
  let apiError = false;
  try {
    products = await fetchProductsForCategory("trophees");
  } catch {
    apiError = true;
  }

  return (
    <CollectionPage
      title="Trophées personnalisés"
      description="Trophées gravés au laser pour la soutenance, le bac, le 5ème anniversaire ou toute célébration. Bois noble, finition soignée, gravure précise."
      category="trophees"
      products={products}
      apiError={apiError}
    />
  );
}
