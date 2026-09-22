import { crmDeliveryApi } from "@/lib/api-client";

function openOfficialBordereau(url: string) {
  const popup = window.open(url, "_blank", "noopener,noreferrer,width=900,height=1200");
  if (!popup) {
    throw new Error("Autorisez les popups pour ouvrir le bordereau Yalidine");
  }
  return popup;
}

export async function printYalidineBordereau(orderId: string) {
  const { url } = await crmDeliveryApi.getLabel(orderId);
  openOfficialBordereau(url);
}

export async function downloadYalidineBordereau(orderId: string, reference: string) {
  try {
    await crmDeliveryApi.downloadBordereau(orderId, reference);
  } catch {
    const { url } = await crmDeliveryApi.getLabel(orderId);
    openOfficialBordereau(url);
  }
}
