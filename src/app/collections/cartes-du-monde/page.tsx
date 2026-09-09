import { CollectionPage } from "@/components/collection/CollectionPage";
import { fetchProductsForCategory } from "@/lib/api";

export default async function CartesDuMondePage() {
  let products: Awaited<ReturnType<typeof fetchProductsForCategory>> = [];
  let apiError = false;
  try {
    products = await fetchProductsForCategory("cartes-du-monde");
  } catch {
    apiError = true;
  }

  return (
    <CollectionPage
      title="Cartes du monde en bois"
      description="Cartes du monde gravées au laser sur bois noble. Un décor mural élégant et original pour les voyageurs et les amoureux de géographie."
      category="cartes-du-monde"
      products={products}
      apiError={apiError}
    />
  );
}
