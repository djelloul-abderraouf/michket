import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

import {
  ApiNotFoundError,
  fetchProductBySlug,
} from "@/lib/api";

export const runtime = "nodejs";

const API_BASE =
  process.env.BACKEND_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3000/api/v1";

type DeliveryType = "home" | "office";

type BackendOrderResponse = {
  id: string;
  reference: string;
  totalCents: number;
  guestAccessToken?: string;
};

function clean(
  value: unknown,
  maxLength = 500,
): string {
  return String(value ?? "")
    .trim()
    .slice(0, maxLength);
}

function normalizePhone(value: string): string {
  return value.replace(/[^\d+]/g, "");
}

function isValidAlgerianPhone(
  value: string,
): boolean {
  const compact = value.replace(/\s+/g, "");

  return /^(?:0[567]\d{8}|\+213[567]\d{8})$/.test(
    compact,
  );
}

async function readBackendError(
  response: Response,
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
    // Keep generic fallback below.
  }

  return "La commande n'a pas pu être enregistrée.";
}

export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as Record<
        string,
        unknown
      >;

    // Honeypot anti-bot.
    if (clean(body.website, 100)) {
      return NextResponse.json({
        ok: true,
      });
    }

    const productSlug = clean(
      body.productSlug,
      160,
    );

    const variantId =
      clean(body.variantId, 100) ||
      null;

    const firstName = clean(
      body.firstName,
      100,
    );

    const lastName = clean(
      body.lastName,
      100,
    );

    const phone = normalizePhone(
      clean(body.phone, 30),
    );

    const personalization = clean(
      body.personalization,
      10_000,
    );

    const address = clean(
      body.address,
      255,
    );

    const commune = clean(
      body.commune,
      100,
    );

    const quantity = Number(
      body.quantity,
    );

    const wilayaCode = Number(
      body.wilayaCode,
    );

    const communeId = Number(
      body.communeId,
    );

    const rawDeliveryType = clean(
      body.deliveryType,
      20,
    );

    const deliveryType:
      | DeliveryType
      | null =
      rawDeliveryType === "home" ||
      rawDeliveryType === "office"
        ? rawDeliveryType
        : null;

    if (
      !productSlug ||
      !firstName ||
      !lastName ||
      !commune
    ) {
      return NextResponse.json(
        {
          message:
            "Merci de compléter tous les champs obligatoires.",
        },
        { status: 400 },
      );
    }

    if (!isValidAlgerianPhone(phone)) {
      return NextResponse.json(
        {
          message:
            "Le numéro de téléphone n'est pas valide.",
        },
        { status: 400 },
      );
    }

    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 99
    ) {
      return NextResponse.json(
        {
          message:
            "La quantité sélectionnée est invalide.",
        },
        { status: 400 },
      );
    }

    if (
      !Number.isInteger(wilayaCode) ||
      wilayaCode < 1 ||
      wilayaCode > 58 ||
      !Number.isInteger(communeId) ||
      communeId <= 0 ||
      !deliveryType
    ) {
      return NextResponse.json(
        {
          message:
            "Adresse de livraison invalide.",
        },
        { status: 400 },
      );
    }

    if (
      deliveryType === "home" &&
      !address
    ) {
      return NextResponse.json(
        {
          message:
            "Merci d'indiquer l'adresse de livraison.",
        },
        { status: 400 },
      );
    }

    let product;

    try {
      product =
        await fetchProductBySlug(
          productSlug,
        );
    } catch (error) {
      if (
        error instanceof
        ApiNotFoundError
      ) {
        return NextResponse.json(
          {
            message:
              "Produit introuvable.",
          },
          { status: 404 },
        );
      }

      throw error;
    }

    const activeVariants =
      product.variants.filter(
        (variant) =>
          variant.isActive,
      );

    const selectedVariant =
      variantId
        ? activeVariants.find(
            (variant) =>
              variant.id === variantId,
          ) ?? null
        : null;

    if (
      activeVariants.length > 0 &&
      !selectedVariant
    ) {
      return NextResponse.json(
        {
          message:
            "Merci de sélectionner une variante valide.",
        },
        { status: 400 },
      );
    }

    if (
      activeVariants.length === 0 &&
      variantId
    ) {
      return NextResponse.json(
        {
          message:
            "Ce produit ne possède pas cette variante.",
        },
        { status: 400 },
      );
    }

    /*
     * IMPORTANT:
     * This Next.js route no longer calculates prices or delivery fees.
     * The NestJS backend is the single source of truth:
     * - product / variant price
     * - Yalidine wilaya + commune validation
     * - home / stop-desk availability
     * - exact delivery fee
     * - final total
     */

    const personalizationPayload =
      personalization
        ? { text: personalization }
        : undefined;

    const backendPayload = {
      items: [
        {
          productId: product.id,
          ...(selectedVariant
            ? {
                variantId:
                  selectedVariant.id,
              }
            : {}),
          quantity,
          ...(personalizationPayload
            ? {
                personalization:
                  personalizationPayload,
              }
            : {}),
        },
      ],

      firstName,
      lastName,
      phone,

      // Backend DTO currently requires addressLine1 for every order.
      // For stop-desk delivery we store a neutral, server-generated label.
      addressLine1:
        deliveryType === "home"
          ? address
          : `Bureau Yalidine - ${commune}`,

      wilayaCode,
      communeId,
      commune,
      deliveryType,
    };

    /*
     * Guest checkout requires both headers.
     * If a future client supplies stable values, preserve them.
     * Otherwise generate server-side UUIDs for this direct-order request.
     */
    const incomingSessionId =
      request.headers
        .get("x-session-id")
        ?.trim();

    const sessionId =
      incomingSessionId &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        incomingSessionId,
      )
        ? incomingSessionId
        : randomUUID();

    const incomingIdempotencyKey =
      request.headers
        .get("idempotency-key")
        ?.trim();

    const idempotencyKey =
      incomingIdempotencyKey &&
      incomingIdempotencyKey.length >= 16 &&
      incomingIdempotencyKey.length <= 128
        ? incomingIdempotencyKey
        : randomUUID();

    const backendResponse =
      await fetch(
        `${API_BASE}/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            "Idempotency-Key":
              idempotencyKey,
            "X-Session-Id":
              sessionId,
          },
          cache: "no-store",
          body: JSON.stringify(
            backendPayload,
          ),
        },
      );

    if (!backendResponse.ok) {
      const message =
        await readBackendError(
          backendResponse,
        );

      return NextResponse.json(
        { message },
        {
          status:
            backendResponse.status,
        },
      );
    }

    const order =
      (await backendResponse.json()) as BackendOrderResponse;

    return NextResponse.json({
      ok: true,
      reference: order.reference,
      total:
        order.totalCents / 100,
      guestAccessToken:
        order.guestAccessToken,
    });
  } catch (error) {
    console.error(
      "[Michket] Erreur commande directe:",
      error,
    );

    return NextResponse.json(
      {
        message:
          "Une erreur est survenue pendant l'envoi de la commande.",
      },
      { status: 500 },
    );
  }
}
