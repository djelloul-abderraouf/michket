import type { Order } from "@/lib/crm/types";
import { X, Plus, List, LayoutGrid, ChevronRight } from "lucide-react";

export const dzd = new Intl.NumberFormat("fr-DZ", {
  style: "currency",
  currency: "DZD",
  maximumFractionDigits: 0,
});

export function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-DZ", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function productSummary(order: Pick<Order, "items">) {
  return order.items
    .map((item) => `${item.quantity} x ${item.productName}`)
    .join(", ");
}

export function CrmButton({
  children,
  onClick,
  disabled,
  type = "button",
  variant = "primary",
  size = "md",
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  variant?: "primary" | "ghost" | "success" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "min-h-8 px-2.5 py-1.5 text-xs",
    md: "min-h-10 px-3 py-2 text-sm",
    lg: "min-h-12 px-4 py-2.5 text-base",
  };

  const variantClasses = {
    primary: "bg-black text-white hover:bg-michket-gold hover:text-black",
    ghost: "border border-black/10 bg-white text-black hover:border-michket-gold hover:bg-michket-gold/15",
    success: "bg-emerald-600 text-white hover:bg-emerald-700",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-md font-semibold tracking-[0] transition disabled:cursor-not-allowed disabled:opacity-45",
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}

export function CrmPanel({
  children,
  className,
  title,
  actions,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  actions?: React.ReactNode;
}) {
  return (
    <section className={cx("rounded-lg border border-black/10 bg-white shadow-sm", className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
          {title && <h2 className="text-base font-bold tracking-[0]">{title}</h2>}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function CrmCard({
  children,
  className,
  onClick,
  hoverable = false,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}) {
  return (
    <div
      className={cx(
        "rounded-lg border border-black/10 bg-white p-4 shadow-sm",
        hoverable && "cursor-pointer transition-all hover:shadow-md hover:border-michket-gold/30",
        onClick && "cursor-pointer",
        className,
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CrmBadge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
}) {
  const variantClasses = {
    default: "bg-black/10 text-black",
    success: "bg-emerald-100 text-emerald-800",
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-rose-100 text-rose-800",
    info: "bg-cyan-100 text-cyan-800",
  };

  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold",
        variantClasses[variant],
      )}
    >
      {children}
    </span>
  );
}

export function Metric({
  label,
  value,
  accent,
  trend,
}: {
  label: string;
  value: string;
  accent: string;
  trend?: { value: string; positive: boolean };
}) {
  return (
    <div className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
      <div className={cx("mb-3 h-1.5 w-16 rounded-full", accent)} />
      <p className="text-xs font-semibold uppercase tracking-[0] text-black/50">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold leading-tight tracking-[0] text-black">
        {value}
      </p>
      {trend && (
        <p
          className={cx(
            "mt-2 text-xs font-semibold",
            trend.positive ? "text-emerald-600" : "text-rose-600",
          )}
        >
          {trend.positive ? "↑" : "↓"} {trend.value}
        </p>
      )}
    </div>
  );
}

export function CrmAddButton({
  onClick,
  label = "Ajouter",
  disabled = false,
}: {
  onClick: () => void;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-michket-gold hover:text-black disabled:cursor-not-allowed disabled:opacity-45"
    >
      <Plus className="h-4 w-4" />
      {label}
    </button>
  );
}

export function CrmPopup({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
          <h3 className="text-base font-bold tracking-[0]">{title}</h3>
          <button
            onClick={onClose}
            className="rounded p-1 text-black/60 hover:bg-black/10 hover:text-black transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function ViewToggle({
  view,
  onViewChange,
  type = "kanban",
}: {
  view: "list" | "kanban" | "grid";
  onViewChange: (view: "list" | "kanban" | "grid") => void;
  type?: "kanban" | "grid";
}) {
  const isList = view === "list";
  const isSecondary = type === "kanban" ? view === "kanban" : view === "grid";
  
  return (
    <div className="flex items-center gap-1 rounded-lg border border-black/10 bg-black/5 p-1">
      <button
        onClick={() => onViewChange("list")}
        className={cx(
          "rounded-md p-2 transition",
          isList
            ? "bg-white text-black shadow-sm"
            : "text-black/60 hover:text-black"
        )}
        title="Vue liste"
      >
        <List className="h-4 w-4" />
      </button>
      <button
        onClick={() => onViewChange(type === "kanban" ? "kanban" : "grid")}
        className={cx(
          "rounded-md p-2 transition",
          isSecondary
            ? "bg-white text-black shadow-sm"
            : "text-black/60 hover:text-black"
        )}
        title={type === "kanban" ? "Vue kanban" : "Vue grille"}
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
    </div>
  );
}

export function CrmSideDrawer({
  isOpen,
  onClose,
  title,
  children,
  width = "480px",
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={cx(
          "fixed inset-0 bg-black/50 z-50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      />
      
      {/* Drawer */}
      <div
        className={cx(
          "fixed right-0 top-0 h-full z-50 shadow-2xl transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div
          className="h-full bg-white border-l border-black/10 flex flex-col"
          style={{ width }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-black/10 px-6 py-4 flex-shrink-0">
            <h3 className="text-lg font-bold tracking-[0]">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-black/60 hover:bg-black/10 hover:text-black transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
