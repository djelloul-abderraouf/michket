# Michket E-Commerce Blueprint

> Version 1.0 — 2026-08-25
> Primary product, design, and UX specification for the Michket website.
> All decisions below are informed by deep Enjoy The Wood research (4 batches, 4 audit files, ~3,800 lines).

---

# 1 — Product Vision / North Star

## What Michket Is

Michket is a premium e-commerce brand specializing in **personalized 3D acrylic LED lamps**, **personalized trophies and commemorative gifts**, and **wooden world maps**. The brand exists at the intersection of craftsmanship, personalization, and emotional gifting.

## Who It Serves

| Audience | Why They Buy |
|---|---|
| Gift-givers (ages 18-45) | Looking for a meaningful, personalized present — not a generic one |
| Graduates (BAC, diplôme, soutenance) | Wanting a memorable keepsake of academic achievement |
| Couples | Wedding, anniversary, Valentine's Day — celebrating their bond |
| Parents / Family | Birthdays, births, family milestones — emotional home décor |
| Sports teams / Clubs | Trophies, awards, team commemoration |
| Professionals | Doctor, teacher, colleague appreciation gifts |
| Home decorators | Beautiful, conversation-starting wall art and lighting |

## What Michket Sells

Three core product families:

1. **Lampes 3D personnalisées** — Illuminated acrylic LED lamps, customizable with names, dates, photos, and text. Emotional, decorative, giftable.
2. **Trophées personnalisés** — Award trophies, commemorative plaques, recognition pieces. Personalized with engraving for achievement moments.
3. **Cartes du monde en bois** — Handcrafted wooden world maps for wall display. Sizes from medium to 3XL. Styles: 3D, LED, colored, natural, panneau.

## Why Customers Buy from Michket

- The product is **personalized** — it says something about the recipient that no store-bought item can
- It triggers **emotional response** — "this was made for me" / "this was made for them"
- It is **premium quality** — not mass-produced, not disposable
- It is **visually stunning** — products photograph beautifully, display beautifully
- It works as a **gift** — for milestones, celebrations, gratitude, love

## Emotional Positioning

> "The most meaningful gift isn't expensive. It's personal."

Michket products are bought because they carry meaning. Every lamp, trophy, and map is a vehicle for someone's emotion — pride, love, gratitude, celebration. The website must feel like a place where you **find the perfect gift**, not where you **buy a product**.

## Commercial Positioning

- **Mid-premium price range**: Accessible enough for impulse gifts, premium enough to feel special
- **Personalization as value driver**: Personalized products command higher margins
- **Occasion-based commerce**: Purchases are event-driven (birthday, graduation, wedding)
- **Gift-forward**: The entire experience assumes the buyer is purchasing for someone else

## Visual Positioning

- Cinematic product photography in dark/warm environments
- LED glow as visual signature — dramatic, atmospheric, warm
- Premium materials visible: acrylic clarity, wood grain, engraved detail
- Dark backgrounds for product hero shots, warm ivory for content sections
- Gold and amber as accent colors, never neon or generic

## Gifting Positioning

Every page on Michket should whisper: **"This would make the perfect gift."**

- Gift guides organized by occasion and recipient
- Gift wrapping as a premium add-on
- Gift messaging as a checkout option
- Occasion-first navigation (not product-first)
- "Perfect for a birthday" / "Ideal for a graduation" contextual copy

## Personalization Positioning

Personalization is not a feature — it is the **core product**.

- Without personalization, it's a lamp. With personalization, it's *their* lamp.
- The configurator must feel premium, not like a form
- Live preview is essential — customers must see what they're creating
- Character limits, font choices, photo uploads — all feel intentional, not afterthought
- Incomplete personalization should never be purchasable

---

# 2 — Complete Information Architecture

## Site Map

### Primary Navigation

| Level 1 | Level 2 | Level 3 |
|---|---|---|
| ACCUEIL | — | — |
| MEILLEURES VENTES | Lampes best-sellers | — |
| | Trophées best-sellers | — |
| | Cartes best-sellers | — |
| | Toutes les meilleures ventes | — |
| LAMPES 3D PERSONNALISÉES | Par type: LED acrylic, Naissance, Anniversaire, Couple, Sport, Musical | — |
| | Par occasion: Anniversaire, Mariage, Naissance, Fête des mères/pères, Diplôme | — |
| | Par destinataire: Pour elle, Pour lui, Pour les enfants | — |
| | Toutes les lampes | — |
| TROPHÉES PERSONNALISÉS | Par type: Sportifs, Scolaires, Entreprise, Plaques commémoratives, Coupes | — |
| | Par occasion: Diplôme, Soutenance, BAC, Championnat, Remerciement | — |
| | Tous les trophées | — |
| CARTES DU MONDE EN BOIS | Par style: 3D, LED, Colorées, Naturelles, Panneau | — |
| | Par taille: M, L, XL, 2XL | — |
| | Par usage: Salon, Chambre, Bureau, Restaurant | — |
| | Toutes les cartes | — |
| CADEAUX | Par occasion | Anniversaire, Mariage, Couple, Maman, Papa, Naissance, Diplôme, BAC, Soutenance, Enseignant, Médecin, Sport, Remerciement |
| | Par destinataire | Pour lui, Pour elle, Pour les enfants, Pour la maison |
| | Par prix | Moins de 50€, 50-100€, 100-200€, Plus de 200€ |
| | Services | Cartes cadeaux, Emballage cadeau |
| NOUVEAUTÉS | Nouvelles lampes | — |
| | Nouveaux trophées | — |
| | Nouvelles cartes | — |
| TOUT VENDRE | Sitemap-style mega-menu | All categories, all collections |

### Secondary Navigation (Footer / Utility)

| Section | Links |
|---|---|
| ASSISTANCE | Suivre ma commande, Livraison, Retours, FAQ, Nous contacter |
| A PROPOS | Notre histoire, Notre savoir-faire, Nos valeurs, Avis clients |
| LÉGAL | Conditions générales, Politique de confidentialité, Mentions légales |
| SUIVEZ-NOUS | Instagram, Facebook, TikTok, Pinterest, YouTube |

### SEO / Discovery Pages

| Page | Purpose |
|---|---|
| `/collections/anniversaire` | Cadeaux d'anniversaire personnalisés |
| `/collections/mariage` | Cadeaux de mariage personnalisés |
| `/collections/maman` | Cadeaux pour maman |
| `/collections/papa` | Cadeaux pour papa |
| `/collections/naissance` | Cadeaux de naissance |
| `/collections/bac` | Cadeaux de réussite BAC |
| `/collections/diplome` | Cadeaux de diplôme |
| `/collections/soutenance` | Cadeaux de soutenance |
| `/collections/enseignant` | Cadeaux pour enseignant |
| `/collections/medecin` | Cadeaux pour médecin |
| `/collections/football` | Cadeaux de sport / football |
| `/collections/sport` | Cadeaux sportifs |
| `/collections/remerciement` | Cadeaux de remerciement |
| `/collections/couple` | Cadeaux pour couple |
| `/collections/famille` | Cadeaux famille |
| `/collections/bebe` | Cadeaux bébé |
| `/collections/metiers` | Cadeaux par métier |
| `/pages/inspiration` | Galerie de créations clients |

### Utility Pages

| Page | URL |
|---|---|
| Panier | `/cart` |
| Checkout | Handoff to commerce platform |
| Compte | `/account` (optional for v1) |
| Liste de souhaits | `/wishlist` (optional for v1) |
| Recherche | `/search` |
| FAQ | `/pages/faq` |
| Contact | `/pages/contact` |
| Livraison | `/pages/livraison` |
| Retours | `/pages/retours` |
| Politique de personnalisation | `/pages/personnalisation` |

### Editorial Pages

| Page | URL |
|---|---|
| Blog | `/blog` or `/blogs/michket` |
| Guides cadeaux | `/blogs/michket/guides-cadeaux` |
| Conseils produits | `/blogs/michket/conseils` |
| Histoires de clients | `/blogs/michket/histoires` |
| Notre histoire | `/pages/notre-histoire` |
| Notre savoir-faire | `/pages/savoir-faire` |

---

# 3 — Desktop Header & Mega Menu

## Header Architecture

### Layer 1: Announcement Bar

- **Position**: Top of all pages, persistent
- **Content**: Active promotion with optional countdown timer
- **Example**: "FÊTE DES MÈRES : -30% SUR TOUTES LES LAMPES — Se termine dans 2j 14h 32min"
- **Background**: Deep black (#0A0A0A)
- **Text**: Warm gold (#C9A84C) or white
- **Behavior**: Always visible, dismissible on mobile only
- **Seasonal rotation**: Content changes per campaign

### Layer 2: Main Header

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  [Logo: MICHKET]    LAMPES 3D | TROPHÉES | CARTES | CADEAUX | ... │
│                                                                     │
│                    [🔍 Rechercher] [👤 Compte] [🛒 Panier (3)]     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Left**: Michket wordmark logo (warm gold on dark background, or dark on light)
**Center/Right**: Primary navigation links
**Far Right**: Utility icons — Search, Account, Cart (with item count badge)
**Below nav (optional)**: Secondary links — Nouveautés, Meilleures ventes

### Sticky Header Behavior

- Header becomes fixed at top on scroll
- Announcement bar collapses (optional — hide or keep)
- Main header compacts: logo shrinks, nav may condense to icons-only
- Mega-menus still functional when sticky
- Z-index above all page content

### Mega-Menu Opening Behavior

- **Trigger**: Hover on desktop (no click required)
- **Delay**: 150ms delay before closing when mouse leaves (prevents accidental closure)
- **Animation**: Smooth opacity + slight translateY reveal (not instant pop)
- **Overlay**: Subtle semi-transparent backdrop below mega-menu
- **Close**: Mouse leaves mega-menu area, or click elsewhere, or Escape key
- **Active state**: Nav link shows underline or color change when mega-menu is open

---

## Mega-Menu Structures

### LAMPES 3D PERSONNALISÉES

**Layout**: 3 columns + promotional banner

**Promotional banner** (top, full-width):
- Featured: Cinematic photo of best-selling LED lamp glowing in dark room
- Badge: "BEST SELLER" or "PERSONNALISABLE"
- CTA: "Découvrir"
- Links to featured product page

**Column 1 — Par type** (with thumbnail images):
| Link | Thumbnail |
|---|---|
| Toutes les lampes 3D | — |
| Lampes LED acrylic | Product photo |
| Lampes de naissance | Product photo |
| Lampes d'anniversaire | Product photo |
| Lampes couple | Product photo |
| Lampes sport | Product photo |
| Lampes musical | Product photo |

**Column 2 — Par occasion** (text-only links):
| Link |
|---|
| Anniversaire |
| Mariage / Fiançailles |
| Naissance / Bébé |
| Fête des mères |
| Fête des pères |
| Diplôme / Soutenance |
| Noël / Fêtes |

**Column 3 — Par destinataire** (text-only links):
| Link |
|---|
| Pour elle |
| Pour lui |
| Pour les enfants |
| Pour la maison |
| Pour un couple |
| Idées cadeaux <50€ |

---

### TROPHÉES PERSONNALISÉS

**Layout**: 2 columns + promotional banner

**Promotional banner**:
- Featured: Close-up of trophy with custom engraving
- Badge: "GRAVURE PERSONNALISÉE"
- Links to best-selling trophy

**Column 1 — Par type** (with thumbnail images):
| Link | Thumbnail |
|---|---|
| Tous les trophées | — |
| Trophées sportifs | Product photo |
| Trophées scolaires | Product photo |
| Trophées entreprise | Product photo |
| Plaques commémoratives | Product photo |
| Coupes et médailles | Product photo |

**Column 2 — Par occasion** (text-only links):
| Link |
|---|
| Diplôme / Soutenance |
| BAC / Examen |
| Championnat / Tournoi |
| Remerciement |
| Promotion / Retraite |
| Anniversaire |

---

### CARTES DU MONDE EN BOIS

**Layout**: 3 columns + promotional banner

**Promotional banner**:
- Featured: Wooden map installed on wall in beautifully decorated room
- Badge: "BEST SELLER"
- Links to best-selling map

**Column 1 — Par style** (with thumbnail images):
| Link | Thumbnail |
|---|---|
| Toutes les cartes | — |
| Cartes 3D | Product photo |
| Cartes LED | Product photo |
| Cartes colorées | Product photo |
| Cartes naturelles | Product photo |
| Cartes panneau | Product photo |

**Column 2 — Par taille** (text with dimensions):
| Link | Detail |
|---|---|
| Petite | M — 60×90cm |
| Moyenne | L — 90×150cm |
| Grande | XL — 120×200cm |
| Très grande | 2XL — 160×250cm |

**Column 3 — Par usage** (text-only links):
| Link |
|---|
| Pour le salon |
| Pour la chambre |
| Pour le bureau |
| Pour un restaurant |
| Cadeau |
| Accessoires (pins, épingles) |

---

### CADEAUX

**Layout**: 2-column split — visual occasion tiles (left) + text recipient list (right)

**Left column** (with evocative images):
| Link | Image |
|---|---|
| Cadeaux pour elle | Gift-giving scene |
| Cadeaux pour lui | Gift-giving scene |
| Cadeaux pour les enfants | Children with product |
| Cadeaux pour la maison | Home décor scene |

**Right column** (text-only):
| Link |
|---|
| Moins de 50€ |
| 50€ — 100€ |
| 100€ — 200€ |
| Plus de 200€ |
| Cartes cadeaux |
| Emballage cadeau premium |

---

### OCCASIONS

**Layout**: Full grid of visual occasion tiles (image-rich, 3×5 grid)

Each tile: evocative photo + occasion name + "XX produits" count

| | | |
|---|---|---|
| Anniversaire | Mariage / Fiançailles | Couple / Saint-Valentin |
| Fête des mères | Fête des pères | Naissance / Bébé |
| Diplôme | Soutenance | BAC |
| Enseignant | Médecin / Profession | Football / Sport |
| Remerciement | Noël / Fêtes | Cadeaux personnalisés |

---

### NOUVEAUTÉS

**Layout**: Simple dropdown (flyout menu, no images)

| Link |
|---|
| Toutes les nouveautés |
| Nouvelles lampes |
| Nouveaux trophées |
| Nouvelles cartes |

---

### MEILLEURES VENTES

**Layout**: Simple dropdown (flyout menu)

| Link |
|---|
| Toutes les meilleures ventes |
| Lampes best-sellers |
| Trophées best-sellers |
| Cartes best-sellers |

---

# 4 — Mobile Navigation

## Mobile Header

```
┌───────────────────────────────┐
│ ☰     MICHKET     🔍 🛒(3)   │
└───────────────────────────────┘
```

**Left**: Hamburger icon (☰)
**Center**: Michket logo
**Right**: Search icon (🔍) + Cart icon with item count (🛒(3))

- No account icon on mobile header (accessible via drawer)
- No language/currency selector in header (accessible via drawer)
- Sticky on scroll — compact version

## Full-Height Navigation Drawer

Opens from left, slides over content.

```
┌───────────────────────────────┐
│  [MICHKET]              [✕]  │
├───────────────────────────────┤
│  🔍 Rechercher...             │
├───────────────────────────────┤
│  ▶ MEILLEURES VENTES          │
│  ▶ LAMPES 3D PERSONNALISÉES   │
│  ▶ TROPHÉES PERSONNALISÉS     │
│  ▶ CARTES DU MONDE EN BOIS    │
│  ▶ CADEAUX                    │
│  ▶ NOUVEAUTÉS                 │
│  ─────────────────────────── │
│  ▶ Mon compte                  │
│  ▶ Suivre ma commande          │
│  ▶ FAQ                         │
│  ▶ Nous contacter              │
│  ─────────────────────────── │
│  🌐 FR / EUR                   │
│  📱 Instagram | Facebook       │
└───────────────────────────────┘
```

## Accordion Hierarchy

Each category expands to show subcategories:

```
┌───────────────────────────────┐
│  LAMPES 3D PERSONNALISÉES  ◀ │ ← back to parent
├───────────────────────────────┤
│  ◀ Retour                     │
│  Toutes les lampes            │
│  ─── Par type ───             │
│  ▶ Lampes LED acrylic         │
│  ▶ Lampes de naissance        │
│  ▶ Lampes d'anniversaire      │
│  ▶ Lampes couple              │
│  ▶ Lampes sport               │
│  ─── Par occasion ───         │
│  ▶ Anniversaire               │
│  ▶ Mariage                    │
│  ▶ Naissance                  │
│  ─── Par destinataire ───     │
│  ▶ Pour elle                  │
│  ▶ Pour lui                   │
│  ▶ Pour les enfants           │
└───────────────────────────────┘
```

## Mobile Navigation Rules

- **Touch targets**: Minimum 44px height for every tappable element
- **Back navigation**: Every sub-level shows "◀ Retour" at top
- **Animations**: Smooth slide-in/out, not instant
- **Backdrop**: Semi-transparent overlay behind drawer
- **Scroll**: Drawer is scrollable if content exceeds viewport
- **Promotional block**: Optional 1-2 featured tiles at top of drawer (seasonal)
- **Cart badge**: Shows item count on cart icon in header, even when drawer is open
- **No hover states**: All interactions are tap-based
- **Keyboard**: Escape closes drawer, focus trapped within drawer when open

---

# 5 — Homepage: Definitive Section Sequence

The Michket homepage has **14 sections** — matching the commercial depth of Enjoy The Wood's homepage. This is not a landing page. This is a deep, commercially sequenced homepage for a mature e-commerce brand.

---

### Section 1: Announcement / Promotional Bar

| Property | Detail |
|---|---|
| **Section number** | 1 |
| **Name** | Promotional Bar |
| **Commercial objective** | Create urgency, drive clicks to active promotion |
| **Content** | Seasonal promotion text + optional countdown timer |
| **Headline direction** | "FÊTE DES MÈRES : -30% SUR TOUTES LES LAMPES" |
| **Desktop composition** | Full-width bar, centered text, persistent |
| **Mobile composition** | Full-width bar, compact text, always visible |
| **Interaction** | Clickable — navigates to promoted collection |
| **CTA** | Text link or entire bar is clickable |
| **Photography/assets required** | None (text-based) |
| **Data required** | Active promotion, countdown end date |
| **ETW pattern adapted** | Section 1: Announcement bar with countdown |
| **Michket interpretation** | Rotating seasonal promotions. Countdown only during active sales. Always relevant — never stale. |

---

### Section 2: Premium Navigation Header

| Property | Detail |
|---|---|
| **Section number** | 2 |
| **Name** | Primary Navigation |
| **Commercial objective** | Efficient product discovery from any page |
| **Content** | Logo, primary nav links, utility icons |
| **Desktop composition** | Horizontal nav bar (see Section 3) |
| **Mobile composition** | Compact header with hamburger (see Section 4) |
| **ETW pattern adapted** | Section 2: Primary Navigation Header |
| **Michket interpretation** | Michket logo in warm gold. 7 primary nav items with mega-menus. Search, account, cart utilities. |

---

### Section 3: Hero Merchandising

| Property | Detail |
|---|---|
| **Section number** | 3 |
| **Name** | Hero + Visual Category Discovery |
| **Commercial objective** | Visual impact + multiple entry paths into catalog |
| **Content** | Hero carousel (2-3 slides) + row of 6 circular category links |
| **Products/categories shown** | Hero: flagship product in dramatic lighting. Circles: Lampes 3D, Trophées, Cartes du monde, Cadeaux, Nouveautés, Occasions |
| **Headline direction** | Hero headline: emotional, gift-forward. "Les cadeaux les plus mémorables commencent ici." |
| **Desktop composition** | Full-width hero image (16:9 or 21:9) + 6 circular category links below |
| **Mobile composition** | Full-width hero (4:5 or 9:16) + horizontal scrollable category circles |
| **Interaction** | Carousel auto-rotates with manual nav dots. Circles are tappable links. |
| **CTA** | "Découvrir" or "Personnaliser maintenant" on hero slides |
| **Photography/assets required** | 2-3 cinematic hero images (LED lamp in dark room, trophy in ceremony, map on wall). 6 category thumbnails. |
| **Data required** | Active hero campaigns, category URLs |
| **ETW pattern adapted** | Section 3: Hero Carousel + 6 category discovery circles |
| **Michket interpretation** | Cinematic product photography as hero. Circles link to main product universes + occasions + new arrivals. Emotional, not transactional. |

---

### Section 4: Bestsellers Carousel

| Property | Detail |
|---|---|
| **Section number** | 4 |
| **Name** | Meilleures Ventes |
| **Commercial objective** | Social proof + reduce decision fatigue through proven winners |
| **Content** | Horizontal carousel of 8-12 product cards |
| **Products shown** | Top-selling lamps, trophies, maps — mixed across categories |
| **Headline** | "NOS MEILLEURES VENTES" with "Tout voir →" link |
| **Desktop composition** | Horizontal scrollable carousel, 4 visible cards |
| **Mobile composition** | Horizontal swipeable carousel, 1.5 visible cards |
| **Interaction** | Arrow navigation (desktop), swipe (mobile) |
| **CTA** | "Tout voir" link to bestsellers collection |
| **Photography/assets required** | Product photography for each bestseller (2 images per product: primary + hover alternate) |
| **Data required** | Bestseller product list, pricing, discount percentages, badge assignments |
| **ETW pattern adapted** | Section 4: Bestsellers Carousel with 9 products |
| **Michket interpretation** | Cards show: product image, badge (BEST SELLER), title, sale price, regular price (struck), discount %. Alternating lamp/trophy/map to show range. |

---

### Section 5: Visual Category Spotlight

| Property | Detail |
|---|---|
| **Section number** | 5 |
| **Name** | Nos Univers |
| **Commercial objective** | Visual discovery for main product universes |
| **Content** | 3 large atmospheric image cards in a row |
| **Categories shown** | 1. Lampes 3D personnalisées 2. Trophées personnalisés 3. Cartes du monde en bois |
| **Headline** | "NOS UNIVERS" |
| **Desktop composition** | 3 equal-width cards, cinematic product photography |
| **Mobile composition** | Vertical stack of 3 full-width cards |
| **Interaction** | Click navigates to collection |
| **CTA** | Collection name + brief descriptor on each card |
| **Photography/assets required** | 3 atmospheric product images (lamp glowing, trophy close-up, map on wall) |
| **Data required** | Collection URLs |
| **ETW pattern adapted** | Section 5: Category Spotlight Grid (3 cards) |
| **Michket interpretation** | Each card is editorial — product in situ, not on white background. Descriptor: "Éclat personnalisé pour chaque moment" / "La reconnaissance, gravée dans le bois" / "Votre monde, sur votre mur." |

---

### Section 6: Social Proof / Trust

| Property | Detail |
|---|---|
| **Section number** | 6 |
| **Name** | La Confiance Michket |
| **Commercial objective** | Build trust through aggregate social proof |
| **Content** | Star rating aggregate, review count, review platform logos, trust metrics |
| **Headline direction** | "Plus de X clients satisfaits" (placeholder until real data) |
| **Desktop composition** | Centered: aggregate stars + count. Below: 4 trust icons (livraison, garantie, paiement, personnalisation) |
| **Mobile composition** | Same, stacked vertically |
| **Interaction** | Clickable — navigates to reviews page |
| **CTA** | "Voir tous les avis" |
| **Photography/assets required** | Trust icons (custom or library), review platform logos |
| **Data required** | Total review count, average rating, review platform integration |
| **ETW pattern adapted** | Section 6: Social Proof / Trust Section |
| **Michket interpretation** | Aggregate rating from chosen review platform. 4 value icons: "Livraison gratuite," "Garantie à vie," "Paiement sécurisé," "100% personnalisé." Real numbers only — never fabricated. |

---

### Section 7: New Arrivals

| Property | Detail |
|---|---|
| **Section number** | 7 |
| **Name** | Nouveautés |
| **Commercial objective** | Drive traffic to fresh inventory, create return-visit incentive |
| **Content** | Horizontal carousel of 8-12 new products |
| **Headline** | "NOUVEAUTÉS" with "Tout voir →" link |
| **Desktop composition** | Horizontal carousel, 4 visible cards |
| **Mobile composition** | Horizontal swipe, 1.5 visible cards |
| **Interaction** | Arrow/swipe navigation |
| **CTA** | "Tout voir" link |
| **Photography/assets required** | Product photography for new items |
| **Data required** | New arrival product list (sorted by date added) |
| **ETW pattern adapted** | Section 7: New Arrivals Carousel |
| **Michket interpretation** | Badge: NOUVEAU. Fresh seasonal photography. If no new arrivals yet, this section can be hidden. |

---

### Section 8: Shopping by Occasion

| Property | Detail |
|---|---|
| **Section number** | 8 |
| **Name** | Cadeaux par Occasion |
| **Commercial objective** | Occasion-based gift discovery — primary commerce mechanism |
| **Content** | Grid of occasion cards with evocative imagery |
| **Occasions shown** | Anniversaire, Mariage, Couple, Maman, Papa, Naissance, Diplôme, Soutenance, BAC, Enseignant, Médecin, Sport, Remerciement |
| **Headline** | "TROUVEZ LE CADEAU PARFAIT" |
| **Desktop composition** | 4-column grid of cards (3-4 rows) |
| **Mobile composition** | 2-column grid, horizontally scrollable rows |
| **Interaction** | Click navigates to occasion collection |
| **CTA** | Occasion name + "XX produits" on each card |
| **Photography/assets required** | 13 occasion images (emotional, not product-on-white) |
| **Data required** | Occasion collection URLs, product counts |
| **ETW pattern adapted** | Gift Shop occasion tiles (8 categories) — expanded to 13+ for Michket |
| **Michket interpretation** | Each card is emotionally evocative — a graduation scene, a wedding moment, a baby photo. Not product thumbnails. The goal is: "I know exactly who this is for." |

---

### Section 9: Before/After Transformation

| Property | Detail |
|---|---|
| **Section number** | 9 |
| **Name** | Avant / Après |
| **Commercial objective** | Show dramatic product impact, trigger emotional response |
| **Content** | Interactive slider — empty space vs. product installed |
| **Headline** | "Votre mur mérite mieux." |
| **Desktop composition** | Full-width interactive slider with draggable divider |
| **Mobile composition** | Full-width slider, touch-draggable |
| **Interaction** | User drags vertical divider to compare before/after |
| **CTA** | "Personnaliser le vôtre →" |
| **Photography/assets required** | 2 matched images: empty wall (before) + same wall with Michket product (after). Both from same angle, same lighting. |
| **Data required** | Product URL for CTA |
| **ETW pattern adapted** | Section 9: Before/After Interactive Slider |
| **Michket interpretation** | First before/after: LED lamp illuminating a dark room. Second before/after: wooden map transforming a bare wall. Could be a carousel of multiple transformations. |

---

### Section 10: Brand Value Proposition / Craftsmanship

| Property | Detail |
|---|---|
| **Section number** | 10 |
| **Name** | Notre Savoir-Faire |
| **Commercial objective** | Justify premium positioning, communicate brand values |
| **Content** | 4-5 value propositions with icons + craftsmanship imagery |
| **Headline** | "L'EXCELLENCE DANS CHAQUE DÉTAIL" |
| **Values shown** | 1. 100% personnalisé et artisanal 2. Garantie à vie 3. Expédition mondiale rapide 4. Emballage cadeau premium 5. Paiement sécurisé |
| **Desktop composition** | Left: editorial text + value icons. Right: craftsmanship image or short video |
| **Mobile composition** | Stacked: headline, icons grid, image |
| **Interaction** | Static or subtle scroll-reveal |
| **CTA** | "En savoir plus sur nous →" |
| **Photography/assets required** | 1 craftsmanship image (hands working on product, material close-up) or 15-30s product video |
| **Data required** | Brand values text |
| **ETW pattern adapted** | Section 10: Brand Value Proposition |
| **Michket interpretation** | Values are Michket-specific. Iconography should be custom, not generic Lucide icons. Image/video shows the making process — human hands, materials, care. |

---

### Section 11: Customer Inspiration / UGC

| Property | Detail |
|---|---|
| **Section number** | 11 |
| **Name** | Inspiré par Vous |
| **Commercial objective** | Authentic social proof through real customer homes |
| **Content** | Horizontal carousel of 9-12 customer photos |
| **Headline** | "INSPIRÉ PAR VOUS" with "Voir tout →" link |
| **Desktop composition** | Horizontal scrollable gallery, 3-4 visible photos |
| **Mobile composition** | Horizontal swipe, 1-2 visible photos |
| **Interaction** | Horizontal scroll, click navigates to product |
| **CTA** | Product name overlaid on each photo + "Voir le produit" |
| **Photography/assets required** | Customer-submitted photos (initially seed with 12+ photos) |
| **Data required** | Customer photos with product links |
| **ETW pattern adapted** | Section 11: Customer Inspiration / UGC Gallery |
| **Michket interpretation** | Real customer homes, real products. Photos show: LED lamp glowing at night, map installed in living room, trophy on desk. Each photo is clickable to the product. "#MichketMoment" hashtag campaign. |

---

### Section 12: Editorial / Blog Content

| Property | Detail |
|---|---|
| **Section number** | 12 |
| **Name** | Le Blog Michket |
| **Commercial objective** | Content marketing, SEO, brand authority, return visits |
| **Content** | 3 blog post preview cards |
| **Headline** | "CONSEILS & INSPIRATION" with "Tout voir →" link |
| **Card content** | Featured image + category tag + title + short excerpt |
| **Desktop composition** | 3 cards in a row |
| **Mobile composition** | Vertical stack of 3 cards or horizontal swipe |
| **Interaction** | Click navigates to blog post |
| **CTA** | "Lire l'article →" |
| **Photography/assets required** | 3 blog featured images |
| **Data required** | Blog posts (gift guides, product care, brand stories) |
| **ETW pattern adapted** | Section 12: Blog / Editorial Section |
| **Michket interpretation** | Content categories: Guides cadeaux, Conseils produits, Histoires de clients. Example posts: "Les 10 meilleurs cadeaux pour la fête des mères," "Comment installer votre carte du monde en bois," "Les moments qui comptent — histoires Michket." |

---

### Section 13: Newsletter Signup

| Property | Detail |
|---|---|
| **Section number** | 13 |
| **Name** | Newsletter |
| **Commercial objective** | Lead generation, email capture, first-purchase incentive |
| **Content** | Incentive headline + email input + CTA |
| **Headline** | "10% DE REMISE SUR VOTRE PREMIÈRE COMMANDE" |
| **Supporting text** | "Inscrivez-vous pour recevoir votre code promo et nos meilleures offres." |
| **Desktop composition** | Centered block with warm ivory background |
| **Mobile composition** | Same, full-width |
| **Interaction** | Email input + submit |
| **CTA** | "J'EN PROFITE" |
| **Trust note** | "Pas de spam. Désabonnement en un clic." |
| **Photography/assets required** | None (text-based) |
| **Data required** | Email marketing integration (Klaviyo, Mailchimp, etc.) |
| **ETW pattern adapted** | Section 13: Newsletter Signup |
| **Michket interpretation** | 10% incentive. Warm ivory background section. No popup on first visit — only after scroll depth or exit intent (configurable). |

---

### Section 14: Comprehensive Footer

| Property | Detail |
|---|---|
| **Section number** | 14 |
| **Name** | Footer |
| **Commercial objective** | Site-wide navigation, trust signals, newsletter capture, legal |
| **Content** | 6-column sitemap + newsletter + social + payments + legal |
| **Desktop composition** | 6-column grid (see Footer section) |
| **Mobile composition** | Accordion/collapsible sections |
| **ETW pattern adapted** | Section 14: Comprehensive Footer |
| **Michket interpretation** | Full footer architecture — see Section 19. |

---

# 6 — Collection Page System

## Collection Page Template

All collection pages follow a consistent template with category-specific content.

### Standard Elements (All Collections)

| # | Element | Description |
|---|---|---|
| 1 | Breadcrumbs | `ACCUEIL > [Parent] > [Collection]` |
| 2 | Collection header | Name + hero image + brief description |
| 3 | Subcategory carousel | Horizontal scrollable tiles linking to sub-collections |
| 4 | Product count | "XX produits" |
| 5 | Filter bar | "Filtres" button + active filter chips + "Trier par" |
| 6 | Product grid | Responsive grid of product cards |
| 7 | Load more | "Voir plus" button (or infinite scroll on mobile) |
| 8 | Editorial content | SEO-optimized text about the collection |
| 9 | FAQ (optional) | Accordion-style questions specific to collection |
| 10 | Trust signals | Review aggregate, value icons |

### Collection-Specific Variations

#### A. Lampes 3D Personnalisées

| Element | Variation |
|---|---|
| Hero image | Cinematic lamp photo (glowing, dark environment) |
| Description | "Découvrez nos lampes 3D personnalisées — chaque lampe raconte une histoire." |
| Subcategories | LED acrylic, Naissance, Anniversaire, Couple, Sport, Musical |
| Filters | Type de lampe, Occasion, Couleur de lumière, Prix, Disponibilité |
| Editorial content | How LED lamps work, personalization options, room-size guidance |
| FAQ | "Comment fonctionne la lumière LED?", "Quelles sont les options de personnalisation?", "Combien de temps dure la fabrication?" |

#### B. Trophées Personnalisés

| Element | Variation |
|---|---|
| Hero image | Trophy with visible engraving in ceremony setting |
| Description | "La reconnaissance mérite mieux qu'un simple objet. Chaque trophée Michket porte un message." |
| Subcategories | Sportifs, Scolaires, Entreprise, Plaques commémoratives, Coupes |
| Filters | Type de trophée, Occasion, Matériau, Prix, Disponibilité |
| Editorial content | Engraving options, event-type guidance, size guide |
| FAQ | "Que peut-on graver?", "Quel est le délai de fabrication?", "Livrez-vous pour les événements?" |

#### C. Cartes du Monde en Bois

| Element | Variation |
|---|---|
| Hero image | Map installed on wall in beautifully decorated room |
| Description | "Votre monde, sur votre mur. Cartes artisanales en bois, disponibles en plusieurs tailles et styles." |
| Subcategories | 3D, LED, Colorées, Naturelles, Panneau |
| Filters | Style, Taille, Couleur, Prix, Disponibilité |
| Editorial content | Size guide with room recommendations, installation guide, style comparison |
| FAQ | "Quelle taille choisir pour mon salon?", "Comment installer la carte?", "Les cartes LED fonctionnent-elles avec une prise standard?" |

#### D. Cadeaux par Occasion

| Element | Variation |
|---|---|
| Hero image | Emotional gift-giving scene |
| Description | "Le cadeau parfait existe. Trouvez-le par occasion." |
| Occasion tiles | Visual grid of 13+ occasion cards (see Section 5, Section 8) |
| Filters | Occasion, Type de produit, Destinataire, Prix |
| Editorial content | Gift guides per occasion |
| FAQ | "Combien de temps avant l'occasion commander?", "Puis-je ajouter un message cadeau?", "L'emballage cadeau est-il disponible?" |

#### E. Recipient Collections

| Element | Variation |
|---|---|
| Hero image | Recipient-appropriate scene (e.g., woman receiving lamp, child with trophy) |
| Description | "Des cadeaux pensés pour [elle/lui/les enfants/la maison]." |
| Products | Cross-category (lamps + trophies + maps appropriate for recipient) |
| Filters | Type de produit, Prix, Occasion |

#### F. Search Results

| Element | Variation |
|---|---|
| Header | "Résultats pour « [query] »" + count |
| Filters | Same as collection filters |
| Product grid | Same card system |
| No-results state | "Aucun résultat pour « [query] »" + suggestions + popular searches |

---

# 7 — Product Card Specification

## Michket Product Card System

The product card is used across all collection pages, carousels, search results, recommendations, and cart. One unified system.

### Card Layout

```
┌───────────────────────────┐
│ [BADGE]            [♡]    │
│                           │
│     [PRIMARY IMAGE]       │
│     (on hover: ALT IMAGE) │
│                           │
├───────────────────────────┤
│ ★★★★★ (4.9) · 247 avis   │
│ Produit Title Here        │
│ 49,90 €  79,90 €  -37%   │
└───────────────────────────┘
```

### Elements

| Element | Specification |
|---|---|
| **Image ratio** | 1:1 (square) for grids. 4:5 (portrait) optional for emotional products on homepage. |
| **Primary image** | Product photo, white or dark background |
| **Secondary image** | Alternate view (product in room, different angle, on/off for lamps). Appears on hover (desktop). |
| **Badge** | Top-left corner. Types: BEST SELLER (warm gold bg), NOUVEAU (green bg), PROMO (red bg), PERSONNALISABLE (amber bg), ENVOI GRATUIT (green bg) |
| **Wishlist icon** | Top-right corner. Heart outline → filled on click. Appears on hover (desktop), always visible (mobile). |
| **Review stars** | Below image. Small star icons + numeric rating + review count. "★ 4.9 (247 avis)" |
| **Title** | Product name, 1-2 lines max, ellipsis overflow. |
| **Subtitle** | Optional. Variant summary: "Couleur: Rose · Taille: M" or "Personnalisable" |
| **Current price** | Large, bold. "49,90 €" |
| **Compare-at price** | Smaller, struck through. "79,90 €" |
| **Discount badge** | Inline with prices. "-37%" in red or accent color. |
| **Quick-add rules** | On hover (desktop): "Ajouter au panier" button appears at bottom of card. Only for non-personalized items or accessories. Personalized products: navigate to PDP. |
| **Swatches** | Optional. Small color dots below title for available colors. Not on all cards — only when color is a key variant. |

### Card States

| State | Behavior |
|---|---|
| **Default** | Primary image, all elements visible |
| **Hover (desktop)** | Secondary image fades in. Wishlist icon appears. Quick-add button appears (if applicable). |
| **Mobile** | No hover. Single image. Wishlist icon always visible. No quick-add for personalized products. |
| **Loading** | Skeleton card with shimmer animation |
| **Out of stock** | "Rupture de stock" overlay on image. Price still visible. CTA disabled. |

### Card Sizing

| Context | Desktop | Tablet | Mobile |
|---|---|---|---|
| Collection grid (default) | 4 columns | 3 columns | 2 columns |
| Collection grid (compact) | 5 columns | 4 columns | 2 columns |
| Carousel | Fixed width ~280px | Fixed width ~240px | Fixed width ~160px |
| Recommendations | 4 visible | 3 visible | 1.5 visible (swipe) |

### Spacing

- Card gap: 16px (desktop), 12px (mobile)
- Card padding: 0 (image fills card edge-to-edge)
- Content padding: 12px below image

### Anti-Generic Rules for Cards

- **No rounded-2xl corners everywhere** — use subtle radius (8-12px) or mix sharp/soft
- **No glassmorphism** — solid backgrounds only
- **No excessive shadows** — subtle border or no border, not heavy box-shadow
- **Image is dominant** — not cramped inside a tiny box
- **Typography is intentional** — not system font defaults
- **Badge colors are Michket brand colors** — not random palette colors

---

---

# 8 — PDP: Personalized 3D LED Lamp

This is the most complex product page in the Michket catalog. The lamp PDP must handle a **staged personalization configurator** as its core experience.

## Page Architecture (Top to Bottom)

### 1. Breadcrumbs

```
ACCUEIL > LAMPES 3D PERSONNALISÉES > [Collection] > [Product Name]
```

### 2. Product Media Gallery

**Layout**: Left gallery (60%) + Right info (40%) on desktop. Stacked on mobile.

| Element | Specification |
|---|---|
| Image count | 10-15+ images minimum |
| Main image | Large, high-resolution, fills gallery area |
| Thumbnail strip | Horizontal scrollable below main image (desktop). Hidden on mobile (swipe gallery). |
| Video | At least 1 video showing lamp illumination modes, RGB cycling, room ambiance |
| Zoom | Hover zoom (desktop), pinch-to-zoom (mobile) |
| Lightbox | Click main image → full-screen lightbox with arrow navigation |
| Image types required | 1. Product on dark background (hero) 2. Product in room setting (lifestyle) 3. Close-up of acrylic detail 4. Close-up of LED glow 5. Product OFF state 6. Product ON state (each color) 7. Base detail 8. Personalization examples 9. Packaging/unboxing 10. Size comparison 11. Video thumbnail |

**ETW pattern**: Gallery from 3D Map PDP — 13+ images, video thumbnail, zoom, lightbox.

### 3. Product Title & Badges

- **Title**: Descriptive, keyword-rich. "Lampe LED 3D Personnalisée — [Model Name]"
- **Badges**: Row of 2-3 badges below title
  - PERSONNALISABLE (amber)
  - BEST SELLER or NOUVEAU (as applicable)
  - ENVOI GRATUIT (if applicable)

### 4. Reviews Summary

- Aggregate star rating: ★★★★★ 4.9/5 (247 avis)
- Clickable — scrolls to reviews section below
- Small, compact, non-intrusive

### 5. Pricing

- **Sale price**: Large, prominent. "49,90 €"
- **Regular price**: Smaller, struck through. "79,90 €"
- **Discount badge**: "-37%" inline
- Price updates if personalization affects pricing (e.g., photo upload = +5€)

### 6. Personalization Configurator

This is the CORE of the lamp PDP. See Section 11 for full configurator specification. On the PDP, it appears as:

**Desktop**: Inline configurator below pricing, taking full right column width.

**Mobile**: Accordion-step configurator below pricing (see Section 12).

The configurator covers:

| Step | Controls |
|---|---|
| 1. Modèle | Visual cards: Étoile, Cœur, Note de musique, Football, etc. |
| 2. Couleur de lumière | Color swatches: Cyan, Rose, Bleu, Blanc, RGB, Magenta |
| 3. Base | Visual options: Bois, Acrylique, etc. |
| 4. Taille | Size buttons: S, M, L (with dimensions) |
| 5. Texte personnalisé | Text input with character counter |
| 6. Noms | Text input(s) for names |
| 7. Date | Date input or text field |
| 8. Photo (optionnel) | Upload zone with preview |
| 9. Instructions (optionnel) | Text area for special requests |

### 7. Preview

- Live or near-live preview of personalized product
- **Desktop**: Sticky preview panel on left side of configurator
- **Mobile**: Preview thumbnail in sticky bar at top
- Preview shows: selected model, light color, text placement, uploaded photo
- "Voir en grand" button to expand preview to full screen

### 8. Purchase Controls

- **Quantity selector**: [-] 1 [+] with limits (max 10 for personalized items)
- **Add to Cart**: Large gold/warm CTA button. Disabled until all required configurator steps are complete. Text: "Ajouter au panier — 49,90 €"
- **Express checkout**: Shop Pay, Apple Pay, Google Pay icons below CTA
- **Wishlist**: Heart icon (optional)

### 9. Delivery Information

- **Production time**: "Fabrication : 3-5 jours ouvrés"
- **Shipping estimate**: "Livraison estimée : [date range]" (calculated from production time + shipping)
- **Shipping cost**: "Livraison gratuite dès 100€" or calculated cost
- **Shipping methods**: Standard / Express options

### 10. Trust Near CTA

Row of trust icons directly below Add to Cart:

| Icon | Text |
|---|---|
| 🚚 | Livraison gratuite dès 100€ |
| 🔒 | Paiement 100% sécurisé |
| ⭐ | Garantie à vie |
| ↩️ | Retour sous 30 jours |
| ✋ | Fait main avec amour |

### 11. Product Description (Accordion)

Detailed product story:

- **Opening paragraph**: Emotional framing — "Cette lampe n'est pas juste un objet. C'est un moment."
- **Features**: LED technology, light modes, remote control (if applicable), material quality
- **Personalization possibilities**: What can be customized, examples
- **Room suggestions**: Where to place it, room-size guidance
- **Gift framing**: "Le cadeau parfait pour..."

### 12. Specifications (Accordion)

| Spec | Example |
|---|---|
| Matériau | Acrylique + bois |
| Dimensions | 20cm × 15cm × 8cm |
| Poids | 350g |
| Source lumineuse | LED RGB |
| Modes lumineux | 7 modes (fixe, transition, pulse, etc.) |
| Alimentation | USB 5V / adaptateur mural |
| Durée de vie LED | 50 000 heures |
| Langues disponibles | Français, Anglais, Arabe |
| Délai de fabrication | 3-5 jours ouvrés |

### 13. Dans la Boîte (Accordion)

What's included, with icons:

| Item | Detail |
|---|---|
| Lampe LED 3D | Le produit personnalisé |
| Base | Base sélectionnée |
| Câble USB | Alimentation |
| Télécommande | Si applicable |
| Instructions | Guide d'utilisation |
| Emballage cadeau | Boîte premium Michket |

### 14. Before/After Slider

- Interactive transformation: desk/room before lamp vs. after lamp illuminated
- Same pattern as homepage Section 9
- Product-specific — shows THIS lamp in a real room

### 15. Customer Reviews

- Aggregate rating summary with distribution bar chart
- Individual reviews: star rating, verified badge, name, date, text, customer photos
- Review filters: by rating, with photos, verified only
- Photo review gallery with lightbox
- "Écrire un avis" CTA

### 16. Customer Photos (UGC)

- Grid of customer-submitted photos showing THIS product in real homes
- Linked to product pages
- "Partagez votre Michket" community prompt

### 17. Related Products

- "Vous aimerez aussi" — carousel of related lamps, complementary products
- Mix of: similar models, different occasions, accessories

### 18. Recently Viewed

- "Récemment consultés" — carousel of previously viewed products
- Helps returning visitors pick up where they left off

### 19. FAQ (Accordion)

Product-specific questions:

| Question | Answer |
|---|---|
| "Combien de temps dure la fabrication?" | "3-5 jours ouvrés pour la personnalisation." |
| "Puis-je changer le texte après commande?" | "Contactez-nous dans les 24h." |
| "La lampe fonctionne-t-elle en battery?" | "Non, elle nécessite une alimentation USB." |
| "Quelles sont les options de lumière?" | "7 modes LED RGB avec télécommande." |

### 20. Blog / Editorial

- 3 related blog posts: gift guides, product care, installation tips

### 21. Newsletter

- Standard newsletter signup section

---

# 9 — PDP: Personalized Trophy

The trophy PDP shares structure with the lamp PDP but has distinct personalization and content.

## Key Differences from Lamp PDP

| Aspect | Lamp PDP | Trophy PDP |
|---|---|---|
| Gallery emphasis | Glow, illumination, dark scenes | Engraving detail, ceremony, desk display |
| Personalization | Model + light + text + photo | Text engraving + logo/photo upload |
| Variant complexity | High (model, color, base, size, text) | Medium (model, size, material) |
| Trust signal | LED quality, light modes | Handcrafted quality, engraving precision |
| Production time | 3-5 jours ouvrés | 5-7 jours ouvrés |
| Description style | Emotional, atmospheric | Achievement, recognition, pride |
| Before/after | Room transformation | Plain trophy → engraved trophy |

## Trophy-Specific Configurator Steps

| Step | Controls |
|---|---|
| 1. Modèle | Visual cards: Coupe, Plaque, Étoile, Médaille, Cristal |
| 2. Matériau / Couleur | Options: Bois, Acrylique, Cristal, Or, Argent |
| 3. Taille | S, M, L with dimensions |
| 4. Texte principal | Name / title / achievement text |
| 5. Date | Event date |
| 6. Texte secondaire | Additional engraving (organization, message) |
| 7. Logo / Photo (optionnel) | Upload with preview and crop |
| 8. Langue | Français, Anglais, Arabe |
| 9. Type d'événement | Diplôme, Soutenance, BAC, Championnat, Remerciement |

## Trophy-Specific Content

### Gallery Images Required

1. Trophy hero on dark background
2. Close-up of engraving detail
3. Trophy in ceremony setting
4. Multiple trophies on shelf (collection)
5. Close-up of material texture
6. Size comparison
7. Packaging

### Specifications

| Spec | Detail |
|---|---|
| Matériau | Bois / Acrylique / Cristal |
| Dimensions | [varies by model] |
| Gravure | Texte laser personnalisé |
| Couleurs disponibles | Or, Argent, Bois naturel, Noir |
| Délai de fabrication | 5-7 jours ouvrés |
| Langues | Français, Anglais, Arabe |

### Trust Near CTA

| Icon | Text |
|---|---|
| ✋ | Gravure artisanale |
| 🔒 | Paiement sécurisé |
| ⭐ | Garantie de satisfaction |
| ↩️ | Retour 30 jours |
| 🚚 | Livraison express disponible |

---

# 10 — PDP: Wooden World Map

The map PDP draws heavily from Enjoy The Wood's 3D Map PDP — the most deeply documented product page in the research.

## Key Characteristics

| Aspect | Specification |
|---|---|
| Variant complexity | High (size + style + language + accessories) |
| Gallery emphasis | Room settings, scale comparison, detail |
| Trust signal | Handcrafted quality, international patent (if applicable) |
| Description style | Editorial, room-transforming, aspirational |
| Cross-sell | Accessories (pins, mounting kit), other map styles |
| Video | Installation guide video expected |
| Before/after | Core — wall transformation |

## Map-Specific Configurator Steps

| Step | Controls |
|---|---|
| 1. Style | Visual cards: 3D, LED, Colorée, Naturelle, Panneau |
| 2. Taille | Size buttons with dimensions + room recommendation |
| 3. Langue | Dropdown: Français, Anglais, Arabe, Espagnol, Allemand |
| 4. Personnalisation (optionnel) | Add names to countries/regions, custom text |
| 5. Accessoires (optionnel) | Pins, mounting kit, LED lighting |

## Size Guide (Inline on PDP)

| Size | Dimensions | Room Recommendation |
|---|---|---|
| M | 60×90cm | Chambre, bureau, couloir |
| L | 90×150cm | Salon moyen, chambre spacieuse |
| XL | 120×200cm | Grand salon, espace professionnel |
| 2XL | 160×250cm | Grand salon, hall, espace commercial |

## Map Styles Section

Visual carousel showing each style with description:

| Style | Description |
|---|---|
| 3D | Multi-couche, effetto de profondeur |
| LED | Illumination intégrée, ambiance nocturne |
| Colorée | Paysages en couleur, carte vivante |
| Naturelle | Bois brut, finition artisanale |
| Panneau | Sur support rigide, prêt à accrocher |

## Map-Specific Content

### Gallery Images Required

1. Map hero on wall (hero shot)
2. Room setting — living room
3. Room setting — bedroom
4. Room setting — office
5. Close-up of wood layers (3D detail)
6. Close-up of LED illumination (if LED variant)
7. Size comparison against room
8. Installation process
9. Mounting hardware
10. Packaging

### Before/After

- Interactive slider: bare wall → wall with map installed
- Same map, same room, dramatic transformation

### Installation Content

Two mounting methods documented:
1. Adhesive tape (for lighter maps)
2. Anchor bolts with gap from wall (for heavier/larger maps)

Include installation guide video.

### "In The Box" Section

| Item | Detail |
|---|---|
| Carte du monde | La carte assemblée |
| Accessoires | Noms des océans, décorations, boussole |
| Kit de fixation | Adhésif ou pitons selon taille |
| Instructions | Guide d'installation |
| Emballage | Boîte de transport renforcée |

---

# 11 — Personalization Configurator (Cross-Product)

This is one of the MOST IMPORTANT parts of the Michket experience. The configurator must feel **premium, intuitive, and progressive** — not like a long ugly form.

## Core Principles

1. **One decision at a time** — never overwhelm with all fields at once
2. **Progress is visible** — user always knows where they are
3. **Preview is live** — every change updates the preview
4. **Required vs optional is clear** — never block purchase for optional fields
5. **Error prevention** — validate before submission, not after
6. **Mobile-first** — if it works on mobile, it works everywhere

## Staged Configurator Flow

### Step 1 — Choose Design / Model

- Visual cards showing available models
- Each card: product image + name + brief description
- Selection updates preview immediately
- Desktop: grid of cards inline
- Mobile: horizontal swipeable cards or bottom sheet

### Step 2 — Choose Physical Options

- Size, base, material, color
- Visual selectors (button groups, color swatches)
- Each selection updates preview
- Desktop: inline controls
- Mobile: bottom sheet for complex selections (color), inline for simple (size)

### Step 3 — Add Personalized Content

- Text inputs with character counters
- Font selection (where applicable)
- Language selection
- Desktop: inline form fields
- Mobile: full-width inputs, large touch targets

### Step 4 — Upload Photo / File (If Necessary)

- Drag-and-drop zone + file picker
- Supported formats: JPG, PNG, SVG
- File size limit: 10MB
- Image preview with crop tool
- Desktop: inline upload zone
- Mobile: camera roll or file picker

### Step 5 — Preview

- Live preview panel showing current configuration
- Desktop: sticky preview panel on left side
- Mobile: preview thumbnail in sticky bar at top
- "Voir en grand" to expand to full screen

### Step 6 — Validate Personalization

- Confirmation summary: all selected options displayed
- Character count validation
- Photo quality check (resolution warning if too low)
- "Confirmer ma personnalisation" CTA

### Step 7 — Add to Cart

- CTA becomes active only after validation
- Button shows configured price
- "Ajouter au panier — 49,90 €"
- Triggers cart drawer slide-in

## Desktop Interaction Model

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌─────────────────┐  ┌──────────────────────────────────┐  │
│  │                 │  │  PERSONNALISATION                 │  │
│  │   [PREVIEW]     │  │                                  │  │
│  │                 │  │  ✓ 1. Modèle: Étoile             │  │
│  │   Lampe LED     │  │  ▼ 2. Couleur de lumière         │  │
│  │   Étoile        │  │    [Cyan] [Rose] [Bleu] [Blanc]  │  │
│  │   Rose          │  │    [RGB] [Magenta]               │  │
│  │                 │  │                                  │  │
│  │   "Joyeux      │  │  ○ 3. Base                       │  │
│  │    Anniv.       │  │  ○ 4. Texte personnalisé         │  │
│  │    Marie"       │  │  ○ 5. Noms                      │  │
│  │                 │  │  ○ 6. Date                       │  │
│  │                 │  │  ○ 7. Photo (optionnel)          │  │
│  │                 │  │                                  │  │
│  │                 │  │  ─────────────────────────────── │  │
│  │                 │  │  Sous-total: 49,90 €             │  │
│  │                 │  │  Fabrication: 3-5 jours ouvrés   │  │
│  │                 │  │  [  AJOUTER AU PANIER  ]         │  │
│  └─────────────────┘  └──────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Mobile Interaction Model

```
┌───────────────────────────────┐
│ [Tiny preview] Configuration │ ← sticky preview bar
│═══════════════════════════════│
│                               │
│ ✓ 1. Modèle: Étoile          │ ← completed (collapsed)
│                               │
│ ▼ 2. Couleur de lumière      │ ← current (expanded)
│   ┌─────┐ ┌─────┐ ┌─────┐   │
│   │Cyan │ │Rose │ │Bleu │   │
│   └─────┘ └─────┘ └─────┘   │
│   ┌─────┐ ┌─────┐ ┌─────┐   │
│   │Blanc│ │ RGB │ │Magma│   │
│   └─────┘ └─────┘ └─────┘   │
│                               │
│ ○ 3. Base                    │ ← future (collapsed)
│ ○ 4. Texte personnalisé      │
│ ○ 5. Noms                    │
│ ○ 6. Date                    │
│ ○ 7. Photo (optionnel)       │
│                               │
│═══════════════════════════════│
│ 49,90 €  Fabrication: 3-5j   │ ← sticky CTA bar
│ [    AJOUTER AU PANIER    ]   │
└───────────────────────────────┘
```

## Validation Rules

| Field | Rule | Error Message |
|---|---|---|
| Modèle | Required | "Choisissez un modèle" |
| Couleur de lumière | Required | "Choisissez une couleur" |
| Base | Required | "Choisissez une base" |
| Texte personnalisé | Required, max 50 chars | "Ajoutez un texte (max 50 caractères)" |
| Noms | Required, max 20 chars per name | "Ajoutez un nom (max 20 caractères)" |
| Date | Optional | — |
| Photo | Optional, JPG/PNG, max 10MB | "Format: JPG ou PNG. Taille max: 10MB." |

## Incomplete Personalization Handling

- **In cart**: If personalization is incomplete, cart shows warning: "Personnalisation incomplète — retourner au produit"
- **At checkout**: Blocked. Cannot proceed with incomplete personalization.
- **Saved drafts**: Optional — allow users to save configuration and return later

## Arabic/French Text Considerations

- Arabic text: Right-to-left support in preview
- French accents: Proper character encoding (é, è, ê, ë, ç, à, etc.)
- Font selection: Must include fonts that support Arabic script
- Character counting: Count correctly for accented characters

---

# 12 — Mobile PDP / Configurator

The mobile PDP is designed independently from desktop. It is not a shrunken desktop — it is a first-class mobile experience.

## Mobile PDP Section Ordering

| # | Section | Behavior |
|---|---|---|
| 1 | Swipeable gallery | Horizontal swipe, dot indicators, pinch-to-zoom |
| 2 | Title + badges | Stacked vertically |
| 3 | Reviews summary | Star rating + count, tappable to scroll to reviews |
| 4 | Pricing | Large sale price, struck regular price, discount % |
| 5 | Configurator (accordion steps) | See below |
| 6 | Preview | Sticky thumbnail at top |
| 7 | Trust icons | Row of value propositions |
| 8 | Delivery messaging | Production time + shipping estimate |
| 9 | Accordions | Description, Specs, In the Box, FAQ |
| 10 | Before/After slider | Touch-draggable |
| 11 | Customer reviews | Scrollable |
| 12 | Customer photos | Horizontal swipe |
| 13 | Recommendations | "Vous aimerez aussi" carousel |
| 14 | Blog posts | Related articles |
| 15 | Newsletter | Standard signup |

## Mobile Configurator as Accordion Steps

Each step is a collapsible accordion. When the user completes a step, it collapses with a checkmark and the next step auto-expands.

```
┌───────────────────────────────┐
│ ✓ Modèle: Étoile              │ ← collapsed, completed
├───────────────────────────────┤
│ ▼ Couleur de lumière          │ ← expanded, current
│                               │
│   [Cyan] [Rose] [Bleu]       │
│   [Blanc] [RGB] [Magenta]    │
│                               │
├───────────────────────────────┤
│ ○ Base                        │ ← collapsed, pending
├───────────────────────────────┤
│ ○ Texte personnalisé          │
├───────────────────────────────┤
│ ○ Noms                        │
├───────────────────────────────┤
│ ○ Date                        │
├───────────────────────────────┤
│ ○ Photo (optionnel)           │
└───────────────────────────────┘
```

### Bottom Sheet Controls

For complex selections (color, size), use bottom sheets:

```
┌───────────────────────────────┐
│ Choisissez la couleur         │
│                     [Fermer]  │
├───────────────────────────────┤
│                               │
│  ┌─────┐  ┌─────┐  ┌─────┐  │
│  │     │  │     │  │     │  │
│  │Cyan │  │Rose │  │Bleu │  │
│  │  ✓  │  │     │  │     │  │
│  └─────┘  └─────┘  └─────┘  │
│                               │
│  ┌─────┐  ┌─────┐  ┌─────┐  │
│  │     │  │     │  │     │  │
│  │Blanc│  │ RGB │  │Magma│  │
│  │     │  │     │  │     │  │
│  └─────┘  └─────┘  └─────┘  │
│                               │
│ [      Confirmer      ]      │
└───────────────────────────────┘
```

## Sticky Preview Bar

- **Position**: Top of viewport, below mobile header
- **Content**: Small product thumbnail + current configuration summary (e.g., "Étoile · Rose · Marie")
- **Behavior**: Updates live as user makes selections
- **Visibility**: Always visible during configurator flow
- **Height**: ~60px, non-intrusive

## Sticky Add to Cart Bar

- **Position**: Bottom of viewport
- **Content**: Product thumbnail + price + "Ajouter au panier" button
- **Behavior**: Always visible, disabled until all required steps complete
- **Height**: ~70px, prominent
- **Production note**: "Fabrication: 3-5 jours ouvrés" shown below CTA

## Price Visibility

- Price always visible (in sticky bar or above configurator)
- Price updates if personalization affects pricing
- No hidden costs — all options show price impact

## Touch-Friendly Rules

- All selectors: minimum 44px tap target
- Color swatches: minimum 40px × 40px
- Text inputs: minimum 48px height
- Accordion triggers: full-width, easy to tap
- Bottom sheet drag handle: visible, easy to grab

---

# 13 — Cart Drawer

Enjoy The Wood uses a drawer-first cart architecture (no dedicated cart page). Michket follows the same pattern, enhanced with personalization summaries.

## Cart Drawer Structure

### Desktop

```
┌──────────────────────────────────────────────────────────────┐
│ VOTRE PANIER (2)                                    [X]     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ [Img] Lampe LED 3D — Étoile                                  │
│       Personnalisation: Rose · "Joyeux Anniv. Marie"         │
│       Fabrication: 3-5 jours ouvrés                          │
│       [-] 1 [+]                          49,90 €            │
│       [Modifier] [Supprimer]                                 │
│                                                              │
│ [Img] Trophée Champion — Or                                  │
│       Gravure: "1er Prix — Championnat 2026"                 │
│       Fabrication: 5-7 jours ouvrés                          │
│       [-] 1 [+]                          79,90 €            │
│       [Modifier] [Supprimer]                                 │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ 🚚 Plus que 20,10 € pour la livraison gratuite!             │
│ [████████████████████░░░░░░░░] 79,80/100 €                  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ Code promo: [____________] [Appliquer]                       │
│                                                              │
│ Sous-total:                                  129,80 €       │
│ Livraison:                                   Calculée à la   │
│                                               caisse         │
│                                                              │
│ [         PASSER LA COMMANDE         ]  ← Gold, full-width  │
│                                                              │
│ 🚚 Livraison rapide  🔒 Paiement sécurisé  ⭐ Garantie     │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ VOUS AIMEREZ AUSSI                                           │
│ [Card] [Card] [Card]  ← horizontal scroll                   │
└──────────────────────────────────────────────────────────────┘
```

### Mobile

```
┌───────────────────────────────┐
│ VOTRE PANIER (2)        [X]  │
├───────────────────────────────┤
│                               │
│ [Img] Lampe LED 3D — Étoile   │
│       Rose · "Joyeux Anniv."  │
│       Fabrication: 3-5 jours  │
│       [-] 1 [+]    49,90 €   │
│       [Modifier]              │
│                               │
│ [Img] Trophée Champion — Or   │
│       "1er Prix — 2026"       │
│       Fabrication: 5-7 jours  │
│       [-] 1 [+]    79,90 €   │
│       [Modifier]              │
│                               │
├───────────────────────────────┤
│ 🚚 Plus que 20,10 €          │
│    pour la livraison gratuite!│
│ [████████████░░░░░░░░] 79/100 │
├───────────────────────────────┤
│ Sous-total:        129,80 €  │
│                               │
│ [   PASSER LA COMMANDE   ]   │ ← Gold, full-width, sticky
│                               │
│ 🚚 🔒 ⭐                      │
├───────────────────────────────┤
│ VOUS AIMEREZ AUSSI            │
│ [Card] [Card] ← swipe        │
└───────────────────────────────┘
```

## Cart Elements

| # | Element | Description |
|---|---|---|
| 1 | Header | "VOTRE PANIER (X)" + close button |
| 2 | Free shipping progress bar | Animated bar showing proximity to threshold |
| 3 | Cart items | Vertical stack of line items |
| 4 | Item thumbnail | Product image (or personalized preview thumbnail) |
| 5 | Product title | Product name + variant summary |
| 6 | Personalization summary | Compact display of customization (see below) |
| 7 | Production time | Per-item: "Fabrication: 3-5 jours ouvrés" |
| 8 | Quantity controls | [-] quantity [+] with limits |
| 9 | Price | Per-item price |
| 10 | Edit personalization | "Modifier" link → returns to PDP with pre-filled config |
| 11 | Remove | "Supprimer" or swipe-to-remove (mobile) |
| 12 | Promo code | Collapsible input: "Code promo" |
| 13 | Subtotal | Cart total before shipping/tax |
| 14 | Checkout CTA | "Passer la commande" — gold, full-width, sticky |
| 15 | Trust messaging | Icons: livraison, sécurisé, garantie |
| 16 | Recommendations | "Vous aimerez aussi" carousel |
| 17 | Continue shopping | "Continuer les achats" link |

## Personalization Summary in Cart

Each cart item shows a compact personalization summary:

**Lamp example:**
```
Personnalisation: Rose · "Joyeux Anniv. Marie" · Base: Bois
```

**Trophy example:**
```
Gravure: "1er Prix — Championnat 2026" · Or
```

**Map example:**
```
Carte 3D · Taille: XL · Français · Sans personnalisation
```

**Expandable**: Tap "Voir plus" to see full configuration details.

## Free Shipping Progress Bar

- Animated bar that fills as cart total approaches threshold
- Text updates dynamically:
  - "Plus que 20,10 € pour la livraison gratuite!" (when below)
  - "🎉 Livraison gratuite débloquée!" (when reached)
- Color changes: gray → gold when threshold met
- Threshold: [OWNER INPUT REQUIRED — recommended 100€]

## Recommendations in Cart

- "Vous aimerez aussi" section below trust messaging
- Horizontal swipeable carousel
- Products: complementary items (e.g., gift wrapping, accessories, lower-priced lamps)
- Card size: compact (smaller than collection page cards)

## Empty Cart State

```
┌───────────────────────────────┐
│ VOTRE PANIER (0)        [X]  │
├───────────────────────────────┤
│                               │
│        🛒                     │
│                               │
│   Votre panier est vide       │
│                               │
│   Découvrez nos produits      │
│   personnalisés               │
│                               │
│  [  CONTINUER LES ACHATS  ]  │
│                               │
└───────────────────────────────┘
```

## Cart Behavior

| Behavior | Detail |
|---|---|
| Opening | Slides in from right, semi-transparent backdrop |
| Closing | Click backdrop, click X, swipe right (mobile), Escape key |
| Scroll | Items scroll, CTA stays sticky at bottom |
| Adding item | Drawer slides in automatically after "Ajouter au panier" |
| Quantity update | AJAX — no page reload, instant price update |
| Personalization edit | "Modifier" navigates to PDP with pre-filled configuration |
| Incomplete personalization | Warning: "Personnalisation incomplète" with return-to-PDP link |

---

# 14 — Checkout Handoff

The checkout itself is handled by the commerce platform (Shopify, Stripe, etc.). This section defines the **UX requirements** that must be preserved through the handoff.

## Checkout Requirements

### Order Summary

| Requirement | Detail |
|---|---|
| Line-item display | Each product shown with thumbnail, title, variant summary |
| Personalization display | Full personalization details per line item |
| Thumbnail | Product image or personalized preview thumbnail |
| Quantity | Editable (with limits for personalized items) |
| Price | Per-item and total |
| Discounts | Applied promo codes visible |
| Shipping | Calculated shipping cost |
| Taxes | Calculated tax |
| Total | Final total with all line items |

### Personalization Preservation

- All personalization data must pass through checkout as line-item metadata
- Customer must be able to review personalization before final payment
- Any change to personalization requires returning to PDP (not editable in checkout)

### Payment Methods

| Method | Priority |
|---|---|
| Credit/debit cards | Primary (Visa, Mastercard, Amex) |
| Apple Pay | Express checkout |
| Google Pay | Express checkout |
| PayPal | Alternative |
| Shop Pay | Express checkout (if Shopify) |
| Bank transfer | Optional (for French market) |

### Customer Details

| Field | Required |
|---|---|
| Email | Required |
| First name | Required |
| Last name | Required |
| Shipping address | Required |
| Phone | Optional (recommended for delivery) |
| Billing address | "Same as shipping" default |

### Delivery Expectations

- Estimated delivery date range shown during checkout
- Production time clearly communicated: "Fabrication: 3-5 jours ouvrés + livraison: X jours"
- Shipping method options with price and estimated delivery

### Legal Acknowledgment

- Checkbox or notice for personalized products: "Les produits personnalisés ne sont pas éligibles au retour sauf défaut de fabrication."
- Terms of service link
- Privacy policy link

### Trust Signals in Checkout

- Security badges (SSL, payment processor logos)
- "Paiement 100% sécurisé" messaging
- Return policy summary
- Customer service contact info

## Post-Purchase

- Order confirmation page with order summary
- Personalization details included in confirmation
- Estimated delivery date
- "Continuer les achats" CTA
- Email confirmation with full order details

---

---

# 15 — Search & Discovery

Michket search must understand **gift-giving intent**, not just product keywords. Users search by occasion, recipient, profession, and emotion — not just product names.

## Desktop Search

### Predictive Search Overlay

Unlike Enjoy The Wood (which uses page-based search), Michket implements a **predictive search overlay** for better UX:

```
┌─────────────────────────────────────────────────────────────┐
│  🔍 Rechercher un cadeau...                          [✕]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Produits                                                  │
│  ┌─────┐  Lampe LED 3D Personnalisée — Étoile              │
│  │     │  49,90 €                                          │
│  └─────┘                                                    │
│  ┌─────┐  Trophée Champion Personnalisé                    │
│  │     │  79,90 €                                          │
│  └─────┘                                                    │
│                                                             │
│  Occasions                                                  │
│  🎂 Anniversaire (24 produits)                             │
│  💒 Mariage (18 produits)                                  │
│  🎓 Diplôme (12 produits)                                  │
│                                                             │
│  Catégories                                                 │
│  💡 Lampes 3D personnalisées                               │
│  🏆 Trophées personnalisés                                 │
│  🗺️ Cartes du monde en bois                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Desktop Search Behavior

| Element | Behavior |
|---|---|
| Trigger | Click search icon in header → overlay appears |
| Input | Auto-focused, placeholder: "Rechercher un cadeau..." |
| Results | Real-time predictive results as user types |
| Product suggestions | Thumbnail + title + price, max 4 results |
| Occasion suggestions | Category links with product count |
| Category suggestions | Collection links |
| No results | "Aucun résultat pour « [query] »" + popular searches + suggestions |
| Selection | Click result → navigate to product/collection page |
| Close | Click X, press Escape, click outside |
| Submit | Enter → navigate to full search results page |

### Full Search Results Page

`/search?q=[query]`

| Element | Detail |
|---|---|
| Header | "Résultats pour « [query] » — XX résultats" |
| Filters | Sort by, Price range, Occasion, Product type, Availability |
| Product grid | Same product card system as collections |
| Pagination | "Voir plus" or page-based |
| SEO content | Brief contextual text below results |

## Mobile Search

### Fullscreen Search Overlay

```
┌───────────────────────────────┐
│ 🔍 Rechercher un cadeau...   │
│                         [✕]  │
├───────────────────────────────┤
│                               │
│ Recherches populaires         │
│ • Lampe anniversaire          │
│ • Trophée football            │
│ • Carte du monde              │
│ • Cadeau maman                │
│                               │
├───────────────────────────────┤
│                               │
│ [Predictive results appear    │
│  as user types]               │
│                               │
└───────────────────────────────┘
```

| Element | Behavior |
|---|---|
| Trigger | Tap search icon → fullscreen overlay |
| Input | Auto-focused, keyboard appears |
| Close | Tap X or back arrow |
| Recent searches | Show last 5 searches (if available) |
| Popular searches | Pre-filled suggestions |
| Predictive results | Real-time product + occasion + category results |
| Keyboard | Input stays above virtual keyboard |

## Search by Occasion/Recipient

The search index must map natural-language gift queries to products:

| Query | Maps To |
|---|---|
| "médecin" | Trophées médecin, lampes médecin, plaques |
| "maman" | Lampes maman, cadeaux mère, trophées |
| "mariage" | Lampes mariage, cadeaux couple, trophées |
| "football" | Trophées sportifs, lampes sport |
| "soutenance" | Trophées soutenance, plaques commémoratives |
| "anniversaire" | Lampes anniversaire, cadeaux anniversaire |
| "bébé" | Lampes naissance, cadeaux bébé |
| "diplôme" | Trophées diplôme, plaques |
| "cadeau pour maman" | All mama-appropriate products |
| "cadeau 50 euros" | Products under 50€ |
| "trophée gravure" | Trophies with engraving |
| "lampe prénom" | Lamps with name personalization |

## No-Result Recovery

When search returns zero results:

```
┌─────────────────────────────────────┐
│ Aucun résultat pour « xyz »         │
│                                     │
│ Suggestions:                        │
│ • Vérifiez l'orthographe            │
│ • Essayez des termes plus généraux  │
│ • Parcourez nos catégories          │
│                                     │
│ Recherches populaires:              │
│ [Lampe anniversaire]                │
│ [Trophée football]                  │
│ [Carte du monde]                    │
│ [Cadeau maman]                      │
│                                     │
│ Nos catégories:                     │
│ 💡 Lampes 3D  🏆 Trophées          │
│ 🗺️ Cartes     🎁 Cadeaux           │
└─────────────────────────────────────┘
```

---

# 16 — Reviews & Social Proof

## Homepage Reviews

- Aggregate rating prominently displayed in Section 6 (Social Proof)
- Star rating + total count: "★★★★★ 4.9/5 — 2 447 avis"
- Review platform logo (Trustpilot, Google Reviews, or chosen platform)
- "Voir tous les avis" link to full reviews page

## Product Page Reviews

### Rating Summary

```
┌─────────────────────────────────────┐
│ ★★★★★  4.9/5                       │
│ 2 447 avis                         │
│                                     │
│ 5★ ████████████████████  89%       │
│ 4★ ████               8%          │
│ 3★ █                  2%          │
│ 2★                    1%          │
│ 1★                    0%          │
│                                     │
│ Filtrer: [Tous] [Avec photos] [5★] │
└─────────────────────────────────────┘
```

### Individual Review Card

```
┌─────────────────────────────────────┐
│ ★★★★★                               │
│ Sophie M. · Achat vérifié · 12/03/26│
│                                     │
│ "Ma mère a adoré! La qualité est    │
│ incroyable et la personnalisation    │
│ est parfaite. Je recommande à 100%."│
│                                     │
│ [Photo 1] [Photo 2]                 │
└─────────────────────────────────────┘
```

### Review Elements

| Element | Detail |
|---|---|
| Star rating | 5-star system (full and half stars) |
| Reviewer name | First name + last initial |
| Verified badge | "Achat vérifié" indicator |
| Date | Format: JJ/MM/AA |
| Text | Review content (truncated with "Lire la suite") |
| Photos | Customer-uploaded images, tappable to lightbox |
| Helpful | "Utile" button with count (optional) |

### Review Filters

| Filter | Options |
|---|---|
| By rating | All, 5★, 4★, 3★, 2★, 1★ |
| With photos | Toggle |
| Verified only | Toggle |

### Photo Review Gallery

- Grid of customer-uploaded photos from reviews
- Lightbox on click
- Linked to the specific review

## Review Data Requirements

| Field | Source |
|---|---|
| Rating | Review platform API (Trustpilot, Judge.me, Loox, etc.) |
| Review text | Review platform API |
| Reviewer name | Review platform API |
| Date | Review platform API |
| Photos | Review platform API |
| Verified badge | Review platform API |
| Aggregate count | Review platform API |
| Rating distribution | Review platform API |

**Rule**: Never invent reviews. All reviews come from real customers via the review platform. Until real reviews exist, show "Soyez le premier à donner votre avis" (Be the first to review).

---

# 17 — UGC / Customer Creations

## Homepage Integration

Section 11: "Inspiré par Vous" — horizontal carousel of 9-12 customer photos.

- Each photo: customer image + product name + link
- Horizontal scroll (desktop), swipe (mobile)
- "Voir tout →" link to full inspiration page
- "#MichketMoment" hashtag prompt

## Dedicated Inspiration Page

`/pages/inspiration`

### Page Structure

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  INSPARÉ PAR VOUS                                          │
│  Montrez-nous votre Michket!                                │
│  Partagez vos photos avec #MichketMoment                    │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │          │ │          │ │          │ │          │      │
│  │ Customer │ │ Customer │ │ Customer │ │ Customer │      │
│  │ Photo 1  │ │ Photo 2  │ │ Photo 3  │ │ Photo 4  │      │
│  │          │ │          │ │          │ │          │      │
│  ├──────────┤ ├──────────┤ ├──────────┤ ├──────────┤      │
│  │Product   │ │Product   │ │Product   │ │Product   │      │
│  │Name      │ │Name      │ │Name      │ │Name      │      │
│  │[SHOP NOW]│ │[SHOP NOW]│ │[SHOP NOW]│ │[SHOP NOW]│      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ Customer │ │ Customer │ │ Customer │ │ Customer │      │
│  │ Photo 5  │ │ Photo 6  │ │ Photo 7  │ │ Photo 8  │      │
│  │ ...      │ │ ...      │ │ ...      │ │ ...      │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  VOUS AVEZ UN MICHKET?                                      │
│  Partagez votre photo!                                      │
│  [Soumettre une photo] [Instagram] [TikTok]                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### UGC Grid Rules

| Rule | Detail |
|---|---|
| Photo orientation | Landscape preferred, square acceptable |
| Grid columns | 4 desktop, 2 mobile |
| Photo → Product link | Every photo linked to the product it shows |
| SHOP NOW CTA | Every module has a purchase link |
| Curation | Manually curated — no automatic feed |
| Quality | High-resolution, well-lit, real homes |
| Consent | All photos used with customer permission |

### UGC Categories to Curate

| Category | Content |
|---|---|
| Lampes 3D | Glowing lamps in rooms, night scenes, gift moments |
| Trophées | Award ceremonies, desk displays, gift reactions |
| Cartes du monde | Wall installations, room transformations, travel themes |
| Cadeaux | Unwrapping moments, recipient reactions, family scenes |
| Before/After | Empty space → Michket product transformation |

### Submission Flow

- Email: "Partagez votre photo à hello@michket.com"
- Instagram: Tag @michket with #MichketMoment
- Direct upload: Form on inspiration page (name, email, photo, product link)

---

# 18 — Before/After & Product Demonstration

## Where Transformation Components Appear

| Location | Use Case |
|---|---|
| Homepage Section 9 | Wall transformation with lamp or map |
| Product page (Lamp) | Desk/room before lamp vs. after illuminated |
| Product page (Map) | Bare wall vs. wall with map installed |
| Product page (Trophy) | Plain desk vs. desk with engraved trophy |
| Collection page (optional) | Room transformation for the collection |

## Interaction Behavior

| Property | Desktop | Mobile |
|---|---|---|
| Divider | Draggable vertical line | Touch-draggable vertical line |
| Before image | Left side | Left side (or top on narrow viewports) |
| After image | Right side | Right side (or bottom) |
| Labels | "AVANT" / "APRÈS" overlaid on images | Same, smaller |
| Default position | Center (50/50) | Center |
| Drag range | Full width | Full width |
| Animation | Smooth following finger/mouse | Smooth |

## Image Requirements

| Requirement | Detail |
|---|---|
| Same angle | Before and after from identical camera position |
| Same lighting | Matching lighting conditions |
| Same room | Identical room/setting |
| Product visible | After image clearly shows Michket product |
| High resolution | Minimum 1920×1080 for desktop |
| Aspect ratio | 16:9 or 21:9 for desktop, 4:5 or 1:1 for mobile crop |

## Product-Specific Demonstrations

### LED Lamp

- **Before**: Dark room, no lamp
- **After**: Same room, lamp illuminated with colored glow
- **Interaction**: Slider reveals the illumination effect

### Wooden World Map

- **Before**: Bare, empty wall
- **After**: Same wall with map installed, decorated room
- **Interaction**: Slider reveals the room transformation

### Trophy

- **Before**: Plain desk/shelf
- **After**: Desk/shelf with engraved trophy
- **Interaction**: Slider reveals the personalized achievement

---

# 19 — Footer

## Definitive Footer Architecture

### Newsletter Block (Above Footer Columns)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  10% DE REMISE SUR VOTRE PREMIÈRE COMMANDE                 │
│  Inscrivez-vous pour recevoir votre code promo              │
│  et nos meilleures offres.                                  │
│                                                             │
│  [Votre adresse e-mail        ] [J'EN PROFITE]             │
│                                                             │
│  Pas de spam. Désabonnement en un clic.                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Footer Columns (Desktop: 6 columns)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  CATALOGUE        CADEAUX           OCCASIONS               │
│  • Lampes 3D      • Pour elle        • Anniversaire         │
│  • Trophées       • Pour lui         • Mariage              │
│  • Cartes monde   • Pour enfants     • Couple               │
│  • Nouveautés     • Pour la maison   • Maman                │
│  • Best-sellers   • < 50€            • Papa                 │
│  • Tous produits  • Cartes cadeaux   • Naissance            │
│                   • Emballage        • Diplôme              │
│                                      • BAC / Soutenance     │
│                                      • Enseignant           │
│                                      • Médecin              │
│                                      • Sport                │
│                                      • Remerciement         │
│                                                             │
│  A PROPOS         ASSISTANCE         SUIVEZ-NOUS            │
│  • Notre histoire • Suivre commande  • Instagram            │
│  • Savoir-faire   • Livraison        • Facebook             │
│  • Nos valeurs    • Retours          • TikTok               │
│  • Contact        • FAQ              • Pinterest            │
│  • Avis clients   • Conditions génér.• YouTube              │
│                   • Confidentialité                         │
│                   • Mentions légales                        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Paiement: [Visa] [Mastercard] [Amex] [PayPal]             │
│            [Apple Pay] [Google Pay] [Shop Pay]              │
│                                                             │
│  🌐 Français (EUR) ▼    © 2026 Michket. Tous droits réservés.│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Mobile Footer

Accordion/collapsible sections. Each column heading is a tappable accordion:

```
┌───────────────────────────────┐
│ ▶ CATALOGUE                   │
├───────────────────────────────┤
│ ▶ CADEAUX                     │
├───────────────────────────────┤
│ ▶ OCCASIONS                   │
├───────────────────────────────┤
│ ▶ A PROPOS                    │
├───────────────────────────────┤
│ ▶ ASSISTANCE                  │
├───────────────────────────────┤
│ ▶ SUIVEZ-NOUS                 │
├───────────────────────────────┤
│                               │
│ Paiement: [icons]             │
│ © 2026 Michket.               │
└───────────────────────────────┘
```

### Footer Elements

| Element | Detail |
|---|---|
| Newsletter | 10% incentive, email input, CTA, trust note |
| 6 navigation columns | Catalogue, Cadeaux, Occasions, A Propos, Assistance, Suivez-Nous |
| Payment icons | Visa, Mastercard, Amex, PayPal, Apple Pay, Google Pay, Shop Pay |
| Language/currency | Français (EUR) default. English (USD) option. |
| Copyright | "© 2026 Michket. Tous droits réservés." |
| Contact info | [OWNER INPUT REQUIRED] |
| Social links | Instagram, Facebook, TikTok, Pinterest, YouTube [OWNER INPUT REQUIRED] |

---

# 20 — Visual Design System

## Color Roles

| Role | Color | Hex | Usage |
|---|---|---|---|
| Primary dark | Near black | `#0A0A0A` | Page backgrounds (dark sections), text, headers |
| Black | Pure black | `#000000` | Text, borders (sparingly) |
| Primary accent | Warm gold | `#C9A84C` | Logo, primary CTAs, links, highlights |
| Secondary accent | Amber | `#D4913A` | Hover states, secondary CTAs, badges |
| Light background | Warm ivory | `#F5F0E8` | Section backgrounds, cards, content areas |
| Lighter background | Cream | `#FAF6EE` | Page background, form backgrounds |
| Wood tone | Natural wood | `#B8956A` | Organic accents, borders, map elements |
| Wood light | Light wood | `#D4B896` | Subtle accents, hover states |
| Neutral text | Dark gray | `#333333` | Body text on light backgrounds |
| Muted text | Medium gray | `#666666` | Secondary text, captions |
| Light text | Light gray | `#999999` | Placeholders, disabled states |
| Border | Subtle gray | `#E5E0D8` | Dividers, card borders |
| Error | Warm red | `#C0392B` | Error states, sale badges |
| Success | Warm green | `#27AE60` | In stock, free shipping badge |

**Rule**: Lamp RGB colors (cyan, magenta, blue) belong to **product content only** — they must NOT become the UI palette.

## Typography Philosophy

- **Display/Headlines**: Serif or refined sans-serif — editorial, premium feel. NOT system font. NOT generic.
- **Body**: Clean, readable sans-serif with warm character. Good x-height.
- **Prices/Numbers**: Tabular figures, slightly larger, high contrast.
- **French characters**: Full support for accented characters (é, è, ê, ë, ç, à, ù, etc.)

### Typography Scale

| Role | Size (Desktop) | Size (Mobile) | Weight |
|---|---|---|---|
| Page title | 48-64px | 28-36px | Bold/Semibold |
| Section heading | 32-40px | 24-28px | Semibold |
| Subheading | 24-28px | 18-22px | Semibold |
| Body | 16-18px | 15-16px | Regular |
| Small/Caption | 13-14px | 12-13px | Regular |
| Price (large) | 24-32px | 20-24px | Bold |
| Price (card) | 16-18px | 14-16px | Bold |
| Badge | 11-13px | 10-12px | Bold, uppercase |
| Nav link | 14-16px | — | Medium |

## Button Types

### Primary CTA (Gold)

```
Background: #C9A84C (warm gold)
Text: #0A0A0A (near black)
Padding: 14px 32px (desktop), 12px 24px (mobile)
Border-radius: 4-8px (subtle, not pill)
Font: Semibold, 15-16px
Hover: #D4A843 (lighter gold)
Active: #B8956A (darker gold)
```

### Secondary CTA (Outline)

```
Background: transparent
Border: 1.5px solid #C9A84C
Text: #C9A84C
Padding: 14px 32px
Hover: Background #C9A84C10 (subtle fill)
```

### Tertiary / Text Link

```
Background: none
Text: #C9A84C
Underline: on hover only
Font: Medium, 14-16px
```

### Disabled

```
Background: #E5E0D8
Text: #999999
Cursor: not-allowed
```

## Border & Radius Rules

| Element | Border | Radius |
|---|---|---|
| Cards | 1px solid #E5E0D8 or none | 8-12px |
| Buttons (primary) | none | 4-8px |
| Buttons (outline) | 1.5px solid gold | 4-8px |
| Input fields | 1px solid #E5E0D8 | 4-8px |
| Images | none | 4-8px (or 0 for editorial) |
| Badges | none | 3-4px |
| Avatars | none | 50% (circle) |
| Modals | none | 8-12px |
| Accordions | 1px solid #E5E0D8 (top/bottom) | 0 |

**Rule**: Mix sharp and soft. NOT everything rounded-2xl. NOT everything sharp. Intentional variation.

## Shadow System

| Level | Usage | Value |
|---|---|---|
| None | Default for most elements | — |
| Subtle | Cards on hover, dropdowns | `0 2px 8px rgba(0,0,0,0.06)` |
| Medium | Mega-menu, cart drawer | `0 4px 16px rgba(0,0,0,0.1)` |
| Large | Modals, sticky elements | `0 8px 32px rgba(0,0,0,0.12)` |

**Rule**: Shadows are subtle. Not heavy. Not dramatic. The product photography provides the visual drama.

## Container Widths

| Context | Max Width |
|---|---|
| Page content | 1280px |
| Product page | 1280px |
| Collection grid | 1280px |
| Full-width sections | 100% |
| Narrow content (text) | 720px |

## Spacing Scale Philosophy

Use a consistent spacing scale based on 4px increments:

| Token | Value | Usage |
|---|---|---|
| xs | 4px | Tight internal padding |
| sm | 8px | Small gaps, icon spacing |
| md | 12px | Card padding, small gaps |
| lg | 16px | Card gaps, section padding |
| xl | 24px | Section gaps, content spacing |
| 2xl | 32px | Section padding |
| 3xl | 48px | Major section spacing |
| 4xl | 64px | Hero section padding |
| 5xl | 96px | Page-level spacing |

## Form Controls

| Element | Style |
|---|---|
| Text input | 1px border, 4-8px radius, 48px height, warm ivory focus ring |
| Textarea | Same as text input, multi-line, resizable vertically |
| Select/dropdown | Custom-styled, not native browser |
| Checkbox | Custom gold checkbox, not browser default |
| Radio | Custom gold radio, not browser default |
| Toggle | Custom toggle switch, gold active state |
| Color swatch | 40×40px circle or square, gold border on select |
| Size button | Pill or rectangle, gold border on select |

## Accordion Style

```
┌─────────────────────────────────────┐
│ Titre de l'accordion           [+] │
├─────────────────────────────────────┤ ← 1px border top
│                                     │
│  Contenu de l'accordion             │
│  Texte, images, etc.                │
│                                     │
└─────────────────────────────────────┘ ← 1px border bottom
```

- Border: 1px solid #E5E0D8 on top and bottom
- Toggle icon: [+] / [−] or chevron
- Animation: Smooth height transition (200-300ms)
- Padding: 16-20px vertical

## Badge System

| Badge | Background | Text | Usage |
|---|---|---|---|
| BEST SELLER | `#C9A84C` (gold) | `#0A0A0A` (dark) | Top-selling products |
| NOUVEAU | `#27AE60` (green) | `#FFFFFF` | New arrivals |
| PROMO | `#C0392B` (red) | `#FFFFFF` | Sale items |
| PERSONNALISABLE | `#D4913A` (amber) | `#FFFFFF` | Personalizable products |
| ENVOI GRATUIT | `#27AE60` (green) | `#FFFFFF` | Free shipping items |

---

# 21 — Photography Art Direction

Photography is the single most important design element. It dominates composition and creates the premium, emotional feel.

## Hero Photography

| Property | Specification |
|---|---|
| Style | Cinematic, warm, dramatic lighting |
| Environment | Dark/warm interiors, night scenes for lamps |
| Composition | Product fills 60%+ of frame |
| Lighting | Controlled, golden-hour feel, realistic shadows |
| Depth of field | Bokeh, focus on product, soft backgrounds |
| Mood | Premium, emotional, aspirational |

### Hero Shot Types

1. **LED Lamp — Night**: Lamp glowing in dark room, warm light casting on surroundings
2. **Trophy — Ceremony**: Trophy on podium or desk, warm ambient light
3. **Map — Room**: Map installed on wall in beautifully decorated room
4. **Gift — Moment**: Hands giving/receiving a Michket product, emotional reaction

## Collection Photography

| Collection | Photography Direction |
|---|---|
| Lampes 3D | Dark environments, LED glow as hero, multiple light colors shown |
| Trophées | Achievement contexts — ceremony, office, desk, shelf |
| Cartes du monde | Room settings — living room, bedroom, office, restaurant |
| Cadeaux | Gift-giving moments — wrapping, unwrapping, surprise, joy |
| Occasions | Event-appropriate scenes — graduation, wedding, birth |

## PDP Photography (Per Product)

### Lamp Photography Checklist

| # | Shot | Purpose |
|---|---|---|
| 1 | Hero on dark background | Primary product image |
| 2 | In room — night, glowing | Lifestyle/emotional |
| 3 | In room — day, unlit | Daytime appearance |
| 4 | Close-up — acrylic detail | Material quality |
| 5 | Close-up — LED glow | Light quality |
| 6 | Base detail | Base craftsmanship |
| 7 | Personalization examples | Show customization options |
| 8 | Size comparison | Scale reference |
| 9 | Packaging/unboxing | Premium unboxing experience |
| 10 | Video — light modes | LED functionality demo |

### Trophy Photography Checklist

| # | Shot | Purpose |
|---|---|---|
| 1 | Hero on dark background | Primary product image |
| 2 | Engraving close-up | Personalization quality |
| 3 | In ceremony setting | Achievement context |
| 4 | Multiple trophies | Collection/scale |
| 5 | Material texture | Craftsmanship detail |
| 6 | Size comparison | Scale reference |
| 7 | Packaging | Premium presentation |

### Map Photography Checklist

| # | Shot | Purpose |
|---|---|---|
| 1 | Map on wall — hero room | Primary product image |
| 2 | Room setting — living room | Lifestyle |
| 3 | Room setting — bedroom | Lifestyle |
| 4 | Room setting — office | Lifestyle |
| 5 | Close-up — wood layers | 3D detail |
| 6 | Close-up — LED illumination | Light feature |
| 7 | Size comparison | Scale reference |
| 8 | Installation process | How-to |
| 9 | Mounting hardware | What's included |
| 10 | Packaging | What arrives |

## Lifestyle Photography

- Real homes, real people, real moments
- Warm, cinematic lighting
- Products in context — not isolated
- Diverse settings — apartments, houses, offices
- Diverse people — ages, backgrounds, family structures

## Photography to AVOID

- Generic stock imagery
- Sterile white catalog layouts everywhere
- Tiny images inside repetitive cards
- Fake corporate lifestyle imagery
- Overly bright/flat product shots
- Generic "hands holding product" stock
- AI-generated product scenes
- Over-processed HDR
- Cool/blue lighting (Michket is warm)

---

---

# 22 — Motion System

## Motion Principles

1. **Purposeful** — Every animation has a reason. No decoration.
2. **Product-focused** — Motion draws attention to products, not to the interface.
3. **Premium** — Smooth, refined, never bouncy or playful.
4. **Fast** — Never delays the user's path to purchase.
5. **Accessible** — Respects `prefers-reduced-motion`.

## Motion Inventory

| Element | Motion | Duration | Easing |
|---|---|---|---|
| Image reveal (scroll) | Fade in + slight translateY(20px → 0) | 400ms | ease-out |
| Hover image swap | Crossfade between primary and secondary image | 200ms | ease-in-out |
| Product glow (LED) | Subtle pulse/breathe animation on hero images | 2000ms loop | ease-in-out |
| Mega-menu | Opacity 0→1 + translateY(-8px → 0) | 200ms | ease-out |
| Cart drawer | translateX(100% → 0) + backdrop fade | 300ms | ease-out |
| Accordion | Height 0 → auto (or measured) | 250ms | ease-in-out |
| Sticky header | Background opacity transition on scroll | 200ms | ease |
| Before/after slider | Immediate following finger/mouse | 0ms | linear |
| Scroll reveal (sections) | Fade up on viewport entry | 400-600ms | ease-out |
| Badge pulse (sale) | Subtle scale 1 → 1.05 → 1 | 1500ms loop | ease-in-out |
| Personalization preview | Smooth image swap when options change | 300ms | ease-in-out |
| Loading skeleton | Shimmer gradient animation | 1500ms loop | linear |
| Page transition | Fade or instant (no full-page loader) | 150ms | ease |
| Button hover | Background color transition | 150ms | ease |
| Focus ring | Box-shadow transition | 100ms | ease |

## Motion to AVOID

| Pattern | Why |
|---|---|
| Page-wide parallax | Causes motion sickness, not premium |
| Auto-playing carousels that steal focus | Distracts from purchase path |
| Bouncy/springy effects | Playful but not premium |
| Animation that delays purchase clarity | Every ms counts in commerce |
| Complex loading spinners | Suggests slow performance |
| Scroll-jacking | Disrupts natural browsing |
| Text reveal animations (letter by letter) | Too slow, too flashy |
| Hover-dependent interactions on mobile | No hover on touch devices |

## Reduced Motion Rules

```css
@media (prefers-reduced-motion: reduce) {
  /* Disable all non-essential animations */
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
  /* Keep: before/after slider (functional), scroll behavior */
}
```

- All scroll-reveal animations disabled
- Mega-menu appears instantly (no transition)
- Cart drawer appears instantly
- Carousel transitions disabled (snap instead)
- Image hover swap disabled (show primary only)
- Product glow animation disabled

---

# 23 — Responsive System

## Breakpoints

| Name | Range | Target |
|---|---|---|
| Small mobile | 320-374px | Older phones, SE |
| Normal mobile | 375-424px | iPhone 12-15, most phones |
| Large mobile | 425-479px | Large phones, phablets |
| Tablet | 480-767px | Small tablets, landscape phone |
| Small laptop | 768-1023px | iPad portrait, small laptops |
| Laptop | 1024-1279px | iPad landscape, standard laptops |
| Desktop | 1280-1439px | Standard desktops |
| Large desktop | 1440px+ | Large monitors |

## Layout Strategy Changes (Not Just Breakpoints)

### Small Mobile (320-374px)

- 1-column product grid (not 2 — cards too narrow)
- Compact header: logo + hamburger + cart only
- Reduced font sizes (14px body)
- Minimal padding (12px page padding)
- Stack everything vertically

### Normal Mobile (375-424px)

- 2-column product grid
- Compact header
- Standard mobile font sizes (15-16px body)
- 16px page padding
- Swipeable carousels (1.5 visible cards)

### Large Mobile (425-479px)

- 2-column product grid (slightly larger cards)
- Same as normal mobile with more breathing room

### Tablet (480-767px)

- 2-3 column product grid (transition zone)
- May show simplified mega-menu (not full)
- Larger touch targets
- 24px page padding

### Small Laptop (768-1023px)

- 3-column product grid
- Full mega-menu (may be slightly compressed)
- More desktop-like layout
- 32px page padding

### Laptop (1024-1279px)

- 3-4 column product grid
- Full desktop navigation
- Full mega-menu with images
- 48px page padding

### Desktop (1280-1439px)

- 4-column product grid (default)
- Full desktop experience
- 64px page padding
- Max content width: 1280px

### Large Desktop (1440px+)

- 4-5 column product grid (optional)
- Wider product gallery on PDP
- Max content width: 1280px centered
- More whitespace

## Responsive Patterns

| Pattern | Mobile | Desktop |
|---|---|---|
| Navigation | Hamburger → drawer | Horizontal mega-menu |
| Product grid | 2 columns | 4 columns |
| Filters | Bottom sheet | Sidebar panel |
| Cart | Full-width drawer | 400px right drawer |
| Gallery | Swipeable | Thumbnails + main image |
| Configurator | Accordion steps | Inline staged |
| Footer | Accordion columns | 6-column grid |
| Before/after | Touch-draggable | Mouse-draggable |
| Search | Fullscreen overlay | Dropdown overlay |
| Sticky CTA | Bottom bar | Inline (no sticky needed) |
| Header | Compact, 3 elements | Full, all elements |

---

# 24 — Accessibility

## Semantic Structure

- Proper HTML landmarks: `<header>`, `<nav>`, `<main>`, `<footer>`, `<section>`, `<article>`
- Heading hierarchy: one `<h1>` per page, sequential `<h2>`→`<h3>`→`<h4>`
- Lists: `<ul>`/`<ol>` for navigation, product grids
- Tables: proper `<th>`, `<caption>` for data tables
- Language attribute: `lang="fr"` on `<html>` element

## Focus Management

| Element | Focus Style |
|---|---|
| Links | Gold outline ring (2px, offset 2px) |
| Buttons | Gold outline ring |
| Form inputs | Gold border + outline ring |
| Interactive cards | Gold outline ring on focus-within |
| Skip link | "Aller au contenu principal" — visible on focus |
| Focus trap | Cart drawer, search overlay, modal dialogs |

## Contrast Ratios

| Element | Minimum Ratio |
|---|---|
| Body text on light bg | 7:1 (AAA) |
| Headings on light bg | 4.5:1 (AA) |
| Body text on dark bg | 7:1 (AAA) |
| Gold accent on dark bg | 4.5:1 (AA) |
| Gold accent on light bg | 3:1 (AA large text) |
| Badge text on badge bg | 4.5:1 (AA) |
| Form placeholder text | 4.5:1 (AA) |

## Keyboard Navigation

| Key | Behavior |
|---|---|
| Tab | Move forward through interactive elements |
| Shift+Tab | Move backward |
| Enter/Space | Activate links, buttons, toggles |
| Escape | Close mega-menu, cart drawer, search overlay, modal |
| Arrow keys | Navigate within carousels, radio groups, menu items |
| Home/End | Jump to first/last item in lists, carousels |

## Menu Accessibility

- Mega-menu: `role="menu"`, `aria-expanded`, `aria-haspopup`
- Mobile drawer: `role="dialog"`, `aria-modal="true"`, focus trap
- Back button in sub-menus: clear `aria-label`

## Dialog/Drawer Accessibility

- Focus trap within open drawer/modal
- Focus returns to trigger element on close
- Escape key closes
- `aria-modal="true"` on container
- `aria-labelledby` referencing title
- Background content: `aria-hidden="true"` when drawer open

## Accordion Accessibility

- `aria-expanded` on trigger button
- `aria-controls` linking to panel
- `role="region"` on panel
- Enter/Space to toggle
- Arrow keys to navigate between accordion headers

## Upload Accessibility

- Visible labels (not just placeholder text)
- Error messages linked via `aria-describedby`
- File format and size limits announced
- Upload progress announced via `aria-live`
- Drag-and-drop zone has keyboard alternative (button)

## Configurator Accessibility

- Each step announced via `aria-live` region
- Selection changes announced: "Modèle sélectionné: Étoile"
- Preview updates announced
- Required fields marked with `aria-required="true"`
- Error messages linked to inputs via `aria-describedby`
- Character count announced: "23 caractères sur 50"

## Error Messages

- Linked to inputs via `aria-describedby`
- Visible (not just color-based)
- `role="alert"` for critical errors
- Icon + text + color (never color alone)

## Alt Text Architecture

| Image Type | Alt Text |
|---|---|
| Product hero | Descriptive: "Lampe LED 3D personnalisée Étoile avec lumière cyan" |
| Product alternate | Descriptive: "Lampe Étoile dans un salon moderne la nuit" |
| Thumbnail | Brief: "Vue de face" / "Vue de détail" |
| Badge icon | Decorative: `alt=""` |
| UI icon | Decorative: `alt=""` |
| Customer photo | Descriptive: "Lampe Michket allumée dans un salon" |
| Before/after | Descriptive: "Mur vide avant installation" / "Mur avec carte du monde après installation" |

## Touch Targets

| Element | Minimum Size |
|---|---|
| Navigation links | 44×44px |
| Buttons | 44×44px (content may be smaller, touch area 44px) |
| Form inputs | 48px height |
| Color swatches | 40×40px |
| Size buttons | 44×44px |
| Accordion triggers | Full-width, 48px height |
| Close buttons | 44×44px |
| Quantity +/- | 44×44px |

---

# 25 — Performance

## Image Optimization

| Strategy | Detail |
|---|---|
| Format | WebP with JPEG fallback (AVIF for supported browsers) |
| Responsive srcset | Multiple sizes per image (320w, 640w, 960w, 1280w, 1920w) |
| Lazy loading | All images below the fold: `loading="lazy"` |
| Above-the-fold | Hero image, first gallery image: `loading="eager"`, `fetchpriority="high"` |
| Placeholder | Blurhash or LQIP (Low Quality Image Placeholder) for all images |
| Maximum width | Never serve images wider than display size |
| Compression | 80-85% quality for product photos, 90% for hero |

## Video Optimization

| Strategy | Detail |
|---|---|
| Format | MP4 (H.264) with WebM fallback |
| Lazy loading | Video loads only when in viewport or on click |
| Poster image | Static frame used as placeholder |
| Autoplay | Only for background ambient videos (muted, loop) |
| Product videos | Click-to-play only (never autoplay in gallery) |
| Compression | CRF 23-28, resolution matched to display |

## Above-the-Fold Prioritization

| Resource | Priority |
|---|---|
| Hero image | `fetchpriority="high"`, preload |
| Logo | Preload (font or image) |
| Primary CTA | Inline CSS, no render-blocking |
| Navigation | Inline or critical CSS |
| Body font | `font-display: swap`, preload |
| CSS | Critical CSS inline, remainder deferred |
| JS | Defer non-critical, async third-party |

## Font Loading

- Use `font-display: swap` for all web fonts
- Preload primary font file
- Maximum 2 font families (display + body)
- Subset fonts to Latin + Latin Extended (French characters)
- Consider self-hosting for better control

## JavaScript Restraint

| Principle | Detail |
|---|---|
| Minimal client JS | Rely on React Server Components where possible |
| No heavy frameworks | Avoid full UI framework bloat |
| Code splitting | Route-based + component-based splitting |
| Third-party audit | Audit every third-party script (analytics, chat, reviews) |
| Defer non-critical | Load chat, analytics, social embeds after interaction |
| Bundle analysis | Regular bundle size checks |

## Animation Restraint

- Animations only on user-triggered interactions (hover, click, scroll)
- No animation during page load (except subtle fade-in)
- CSS transitions preferred over JS animation
- `will-change` used sparingly
- No layout-triggering animations (avoid animating width, height, top, left)

## Product Gallery Performance

| Strategy | Detail |
|---|---|
| Preload first 3 images | Next 3 images preloaded in background |
| Virtualized thumbnails | Only render visible thumbnails |
| Image caching | Aggressive caching for product images |
| CDN | Serve all images from CDN |

## Mobile Performance

- Target: LCP < 2.5s on 3G
- Target: CLS < 0.1
- Target: FID < 100ms
- Image sizes halved for mobile (smaller srcset)
- Below-fold sections lazy-loaded
- Fonts loaded with swap (no invisible text)

## Core Web Vitals Mindset

- **LCP**: Hero image is the critical path. Optimize above all else.
- **CLS**: Reserve space for all images (width/height or aspect-ratio). Never shift content.
- **INP**: Keep interaction handlers fast. Debounce scroll handlers. Avoid long tasks.

---

# 26 — SEO / Content Architecture

## Product Family SEO

| Page | Target Keywords |
|---|---|
| Lampes 3D collection | lampe 3D personnalisée, lampe LED personnalisée, lampe de naissance personnalisée, lampe anniversaire |
| Trophées collection | trophée personnalisé, trophée gravure, coupe personnalisée, plaque commémorative |
| Cartes du monde collection | carte du monde en bois, carte du monde murale, carte 3D bois, carte monde LED |
| Best-sellers | cadeaux personnalisés best-sellers, meilleurs cadeaux |

## Occasion-Based SEO

| Page | Target Keywords |
|---|---|
| Anniversaire | cadeau anniversaire personnalisé, cadeau anniversaire maman, cadeau anniversaire enfant |
| Mariage | cadeau de mariage personnalisé, cadeau couple marié, cadeau fiançailles |
| BAC / Diplôme | cadeau réussite BAC, cadeau diplôme, cadeau soutenance |
| Maman | cadeau maman personnalisé, cadeau fête des mères, cadeau naissance |
| Naissance | cadeau naissance personnalisé, cadeau bébé, cadeau baptême |
| Sport | cadeau sportif personnalisé, trophée football, cadeau championnat |
| Médecin | cadeau médecin personnalisé, cadeau profession santé |
| Enseignant | cadeau enseignant, cadeau professeur, remerciement enseignant |

## Gift Idea SEO

| Query Pattern | Target Page |
|---|---|
| "cadeau pour [recipient]" | Recipient collection |
| "cadeau [occasion]" | Occasion collection |
| "cadeau [price] euros" | Price-range collection |
| "cadeau personnalisé [type]" | Product type collection |
| "trophée [event]" | Trophy collection |
| "lampe [occasion]" | Lamp collection |

## Content Architecture

| Content Type | SEO Value |
|---|---|
| Gift guides | Long-tail keywords, internal linking, authority |
| Product care guides | Support queries, trust building |
| Brand story | Brand searches, trust, differentiation |
| Customer stories | Long-tail, social proof, emotional connection |
| Installation guides | Support queries, reduce returns |

## On-Page SEO Requirements

| Element | Requirement |
|---|---|
| Title tag | Unique per page, 50-60 characters, primary keyword first |
| Meta description | Unique, 150-160 characters, compelling with CTA |
| H1 | One per page, matches title tag intent |
| Alt text | Descriptive for all product images |
| Internal linking | Cross-link between collections, products, guides |
| Schema markup | Product, Offer, Review, BreadcrumbList, FAQPage |
| URL structure | `/collections/lampes-3d`, `/products/lampe-led-etoile` |
| Canonical | Self-referencing canonicals on all pages |
| Hreflang | `fr` for French, `en` for English (when available) |

---

# 27 — Data Requirements

## Conceptual Data Model

These are the entities and relationships needed. No database schema — just the data that must exist.

### PRODUCT

| Field | Type | Notes |
|---|---|---|
| id | Unique identifier | Internal |
| title | String | "Lampe LED 3D Personnalisée — Étoile" |
| slug | String | "lampe-led-3d-etoile" |
| description | Rich text | Full product description |
| short_description | String | 1-2 sentence summary |
| product_type | Enum | lamp, trophy, map |
| collections | Array | Which collections this product belongs to |
| occasions | Array | Which occasions this product is for |
| recipients | Array | Which recipients this product suits |
| images | Array | Product images (primary, alternate, gallery) |
| videos | Array | Product videos |
| variants | Array | Product variants (see VARIANT) |
| personalization_fields | Array | Available personalization options (see PERSONALIZATION_FIELD) |
| price | Number | Base price |
| compare_at_price | Number | Original price before discount |
| badge | Enum | best_seller, new, promo, personalizable, free_shipping |
| reviews | Reference | Linked to REVIEW collection |
| seo | Object | title, description, schema |
| production_time | String | "3-5 jours ouvrés" |
| in_stock | Boolean | Availability |
| tags | Array | For filtering and search |

### VARIANT

| Field | Type | Notes |
|---|---|---|
| id | Unique identifier | Internal |
| product_id | Reference | Parent product |
| title | String | "Taille M / Rose / Base Bois" |
| options | Object | { size: "M", color: "Rose", base: "Bois" } |
| price | Number | Variant-specific price |
| compare_at_price | Number | Variant-specific original price |
| in_stock | Boolean | Availability |
| weight | Number | For shipping calculation |
| image | Reference | Variant-specific image |

### COLLECTION

| Field | Type | Notes |
|---|---|---|
| id | Unique identifier | Internal |
| title | String | "Lampes 3D Personnalisées" |
| slug | String | "lampes-3d" |
| description | Rich text | Collection description |
| hero_image | Image | Collection hero image |
| parent_collection | Reference | For nested collections |
| sort_order | Number | Display order |
| seo | Object | title, description |
| products | Array | Products in this collection |

### OCCASION

| Field | Type | Notes |
|---|---|---|
| id | Unique identifier | Internal |
| title | String | "Anniversaire" |
| slug | String | "anniversaire" |
| description | String | Brief description |
| image | Image | Occasion image |
| products | Array | Products tagged with this occasion |

### RECIPIENT

| Field | Type | Notes |
|---|---|---|
| id | Unique identifier | Internal |
| title | String | "Pour elle" |
| slug | String | "pour-elle" |
| description | String | Brief description |
| image | Image | Recipient image |
| products | Array | Products tagged for this recipient |

### PERSONALIZATION_FIELD

| Field | Type | Notes |
|---|---|---|
| id | Unique identifier | Internal |
| product_id | Reference | Parent product |
| field_type | Enum | text, color_swatch, size_button, date, file_upload, font_select, radio_group |
| label | String | "Nom" / "Couleur de lumière" / "Photo" |
| required | Boolean | Must be completed before purchase |
| max_length | Number | Character limit (for text fields) |
| options | Array | Available choices (for swatch/button/radio) |
| sort_order | Number | Display order in configurator |
| default_value | Any | Pre-selected option |
| validation | Object | Rules for this field |

### PERSONALIZATION_VALUE

| Field | Type | Notes |
|---|---|---|
| id | Unique identifier | Internal |
| cart_line_item_id | Reference | Which cart item |
| field_id | Reference | Which personalization field |
| value | String/File | The user's input |
| preview_url | URL | Generated preview image |

### UPLOAD

| Field | Type | Notes |
|---|---|---|
| id | Unique identifier | Internal |
| filename | String | Original filename |
| url | URL | Stored file URL |
| mime_type | String | image/jpeg, image/png |
| size | Number | File size in bytes |
| width | Number | Image width |
| height | Number | Image height |
| created_at | Timestamp | Upload time |

### PRICE

| Field | Type | Notes |
|---|---|---|
| amount | Number | Price in cents/smallest unit |
| currency | String | EUR, USD |
| compare_at_amount | Number | Original price |
| includes_tax | Boolean | Tax-inclusive pricing |

### DISCOUNT

| Field | Type | Notes |
|---|---|---|
| code | String | Promo code |
| type | Enum | percentage, fixed_amount |
| value | Number | Discount amount/percentage |
| min_order | Number | Minimum order amount |
| valid_from | Date | Start date |
| valid_until | Date | End date |
| usage_limit | Number | Max uses |
| applies_to | Array | Specific products/collections or all |

### INVENTORY

| Field | Type | Notes |
|---|---|---|
| variant_id | Reference | Which variant |
| quantity | Number | Available stock |
| track_inventory | Boolean | Whether to track |
| allow_backorder | Boolean | Can sell when out of stock |

### PRODUCTION_TIME

| Field | Type | Notes |
|---|---|---|
| product_type | Enum | lamp, trophy, map |
| min_days | Number | Minimum production days |
| max_days | Number | Maximum production days |
| label | String | "3-5 jours ouvrés" |

### REVIEW

| Field | Type | Notes |
|---|---|---|
| id | Unique identifier | Internal (or platform ID) |
| product_id | Reference | Which product |
| author | String | Reviewer name |
| rating | Number | 1-5 |
| text | String | Review content |
| photos | Array | Customer-uploaded images |
| verified | Boolean | Verified purchase |
| date | Timestamp | Review date |
| helpful | Number | "Utile" votes |

### CUSTOMER_MEDIA

| Field | Type | Notes |
|---|---|---|
| id | Unique identifier | Internal |
| customer_name | String | Submitter name |
| image_url | URL | Photo URL |
| product_id | Reference | Associated product |
| occasion | String | Occasion context |
| approved | Boolean | Curated/approved for display |
| featured | Boolean | Featured on homepage |

### BLOG_ARTICLE

| Field | Type | Notes |
|---|---|---|
| id | Unique identifier | Internal |
| title | String | Article title |
| slug | String | URL slug |
| excerpt | String | Short description |
| content | Rich text | Full article content |
| featured_image | Image | Hero image |
| category | Enum | guides_cadeaux, conseils, histoires |
| tags | Array | Tags for filtering |
| published_at | Timestamp | Publication date |
| author | String | Author name |
| seo | Object | title, description |

### CART_LINE_ITEM

| Field | Type | Notes |
|---|---|---|
| id | Unique identifier | Internal |
| product_id | Reference | Which product |
| variant_id | Reference | Which variant |
| quantity | Number | 1-10 |
| personalization_values | Array | PERSONALIZATION_VALUE records |
| price | Number | Line item price |
| thumbnail | URL | Cart thumbnail image |
| production_time | String | Per-item production estimate |

---

# 28 — Owner Input Checklist

## CRITICAL BEFORE IMPLEMENTATION

These inputs block development. Without them, pages cannot be built with real content.

| # | Input | Description | Impact |
|---|---|---|---|
| 1 | **Product catalog** | Complete list of all products with names, descriptions, prices | All pages |
| 2 | **Product photography** | High-quality images for all products (minimum 8-10 per product) | All pages |
| 3 | **Lamp models** | Specific lamp designs available (star, heart, music note, football, etc.) | Lamp PDP, configurator |
| 4 | **Lamp colors** | Available LED light colors per model | Configurator |
| 5 | **Base types** | Available base options (wood, acrylic, etc.) | Configurator |
| 6 | **Trophy models** | Specific trophy designs available (cup, plaque, star, medal, crystal) | Trophy PDP |
| 7 | **Engraving options** | What can be engraved on trophies (text limits, logo upload, etc.) | Trophy configurator |
| 8 | **Map sizes** | Available map dimensions (M, L, XL, 2XL with exact cm) | Map PDP |
| 9 | **Map styles** | Available map styles (3D, LED, colored, natural, panneau) | Map configurator |
| 10 | **Personalization fields** | Exact customization options per product type | All configurators |
| 11 | **Pricing** | Product prices, promotional prices, discount structures | All pages |
| 12 | **Production times** | Manufacturing/personalization lead times per product type | PDP, cart, checkout |
| 13 | **Shipping pricing** | Domestic and international shipping costs | Cart, checkout |
| 14 | **Free shipping threshold** | Minimum order for free shipping (recommended: 100€) | Cart |
| 15 | **Regions served** | Countries/regions where Michket ships | Shipping |
| 16 | **Returns policy** | Return/exchange rules (especially for personalized items) | Footer, PDP, checkout |
| 17 | **Cancellation policy** | Can personalized orders be cancelled? Under what conditions? | Checkout, FAQ |
| 18 | **Warranty** | Warranty terms and duration | PDP, trust badges |
| 19 | **Payment methods** | Which payment providers to integrate | Checkout |
| 20 | **Domain name** | Michket website URL | All configuration |
| 21 | **Currency** | Primary currency (EUR recommended) | All pricing |
| 22 | **Languages** | Supported languages (French default, English optional) | i18n |

## REQUIRED DURING IMPLEMENTATION

These inputs are needed as specific features are built.

| # | Input | Description | When Needed |
|---|---|---|---|
| 23 | **Brand story** | Founder story, mission, values | About page, homepage Section 10 |
| 24 | **Social media links** | Instagram, Facebook, TikTok, Pinterest, YouTube URLs | Footer, header |
| 25 | **Contact information** | Email, WhatsApp, phone, physical address | Footer, contact page |
| 26 | **Blog content** | Initial 3-5 blog posts (gift guides, product care) | Blog, homepage Section 12 |
| 27 | **Legal pages** | Terms of service, privacy policy, shipping policy, returns policy | Footer, checkout |
| 28 | **Business registration** | SIRET, company name, legal entity | Legal pages |
| 29 | **Review platform** | Trustpilot, Judge.me, Loox, or alternative | Reviews integration |
| 30 | **Email marketing** | Klaviyo, Mailchimp, or alternative | Newsletter signup |
| 31 | **Analytics** | GA4, Meta Pixel, or alternatives | Header/footer scripts |

## REQUIRED BEFORE LAUNCH

| # | Input | Description |
|---|---|---|
| 32 | **Customer reviews** | Existing reviews to seed review sections |
| 33 | **Customer photos** | Existing UGC for inspiration gallery (minimum 12 photos) |
| 34 | **Product videos** | Product demos, unboxing, installation guides (minimum 3) |
| 35 | **SEO metadata** | Title tags, meta descriptions for all pages |
| 36 | **Favicon** | Website favicon (multiple sizes) |
| 37 | **OG images** | Social sharing images for all page types |
| 38 | **404 page** | Custom 404 page content |

## OPTIONAL / FUTURE

| # | Input | Description |
|---|---|---|
| 39 | **Seasonal promotions** | Holiday-specific campaigns (Black Friday, Noël, Fête des mères) |
| 40 | **Affiliate program** | Partner/referral program details |
| 41 | **Wholesale program** | B2B pricing and terms |
| 42 | **Gift wrapping options** | Premium gift wrapping details and pricing |
| 43 | **Loyalty program** | Points, rewards, VIP tiers |
| 44 | **Multi-currency** | USD, GBP pricing (if international expansion) |
| 45 | **Chat/support** | Live chat or chatbot integration |

---

---

# 29 — Asset Inventory

Complete list of photos, videos, and assets required to build the Michket website.

## Brand Assets

| # | Asset | Specification | Status |
|---|---|---|---|
| 1 | Logo (primary) | Warm gold on transparent, SVG + PNG | REQUIRED |
| 2 | Logo (dark variant) | Near black on transparent, SVG + PNG | REQUIRED |
| 3 | Logo (light variant) | White on transparent, SVG + PNG | REQUIRED |
| 4 | Favicon | 16×16, 32×32, 180×180 (Apple), SVG | REQUIRED |
| 5 | OG image | 1200×630, brand image for social sharing | REQUIRED |
| 6 | Pattern/texture (optional) | Subtle brand pattern for backgrounds | OPTIONAL |

## Hero Photography

| # | Asset | Context | Specification |
|---|---|---|---|
| 7 | Hero 1 — LED Lamp | Homepage hero carousel | 2800×1000px, cinematic, dark environment, lamp glowing |
| 8 | Hero 2 — Map on wall | Homepage hero carousel | 2800×1000px, room setting, warm lighting |
| 9 | Hero 3 — Trophy | Homepage hero carousel | 2800×1000px, ceremony/desk, engraved detail |
| 10 | Hero 4 — Gift moment | Homepage hero carousel | 2800×1000px, emotional gift-giving scene |

## Category Thumbnails (Mega-menu + Homepage Circles)

| # | Asset | Context |
|---|---|---|
| 11 | Category: Lampes 3D | Mega-menu thumbnail + homepage circle |
| 12 | Category: Trophées | Mega-menu thumbnail + homepage circle |
| 13 | Category: Cartes du monde | Mega-menu thumbnail + homepage circle |
| 14 | Category: Cadeaux | Mega-menu thumbnail + homepage circle |
| 15 | Category: Nouveautés | Homepage circle |
| 16 | Category: Occasions | Homepage circle |

## Occasion Images (Homepage Section 8)

| # | Asset | Occasion |
|---|---|---|
| 17 | Occasion image | Anniversaire |
| 18 | Occasion image | Mariage / Fiançailles |
| 19 | Occasion image | Couple / Saint-Valentin |
| 20 | Occasion image | Maman / Fête des mères |
| 21 | Occasion image | Papa / Fête des pères |
| 22 | Occasion image | Naissance / Bébé |
| 23 | Occasion image | Diplôme |
| 24 | Occasion image | Soutenance |
| 25 | Occasion image | BAC |
| 26 | Occasion image | Enseignant |
| 27 | Occasion image | Médecin / Profession |
| 28 | Occasion image | Sport / Football |
| 29 | Occasion image | Remerciement |

## Lamp Product Photography (Per Product, Minimum 10 Images)

| # | Shot Type | Purpose |
|---|---|---|
| 30 | Hero on dark background | Primary product image |
| 31 | In room — night, glowing | Lifestyle/emotional |
| 32 | In room — day, unlit | Daytime appearance |
| 33 | Close-up — acrylic detail | Material quality |
| 34 | Close-up — LED glow | Light quality |
| 35 | Base detail | Base craftsmanship |
| 36 | Personalization examples | Show 2-3 customization variants |
| 37 | Size comparison | Scale reference |
| 38 | Packaging/unboxing | Premium unboxing experience |
| 39 | Alternate angle | Secondary product image (hover) |
| 40 | Video — light modes | LED functionality demo (15-30s) |

## Trophy Product Photography (Per Product, Minimum 8 Images)

| # | Shot Type | Purpose |
|---|---|---|
| 41 | Hero on dark background | Primary product image |
| 42 | Engraving close-up | Personalization quality |
| 43 | In ceremony setting | Achievement context |
| 44 | Multiple trophies | Collection/scale |
| 45 | Material texture | Craftsmanship detail |
| 46 | Size comparison | Scale reference |
| 47 | Packaging | Premium presentation |
| 48 | Alternate angle | Secondary product image |

## Map Product Photography (Per Product, Minimum 10 Images)

| # | Shot Type | Purpose |
|---|---|---|
| 49 | Map on wall — hero room | Primary product image |
| 50 | Room setting — living room | Lifestyle |
| 51 | Room setting — bedroom | Lifestyle |
| 52 | Room setting — office | Lifestyle |
| 53 | Close-up — wood layers | 3D detail |
| 54 | Close-up — LED illumination | Light feature (if LED) |
| 55 | Size comparison | Scale reference |
| 56 | Installation process | How-to |
| 57 | Mounting hardware | What's included |
| 58 | Packaging | What arrives |

## Before/After Pairs

| # | Before | After |
|---|---|---|
| 59 | Dark room, no lamp | Same room, lamp illuminated |
| 60 | Bare wall | Same wall with map installed |
| 61 | Plain desk | Desk with engraved trophy |

## Homepage Lifestyle Images

| # | Asset | Context |
|---|---|---|
| 62 | Category spotlight: Lampes | Atmospheric lamp photo |
| 63 | Category spotlight: Trophées | Atmospheric trophy photo |
| 64 | Category spotlight: Cartes | Atmospheric map photo |
| 65 | Craftsmanship image | Hands working on product / material close-up |

## Customer UGC (Initial Seed, Minimum 12 Photos)

| # | Content | Source |
|---|---|---|
| 66-77 | 12+ customer photos showing products in real homes | Customer submissions, Instagram #MichketMoment |

## Blog Featured Images (Initial 3 Articles)

| # | Asset | Article Topic |
|---|---|---|
| 78 | Blog image | "Les 10 meilleurs cadeaux pour la fête des mères" |
| 79 | Blog image | "Comment installer votre carte du monde en bois" |
| 80 | Blog image | "Les moments qui comptent — histoires Michket" |

## Trust & UI Icons

| # | Asset | Context |
|---|---|---|
| 81 | Icon: Livraison | Trust badges, footer |
| 82 | Icon: Garantie | Trust badges, footer |
| 83 | Icon: Paiement sécurisé | Trust badges, footer |
| 84 | Icon: Personnalisé | Trust badges, footer |
| 85 | Icon: Emballage cadeau | Trust badges, footer |
| 86 | Star icons | Review stars (empty, half, full) |
| 87 | Arrow icons | Carousel navigation |
| 88 | Close icon (X) | Drawers, overlays |
| 89 | Hamburger icon | Mobile navigation |
| 90 | Search icon | Header |
| 91 | Cart icon | Header |
| 92 | Heart icon | Wishlist |
| 93 | Checkmark icon | Completed steps, verified |

---

# 30 — Implementation Roadmap

## Phase 0 — Owner Inputs / Asset Preparation

| Property | Detail |
|---|---|
| **Objective** | Gather all critical owner inputs and assets before any code is written |
| **Deliverables** | Complete product catalog, all product photography, brand assets, pricing, policies |
| **Dependencies** | Owner availability, photographer, brand designer |
| **Acceptance criteria** | All 22 CRITICAL owner inputs (Section 28) received and documented |
| **Tools** | None (human coordination) |

## Phase 1 — Technical Architecture Decision

| Property | Detail |
|---|---|
| **Objective** | Finalize framework, hosting, commerce platform, and key integrations |
| **Deliverables** | Technology stack document, repository setup |
| **Dependencies** | Phase 0 complete |
| **Acceptance criteria** | Framework chosen (Next.js App Router recommended), commerce platform selected, repository initialized |
| **Tools** | Context7 (for framework docs), vercel-react-best-practices |

## Phase 2 — Project Foundation

| Property | Detail |
|---|---|
| **Objective** | Initialize Next.js project with TypeScript strict mode, Tailwind CSS, and base configuration |
| **Deliverables** | Working Next.js app, Tailwind config with Michket design tokens, folder structure |
| **Dependencies** | Phase 1 complete |
| **Acceptance criteria** | `npm run dev` works, Tailwind renders, TypeScript compiles with strict mode |
| **Tools** | Next.js, TypeScript, Tailwind CSS, Context7 |

## Phase 3 — Design Tokens / Global Shell

| Property | Detail |
|---|---|
| **Objective** | Implement the complete Michket design system as Tailwind tokens and base components |
| **Deliverables** | Color tokens, typography, spacing scale, button components, form controls, badge components |
| **Dependencies** | Phase 2 complete |
| **Acceptance criteria** | All design system elements from Section 20 implemented and renderable |
| **Tools** | ui-ux-pro-max, michket-brand skill, web-design-guidelines |

## Phase 4 — Header + Navigation

| Property | Detail |
|---|---|
| **Objective** | Build the complete desktop and mobile header with mega-menu system |
| **Deliverables** | Desktop header with mega-menus (Section 3), mobile header with drawer (Section 4), sticky behavior |
| **Dependencies** | Phase 3 complete |
| **Acceptance criteria** | All 7 mega-menus functional, mobile drawer with accordion, sticky header, keyboard accessible |
| **Tools** | michket-brand skill, web-design-guidelines, Claude Browser |

## Phase 5 — Homepage

| Property | Detail |
|---|---|
| **Objective** | Build all 14 homepage sections as specified in Section 5 |
| **Deliverables** | All 14 sections: announcement, nav, hero, bestsellers, categories, social proof, new arrivals, occasions, before/after, craftsmanship, UGC, blog, newsletter, footer |
| **Dependencies** | Phase 4 complete, product data available, photography available |
| **Acceptance criteria** | All 14 sections render correctly, responsive, interactive elements work |
| **Tools** | michket-brand skill, ui-ux-pro-max, Claude Browser |

## Phase 6 — Homepage Visual Review / Refinement

| Property | Detail |
|---|---|
| **Objective** | Visually inspect and refine the homepage against Michket brand standards and ETW comparison |
| **Deliverables** | Refined homepage passing brand review |
| **Dependencies** | Phase 5 complete |
| **Acceptance criteria** | Passes Page Review Checklist (Section 31), no generic design patterns, matches ETW commercial depth |
| **Tools** | michket-brand skill, Claude Browser, web-design-guidelines, frontend-design |

## Phase 7 — Collection System

| Property | Detail |
|---|---|
| **Objective** | Build collection page template with all variations (Section 6) |
| **Deliverables** | Collection page component, filters, sorting, subcategory carousel, editorial inserts |
| **Dependencies** | Phase 3 complete, product data available |
| **Acceptance criteria** | All 6 collection variations work (lampes, trophées, cartes, cadeaux, recipients, search) |
| **Tools** | michket-brand skill, Claude Browser |

## Phase 8 — Product Card System

| Property | Detail |
|---|---|
| **Objective** | Build the unified product card component (Section 7) |
| **Deliverables** | Product card with all variants (grid, carousel, compact), badges, hover states |
| **Dependencies** | Phase 3 complete |
| **Acceptance criteria** | Card renders in all contexts (collection, carousel, recommendations, search) |
| **Tools** | michket-brand skill, Claude Browser |

## Phase 9 — Lamp PDP

| Property | Detail |
|---|---|
| **Objective** | Build the complete lamp product page (Section 8) |
| **Deliverables** | Gallery, pricing, trust, description, specs, FAQ, reviews, recommendations |
| **Dependencies** | Phase 7, Phase 8 complete |
| **Acceptance criteria** | All 21 PDP sections render, gallery works, accordions function |
| **Tools** | michket-brand skill, Claude Browser |

## Phase 10 — Personalization Configurator

| Property | Detail |
|---|---|
| **Objective** | Build the staged personalization configurator (Section 11) |
| **Deliverables** | Desktop inline configurator, mobile accordion configurator, live preview, validation |
| **Dependencies** | Phase 9 complete |
| **Acceptance criteria** | All configurator steps work, preview updates live, validation prevents incomplete purchase |
| **Tools** | michket-brand skill, Claude Browser, web-design-guidelines |

## Phase 11 — Trophy PDP

| Property | Detail |
|---|---|
| **Objective** | Build the trophy product page with trophy-specific configurator (Section 9) |
| **Deliverables** | Trophy gallery, trophy configurator (engraving, material, size), trophy-specific content |
| **Dependencies** | Phase 10 complete |
| **Acceptance criteria** | Trophy configurator works independently, engraving preview functions |
| **Tools** | michket-brand skill, Claude Browser |

## Phase 12 — Map PDP

| Property | Detail |
|---|---|
| **Objective** | Build the map product page with map-specific configurator (Section 10) |
| **Deliverables** | Map gallery, map configurator (style, size, language), size guide, installation content, before/after |
| **Dependencies** | Phase 10 complete |
| **Acceptance criteria** | Map configurator works, size guide is accurate, before/after slider functions |
| **Tools** | michket-brand skill, Claude Browser |

## Phase 13 — Cart

| Property | Detail |
|---|---|
| **Objective** | Build the cart drawer with personalization summaries (Section 13) |
| **Deliverables** | Desktop cart drawer, mobile cart drawer, free shipping bar, recommendations, personalization display |
| **Dependencies** | Phase 9-12 complete (all PDPs) |
| **Acceptance criteria** | Cart drawer opens/closes, personalization shown per item, free shipping bar animates, checkout handoff works |
| **Tools** | michket-brand skill, Claude Browser |

## Phase 14 — Search

| Property | Detail |
|---|---|
| **Objective** | Build predictive search overlay and search results page (Section 15) |
| **Deliverables** | Desktop search overlay, mobile fullscreen search, predictive results, search results page |
| **Dependencies** | Phase 7 complete (collection template), product data indexed |
| **Acceptance criteria** | Search returns relevant results, occasion/recipient queries work, no-result state displays |
| **Tools** | michket-brand skill, Claude Browser |

## Phase 15 — UGC / Reviews / Editorial

| Property | Detail |
|---|---|
| **Objective** | Build UGC gallery, review integration, blog system (Sections 16, 17, 18) |
| **Deliverables** | Inspiration page, review components, blog templates, before/after component |
| **Dependencies** | Phase 7 complete, review platform integrated, UGC photos available |
| **Acceptance criteria** | Reviews render from platform, UGC gallery displays, blog posts render |
| **Tools** | michket-brand skill, Claude Browser |

## Phase 16 — Responsive Refinement

| Property | Detail |
|---|---|
| **Objective** | Test and refine all pages across all breakpoints (Section 23) |
| **Deliverables** | Responsive-tested pages at 375px, 390px, 414px, 768px, 1024px, 1280px, 1440px |
| **Dependencies** | Phases 5-15 complete |
| **Acceptance criteria** | No horizontal overflow, all touch targets 44px+, all layouts correct at each breakpoint |
| **Tools** | Claude Browser (resize), mobile device testing |

## Phase 17 — Accessibility

| Property | Detail |
|---|---|
| **Objective** | Full accessibility audit and remediation (Section 24) |
| **Deliverables** | WCAG 2.1 AA compliance, keyboard navigation, screen reader testing |
| **Dependencies** | Phase 16 complete |
| **Acceptance criteria** | All focus states visible, all interactive elements keyboard-accessible, no contrast violations, ARIA attributes correct |
| **Tools** | web-design-guidelines, axe-core, keyboard testing |

## Phase 18 — Performance

| Property | Detail |
|---|---|
| **Objective** | Optimize performance for Core Web Vitals (Section 25) |
| **Deliverables** | Optimized images, lazy loading, code splitting, font optimization |
| **Dependencies** | Phase 16 complete |
| **Acceptance criteria** | LCP < 2.5s, CLS < 0.1, FID < 100ms on mobile 3G simulation |
| **Tools** | Lighthouse, vercel-react-best-practices, Web Vitals |

## Phase 19 — Commerce Integration

| Property | Detail |
|---|---|
| **Objective** | Connect real commerce backend (Shopify, Stripe, etc.) |
| **Deliverables** | Real product data, real cart/checkout, real payments, real order processing |
| **Dependencies** | All previous phases complete, commerce platform account set up |
| **Acceptance criteria** | End-to-end purchase flow works with real payment processing |
| **Tools** | Commerce platform SDK, Stripe |

## Phase 20 — Launch QA

| Property | Detail |
|---|---|
| **Objective** | Final quality assurance before public launch |
| **Deliverables** | QA report, bug fixes, final content review |
| **Dependencies** | Phase 19 complete |
| **Acceptance criteria** | All pages pass Page Review Checklist, no broken links, no console errors, all forms work, analytics tracking confirmed |
| **Tools** | All skills, Claude Browser, manual testing |

---

# 31 — Page Review Checklist

After implementing every major page, Claude MUST follow this checklist.

## Pre-Review

- [ ] Load `/michket-brand` skill
- [ ] Load `ui-ux-pro-max` skill
- [ ] Load `frontend-design` skill
- [ ] Load `web-design-guidelines` skill
- [ ] Load `vercel-react-best-practices` skill

## Visual Review — Desktop (1280px+)

- [ ] Page renders without console errors
- [ ] All images load (no broken images)
- [ ] Typography matches Michket brand (correct fonts, sizes, weights)
- [ ] Color palette matches Michket brand (gold, ivory, black — not generic)
- [ ] Buttons are styled correctly (gold CTA, outline secondary)
- [ ] Badges display correctly (BEST SELLER, NOUVEAU, PERSONNALISABLE)
- [ ] Hover states work (image swap, button hover, link hover)
- [ ] Mega-menu opens on hover, displays correct content
- [ ] Sticky header works on scroll
- [ ] Carousels navigate correctly (arrows, dots)
- [ ] Accordions open/close smoothly
- [ ] No horizontal overflow
- [ ] Spacing is consistent (not cramped, not excessive)
- [ ] Visual hierarchy is clear (headings, body, captions)
- [ ] No generic AI design patterns (no purple gradients, no glassmorphism, no bouncy effects)

## Visual Review — Mobile (375px / 390px)

- [ ] Page renders without console errors
- [ ] All images load and are appropriately sized
- [ ] Touch targets are minimum 44px
- [ ] Mobile header is compact and functional
- [ ] Hamburger drawer opens and closes correctly
- [ ] Accordion navigation works in drawer
- [ ] Product grid shows 2 columns
- [ ] Configurator accordion steps work
- [ ] Bottom sheets open and close
- [ ] Sticky Add to Cart bar appears and functions
- [ ] Sticky preview bar appears (if applicable)
- [ ] No horizontal overflow at any width
- [ ] Text is readable (no tiny text)
- [ ] Forms are usable with virtual keyboard

## Responsive Review

- [ ] Tested at 375px, 390px, 414px, 768px, 1024px, 1280px, 1440px
- [ ] Layout adapts correctly at each breakpoint
- [ ] Product grid columns change appropriately
- [ ] Navigation adapts (drawer → mega-menu)
- [ ] Footer adapts (accordion → columns)
- [ ] Images resize correctly

## Console / Network Check

- [ ] No JavaScript errors in console
- [ ] No 404 errors for images or resources
- [ ] No mixed content warnings (HTTP on HTTPS)
- [ ] Third-party scripts load without errors
- [ ] Fonts load correctly (no FOUT/FOIT)

## Accessibility Check

- [ ] Heading hierarchy is correct (one H1, sequential H2-H4)
- [ ] All images have alt text (descriptive for products, empty for decorative)
- [ ] All interactive elements are keyboard-accessible
- [ ] Focus states are visible (gold outline)
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Form inputs have visible labels
- [ ] Error messages are linked to inputs
- [ ] Skip link exists and works
- [ ] Focus trap works in drawers/modals
- [ ] `prefers-reduced-motion` is respected

## Performance Check

- [ ] Images are optimized (WebP, correct sizes)
- [ ] Below-fold images are lazy-loaded
- [ ] Fonts use `font-display: swap`
- [ ] No render-blocking resources above the fold
- [ ] Lighthouse performance score > 80

## Anti-Generic Design Review

- [ ] No purple/blue AI gradients
- [ ] No glassmorphism
- [ ] No generic SaaS hero patterns
- [ ] No identical rounded cards everywhere
- [ ] No excessive pill-shaped elements
- [ ] No meaningless decorative blobs
- [ ] No fake metrics or testimonials
- [ ] No generic stock imagery
- [ ] No Lucide icons used as filler decoration
- [ ] No shadcn default styling visible
- [ ] Page feels premium, warm, emotional — not like a template

## ETW Depth Comparison

- [ ] Page has comparable commercial depth to Enjoy The Wood equivalent
- [ ] All relevant sections from ETW pattern are present
- [ ] Product information hierarchy matches ETW quality
- [ ] Trust signals are present and prominent
- [ ] Cross-selling / recommendations are present
- [ ] Mobile experience is first-class (not reduced desktop)

---

# 32 — Non-Negotiable Rules

These rules are absolute. They apply to every Claude Code session working on Michket.

## Architecture Rules

1. **Do not simplify Michket into a generic landing page.** The homepage must have 14+ sections with deep commercial sequencing. Every page must have the depth of a mature e-commerce brand.

2. **Do not use a generic Shopify-theme appearance.** Michket must look custom, premium, and intentional. The user should never suspect a template was used.

3. **Do not use SaaS visual patterns.** No purple gradients, no glassmorphism, no dashboard mockups, no startup landing page templates.

4. **Do not use shadcn defaults as the visual identity.** shadcn primitives may be used for accessible behavior, but every component must be visually customized to match the Michket brand. The user should never identify the component library.

## Content Rules

5. **Do not invent products, prices, reviews, or business information.** All product data comes from the owner. Placeholder data must be clearly marked as `[OWNER INPUT REQUIRED]`. Never fabricate reviews, testimonials, or customer counts.

6. **Do not copy Enjoy The Wood's proprietary text, photography, or creative assets.** Enjoy The Wood is a structural reference only. Michket has its own identity, its own voice, its own photography.

7. **Do not use AI-generated copy without human review.** Product descriptions, blog posts, and marketing copy must feel human-written, specific, and emotional — not generic.

## Design Rules

8. **Do preserve the researched Enjoy The Wood commercial depth.** Every pattern marked MUST ADAPT in the research must be implemented. Do not skip sections because they seem "optional."

9. **Do make personalization a first-class experience.** The configurator is not a form — it is a premium, staged, interactive experience. Live preview is essential. Incomplete personalization must never be purchasable.

10. **Do design mobile independently, not as reduced desktop.** Mobile has its own header, its own navigation pattern, its own configurator model (accordion steps), its own sticky bars. Every page must be tested at 375px.

## Quality Rules

11. **Do visually inspect implemented pages before declaring them complete.** Use Claude Browser to screenshot and snapshot every page. Check desktop AND mobile. Run the Page Review Checklist (Section 31).

12. **Do persist important research/decisions to disk.** Never rely on conversation context alone. If a decision is made, document it. If research is performed, save it.

13. **Do run the anti-generic design review on every page.** If any element looks like it could be from a SaaS template, a Shopify theme, or an AI generator — fix it.

14. **Do maintain the Michket brand palette consistently.** Near black, warm gold, amber, warm ivory, wood tones. Lamp RGB colors belong to product content only. Never let neon or cool colors into the UI.

## Technical Rules

15. **Do use TypeScript strict mode throughout.** No `any` types. No type assertions unless absolutely necessary.

16. **Do use semantic HTML.** Proper landmarks, heading hierarchy, lists, tables, forms. Not div-soup.

17. **Do implement accessibility from the start.** Not as an afterthought. Focus states, ARIA attributes, keyboard navigation, contrast ratios — all from the first commit.

18. **Do optimize images from the start.** WebP format, responsive srcset, lazy loading, blurhash placeholders. Not "optimize later."

---

> **End of Michket E-Commerce Blueprint**
> Version 1.0 — 2026-08-25
> This document is the single source of truth for the Michket website implementation.
