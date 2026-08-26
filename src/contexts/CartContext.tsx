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

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export interface CartItem {
  id: string;
  slug: string;
  title: string;
  price: number;
  image: string;
  quantity: number;

  /**
   * Optional for backward compatibility with existing addItem calls.
   * Michket can later pass "DZD" explicitly from the product layer.
   */
  currency?: string;
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

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  total: number;
  hydrated: boolean;
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

const STORAGE_KEY = "michket-cart";
const MAX_QUANTITY = 99;

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function clampQuantity(quantity: number) {
  if (!Number.isFinite(quantity)) return 1;
  return Math.max(1, Math.min(MAX_QUANTITY, Math.floor(quantity)));
}

function isValidStoredItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;

  const item = value as Partial<CartItem>;

  return (
    typeof item.id === "string" &&
    typeof item.slug === "string" &&
    typeof item.title === "string" &&
    typeof item.price === "number" &&
    Number.isFinite(item.price) &&
    item.price >= 0 &&
    typeof item.image === "string" &&
    typeof item.quantity === "number" &&
    Number.isFinite(item.quantity) &&
    item.quantity > 0
  );
}

function sanitizeStoredItems(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(isValidStoredItem)
    .map((item) => ({
      ...item,
      quantity: clampQuantity(item.quantity),
    }));
}

/* ------------------------------------------------------------------ */
/* Reducer                                                            */
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

  /*
   * IMPORTANT FIX:
   *
   * The previous implementation had two mount effects:
   * 1) load localStorage
   * 2) immediately save state.items
   *
   * On the first render state.items is [].
   * That second effect could overwrite the saved cart with [] BEFORE
   * hydration had completed.
   *
   * We now persist ONLY after hydration is complete.
   */
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        const items = sanitizeStoredItems(parsed);

        dispatch({
          type: "HYDRATE",
          items,
        });
      }
    } catch {
      // Corrupt or unavailable storage: start with a clean cart.
      dispatch({
        type: "HYDRATE",
        items: [],
      });
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(state.items),
      );
    } catch {
      // Storage may be unavailable/private/full.
      // Cart still works for the current React session.
    }
  }, [hydrated, state.items]);

  const addItem = useCallback(
    (
      item: Omit<CartItem, "quantity">,
      quantity = 1,
    ) => {
      dispatch({
        type: "ADD",
        item,
        quantity,
      });
    },
    [],
  );

  const removeItem = useCallback((id: string) => {
    dispatch({
      type: "REMOVE",
      id,
    });
  }, []);

  const updateQuantity = useCallback(
    (id: string, quantity: number) => {
      dispatch({
        type: "UPDATE_QUANTITY",
        id,
        quantity,
      });
    },
    [],
  );

  const clearCart = useCallback(() => {
    dispatch({
      type: "CLEAR",
    });
  }, []);

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
