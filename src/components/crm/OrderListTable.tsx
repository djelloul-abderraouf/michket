import type { ReactNode } from "react";
import { duplicateStatusLabels, orderKindLabels, orderStatusLabels } from "@/lib/crm/types";
import type { Order } from "@/lib/crm/types";
import { duplicateStatusTones, orderKindTones, orderStatusTones } from "@/lib/crm/option-colors";
import { ColorChip } from "./CrmColorSelect";
import { dzd, formatDate, orderRef } from "./CrmUi";

export function OrderListTable({
  orders,
  onOpen,
  trailingHeader,
  trailing,
}: {
  orders: Order[];
  onOpen?: (order: Order) => void;
  trailingHeader?: string;
  trailing?: (order: Order) => ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[880px]">
        <thead>
          <tr className="border-b border-black/10 text-left text-[10px] font-semibold uppercase tracking-wider text-black/45">
            <th className="w-20 px-2 py-2">Réf.</th>
            <th className="px-2 py-2">Client</th>
            <th className="px-2 py-2">Wilaya</th>
            <th className="px-2 py-2">Commune</th>
            <th className="px-2 py-2">Statut</th>
            <th className="px-2 py-2">Priorité</th>
            <th className="px-2 py-2">Doublon</th>
            <th className="px-2 py-2">Total</th>
            <th className="px-2 py-2">Date</th>
            {trailing ? <th className="px-2 py-2">{trailingHeader || ""}</th> : null}
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              onClick={onOpen ? () => onOpen(order) : undefined}
              className={`border-b border-black/5 ${onOpen ? "cursor-pointer hover:bg-black/[0.02]" : ""}`}
            >
              <td className="w-20 max-w-20 px-2 py-2">
                <p className="truncate text-[11px] font-semibold" title={orderRef(order)}>
                  {orderRef(order)}
                </p>
              </td>
              <td className="px-2 py-2">
                <p className="max-w-[140px] truncate text-xs font-medium">{order.clientName}</p>
                <p className="text-[11px] text-black/45">{order.phone}</p>
              </td>
              <td className="px-2 py-2 text-xs text-black/70">{order.wilaya || "—"}</td>
              <td className="px-2 py-2 text-xs text-black/70">{order.commune || "—"}</td>
              <td className="px-2 py-2">
                <ColorChip label={orderStatusLabels[order.status]} tone={orderStatusTones[order.status]} />
              </td>
              <td className="px-2 py-2">
                {order.orderKind ? (
                  <ColorChip label={orderKindLabels[order.orderKind]} tone={orderKindTones[order.orderKind]} />
                ) : (
                  <span className="text-[11px] text-black/35">—</span>
                )}
              </td>
              <td className="px-2 py-2">
                <ColorChip
                  label={duplicateStatusLabels[order.duplicateStatus || "unique"]}
                  tone={duplicateStatusTones[order.duplicateStatus || "unique"]}
                />
              </td>
              <td className="px-2 py-2 text-xs font-semibold whitespace-nowrap">{dzd.format(order.total)}</td>
              <td className="px-2 py-2 text-[11px] text-black/45 whitespace-nowrap">{formatDate(order.createdAt)}</td>
              {trailing ? (
                <td className="px-2 py-2" onClick={(event) => event.stopPropagation()}>
                  {trailing(order)}
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
