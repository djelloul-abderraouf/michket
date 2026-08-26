# Enjoy The Wood — Final Gap Audit

> Research Batch 4 (FINAL) — 2026-08-25
> Closing remaining gaps before writing the Michket e-commerce blueprint.
> Incremental persistence: findings saved after each phase.

## Audit Status
- Desktop mega-menu: COMPLETE
- Search overlay: COMPLETE
- UGC / Inspiration: COMPLETE
- Footer: COMPLETE
- Merchandising interactions: COMPLETE

---

# Desktop Mega-Menu Architecture

## Overview

Enjoy The Wood uses a **mixed navigation model**: 4 items with full mega-menus (multi-column, image-rich) and 2 items with standard flyout menus (single-column, text-only). The mega-menus serve as visual discovery tools, not plain sitemaps.

## Navigation Items

| Item | Menu Type | Columns | Images | Promo Banner |
|---|---|---|---|---|
| BESTSELLERS | No dropdown (badge: SALE) | — | — | — |
| WORLD MAPS | Mega-menu | 3 + banner | Yes (all subcategories) | Yes (bestseller product) |
| COUNTRY MAPS | Mega-menu | 2 + banner | Yes (all subcategories) | Yes (USA maps) |
| KIDS & BABY | Mega-menu | 2 (visual + text) | Left column only | No |
| HARRY POTTER DECOR | Flyout | 1 | No | No |
| DECOR & ACCESSORIES | Flyout | 1 | No | No |
| SHOP ALL | Mega-menu | 3 + banner | Banner only | Yes (founder's book) |

## Detailed Mega-Menu Breakdown

### WORLD MAPS Mega-Menu

**Layout:** 3 columns of image-linked categories + full-width promotional banner at top

**Promotional banner:**
- Featured product: "3D Multilayered World Map Multicolor"
- Badge: "BEST SELLER"
- Links to product page

**Category columns (with thumbnail images):**
1. All World Maps
2. 3D Wooden World Maps
3. 3D Colored World Maps
4. 3D LED World Maps
5. 3D Luminous World Maps
6. Wooden Map on Board
7. Premium Solid World Maps
8. World Maps on Canvas
9. Home Decor Bundles
10. 2D Wooden World Maps
11. Custom Wooden World Map
12. Accessories

**Visual treatment:** Each subcategory has a square thumbnail image showing the product type. Text overlay or caption identifies the category.

**Michket adaptation:**
- Banner: Featured Michket LED lamp or wooden map
- Categories: Lampes 3D LED, Lampes de naissance, Lampes couple, Lampes sport, etc.

### COUNTRY MAPS Mega-Menu

**Layout:** 2 columns of image-linked countries + promotional banner

**Promotional banner:**
- Featured: "USA Wooden Maps"
- Links to USA collection

**Country columns (with thumbnail images):**
1. All Country Maps
2. USA, Canada, Germany, United Kingdom
3. Ireland, Spain, Europe, France
4. Switzerland, Austria, Australia, Italy
5. Ukraine, Accessories

**Michket adaptation:** Not directly applicable — Michket doesn't sell country maps. But the pattern of geographic/thematic subcategories is useful for occasion-based navigation.

### KIDS & BABY Mega-Menu

**Layout:** 2-column split — visual categories (left) + text-only list (right)

**Left column (with images):**
1. All Kids' Products
2. 3D DIY Wood Painting Kit
3. Child Growth Chart
4. Wooden Name Puzzle
5. Kids Night Lights

**Right column (text only):**
1. Car Parking Toys
2. Play Kitchen Set
3. Montessori Furniture
4. Kids Wall Decor
5. Wall Mounted Garage
6. Kids Lunch Box
7. Dollhouse

**Michket adaptation:** Split layout useful for "Cadeaux" mega-menu — visual occasion tiles (left) + text recipient list (right)

### SHOP ALL Mega-Menu (Largest)

**Layout:** Full-width promotional banner + 3 columns of text-only links

**Promotional banner:**
- "The Founder's Book" feature
- "Bestsellers" category link

**Column 1:**
- Bestsellers, All World Maps, All Country Map, Kids&Baby, For Pets, Wooden Lake Maps, Memory City

**Column 2:**
- City Maps, Wooden Corner Quote, Family Tree, Gift Cards, Accessories, Cork Box, Recipe Book

**Column 3:**
- Wedding Time, Acrylic Wall Calendar Planner, Advent Calendars, Memory Box, Night Light, Custom Wooden World Map, Key Holders

**Michket adaptation:** "TOUT VENDRE" mega-menu — complete sitemap with promotional banner

## Mega-Menu Interaction Patterns

### Opening/Closing
- **Trigger:** Hover on desktop (no click required)
- **Behavior:** Mega-menu appears below header, pushes content down or overlays
- **Delay:** Likely small delay before closing when mouse moves away (prevents accidental closure)
- **Close:** Mouse leaves mega-menu area, or click elsewhere

### Header Behavior
- **Sticky:** Header remains fixed when mega-menu is open
- **Overlay:** Mega-menu may have subtle backdrop/shadow
- **Z-index:** Mega-menu sits above page content

### Typography Hierarchy
- **Category headings:** Bold, larger text
- **Subcategory links:** Regular weight, consistent with body text
- **Badge text:** Bold, contrasting color (e.g., "BEST SELLER" in orange/red)
- **Promotional text:** May use different styling for emphasis

### Visual Merchandising
- **Images are editorial:** Show products in use, not white-background catalog shots
- **Thumbnails are small but clear:** Help users identify product types visually
- **Promotional banners are the largest element:** Draw eye to featured products/collections
- **Badges create urgency:** "BEST SELLER," "SALE," "NEW" appear in menus

### Discovery vs Navigation
- **Mega-menus encourage browsing:** Users can see product types visually before committing
- **Promotional banners highlight featured items:** Drive traffic to specific products
- **"All [Category]" links provide escape hatches:** Users can always browse the full collection
- **Image thumbnails reduce cognitive load:** Visual identification faster than reading text

## Preliminary Michket Mega-Menu Mapping

### LAMPES 3D PERSONNALISÉES

**Layout:** 3 columns + promotional banner

**Banner:** Featured LED lamp in dramatic lighting, "PERSONNALISABLE" badge

**Column 1 — Par type:**
- Toutes les lampes 3D
- Lampes LED acrylic
- Lampes de naissance
- Lampes d'anniversaire
- Lampes couple
- Lampes sport
- Lampes musical

**Column 2 — Par occasion:**
- Anniversaire
- Mariage / Fiançailles
- Naissance / Bébé
- Fête des mères / pères
- Diplôme / Soutenance
- Noël / Fêtes

**Column 3 — Par destinataire:**
- Pour elle
- Pour lui
- Pour les enfants
- Pour la maison
- Pour un couple
- Idées cadeaux <50€

### TROPHÉES PERSONNALISÉS

**Layout:** 2 columns + promotional banner

**Banner:** Featured trophy with engraving, "GRAVURE PERSONNALISÉE" badge

**Column 1 — Par type:**
- Tous les trophées
- Trophées sportifs
- Trophées scolaires
- Trophées entreprise
- Plaques commémoratives
- Coupes et médailles

**Column 2 — Par occasion:**
- Diplôme / Soutenance
- BAC / Examen
- Championnat / Tournoi
- Remerciement
- Promotion / Retraite
- Anniversaire

### CARTES DU MONDE EN BOIS

**Layout:** 3 columns + promotional banner

**Banner:** Featured wooden map on wall, "BEST SELLER" badge

**Column 1 — Par style:**
- Toutes les cartes
- Cartes 3D
- Cartes LED
- Cartes colorées
- Cartes naturelles
- Cartes panneau

**Column 2 — Par taille:**
- Petite (M — 60x90cm)
- Moyenne (L — 90x150cm)
- Grande (XL — 120x200cm)
- Très grande (2XL — 160x250cm)

**Column 3 — Par usage:**
- Pour le salon
- Pour la chambre
- Pour le bureau
- Pour un restaurant
- Cadeau
- Accessoires (pins, épingles)

### CADEAUX

**Layout:** 2-column split — visual occasion tiles (left) + text recipient list (right)

**Left column (with images):**
- Idées cadeaux
- Cadeaux pour elle
- Cadeaux pour lui
- Cadeaux pour les enfants
- Cadeaux pour la maison

**Right column (text only):**
- Moins de 50€
- 50€ — 100€
- 100€ — 200€
- Plus de 200€
- Cartes cadeaux
- Emballage cadeau premium

### OCCASIONS

**Layout:** Full grid of occasion tiles (visual, image-rich)

**Occasions:**
- Anniversaire
- Mariage / Fiançailles
- Couple / Saint-Valentin
- Fête des mères
- Fête des pères
- Naissance / Bébé
- Diplôme
- Soutenance
- BAC
- Enseignant
- Médecin / Profession
- Football / Sport
- Remerciement
- Noël / Fêtes
- Fête nationale

### NOUVEAUTÉS

**Layout:** Simple dropdown or direct link to collection
- Toutes les nouveautés
- Nouvelles lampes
- Nouveaux trophées
- Nouvelles cartes

### BEST-SELLERS

**Layout:** Simple dropdown or direct link to collection
- Toutes les meilleures ventes
- Lampes best-sellers
- Trophées best-sellers
- Cartes best-sellers

---

# Search Overlay / Search Experience

## Observed Behavior

Enjoy The Wood uses a **page-based search** (not an in-page overlay/modal):

- **Trigger:** Click search icon in header → navigates to `/search`
- **URL:** `/search?q=query` for search results
- **No overlay/modal:** Search is a dedicated page, not a pop-up
- **Results page:** Grid of product cards with filters and sorting

## Search Results Page Structure

- **Results count:** "438 results for 'map'"
- **Pagination:** Page-based ("1 / 19")
- **Filter panel (left sidebar):**
  - Sort by: Relevance, Price low→high, Price high→low
  - Stock: "In stock only" toggle
  - Price range: Min/max input fields
  - Tags/Collections: Checkbox filters with counts (e.g., "LED (41)," "BESTSELLERLABEL (43)")
- **Product cards:** Same grid layout as collection pages
  - Two images (primary + hover)
  - Product name
  - Sale price + regular price + discount %
  - Badges: NEW, BEST SELLER, FREE SHIPPING

## What's NOT Present

- No predictive/autocomplete dropdown
- No recent searches display
- No popular/trending searches
- No category suggestions inline
- No product thumbnails in search dropdown
- No search overlay/modal on desktop

## Desktop vs Mobile

- **Desktop:** Search icon → navigates to `/search` page
- **Mobile:** Search icon → fullscreen overlay (from Batch 3 research)

## Michket Search Recommendations

Since Enjoy The Wood uses page-based search, Michket should consider **enhancing** this with predictive search for better UX:

### Recommended: Predictive Search Overlay

```
┌─────────────────────────────────────┐
│ [🔍 Rechercher un cadeau...]    [X] │
├─────────────────────────────────────┤
│ Produits                            │
│ ┌─────┐ Lampe LED 3D Rose           │
│ │ img │ 49,90 €                     │
│ └─────┘                             │
│ ┌─────┐ Trofee Champion Or          │
│ │ img │ 79,90 €                     │
│ └─────┘                             │
├─────────────────────────────────────┤
│ Occasions                           │
│ Anniversaire (24 produits)          │
│ Mariage (18 produits)               │
│ Naissance (12 produits)             │
├─────────────────────────────────────┤
│ Catégories                          │
│ Lampes 3D personnalisées            │
│ Trophées personnalisés              │
└─────────────────────────────────────┘
```

### Search by Occasion/Recipient

Michket should support natural-language gift searches:

| Query | Results |
|---|---|
| "médecin" | Trophées médecin, lampes médecin, plaques |
| "maman" | Lampes maman, cadeaux mère, trophées |
| "mariage" | Lampes mariage, cadeaux couple, trophées |
| "football" | Trophées sportifs, lampes sport |
| "soutenance" | Trophées soutenance, plaques commémoratives |
| "anniversaire" | Lampes anniversaire, cadeaux anniversaire |
| "bébé" | Lampes naissance, cadeaux bébé |
| "diplôme" | Trophées diplôme, plaques |

### Search by Personalization Idea

Users should be able to search for gift ideas:

| Query | Results |
|---|---|
| "cadeau pour maman" | All mama-appropriate products |
| "cadeau mariage" | Wedding-appropriate products |
| "cadeau 50 euros" | Products under 50€ |
| "cadeau personnalisé" | All personalized products |
| "trophée gravure" | Trophies with engraving |
| "lampe prénom" | Lamps with name personalization |

---

# UGC / Customer Inspiration

## Enjoy The Wood UGC Page

**URL:** https://enjoythewood.com/pages/inspiration

### Page Structure

1. **Hero section:** "Inspired by you.." title
2. **Community CTA:** "Share your wooden maps photos with us and tag #enjoythewoodmap"
3. **Photo grid:** Multi-column responsive grid (3-4 columns desktop)
4. **Footer:** Standard site footer

### Grid Module Structure

Each grid cell is a combined inspiration-product unit:

```
┌─────────────────────────────────────┐
│                                     │
│     [Large customer photo]          │
│     (landscape orientation)         │
│                                     │
├─────────────────────────────────────┤
│ [Product img] Product Name          │
│               Size / Style          │
│               [SHOP NOW]            │
└─────────────────────────────────────┘
```

### Key Observations

- **No captions or customer names** — purely visual
- **Every photo linked to a product** — direct conversion path
- **"SHOP NOW" CTA per module** — clear purchase action
- **Hashtag-based sourcing** — #enjoythewoodmap
- **No live social feed** — curated static gallery
- **No before/after content** — final installed products only
- **No video content** — static images only
- **Product thumbnails are square (210x210)** — consistent sizing
- **Customer photos are landscape** — show room context

### UGC on Homepage

The "Inspired by you" section on the homepage shows 9 customer photos in a horizontal carousel:
- Each photo overlaid with product name
- Links to specific product page
- "View all" link to inspiration page

### UGC on Product Pages

Customer photos appear in the reviews section:
- Photo reviews with customer-uploaded images
- Lightbox on click
- Linked to verified purchases

## Michket UGC Adaptation

### Content Sources

| Source | Content Type | Platform |
|---|---|---|
| Customer photos | Lamp in room, map on wall, trophy display | Email, WhatsApp, Instagram |
| Customer videos | Unboxing, reaction, installation | TikTok, Instagram Reels |
| Before/after | Empty wall → product installed | Direct submission |
| Personalization reveals | Finished personalized product | Direct submission |
| Gift moments | Recipient reaction to gift | Direct submission |

### UGC Page Structure (Michket)

```
┌─────────────────────────────────────┐
│ INSPARÉ PAR VOUS                    │
│ Montrez-nous votre Michket!         │
│ #MichketMoment                      │
├─────────────────────────────────────┤
│ [Photo] [Photo] [Photo]             │
│ [Photo] [Photo] [Photo]             │
│ [Photo] [Photo] [Photo]             │
│                                     │
│ Each photo:                         │
│ - Customer room photo               │
│ - Product name + link               │
│ - "SHOP NOW" CTA                    │
├─────────────────────────────────────┤
│ VOUS AVEZ UN MICHKET?               │
│ Partagez votre photo!               │
│ [Soumettre une photo]               │
└─────────────────────────────────────┘
```

### UGC Categories to Curate

1. **Lampes 3D** — glowing lamps in rooms, night scenes, gift moments
2. **Trophées** — award ceremonies, desk displays, gift reactions
3. **Cartes du monde** — wall installations, room transformations, travel themes
4. **Cadeaux** — unwrapping moments, recipient reactions, family scenes
5. **Before/After** — empty space → Michket product transformation

### Trust Role

- Real customer photos validate product quality
- Room contexts help buyers visualize products
- Gift moments create emotional connection
- Volume of photos implies popularity

### Discovery Role

- Shows products in diverse settings
- Demonstrates personalization options
- Reveals product scale in real rooms
- Inspires gift ideas

### Conversion Role

- Every photo linked to purchasable product
- "SHOP NOW" CTA on every module
- Reduces "what will it look like?" anxiety
- Creates FOMO through social proof

---

# Footer Architecture

## Complete Footer Structure

### Newsletter Section

- **Headline:** "WANT $20 OFF YOUR FIRST PURCHASE?"
- **Supporting text:** "Sign up to unlock a $20 credit! Must redeem within 2 days of receipt."
- **Email field:** "Your E-mail"
- **CTA:** "Get $20 credit"
- **Trust:** 2-day redemption window creates urgency

### Footer Columns (6 columns)

**CATALOG:**
- All World Maps
- All Country Map
- Kids&Baby
- For Pets
- Wooden Lake Maps
- Memory City
- City Maps
- Wooden Corner Quote
- Family Tree
- Gift Cards
- Accessories
- Cork Box
- Recipe Book
- Acrylic Wall Calendar Planner
- Advent Calendars
- Memory Box
- Night Light
- Custom Wooden World Map

**GIFT SHOP:**
- Valentine's Day
- Gift for Him
- Gift for Her
- Gift for Kids
- Gifts Under $50
- Gifts Under $100
- Christmas Gifts
- Travel Gifts
- Mother's Day Gift

**ABOUT US:**
- Our Brand History
- Original Product
- Our Values
- Contact us
- Reviews
- FAQs

**FOR PARTNERS:**
- Wholesale
- Dropshipping
- Affiliate Program

**CUSTOMER CARE:**
- Track your order
- Shipping policy
- Refund policy
- Original product
- Terms of Service
- Privacy Policy

**BLOG & NEWS:**
- Inspiration
- EnjoyHome
- EnjoyNews
- EnjoyTravel
- EnjoyStories
- EnjoyPartners
- OurValues

### Social Media Links

- Facebook: 12K followers
- Instagram: 465K followers
- Pinterest: 15.4K followers
- YouTube: 5.52K subscribers
- TikTok: 277.9K followers

### Payment Icons

American Express, Apple Pay, Bancontact, Diners Club, Discover, Google Pay, iDEAL, Wero, Mastercard, PayPal, Shop Pay, USDC, Venmo, Visa

### Localization

- **Country/Currency selector:** 150+ countries with local currencies
- **Language selector:** English, Español, Deutsch

### Contact Information

- **Email:** service@enjoythewood.com
- **WhatsApp:** +14845101185
- **Address:** 251 Little Falls Drive, Wilmington, Delaware, 19808-1674, USA

### Copyright

- "© 2026, ENJOY THE WOOD"

### Visual Design

- **Desktop:** 6-column grid
- **Mobile:** Accordion/collapsible sections
- **Background:** Likely dark or neutral
- **Typography:** Bold headings, regular body text

## Michket Footer Architecture

### Newsletter

- **Headline:** "10% DE REMISE SUR VOTRE PREMIERE COMMANDE"
- **Supporting text:** "Inscrivez-vous pour recevoir votre code promo et nos meilleures offres."
- **Email field:** "Votre adresse e-mail"
- **CTA:** "J'EN PROFITE"
- **Trust:** "Pas de spam. Désabonnement en un clic."

### Footer Columns (6 columns)

**CATALOGUE:**
- Lampes 3D personnalisées
- Trophées personnalisés
- Cartes du monde en bois
- Nouveautés
- Meilleures ventes
- Tous les produits

**CADEAUX:**
- Pour elle
- Pour lui
- Pour les enfants
- Pour la maison
- Moins de 50€
- 50€ — 100€
- Cartes cadeaux
- Emballage cadeau

**OCCASIONS:**
- Anniversaire
- Mariage / Fiançailles
- Couple / Saint-Valentin
- Fête des mères
- Fête des pères
- Naissance / Bébé
- Diplôme / Soutenance / BAC
- Football / Sport
- Remerciement

**A PROPOS:**
- Notre histoire
- Notre savoir-faire
- Nos valeurs
- Nous contacter
- Avis clients
- FAQ

**ASSISTANCE:**
- Suivre ma commande
- Politique de livraison
- Politique de retour
- Conditions générales
- Politique de confidentialité
- Mentions légales

**SUIVEZ-NOUS:**
- Instagram
- Facebook
- TikTok
- Pinterest
- YouTube

### Localization

- **Language selector:** Français (default), English
- **Currency:** EUR (default), USD, GBP
- **Country:** France (default), other countries

### Contact Information

- **Email:** [OWNER INPUT REQUIRED]
- **WhatsApp:** [OWNER INPUT REQUIRED]
- **Address:** [OWNER INPUT REQUIRED]

### Copyright

- "© 2026 Michket. Tous droits réservés."

---

# Merchandising Interactions

## Pattern Inventory

### 1. Before/After Slider

- **Where:** Homepage section 9
- **Interaction:** Draggable vertical divider between two images
- **Commercial purpose:** Visual transformation demonstration
- **Mobile adaptation:** Touch-draggable, swipe-friendly
- **Michket relevance:** HIGH — wall transformation with lamp or map
- **Priority:** Critical

### 2. Product Image Hover Swap

- **Where:** Product cards in carousels and grids
- **Interaction:** Second image appears on hover
- **Commercial purpose:** Show alternate view without clicking
- **Mobile adaptation:** No hover on mobile — show single best image
- **Michket relevance:** HIGH — show lamp on/off, map in different rooms
- **Priority:** Important

### 3. Quick Add / Quick View

- **Where:** NOT present on Enjoy The Wood
- **Interaction:** N/A
- **Commercial purpose:** N/A
- **Michket adaptation:** Consider adding for non-personalized items
- **Michket relevance:** MEDIUM — useful for accessories, gift cards
- **Priority:** Optional

### 4. Product Badges

- **Where:** Product cards throughout site
- **Types observed:**
  - BEST SELLER (orange/red)
  - NEW (green/blue)
  - SALE (red)
  - FREE SHIPPING (green)
  - SPECIAL OFFER (red)
  - BEST CHOICE (orange)
  - PREMIUM (gold)
- **Commercial purpose:** Visual differentiation, urgency, social proof
- **Mobile adaptation:** Same badges, smaller size
- **Michket relevance:** HIGH — add PERSONNALISABLE badge
- **Priority:** Critical

### 5. Sale Countdown / Urgency

- **Where:** Announcement bar
- **Interaction:** Live countdown timer (Days:Hours:Minutes:Seconds)
- **Commercial purpose:** Create urgency for promotional periods
- **Mobile adaptation:** Same, compact display
- **Michket relevance:** HIGH — seasonal promotions
- **Priority:** Important

### 6. Recently Viewed Products

- **Where:** NOT observed on Enjoy The Wood
- **Interaction:** N/A
- **Michket adaptation:** Consider adding — helps returning visitors
- **Michket relevance:** MEDIUM
- **Priority:** Optional

### 7. Frequently Bought Together

- **Where:** NOT observed on Enjoy The Wood
- **Interaction:** N/A
- **Michket adaptation:** Consider for accessories (map pins with maps, gift wrapping with lamps)
- **Michket relevance:** MEDIUM
- **Priority:** Optional

### 8. Product Recommendations

- **Where:** "You may also like" on product pages
- **Interaction:** Horizontal carousel of related products
- **Commercial purpose:** Cross-selling, discovery
- **Mobile adaptation:** Swipeable carousel
- **Michket relevance:** HIGH — related lamps, trophies, maps
- **Priority:** Critical

### 9. "You May Also Like"

- **Where:** Product pages, cart drawer
- **Interaction:** Carousel of product cards
- **Commercial purpose:** Increase average order value
- **Michket adaptation:** Same — complementary products
- **Priority:** Critical

### 10. Color/Variant Swatches on Cards

- **Where:** NOT observed on product cards
- **Interaction:** N/A — variants selected on PDP
- **Michket adaptation:** Consider adding color swatches for lamp colors
- **Michket relevance:** MEDIUM
- **Priority:** Optional

### 11. Wishlist

- **Where:** NOT observed on Enjoy The Wood
- **Interaction:** N/A
- **Michket adaptation:** Consider adding — save for later, gift lists
- **Michket relevance:** MEDIUM
- **Priority:** Optional

### 12. Announcement Bar Rotation

- **Where:** Top of all pages
- **Interaction:** Single message with countdown (no rotation observed)
- **Commercial purpose:** Promotional urgency
- **Michket adaptation:** Same — seasonal promotions
- **Priority:** Important

### 13. Sticky Header

- **Where:** All pages
- **Interaction:** Header becomes fixed on scroll
- **Commercial purpose:** Persistent navigation access
- **Michket adaptation:** Same — compact sticky header with logo + icons
- **Priority:** Critical

### 14. Editorial Commerce Modules

- **Where:** Collection pages, homepage
- **Interaction:** SEO text blocks, gift guides, blog integration
- **Commercial purpose:** SEO, engagement, return visits
- **Michket adaptation:** Same — gift guides, product care, brand stories
- **Priority:** Important

---

# Research Conclusions Before Blueprint

## MUST ADAPT (Essential to Michket)

1. **Deep commercial homepage sequencing** — 14+ sections with bestsellers, categories, social proof, UGC, editorial
2. **Visual mega-menu navigation** — Image-rich dropdowns with promotional banners
3. **Product page depth** — Gallery, variants, personalization, trust, reviews, cross-sells, FAQ
4. **Free shipping progress bar** — Major conversion lever in cart
5. **Personalization as core UX** — Not a form field, but a premium configurator experience
6. **UGC/Inspiration gallery** — Customer photos linked to products
7. **Occasion-based shopping** — Major commerce mechanism for gifts
8. **Sticky Add to Cart on mobile** — Persistent purchase access
9. **Trust messaging near CTA** — Free shipping, secure payment, warranty
10. **Cart drawer with recommendations** — Cross-sell at point of purchase

## SHOULD ADAPT (High-value, content-dependent)

1. **Before/after slider** — Wall transformation with products
2. **Editorial blog integration** — Gift guides, product care, brand stories
3. **Promotional countdown timer** — Seasonal urgency
4. **Multi-column footer** — Complete site navigation + newsletter
5. **Badge system** — BEST SELLER, NEW, PERSONNALISABLE, PROMO
6. **Horizontal subcategory scroll** — Mobile collection browsing
7. **Staged personalization configurator** — Step-by-step product configuration
8. **Search by occasion/recipient** — Natural gift search
9. **Customer review photos** — Social proof in reviews
10. **Express checkout** — Shop Pay, Apple Pay, Google Pay

## OPTIONAL (Can be added later)

1. Quick add/quick view on product cards
2. Recently viewed products
3. Frequently bought together
4. Wishlist functionality
5. Color swatches on product cards
6. Advanced search autocomplete
7. Live social media feed
8. Product comparison

## DO NOT COPY

- Enjoy The Wood's logo, brand name, or trademarked elements
- Enjoy The Wood's photography or proprietary imagery
- Enjoy The Wood's written copy, product descriptions, or marketing text
- Enjoy The Wood's illustrations or custom graphics
- Enjoy The Wood's specific color scheme or typography choices
- Any proprietary UX patterns that are distinctive to Enjoy The Wood's brand identity
- The overall "look and feel" that would make Michket indistinguishable from Enjoy The Wood

---

# Owner Inputs Still Required

## CRITICAL BEFORE BUILD

| Input | Description | Status |
|---|---|---|
| Product catalog | Complete list of products with names, descriptions, prices | REQUIRED |
| Product photography | High-quality images for all products (multiple angles) | REQUIRED |
| Lamp models | Specific lamp designs available (star, heart, music note, etc.) | REQUIRED |
| Lamp colors | Available LED light colors per model | REQUIRED |
| Base types | Available base options (wood, acrylic, etc.) | REQUIRED |
| Trophy models | Specific trophy designs available | REQUIRED |
| Engraving options | What can be engraved on trophies (text, logos, etc.) | REQUIRED |
| Map sizes | Available map dimensions (M, L, XL, 2XL) | REQUIRED |
| Map styles | Available map styles (3D, LED, colored, natural) | REQUIRED |
| Personalization fields | What customization is available per product type | REQUIRED |
| Pricing | Product prices, promotional prices, discount structures | REQUIRED |
| Production times | Manufacturing/personalization lead times per product | REQUIRED |
| Shipping pricing | Domestic and international shipping costs | REQUIRED |
| Free shipping threshold | Minimum order for free shipping | REQUIRED |
| Regions served | Countries/regions where Michket ships | REQUIRED |
| Returns policy | Return/exchange rules (especially for personalized items) | REQUIRED |
| Cancellation policy | Can personalized orders be cancelled? Under what conditions? | REQUIRED |
| Warranty | Warranty terms and duration | REQUIRED |
| Payment methods | Which payment providers to integrate | REQUIRED |
| Domain name | Michket website URL | REQUIRED |
| Currency | Primary currency (EUR, USD, etc.) | REQUIRED |
| Languages | Supported languages (French, English, etc.) | REQUIRED |

## NEEDED BEFORE LAUNCH

| Input | Description | Status |
|---|---|---|
| Brand story | Founder story, mission, values | RECOMMENDED |
| Social media links | Instagram, Facebook, TikTok, etc. | RECOMMENDED |
| Contact information | Email, WhatsApp, phone, address | RECOMMENDED |
| Customer reviews | Existing reviews to display | RECOMMENDED |
| Customer photos | Existing UGC for inspiration gallery | RECOMMENDED |
| Product videos | Product demos, unboxing, etc. | RECOMMENDED |
| Blog content | Gift guides, product care articles | RECOMMENDED |
| Legal pages | Terms, privacy policy, shipping policy | REQUIRED |
| Business registration | SIRET, company name, legal entity | REQUIRED |
| Analytics requirements | GA4, Meta Pixel, etc. | RECOMMENDED |
| Email marketing | Klaviyo, Mailchimp, etc. | RECOMMENDED |
| Review platform | Trustpilot, Judge.me, Loox, etc. | RECOMMENDED |

## CAN BE ADDED LATER

| Input | Description | Status |
|---|---|---|
| Seasonal promotions | Holiday-specific campaigns | OPTIONAL |
| Affiliate program | Partner/referral program details | OPTIONAL |
| Wholesale program | B2B pricing and terms | OPTIONAL |
| Gift wrapping options | Premium gift wrapping details | OPTIONAL |
| Loyalty program | Points, rewards, VIP tiers | OPTIONAL |
| Wishlist functionality | Save for later features | OPTIONAL |
| Product comparison | Side-by-side product comparison | OPTIONAL |
