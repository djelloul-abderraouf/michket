# Michket Frontend Implementation Plan

## Architecture Overview

- **Framework:** Next.js (App Router) — latest stable
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 (`@import 'tailwindcss'` in globals.css)
- **State:** React context for cart (client-side only, localStorage persistence)
- **Images:** Next.js Image component with responsive srcset
- **Animation:** CSS transitions + minimal Framer Motion for complex interactions
- **Font:** Next.js `next/font` for editorial typography

## Route Structure

| Route | Type | Description |
|---|---|---|
| `/` | Page | Homepage (14-section commercial sequence) |
| `/meilleures-ventes` | Page | Best sellers collection |
| `/lampes-3d` | Page | Lampes 3D collection |
| `/cartes-du-monde` | Page | Cartes du monde collection |
| `/trophees` | Page | Trophées collection |
| `/neon-led` | Page | Néon LED collection |
| `/produits/[slug]` | Dynamic | Product detail page |
| `/search` | Page | Search results page |

## Data Architecture (`src/data/`)

| File | Content |
|---|---|
| `site-config.ts` | Site metadata, announcement bar content, contact info, owner-input placeholders |
| `navigation.ts` | Main nav items, mega-menu structures, mobile nav hierarchy |
| `hero-slides.ts` | Hero carousel data (image paths, links, alt text, responsive sources) |
| `products.ts` | Demo product catalog (slugs, titles, prices, images, badges, categories) |
| `categories.ts` | Category cards for homepage discovery and mega-menu |
| `occasions.ts` | Occasion tiles and gift idea data |

## Component Architecture

### Layout (`src/components/layout/`)
- `AnnouncementBar` — slim promotional bar
- `Header` — desktop header with logo, nav, utilities
- `MegaMenu` — visual mega-menu dropdowns with image cards
- `MobileNav` — full-height drawer with accordion hierarchy
- `Footer` — 6-column footer with newsletter
- `SiteShell` — wraps all pages: announcement + header + main + footer

### Navigation (`src/components/navigation/`)
- `DesktopNav` — horizontal nav items
- `NavLinks` — shared link components
- `SearchOverlay` — predictive search overlay
- `CartDrawer` — slide-in cart drawer

### Home (`src/components/home/`)
- `HeroCarousel` — full-width carousel with auto-rotate
- `CategoryDiscovery` — visual category cards
- `BestSellersRail` — horizontal product carousel
- `OccasionGrid` — occasion-based shopping cards
- `SocialProof` — trust/proof section
- `ValueProps` — brand value proposition
- `InspirationGallery` — UGC/customer photos
- `EditorialSection` — blog/editorial cards
- `NewsletterSignup` — email capture

### Product (`src/components/product/`)
- `ProductCard` — unified card for collections, carousels, recommendations
- `ProductGallery` — image gallery with thumbnails
- `ProductInfo` — title, price, badges, trust
- `VariantSelector` — visual option buttons
- `PersonalizationConfigurator` — staged accordion configurator
- `ProductTabs` — description, specs, shipping, FAQ accordions
- `ReviewSummary` — aggregate ratings display
- `ReviewCard` — individual review
- `RelatedProducts` — cross-sell carousel

### Collection (`src/components/collection/`)
- `CollectionHeader` — title, description, breadcrumbs
- `FilterBar` — sort + filter controls
- `FilterDrawer` — mobile bottom sheet filters
- `ProductGrid` — responsive product grid

### Cart (`src/components/cart/`)
- `CartDrawer` — slide-in drawer with items, free shipping bar, recommendations
- `CartItem` — individual cart item with personalization summary
- `FreeShippingBar` — animated progress bar
- `CartRecommendations` — cross-sell products in cart

### Search (`src/components/search/`)
- `SearchOverlay` — full search experience
- `SearchResults` — results grid
- `SearchSuggestions` — predictive results

## Asset Mapping

| Section | Asset Path | Status |
|---|---|---|
| Logo | `/images/brand/michket-logo-black.png` | ✅ Exists |
| Hero 1 | `/images/hero/hero-carte-du-monde.png` | ✅ Exists |
| Hero 2 | `/images/hero/hero-trophee-bac.png` | ✅ Exists |
| Hero 3 | `/images/hero/hero-naissance.png` | ✅ Exists |
| Hero 4 | `/images/hero/hero-mariage.png` | ✅ Exists |
| Product: Lampes | `/images/products/lampes/*.jpeg` | ✅ 8 images |
| Product: Trophées | `/images/products/trophees/*.jpeg` | ✅ 4 images |
| Product: Cartes | `/images/products/cartes-du-monde/carte.jpg` | ✅ 1 image |
| Product: Néon LED | `/images/products/neon-led/*.webp` | ✅ 2 images |
| Category images | `/images/categories/` | ❌ MISSING — use product images as fallback |
| Lifestyle/UGC | — | ❌ MISSING — use placeholder |
| Before/After | — | ❌ MISSING — skip section initially |

## Implementation Phases

### Phase 3: Technical Foundation
- Initialize Next.js in temp dir, merge into existing repo
- Configure Tailwind CSS with Michket brand tokens
- Set up global styles, typography, CSS custom properties
- Verify app boots

### Phase 4: Global Shell
- AnnouncementBar
- Header with desktop nav
- MegaMenu with image cards
- MobileNav drawer
- Footer
- SiteShell wrapper

### Phase 5: Homepage Hero
- HeroCarousel with actual Michket hero assets
- Responsive handling (no destructive cropping)
- Infinite loop, auto-rotate, swipe support

### Phase 6: Homepage Content
- CategoryDiscovery
- BestSellersRail
- OccasionGrid
- SocialProof
- ValueProps
- InspirationGallery (placeholder)
- EditorialSection (placeholder)
- NewsletterSignup

### Phase 7: Collection Pages
- Collection route layout
- CollectionHeader with breadcrumbs
- ProductGrid with ProductCard
- FilterBar + FilterDrawer
- All 5 collection pages

### Phase 8: Product System
- ProductCard component refinement
- Product page layout (PDP)
- ProductGallery
- VariantSelector
- ProductTabs

### Phase 9: Personalization
- PersonalizationConfigurator (staged accordion)
- Product-specific configurator logic
- Mobile configurator (bottom sheets, sticky CTA)

### Phase 10: Search
- SearchOverlay
- Predictive search against demo catalog
- Search results page

### Phase 11: Cart
- CartDrawer with items
- FreeShippingBar
- Cart state management (React context + localStorage)
- CartRecommendations

### Phase 12: Polish
- Responsive audit at all breakpoints
- Accessibility audit
- Performance pass
- Anti-generic visual review
