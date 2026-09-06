import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Collections | Michket",
  description:
    "Découvrez nos collections de produits personnalisés : lampes LED, trophées, cartes du monde en bois, néon LED.",
};

export default function CollectionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
