# Enjoy The Wood Live Audit

> Recovered from conversation context on 2026-08-25.
> All data below was gathered via live WebFetch calls during the previous session.
> No web research was performed during this recovery — this is a knowledge-persistence operation.

---

## 1. Research Scope & Reference URLs

### Pages Successfully Audited

| # | Page | URL | Depth |
|---|---|---|---|
| 1 | Homepage | https://enjoythewood.com | Full — 14 sections documented |
| 2 | Collection: LED World Maps | https://enjoythewood.com/collections/led-world-maps | Full — 13 elements |
| 3 | Collection: Gift Shop | https://enjoythewood.com/collections/gift-shop | Full — 11 elements |
| 4 | Collection: Kids & Baby | https://enjoythewood.com/collections/kids-baby-gifts | Moderate — structure and categories |
| 5 | Collection: Bestsellers | https://enjoythewood.com/collections/bestsellers | Used to extract product URLs |
| 6 | Product: 3D Wooden World Map Multicolor | https://enjoythewood.com/products/3d-multilayered-world-map-multicolor | Full — 20 sections |
| 7 | Product: LED 2.0 World Map | https://enjoythewood.com/products/led-acrylic-3d-multilayer-world-wall-map | Full — 15 sections |
| 8 | Product: Harry Potter Night Light | https://enjoythewood.com/products/wooden-acrylic-harry-potter-night-light-hogwarts-express | Full — 15 sections |
| 9 | Product: US Country Map | https://enjoythewood.com/products/3d-wooden-world-map-oak-for-us-only | Moderate — variant/personalization patterns |
| 10 | Search Results | https://enjoythewood.com/search?q=map | Full — filters, sorting, product cards |
| 11 | Blog / Editorial | https://enjoythewood.com/blogs/enjoynews | Full — categories, content types |
| 12 | Reviews Hub | https://enjoythewood.com/pages/reviews | Full — platform integration |
| 13 | About / Brand History | https://enjoythewood.com/pages/our-brand-history | Full — story, values, trust |
| 14 | All Products | https://enjoythewood.com/collections/all | Used to extract taxonomy |

### Pages NOT Yet Audited

- Cart drawer (interaction)
- Cart page
- Individual blog post pages
- Individual review details
- Mega-menu dropdown content (images, layout)
- Mobile-specific rendering
- Checkout flow
- Account / login pages
- Wishlist behavior
- Before/after slider interaction details
- UGC inspiration page (/pages/inspiration)

---

## 2. Homepage

The Enjoy The Wood homepage follows a deep, commercially sequenced structure with 14 distinct sections. The homepage is designed to maximize product discovery, cross-selling, and conversion through visual merchandising.

### Section 1: Announcement / Promotional Bar

- **Order:** Top, above all navigation
- **Content:** "BACK TO SCHOOL: UP TO 40% OFF" with a live countdown timer (Days, Hours, Minutes, Seconds)
- **Link:** Points to `/collections/bestseller`
- **Merchandising role:** Creates urgency and promotes active sale
- **Interaction:** Countdown timer is live/animated
- **Conversion purpose:** Drive immediate clicks to sale collection
- **Michket adaptation:** Seasonal promotional bar with Michket-relevant promotions (e.g., "FETE DES PERES: -40% SUR LES TROPHES" or holiday-specific)

### Section 2: Primary Navigation Header

- **Order:** Below announcement bar
- **Content:**
  - Left: Hamburger menu icon, Search icon
  - Center: "Enjoy The Wood" text logo with linked image
  - Right: Country/region selector (default US/USD), Language selector (EN/ES/DE/FR/IT), Account icon, Cart icon with item count
  - Main nav links: BESTSELLERS (with "SALE" badge), WORLD MAPS, COUNTRY MAPS, KIDS & BABY, HARRY POTTER DECOR, DECOR & ACCESSORIES, SHOP ALL
- **Merchandising role:** Primary navigation to all product universes
- **Interaction:** Hover triggers mega-menus with images and subcategories
- **Conversion purpose:** Efficient product discovery from any page
- **Michket adaptation:** Michket logo (black/gold), nav: MEILLEURES VENTES | LAMPES 3D | TROPHEES | CARTES DU MONDE | OCCASIONS | CADEAUX | TOUT VENDRE

### Section 3: Hero Carousel

- **Order:** Below header, full-width
- **Content:** Large rotating carousel with 2 slides
  - Slide 1: "2800x1000" banner image linking to product page
  - Slide 2: "1200x1600" banner image linking to product page
- **Below carousel:** Row of 6 circular category discovery buttons with images and titles:
  1. Natural Color Maps → `/collections/3d-natural-color-maps`
  2. LED Maps → `/collections/led-world-maps`
  3. Maps on Board → `/collections/wooden-panel-world-map`
  4. Colored Maps → `/collections/3d-colored-maps`
  5. Gift Shop → `/collections/gift-shop`
  6. USA Maps → `/collections/usa-maps`
- **Merchandising role:** Hero = flagship product showcase; circles = visual category entry points
- **Interaction:** Carousel auto-rotates with manual navigation dots
- **Conversion purpose:** Immediate visual impact + multiple entry paths into catalog
- **Michket adaptation:** Hero = cinematic product scene (LED lamp glowing in dark room or map on wall); circles = Lampes 3D, Trophées, Cartes du monde, Cadeaux, Nouveautés, Occasions

### Section 4: Bestsellers Carousel

- **Order:** Section 4
- **Title:** "OUR BESTSELLERS" with "SHOP ALL" link
- **Content:** Horizontal scrollable carousel of 9 product cards
- **Each card:**
  - Badge: "BEST SELLER" (colored label)
  - Two product images (front + alternate)
  - Product name
  - Sale price (large)
  - Regular price (struck through)
  - Discount percentage badge (e.g., "36%")
- **Merchandising role:** Social proof + conversion through popular products
- **Interaction:** Horizontal scroll/arrows
- **Conversion purpose:** Reduce decision fatigue by showing proven winners
- **Michket adaptation:** Top-selling lamps, trophies, maps with Michket badges

### Section 5: Category Spotlight Grid

- **Order:** Section 5
- **Content:** 3 large atmospheric image cards in a row
  1. Child with toy car garage → "Kids Toys & Gifts" → `/collections/kids-baby-gifts`
  2. Recipe book → "Recipe Books" → `/collections/recipe-books`
  3. Travel souvenir → "Travel Souvenir" → `/collections/wooden-travel-decor-memory-city`
- **Merchandising role:** Visual discovery for secondary product categories
- **Interaction:** Click navigates to collection
- **Conversion purpose:** Expand catalog awareness beyond core products
- **Michket adaptation:** 3 universes: Lampes LED enracinées | Trophées de reconnaissance | Cartes du monde artisanales

### Section 6: Social Proof / Trust Section

- **Order:** Section 6
- **Title:** "Loved by 200K+ Customers Worldwide"
- **Content:**
  - Trustpilot logo with link to reviews
  - Loox logo with star rating and "27097 customers reviews" link
  - Trust links: service email and WhatsApp number
- **Merchandising role:** Build trust through aggregate social proof
- **Interaction:** Clickable logos/links to review platforms
- **Conversion purpose:** Reduce purchase anxiety
- **Michket adaptation:** "Plus de X clients satisfaits" with review count, Trustpilot/Google reviews integration

### Section 7: New Arrivals Carousel

- **Order:** Section 7
- **Title:** "new arrival"
- **Content:** Horizontal scrollable carousel of 9 product cards
- **Each card:**
  - Badge: "FREE SHIPPING" (colored label)
  - Two product images
  - Product name
  - Sale price + regular price + discount %
- **Merchandising role:** Drive traffic to new inventory
- **Interaction:** Horizontal scroll/arrows
- **Conversion purpose:** Create freshness and return-visit incentive
- **Michket adaptation:** "NOUVEAUTES" section with latest lamps, seasonal trophies, new map styles

### Section 8: Additional Category Discovery

- **Order:** Section 8
- **Title:** "Discover more decor ideas"
- **Content:** 3 large image cards
  1. Wooden lake maps → "3D Wooden Maps of Lakes"
  2. Acrylic wall calendar → "Acrylic Wall Calendar Planner"
  3. Map on board → "Wooden Map on Board"
- **Merchandising role:** Cross-category discovery for niche products
- **Interaction:** Click navigates to collection
- **Conversion purpose:** Increase catalog breadth exposure
- **Michket adaptation:** Niche product discovery — lampes de naissance, trophées sportifs, cartes de pays

### Section 9: Before/After Interactive Slider

- **Order:** Section 9
- **Title:** "Your empty wall is on us!"
- **Content:** Interactive image slider with draggable vertical divider
  - Left: Empty wall (before)
  - Right: Wall with product installed (after)
- **Merchandising role:** Visual transformation demonstration
- **Interaction:** User drags slider to compare
- **Conversion purpose:** Show dramatic product impact, trigger emotional response
- **Michket adaptation:** Wall transformation with Michket LED lamp or wooden map; could also show trophy display

### Section 10: Brand Value Proposition

- **Order:** Section 10
- **Content:** Text-heavy section about brand benefits
  - "100% unique expert craftsmanship"
  - "fast worldwide shipping, a lifetime warranty"
- **Five benefit icons with labels:**
  1. MESMERIZING
  2. INSPIRATIONAL
  3. EDUCATIONAL
  4. SUSTAINABLE
  5. AFFORDABLE
- **Merchandising role:** Brand differentiation and value communication
- **Interaction:** Static, possibly with hover on icons
- **Conversion purpose:** Justify premium positioning
- **Michket adaptation:** "100% personnalise et artisanal" | "Garantie a vie" | "Expedition mondiale" | "Emballage premium" — with Michket-specific value icons

### Section 11: Customer Inspiration / UGC Gallery

- **Order:** Section 11
- **Title:** "Inspired by you" with "View all" link
- **Content:** Horizontally scrollable gallery of 9 customer photos
  - Each photo overlaid with specific product name
  - Links to respective product page
- **Merchandising role:** Authentic social proof through real customer homes
- **Interaction:** Horizontal scroll, click-through to products
- **Conversion purpose:** Show real-world product use, inspire purchase
- **Michket adaptation:** "Inspire par vous" — customer photos of lamps glowing in rooms, maps on walls, trophies displayed

### Section 12: Blog / Editorial Section

- **Order:** Section 12
- **Title:** "RELATED POSTS" / "WELCOME TO OUR BLOG"
- **Content:** 3 blog post cards in a row
  - Featured image
  - Blog post title
  - Short description/teaser
  - Links to `/blogs/enjoynews/...`
- **Merchandising role:** Content marketing, SEO, brand authority
- **Interaction:** Click navigates to blog post
- **Conversion purpose:** Engage visitors, drive return traffic, support SEO
- **Michket adaptation:** Gift guides ("Les 10 meilleurs cadeaux pour un anniversaire"), product care, brand stories

### Section 13: Newsletter Signup

- **Order:** Section 13 (often integrated into footer area)
- **Content:** "WANT $20 OFF YOUR FIRST PURCHASE?" with email input and CTA
- **Merchandising role:** Lead generation, email capture
- **Interaction:** Email input + submit
- **Conversion purpose:** Build email list, incentivize first purchase
- **Michket adaptation:** "10% DE REMISE SUR VOTRE PREMIERE COMMANDE" — email capture

### Section 14: Comprehensive Footer

- **Order:** Bottom of page
- **Content:** (See Section 13 below for full footer architecture)
- **Merchandising role:** Site-wide navigation, trust signals, legal
- **Conversion purpose:** Last-chance navigation, newsletter capture, trust reinforcement

---

## 3. Header & Navigation

### Announcement / Promotional Layers

- **Primary:** Top bar with sale promotion + countdown timer
- **Behavior:** Persistent across all pages, always visible
- **Content pattern:** Seasonal promotions ("BACK TO SCHOOL: UP TO 40% OFF")
- **Michket adaptation:** Rotating seasonal promotions, holiday-specific campaigns

### Desktop Navigation

- **Structure:** Logo center/left, utility icons right, main nav below or inline
- **Main categories (7):**
  1. BESTSELLERS (with SALE badge)
  2. WORLD MAPS
  3. COUNTRY MAPS
  4. KIDS & BABY
  5. HARRY POTTER DECOR
  6. DECOR & ACCESSORIES
  7. SHOP ALL
- **Utility elements:**
  - Search icon (opens search modal/page)
  - Account icon (login/register)
  - Cart icon (shows item count, opens cart drawer)
  - Country/region selector
  - Language selector

### Mega-Menu Patterns

- **Behavior:** Expands on hover (desktop)
- **Content:** Subcategory links with featured images
- **Structure:** Multi-column layout with category headings
- **"Shop All" mega-menu:** Extensive sitemap-style layout
- **Mobile:** Replaced by hamburger → full-screen drawer with accordion hierarchy
- **NOT YET AUDITED:** Specific mega-menu image layouts, animation timing, exact subcategory groupings per menu

### Category Hierarchy

**World Maps (deepest hierarchy):**
```
WORLD MAPS
├── 3D Wooden World Maps
├── 3D Colored World Maps
├── LED World Maps
├── Luminous Maps
├── Maps on Board
├── Solid Maps
├── Canvas Maps
├── 2D Maps
├── Custom Maps
└── Bundles
```

**Country Maps:**
```
COUNTRY MAPS
├── USA
├── Canada
├── Germany
├── United Kingdom
├── Europe
└── [other countries]
```

### Search

- **Entry:** Search icon in header
- **Results page:** `/search?q=...`
- **Results display:** Grid of product cards with pricing, badges
- **Filters on results:** Sort by, price range, stock toggle, tag-based collection filters
- **Pagination:** Page-based (e.g., "1 / 19" for 438 results)
- **NOT YET AUDITED:** Search modal autocomplete, recent searches, popular suggestions

### Cart / Account Entry Points

- **Cart:** Icon with item count → opens slide-out drawer (desktop) or overlay (mobile)
- **Account:** Icon → login/register page
- **NOT YET AUDITED:** Cart drawer content details, account page features

---

## 4. Collection Pages

### 4.1 LED World Maps Collection

**URL:** https://enjoythewood.com/collections/led-world-maps

**Documented elements:**

1. **Breadcrumbs:** HOME > ALL COLLECTIONS > WOODEN WORLD MAPS > 3D LED Wooden World Maps
2. **Collection header/title:** "3D LED Wooden World Maps" — prominent heading
3. **Description text:** Introductory paragraph ("Lighting is the secret ingredient...") — sets context and emotional tone
4. **Product count:** "43 products" displayed
5. **Sub-collection carousel:** Horizontal carousel with 10 categories:
   - LED Maps, Natural Maps, Colored Maps, Luminous Maps, Maps On Board, Solid Maps, Canvas, Bundles, 2D Maps, Accessories
6. **Filter panel:**
   - Sort by: Featured, Most relevant, Best selling, Alphabetically (A-Z, Z-A), Price (low/high), Date (old/new), "In stock only" toggle
   - Price: Range slider
   - Filter Color: Checkbox options
   - Filter LED: Checkbox option
   - Additional tag-based filters
   - Apply button
7. **Sort dropdown:** Integrated within filter panel
8. **Product grid:** Responsive grid of product cards
9. **Product card design:**
   - Two images per card (primary + hover/alternate)
   - Badges: BEST SELLER, NEW, PREMIUM, LABEL, SALE
   - Product name
   - Sale price + regular price (struck through) + discount %
   - Hover behavior: image swap
10. **Editorial content:** "Illuminate Your Space..." section discussing visual impact, customization, plug types, languages, sizes
11. **FAQ section:** "FREQUENTLY ASKED QUESTIONS" accordion — 4 questions about LED maps, changing lights, night light use, premium status
12. **Trust indicators:** Trustpilot and Loox review logos with counts
13. **Footer:** Standard multi-column footer with newsletter signup, social links, payment icons

### 4.2 Gift Shop Collection

**URL:** https://enjoythewood.com/collections/gift-shop

**Documented elements:**

1. **Occasion-based visual tiles (8):**
   - Gifts for Him → `/collections/fathers-day`
   - Gifts for Her → `/collections/gifts-for-her`
   - Gifts for Kids → `/collections/kids-baby-gifts-copy`
   - Gifts under $50 → `/collections/gifts-under-50`
   - Gifts under $100 → `/collections/gifts-under-100`
   - Christmas Gifts → `/collections/christmas-wall-decor`
   - Valentine's Day Gifts → `/collections/valentines-day-gifts`
   - Travel Gifts → `/collections/travel-gifts`
2. **Product count:** 900 products
3. **Filter tags (gift-oriented):**
   - By occasion/recipient: "Father's Day," "birthday gift," "gift for couple," "housewarming," "anniversary gifts"
   - By product type: "3D city map," "LED," "Recipe Book"
   - By label: BESTSELLERLABEL, NEWLABEL, FREESHIPPINGLabel
   - By theme: "Family Gift," "gift for friend," "home decor"
4. **Sort options:** Same as other collections
5. **Product cards:** Same card design with badges and pricing
6. **Urgency elements:** "BACK TO SCHOOL: UP TO 40% OFF" banner
7. **Merchandising difference:** Curated entry point with recipient/occasion pathways
8. **Broader scope:** Includes non-map items (books, recipe holders, key holders)
9. **Visual merchandising:** Large themed tiles promote discovery over generic browsing
10. **Footer:** Standard footer
11. **Trust signals:** Same review platform integration

### 4.3 Kids & Baby Collection

**URL:** https://enjoythewood.com/collections/kids-baby-gifts

**Documented elements:**

1. **Subcategory carousel:** Kid-specific subcategories at top
2. **Product categories:**
   - Montessori furniture (bookshelves, clothing racks)
   - Toys (car garages, play kitchens, wooden cars)
   - Personalized items (name puzzles, wall hooks)
   - Decor (growth charts, night lights, wall shelves)
   - Practical items (lunch boxes, DIY painting kits)
3. **Target age range:** "newborn, toddler, or someone about to transit to school" — early childhood through preschool
4. **Gift occasions:** Birthdays, Christmas parties, baby showers, Thanksgiving, baptisms, housewarming
5. **Differentiation from main collection:** Focus on Montessori toys, safety, learning, and personalization
6. **Filter/sort:** Standard collection filtering
7. **Product grid:** Standard product card layout
8. **NOT YET AUDITED:** Specific filter options, product card details unique to kids section

### Common Collection Patterns (All Collections)

- **Breadcrumbs:** Present on all collection pages
- **Product count:** Always displayed
- **Filter + Sort:** Standard pattern with toggle/drawer
- **Product cards:** Consistent design (2 images, badge, title, price, discount %)
- **Badges:** BEST SELLER, NEW, SALE, FREE SHIPPING, PREMIUM
- **Pricing:** Sale price (large) + regular price (struck through) + discount badge
- **Editorial SEO content:** Descriptive text blocks below products
- **FAQ accordions:** Present on product-heavy collections
- **Trust signals:** Review platform logos with aggregate counts

---

## 5. Search Results Experience

**URL:** https://enjoythewood.com/search?q=map

**Documented elements:**

1. **Results count:** "438 results for 'map'"
2. **Pagination:** Page-based ("1 / 19")
3. **Filter panel (left sidebar):**
   - Sort by: Relevance, Price low→high, Price high→low
   - Stock: "In stock only" toggle
   - Price range: Min/max input fields
   - Tags/Collections: Checkbox filters with counts (e.g., "LED (41)," "BESTSELLERLABEL (43)," "City Map (22)," "gift for her (17)")
4. **Product cards:** Same grid layout as collection pages
   - Two images
   - Product name
   - Sale price + regular price + discount %
   - Badges: NEW, BEST SELLER, FREE SHIPPING
5. **NOT YET AUDITED:** Search modal/overlay behavior, autocomplete, recent/popular searches, search suggestions

---

## 6. Product Page — 3D Wooden World Map Multicolor

**URL:** https://enjoythewood.com/products/3d-multilayered-world-map-multicolor

This is the most deeply documented product page — 20 sections identified.

### Section 1: Navigation & Breadcrumbs

- Persistent top bar with logo, main menu, search, account, cart
- Breadcrumb trail: HOME > ALL COLLECTIONS > WOODEN WORLD MAPS > 3D Natural Color Maps > Product Name
- Mega-menu on hover for any nav item

### Section 2: Product Gallery

- **Layout:** Left side — main large image with horizontal thumbnail strip below; Right side — product info (desktop). On mobile: gallery stacks above info.
- **Image count:** 13+ images
- **Content:** Room settings, close-ups, packaging, detail shots
- **Video:** One video thumbnail with play icon overlay
- **Interactions:**
  - Click thumbnails → updates main image
  - Click main image → opens full-screen lightbox with zoom
  - Zoom on hover (desktop) or pinch (mobile)
  - Arrow navigation in lightbox
- **Desktop:** Wider gallery, hover zoom
- **Mobile:** Horizontal thumbnail strip, swipeable, compressed main image

### Section 3: Product Title & Badges

- **Title:** "3D Wooden World Map Multicolor" — large heading
- **Badges:** Two prominent badges below title
  - "BEST CHOICE" (orange)
  - "SPECIAL OFFER" (red)

### Section 4: Pricing

- **Sale price:** "$89.00" — large, bold
- **Regular price:** "$139.06" — struck through
- **Discount:** 36% off (implied)

### Section 5: Variant Selectors

- **Size:** Dropdown — M (24"x 39"), L (35"x 59"), XL (47"x 79"), 2XL (63"x 98"), 3XL (69"x118")
  - "Size Guide" link opens modal with dimension charts
- **Style:** Button group — Blank (no names & border), Prime (with names), Prime+ (+mountains & rivers)
  - Descriptions appear on hover/select
- **Language:** Dropdown — English, Spanish, German, French, Italian
- **Default state:** Size: M, Style: Blank, Language: English
- **"READY TO SHIP" badge** shown for in-stock variants

### Section 6: Add to Cart & Express Checkout

- **Add to Cart:** Large green "Add to cart" button
  - Disabled until required variants are chosen
  - Becomes "Choose options" for unselected variants
- **Express Checkout:** Icons for Shop Pay, Apple Pay, Google Pay, PayPal

### Section 7: Trust & Payment Badges

- Row of credit card/payment logos (Visa, Mastercard, Amex, PayPal, Apple Pay, Google Pay)
- "Guaranteed shipping" checkmark icon
- Material/quality claims: "Handcrafted from birch plywood," "non-toxic"
- Patent info: "International patent: ✔"

### Section 8: Product Description

- Multiple H2 headings and bulleted lists
- Sections:
  - Intro paragraph on transforming living space
  - "Why Every Home Needs a Wooden World Map" — conversation starter, visual diary
  - "Customize Your 3D Wooden World Map" — detailing levels, sizing, language, material, assembly kit
  - "The Perfect Accent for Home and Office" — gift ideas, office decor
- Link to "3D Wooden World Maps" collection
- Disclaimer: not a precise geographical map

### Section 9: Specifications

- Two-column list under "MAP SPECS"
- Material: birch plywood
- Color: Multicolor
- Default language: English
- Thickness: 6-9 mm
- International patent: ✔
- Guaranteed shipping: ✔
- Note about original products and patent portfolio

### Section 10: Shipping

- "regular and express shipping all over the world"
- Contact email link
- Link to shipping policies page

### Section 11: Returns

- "returns and exchanges" accepted "within 30 days" for non-personized items
- Link to return policy

### Section 12: "In The Box"

- 4 items in horizontal carousel with icons/images and descriptions:
  1. Map accessories (ocean names, decorations, Antarctica, compass)
  2. Double-side sticky tape
  3. Corner stencils
  4. Instructions (with lifetime warranty note)
- Navigation arrows for carousel

### Section 13: Map Styles Section

- Visual carousel with large images and descriptive text
- Three styles shown with tabs: Blank, Prime, Prime+
- Clicking style name/image changes main visual and description
- Arrow navigation for carousel

### Section 14: Map Sizes Section

- Visual carousel similar to Map Styles
- Five sizes (Medium to 3XLarge) with dimensions and ideal room suggestions
- Clicking size changes visual (shows map scale against room)
- Arrow navigation

### Section 15: Before/After Slider

- Title: "Check before and after"
- Interactive draggable divider
- Left: empty wall (before)
- Right: wall with XLarge map installed (after)

### Section 16: Customer Reviews

- **Aggregate rating:** 4.9 / 5 from 2740 reviews
- **Individual reviews:** Star rating, verified purchase tag, reviewer name, date, text, customer photos
- **Photo reviews:** Lightbox on click
- **Pagination/Load more** for additional reviews

### Section 17: Related Products

- "You may also like" carousel of 4-5 product cards
- Product image, title, price
- Arrow navigation

### Section 18: Blog Posts

- 3 article cards with featured image, category, title, excerpt
- Links to blog posts

### Section 19: Newsletter Signup

- "Want $20 OFF Your First Purchase?"
- Email input + "YES, GET THE DISCOUNT!" CTA

### Section 20: FAQ

- Accordion-style under "FREQUENTLY ASKED QUESTIONS"
- 3 questions about installation, sticking to wall, tips

---

## 7. Product Page — LED 2.0 World Map

**URL:** https://enjoythewood.com/products/led-acrylic-3d-multilayer-world-wall-map

15 sections documented. Key differences from standard map page:

### Unique Elements

1. **Gallery:** Emphasizes LED-specific imagery — lit/unlit states, room settings, LED glow demonstration
2. **Title:** "3D LED Wooden World Map 2.0 (with acrylic background)"
3. **Pricing:** $499.00 (sale) / $623.75 (regular) — premium price point
4. **Additional variant — Plug Type:** US PLUG, EU PLUG
5. **Color variants:** Multicolored, Terra, Oak, Dark Walnut, Light
6. **Description focus:** Technical LED features — RGB LED, app control, 7 modes, phone app
7. **Specifications:** LED-specific — plug type, app compatibility, voltage (110V/220V)
8. **"Featured" section:** Media logos (Forbes, Elle Decor, etc.) — third-party validation
9. **Installation content:** Two mounting methods — adhesive tape or anchor bolts with gap from wall
10. **Trust:** "Lifetime warranty" mentioned prominently

### Pattern Observations

- Premium products get additional trust elements (media logos)
- Technical products require specification-rich descriptions
- LED products need to show both on/off states in gallery
- Plug type is a critical variant for international customers

---

## 8. Product Page — Harry Potter Night Light

**URL:** https://enjoythewood.com/products/wooden-acrylic-harry-potter-night-light-hogwarts-express

15 sections documented. Key differences:

### Unique Elements

1. **Single-SKU product:** No variant selectors — sold as-is
2. **Gallery:** Shows product off (as sketch) and on (illuminated) — demonstrates core feature
3. **Narrative focus:** "A Magical Departure Brought to Life" — emotional, experience-driven
4. **Trust:** "Officially licensed" as primary differentiator + "International patent: ✔"
5. **Specs:** Light modes (3), rechargeable battery (10 hours), touch control
6. **Simpler purchase path:** Direct "Add to cart" — no configuration needed
7. **Cross-sells:** Blog posts about Harry Potter night lights — franchise-targeted
8. **No reviews section on product page** — reviews shown via Trustpilot/Loox widgets only

### Pattern Observations

- Licensed products use licensing as primary trust signal
- Single-SKU products have simplified purchase flow
- Gallery demonstrates product's core function (on/off for lights)
- Cross-sells are content-driven for niche products

---

## 9. Product Page — US Country Map

**URL:** https://enjoythewood.com/products/3d-wooden-world-map-oak-for-us-only

### Unique Elements

1. **State-specific personalization:** Choose states to be engraved with names or capitals
2. **Video preview** in gallery (not seen on world map page)
3. **Description:** "A truly personalized decoration" — personalization as primary value prop
4. **Specs:** Material, color, engraving details
5. **Close-up wooden detail** photo in gallery

### Pattern Observations

- Country maps enable geographic personalization (state/region selection)
- Personalization depth varies by product type
- Video is used for products with unique physical features

---

## 10. Product Page Patterns — Consolidated

### Recurring Patterns (Across All Product Pages)

**Media Gallery:**
- Left-aligned large image + thumbnail strip (desktop) / stacked (mobile)
- 8-15+ images per product
- At least one video for premium/complex products
- Zoom on hover (desktop) / pinch (mobile)
- Full-screen lightbox
- Thumbnails show alternate views

**Pricing:**
- Sale price: Large, bold, primary color
- Regular price: Smaller, struck through
- Discount percentage: Badge or text near price
- Price updates on variant selection

**Reviews:**
- Aggregate rating near top (star icon + number + count)
- Individual reviews with: stars, verified badge, name, date, text, photos
- Photo reviews with lightbox
- Pagination or "Load more"
- External platform integration (Trustpilot, Loox)

**Variant Hierarchy:**
- Size → Style → Language (for maps)
- Plug type added for LED products
- Button groups for style, dropdowns for size/language
- "Size Guide" link with modal
- Selection updates price and availability

**Personalization:**
- Treated as variant selection, not form inputs
- Style options (Blank/Prime/Prime+) control personalization level
- Language selection for engraved text
- NOT YET AUDITED: Free-text personalization fields

**Stock/Availability:**
- "READY TO SHIP" badge for in-stock items
- "Sold out" state with disabled CTA
- "Only X few items left" urgency messaging
- Real-time visitor count: "X visitor(s) currently looking"

**Add to Cart:**
- Large, prominent CTA button
- Disabled until variants selected
- "Choose options" alternative text
- Triggers cart drawer slide-in

**Shipping Reassurance:**
- "Guaranteed shipping" badge
- "Regular and express shipping all over the world"
- Link to shipping policy

**Content Hierarchy:**
1. Gallery + variants + CTA (above fold)
2. Description (editorial, emotional)
3. Specifications (technical)
4. Shipping + Returns (policy)
5. "In The Box" (what's included)
6. Visual education (styles, sizes)
7. Before/After
8. Reviews
9. Cross-sells
10. Blog
11. Newsletter
12. FAQ

**Cross-selling:**
- "You may also like" carousel
- "Popular Posts" blog section
- Category-specific related content

**Mobile-Relevant Behavior:**
- Gallery stacks above info
- Thumbnails horizontal swipe
- Variant selectors remain accessible
- Express checkout prominent
- FAQ as accordion (not tabs)

### Product-Specific Patterns

| Pattern | Maps | LED Maps | Night Lights | Country Maps |
|---|---|---|---|---|
| Variant complexity | High (size+style+language) | Very high (+plug+color) | None (single SKU) | Medium (state selection) |
| Gallery emphasis | Room settings, detail | LED on/off, glow | On/off demonstration | Geographic detail |
| Trust signal | Patent, craftsmanship | Media logos, patent | Official license | Patent, personalization |
| Description style | Editorial, emotional | Technical, feature-rich | Narrative, magical | Personalization-focused |
| Cross-sell | Maps, accessories | Maps, accessories | Blog content | Maps, accessories |
| Video | Optional | Expected | Expected | Used |

---

## 11. Reviews / Social Proof

### Review Platform Integration

- **Primary:** Trustpilot — linked from header, footer, product pages, reviews hub
- **Secondary:** Loox — provides aggregate review count and star ratings
- **Aggregate count:** "27097 customers reviews" displayed across site

### Trust Signals on Product Pages

- Star rating near product title (e.g., "4.9 / 5 from 2740 reviews")
- Verified purchase badges on individual reviews
- Customer-uploaded photos in reviews
- "Loved by 200K+ Customers Worldwide" on homepage
- Physical business address (Wilmington, Delaware)
- Contact email and WhatsApp

### Rating Presentation

- Aggregate: Star icon + numeric rating + review count
- Individual: 5-star system with half-star support
- Review distribution bar chart (on product pages with many reviews)

### Customer Proof Mechanisms

- Photo reviews (customer-uploaded images of product in home)
- "Inspired by you" UGC gallery on homepage
- Real-time visitor count on product pages
- Social media follower counts (Instagram 465K, TikTok 277.9K, etc.)

---

## 12. Blog / Editorial

### Six Blog Categories

1. **EnjoyNews** — General company news, announcements, trade shows
2. **EnjoyHome** — Home decor inspiration, styling guides
3. **EnjoyTravel** — Travel stories, map-related content
4. **EnjoyStories** — Brand narratives, founder story, resilience
5. **EnjoyPartners** — Collaborations, partnerships
6. **OurValues** — Sustainability, CSR, company principles

### Content Types Published

- Product launches (Harry Potter night lights)
- Company news (trade show recaps, awards)
- Behind-the-scenes (manufacturing process)
- Sustainability (tree-planting initiatives)
- Brand storytelling (recovery, resilience)
- Guides and tips (Black Friday planning)

### Editorial Architecture

- Reverse-chronological grid layout
- Featured image + title + excerpt + date + read time
- Top posts given larger visual prominence
- Posts linked to relevant product collections
- Seasonal promotional content woven in

### Commercial Purpose

- SEO content targeting product-related keywords
- Brand authority and differentiation
- Return-visit incentive
- Social sharing potential
- Product education (installation guides, care tips)

---

## 13. About / Brand Story

### Company Story Elements

- **Mission:** "100% unique expert craftsmanship" creating "inspirational atmosphere that sparks new adventures"
- **Product narrative:** Maps as functional, emotional items for "planning trips" and "thoughtful gifts"
- **Longevity:** "will be kept in the family for generations to admire"
- **Founder story:** Told indirectly through "The Founder's Book" — aspirational, resilience-focused

### Values Communicated

1. **MESMERIZING** — Aesthetic and visual impact
2. **INSPIRATIONAL** — Emotional benefit
3. **EDUCATIONAL** — Functional, learning aspect
4. **SUSTAINABLE** — Material choices
5. **AFFORDABLE** — Price positioning

### Trust-Building Mechanisms

- "Loved by 200K+ Customers Worldwide"
- "TOP 100 USA Awards" recognition
- Physical business address
- Multiple contact channels (email, WhatsApp)
- Lifetime warranty promise
- International patent portfolio
- Trustpilot + Loox integration

---

## 14. Patterns Relevant to Michket

### For Lampes 3D Personnalisees

| Enjoy The Wood Pattern | Michket Adaptation |
|---|---|
| LED on/off gallery demonstration | Lamp glow in dark room — show light colors, ambiance |
| Plug type variants (US/EU) | Same — essential for international sales |
| Light mode specifications | 3-7 light modes, RGB, app control |
| Before/after wall transformation | Room before/after with lamp illumination |
| Premium product media logos | Michket press coverage, design awards |
| Technical description focus | LED specs, material quality, app features |
| Video for complex products | Lamp lighting modes demo video |

### For Trophees Personnalises

| Enjoy The Wood Pattern | Michket Adaptation |
|---|---|
| State-specific personalization (US map) | Name, date, event, achievement engraving |
| "In The Box" section | Trophy + base + certificate + packaging |
| Style variants (Blank/Prime/Prime+) | Material variants (wood, acrylic, crystal) |
| Specifications section | Dimensions, weight, material, engraving area |
| Trust signals (patent, warranty) | Handmade guarantee, satisfaction warranty |
| Customer reviews with photos | Award ceremony photos, recipient reactions |

### For Cartes du Monde en Bois

| Enjoy The Wood Pattern | Michket Adaptation |
|---|---|
| Size variants (M-3XL) | Same size range with room-fit guidance |
| Style variants (Blank/Prime/Prime+) | Same — with Michket personalization options |
| Language selection | French, English, Arabic, etc. |
| Map Styles visual education | Visual guide to Michket map styles |
| Map Sizes visual education | Room-size recommendations per map size |
| Before/after slider | Wall transformation with Michket map |
| "In The Box" | Map + accessories + mounting kit + instructions |
| UGC gallery | Customer photos of maps in real homes |

### For Cadeaux par Occasion

| Enjoy The Wood Pattern | Michket Adaptation |
|---|---|
| Gift Shop visual tiles (8 categories) | 18+ occasion tiles (Anniversaire, Mariage, BAC, etc.) |
| Occasion-based filtering | Same — occasion as primary filter |
| Price-range filtering | "Moins de 50€," "50-100€," "100-200€," "200€+" |
| Recipient-based navigation | Pour lui, pour elle, pour enfant, pour mamam |
| Seasonal promotional bars | Holiday-specific promotions |
| Gift wrapping option | Premium gift wrapping as add-on |

---

## 15. What Has NOT Yet Been Audited

### Critical Gaps (Required for Complete Blueprint)

| Area | Status | Why It Matters |
|---|---|---|
| Cart drawer behavior | NOT YET AUDITED | Need to understand upsell, free shipping threshold, UX |
| Cart page (full) | NOT YET AUDITED | Full cart review experience |
| Mega-menu specific content | NOT YET AUDITED | Exact images, layout, subcategory grouping per menu |
| Mobile navigation behavior | NOT YET AUDITED | Hamburger drawer structure, accordion hierarchy |
| Mobile PDP | NOT YET AUDITED | Stacked layout, sticky CTA, gallery swipe |
| Mobile collection page | NOT YET AUDITED | Filter drawer, 2-column grid, swipe behavior |
| Checkout flow | NOT YET AUDITED | Express checkout, shipping options, payment |

### Important Gaps (Enhance Blueprint Quality)

| Area | Status | Why It Matters |
|---|---|---|
| Search modal overlay | NOT YET AUDITED | Autocomplete, recent/popular, suggestions |
| UGC / Inspiration page | NOT YET AUDITED | Full gallery structure |
| Before/after interaction details | NOT YET AUDITED | Technical implementation notes |
| Individual blog post page | NOT YET AUDITED | Content layout, CTA integration |
| Footer detail (mobile) | NOT YET AUDITED | Collapsible sections behavior |
| Wishlist behavior | NOT YET AUDITED | Save for later functionality |
| Account page | NOT YET AUDITED | Order history, personalization history |
| Product page video behavior | NOT YET AUDITED | Lightbox, autoplay, controls |
| Filter drawer (mobile) | NOT YET AUDITED | Bottom sheet vs sidebar |
| Sticky elements on scroll | NOT YET AUDITED | Sticky header, sticky CTA behavior |
| Newsletter popup | NOT YET AUDITED | Exit-intent, timing, design |
| Cross-sell recommendations engine | NOT YET AUDITED | How related products are selected |
