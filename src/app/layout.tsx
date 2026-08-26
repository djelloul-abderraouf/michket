import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Michket — Cadeaux Personnalisés, Lampes LED 3D, Trophées, Cartes du Monde",
    template: "%s | Michket",
  },
  description:
    "Découvrez nos cadeaux personnalisés uniques : lampes LED 3D acrylic, trophées gravés, cartes du monde en bois et néon LED. Fabrication artisanale, livraison rapide.",
  keywords: [
    "cadeau personnalisé",
    "lampe LED 3D",
    "trophée personnalisé",
    "carte du monde bois",
    "néon LED",
    "cadeau anniversaire",
    "cadeau mariage",
    "cadeau naissance",
    "cadeau BAC",
    "cadeau soutenance",
  ],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Michket",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>
          <a href="#main-content" className="skip-link">
            Aller au contenu principal
          </a>
          <Header />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
