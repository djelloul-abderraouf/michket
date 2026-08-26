# Enjoy The Wood — Cart & Checkout Audit

> Research Batch 2 — 2026-08-25
> Incremental persistence: findings saved after each phase to prevent data loss.

## Audit Status
- Cart drawer: COMPLETE
- Cart page: COMPLETE
- Checkout: PARTIAL
- Mobile: NOT PART OF THIS BATCH

---

# Cart Drawer

## Overview

Enjoy The Wood uses a **slide-in cart drawer** (also called mini-cart) as the primary cart experience. There is NO separate dedicated cart page — the `/cart` URL triggers the same drawer overlay. The drawer is the single point of cart interaction.

## Element-by-Element Documentation

### 1. Opening Mechanism

- **What:** Cart icon in header with item count badge
- **Where:** Top-right of header, next to account icon
- **Behavior:** Click triggers slide-in drawer from right side of screen
- **Commercial purpose:** Quick cart access without leaving current page
- **Michket adaptation:** Same pattern — Michket cart icon (gold accent) with item count badge triggers drawer
- **Priority:** Critical

### 2. Drawer Panel

- **What:** Slide-in panel from right edge
- **Width:** Approximately 400-450px (desktop)
- **Placement:** Right side, overlays page content
- **Overlay:** Semi-transparent backdrop behind drawer, clicking backdrop closes drawer
- **Close behavior:** X button top-right, backdrop click, or "Continue shopping" link
- **Commercial purpose:** Keep user in shopping context while reviewing cart
- **Michket adaptation:** Same pattern — warm ivory drawer on black/gold site
- **Priority:** Critical

### 3. Empty State

- **What:** "Your cart is empty" message
- **Where:** Centered in drawer when no items
- **Content:**
  - "Your cart is empty" text
  - "Continue shopping" link → `/collections/world-maps`
- **Commercial purpose:** Encourage continued browsing
- **Michket adaptation:** "Votre panier est vide" with link to featured collection
- **Priority:** Critical

### 4. Cart Header

- **What:** "Your Shopping Cart" title at top of drawer
- **Where:** Top of drawer panel
- **Commercial purpose:** Clear identification of drawer purpose
- **Michket adaptation:** "Votre Panier" with Michket styling
- **Priority:** Important

### 5. Item Thumbnail

- **What:** Small product image per cart item
- **Where:** Left side of each cart item row
- **Behavior:** Links to product page
- **Commercial purpose:** Visual confirmation of product, quick navigation
- **Michket adaptation:** Show personalized product thumbnail (e.g., lamp with selected color, trophy with engraving preview)
- **Priority:** Critical

### 6. Product Title & Variants

- **What:** Product name + selected variant details
- **Where:** Right of thumbnail, above price
- **Content:** Product title, variant info (size, color, style, language)
- **Commercial purpose:** Confirm correct product/variant selection
- **Michket adaptation:** Show all personalization details: lamp color, base type, engraved text, names, dates
- **Priority:** Critical

### 7. Quantity Controls

- **What:** Minus (-) and Plus (+) buttons with quantity number
- **Where:** Below product title/variants in each item row
- **Behavior:** Click increment/decrement updates quantity and subtotal via AJAX
- **Commercial purpose:** Easy quantity adjustment without page reload
- **Michket adaptation:** Same — but consider limiting quantity for personalized items
- **Priority:** Critical

### 8. Remove Button

- **What:** Remove/X button per item
- **Where:** Top-right or bottom-right of item row
- **Behavior:** Click removes item from cart with confirmation or immediate removal
- **Commercial purpose:** Cart management
- **Michket adaptation:** Same — with confirmation for personalized items
- **Priority:** Important

### 9. Line Item Price

- **What:** Price per item (quantity × unit price)
- **Where:** Below variant info or right-aligned in item row
- **Behavior:** Updates when quantity changes
- **Commercial purpose:** Clear price communication
- **Michket adaptation:** Same — show personalized item price
- **Priority:** Critical

### 10. Free Shipping Progress Bar

- **What:** Visual progress bar showing proximity to free shipping threshold
- **Where:** Below cart items, above subtotal
- **Behavior:** Fills as cart total increases, shows message when threshold reached
- **Content:** "You're $X away from FREE SHIPPING!" or similar
- **Commercial purpose:** Incentivize adding more items to cart
- **Michket adaptation:** Same — "Plus que X€ pour la livraison gratuite!" with animated bar
- **Priority:** Critical

### 11. Subtotal

- **What:** Cart total before shipping/tax
- **Where:** Below progress bar, above checkout button
- **Content:** "Subtotal: $XXX.XX"
- **Commercial purpose:** Clear total communication before checkout
- **Michket adaptation:** "Sous-total: XXX€"
- **Priority:** Critical

### 12. Promo Code / Discount Input

- **What:** Collapsible discount section with input field + "Save" button
- **Where:** Below subtotal, above checkout button
- **Behavior:** Click to expand, enter code, click save to apply
- **Commercial purpose:** Allow promo code redemption
- **Michket adaptation:** Same — "Code promo" with expandable input
- **Priority:** Important

### 13. Checkout CTA

- **What:** Full-width primary button
- **Where:** Bottom of drawer (sticky area)
- **Style:** `button--full-width button--primary` — prominent, full-width
- **Content:** "Checkout" or "Passer la commande"
- **Commercial purpose:** Primary conversion action
- **Michket adaptation:** Gold/warm button, prominent placement, "Passer la commande"
- **Priority:** Critical

### 14. Trust Messaging

- **What:** Trust icons and text near checkout button
- **Where:** Below checkout button or in footer area of drawer
- **Content:**
  - "Free Shipping" icon
  - "100% Secure Payment" icon
  - "Lifetime Warranty" icon
- **Commercial purpose:** Reduce checkout anxiety
- **Michket adaptation:** "Livraison gratuite" | "Paiement securise" | "Garantie a vie"
- **Priority:** Critical

### 15. Upsell / Cross-Sell Recommendations

- **What:** "You may also like" product section
- **Where:** Below trust messaging, scrollable area in drawer
- **Content:** Product cards with image, title, price — linked to product pages
- **Commercial purpose:** Increase average order value through impulse additions
- **Michket adaptation:** Show complementary products (e.g., map pins with map, gift wrapping with lamp)
- **Priority:** Critical

### 16. Continue Shopping

- **What:** Link to return to browsing
- **Where:** Bottom of drawer or empty state
- **Content:** "Continue shopping" → links to a collection page
- **Behavior:** Closes drawer and navigates to collection
- **Commercial purpose:** Reduce cart abandonment by encouraging continued browsing
- **Michket adaptation:** "Continuer les achats" → link to last viewed collection or homepage
- **Priority:** Important

### 17. Visual Hierarchy

- **What:** Layout and spacing of drawer elements
- **Structure (top to bottom):**
  1. Cart header ("Your Shopping Cart")
  2. Cart items (scrollable area)
  3. Free shipping progress bar
  4. Subtotal
  5. Promo code section
  6. Checkout button (sticky)
  7. Trust messaging
  8. Recommendations
- **Commercial purpose:** Logical flow from review → total → checkout → trust
- **Michket adaptation:** Same flow, with personalization summary inserted after product title
- **Priority:** Critical

### 18. Scroll Behavior

- **What:** Cart items area scrolls independently
- **Where:** Middle section of drawer
- **Behavior:** Items scroll while header and checkout area remain fixed
- **Commercial purpose:** Handle multiple items without losing checkout CTA
- **Michket adaptation:** Same — personalization details may make items taller
- **Priority:** Important

### 19. Animation

- **What:** Slide-in/out animation for drawer
- **Behavior:** Smooth slide from right edge, backdrop fade-in
- **Commercial purpose:** Professional, non-jarring interaction
- **Michket adaptation:** Smooth, premium-feeling animation
- **Priority:** Important

### 20. Shopify Integration

- **What:** Cart uses Shopify section rendering system
- **Technical details:**
  - References `main-cart-footer` section
  - Uses `/cart.js` API for real-time updates
  - Data attributes: `data-cart-count`, `data-section-type`
  - Cart token for session tracking
- **Commercial purpose:** Real-time cart updates without page reload
- **Michket adaptation:** Same Shopify architecture
- **Priority:** Critical

---

# Cart Page

## Finding: NO Dedicated Cart Page

Enjoy The Wood does **NOT** have a separate `/cart` page. When the `/cart` URL is accessed:

1. The page loads with the cart drawer overlay open
2. The drawer contains all cart functionality
3. There is no full-page cart view with additional elements

**Evidence:** Fetching `https://enjoythewood.com/cart` returns the same drawer structure as clicking the cart icon. The page header reads "Your Shopping Cart" but the content is the drawer panel.

**Michket adaptation:** Follow the same pattern — single cart drawer, no separate cart page. This keeps the shopping experience fluid and reduces page transitions.

---

# Checkout

## Platform Identification

- **Platform:** Shopify Checkout (standard)
- **Redirect:** `/checkout` redirects to `shop.app/checkout/...` (Shopify's hosted checkout)
- **Shop Pay:** Enabled — redirect URL contains `shoppay` parameter and Shop Pay token
- **Checkout URL structure:** `https://shop.app/checkout/{shop_id}/{locale}/{token}/{country}/{支付方法}`

## Observed Checkout Elements

### From Redirect Analysis

1. **Shopify hosted checkout** — standard Shopify checkout flow
2. **Shop Pay integration** — accelerated checkout with Shop Pay token
3. **Multi-locale support** — `en-dz` in URL suggests locale/country handling
4. **Tracking parameters** — `tracking_unique`, `tracking_visit` for analytics
5. **Redirect source** — `checkout_universal_redirect` indicates Shop Pay was offered as express option

### From Page Source Analysis

6. **Express payment buttons** — Apple Pay, Google Pay, Shop Pay visible on product pages
7. **Payment method logos** — AmEx, Apple Pay, Bancontact, Diners Club, Discover, Google Pay, iDEAL, Wero, Mastercard, PayPal, Shop Pay, USDC, Venmo, Visa
8. **Cart-level discount applications** — Shopify cart API supports `cart_level_discount_applications`
9. **Shipping requires calculation** — `requires_shipping: false` on empty cart (would be true with physical items)

### Checkout Structure (Standard Shopify)

Based on Shopify's standard checkout flow:

1. **Contact information** — Email, phone
2. **Shipping address** — Full address form
3. **Shipping method** — Available shipping options with prices
4. **Payment** — Credit card, Shop Pay, Apple Pay, Google Pay, PayPal
5. **Order summary** — Product thumbnails, variants, prices, subtotal, shipping, tax, total

### Trust & Security (Standard Shopify)

- SSL encryption (https://)
- Shopify buyer protection
- Payment processor security (Stripe for cards)
- Shop Pay security

### Conversion Principles Observed

- **Accelerated checkout** — Shop Pay, Apple Pay, Google Pay reduce friction
- **Express payment on product pages** — One-tap purchase from PDP
- **Cart drawer checkout** — Single click from cart to checkout
- **Guest checkout** — Standard Shopify allows checkout without account
- **Multiple payment options** — Reduces payment friction

## What Could NOT Be Inspected

Without adding items to cart and proceeding to checkout, the following could not be directly observed:

- Exact checkout page layout and design
- Shipping method options and pricing
- Tax calculation display
- Order summary formatting
- Error/validation UX
- Account creation flow
- Newsletter signup in checkout
- Gift message options
- Mobile checkout layout

**Status:** PARTIAL — Platform identified, standard Shopify checkout flow confirmed, but detailed visual inspection requires cart interaction.

---

# Michket Cart & Checkout Adaptation

## Cart Drawer Design for Michket

### Personalization Display (CRITICAL DIFFERENTIATOR)

Michket sells personalized products, so the cart drawer must clearly communicate:

#### For Lampes 3D Personnalisees:

| Element | Display |
|---|---|
| Lamp model | "Lampe LED 3D — Modele [X]" |
| Light color | Color swatch + "Couleur: [Bleu cyan / Rose / etc.]" |
| Base type | "Base: [Bois / Acrylique / etc.]" |
| Dimensions | "Dimensions: [20cm x 15cm]" |
| Custom text | "Texte: [Happy Birthday Marie]" |
| Names | "Noms: [Marie, Pierre]" |
| Date | "Date: [25 decembre 2026]" |
| Photo upload | Thumbnail of uploaded photo + "Photo telechargee" |
| Language | "Langue: [Francais]" |
| Preview | Small thumbnail showing personalization preview |

#### For Trophees Personnalises:

| Element | Display |
|---|---|
| Trophy model | "Trofee [Modele — Or / Argent / etc.]" |
| Engraving text | "Gravure: [Champion du monde — 2026]" |
| Name | "Nom: [Jean Dupont]" |
| Date | "Date: [15 juin 2026]" |
| Event | "Evenement: [Tournoi national]" |
| Material | "Matiere: [Bois / Acrylique / Cristal]" |
| Dimensions | "Dimensions: [25cm x 10cm]" |
| File upload | "Fichier telecharge: [logo.pdf]" |

#### For Cartes du Monde en Bois:

| Element | Display |
|---|---|
| Map model | "Carte du monde [Modele — 3D / LED / etc.]" |
| Size | "Taille: [L (90cm x 150cm)]" |
| Style | "Style: [Blank / Prime / Prime+]" |
| Language | "Langue: [Francais]" |
| LED color | "Couleur LED: [Multicolore]" (if LED) |
| Plug type | "Prise: [EU / US]" (if LED) |
| Country/personalization | "Personnalisation: [Etats selectionnes]" |

### Personalization Summary Section

The cart drawer should include a dedicated **personalization summary** below the product title:

```
┌─────────────────────────────────────┐
│ [Thumbnail] Lampe LED 3D Rose       │
│             Modele: Etoile           │
│                                     │
│  ┌─ Personnalisation ──────────┐    │
│  │ Texte: "Joyeux Anniversaire" │    │
│  │ Nom: "Marie"                │    │
│  │ Date: "25 decembre 2026"    │    │
│  │ Couleur: Rose               │    │
│  │ [Voir l'aperçu]             │    │
│  └────────────────────────────┘    │
│                                     │
│  [-] 1 [+]           49,90 EUR     │
└─────────────────────────────────────┘
```

### Made-to-Order Messaging

Since personalized items are made-to-order, the cart must communicate:

1. **Production time:** "Fabrication personnalisee: 3-5 jours ouvrés"
2. **Non-returnable notice:** "Article personnalise — pas de retour" (subtle, not alarming)
3. **Customization confirmation:** "Votre personnalisation sera gravee/creee comme indique"
4. **Edit personalization:** "Modifier la personnalisation" link → returns to product page with pre-filled options

### Incomplete Personalization Handling

If a user adds a product without completing required personalization:

1. **Do NOT add to cart** — require completion before adding
2. **Show validation message** — "Veuillez completer la personnalisation avant d'ajouter au panier"
3. **Highlight incomplete fields** — red border on empty required fields
4. **Save progress** — if user navigates away, remember partially completed personalization

### Cart Drawer Layout (Michket)

```
┌─────────────────────────────────────┐
│ VOTRE PANIER (3)            [X]     │
├─────────────────────────────────────┤
│                                     │
│ [Img] Lampe LED 3D — Etoile         │
│       Personnalisation:              │
│       "Joyeux Anniversaire Marie"   │
│       Rose | 20cm x 15cm            │
│       Fabrication: 3-5 jours        │
│       [-] 1 [+]        49,90 EUR    │
│                                     │
│ [Img] Trofee Champion — Or          │
│       Gravure: "1er Prix — 2026"    │
│       Jean Dupont | 25cm            │
│       Fabrication: 5-7 jours        │
│       [-] 1 [+]        79,90 EUR    │
│                                     │
├─────────────────────────────────────┤
│ 🚚 Plus que 20,10 EUR              │
│    pour la livraison gratuite!       │
│ [████████████░░░░░░░░] 79,80/100   │
├─────────────────────────────────────┤
│ Sous-total:              129,80 EUR │
│ [Code promo]                       │
│                                     │
│ [   PASSER LA COMMANDE   ] ← Gold  │
│                                     │
│ 🚚 Livraison  🔒 Securise  ⭐ Vie  │
├─────────────────────────────────────┤
│ VOUS AIMEREZ AUSSI                  │
│ [Card] [Card] [Card] ← scroll     │
└─────────────────────────────────────┘
```

### Checkout Adaptation

For Michket's Shopify checkout:

1. **Order summary** — Show personalization details in line items
2. **Production time** — Display estimated delivery including production
3. **Gift options** — Add gift message field, gift wrapping option
4. **Personalization confirmation** — Checkbox: "Je confirme que les informations de personnalisation sont correctes"
5. **Non-returnable notice** — Clear but not alarming notice about personalized items
6. **Express checkout** — Shop Pay, Apple Pay, Google Pay prominently displayed
7. **Trust signals** — Repeat "Fabrication artisanale," "Garantie a vie," "Paiement securise"

---

# Summary of Key Discoveries

## Cart Drawer Patterns to Adopt

1. **Single cart experience** — Drawer only, no separate cart page
2. **Free shipping progress bar** — Major conversion lever
3. **Promo code in drawer** — Reduce friction
4. **Trust messaging near CTA** — Free shipping, secure payment, warranty
5. **Recommendations in cart** — Cross-sell opportunity
6. **Scrollable items + sticky CTA** — Handle multiple items
7. **Continue shopping link** — Reduce abandonment

## Cart Drawer Patterns to Enhance for Michket

1. **Personalization summary** — Not just variant names, but full customization display
2. **Production time per item** — Each personalized item shows its own lead time
3. **Edit personalization** — Link back to product page with pre-filled options
4. **Photo/file thumbnails** — Show uploaded files in cart
5. **Made-to-order messaging** — Clear but not off-putting
6. **Personalization preview thumbnail** — Small visual of what will be made

## Checkout Insights

1. **Shopify hosted checkout** — Standard, reliable, optimized
2. **Shop Pay enabled** — Accelerated checkout for repeat customers
3. **Express payment on PDP** — One-tap purchase from product page
4. **Multiple payment methods** — 13+ payment options
5. **Multi-locale** — Supports French, English, and other languages
