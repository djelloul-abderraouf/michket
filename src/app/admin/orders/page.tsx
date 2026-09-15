"use client";

/* eslint-disable @next/next/no-img-element */

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { PageHeader } from "@/components/admin/PageHeader";
import { createClient } from "@/lib/supabase/client";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

type OrderItemRow = {
  id: string;
  orderId: string;
  productId: string | null;
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
};

type OrderRow = {
  id: string;
  reference: string;
  userId: string | null;
  status: OrderStatus;

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
  deliveryType: "home" | "office";
  deliveryOfficeId?: string | null;
  deliveryOfficeName?: string | null;

  notes: string | null;
  promoCode: string | null;

  paymentMethod: string;
  paymentStatus: string;

  createdAt: string;
  updatedAt: string;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  paidAt?: string | null;
  cancelledAt?: string | null;
  cancelReason?: string | null;

  items: OrderItemRow[];
};

type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type OrdersResponse = {
  data: OrderRow[];
  meta: PaginationMeta;
};

type AdminRequest = (
  path: string,
  init?: RequestInit,
) => Promise<Response | null>;

type ApiWilaya = {
  code: number;
  name: string;
  available: boolean;
  homeAvailable: boolean;
  officeAvailable: boolean;
};

type ApiCommune = {
  id: number;
  name: string;
  wilayaCode: number;
  available: boolean;
  hasStopDesk: boolean;
};

type AdminProductListItem = {
  id: string;
  name: string;
  priceCents: number;
  isActive: boolean;
};

type AdminProductsResponse = {
  data: AdminProductListItem[];
  meta: PaginationMeta;
};

type AdminProductVariant = {
  id: string;
  name: string;
  colorName: string | null;
  colorHex: string | null;
  priceCents: number | null;
  isActive: boolean;
};

type AdminProductDetail = {
  id: string;
  name: string;
  priceCents: number;
  isActive: boolean;
  variants: AdminProductVariant[];
};

type OrderEditForm = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;

  addressLine1: string;
  addressLine2: string;
  wilayaCode: string;
  deliveryType: "home" | "office";
  deliveryOfficeId: string;
  deliveryOfficeName: string;

  notes: string;
  promoCode: string;

  paymentMethod: string;
  paymentStatus: string;

  deliveryFeeDa: string;
  discountDa: string;
};

type StatusFilter = "all" | OrderStatus;

const STATUS_OPTIONS: Array<{
  value: StatusFilter;
  label: string;
}> = [
  { value: "all", label: "Toutes" },
  { value: "pending", label: "En attente" },
  { value: "confirmed", label: "Confirmées" },
  { value: "processing", label: "En préparation" },
  { value: "shipped", label: "Expédiées" },
  { value: "delivered", label: "Livrées" },
  { value: "cancelled", label: "Annulées" },
  { value: "refunded", label: "Remboursées" },
];

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  processing: "En préparation",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
  refunded: "Remboursée",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  paid: "Payé",
  refunded: "Remboursé",
  failed: "Échoué",
};

const priceFormatter = new Intl.NumberFormat("fr-DZ", {
  style: "currency",
  currency: "DZD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatPrice(priceCents: number) {
  return priceFormatter.format(priceCents / 100);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return dateFormatter.format(date);
}

function getStatusClasses(status: OrderStatus) {
  switch (status) {
    case "pending":
      return "bg-amber-50 text-amber-700";
    case "confirmed":
      return "bg-sky-50 text-sky-700";
    case "processing":
      return "bg-violet-50 text-violet-700";
    case "shipped":
      return "bg-indigo-50 text-indigo-700";
    case "delivered":
      return "bg-emerald-50 text-emerald-700";
    case "cancelled":
      return "bg-red-50 text-red-700";
    case "refunded":
      return "bg-neutral-100 text-neutral-600";
  }
}

function getStatusDotClasses(status: OrderStatus) {
  switch (status) {
    case "pending":
      return "bg-amber-500";
    case "confirmed":
      return "bg-sky-500";
    case "processing":
      return "bg-violet-500";
    case "shipped":
      return "bg-indigo-500";
    case "delivered":
      return "bg-emerald-500";
    case "cancelled":
      return "bg-red-500";
    case "refunded":
      return "bg-neutral-500";
  }
}

function centsToDaInput(cents: number): string {
  return String(cents / 100);
}

function parseDaToCents(value: string): number | null {
  const normalized = value.trim().replace(",", ".");

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return Math.round(parsed * 100);
}

function orderToEditForm(order: OrderRow): OrderEditForm {
  return {
    firstName: order.firstName,
    lastName: order.lastName,
    phone: order.phone,
    email: order.email ?? "",

    addressLine1: order.addressLine1,
    addressLine2: order.addressLine2 ?? "",
    wilayaCode: String(order.wilayaCode),
    deliveryType: order.deliveryType,
    deliveryOfficeId: order.deliveryOfficeId ?? "",
    deliveryOfficeName: order.deliveryOfficeName ?? "",

    notes: order.notes ?? "",
    promoCode: order.promoCode ?? "",

    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,

    deliveryFeeDa: centsToDaInput(order.deliveryFeeCents),
    discountDa: centsToDaInput(order.discountCents),
  };
}

async function readApiError(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const body = (await response.json()) as {
      message?: string | string[];
      error?: string;
    };

    if (Array.isArray(body.message)) {
      return body.message.join(" · ");
    }

    if (typeof body.message === "string") {
      return body.message;
    }

    if (typeof body.error === "string") {
      return body.error;
    }
  } catch {
    // Keep fallback.
  }

  return fallback;
}

function safeJsonObject(
  raw: string,
): Record<string, unknown> | null {
  const value = raw.trim();

  if (!value) {
    return null;
  }

  const parsed = JSON.parse(value) as unknown;

  if (
    parsed === null ||
    Array.isArray(parsed) ||
    typeof parsed !== "object"
  ) {
    throw new Error(
      "La personnalisation doit être un objet JSON.",
    );
  }

  return parsed as Record<string, unknown>;
}

function personalizationEntries(
  personalization: Record<string, unknown> | null,
): Array<[string, string]> {
  if (!personalization) return [];

  return Object.entries(personalization).map(([key, value]) => {
    if (value == null) {
      return [key, "—"];
    }

    if (typeof value === "string") {
      return [key, value];
    }

    if (
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      return [key, String(value)];
    }

    try {
      return [key, JSON.stringify(value)];
    } catch {
      return [key, String(value)];
    }
  });
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");
  const [expandedOrderId, setExpandedOrderId] =
    useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<
    string | null
  >(null);
  const [updatingOrderId, setUpdatingOrderId] =
    useState<string | null>(null);

  const getAdminSession = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      router.replace("/admin/login");
      return null;
    }

    return session;
  }, [router, supabase]);

  const adminRequest = useCallback<AdminRequest>(
    async (path, init) => {
      const session = await getAdminSession();

      if (!session) {
        return null;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        throw new Error(
          "NEXT_PUBLIC_API_URL n’est pas configurée.",
        );
      }

      const headers = new Headers(init?.headers);

      headers.set(
        "Authorization",
        `Bearer ${session.access_token}`,
      );

      if (init?.body != null && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }

      const response = await fetch(`${apiUrl}${path}`, {
        ...init,
        headers,
        cache: "no-store",
      });

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        await supabase.auth.signOut();
        router.replace("/admin/login");
        return null;
      }

      return response;
    },
    [getAdminSession, router, supabase],
  );

  const handleOrderUpdated = useCallback(
    (updatedOrder: OrderRow) => {
      setOrders((current) =>
        current.map((order) =>
          order.id === updatedOrder.id
            ? updatedOrder
            : order,
        ),
      );
    },
    [],
  );

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const session = await getAdminSession();

      if (!session) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        setError(
          "NEXT_PUBLIC_API_URL n’est pas configurée.",
        );
        return;
      }

      const searchParams = new URLSearchParams({
        page: String(page),
        limit: "20",
      });

      if (statusFilter !== "all") {
        searchParams.set("status", statusFilter);
      }

      const response = await fetch(
        `${apiUrl}/admin/orders?${searchParams.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          cache: "no-store",
        },
      );

      if (response.status === 401 || response.status === 403) {
        await supabase.auth.signOut();
        router.replace("/admin/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Impossible de charger les commandes.",
        );
      }

      const payload =
        (await response.json()) as OrdersResponse;

      setOrders(payload.data);
      setMeta(payload.meta);
    } catch {
      setError(
        "Une erreur est survenue pendant le chargement des commandes.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [getAdminSession, page, router, statusFilter, supabase]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const visibleOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return orders;
    }

    return orders.filter((order) => {
      const customerName =
        `${order.firstName} ${order.lastName}`.toLowerCase();

      return (
        order.reference
          .toLowerCase()
          .includes(normalizedQuery) ||
        customerName.includes(normalizedQuery) ||
        order.phone.toLowerCase().includes(normalizedQuery) ||
        order.wilayaName
          .toLowerCase()
          .includes(normalizedQuery) ||
        order.commune
          .toLowerCase()
          .includes(normalizedQuery) ||
        order.items.some((item) =>
          item.productName
            .toLowerCase()
            .includes(normalizedQuery),
        )
      );
    });
  }, [orders, query]);

  const updateOrderStatus = useCallback(
    async (order: OrderRow, status: OrderStatus) => {
      if (status === order.status) return;

      setUpdatingOrderId(order.id);
      setActionError(null);

      try {
        const session = await getAdminSession();

        if (!session) return;

        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        if (!apiUrl) {
          setActionError(
            "NEXT_PUBLIC_API_URL n’est pas configurée.",
          );
          return;
        }

        const response = await fetch(
          `${apiUrl}/admin/orders/${encodeURIComponent(
            order.id,
          )}/status`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ status }),
          },
        );

        if (
          response.status === 401 ||
          response.status === 403
        ) {
          await supabase.auth.signOut();
          router.replace("/admin/login");
          return;
        }

        if (!response.ok) {
          let message =
            "Impossible de modifier le statut de la commande.";

          try {
            const body = (await response.json()) as {
              message?: string | string[];
            };

            if (Array.isArray(body.message)) {
              message = body.message.join(" · ");
            } else if (typeof body.message === "string") {
              message = body.message;
            }
          } catch {
            // Keep fallback message.
          }

          throw new Error(message);
        }

        const updated = (await response.json()) as OrderRow;

        setOrders((current) =>
          current.map((existing) =>
            existing.id === order.id
              ? {
                  ...existing,
                  ...updated,
                  items: existing.items,
                }
              : existing,
          ),
        );
      } catch (caughtError) {
        setActionError(
          caughtError instanceof Error
            ? caughtError.message
            : "Impossible de modifier le statut de la commande.",
        );
      } finally {
        setUpdatingOrderId(null);
      }
    },
    [getAdminSession, router, supabase],
  );

  return (
    <div>
      <PageHeader
        title="Commandes"
        description="Consultez les commandes clients, leurs produits, la livraison, le paiement et le statut."
      />

      <section className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white shadow-[0_8px_30px_rgba(23,23,20,0.035)]">
        <div className="border-b border-black/[0.06] p-4 sm:p-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full max-w-md">
              <svg
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <circle cx="7" cy="7" r="4.5" />
                <path d="m10.5 10.5 3 3" />
              </svg>

              <input
                type="search"
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                placeholder="Référence, client, téléphone, produit…"
                className="h-11 w-full rounded-xl border border-black/[0.08] bg-[#faf9f6] pl-10 pr-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-950/5"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {STATUS_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatusFilter(value)}
                  className={[
                    "min-h-10 rounded-xl px-3.5 text-xs font-semibold transition",
                    statusFilter === value
                      ? "bg-neutral-950 text-white"
                      : "border border-black/[0.07] bg-white text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-black/[0.05] pt-4">
            <p className="text-xs text-neutral-400">
              {isLoading
                ? "Chargement des commandes…"
                : `${meta.total} commande${
                    meta.total > 1 ? "s" : ""
                  } au total`}
            </p>

            {!isLoading ? (
              <p className="text-xs text-neutral-400">
                {visibleOrders.length} affichée
                {visibleOrders.length > 1 ? "s" : ""} sur
                cette page
              </p>
            ) : null}
          </div>

          {actionError ? (
            <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {actionError}
            </div>
          ) : null}
        </div>

        {isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="admin-skeleton h-[88px] w-full"
              />
            ))}
          </div>
        ) : error ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-red-700">
              <svg
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="10" cy="10" r="7.5" />
                <path d="M10 6.5v4" />
                <path d="M10 13.5h.01" />
              </svg>
            </div>

            <h2 className="mt-4 text-base font-semibold text-neutral-950">
              Chargement impossible
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
              {error}
            </p>

            <button
              type="button"
              onClick={() => void loadOrders()}
              className="mt-5 inline-flex min-h-10 items-center justify-center rounded-xl border border-black/[0.08] bg-white px-4 text-sm font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-50"
            >
              Réessayer
            </button>
          </div>
        ) : visibleOrders.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#f1efe9] text-neutral-600">
              <svg
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 3.5h10a1.5 1.5 0 0 1 1.5 1.5v12l-3-2-3 2-3-2-3 2V5A1.5 1.5 0 0 1 5 3.5Z" />
                <path d="M7 7h6" />
                <path d="M7 10h4" />
              </svg>
            </div>

            <h2 className="mt-4 text-base font-semibold text-neutral-950">
              Aucune commande
            </h2>
            <p className="mt-2 text-sm text-neutral-500">
              Aucune commande ne correspond aux filtres
              sélectionnés.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1060px] border-collapse">
                  <thead>
                    <tr className="border-b border-black/[0.06] bg-[#faf9f6] text-left">
                      <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                        Commande
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                        Client
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                        Livraison
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                        Articles
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                        Total
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                        Statut
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                        Date
                      </th>
                      <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                        Détails
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {visibleOrders.map((order) => {
                      const isExpanded =
                        expandedOrderId === order.id;

                      return (
                        <>
                          <tr
                            key={order.id}
                            className="border-b border-black/[0.05] align-top hover:bg-[#fcfbf8]"
                          >
                            <td className="px-5 py-4">
                              <p className="text-sm font-semibold text-neutral-950">
                                {order.reference}
                              </p>
                              <p className="mt-1 text-xs text-neutral-400">
                                {order.paymentMethod === "cod"
                                  ? "Paiement à la livraison"
                                  : order.paymentMethod}
                              </p>
                            </td>

                            <td className="px-4 py-4">
                              <p className="text-sm font-semibold text-neutral-900">
                                {order.firstName} {order.lastName}
                              </p>
                              <a
                                href={`tel:${order.phone}`}
                                className="mt-1 inline-block text-xs text-neutral-500 transition hover:text-neutral-900"
                              >
                                {order.phone}
                              </a>
                            </td>

                            <td className="px-4 py-4">
                              <p className="text-sm text-neutral-700">
                                {order.wilayaName}
                              </p>
                              <p className="mt-1 text-xs text-neutral-400">
                                {order.commune} ·{" "}
                                {order.deliveryType === "office"
                                  ? "Bureau Yalidine"
                                  : "Domicile"}
                              </p>
                            </td>

                            <td className="px-4 py-4">
                              <p className="text-sm font-semibold text-neutral-900">
                                {order.items.reduce(
                                  (sum, item) =>
                                    sum + item.quantity,
                                  0,
                                )}
                              </p>
                              <p className="mt-1 text-xs text-neutral-400">
                                {order.items.length} ligne
                                {order.items.length > 1
                                  ? "s"
                                  : ""}
                              </p>
                            </td>

                            <td className="px-4 py-4">
                              <p className="text-sm font-semibold text-neutral-950">
                                {formatPrice(order.totalCents)}
                              </p>
                              <p className="mt-1 text-xs text-neutral-400">
                                Livraison{" "}
                                {formatPrice(
                                  order.deliveryFeeCents,
                                )}
                              </p>
                            </td>

                            <td className="px-4 py-4">
                              <span
                                className={[
                                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                                  getStatusClasses(
                                    order.status,
                                  ),
                                ].join(" ")}
                              >
                                <span
                                  className={[
                                    "h-1.5 w-1.5 rounded-full",
                                    getStatusDotClasses(
                                      order.status,
                                    ),
                                  ].join(" ")}
                                  aria-hidden="true"
                                />
                                {
                                  ORDER_STATUS_LABELS[
                                    order.status
                                  ]
                                }
                              </span>
                            </td>

                            <td className="px-4 py-4 text-sm text-neutral-500">
                              {formatDate(order.createdAt)}
                            </td>

                            <td className="px-4 py-4 text-right">
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedOrderId(
                                    isExpanded
                                      ? null
                                      : order.id,
                                  )
                                }
                                className="inline-flex min-h-9 items-center justify-center rounded-lg border border-black/[0.08] bg-white px-3 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50"
                              >
                                {isExpanded
                                  ? "Fermer"
                                  : "Voir"}
                              </button>
                            </td>
                          </tr>

                          {isExpanded ? (
                            <tr
                              key={`${order.id}-details`}
                              className="border-b border-black/[0.06] bg-[#faf9f6]"
                            >
                              <td
                                colSpan={8}
                                className="px-5 py-5"
                              >
                                <OrderDetails
                                  order={order}
                                  updating={
                                    updatingOrderId === order.id
                                  }
                                  onStatusChange={(status) =>
                                    void updateOrderStatus(
                                      order,
                                      status,
                                    )
                                  }
                                  request={adminRequest}
                                  onOrderUpdated={
                                    handleOrderUpdated
                                  }
                                />
                              </td>
                            </tr>
                          ) : null}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile */}
            <div className="divide-y divide-black/[0.06] md:hidden">
              {visibleOrders.map((order) => {
                const isExpanded =
                  expandedOrderId === order.id;

                return (
                  <article
                    key={order.id}
                    className="p-4"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedOrderId(
                          isExpanded ? null : order.id,
                        )
                      }
                      className="w-full text-left"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-neutral-950">
                            {order.reference}
                          </p>
                          <p className="mt-1 text-sm text-neutral-700">
                            {order.firstName} {order.lastName}
                          </p>
                          <p className="mt-1 text-xs text-neutral-400">
                            {order.phone}
                          </p>
                        </div>

                        <span
                          className={[
                            "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold",
                            getStatusClasses(order.status),
                          ].join(" ")}
                        >
                          {
                            ORDER_STATUS_LABELS[
                              order.status
                            ]
                          }
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-[#faf9f6] p-3">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-neutral-400">
                            Livraison
                          </p>
                          <p className="mt-1 text-xs font-medium text-neutral-700">
                            {order.commune},{" "}
                            {order.wilayaName}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-neutral-400">
                            Total
                          </p>
                          <p className="mt-1 text-sm font-semibold text-neutral-950">
                            {formatPrice(order.totalCents)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs text-neutral-400">
                        <span>
                          {order.items.reduce(
                            (sum, item) =>
                              sum + item.quantity,
                            0,
                          )}{" "}
                          article
                          {order.items.reduce(
                            (sum, item) =>
                              sum + item.quantity,
                            0,
                          ) > 1
                            ? "s"
                            : ""}
                        </span>
                        <span>
                          {formatDate(order.createdAt)}
                        </span>
                      </div>
                    </button>

                    {isExpanded ? (
                      <div className="mt-4 border-t border-black/[0.06] pt-4">
                        <OrderDetails
                          order={order}
                          updating={
                            updatingOrderId === order.id
                          }
                          onStatusChange={(status) =>
                            void updateOrderStatus(
                              order,
                              status,
                            )
                          }
                          request={adminRequest}
                          onOrderUpdated={
                            handleOrderUpdated
                          }
                        />
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </>
        )}

        {!isLoading && !error && meta.totalPages > 1 ? (
          <div className="flex items-center justify-between gap-3 border-t border-black/[0.06] bg-[#faf9f6] px-4 py-3 sm:px-5">
            <button
              type="button"
              onClick={() =>
                setPage((current) =>
                  Math.max(1, current - 1),
                )
              }
              disabled={page <= 1}
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-black/[0.08] bg-white px-3.5 text-xs font-semibold text-neutral-600 shadow-sm transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Précédent
            </button>

            <p className="text-xs font-medium text-neutral-500">
              Page {meta.page} sur {meta.totalPages}
            </p>

            <button
              type="button"
              onClick={() =>
                setPage((current) =>
                  Math.min(
                    meta.totalPages,
                    current + 1,
                  ),
                )
              }
              disabled={page >= meta.totalPages}
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-black/[0.08] bg-white px-3.5 text-xs font-semibold text-neutral-600 shadow-sm transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Suivant
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function OrderDetails({
  order,
  updating,
  onStatusChange,
  request,
  onOrderUpdated,
}: {
  order: OrderRow;
  updating: boolean;
  onStatusChange: (status: OrderStatus) => void;
  request: AdminRequest;
  onOrderUpdated: (order: OrderRow) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-2xl border border-black/[0.07] bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
            Gestion de la commande
          </p>
          <p className="mt-1 text-sm font-semibold text-neutral-950">
            {order.reference}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsEditing((current) => !current)}
          className={[
            "inline-flex min-h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold transition",
            isEditing
              ? "border border-black/[0.08] bg-white text-neutral-700 hover:bg-neutral-50"
              : "bg-neutral-950 text-white hover:bg-neutral-800",
          ].join(" ")}
        >
          {isEditing
            ? "Fermer l’éditeur"
            : "Modifier la commande"}
        </button>
      </div>

      {isEditing ? (
        <OrderEditor
          order={order}
          request={request}
          onSaved={onOrderUpdated}
        />
      ) : null}
      <div className="grid gap-4 lg:grid-cols-3">
        <DetailCard title="Client">
          <DetailRow
            label="Nom"
            value={`${order.firstName} ${order.lastName}`}
          />
          <DetailRow label="Téléphone" value={order.phone} />
          {order.email ? (
            <DetailRow label="Email" value={order.email} />
          ) : null}
          <DetailRow
            label="Compte client"
            value={
              order.userId
                ? "Client connecté"
                : "Commande invitée"
            }
          />
        </DetailCard>

        <DetailCard title="Livraison">
          <DetailRow
            label="Type"
            value={
              order.deliveryType === "office"
                ? "Bureau Yalidine"
                : "Domicile"
            }
          />
          <DetailRow
            label="Wilaya"
            value={`${order.wilayaName} (${order.wilayaCode})`}
          />
          <DetailRow
            label="Commune"
            value={order.commune}
          />
          <DetailRow
            label="Adresse"
            value={order.addressLine1 || "—"}
          />
          {order.addressLine2 ? (
            <DetailRow
              label="Complément"
              value={order.addressLine2}
            />
          ) : null}
          {order.deliveryOfficeName ? (
            <DetailRow
              label="Bureau"
              value={order.deliveryOfficeName}
            />
          ) : null}
          {order.deliveryOfficeId ? (
            <DetailRow
              label="ID bureau"
              value={order.deliveryOfficeId}
            />
          ) : null}
        </DetailCard>

        <DetailCard title="Commande">
          <DetailRow
            label="Référence"
            value={order.reference}
          />
          <DetailRow
            label="Créée le"
            value={formatDate(order.createdAt)}
          />
          <DetailRow
            label="Paiement"
            value={
              order.paymentMethod === "cod"
                ? "À la livraison"
                : order.paymentMethod
            }
          />
          <DetailRow
            label="Statut paiement"
            value={
              PAYMENT_STATUS_LABELS[
                order.paymentStatus
              ] ?? order.paymentStatus
            }
          />
        </DetailCard>
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white">
        <div className="border-b border-black/[0.06] px-4 py-3 sm:px-5">
          <h3 className="text-sm font-semibold text-neutral-950">
            Produits commandés
          </h3>
        </div>

        <div className="divide-y divide-black/[0.06]">
          {order.items.map((item) => {
            const personalization =
              personalizationEntries(
                item.personalization,
              );

            return (
              <div
                key={item.id}
                className="p-4 sm:p-5"
              >
                <div className="flex gap-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-black/[0.06] bg-[#f3f1ec]">
                    {item.productImageUrl ? (
                      <img
                        src={item.productImageUrl}
                        alt={item.productName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-xs font-semibold text-neutral-400">
                        M
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-neutral-950">
                          {item.productName}
                        </p>

                        {item.variantName ? (
                          <p className="mt-1 text-xs text-neutral-500">
                            Variante : {item.variantName}
                          </p>
                        ) : null}

                        {item.colorName ? (
                          <div className="mt-1 flex items-center gap-1.5 text-xs text-neutral-500">
                            {item.colorHex ? (
                              <span
                                className="h-3 w-3 rounded-full border border-black/10"
                                style={{
                                  backgroundColor:
                                    item.colorHex,
                                }}
                                aria-hidden="true"
                              />
                            ) : null}
                            Couleur : {item.colorName}
                          </div>
                        ) : null}

                        {item.variantSku ? (
                          <p className="mt-1 text-xs text-neutral-400">
                            SKU : {item.variantSku}
                          </p>
                        ) : null}
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="text-sm font-semibold text-neutral-950">
                          {formatPrice(
                            item.totalPriceCents,
                          )}
                        </p>
                        <p className="mt-1 text-xs text-neutral-400">
                          {item.quantity} ×{" "}
                          {formatPrice(
                            item.unitPriceCents,
                          )}
                        </p>
                      </div>
                    </div>

                    {personalization.length > 0 ? (
                      <div className="mt-3 rounded-xl bg-amber-50/70 p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-amber-700">
                          Personnalisation
                        </p>

                        <div className="mt-2 space-y-1.5">
                          {personalization.map(
                            ([key, value]) => (
                              <div
                                key={key}
                                className="grid gap-1 text-xs sm:grid-cols-[150px_1fr]"
                              >
                                <span className="font-medium text-amber-900/70">
                                  {key}
                                </span>
                                <span className="break-words text-amber-950">
                                  {value}
                                </span>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}

          {order.items.length === 0 ? (
            <div className="p-5 text-sm text-neutral-500">
              Aucun article n’a été retourné par l’API pour
              cette commande.
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {order.notes ? (
            <DetailCard title="Note client">
              <p className="text-sm leading-6 text-neutral-700">
                {order.notes}
              </p>
            </DetailCard>
          ) : null}

          {order.cancelReason ? (
            <DetailCard title="Motif d’annulation">
              <p className="text-sm leading-6 text-red-700">
                {order.cancelReason}
              </p>
            </DetailCard>
          ) : null}

          <DetailCard title="Suivi">
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailRow
                label="Mise à jour"
                value={formatDate(order.updatedAt)}
              />
              <DetailRow
                label="Expédiée"
                value={formatDate(order.shippedAt)}
              />
              <DetailRow
                label="Livrée"
                value={formatDate(order.deliveredAt)}
              />
              <DetailRow
                label="Payée"
                value={formatDate(order.paidAt)}
              />
            </div>
          </DetailCard>
        </div>

        <div className="space-y-4">
          <DetailCard title="Total">
            <DetailRow
              label="Sous-total"
              value={formatPrice(order.subtotalCents)}
            />
            <DetailRow
              label="Livraison"
              value={formatPrice(
                order.deliveryFeeCents,
              )}
            />
            {order.discountCents > 0 ? (
              <DetailRow
                label={
                  order.promoCode
                    ? `Réduction (${order.promoCode})`
                    : "Réduction"
                }
                value={`−${formatPrice(
                  order.discountCents,
                )}`}
              />
            ) : null}

            <div className="mt-3 flex items-center justify-between border-t border-black/[0.07] pt-3">
              <span className="text-sm font-semibold text-neutral-950">
                Total
              </span>
              <span className="text-base font-bold text-neutral-950">
                {formatPrice(order.totalCents)}
              </span>
            </div>
          </DetailCard>

          <DetailCard title="Modifier le statut">
            <label className="block text-xs font-medium text-neutral-500">
              Statut de la commande
            </label>

            <select
              value={order.status}
              disabled={updating}
              onChange={(event) =>
                onStatusChange(
                  event.target.value as OrderStatus,
                )
              }
              className="mt-2 h-11 w-full rounded-xl border border-black/[0.08] bg-white px-3 text-sm font-medium text-neutral-800 outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-950/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {STATUS_OPTIONS.filter(
                (
                  option,
                ): option is {
                  value: OrderStatus;
                  label: string;
                } => option.value !== "all",
              ).map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>

            {updating ? (
              <p className="mt-2 text-xs text-neutral-400">
                Mise à jour…
              </p>
            ) : (
              <p className="mt-2 text-xs leading-5 text-neutral-400">
                Le backend contrôle les transitions de statut
                autorisées.
              </p>
            )}
          </DetailCard>
        </div>
      </div>
    </div>
  );
}


function OrderEditor({
  order,
  request,
  onSaved,
}: {
  order: OrderRow;
  request: AdminRequest;
  onSaved: (order: OrderRow) => void;
}) {
  const [form, setForm] = useState<OrderEditForm>(
    () => orderToEditForm(order),
  );
  const [wilayas, setWilayas] = useState<ApiWilaya[]>([]);
  const [communes, setCommunes] = useState<ApiCommune[]>([]);
  const [communeId, setCommuneId] = useState("");
  const [products, setProducts] =
    useState<AdminProductListItem[]>([]);
  const [productCache, setProductCache] = useState<
    Record<string, AdminProductDetail>
  >({});

  const [isLoadingLookups, setIsLoadingLookups] =
    useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(
    null,
  );

  useEffect(() => {
    setForm(orderToEditForm(order));
  }, [order]);

  useEffect(() => {
    let cancelled = false;

    async function loadLookups() {
      setIsLoadingLookups(true);

      try {
        const [wilayasResponse, productsResponse] =
          await Promise.all([
            request("/delivery/wilayas", {
              method: "GET",
            }),
            request("/admin/products?page=1&limit=100", {
              method: "GET",
            }),
          ]);

        if (cancelled) return;

        if (
          !wilayasResponse ||
          !productsResponse
        ) {
          return;
        }

        if (!wilayasResponse.ok) {
          throw new Error(
            await readApiError(
              wilayasResponse,
              "Impossible de charger les wilayas.",
            ),
          );
        }

        if (!productsResponse.ok) {
          throw new Error(
            await readApiError(
              productsResponse,
              "Impossible de charger les produits.",
            ),
          );
        }

        const wilayasPayload =
          (await wilayasResponse.json()) as ApiWilaya[];

        const productsPayload =
          (await productsResponse.json()) as AdminProductsResponse;

        setWilayas(wilayasPayload);
        setProducts(productsPayload.data);
      } catch (caughtError) {
        if (!cancelled) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Impossible de charger les données de l’éditeur.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingLookups(false);
        }
      }
    }

    void loadLookups();

    return () => {
      cancelled = true;
    };
  }, [request]);

  useEffect(() => {
    let cancelled = false;

    async function loadCommunes() {
      const code = Number(form.wilayaCode);

      if (!Number.isInteger(code) || code < 1) {
        setCommunes([]);
        setCommuneId("");
        return;
      }

      try {
        const response = await request(
          `/delivery/communes?wilayaCode=${encodeURIComponent(
            String(code),
          )}`,
          {
            method: "GET",
          },
        );

        if (!response || cancelled) return;

        if (!response.ok) {
          throw new Error(
            await readApiError(
              response,
              "Impossible de charger les communes.",
            ),
          );
        }

        const payload =
          (await response.json()) as ApiCommune[];

        if (cancelled) return;

        setCommunes(payload);

        if (code === order.wilayaCode) {
          const current = payload.find(
            (commune) =>
              commune.name.trim().toLowerCase() ===
              order.commune.trim().toLowerCase(),
          );

          setCommuneId(
            current ? String(current.id) : "",
          );
        } else {
          setCommuneId("");
        }
      } catch (caughtError) {
        if (!cancelled) {
          setCommunes([]);
          setCommuneId("");
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Impossible de charger les communes.",
          );
        }
      }
    }

    void loadCommunes();

    return () => {
      cancelled = true;
    };
  }, [form.wilayaCode, order.commune, order.wilayaCode, request]);

  const getProductDetail = useCallback(
    async (
      productId: string,
    ): Promise<AdminProductDetail | null> => {
      const cached = productCache[productId];

      if (cached) {
        return cached;
      }

      const response = await request(
        `/admin/products/${encodeURIComponent(
          productId,
        )}`,
        {
          method: "GET",
        },
      );

      if (!response) return null;

      if (!response.ok) {
        throw new Error(
          await readApiError(
            response,
            "Impossible de charger le produit.",
          ),
        );
      }

      const detail =
        (await response.json()) as AdminProductDetail;

      setProductCache((current) => ({
        ...current,
        [productId]: detail,
      }));

      return detail;
    },
    [productCache, request],
  );

  const selectedCommune = communes.find(
    (commune) => String(commune.id) === communeId,
  );

  const officeUnavailable =
    form.deliveryType === "office" &&
    Boolean(communeId) &&
    selectedCommune?.hasStopDesk === false;

  const itemsEditable = [
    "pending",
    "confirmed",
    "processing",
  ].includes(order.status);

  const setField = <K extends keyof OrderEditForm>(
    field: K,
    value: OrderEditForm[K],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  async function saveOrder() {
    setError(null);
    setSuccess(null);

    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.phone.trim()
    ) {
      setError(
        "Le prénom, le nom et le téléphone sont obligatoires.",
      );
      return;
    }

    if (!communeId) {
      setError(
        "Sélectionne une commune Yalidine.",
      );
      return;
    }

    if (
      form.deliveryType === "home" &&
      !form.addressLine1.trim()
    ) {
      setError(
        "L’adresse est obligatoire pour une livraison à domicile.",
      );
      return;
    }

    if (officeUnavailable) {
      setError(
        "Cette commune ne dispose pas de bureau Yalidine.",
      );
      return;
    }

    const deliveryFeeCents = parseDaToCents(
      form.deliveryFeeDa,
    );
    const discountCents = parseDaToCents(
      form.discountDa,
    );

    if (deliveryFeeCents === null) {
      setError(
        "Les frais de livraison doivent être un montant valide.",
      );
      return;
    }

    if (discountCents === null) {
      setError(
        "La remise doit être un montant valide.",
      );
      return;
    }

    const payload: Record<string, unknown> = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || null,

      addressLine2: form.addressLine2.trim() || null,

      wilayaCode: Number(form.wilayaCode),
      communeId: Number(communeId),
      deliveryType: form.deliveryType,

      deliveryOfficeId:
        form.deliveryType === "office"
          ? form.deliveryOfficeId.trim() || null
          : null,
      deliveryOfficeName:
        form.deliveryType === "office"
          ? form.deliveryOfficeName.trim() || null
          : null,

      notes: form.notes.trim() || null,
      promoCode: form.promoCode.trim() || null,

      paymentMethod:
        form.paymentMethod.trim() || "cod",
      paymentStatus: form.paymentStatus,

      deliveryFeeCents,
      discountCents,
    };

    if (
      form.deliveryType === "home" ||
      form.addressLine1.trim()
    ) {
      payload.addressLine1 =
        form.addressLine1.trim();
    }

    setIsSaving(true);

    try {
      const response = await request(
        `/admin/orders/${encodeURIComponent(
          order.id,
        )}`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        },
      );

      if (!response) return;

      if (!response.ok) {
        throw new Error(
          await readApiError(
            response,
            "Impossible d’enregistrer la commande.",
          ),
        );
      }

      const updated =
        (await response.json()) as OrderRow;

      onSaved(updated);
      setSuccess("Commande enregistrée.");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Impossible d’enregistrer la commande.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoadingLookups) {
    return (
      <div className="rounded-2xl border border-black/[0.07] bg-white p-5">
        <div className="admin-skeleton h-10 w-full" />
        <div className="mt-3 admin-skeleton h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-5 rounded-2xl border border-neutral-950/10 bg-[#f8f7f3] p-3 sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-neutral-950">
            Modifier la commande
          </h3>
          <p className="mt-1 text-xs leading-5 text-neutral-500">
            Les identifiants techniques, la référence et les
            dates système restent protégés.
          </p>
        </div>

        <span className="inline-flex w-fit rounded-full bg-neutral-950 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-white">
          {order.reference}
        </span>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <EditSection title="Client">
          <div className="grid gap-3 sm:grid-cols-2">
            <EditField label="Prénom">
              <input
                value={form.firstName}
                onChange={(event) =>
                  setField(
                    "firstName",
                    event.target.value,
                  )
                }
                className={adminInputClass}
              />
            </EditField>

            <EditField label="Nom">
              <input
                value={form.lastName}
                onChange={(event) =>
                  setField(
                    "lastName",
                    event.target.value,
                  )
                }
                className={adminInputClass}
              />
            </EditField>

            <EditField label="Téléphone">
              <input
                value={form.phone}
                onChange={(event) =>
                  setField(
                    "phone",
                    event.target.value,
                  )
                }
                className={adminInputClass}
              />
            </EditField>

            <EditField label="Email">
              <input
                type="email"
                value={form.email}
                onChange={(event) =>
                  setField(
                    "email",
                    event.target.value,
                  )
                }
                className={adminInputClass}
                placeholder="Facultatif"
              />
            </EditField>
          </div>
        </EditSection>

        <EditSection title="Paiement et montants">
          <div className="grid gap-3 sm:grid-cols-2">
            <EditField label="Mode de paiement">
              <input
                value={form.paymentMethod}
                onChange={(event) =>
                  setField(
                    "paymentMethod",
                    event.target.value,
                  )
                }
                className={adminInputClass}
              />
            </EditField>

            <EditField label="Statut paiement">
              <select
                value={form.paymentStatus}
                onChange={(event) =>
                  setField(
                    "paymentStatus",
                    event.target.value,
                  )
                }
                className={adminInputClass}
              >
                <option value="pending">
                  En attente
                </option>
                <option value="paid">Payé</option>
                <option value="failed">Échoué</option>
                <option value="refunded">
                  Remboursé
                </option>
              </select>
            </EditField>

            <EditField label="Frais de livraison (DA)">
              <input
                inputMode="decimal"
                value={form.deliveryFeeDa}
                onChange={(event) =>
                  setField(
                    "deliveryFeeDa",
                    event.target.value,
                  )
                }
                className={adminInputClass}
              />
            </EditField>

            <EditField label="Remise (DA)">
              <input
                inputMode="decimal"
                value={form.discountDa}
                onChange={(event) =>
                  setField(
                    "discountDa",
                    event.target.value,
                  )
                }
                className={adminInputClass}
              />
            </EditField>

            <EditField label="Code promo">
              <input
                value={form.promoCode}
                onChange={(event) =>
                  setField(
                    "promoCode",
                    event.target.value,
                  )
                }
                className={adminInputClass}
                placeholder="Facultatif"
              />
            </EditField>

            <div className="rounded-xl bg-[#faf9f6] p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-neutral-400">
                Total actuel
              </p>
              <p className="mt-1 text-base font-bold text-neutral-950">
                {formatPrice(order.totalCents)}
              </p>
            </div>
          </div>
        </EditSection>

        <EditSection title="Livraison">
          <div className="grid gap-3 sm:grid-cols-2">
            <EditField label="Wilaya">
              <select
                value={form.wilayaCode}
                onChange={(event) => {
                  setField(
                    "wilayaCode",
                    event.target.value,
                  );
                  setCommuneId("");
                }}
                className={adminInputClass}
              >
                <option value="">
                  Sélectionner
                </option>
                {wilayas.map((wilaya) => (
                  <option
                    key={wilaya.code}
                    value={wilaya.code}
                    disabled={!wilaya.available}
                  >
                    {wilaya.code} — {wilaya.name}
                    {!wilaya.available
                      ? " (indisponible)"
                      : ""}
                  </option>
                ))}
              </select>
            </EditField>

            <EditField label="Commune">
              <select
                value={communeId}
                onChange={(event) =>
                  setCommuneId(event.target.value)
                }
                className={adminInputClass}
              >
                <option value="">
                  Sélectionner
                </option>
                {communes.map((commune) => (
                  <option
                    key={commune.id}
                    value={commune.id}
                    disabled={!commune.available}
                  >
                    {commune.name}
                    {!commune.available
                      ? " (indisponible)"
                      : ""}
                  </option>
                ))}
              </select>
            </EditField>

            <EditField label="Type de livraison">
              <select
                value={form.deliveryType}
                onChange={(event) =>
                  setField(
                    "deliveryType",
                    event.target.value as
                      | "home"
                      | "office",
                  )
                }
                className={adminInputClass}
              >
                <option value="home">
                  Domicile
                </option>
                <option value="office">
                  Bureau Yalidine
                </option>
              </select>
            </EditField>

            {form.deliveryType === "home" ? (
              <EditField label="Adresse">
                <input
                  value={form.addressLine1}
                  onChange={(event) =>
                    setField(
                      "addressLine1",
                      event.target.value,
                    )
                  }
                  className={adminInputClass}
                />
              </EditField>
            ) : (
              <div className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                {selectedCommune?.hasStopDesk
                  ? "Cette commune accepte la livraison en bureau."
                  : "Sélectionne une commune disposant d’un bureau Yalidine."}
              </div>
            )}

            <EditField label="Complément d’adresse">
              <input
                value={form.addressLine2}
                onChange={(event) =>
                  setField(
                    "addressLine2",
                    event.target.value,
                  )
                }
                className={adminInputClass}
                placeholder="Facultatif"
              />
            </EditField>

            {form.deliveryType === "office" ? (
              <>
                <EditField label="ID bureau / CRM">
                  <input
                    value={form.deliveryOfficeId}
                    onChange={(event) =>
                      setField(
                        "deliveryOfficeId",
                        event.target.value,
                      )
                    }
                    className={adminInputClass}
                    placeholder="Facultatif"
                  />
                </EditField>

                <EditField label="Nom du bureau / CRM">
                  <input
                    value={form.deliveryOfficeName}
                    onChange={(event) =>
                      setField(
                        "deliveryOfficeName",
                        event.target.value,
                      )
                    }
                    className={adminInputClass}
                    placeholder="Facultatif"
                  />
                </EditField>
              </>
            ) : null}
          </div>
        </EditSection>

        <EditSection title="Informations internes">
          <div className="space-y-3">
            <EditField label="Notes">
              <textarea
                value={form.notes}
                onChange={(event) =>
                  setField(
                    "notes",
                    event.target.value,
                  )
                }
                rows={5}
                className={adminTextareaClass}
                placeholder="Notes internes ou client"
              />
            </EditField>

            <div className="rounded-xl border border-black/[0.06] bg-[#faf9f6] p-3 text-xs leading-5 text-neutral-500">
              Le statut de la commande reste géré par le
              sélecteur « Modifier le statut » afin de conserver
              l’historique et les règles de transition du backend.
            </div>
          </div>
        </EditSection>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => void saveOrder()}
          disabled={isSaving}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-neutral-950 px-5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving
            ? "Enregistrement…"
            : "Enregistrer les informations"}
        </button>
      </div>

      <EditSection title="Articles de la commande">
        {!itemsEditable ? (
          <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
            Les articles ne peuvent plus être modifiés après
            l’expédition. Les informations client et administratives
            restent modifiables.
          </div>
        ) : null}

        <div className="mt-4 space-y-4">
          {order.items.map((item) => (
            <EditableOrderItem
              key={item.id}
              orderId={order.id}
              item={item}
              products={products}
              getProductDetail={getProductDetail}
              request={request}
              disabled={!itemsEditable}
              onSaved={onSaved}
            />
          ))}
        </div>

        {itemsEditable ? (
          <AddOrderItem
            orderId={order.id}
            products={products}
            getProductDetail={getProductDetail}
            request={request}
            onSaved={onSaved}
          />
        ) : null}
      </EditSection>
    </div>
  );
}

function EditableOrderItem({
  orderId,
  item,
  products,
  getProductDetail,
  request,
  disabled,
  onSaved,
}: {
  orderId: string;
  item: OrderItemRow;
  products: AdminProductListItem[];
  getProductDetail: (
    productId: string,
  ) => Promise<AdminProductDetail | null>;
  request: AdminRequest;
  disabled: boolean;
  onSaved: (order: OrderRow) => void;
}) {
  const [productId, setProductId] = useState(
    item.productId ?? "",
  );
  const [variantId, setVariantId] = useState(
    item.variantId ?? "",
  );
  const [quantity, setQuantity] = useState(
    String(item.quantity),
  );
  const [unitPriceDa, setUnitPriceDa] = useState(
    centsToDaInput(item.unitPriceCents),
  );
  const [personalization, setPersonalization] =
    useState(
      item.personalization
        ? JSON.stringify(
            item.personalization,
            null,
            2,
          )
        : "",
    );

  const [detail, setDetail] =
    useState<AdminProductDetail | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!productId) {
      setDetail(null);
      return;
    }

    void getProductDetail(productId)
      .then((product) => {
        if (!cancelled) {
          setDetail(product);
        }
      })
      .catch((caughtError) => {
        if (!cancelled) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Impossible de charger le produit.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [getProductDetail, productId]);

  const activeVariants =
    detail?.variants ?? [];

  function handleProductChange(value: string) {
    setProductId(value);
    setVariantId("");
    setError(null);

    if (!value) return;

    void getProductDetail(value)
      .then((product) => {
        if (!product) return;

        setDetail(product);
        setUnitPriceDa(
          centsToDaInput(product.priceCents),
        );
      })
      .catch((caughtError) => {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Impossible de charger le produit.",
        );
      });
  }

  function handleVariantChange(value: string) {
    setVariantId(value);

    const variant = activeVariants.find(
      (candidate) => candidate.id === value,
    );

    if (variant && detail) {
      setUnitPriceDa(
        centsToDaInput(
          variant.priceCents ??
            detail.priceCents,
        ),
      );
    }
  }

  async function saveItem() {
    if (disabled) return;

    setError(null);

    const parsedQuantity = Number(quantity);
    const unitPriceCents =
      parseDaToCents(unitPriceDa);

    if (
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity < 1 ||
      parsedQuantity > 99
    ) {
      setError(
        "La quantité doit être comprise entre 1 et 99.",
      );
      return;
    }

    if (unitPriceCents === null) {
      setError("Le prix unitaire est invalide.");
      return;
    }

    if (
      detail &&
      detail.variants.length > 0 &&
      !variantId
    ) {
      setError(
        "Sélectionne une variante pour ce produit.",
      );
      return;
    }

    let parsedPersonalization:
      | Record<string, unknown>
      | null;

    try {
      parsedPersonalization =
        safeJsonObject(personalization);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Personnalisation JSON invalide.",
      );
      return;
    }

    const payload: Record<string, unknown> = {
      quantity: parsedQuantity,
      unitPriceCents,
      personalization: parsedPersonalization,
    };

    const originalProductId =
      item.productId ?? "";

    if (productId !== originalProductId) {
      if (!productId) {
        setError("Sélectionne un produit.");
        return;
      }

      payload.productId = productId;
      payload.variantId = variantId || null;
    } else if (
      variantId !== (item.variantId ?? "")
    ) {
      payload.variantId = variantId || null;
    }

    setIsSaving(true);

    try {
      const response = await request(
        `/admin/orders/${encodeURIComponent(
          orderId,
        )}/items/${encodeURIComponent(item.id)}`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        },
      );

      if (!response) return;

      if (!response.ok) {
        throw new Error(
          await readApiError(
            response,
            "Impossible de modifier l’article.",
          ),
        );
      }

      const updated =
        (await response.json()) as OrderRow;

      onSaved(updated);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Impossible de modifier l’article.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteItem() {
    if (disabled) return;

    const confirmed = window.confirm(
      `Supprimer « ${item.productName} » de cette commande ?`,
    );

    if (!confirmed) return;

    setError(null);
    setIsDeleting(true);

    try {
      const response = await request(
        `/admin/orders/${encodeURIComponent(
          orderId,
        )}/items/${encodeURIComponent(item.id)}`,
        {
          method: "DELETE",
        },
      );

      if (!response) return;

      if (!response.ok) {
        throw new Error(
          await readApiError(
            response,
            "Impossible de supprimer l’article.",
          ),
        );
      }

      const updated =
        (await response.json()) as OrderRow;

      onSaved(updated);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Impossible de supprimer l’article.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-black/[0.07] bg-[#faf9f6] p-4">
      <div className="flex gap-3">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-black/[0.06] bg-white">
          {item.productImageUrl ? (
            <img
              src={item.productImageUrl}
              alt={item.productName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-xs font-semibold text-neutral-400">
              M
            </div>
          )}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-neutral-950">
            {item.productName}
          </p>
          <p className="mt-1 text-xs text-neutral-400">
            {item.variantName ?? "Sans variante"} ·{" "}
            {formatPrice(item.totalPriceCents)}
          </p>
        </div>
      </div>

      {error ? (
        <div className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      ) : null}

      <fieldset
        disabled={disabled || isSaving || isDeleting}
        className="mt-4 grid gap-3 lg:grid-cols-2"
      >
        <EditField label="Produit">
          <select
            value={productId}
            onChange={(event) =>
              handleProductChange(event.target.value)
            }
            className={adminInputClass}
          >
            {!productId ? (
              <option value="">
                Sélectionner un produit
              </option>
            ) : null}

            {item.productId &&
            !products.some(
              (product) =>
                product.id === item.productId,
            ) ? (
              <option value={item.productId}>
                {item.productName} (historique)
              </option>
            ) : null}

            {products.map((product) => (
              <option
                key={product.id}
                value={product.id}
              >
                {product.name}
                {!product.isActive
                  ? " (inactif)"
                  : ""}
              </option>
            ))}
          </select>
        </EditField>

        <EditField label="Variante / couleur">
          <select
            value={variantId}
            onChange={(event) =>
              handleVariantChange(
                event.target.value,
              )
            }
            className={adminInputClass}
            disabled={
              disabled ||
              !detail ||
              detail.variants.length === 0
            }
          >
            <option value="">
              {detail?.variants.length
                ? "Sélectionner"
                : "Sans variante"}
            </option>

            {detail?.variants.map((variant) => (
              <option
                key={variant.id}
                value={variant.id}
              >
                {variant.name}
                {variant.colorName
                  ? ` — ${variant.colorName}`
                  : ""}
                {!variant.isActive
                  ? " (inactive)"
                  : ""}
              </option>
            ))}
          </select>
        </EditField>

        <EditField label="Quantité">
          <input
            type="number"
            min={1}
            max={99}
            value={quantity}
            onChange={(event) =>
              setQuantity(event.target.value)
            }
            className={adminInputClass}
          />
        </EditField>

        <EditField label="Prix unitaire (DA)">
          <input
            inputMode="decimal"
            value={unitPriceDa}
            onChange={(event) =>
              setUnitPriceDa(event.target.value)
            }
            className={adminInputClass}
          />
        </EditField>

        <div className="lg:col-span-2">
          <EditField label="Personnalisation (JSON)">
            <textarea
              rows={4}
              value={personalization}
              onChange={(event) =>
                setPersonalization(
                  event.target.value,
                )
              }
              className={adminTextareaClass}
              placeholder={'Ex. {"texte":"Joyeux anniversaire"}'}
            />
          </EditField>
        </div>
      </fieldset>

      {!disabled ? (
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={() => void deleteItem()}
            disabled={isDeleting || isSaving}
            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-red-100 bg-white px-3.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
          >
            {isDeleting
              ? "Suppression…"
              : "Supprimer"}
          </button>

          <button
            type="button"
            onClick={() => void saveItem()}
            disabled={isDeleting || isSaving}
            className="inline-flex min-h-10 items-center justify-center rounded-xl bg-neutral-950 px-3.5 text-xs font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
          >
            {isSaving
              ? "Enregistrement…"
              : "Enregistrer l’article"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function AddOrderItem({
  orderId,
  products,
  getProductDetail,
  request,
  onSaved,
}: {
  orderId: string;
  products: AdminProductListItem[];
  getProductDetail: (
    productId: string,
  ) => Promise<AdminProductDetail | null>;
  request: AdminRequest;
  onSaved: (order: OrderRow) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [productId, setProductId] = useState("");
  const [variantId, setVariantId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unitPriceDa, setUnitPriceDa] = useState("");
  const [personalization, setPersonalization] =
    useState("");
  const [detail, setDetail] =
    useState<AdminProductDetail | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleProductChange(value: string) {
    setProductId(value);
    setVariantId("");
    setDetail(null);
    setError(null);

    if (!value) {
      setUnitPriceDa("");
      return;
    }

    try {
      const product =
        await getProductDetail(value);

      if (!product) return;

      setDetail(product);
      setUnitPriceDa(
        centsToDaInput(product.priceCents),
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Impossible de charger le produit.",
      );
    }
  }

  function handleVariantChange(value: string) {
    setVariantId(value);

    const variant = detail?.variants.find(
      (candidate) => candidate.id === value,
    );

    if (variant && detail) {
      setUnitPriceDa(
        centsToDaInput(
          variant.priceCents ??
            detail.priceCents,
        ),
      );
    }
  }

  async function addItem() {
    setError(null);

    if (!productId) {
      setError("Sélectionne un produit.");
      return;
    }

    if (
      detail &&
      detail.variants.length > 0 &&
      !variantId
    ) {
      setError("Sélectionne une variante.");
      return;
    }

    const parsedQuantity = Number(quantity);
    const unitPriceCents =
      parseDaToCents(unitPriceDa);

    if (
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity < 1 ||
      parsedQuantity > 99
    ) {
      setError(
        "La quantité doit être comprise entre 1 et 99.",
      );
      return;
    }

    if (unitPriceCents === null) {
      setError("Le prix unitaire est invalide.");
      return;
    }

    let parsedPersonalization:
      | Record<string, unknown>
      | null;

    try {
      parsedPersonalization =
        safeJsonObject(personalization);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Personnalisation JSON invalide.",
      );
      return;
    }

    setIsSaving(true);

    try {
      const response = await request(
        `/admin/orders/${encodeURIComponent(
          orderId,
        )}/items`,
        {
          method: "POST",
          body: JSON.stringify({
            productId,
            variantId: variantId || undefined,
            quantity: parsedQuantity,
            unitPriceCents,
            personalization:
              parsedPersonalization ?? undefined,
          }),
        },
      );

      if (!response) return;

      if (!response.ok) {
        throw new Error(
          await readApiError(
            response,
            "Impossible d’ajouter l’article.",
          ),
        );
      }

      const updated =
        (await response.json()) as OrderRow;

      onSaved(updated);

      setProductId("");
      setVariantId("");
      setQuantity("1");
      setUnitPriceDa("");
      setPersonalization("");
      setDetail(null);
      setIsOpen(false);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Impossible d’ajouter l’article.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mt-4 border-t border-black/[0.06] pt-4">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex min-h-10 items-center justify-center rounded-xl border border-black/[0.08] bg-white px-4 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50"
      >
        {isOpen
          ? "Annuler l’ajout"
          : "Ajouter un article"}
      </button>

      {isOpen ? (
        <div className="mt-4 rounded-2xl border border-black/[0.07] bg-[#faf9f6] p-4">
          {error ? (
            <div className="mb-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          ) : null}

          <div className="grid gap-3 lg:grid-cols-2">
            <EditField label="Produit">
              <select
                value={productId}
                onChange={(event) =>
                  void handleProductChange(
                    event.target.value,
                  )
                }
                className={adminInputClass}
              >
                <option value="">
                  Sélectionner
                </option>
                {products.map((product) => (
                  <option
                    key={product.id}
                    value={product.id}
                  >
                    {product.name}
                    {!product.isActive
                      ? " (inactif)"
                      : ""}
                  </option>
                ))}
              </select>
            </EditField>

            <EditField label="Variante / couleur">
              <select
                value={variantId}
                onChange={(event) =>
                  handleVariantChange(
                    event.target.value,
                  )
                }
                className={adminInputClass}
                disabled={
                  !detail ||
                  detail.variants.length === 0
                }
              >
                <option value="">
                  {detail?.variants.length
                    ? "Sélectionner"
                    : "Sans variante"}
                </option>

                {detail?.variants.map((variant) => (
                  <option
                    key={variant.id}
                    value={variant.id}
                  >
                    {variant.name}
                    {variant.colorName
                      ? ` — ${variant.colorName}`
                      : ""}
                  </option>
                ))}
              </select>
            </EditField>

            <EditField label="Quantité">
              <input
                type="number"
                min={1}
                max={99}
                value={quantity}
                onChange={(event) =>
                  setQuantity(event.target.value)
                }
                className={adminInputClass}
              />
            </EditField>

            <EditField label="Prix unitaire (DA)">
              <input
                inputMode="decimal"
                value={unitPriceDa}
                onChange={(event) =>
                  setUnitPriceDa(
                    event.target.value,
                  )
                }
                className={adminInputClass}
              />
            </EditField>

            <div className="lg:col-span-2">
              <EditField label="Personnalisation (JSON)">
                <textarea
                  rows={4}
                  value={personalization}
                  onChange={(event) =>
                    setPersonalization(
                      event.target.value,
                    )
                  }
                  className={adminTextareaClass}
                  placeholder={'Ex. {"texte":"Joyeux anniversaire"}'}
                />
              </EditField>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => void addItem()}
              disabled={isSaving}
              className="inline-flex min-h-10 items-center justify-center rounded-xl bg-neutral-950 px-4 text-xs font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
            >
              {isSaving
                ? "Ajout…"
                : "Ajouter à la commande"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const adminInputClass =
  "h-11 w-full rounded-xl border border-black/[0.08] bg-white px-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-950/5 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400";

const adminTextareaClass =
  "w-full rounded-xl border border-black/[0.08] bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-950/5 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400";

function EditSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-black/[0.07] bg-white p-4 sm:p-5">
      <h4 className="text-xs font-semibold uppercase tracking-[0.11em] text-neutral-400">
        {title}
      </h4>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function EditField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-neutral-600">
        {label}
      </span>
      {children}
    </label>
  );
}

function DetailCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-black/[0.07] bg-white p-4 sm:p-5">
      <h3 className="text-xs font-semibold uppercase tracking-[0.11em] text-neutral-400">
        {title}
      </h3>

      <div className="mt-3 space-y-2.5">
        {children}
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="shrink-0 text-neutral-500">
        {label}
      </span>
      <span className="min-w-0 break-words text-right font-medium text-neutral-900">
        {value}
      </span>
    </div>
  );
}
