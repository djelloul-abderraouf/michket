import { CollectionPage } from "@/components/collection/CollectionPage";
import { fetchProductsForCategory } from "@/lib/api";

export default async function NeonLedPage() {
  let products: Awaited<ReturnType<typeof fetchProductsForCategory>> = [];
  let apiError = false;
  try {
    products = await fetchProductsForCategory("neon-led");
  } catch {
    apiError = true;
  }

  return (
    <CollectionPage
      title="Néon LED personnalisé"
      description="Néon LED sur mesure pour votre intérieur ou votre événement. Création unique avec votre texte, prénom ou forme personnalisée. Qualité professionnelle, installation facile."
      category="neon-led"
      products={products}
      apiError={apiError}
    />
  );
}
