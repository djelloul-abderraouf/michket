"use client";

import { PageHeader } from "@/components/admin/PageHeader";

export default function AdminUsersPage() {
  return (
    <div>
      <PageHeader
        title="Utilisateurs"
        description="Gérez les comptes utilisateurs"
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
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21C4 16.58 7.58 13 12 13C16.42 13 20 16.58 20 21" />
          </svg>
        </div>
        <h3
          className="text-lg font-semibold"
          style={{ color: "var(--admin-text-primary)" }}
        >
          Aucun utilisateur pour le moment
        </h3>
        <p
          className="mt-2 text-sm max-w-md"
          style={{ color: "var(--admin-text-secondary)" }}
        >
          La liste des utilisateurs et leurs rôles seront affichés ici une fois
          connectés à l&apos;API backend.
        </p>
      </div>
    </div>
  );
}
