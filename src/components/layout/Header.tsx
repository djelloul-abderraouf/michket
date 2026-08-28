"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { mainNav, type NavItemWithMega } from "@/data/navigation";
import { MobileNav } from "@/components/navigation/MobileNav";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { SearchOverlay } from "@/components/search/SearchOverlay";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { MegaMenuPanel } from "@/components/navigation/MegaMenuPanel";
import { useCart } from "@/contexts/CartContext";

/* ──────────────────────────── Desktop Nav ──────────────────────────── */

interface DesktopNavigationProps {
  onMegaOpen: (item: NavItemWithMega) => void;
  onMegaClose: () => void;
  onMegaCloseImmediate: () => void;
  megaOpenItem: NavItemWithMega | null;
}

function DesktopNavigation({
  onMegaOpen,
  onMegaClose,
  onMegaCloseImmediate,
  megaOpenItem,
}: DesktopNavigationProps) {
  return (
    <nav
      className="hidden lg:flex items-center justify-center min-w-0"
      aria-label="Navigation principale"
    >
      <ul className="flex items-center gap-0 min-w-0" role="menubar">
        {mainNav.map((item) => {
          const hasMega = Boolean(item.mega);
          const isActive = megaOpenItem?.label === item.label;

          return (
            <li key={item.label} className="relative" role="none">
              <Link
                href={item.href}
                role="menuitem"
                aria-haspopup={hasMega ? "menu" : undefined}
                aria-expanded={hasMega ? isActive : undefined}
                onMouseEnter={() => {
                  if (hasMega) {
                    onMegaOpen(item);
                  } else {
                    onMegaClose();
                  }
                }}
                onMouseLeave={() => {
                  if (hasMega) {
                    onMegaClose();
                  }
                }}
                onFocus={() => {
                  if (hasMega) {
                    onMegaOpen(item);
                  } else {
                    onMegaClose();
                  }
                }}
                onClick={onMegaCloseImmediate}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    event.preventDefault();
                    onMegaCloseImmediate();
                  }
                }}
                className={`relative flex items-center gap-1.5 px-4 py-3 text-[13px] font-medium tracking-wide uppercase transition-colors ${
                  isActive
                    ? "text-michket-gold"
                    : "text-michket-charcoal/80 hover:text-michket-gold"
                }`}
              >
                <span>{item.label}</span>

                {item.badge && (
                  <span className="rounded-sm bg-michket-gold px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-michket-black">
                    {item.badge}
                  </span>
                )}

                {hasMega && (
                  <svg
                    className={`h-3 w-3 transition-transform duration-200 ${
                      isActive ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                )}

                {hasMega && (
                  <span
                    aria-hidden="true"
                    className={`absolute bottom-0 left-4 right-4 h-[2px] origin-center bg-michket-gold transition-transform duration-200 ${
                      isActive ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* ──────────────────────────── Header ──────────────────────────── */

export function Header() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [promoHidden, setPromoHidden] = useState(false);
  const [megaOpenItem, setMegaOpenItem] = useState<NavItemWithMega | null>(null);

  const promoRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Mega-menu timers belong in Header, the common parent of trigger + panel.
  const megaOpenTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const megaCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { itemCount } = useCart();

  /* ── Scroll: shadow + stable promo hide/show ── */
  useEffect(() => {
    let rafId: number | null = null;

    /*
     * IMPORTANT:
     * The announcement bar keeps its real layout height at all times.
     * We only move it visually with transform when hiding it.
     *
     * The old max-height animation physically changed the document height.
     * That changed window.scrollY during the transition, which could make the
     * hide/show thresholds trigger each other and create the visible flicker:
     * hide → show → hide → show.
     */
    const updateScrollState = () => {
      const y = Math.max(0, window.scrollY);
      const promoHeight = promoRef.current?.getBoundingClientRect().height ?? 72;

      setScrolled(y > 40);

      setPromoHidden((hidden) => {
        // Once hidden, only bring the promo back at the real top of the page.
        if (hidden) {
          return y > 2;
        }

        // Hide only after the visitor has actually scrolled past the promo.
        // This lets the navbar reach top: 0 naturally without any layout jump.
        return y > promoHeight + 4;
      });

      rafId = null;
    };

    const onScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(updateScrollState);
    };

    updateScrollState();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);

      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  /* ── Body lock for overlays ── */
  useEffect(() => {
    const locked = mobileNavOpen || searchOpen;
    document.body.style.overflow = locked ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen, searchOpen]);

  /* ── Fermer automatiquement la navigation mobile après un clic sur un lien ── */
  useEffect(() => {
    if (!mobileNavOpen) return;

    const handleMobileNavLinkClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const link = target?.closest("a[href]");

      if (!link) return;

      setMobileNavOpen(false);
    };

    document.addEventListener("click", handleMobileNavLinkClick);

    return () => {
      document.removeEventListener("click", handleMobileNavLinkClick);
    };
  }, [mobileNavOpen]);

  /* ── Mega-menu timer helpers ── */
  const clearMegaTimers = useCallback(() => {
    if (megaOpenTimeoutRef.current) {
      clearTimeout(megaOpenTimeoutRef.current);
      megaOpenTimeoutRef.current = null;
    }

    if (megaCloseTimeoutRef.current) {
      clearTimeout(megaCloseTimeoutRef.current);
      megaCloseTimeoutRef.current = null;
    }
  }, []);

  const handleMegaOpen = useCallback(
    (item: NavItemWithMega) => {
      clearMegaTimers();

      megaOpenTimeoutRef.current = setTimeout(() => {
        setMegaOpenItem(item);
        megaOpenTimeoutRef.current = null;
      }, 70);
    },
    [clearMegaTimers],
  );

  const handleMegaClose = useCallback(() => {
    clearMegaTimers();

    megaCloseTimeoutRef.current = setTimeout(() => {
      setMegaOpenItem(null);
      megaCloseTimeoutRef.current = null;
    }, 180);
  }, [clearMegaTimers]);

  const handleMegaCloseImmediate = useCallback(() => {
    clearMegaTimers();
    setMegaOpenItem(null);
  }, [clearMegaTimers]);

  const handleMegaPanelEnter = useCallback(() => {
    if (megaCloseTimeoutRef.current) {
      clearTimeout(megaCloseTimeoutRef.current);
      megaCloseTimeoutRef.current = null;
    }
  }, []);

  const handleMegaPanelLeave = useCallback(() => {
    handleMegaClose();
  }, [handleMegaClose]);

  useEffect(() => {
    return () => {
      clearMegaTimers();
    };
  }, [clearMegaTimers]);

  /* ── Escape closes desktop mega-menu globally ── */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && megaOpenItem) {
        handleMegaCloseImmediate();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [handleMegaCloseImmediate, megaOpenItem]);

  /* ── Close mega-menu below desktop breakpoint ── */
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)");

    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        handleMegaCloseImmediate();
      }
    };

    if (mediaQuery.matches) {
      handleMegaCloseImmediate();
    }

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [handleMegaCloseImmediate]);

  /* ── Close mega menu when opening another overlay ── */
  const openSearch = useCallback(() => {
    handleMegaCloseImmediate();
    setSearchOpen(true);
  }, [handleMegaCloseImmediate]);

  const openCart = useCallback(() => {
    handleMegaCloseImmediate();
    setCartOpen(true);
  }, [handleMegaCloseImmediate]);

  return (
    <>
      {/* ── Announcement bar — visually slides away without changing layout height ── */}
      <div
        ref={promoRef}
        className="sticky top-0 z-40"
        style={{
          transform: promoHidden ? "translateY(-100%)" : "translateY(0)",
          opacity: promoHidden ? 0 : 1,
          transition:
            "transform 220ms cubic-bezier(0.4,0,0.2,1), opacity 180ms ease",
          pointerEvents: promoHidden ? "none" : "auto",
          willChange: "transform, opacity",
        }}
      >
        <AnnouncementBar />
      </div>

      {/* ── Sticky navbar ── */}
      <header
        ref={headerRef}
        className={`sticky top-[99px] sm:top-[68px] lg:top-[72px] z-30 bg-white transition-shadow duration-200 ${
          scrolled ? "shadow-md" : ""
        } ${megaOpenItem ? "shadow-md" : ""}`}
        style={promoHidden ? { top: "0px" } : undefined}
      >
        {/* ── MOBILE ROW ── */}
        <div className="lg:hidden">
          <div className="relative flex h-16 items-center justify-between px-4">
            <button
              type="button"
              onClick={() => setMobileNavOpen((open) => !open)}
              className="z-10 -ml-1 flex h-10 w-10 items-center justify-center transition-colors hover:text-michket-gold"
              aria-label={mobileNavOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={mobileNavOpen}
            >
              {mobileNavOpen ? (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 9h16.5m-16.5 6.75h16.5"
                  />
                </svg>
              )}
            </button>

            <Link
              href="/"
              className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
              aria-label="Michket — Accueil"
            >
              <Image
                src="/images/brand/michket-logo-black.png"
                alt="Michket"
                width={160}
                height={44}
                className="h-12 w-auto sm:h-[52px]"
                priority
              />
            </Link>

            <div className="z-10 ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={openSearch}
                className="flex h-10 w-10 items-center justify-center transition-colors hover:text-michket-gold"
                aria-label="Rechercher"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
              </button>

              <button
                type="button"
                onClick={openCart}
                className="relative flex h-10 w-10 items-center justify-center transition-colors hover:text-michket-gold"
                aria-label="Ouvrir le panier"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>

                {itemCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-michket-gold text-[10px] font-bold text-michket-black">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── DESKTOP ROW ── */}
        <div className="hidden lg:block">
          <div className="grid h-[72px] grid-cols-[auto_1fr_auto] items-center gap-6 px-6 xl:px-10">
            <Link
              href="/"
              className="flex-shrink-0"
              aria-label="Michket — Accueil"
              onMouseEnter={handleMegaClose}
            >
              <Image
                src="/images/brand/michket-logo-black.png"
                alt="Michket"
                width={180}
                height={48}
                className="h-12 w-auto"
                priority
              />
            </Link>

            <DesktopNavigation
              onMegaOpen={handleMegaOpen}
              onMegaClose={handleMegaClose}
              onMegaCloseImmediate={handleMegaCloseImmediate}
              megaOpenItem={megaOpenItem}
            />

            <div className="flex items-center gap-2" onMouseEnter={handleMegaClose}>
              <button
                type="button"
                onClick={openSearch}
                className="flex h-10 w-10 items-center justify-center transition-colors hover:text-michket-gold"
                aria-label="Rechercher"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
              </button>

              <button
                type="button"
                onClick={openCart}
                className="relative flex h-10 w-10 items-center justify-center transition-colors hover:text-michket-gold"
                aria-label="Ouvrir le panier"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>

                {itemCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-michket-gold text-[10px] font-bold text-michket-black">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── DESKTOP MEGA MENU ── */}
      {megaOpenItem && (
        <MegaMenuPanel
          item={megaOpenItem}
          onClose={handleMegaCloseImmediate}
          onPanelEnter={handleMegaPanelEnter}
          onPanelLeave={handleMegaPanelLeave}
          headerRef={headerRef}
        />
      )}

      {/* ── Overlays ── */}
      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
