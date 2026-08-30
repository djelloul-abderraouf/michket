import { NextResponse } from "next/server";
import { getDeliveryRate } from "@/lib/delivery";
import type { DeliveryType } from "@/data/delivery-prices";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      wilayaCode?: number;
      deliveryType?: DeliveryType;
    };

    const wilayaCode = Number(body.wilayaCode);
    const deliveryType = body.deliveryType;

    if (
      !Number.isInteger(wilayaCode) ||
      wilayaCode < 1 ||
      wilayaCode > 69 ||
      (deliveryType !== "home" && deliveryType !== "office")
    ) {
      return NextResponse.json(
        { message: "Données de livraison invalides." },
        { status: 400 },
      );
    }

    const rate = await getDeliveryRate(wilayaCode, deliveryType);

    return NextResponse.json(rate);
  } catch {
    return NextResponse.json(
      { message: "Impossible de calculer la livraison." },
      { status: 500 },
    );
  }
}
