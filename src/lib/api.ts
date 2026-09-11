/**
 * Michket catalog API client.
 *
 * All storefront data comes from the public backend.
 * NEVER call /admin routes from here.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

// ---------------------------------------------------------------------------
// Error types — distinguish 404 vs server errors vs empty results
// ---------------------------------------------------------------------------

export class ApiNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiNotFoundError";
  }
}

export class ApiRequestError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

// ---------------------------------------------------------------------------
// Personalization config — exact backend contract
// ---------------------------------------------------------------------------

export interface PersonalizationFreeConfig {
  version: number;
  mode: "FREE";
  label: string;
  placeholder: string;
  required: boolean;
  maxLength: number;
}

export interface PersonalizationField {
  id: string;
  label: string;
  type: "TEXT" | "SELECT";
  required: boolean;
  placeholder?: string;
  maxLength?: number;
  options?: string[];
}

export interface PersonalizationOptionsConfig {
  version: number;
  mode: "OPTIONS";
  fields: PersonalizationField[];
}

export type PersonalizationConfig =
  | PersonalizationFreeConfig
  | PersonalizationOptionsConfig;

// ---------------------------------------------------------------------------
// Types — match backend responses
// ---------------------------------------------------------------------------

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  pageTitle: string | null;
  productsTitle: string | null;
  filterLabel: string | null;
  imageUrl: string | null;
  imageStoragePath: string | null;
  href: string | null;
  parentId: string | null;
  isActive: boolean;
  sortOrder: number;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiCategoryImage {
  id: string;
  categoryId: string;
  url: string;
  storagePath: string | null;
  altText: string | null;
  sortOrder: number;
  createdAt: string;
}

/** GET /categories/:slug — includes children + heroImages */
export interface ApiCategoryDetail extends ApiCategory {
  children: ApiCategory[];
  heroImages: ApiCategoryImage[];
}

export interface ApiProductListItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  priceCents: number;
  compareAtPriceCents: number | null;
  currency: string;
  badge: string | null;
  occasions: string[] | null;
  isPersonalizable: boolean;
  personalizationPrompt: string | null;
  ratingAvg: number | string | null;
  ratingCount: number | null;
  createdAt: string;
  imageUrl: string | null;
  imageAlt: string | null;
}

export interface ApiProductImage {
  id: string;
  productId: string;
  url: string;
  storagePath: string | null;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
  variantId: string | null;
  createdAt: string;
}

export interface ApiInventory {
  id: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  reserved: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  updatedAt: string;
}

export interface ApiProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  categoryId: string;
  priceCents: number;
  compareAtPriceCents: number | null;
  currency: string;
  badge: string | null;
  occasions: string[] | null;
  isPersonalizable: boolean;
  personalizationPrompt: string | null;
  personalizationConfig: PersonalizationConfig | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ratingAvg: number | string | null;
  ratingCount: number | null;
  createdAt: string;
  updatedAt: string;
  images: ApiProductImage[];
  variants: Array<{
    id: string;
    productId: string;
    name: string;
    sku: string | null;
    colorName: string | null;
    colorHex: string | null;
    priceCents: number | null;
    options: Record<string, unknown> | null;
    sortOrder: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    inventory: ApiInventory | null;
  }>;
  inventory: ApiInventory | null;
  category?: ApiCategory | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ---------------------------------------------------------------------------
// Frontend-friendly mapped types (matching existing frontend Product shape)
// ---------------------------------------------------------------------------

export interface ProductImage {
  src: string;
  alt: string;
  variantId: string | null;
}

export interface ProductVariant {
  id: string;
  name: string;
  colorName: string | null;
  colorHex: string | null;
  sortOrder: number;
  /** Variant price in DZD. Undefined means the product base price applies. */
  price?: number;
  /** Current variant inventory returned by the backend. */
  inventory: ApiInventory | null;
  /** Availability derived from quantity, reserved and trackInventory. */
  inStock: boolean;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  images: ProductImage[];
  badge?: "BEST SELLER" | "NOUVEAU" | "PROMO" | "PERSONNALISABLE" | "ENVOI GRATUIT";
  category: string;
  categoryName?: string;
  occasion?: string[];
  rating?: number;
  reviewCount?: number;
  inStock: boolean;
  personalizable: boolean;
  personalizationConfig?: PersonalizationConfig | null;
  variants?: ProductVariant[];
}

// ---------------------------------------------------------------------------
// Mapping helpers
// ---------------------------------------------------------------------------

const BADGE_MAP: Record<string, Product["badge"]> = {
  BEST_SELLER: "BEST SELLER",
  NOUVEAU: "NOUVEAU",
  PROMO: "PROMO",
  PERSONNALISABLE: "PERSONNALISABLE",
  ENVOI_GRATUIT: "ENVOI GRATUIT",
};

function centsToDA(cents: number): number {
  return cents / 100;
}

function normalizeRating(value: number | string | null): number | undefined {
  if (value == null) return undefined;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function inventoryHasStock(inventoryRow: ApiInventory | null): boolean {
  // No inventory row means the backend is not providing a tracked stock row
  // for this product/variant. Preserve storefront availability in that case.
  if (!inventoryRow) return true;
  if (!inventoryRow.trackInventory) return true;
  return inventoryRow.quantity - inventoryRow.reserved > 0;
}

function mapProductListItem(
  item: ApiProductListItem,
): Product {
  return {
    id: item.id,
    slug: item.slug,
    title: item.name,
    description: item.description ?? "",
    price: centsToDA(item.priceCents),
    compareAtPrice:
      item.compareAtPriceCents != null
        ? centsToDA(item.compareAtPriceCents)
        : undefined,
    currency: item.currency,
    images: item.imageUrl
      ? [{ src: item.imageUrl, alt: item.imageAlt ?? item.name, variantId: null }]
      : [],
    badge: item.badge ? BADGE_MAP[item.badge] ?? undefined : undefined,
    category: item.categorySlug,
    categoryName: item.categoryName,
    occasion: item.occasions ?? undefined,
    rating: normalizeRating(item.ratingAvg),
    reviewCount: item.ratingCount ?? undefined,
    inStock: true, // listing doesn't carry inventory — assume available
    personalizable: item.isPersonalizable,
  };
}

function mapProductDetail(
  detail: ApiProductDetail,
  categoryName: string,
): Product {
  const images: ProductImage[] = detail.images.length > 0
    ? [...detail.images]
        .sort((a, b) => {
          if (a.isPrimary && !b.isPrimary) return -1;
          if (!a.isPrimary && b.isPrimary) return 1;
          return a.sortOrder - b.sortOrder;
        })
        .map((img) => ({ src: img.url, alt: img.altText ?? detail.name, variantId: img.variantId }))
    : [];

  const variants: ProductVariant[] = detail.variants
    .filter((v) => v.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((v) => ({
      id: v.id,
      name: v.name,
      colorName: v.colorName,
      colorHex: v.colorHex,
      sortOrder: v.sortOrder,
      price: v.priceCents != null ? centsToDA(v.priceCents) : undefined,
      inventory: v.inventory,
      inStock: inventoryHasStock(v.inventory),
    }));

  return {
    id: detail.id,
    slug: detail.slug,
    title: detail.name,
    description: detail.description ?? "",
    price: centsToDA(detail.priceCents),
    compareAtPrice:
      detail.compareAtPriceCents != null
        ? centsToDA(detail.compareAtPriceCents)
        : undefined,
    currency: detail.currency,
    images,
    badge: detail.badge ? BADGE_MAP[detail.badge] ?? undefined : undefined,
    category: categoryName,
    categoryName: detail.category?.name ?? undefined,
    occasion: detail.occasions ?? undefined,
    rating: normalizeRating(detail.ratingAvg),
    reviewCount: detail.ratingCount ?? undefined,
    inStock:
      variants.length > 0
        ? variants.some((variant) => variant.inStock)
        : inventoryHasStock(detail.inventory),
    personalizable: detail.isPersonalizable,
    personalizationConfig: detail.personalizationConfig ?? null,
    variants: variants.length > 0 ? variants : undefined,
  };
}

// ---------------------------------------------------------------------------
// Fetch wrapper
// ---------------------------------------------------------------------------

type ApiFetchOptions = {
  noStore?: boolean;
};

async function apiFetch<T>(
  path: string,
  init?: RequestInit,
  options?: ApiFetchOptions,
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const method = (init?.method ?? "GET").toUpperCase();

  const cacheConfig =
    method === "GET"
      ? options?.noStore
        ? { cache: "no-store" as RequestCache }
        : { next: { revalidate: 60 } }
      : { cache: "no-store" as RequestCache };

  const res = await fetch(url, {
    ...init,
    ...cacheConfig,
  });

  if (!res.ok) {
    let backendMessage = "";

    try {
      const body = (await res.json()) as {
        message?: string | string[];
        error?: string;
      };

      if (Array.isArray(body.message)) {
        backendMessage = body.message.join(" · ");
      } else if (typeof body.message === "string") {
        backendMessage = body.message;
      } else if (typeof body.error === "string") {
        backendMessage = body.error;
      }
    } catch {
      // Keep the generic fallback below if the backend response is not JSON.
    }

    const message =
      backendMessage || `API error ${res.status} for ${path}`;

    if (res.status === 404) {
      throw new ApiNotFoundError(message);
    }

    throw new ApiRequestError(res.status, message);
  }

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Public API methods
// ---------------------------------------------------------------------------

/** GET /categories — returns flat list of active categories */
export async function fetchCategories(): Promise<ApiCategory[]> {
  // Header/navigation must always reflect the current backend state.
  // Do not keep deleted/created categories in Next.js ISR cache.
  return apiFetch<ApiCategory[]>(
    "/categories",
    undefined,
    { noStore: true },
  );
}

/** GET /categories/featured — first 4 active top-level categories */
export async function fetchFeaturedCategories(): Promise<ApiCategory[]> {
  return apiFetch<ApiCategory[]>("/categories/featured");
}

/** GET /categories/:slug — includes children + heroImages */
export async function fetchCategoryBySlug(
  slug: string,
): Promise<ApiCategoryDetail> {
  return apiFetch<ApiCategoryDetail>(`/categories/${encodeURIComponent(slug)}`);
}

/** GET /products with filters */
export async function fetchProducts(params: {
  category?: string;
  badge?: string;
  personalizable?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<ApiProductListItem>> {
  const qs = new URLSearchParams();
  if (params.category) qs.set("category", params.category);
  if (params.badge) qs.set("badge", params.badge);
  if (params.personalizable != null)
    qs.set("personalizable", String(params.personalizable));
  if (params.minPrice != null) qs.set("minPrice", String(params.minPrice));
  if (params.maxPrice != null) qs.set("maxPrice", String(params.maxPrice));
  if (params.search?.trim()) qs.set("search", params.search.trim());
  if (params.sort) qs.set("sort", params.sort);
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  const query = qs.toString();
  return apiFetch<PaginatedResponse<ApiProductListItem>>(
    `/products${query ? `?${query}` : ""}`,
  );
}

/** GET /products/best-sellers */
export async function fetchBestSellers(
  limit?: number,
): Promise<ApiProductListItem[]> {
  const qs = new URLSearchParams();
  if (limit != null) qs.set("limit", String(limit));
  const query = qs.toString();

  return apiFetch<ApiProductListItem[]>(
    `/products/best-sellers${query ? `?${query}` : ""}`,
  );
}

/** GET /products/:slug — full detail with images + variants + inventory */
export async function fetchProductBySlug(
  slug: string,
): Promise<ApiProductDetail> {
  return apiFetch<ApiProductDetail>(
    `/products/${encodeURIComponent(slug)}`,
  );
}

// ---------------------------------------------------------------------------
// Convenience: fetch products for a category, mapped to frontend Product type
// ---------------------------------------------------------------------------

/**
 * Fetch all active products for a given category slug, mapped to frontend Product[].
 *
 * The backend automatically includes products from child categories when the slug
 * refers to a main (parent) category, so the frontend does NOT need to query children separately.
 *
 * The backend returns an empty page for an unknown category slug.
 * Throws ApiRequestError on server errors.
 */
export async function fetchProductsForCategory(
  categorySlug: string,
  opts?: { limit?: number; personalizable?: boolean },
): Promise<Product[]> {
  const all: ApiProductListItem[] = [];
  let page = 1;
  const limit = opts?.limit ?? 50;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const res = await fetchProducts({
      category: categorySlug,
      page,
      limit,
      personalizable: opts?.personalizable,
    });
    all.push(...res.data);
    if (page >= res.meta.totalPages) break;
    page++;
  }

  return all.map((item) => mapProductListItem(item));
}

/** Fetch products by badge, mapped to frontend Product[] */
export async function fetchProductsByBadge(
  badge: string,
  opts?: { limit?: number },
): Promise<Product[]> {
  const res = await fetchProducts({
    badge,
    limit: opts?.limit ?? 50,
  });
  return res.data.map((item) => mapProductListItem(item));
}

/** Fetch best sellers, mapped to frontend Product[] */
export async function fetchBestSellersMapped(): Promise<Product[]> {
  const items = await fetchBestSellers();
  return items.map((item) => mapProductListItem(item));
}

/** Fetch all products across all pages, mapped to frontend Product[] */
export async function fetchAllProductsMapped(): Promise<Product[]> {
  const all: ApiProductListItem[] = [];
  let page = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const res = await fetchProducts({ page, limit: 50 });
    all.push(...res.data);
    if (page >= res.meta.totalPages) break;
    page++;
  }
  return all.map((item) => mapProductListItem(item));
}

/**
 * Fetch a single product by slug, mapped to frontend Product + SEO metadata.
 *
 * Throws ApiNotFoundError if product doesn't exist or is inactive.
 * Throws ApiRequestError on server errors.
 */
export async function fetchProductDetail(
  slug: string,
): Promise<Product & { metaTitle?: string; metaDescription?: string }> {
  const detail = await fetchProductBySlug(slug);
  // Resolve category name from category relation or lookup
  let categoryName = "";
  if (detail.category?.slug) {
    categoryName = detail.category.slug;
  }
  const product = mapProductDetail(detail, categoryName);
  return {
    ...product,
    metaTitle: detail.metaTitle ?? undefined,
    metaDescription: detail.metaDescription ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// Category name lookup (for category slug → display name)
// ---------------------------------------------------------------------------

export async function fetchCategoryNameBySlug(
  slug: string,
): Promise<string> {
  const cat = await fetchCategoryBySlug(slug);
  return cat.name;
}

/**
 * Fetch category by slug, returning null on 404 instead of throwing.
 * Useful for pages that want to show a graceful 404 rather than crash.
 */
export async function fetchCategoryBySlugSafe(
  slug: string,
): Promise<ApiCategoryDetail | null> {
  try {
    return await fetchCategoryBySlug(slug);
  } catch (e) {
    if (e instanceof ApiNotFoundError) return null;
    throw e;
  }
}

/**
 * Fetch product by slug, returning null on 404 instead of throwing.
 * Useful for pages that want to show a graceful 404 rather than crash.
 */
export async function fetchProductBySlugSafe(
  slug: string,
): Promise<ApiProductDetail | null> {
  try {
    return await fetchProductBySlug(slug);
  } catch (e) {
    if (e instanceof ApiNotFoundError) return null;
    throw e;
  }
}

// ---------------------------------------------------------------------------
// Cart types — match backend GET /carts response
// ---------------------------------------------------------------------------

export interface ApiCartVariant {
  id: string;
  name: string;
  sku: string | null;
  colorName: string | null;
  colorHex: string | null;
}

export interface ApiCartProduct {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  isPersonalizable: boolean;
  imageUrl: string | null;
  imageAlt: string | null;
}

export interface ApiCartItem {
  id: string;
  quantity: number;
  unitPriceCents: number;
  selectedColorName: string | null;
  selectedColorHex: string | null;
  personalization: Record<string, unknown> | null;
  personalizationKey: string;
  variant: ApiCartVariant | null;
  product: ApiCartProduct;
}

export interface ApiCart {
  cart: {
    id: string;
    status: string;
  };
  sessionId: string | undefined;
  items: ApiCartItem[];
  subtotalCents: number;
  currency: string;
  itemCount: number;
}

// ---------------------------------------------------------------------------
// Cart session helpers — guest identification via localStorage
// ---------------------------------------------------------------------------

const CART_SESSION_KEY = "michket_cart_session";

/** Retrieve the persisted guest session UUID, or null if absent. */
export function getCartSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CART_SESSION_KEY);
}

/** Persist a guest session UUID returned by the backend. */
export function setCartSessionId(sessionId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_SESSION_KEY, sessionId);
}

// ---------------------------------------------------------------------------
// Cart API client — bridges frontend to backend /carts endpoints
// ---------------------------------------------------------------------------

/**
 * Client-side fetch wrapper for cart endpoints.
 *
 * Differences from the catalog `apiFetch`:
 * - No ISR revalidation (cart data is dynamic)
 * - Automatically attaches `X-Session-Id` header for guest carts
 * - Captures `X-Session-Id` from response to persist new sessions
 */
async function cartFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const sessionId = getCartSessionId();

  const headers: Record<string, string> = {
    ...(sessionId ? { "X-Session-Id": sessionId } : {}),
    // Pass through any caller-provided headers
    ...((init?.headers as Record<string, string>) ?? {}),
  };

  // Only declare JSON when a request body actually exists.
  // Fastify rejects DELETE requests that send Content-Type: application/json
  // with an empty body.
  if (init?.body != null && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, { ...init, headers });

  // Persist session ID returned in the response header when it is exposed.
  const returnedSessionId = res.headers.get("X-Session-Id");
  if (returnedSessionId) {
    setCartSessionId(returnedSessionId);
  }

  if (!res.ok) {
    if (res.status === 404) {
      throw new ApiNotFoundError(`Not found: ${path}`);
    }
    throw new ApiRequestError(res.status, `Cart API error ${res.status} for ${path}`);
  }

  const data = (await res.json()) as T;

  // The backend also returns sessionId in the JSON body for guest carts.
  // Persist it as a fallback because browsers may hide custom response headers
  // unless CORS explicitly exposes them.
  const bodySessionId = (data as { sessionId?: unknown }).sessionId;
  if (typeof bodySessionId === "string" && bodySessionId.trim()) {
    setCartSessionId(bodySessionId);
  }

  return data;
}

/** GET /carts — retrieve or create the active cart */
export async function getCart(): Promise<ApiCart> {
  return cartFetch<ApiCart>("/carts");
}

/** POST /carts/items — add an item to the cart (or increment quantity if same line) */
export async function addToCart(payload: {
  productId: string;
  variantId?: string | null;
  quantity?: number;
  personalization?: Record<string, unknown>;
}): Promise<ApiCart> {
  return cartFetch<ApiCart>("/carts/items", {
    method: "POST",
    body: JSON.stringify({
      productId: payload.productId,
      ...(payload.variantId != null ? { variantId: payload.variantId } : {}),
      quantity: payload.quantity ?? 1,
      ...(payload.personalization != null ? { personalization: payload.personalization } : {}),
    }),
  });
}

/** PUT /carts/items/:itemId — update quantity (0 = remove) */
export async function updateCartItem(
  itemId: string,
  quantity: number,
): Promise<ApiCart> {
  return cartFetch<ApiCart>(`/carts/items/${encodeURIComponent(itemId)}`, {
    method: "PUT",
    body: JSON.stringify({ quantity }),
  });
}

/** DELETE /carts/items/:itemId — remove a single item */
export async function removeCartItem(itemId: string): Promise<ApiCart> {
  return cartFetch<ApiCart>(`/carts/items/${encodeURIComponent(itemId)}`, {
    method: "DELETE",
  });
}

/** DELETE /carts — clear all items from the cart */
export async function clearCart(): Promise<ApiCart> {
  return cartFetch<ApiCart>("/carts", { method: "DELETE" });
}

// ---------------------------------------------------------------------------
// Checkout types — match backend responses
// ---------------------------------------------------------------------------

export interface ApiWilaya {
  code: number;
  name: string;
  available: boolean;
}

export interface ApiDeliveryRate {
  amountCents: number;
  currency: string;
  estimate: string | null;
}

export interface ApiPromoPreview {
  promotionId: string;
  code: string;
  discountCents: number;
}

export interface ApiOrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string | null;
  productName: string;
  productSlug: string;
  productImageUrl: string | null;
  variantName: string | null;
  variantSku: string | null;
  colorName: string | null;
  colorHex: string | null;
  quantity: number;
  unitPriceCents: number;
  totalPriceCents: number;
  personalization: Record<string, unknown> | null;
  createdAt: string;
}

export interface ApiOrder {
  id: string;
  reference: string;
  userId: string | null;
  status: string;
  subtotalCents: number;
  deliveryFeeCents: number;
  discountCents: number;
  totalCents: number;
  currency: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  addressLine1: string;
  addressLine2: string | null;
  wilayaCode: number;
  wilayaName: string;
  commune: string;
  deliveryType: string;
  notes: string | null;
  promoCode: string | null;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  /** Only present for guest orders — stored in sessionStorage for future lookup */
  guestAccessToken?: string;
  items?: ApiOrderItem[];
}

export interface CreateOrderInput {
  items: Array<{
    productId: string;
    variantId?: string | null;
    quantity: number;
    personalization?: Record<string, unknown>;
  }>;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  wilayaCode: number;
  commune: string;
  deliveryType: "home" | "office";
  notes?: string;
  promoCode?: string;
}

// ---------------------------------------------------------------------------
// Checkout API client — delivery, promotions, orders
// ---------------------------------------------------------------------------

/** GET /delivery/wilayas — list all wilayas with availability */
export async function getWilayas(): Promise<ApiWilaya[]> {
  return apiFetch<ApiWilaya[]>("/delivery/wilayas");
}

/** GET /delivery/rate?wilayaCode=N&deliveryType=home — get delivery fee */
export async function getDeliveryRate(
  wilayaCode: number,
  deliveryType: "home" | "office" = "home",
): Promise<ApiDeliveryRate> {
  return apiFetch<ApiDeliveryRate>(
    `/delivery/rate?wilayaCode=${wilayaCode}&deliveryType=${deliveryType}`,
  );
}

/** POST /promotions/preview — preview discount without consuming usage */
export async function previewPromo(
  code: string,
  subtotalCents: number,
): Promise<ApiPromoPreview> {
  return apiFetch<ApiPromoPreview>("/promotions/preview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, subtotalCents }),
  });
}

// ---------------------------------------------------------------------------
// Guest order access token — sessionStorage (browser-only)
// ---------------------------------------------------------------------------

const ORDER_TOKEN_PREFIX = "michket_order_access_";

/** Save guest access token for a given order reference */
export function setGuestOrderAccessToken(
  reference: string,
  token: string,
): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(`${ORDER_TOKEN_PREFIX}${reference}`, token);
}

/** Retrieve guest access token for a given order reference (or null) */
export function getGuestOrderAccessToken(
  reference: string,
): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(`${ORDER_TOKEN_PREFIX}${reference}`);
}

// ---------------------------------------------------------------------------
// Order API — create, fetch by reference
// ---------------------------------------------------------------------------

/**
 * POST /orders — create a new order (guest or authenticated).
 *
 * @param idempotencyKey — UUID v4 generated ONCE per checkout attempt by the
 *   caller. Retries of the same attempt MUST reuse the same key. Must be
 *   non-empty, 16–128 characters.
 */
export async function createOrder(
  input: CreateOrderInput,
  idempotencyKey: string,
): Promise<ApiOrder> {
  if (!idempotencyKey || idempotencyKey.length < 16 || idempotencyKey.length > 128) {
    throw new Error("idempotencyKey must be 16–128 characters");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Idempotency-Key": idempotencyKey,
  };

  // Attach session ID for guest identification
  const sessionId = getCartSessionId();
  if (sessionId) {
    headers["X-Session-Id"] = sessionId;
  }

  // Attach JWT if available
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("michket_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const order = await apiFetch<ApiOrder>("/orders", {
    method: "POST",
    headers,
    body: JSON.stringify(input),
  });

  // Auto-persist guest access token for future order lookup
  if (order.guestAccessToken) {
    setGuestOrderAccessToken(order.reference, order.guestAccessToken);
  }

  return order;
}

/** GET /orders/:reference — fetch order detail (guest or authenticated) */
export async function getOrderByReference(
  reference: string,
): Promise<ApiOrder> {
  const headers: Record<string, string> = {};

  // Guest: use stored access token for this order
  const guestToken = getGuestOrderAccessToken(reference);
  if (guestToken) {
    headers["X-Order-Access-Token"] = guestToken;
  }

  // Authenticated: use JWT
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("michket_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return apiFetch<ApiOrder>(`/orders/${reference}`, { headers });
}
