"use client";

import { PageHeader } from "@/components/admin/PageHeader";

export default function AdminOrdersPage() {
  return (
    <div>
      <PageHeader
        title="Commandes"
        description="Suivez et traitez les commandes clients"
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
            <path d="M8 3H6C4.9 3 4 3.9 4 5V19C4 20.1 4.9 21 6 21H18C19.1 21 20 20.1 20 19V5C20 3.9 19.1 3 18 3H16" />
            <path d="M8 3H16" />
            <path d="M8 8H16" />
            <path d="M8 13H12" />
          </svg>
        </div>
        <h3
          className="text-lg font-semibold"
          style={{ color: "var(--admin-text-primary)" }}
        >
          Aucune commande pour le moment
        </h3>
        <p
          className="mt-2 text-sm max-w-md"
          style={{ color: "var(--admin-text-secondary)" }}
        >
          Les commandes clients apparaîtront ici une fois connectées à
          l&apos;API backend.
        </p>
      </div>
    </div>
  );
}
