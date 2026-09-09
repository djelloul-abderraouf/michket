import { CollectionPage } from "@/components/collection/CollectionPage";
import { fetchProductsForCategory } from "@/lib/api";

export default async function LampesPage() {
  let products: Awaited<ReturnType<typeof fetchProductsForCategory>> = [];
  let apiError = false;
  try {
    products = await fetchProductsForCategory("lampes-3d");
  } catch {
    apiError = true;
  }

  return (
    <CollectionPage
      title="Lampes personnalisées"
      description="Créez une lampe LED unique et personnalisée pour un anniversaire, un mariage, un bébé ou toute occasion spéciale. Gravure laser sur bois, éclairage LED doux et chaleureux."
      category="lampes-3d"
      products={products}
      apiError={apiError}
    />
  );
}
