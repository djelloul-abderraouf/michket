"use client";

import { usePathname } from "next/navigation";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { useNavigation } from "@/contexts/NavigationContext";

const WHATSAPP_NUMBER = "213542638242";

export function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { mainNav } = useNavigation();

  const isAdminRoute =
    pathname === "/admin" ||
    pathname.startsWith("/admin/");

  /*
   * Les landing pages produit possèdent déjà leur propre bouton WhatsApp
   * avec un message prérempli contenant le nom du produit.
   * On masque donc uniquement le bouton global sur ces pages pour éviter
   * d'afficher deux boutons WhatsApp en même temps.
   */
  const isProductLandingPage =
    pathname.startsWith("/produits/");

  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Bonjour Michket, j’ai besoin d’aide.",
  )}`;

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <style>{`
        @keyframes michketWhatsAppFloatGlobal {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>

      <a href="#main-content" className="skip-link">
        Aller au contenu principal
      </a>

      <Header navItems={mainNav} />

      <main id="main-content" className="flex-1">
        {children}
      </main>

      <Footer navItems={mainNav} />

      {!isProductLandingPage && (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contacter Michket sur WhatsApp"
          title="Besoin d’aide ? Contactez-nous sur WhatsApp"
          className="fixed bottom-5 left-4 z-[90] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_rgba(0,0,0,0.22)] ring-4 ring-white/80 transition hover:scale-105 sm:bottom-6 sm:left-6 sm:h-16 sm:w-16"
          style={{
            animation:
              "michketWhatsAppFloatGlobal 3s ease-in-out infinite",
          }}
        >
          <svg
            viewBox="0 0 32 32"
            className="h-7 w-7 sm:h-8 sm:w-8"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M16 4.2C9.5 4.2 4.2 9.3 4.2 15.7c0 2 .5 4 1.5 5.7L4 27.8l6.6-1.7c1.7.9 3.5 1.3 5.4 1.3 6.5 0 11.8-5.1 11.8-11.5S22.5 4.2 16 4.2Z"
              fill="currentColor"
            />
            <path
              d="M12.2 10.1c-.3-.7-.6-.7-.9-.7h-.8c-.3 0-.7.1-1 .5-.4.5-1.4 1.4-1.4 3.3 0 2 1.5 3.8 1.7 4.1.2.3 2.8 4.4 7 6 3.5 1.3 4.2 1 5 .9.8-.1 2.5-1 2.9-2 .4-1 .4-1.8.3-2-.1-.2-.4-.3-.9-.6l-3-1.4c-.4-.2-.7-.3-1 .3l-1.3 1.6c-.2.3-.5.3-.9.1-.4-.2-1.8-.6-3.4-2-1.3-1.1-2.1-2.5-2.4-2.9-.2-.4 0-.6.2-.8l.7-.8c.2-.2.3-.4.4-.7.1-.3.1-.5 0-.8l-1.2-2.9Z"
              fill="#25D366"
            />
          </svg>

          <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-white/90 shadow" />
        </a>
      )}
    </>
  );
}
