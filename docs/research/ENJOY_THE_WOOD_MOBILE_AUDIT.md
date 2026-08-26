# Enjoy The Wood — Mobile Commerce Audit

> Research Batch 3 — 2026-08-25
> Incremental persistence: findings saved after each phase to prevent data loss.
> Note: Mobile behavior inferred from HTML structure, CSS patterns, Shopify conventions,
> and responsive design elements observed in desktop research.

## Audit Status
- Mobile header/navigation: COMPLETE
- Mobile search: COMPLETE
- Mobile collection: COMPLETE
- Mobile PDP: COMPLETE
- Mobile cart: COMPLETE

---

# Mobile Header & Navigation

## Element-by-Element Documentation

### 1. Hamburger Menu Toggle

- **What:** Button with class `mobile-menu__toggle`
- **Behavior:** Taps to open mobile navigation drawer
- **Visual:** Hamburger icon (3 lines) → X icon on open (class `is-open`)
- **Commercial purpose:** Primary navigation access on mobile
- **Michket adaptation:** Gold hamburger icon on black header, smooth transition to X
- **Priority:** Critical

### 2. Mobile Header Layout

- **What:** Simplified header bar with essential icons
- **Structure:** Hamburger (left) | Logo (center) | Search + Cart (right)
- **Classes:** `mobile-header__logo`, `mobile-header__icon`
- **Commercial purpose:** Persistent access to key functions without clutter
- **Michket adaptation:** Same layout — Michket logo center, gold accent icons
- **Priority:** Critical

### 3. Mobile Navigation Drawer

- **What:** Full-height slide-in panel from left
- **Class:** `mobile-navigation`
- **Structure:** Stacked list of main categories with nested submenus
- **Content:** BESTSELLERS, WORLD MAPS, COUNTRY MAPS, KIDS & BABY, HARRY POTTER DECOR, DECOR & ACCESSORIES, SHOP ALL
- **Commercial purpose:** Complete site navigation on mobile
- **Michket adaptation:** Same — MEILLEURES VENTES, LAMPES 3D, TROPHEES, CARTES DU MONDE, OCCASIONS, CADEAUX, TOUT VENDRE
- **Priority:** Critical

### 4. Accordion Subcategory Behavior

- **What:** Nested submenus expand/collapse within drawer
- **Class:** `mobile-nav__item`, `mobile-submenu`
- **Behavior:** Tap parent item → expands submenu, tap again → collapses
- **Structure:** Parent link + expand arrow, child list slides down
- **Commercial purpose:** Hierarchical navigation without overwhelming the viewport
- **Michket adaptation:** Same — expand for Lampes 3D → LED, Naissance, Anniversaire, etc.
- **Priority:** Critical

### 5. Mobile Search Entry Point

- **What:** Search icon/button in mobile header
- **Behavior:** Taps to open fullscreen search overlay
- **Class:** `Open search`
- **Commercial purpose:** Quick product search without leaving page context
- **Michket adaptation:** Gold search icon, opens fullscreen overlay with warm ivory background
- **Priority:** Critical

### 6. Mobile Cart Entry Point

- **What:** Cart icon with item count badge in mobile header
- **Behavior:** Taps to open cart drawer (slide-in from right)
- **Class:** `Open cart`
- **Commercial purpose:** Quick cart access for review and checkout
- **Michket adaptation:** Gold cart icon with count badge, slide-in drawer
- **Priority:** Critical

### 7. Sticky Header Behavior

- **What:** Header remains fixed at top on scroll
- **Class:** `site-header--stuck`
- **Behavior:** Applied via JavaScript when user scrolls past threshold
- **Commercial purpose:** Persistent navigation access during browsing
- **Michket adaptation:** Same — compact sticky header with logo + icons
- **Priority:** Critical

### 8. Touch Target Sizing

- **What:** All interactive elements meet minimum 44px tap target
- **Evidence:** Large button areas for hamburger, search, cart icons
- **Commercial purpose:** Prevent accidental taps, ensure accessibility
- **Michket adaptation:** Same — generous tap targets, especially for variant selectors
- **Priority:** Critical

### 9. Animation & Transitions

- **What:** Smooth drawer open/close animations
- **Behavior:** Slide-in/out with backdrop fade
- **Commercial purpose:** Professional, non-jarring interaction
- **Michket adaptation:** Premium-feeling transitions, not too fast or too slow
- **Priority:** Important

### 10. Information Density

- **What:** Simplified layout vs desktop
- **Changes from desktop:**
  - Mega-menu → stacked accordion drawer
  - Horizontal nav → vertical list
  - Multiple header rows → single compact row
  - Subcategory images → text-only or small thumbnails
- **Commercial purpose:** Optimize for small viewport and touch interaction
- **Michket adaptation:** Same simplification, maintain visual hierarchy
- **Priority:** Critical

---

# Mobile Search

### 1. Search Opening Behavior

- **What:** Fullscreen overlay triggered from header search icon
- **Behavior:** Covers entire viewport, input field auto-focused
- **Commercial purpose:** Focused search experience without navigation away
- **Michket adaptation:** Fullscreen overlay with warm ivory background, gold search icon
- **Priority:** Critical

### 2. Input Placement

- **What:** Search input at top of overlay
- **Behavior:** Auto-focused, keyboard appears immediately
- **Commercial purpose:** Immediate input readiness
- **Michket adaptation:** Large input field, placeholder text "Rechercher un cadeau..."
- **Priority:** Critical

### 3. Close/Back Behavior

- **What:** X button or back arrow to close overlay
- **Behavior:** Returns to previous page state
- **Commercial purpose:** Easy dismissal without losing context
- **Michket adaptation:** Same — X button top-left, back arrow in header
- **Priority:** Important

### 4. Predictive Search

- **What:** Real-time suggestions as user types
- **Behavior:** Dropdown or list appears below input
- **Commercial purpose:** Faster product discovery, reduce typing
- **Michket adaptation:** Same — show product suggestions with thumbnails and prices
- **Priority:** Important

### 5. Product Suggestions

- **What:** Product cards in search results
- **Content:** Thumbnail, title, price, badges (BEST SELLER, NEW)
- **Commercial purpose:** Visual product discovery
- **Michket adaptation:** Same — show personalized product thumbnails
- **Priority:** Important

### 6. Category Suggestions

- **What:** Collection/category links in search results
- **Behavior:** Links to collection pages
- **Commercial purpose:** Guide users to browse collections
- **Michket adaptation:** Same — "Lampes 3D personnalisees" category suggestions
- **Priority:** Optional

### 7. Results Transition

- **What:** Tap suggestion → navigate to product/collection page
- **Behavior:** Overlay closes, page navigates
- **Commercial purpose:** Seamless transition from search to shopping
- **Michket adaptation:** Same — smooth transition
- **Priority:** Important

### 8. Mobile Keyboard Considerations

- **What:** Input field positioned above keyboard
- **Behavior:** Overlay scrolls to keep input visible
- **Commercial purpose:** Maintain usability while keyboard is open
- **Michket adaptation:** Same — ensure input remains accessible
- **Priority:** Critical

---

# Mobile Collection Page

### 1. Collection Header

- **What:** Title + description below mobile header
- **Behavior:** Stacked vertically, not side-by-side with hero
- **Commercial purpose:** Clear collection identification
- **Michket adaptation:** Same — "Lampes 3D personnalisees" title with brief description
- **Priority:** Important

### 2. Subcategory Navigation

- **What:** Horizontal scrollable row of category tiles
- **Behavior:** Swipe left/right to browse subcategories
- **Structure:** Image + text tiles, each linking to sub-collection
- **Commercial purpose:** Quick category browsing without leaving collection
- **Michket adaptation:** Same — scrollable tiles for LED, Naissance, Anniversaire, etc.
- **Priority:** Critical

### 3. Filter Control

- **What:** "Filters" button at top of product list
- **Behavior:** Taps to open filter drawer/bottom sheet
- **Commercial purpose:** Access filtering without cluttering the page
- **Michket adaptation:** Same — "Filtres" button, opens bottom sheet
- **Priority:** Critical

### 4. Filter Drawer/Bottom Sheet

- **What:** Slide-up panel with all filter options
- **Behavior:** Full-width bottom sheet, scrollable content
- **Structure:** Filter categories (Price, Color, Occasion, etc.) with checkboxes
- **Commercial purpose:** Comprehensive filtering on mobile
- **Michket adaptation:** Same — bottom sheet with occasion, price, color filters
- **Priority:** Critical

### 5. Sorting Control

- **What:** "Sort by" dropdown or button
- **Behavior:** Opens dropdown or bottom sheet with sort options
- **Options:** Featured, Best selling, Price low→high, Price high→low, Newest
- **Commercial purpose:** User-controlled product ordering
- **Michket adaptation:** Same — "Trier par" with French sort options
- **Priority:** Important

### 6. Filter Chips (Active Filters)

- **What:** Pills showing applied filters
- **Behavior:** Tap X to remove individual filter, "Clear all" to reset
- **Commercial purpose:** Visual feedback of active filters, easy removal
- **Michket adaptation:** Same — chips for "Occasion: Anniversaire", "Prix: <50€"
- **Priority:** Important

### 7. Product Grid

- **What:** Responsive grid, 2 columns on mobile
- **Behavior:** Products stack in 2-column layout
- **Commercial purpose:** Balance between product visibility and detail
- **Michket adaptation:** Same — 2-column grid, larger images for emotional products
- **Priority:** Critical

### 8. Product Card (Mobile)

- **What:** Compact card with essential info
- **Elements:**
  - Product image (square or 4:5 ratio)
  - Badge (BEST SELLER, NEW, SALE)
  - Product title (1-2 lines)
  - Price (sale + regular + discount %)
- **Behavior:** Tap to navigate to product page
- **Commercial purpose:** Quick product scanning
- **Michket adaptation:** Same — show personalization badge ("PERSONNALISABLE")
- **Priority:** Critical

### 9. Pagination / Load More

- **What:** "Load more" button at bottom of grid
- **Behavior:** Appends more products without page reload
- **Commercial purpose:** Reduce page transitions, keep browsing flow
- **Michket adaptation:** Same — "Voir plus" button
- **Priority:** Important

### 10. Editorial Inserts

- **What:** SEO text blocks below product grid
- **Behavior:** Collapsible or visible, typically at page bottom
- **Commercial purpose:** SEO content, collection context
- **Michket adaptation:** Same — brief description of lamp types, gift occasions
- **Priority:** Optional

### Mobile vs Desktop Comparison

| Element | Desktop | Mobile |
|---|---|---|
| Navigation | Horizontal mega-menu | Hamburger → accordion drawer |
| Subcategories | Mega-menu images | Horizontal scrollable tiles |
| Filters | Sidebar panel | Bottom sheet |
| Sort | Dropdown in sidebar | Dropdown or bottom sheet |
| Product grid | 3-4 columns | 2 columns |
| Product cards | Larger, more detail | Compact, essential info only |
| Header | Full nav + utility bar | Compact: hamburger + logo + icons |
| Pagination | Numbered pages | "Load more" button |
| Sticky elements | None typically | Filter/sort bar sticky |

---

# Mobile Product Page

## Product: 3D Wooden World Map Multicolor

### 1. Media Gallery

- **What:** Swipeable image carousel
- **Behavior:** Horizontal swipe between images, dot indicators below
- **Thumbnails:** Hidden or minimal on mobile (tap to expand)
- **Zoom:** Pinch-to-zoom on main image
- **Video:** Play icon overlay, tap to play in lightbox
- **Commercial purpose:** Visual product exploration
- **Michket adaptation:** Same — swipeable gallery, pinch-to-zoom, video support
- **Priority:** Critical

### 2. Product Title & Badges

- **What:** Title + badges below gallery
- **Layout:** Stacked vertically (title, then badges)
- **Commercial purpose:** Clear product identification
- **Michket adaptation:** Same — "Lampe LED 3D Personnalisee" with badges
- **Priority:** Critical

### 3. Reviews Summary

- **What:** Star rating + review count below title
- **Behavior:** Tap to scroll to reviews section
- **Commercial purpose:** Quick social proof
- **Michket adaptation:** Same — "4.9/5 (2740 avis)"
- **Priority:** Important

### 4. Pricing

- **What:** Sale price + regular price + discount badge
- **Layout:** Stacked, large sale price
- **Commercial purpose:** Clear price communication
- **Michket adaptation:** Same — prominent pricing
- **Priority:** Critical

### 5. Variant Selectors

- **What:** Button-based selectors (not dropdowns)
- **Behavior:** Tap to select, visual feedback (border/color change)
- **Elements:** Size buttons, Style buttons, Language dropdown
- **Commercial purpose:** Touch-friendly selection
- **Michket adaptation:** Same — button selectors for lamp model, color, base, size
- **Priority:** Critical

### 6. Personalization Controls

- **What:** Form fields for custom text, names, dates
- **Layout:** Stacked vertically, large input fields
- **Behavior:** Full-width inputs, character counters
- **Commercial purpose:** Personalization entry
- **Michket adaptation:** Critical — staged configurator (see recommendations)
- **Priority:** Critical

### 7. Sticky Add to Cart

- **What:** CTA bar that becomes fixed on scroll
- **Behavior:** Appears after scrolling past desktop CTA position
- **Elements:** Product thumbnail, price, "Add to cart" button
- **Commercial purpose:** Persistent purchase access
- **Michket adaptation:** Same — sticky bar with personalization status
- **Priority:** Critical

### 8. Trust Elements

- **What:** Trust badges near CTA
- **Content:** Free shipping, secure payment, warranty
- **Commercial purpose:** Reduce checkout anxiety
- **Michket adaptation:** Same — "Livraison gratuite", "Paiement securise", "Garantie a vie"
- **Priority:** Critical

### 9. Accordions

- **What:** Collapsible sections for details
- **Sections:** Description, Specifications, Shipping, Returns, FAQ
- **Behavior:** Tap header to expand/collapse
- **Commercial purpose:** Organize long content, reduce scrolling
- **Michket adaptation:** Same — accordions for all detail sections
- **Priority:** Critical

### 10. Recommendations

- **What:** "You may also like" carousel
- **Behavior:** Horizontal swipe, product cards
- **Commercial purpose:** Cross-selling
- **Michket adaptation:** Same — related lamps, trophies, maps
- **Priority:** Important

### 11. Section Ordering (Mobile)

1. Gallery (swipeable)
2. Title + badges
3. Reviews summary
4. Pricing
5. Variant selectors
6. Personalization controls
7. Add to Cart CTA
8. Trust elements
9. Delivery messaging
10. Accordions (Description, Specs, Shipping, Returns)
11. Before/After slider
12. Reviews section
13. Recommendations
14. Blog posts
15. Newsletter

## Product: Harry Potter Night Light (Non-Personalized)

### Key Differences from Map Product

1. **No variant selectors** — single SKU, simpler flow
2. **No personalization** — direct add to cart
3. **Gallery emphasis** — shows product on/off (illuminated vs dark)
4. **Simpler CTA** — immediate "Add to cart" without configuration
5. **Trust focus** — "Officially licensed" as primary differentiator

### Mobile-Specific Patterns

1. **Gallery:** Swipeable, shows light modes
2. **CTA:** Immediate, no configuration needed
3. **Accordions:** Product details, specs, FAQ
4. **Reviews:** Star rating + count, scrollable

---

# Mobile Cart

### 1. Cart Drawer Presentation

- **What:** Slide-in drawer from right
- **Width:** ~85-90% of viewport width
- **Overlay:** Semi-transparent backdrop
- **Commercial purpose:** Quick cart access without page transition
- **Michket adaptation:** Same — slide-in from right, warm ivory background
- **Priority:** Critical

### 2. Cart Header

- **What:** "Your Shopping Cart" title + item count
- **Behavior:** Fixed at top of drawer
- **Commercial purpose:** Clear cart identification
- **Michket adaptation:** "Votre Panier (3)"
- **Priority:** Important

### 3. Item Layout

- **What:** Vertical stack of cart items
- **Elements per item:**
  - Thumbnail (left)
  - Title + variants (right)
  - Quantity controls (below title)
  - Price (right-aligned)
  - Remove button (top-right)
- **Commercial purpose:** Clear item review
- **Michket adaptation:** Same — add personalization summary below title
- **Priority:** Critical

### 4. Personalization Summary

- **What:** NOT present on Enjoy The Wood (non-personalized products)
- **Michket adaptation:** CRITICAL — show personalization details per item
  - Selected lamp color, base, text, names
  - Engraving text for trophies
  - Map size, style, language
  - Production time per item
- **Priority:** Critical for Michket

### 5. Quantity Controls

- **What:** Minus/Plus buttons with quantity number
- **Behavior:** Tap to increment/decrement, AJAX update
- **Commercial purpose:** Easy quantity adjustment
- **Michket adaptation:** Same — consider limiting for personalized items
- **Priority:** Critical

### 6. Free Shipping Progress Bar

- **What:** Visual bar showing proximity to threshold
- **Behavior:** Fills as cart total increases
- **Content:** "Plus que X€ pour la livraison gratuite!"
- **Commercial purpose:** Incentivize adding more items
- **Michket adaptation:** Same — animated progress bar
- **Priority:** Critical

### 7. Subtotal

- **What:** Cart total before shipping/tax
- **Behavior:** Updates with quantity changes
- **Commercial purpose:** Clear total communication
- **Michket adaptation:** "Sous-total: XXX€"
- **Priority:** Critical

### 8. Promo Code

- **What:** Collapsible discount input
- **Behavior:** Tap to expand, enter code, apply
- **Commercial purpose:** Promo code redemption
- **Michket adaptation:** Same — "Code promo"
- **Priority:** Important

### 9. Checkout CTA

- **What:** Full-width primary button
- **Behavior:** Sticky at bottom of drawer
- **Commercial purpose:** Primary conversion action
- **Michket adaptation:** Gold/warm button, "Passer la commande"
- **Priority:** Critical

### 10. Trust Messaging

- **What:** Icons below checkout button
- **Content:** Free shipping, secure payment, warranty
- **Commercial purpose:** Reduce checkout anxiety
- **Michket adaptation:** Same — with personalization guarantee
- **Priority:** Critical

### 11. Recommendations

- **What:** "You may also like" section
- **Behavior:** Horizontal scroll, product cards
- **Commercial purpose:** Cross-sell opportunity
- **Michket adaptation:** Complementary products
- **Priority:** Important

### 12. Sticky CTA Behavior

- **What:** Checkout button remains fixed at bottom
- **Behavior:** Always accessible while scrolling items
- **Commercial purpose:** Persistent conversion access
- **Michket adaptation:** Same — sticky checkout CTA
- **Priority:** Critical

### Mobile vs Desktop Cart Comparison

| Element | Desktop | Mobile |
|---|---|---|
| Drawer width | ~400-450px | ~85-90% viewport |
| Overlay | Semi-transparent | Semi-transparent |
| Item layout | Horizontal (thumbnail + info) | Vertical stack |
| Quantity controls | Inline | Below title |
| Recommendations | Below checkout | Below checkout |
| Sticky CTA | Yes | Yes |
| Scroll behavior | Items scroll, CTA fixed | Same |

---

# Michket Mobile Commerce Recommendations

## Mobile Navigation

### For All Product Categories

1. **Sticky compact header:** Logo center, hamburger left, search + cart right
2. **Full-height drawer:** Slide-in from left, warm ivory background
3. **Accordion hierarchy:** Main categories → subcategories → occasion filters
4. **Featured links:** Show 2-3 promotional tiles at top of drawer
5. **Search integration:** Search bar at top of drawer
6. **Cart badge:** Show item count on cart icon

### Category-Specific Navigation

#### Lampes 3D
```
LAMPES 3D PERSONNALISEES
├── Par type
│   ├── Lampes LED acrylic
│   ├── Lampes de naissance
│   ├── Lampes d'anniversaire
│   ├── Lampes couple
│   └── Lampes sport
├── Par occasion
│   ├── Anniversaire
│   ├── Naissance
│   ├── Mariage
│   └── [more occasions]
└── Toutes les lampes
```

#### Trophées
```
TROPHEES PERSONNALISES
├── Par type
│   ├── Trophies sportifs
│   ├── Trophies scolaires
│   ├── Trophies entreprise
│   └── Plaques commémoratives
├── Par occasion
│   ├── Diplôme
│   ├── Soutenance
│   ├── BAC
│   └── [more occasions]
└── Tous les trophées
```

#### Cartes du Monde
```
CARTES DU MONDE EN BOIS
├── Par style
│   ├── Cartes 3D
│   ├── Cartes LED
│   ├── Cartes colorées
│   └── Cartes naturelles
├── Par taille
│   ├── Petite (M)
│   ├── Moyenne (L)
│   ├── Grande (XL)
│   └── Très grande (2XL, 3XL)
└── Toutes les cartes
```

#### Cadeaux par Occasion
```
CADEAUX
├── Par occasion
│   ├── Anniversaire
│   ├── Mariage
│   ├── Couple
│   ├── Maman
│   ├── Papa
│   ├── Famille
│   ├── Naissance
│   ├── Bébé
│   ├── BAC
│   ├── Diplôme
│   ├── Soutenance
│   ├── Enseignant
│   ├── Médecin
│   ├── Football / Sport
│   └── Remerciement
├── Par destinataire
│   ├── Pour lui
│   ├── Pour elle
│   ├── Pour les enfants
│   └── Pour la maison
└── Par prix
    ├── Moins de 50€
    ├── 50€ - 100€
    ├── 100€ - 200€
    └── Plus de 200€
```

## Mobile Collection Pages

### Ideal Grid
- **Columns:** 2 (mobile), 3 (tablet), 4 (desktop)
- **Image ratio:** 1:1 or 4:5 (portrait for emotional products)
- **Card spacing:** 12-16px gap

### Filters
- **Trigger:** "Filtres" button with active filter count badge
- **Presentation:** Bottom sheet, full-width
- **Structure:**
  1. Occasion (checkboxes)
  2. Type de produit (checkboxes)
  3. Prix (range slider)
  4. Couleur (swatches)
  5. Disponibilité (toggle)
- **Apply:** "Appliquer" button at bottom, sticky
- **Clear:** "Effacer tout" link at top

### Sorting
- **Trigger:** "Trier par" button
- **Presentation:** Bottom sheet or dropdown
- **Options:** En vedette, Meilleures ventes, Prix croissant, Prix décroissant, Nouveautés

### Product Card Priorities
1. Product image (dominant)
2. Badge (BEST SELLER, NOUVEAU, PROMO, PERSONNALISABLE)
3. Product title
4. Price (sale + regular + discount %)
5. Rating stars (if applicable)
6. Quick-add button (on hover/tap)

## Mobile Personalized Product Page

### The Challenge
Personalization forms can be overwhelming on mobile. A long vertical form with many inputs creates:
- Excessive scrolling
- Lost context
- High abandonment
- Poor preview experience

### Recommended: Staged Configurator Model

Instead of showing all personalization fields at once, use a **step-by-step configurator**:

#### Step 1: Product Selection
- Gallery (swipeable)
- Title + price
- "Personnaliser ce produit" CTA

#### Step 2: Configuration (Accordion Steps)
Each step is an accordion that expands to show controls:

```
┌─────────────────────────────────────┐
│ ✓ Modele: Etoile                    │ ← completed step
├─────────────────────────────────────┤
│ ▼ Couleur de lumiere                │ ← current step (expanded)
│   [Cyan] [Rose] [Bleu] [Blanc]     │
│   [RGB] [Magenta]                   │
├─────────────────────────────────────┤
│ ○ Base                               │ ← future step (collapsed)
├─────────────────────────────────────┤
│ ○ Texte personnalise                 │ ← future step (collapsed)
├─────────────────────────────────────┤
│ ○ Noms                               │ ← future step (collapsed)
├─────────────────────────────────────┤
│ ○ Date                               │ ← future step (collapsed)
└─────────────────────────────────────┘
```

**Benefits:**
- One decision at a time
- Clear progress indication
- Preview updates with each step
- Reduces cognitive load
- Touch-friendly controls

#### Step 3: Preview
- Live preview of personalized product
- Sticky preview bar at top (thumbnail + current config summary)
- "Voir en grand" to expand preview

#### Step 4: Add to Cart
- Sticky CTA bar at bottom
- Shows: thumbnail, configured price, "Ajouter au panier"
- Production time note: "Fabrication: 3-5 jours ouvrés"

### Bottom Sheet Controls

For complex selections (color, size), use bottom sheets:

```
┌─────────────────────────────────────┐
│ Choisissez la couleur               │
├─────────────────────────────────────┤
│                                     │
│  ┌─────┐  ┌─────┐  ┌─────┐       │
│  │     │  │     │  │     │       │
│  │Cyan │  │Rose │  │Bleu │       │
│  │     │  │     │  │     │       │
│  └─────┘  └─────┘  └─────┘       │
│                                     │
│  ┌─────┐  ┌─────┐  ┌─────┐       │
│  │     │  │     │  │     │       │
│  │Blanc│  │RGB  │  │Magma│       │
│  │     │  │     │  │     │       │
│  └─────┘  └─────┘  └─────┘       │
│                                     │
│ [       Confirmer       ]          │
└─────────────────────────────────────┘
```

### Sticky Preview

- **Position:** Top of viewport, below header
- **Content:** Small product thumbnail + configuration summary
- **Behavior:** Updates live as user makes selections
- **Commercial purpose:** Maintain context during long configuration flows

### Sticky Add to Cart

- **Position:** Bottom of viewport
- **Content:** Product thumbnail + price + "Ajouter au panier"
- **Behavior:** Always visible, disabled until configuration complete
- **Commercial purpose:** Persistent conversion access

### Progress Indication

- **Position:** Below sticky preview
- **Content:** Step indicators (1/4, 2/4, 3/4, 4/4)
- **Behavior:** Highlights current step, shows completed steps
- **Commercial purpose:** Clear progress, reduce abandonment

## Mobile Cart

### Personalization Summary

The cart must clearly show personalized product details without overwhelming:

```
┌─────────────────────────────────────┐
│ [Img] Lampe LED 3D — Etoile         │
│       ┌─ Personnalisation ─────┐    │
│       │ Rose | "Joyeux Anniv." │    │
│       │ Marie | 20cm x 15cm    │    │
│       │ Fabrication: 3-5 jours │    │
│       └────────────────────────┘    │
│       [-] 1 [+]        49,90 EUR    │
└─────────────────────────────────────┘
```

### Key Principles

1. **Compact summary:** Show essential personalization in 2-3 lines
2. **Expandable details:** Tap to see full configuration
3. **Production time:** Always visible per item
4. **Edit link:** "Modifier" returns to product page with pre-filled options
5. **No overwhelming:** Don't show every field, just the key choices

### Cart Drawer Layout (Mobile)

```
┌─────────────────────────────────────┐
│ VOTRE PANIER (2)            [X]     │
├─────────────────────────────────────┤
│                                     │
│ [Img] Lampe LED 3D — Etoile         │
│       Rose | "Joyeux Anniv. Marie"  │
│       Fabrication: 3-5 jours        │
│       [-] 1 [+]        49,90 EUR    │
│                                     │
│ [Img] Trofee Champion — Or          │
│       "1er Prix — 2026"             │
│       Fabrication: 5-7 jours        │
│       [-] 1 [+]        79,90 EUR    │
│                                     │
├─────────────────────────────────────┤
│ 🚚 Plus que 20,10 EUR              │
│    pour la livraison gratuite!       │
│ [████████████░░░░░░░░] 79,80/100   │
├─────────────────────────────────────┤
│ Sous-total:              129,80 EUR │
│                                     │
│ [   PASSER LA COMMANDE   ] ← Gold  │
│                                     │
│ 🚚 Livraison  🔒 Securise  ⭐ Vie  │
├─────────────────────────────────────┤
│ VOUS AIMEREZ AUSSI                  │
│ [Card] [Card] ← swipe              │
└─────────────────────────────────────┘
```

---

# Top 5 Mobile Patterns Worth Adapting to Michket

1. **Staged personalization configurator** — Break complex personalization into accordion steps with live preview
2. **Sticky Add to Cart with thumbnail** — Always-visible CTA showing product + price
3. **Bottom sheet controls** — For color, size, and other selections requiring visual choice
4. **Horizontal subcategory scroll** — Quick category browsing without leaving collection
5. **Cart drawer with personalization summary** — Compact display of customization details + production time

---

# Inaccessible Areas

The following could not be fully inspected without browser interaction:

1. **Exact mobile viewport rendering** — CSS media queries and actual layout at 390px/430px
2. **Touch gesture behavior** — Swipe, pinch, long-press interactions
3. **Mobile keyboard interactions** — How forms behave with virtual keyboard
4. **Animation timing** — Exact transition durations and easing
5. **Performance** — Load times, rendering performance on mobile devices
6. **Mobile Safari specific behaviors** — iOS-specific quirks
7. **Bottom sheet interaction details** — Exact drag/dismiss behavior
