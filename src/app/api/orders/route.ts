import { NextResponse } from "next/server";

import type { DeliveryType } from "@/data/delivery-prices";
import {
  ApiNotFoundError,
  fetchProductBySlug,
} from "@/lib/api";
import { getDeliveryRate } from "@/lib/delivery";

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
    const variantId = clean(
      body.variantId,
      100,
    );

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

    const firstName = clean(
      body.firstName,
      80,
    );
    const lastName = clean(
      body.lastName,
      80,
    );
    const phone = normalizePhone(
      clean(body.phone, 30),
    );
    const personalization = clean(
      body.personalization,
      1500,
    );
    const address = clean(
      body.address,
      300,
    );
    const commune = clean(
      body.commune,
      120,
    );
    const wilayaName = clean(
      body.wilayaName,
      120,
    );

    const quantity = Math.max(
      1,
      Math.min(
        10,
        Number(body.quantity) || 1,
      ),
    );

    const wilayaCode = Number(
      body.wilayaCode,
    );

    const deliveryType = clean(
      body.deliveryType,
      20,
    ) as DeliveryType;

    if (
      !firstName ||
      !lastName ||
      !commune ||
      !wilayaName
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
      !Number.isInteger(
        wilayaCode,
      ) ||
      wilayaCode < 1 ||
      wilayaCode > 69 ||
      (deliveryType !== "home" &&
        deliveryType !== "office")
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

    if (
      product.isPersonalizable &&
      !personalization
    ) {
      return NextResponse.json(
        {
          message:
            "Merci d'indiquer la personnalisation souhaitée.",
        },
        { status: 400 },
      );
    }

    const rate =
      await getDeliveryRate(
        wilayaCode,
        deliveryType,
      );

    if (rate.fee === null) {
      return NextResponse.json(
        {
          message:
            "Le tarif de livraison n'est pas encore configuré pour cette destination.",
        },
        { status: 400 },
      );
    }

    /*
     * SECURITY:
     * Never trust a price sent by the browser.
     * The unit price is resolved again from the public backend here.
     */
    const unitPriceCents =
      selectedVariant?.priceCents ??
      product.priceCents;

    const unitPrice =
      unitPriceCents / 100;

    const subtotal = Number(
      (
        unitPrice * quantity
      ).toFixed(2),
    );

    const total = Number(
      (
        subtotal + rate.fee
      ).toFixed(2),
    );

    const reference =
      `MICH-${Date.now()
        .toString(36)
        .toUpperCase()}`;

    const order = {
      reference,
      createdAt:
        new Date().toISOString(),
      status: "new",

      product: {
        id: product.id,
        slug: product.slug,
        title: product.name,

        variant: selectedVariant
          ? {
              id: selectedVariant.id,
              name:
                selectedVariant.name,
              sku:
                selectedVariant.sku,
              colorName:
                selectedVariant.colorName,
              colorHex:
                selectedVariant.colorHex,
              isMulticolor:
                selectedVariant.isMulticolor,
            }
          : null,

        unitPrice,
        quantity,
        subtotal,
      },

      customer: {
        firstName,
        lastName,
        phone,
      },

      personalization,

      delivery: {
        wilayaCode,
        wilayaName,
        commune,
        address:
          deliveryType === "home"
            ? address
            : "",
        type: deliveryType,
        fee: rate.fee,
        courierWilayaCode:
          rate.courierWilayaCode,
      },

      total,
      currency: "DZD",
    };

    const webhookUrl =
      process.env.ORDER_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error(
        "[Michket] ORDER_WEBHOOK_URL absent. Commande non transmise:",
        reference,
      );

      return NextResponse.json(
        {
          message:
            "Le système de réception des commandes n'est pas encore connecté.",
        },
        { status: 503 },
      );
    }

    const webhookResponse =
      await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        cache: "no-store",
        body: JSON.stringify(
          order,
        ),
      });

    if (!webhookResponse.ok) {
      console.error(
        "[Michket] Webhook commande en erreur:",
        webhookResponse.status,
      );

      return NextResponse.json(
        {
          message:
            "La commande n'a pas pu être transmise. Merci de réessayer.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      reference,
      total,
    });
  } catch (error) {
    console.error(
      "[Michket] Erreur commande:",
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
