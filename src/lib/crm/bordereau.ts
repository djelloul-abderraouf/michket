import type { Order } from "@/lib/crm/types";
import { dzd, orderRef, productSummary } from "@/components/crm/CrmUi";
import { orderStatusLabels } from "@/lib/crm/types";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function printBordereau(order: Order) {
  const reference = orderRef(order);
  const delivery = order.deliveryType === "office"
    ? `Stop desk${order.deliveryOfficeName ? ` · ${order.deliveryOfficeName}` : ""}`
    : "Domicile";
  const items = (order.items || [])
    .map((item) => {
      const extra = [item.variantName, item.colorName].filter(Boolean).join(" / ");
      return `<tr>
        <td>${item.quantity}</td>
        <td>${escapeHtml(item.productName)}${extra ? ` <small>(${escapeHtml(extra)})</small>` : ""}</td>
        <td>${dzd.format(item.unitPrice)}</td>
        <td>${dzd.format(item.lineTotal ?? item.unitPrice * item.quantity)}</td>
      </tr>`;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>Bordereau ${escapeHtml(reference)}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #111; margin: 24px; }
    h1 { margin: 0; font-size: 22px; }
    h2 { margin: 0; font-size: 16px; letter-spacing: .08em; }
    .header { display: flex; justify-content: space-between; border-bottom: 3px solid #c9a227; padding-bottom: 12px; margin-bottom: 18px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .box { border: 1px solid #ddd; padding: 12px; min-height: 110px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th, td { border-bottom: 1px solid #eee; text-align: left; padding: 8px; font-size: 13px; }
    .total { text-align: right; font-size: 18px; font-weight: 700; margin-top: 12px; }
    .signs { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 36px; }
    .sign { border: 1px dashed #bbb; height: 90px; padding: 8px; font-size: 12px; }
    @media print { button { display: none !important; } body { margin: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>MICHKET</h1>
      <div>Bordereau d'envoi</div>
    </div>
    <div>
      <h2>${escapeHtml(reference)}</h2>
      <div>${escapeHtml(orderStatusLabels[order.status] || order.status)}</div>
    </div>
  </div>
  <div class="grid">
    <div class="box">
      <strong>Expediteur</strong><br/>Michket<br/>Livraison Yalidine<br/>Alger, Algerie
    </div>
    <div class="box">
      <strong>Destinataire</strong><br/>
      ${escapeHtml(order.clientName)}<br/>
      ${escapeHtml(order.phone)}<br/>
      ${escapeHtml(order.addressLine1 || "")}<br/>
      ${escapeHtml([order.commune, order.wilaya].filter(Boolean).join(" - "))}
    </div>
  </div>
  <p><strong>Livraison:</strong> ${escapeHtml(delivery)} · <strong>Paiement:</strong> ${escapeHtml((order.paymentMethod || "cod").toUpperCase())} · <strong>Yalidine:</strong> ${escapeHtml(order.trackingNumber || "colis a creer")}</p>
  <table>
    <thead><tr><th>Qte</th><th>Produit</th><th>Prix</th><th>Total</th></tr></thead>
    <tbody>${items || `<tr><td colspan="4">${escapeHtml(productSummary(order))}</td></tr>`}</tbody>
  </table>
  <div class="total">Total a encaisser: ${dzd.format(order.total)}</div>
  ${order.notes ? `<p><strong>Notes:</strong> ${escapeHtml(order.notes)}</p>` : ""}
  <div class="signs">
    <div class="sign">Cachet / signature expediteur</div>
    <div class="sign">Signature destinataire</div>
  </div>
  <script>window.onload = () => window.print();</script>
</body>
</html>`;

  const popup = window.open("", "_blank", "noopener,noreferrer,width=900,height=1200");
  if (!popup) {
    throw new Error("Autorisez les popups pour imprimer le bordereau");
  }
  popup.document.open();
  popup.document.write(html);
  popup.document.close();
}
