"use client";

import { useState } from "react";
import Image from "next/image";
import { 
  LayoutDashboard, 
  Package, 
  CheckCircle, 
  Briefcase, 
  FileText, 
  Users, 
  Building2, 
  Phone, 
  ClipboardList,
  Wrench, 
  ClipboardCheck, 
  Truck, 
  Store,
  Boxes, 
  CheckSquare, 
  UserCog, 
  Settings,
  Hourglass,
  Flame,
  Archive,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { canAccessPage, crmPages } from "@/lib/crm/permissions";
import { crmPagePaths } from "@/lib/crm/routes";
import { staffRoleLabel, type CrmPage, type CrmUser } from "@/lib/crm/types";
import type { UnconfirmedBucket } from "@/lib/crm/order-followup";
import { cx } from "./CrmUi";

const pageIcons: Record<CrmPage, React.ComponentType<{ className?: string }>> = {
  overview: LayoutDashboard,
  orders: Package,
  orders_prospection: Hourglass,
  orders_prioritaire: Flame,
  orders_archive: Archive,
  confirmation: CheckCircle,
  sales: Briefcase,
  proposals: FileText,
  contacts: Users,
  companies: Building2,
  activities: Phone,
  production: Wrench,
  confirmed_orders: ClipboardList,
  preparation: ClipboardCheck,
  delivery: Truck,
  catalog: Store,
  stock: Boxes,
  tasks: CheckSquare,
  users: UserCog,
  settings: Settings,
};

const pageGroups: Array<{ group: string; pages: CrmPage[] }> = [
  { group: "Principal", pages: ["overview", "orders", "sales", "proposals", "contacts", "companies", "activities"] },
  { group: "Suivi commercial", pages: ["orders_prospection", "orders_prioritaire", "orders_archive"] },
  { group: "Opérations", pages: ["confirmation", "confirmed_orders", "production", "preparation", "delivery"] },
  { group: "Gestion", pages: ["catalog", "stock", "tasks", "users", "settings"] },
];

export function CrmSidebar({
  user,
  activePage,
  onPageChange,
  followUpCounts,
  stockAlertCount = 0,
  isCollapsed: externalCollapsed,
  onToggleCollapse,
}: {
  user: CrmUser;
  activePage: CrmPage;
  onPageChange?: (page: CrmPage) => void;
  followUpCounts?: Partial<Record<UnconfirmedBucket, number>>;
  stockAlertCount?: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isCollapsed = externalCollapsed ?? internalCollapsed;
  const toggleCollapse = onToggleCollapse ?? (() => setInternalCollapsed(!internalCollapsed));
  const accessiblePages = crmPages.filter((page) => canAccessPage(user.roles, page.id));

  return (
    <aside 
      className={cx(
        "fixed left-0 top-0 h-screen border-r border-black/10 bg-white shadow-sm transition-all duration-300 z-50 flex flex-col",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="border-b border-black/10 bg-gradient-to-r from-michket-gold to-amber-500 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!isCollapsed && (
              <>
                <Image
                  src="/images/brand/michket-logo-black.png"
                  alt="Michket"
                  width={32}
                  height={32}
                  className="h-8 w-auto"
                />
                <div>
                  <p className="text-sm font-black tracking-[0] text-black">Michket CRM</p>
                  <p className="mt-0.5 text-xs text-black/70">{user.name}</p>
                </div>
              </>
            )}
            {isCollapsed && (
              <Image
                src="/images/brand/michket-logo-black.png"
                alt="Michket"
                width={32}
                height={32}
                className="h-8 w-auto mx-auto"
              />
            )}
          </div>
          <button
            onClick={toggleCollapse}
            className="ml-2 p-1 rounded hover:bg-black/10 text-black transition"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
        {!isCollapsed && (
          <div className="mt-3 flex flex-wrap gap-1.5 px-4">
            {(user.assignedRoles?.length ? user.assignedRoles : user.roles).map((role) => (
              <span
                key={role}
                className="rounded-full border border-black/20 bg-black/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-black"
              >
                {staffRoleLabel(role)}
              </span>
            ))}
          </div>
        )}
      </div>

      <nav className={cx("p-3 overflow-y-auto flex-1", isCollapsed ? "flex flex-col items-center gap-4" : "")}>
        {pageGroups.map(({ group, pages }) => {
          const groupPages = accessiblePages.filter((page) => pages.includes(page.id));
          if (groupPages.length === 0) return null;

          return (
            <div key={group} className={cx("mb-4 last:mb-0", isCollapsed ? "flex flex-col items-center gap-4" : "")}>
              {!isCollapsed && (
                <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-black/40">
                  {group}
                </p>
              )}
              <div className={cx("space-y-1", isCollapsed ? "flex flex-col items-center gap-4" : "")}>
                {groupPages.map((page) => {
                  const Icon = pageIcons[page.id];
                  return (
                    <button
                      key={page.id}
                      onClick={() => onPageChange?.(page.id)}
                      className={cx(
                        "relative flex items-center gap-3 rounded-lg text-sm font-semibold tracking-[0] transition-all",
                        activePage === page.id
                          ? "bg-black text-white shadow-md"
                          : "text-black/70 hover:bg-black/5 hover:text-black",
                        isCollapsed ? "p-2" : "px-3 py-2.5 w-full text-left"
                      )}
                      title={isCollapsed ? page.label : undefined}
                    >
                      <Icon className={cx("h-5 w-5", isCollapsed ? "h-6 w-6" : "")} />
                      {!isCollapsed && (
                        <span className="flex-1">{page.label}</span>
                      )}
                      {!isCollapsed && page.id === "orders_prospection" && followUpCounts?.prospection != null && (
                        <span className={cx("rounded-full px-2 py-0.5 text-[10px]", activePage === page.id ? "bg-white/20" : "bg-black/10")}>{followUpCounts.prospection}</span>
                      )}
                      {!isCollapsed && page.id === "orders_prioritaire" && followUpCounts?.prioritaire != null && (
                        <span className={cx("rounded-full px-2 py-0.5 text-[10px]", activePage === page.id ? "bg-white/20" : "bg-black/10")}>{followUpCounts.prioritaire}</span>
                      )}
                      {!isCollapsed && page.id === "orders_archive" && followUpCounts?.archive != null && (
                        <span className={cx("rounded-full px-2 py-0.5 text-[10px]", activePage === page.id ? "bg-white/20" : "bg-black/10")}>{followUpCounts.archive}</span>
                      )}
                      {page.id === "stock" && stockAlertCount > 0 && (
                        <span className={cx(
                          "rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white",
                          isCollapsed && "absolute -right-1 -top-1",
                        )}>{stockAlertCount}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
