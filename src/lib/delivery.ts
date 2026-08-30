import {
  getCourierWilayaCode,
  manualDeliveryPrices,
  type DeliveryType,
} from "@/data/delivery-prices";

export interface DeliveryRateResult {
  fee: number | null;
  currency: "DZD";
  source: "manual" | "courier" | "unconfigured";
  courierWilayaCode: number;
  message?: string;
}

export async function getDeliveryRate(
  wilayaCode: number,
  deliveryType: DeliveryType,
): Promise<DeliveryRateResult> {
  const manual = manualDeliveryPrices[wilayaCode];

  if (manual) {
    return {
      fee: deliveryType === "home" ? manual.home : manual.office,
      currency: "DZD",
      source: "manual",
      courierWilayaCode: getCourierWilayaCode(wilayaCode),
    };
  }

  const fromWilaya = Number(process.env.DELIVERY_FROM_WILAYA);
  const apiId = process.env.YALIDINE_API_ID;
  const apiToken = process.env.YALIDINE_API_TOKEN;

  const courierWilayaCode = getCourierWilayaCode(wilayaCode);

  if (
    !Number.isInteger(fromWilaya) ||
    fromWilaya < 1 ||
    fromWilaya > 58 ||
    !apiId ||
    !apiToken
  ) {
    return {
      fee: null,
      currency: "DZD",
      source: "unconfigured",
      courierWilayaCode,
      message: "Tarif de livraison à confirmer.",
    };
  }

  try {
    const response = await fetch("https://freeship.dzbuild.com/v1/rates", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({
        courier: "yalidine",
        credentials: {
          apiId,
          apiToken,
        },
        query: {
          fromWilaya,
          toWilaya: courierWilayaCode,
          deliveryType: deliveryType === "home" ? "home" : "stopdesk",
        },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("[Michket] Erreur tarif transporteur:", response.status, text);

      return {
        fee: null,
        currency: "DZD",
        source: "unconfigured",
        courierWilayaCode,
        message: "Tarif de livraison momentanément indisponible.",
      };
    }

    const data = (await response.json()) as {
      deliveryFee?: number;
      total?: number;
      currency?: string;
    };

    const fee =
      typeof data.deliveryFee === "number"
        ? data.deliveryFee
        : typeof data.total === "number"
          ? data.total
          : null;

    return {
      fee,
      currency: "DZD",
      source: "courier",
      courierWilayaCode,
      message: fee === null ? "Tarif de livraison à confirmer." : undefined,
    };
  } catch (error) {
    console.error("[Michket] Impossible de calculer la livraison:", error);

    return {
      fee: null,
      currency: "DZD",
      source: "unconfigured",
      courierWilayaCode,
      message: "Tarif de livraison momentanément indisponible.",
    };
  }
}
