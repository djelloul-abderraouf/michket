"use client";

import { PageHeader } from "@/components/admin/PageHeader";

export default function AdminPromotionsPage() {
  return (
    <div>
      <PageHeader
        title="Promotions"
        description="Gérez les codes promo et réductions"
        action={
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors"
            style={{
              background: "var(--admin-accent)",
              color: "#0A0A0A",
              borderRadius: "var(--admin-radius)",
              minHeight: "40px",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M7 2V12" />
              <path d="M2 7H12" />
            </svg>
            Créer une promotion
          </button>
        }
      />

      <div
        className="flex flex-col items-center justify-center py-20 text-center"
        style={{
          background: "var(--admin-surface)",
          border: "1px solid var(--admin-border)",
          borderRadius: "var(--admin-radius-lg)",
        }}
      >
        <div
          className="flex items-center justify-center w-14 h-14 rounded-xl mb-4"
          style={{ background: "var(--admin-surface-hover)" }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--admin-text-muted)" }}>
            <path d="M12 3L14.55 9.97L22 10.72L16.5 15.65L18.18 22.5L12 18.77L5.82 22.5L7.5 15.65L2 10.72L9.45 9.97L12 3Z" />
          </svg>
        </div>
        <h3
          className="text-lg font-semibold"
          style={{ color: "var(--admin-text-primary)" }}
        >
          Aucune promotion pour le moment
        </h3>
        <p
          className="mt-2 text-sm max-w-md"
          style={{ color: "var(--admin-text-secondary)" }}
        >
          Les promotions et codes promo seront gérables ici une fois connectées
          à l&apos;API backend.
        </p>
      </div>
    </div>
  );
}
