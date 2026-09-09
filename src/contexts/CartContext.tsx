"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";

import {
  getCart as apiGetCart,
  addToCart as apiAddToCart,
  updateCartItem as apiUpdateCartItem,
  removeCartItem as apiRemoveCartItem,
  clearCart as apiClearCart,
  type ApiCartItem,
} from "@/lib/api";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export interface CartItem {
  id: string;
  /** Product UUID from products table — sent to POST /orders */
  productId: string;
  slug: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  currency?: string;
  /** Backend variant UUID — sent to POST /carts/items */
  variantId?: string;
  /** Denormalized color name from backend (e.g. "Rose") */
  selectedColorName?: string;
  /** Denormalized color hex from backend (e.g. "#F4A6B8") */
  selectedColorHex?: string;
  /** Arbitrary personalization payload — sent to POST /carts/items */
  personalization?: Record<string, unknown>;
}

interface CartState {
  items: CartItem[];
}

type CartAction =
  | {
      type: "ADD";
      item: Omit<CartItem, "quantity">;
      quantity?: number;
    }
  | { type: "REMOVE"; id: string }
  | { type: "UPDATE_QUANTITY"; id: string; quantity: number }
  | { type: "CLEAR" }
  | { type: "HYDRATE"; items: CartItem[] };

export interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  total: number;
  hydrated: boolean;
  loading: boolean;
  error: string | null;
  addItem: (
    item: Omit<CartItem, "quantity">,
    quantity?: number,
  ) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

const MAX_QUANTITY = 99;

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function clampQuantity(quantity: number) {
  if (!Number.isFinite(quantity)) return 1;
  return Math.max(1, Math.min(MAX_QUANTITY, Math.floor(quantity)));
}

/** Convert a backend cart item to the frontend CartItem shape. */
function mapCartItem(api: ApiCartItem): CartItem {
  return {
    id: api.id,
    productId: api.product.id,
    slug: api.product.slug,
    title: api.product.name,
    price: api.unitPriceCents / 100,
    image: "", // Images not included in GET /carts — components must resolve separately
    quantity: api.quantity,
    variantId: api.variant?.id ?? undefined,
    selectedColorName: api.selectedColorName ?? api.variant?.colorName ?? undefined,
    selectedColorHex: api.selectedColorHex ?? api.variant?.colorHex ?? undefined,
    personalization: api.personalization ?? undefined,
  };
}

/* ------------------------------------------------------------------ */
/* Reducer (local state only — backend is source of truth)            */
/* ------------------------------------------------------------------ */

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD": {
      const requestedQuantity = clampQuantity(action.quantity ?? 1);
      const existing = state.items.find(
        (item) => item.id === action.item.id,
      );

      if (existing) {
        return {
          items: state.items.map((item) =>
            item.id === action.item.id
              ? {
                  ...item,
                  quantity: Math.min(
                    MAX_QUANTITY,
                    item.quantity + requestedQuantity,
                  ),
                }
              : item,
          ),
        };
      }

      return {
        items: [
          ...state.items,
          {
            ...action.item,
            quantity: requestedQuantity,
          },
        ],
      };
    }

    case "REMOVE":
      return {
        items: state.items.filter((item) => item.id !== action.id),
      };

    case "UPDATE_QUANTITY": {
      if (!Number.isFinite(action.quantity)) return state;

      if (action.quantity <= 0) {
        return {
          items: state.items.filter((item) => item.id !== action.id),
        };
      }

      const nextQuantity = clampQuantity(action.quantity);

      return {
        items: state.items.map((item) =>
          item.id === action.id
            ? { ...item, quantity: nextQuantity }
            : item,
        ),
      };
    }

    case "CLEAR":
      return { items: [] };

    case "HYDRATE":
      return { items: action.items };

    default:
      return state;
  }
}

/* ------------------------------------------------------------------ */
/* Context                                                            */
/* ------------------------------------------------------------------ */

const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}

/* ------------------------------------------------------------------ */
/* Provider                                                           */
/* ------------------------------------------------------------------ */

export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ---------------------------------------------------------------- */
  /* Mount: fetch cart from backend                                   */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await apiGetCart();
        if (!cancelled) {
          dispatch({ type: "HYDRATE", items: res.items.map(mapCartItem) });
          setError(null);
        }
      } catch {
        if (!cancelled) {
          // Backend unreachable or error — start with empty cart
          dispatch({ type: "HYDRATE", items: [] });
          setError("Impossible de charger le panier");
        }
      } finally {
        if (!cancelled) setHydrated(true);
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  /* ---------------------------------------------------------------- */
  /* Cart mutations — each calls the backend, then updates local state */
  /* ---------------------------------------------------------------- */

  const addItem = useCallback(
    async (
      item: Omit<CartItem, "quantity">,
      quantity = 1,
    ) => {
      try {
        const res = await apiAddToCart({
          productId: item.id,
          variantId: item.variantId ?? undefined,
          quantity,
          personalization: item.personalization ?? undefined,
        });
        dispatch({ type: "HYDRATE", items: res.items.map(mapCartItem) });
        setError(null);
      } catch {
        setError("Erreur lors de l'ajout au panier");
      }
    },
    [],
  );

  const removeItem = useCallback(async (id: string) => {
    try {
      const res = await apiRemoveCartItem(id);
      dispatch({ type: "HYDRATE", items: res.items.map(mapCartItem) });
      setError(null);
    } catch {
      setError("Erreur lors de la suppression");
    }
  }, []);

  const updateQuantity = useCallback(
    async (id: string, quantity: number) => {
      try {
        const res = await apiUpdateCartItem(id, quantity);
        dispatch({ type: "HYDRATE", items: res.items.map(mapCartItem) });
        setError(null);
      } catch {
        setError("Erreur lors de la mise à jour");
      }
    },
    [],
  );

  const clearCart = useCallback(async () => {
    try {
      const res = await apiClearCart();
      dispatch({ type: "HYDRATE", items: res.items.map(mapCartItem) });
      setError(null);
    } catch {
      setError("Erreur lors du vidage du panier");
    }
  }, []);

  /* ---------------------------------------------------------------- */
  /* Derived values                                                    */
  /* ---------------------------------------------------------------- */

  const itemCount = useMemo(
    () =>
      state.items.reduce(
        (sum, item) => sum + item.quantity,
        0,
      ),
    [state.items],
  );

  const total = useMemo(
    () =>
      state.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      ),
    [state.items],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items: state.items,
      itemCount,
      total,
      hydrated,
      loading,
      error,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }),
    [
      state.items,
      itemCount,
      total,
      hydrated,
      loading,
      error,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    ],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
