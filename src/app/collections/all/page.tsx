import { CollectionPage } from "@/components/collection/CollectionPage";
import { fetchAllProductsMapped } from "@/lib/api";

export default async function AllCollectionsPage() {
  let products: Awaited<ReturnType<typeof fetchAllProductsMapped>> = [];
  let apiError = false;
  try {
    products = await fetchAllProductsMapped();
  } catch {
    apiError = true;
  }

  return (
    <CollectionPage
      title="Toutes nos collections"
      description="Découvrez l'ensemble de nos créations artisanales : lampes LED personnalisées, trophées gravés, cartes du monde en bois et néon LED sur mesure."
      products={products}
      apiError={apiError}
    />
  );
}
