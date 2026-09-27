"use client";

import { useEffect, useState } from "react";

import { PageHeader } from "@/components/admin/PageHeader";
import { createClient } from "@/lib/supabase/client";

type Role = "customer" | "admin" | "super_admin" | "social_media";

type UserRow = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: Role;
  isActive: boolean;
};

const ROLE_LABELS: Record<Role, string> = {
  customer: "Client",
  admin: "Administrateur",
  super_admin: "Super admin",
  social_media: "Social media",
};

export default function AdminUsersPage() {
  const [supabase] = useState(() => createClient());
  const [rows, setRows] = useState<UserRow[]>([]);
  const [canEdit, setCanEdit] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!apiUrl || !session?.access_token) return;

      const headers = { Authorization: `Bearer ${session.access_token}` };
      const [meResponse, usersResponse] = await Promise.all([
        fetch(`${apiUrl}/auth/me`, { headers, cache: "no-store" }),
        fetch(`${apiUrl}/admin/users?limit=100`, { headers, cache: "no-store" }),
      ]);

      if (!meResponse.ok || !usersResponse.ok) {
        if (!cancelled) setError("Impossible de charger les utilisateurs.");
        return;
      }

      const me = (await meResponse.json()) as { role: Role };
      const payload = (await usersResponse.json()) as { data: UserRow[] };

      if (!cancelled) {
        setCanEdit(me.role === "super_admin");
        setRows(payload.data);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  async function changeRole(userId: string, role: Role) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!apiUrl || !session?.access_token) return;

    const response = await fetch(`${apiUrl}/admin/users/${userId}/role`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role }),
    });

    if (!response.ok) {
      setError("Le rôle n'a pas pu être modifié.");
      return;
    }

    setRows((current) =>
      current.map((row) => (row.id === userId ? { ...row, role } : row)),
    );
  }

  return (
    <div>
      <PageHeader
        title="Utilisateurs"
        description="Attribuez le rôle Social media pour créer des campagnes sans accès aux commandes."
      />

      {error ? <p className="mb-4 text-sm text-red-700">{error}</p> : null}

      <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-black/10 text-xs uppercase tracking-[0.14em] text-neutral-400">
            <tr>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Nom</th>
              <th className="px-4 py-3 font-semibold">Rôle</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3">{row.email}</td>
                <td className="px-4 py-3">
                  {[row.firstName, row.lastName].filter(Boolean).join(" ") || "—"}
                </td>
                <td className="px-4 py-3">
                  {canEdit ? (
                    <select
                      value={row.role}
                      onChange={(event) =>
                        void changeRole(row.id, event.target.value as Role)
                      }
                      className="min-h-10 rounded-lg border border-black/10 bg-white px-2"
                    >
                      {(Object.keys(ROLE_LABELS) as Role[]).map((role) => (
                        <option key={role} value={role}>
                          {ROLE_LABELS[role]}
                        </option>
                      ))}
                    </select>
                  ) : (
                    ROLE_LABELS[row.role] ?? row.role
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
