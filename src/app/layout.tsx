import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";

import { AppShell } from "@/components/layout/AppShell";
import { Providers } from "@/components/Providers";
import { NavigationProvider } from "@/contexts/NavigationContext";
import { buildNavigation } from "@/lib/build-navigation";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair-display",
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default:
      "Michket — Cadeaux Personnalisés, Lampes LED 3D, Trophées, Cartes du Monde",
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch navigation data from backend (categories + subcategories)
  const navigation = await buildNavigation();

  return (
    <html
      lang="fr"
      className={`${inter.variable} ${playfairDisplay.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className={`${inter.className} min-h-full flex flex-col`}
      >
        <Providers>
          <NavigationProvider value={navigation}>
            <AppShell>{children}</AppShell>
          </NavigationProvider>
        </Providers>
      </body>
    </html>
  );
}
