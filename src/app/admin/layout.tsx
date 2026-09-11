"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  usePathname,
} from "next/navigation";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { createClient } from "@/lib/supabase/client";

type AdminProfile = {
  id: string;
  email: string;
  role: "customer" | "admin" | "super_admin";
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Keep a single Supabase client instance for the lifetime of this layout.
  const [supabase] = useState(() => createClient());

  const [profile, setProfile] =
    useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] =
    useState(true);
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const redirectToLogin = useCallback(() => {
    if (typeof window !== "undefined") {
      window.location.replace("/admin/login");
    }
  }, []);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    redirectToLogin();
  }, [redirectToLogin, supabase]);

  useEffect(() => {
    let cancelled = false;

    async function loadAdmin() {
      if (pathname === "/admin/login") {
        if (!cancelled) {
          setProfile(null);
          setIsLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setIsLoading(true);
      }

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (cancelled) return;

        if (!session?.access_token) {
          redirectToLogin();
          return;
        }

        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL;

        if (!apiUrl) {
          await supabase.auth.signOut();

          if (!cancelled) {
            redirectToLogin();
          }
          return;
        }

        const response = await fetch(
          `${apiUrl}/auth/me`,
          {
            method: "GET",
            headers: {
              Authorization:
                `Bearer ${session.access_token}`,
            },
            cache: "no-store",
          },
        );

        if (cancelled) return;

        if (!response.ok) {
          await supabase.auth.signOut();

          if (!cancelled) {
            redirectToLogin();
          }
          return;
        }

        const adminProfile =
          (await response.json()) as AdminProfile;

        if (
          adminProfile.role !== "admin" &&
          adminProfile.role !== "super_admin"
        ) {
          await supabase.auth.signOut();

          if (!cancelled) {
            redirectToLogin();
          }
          return;
        }

        if (!cancelled) {
          setProfile(adminProfile);
          setIsLoading(false);
        }
      } catch {
        await supabase.auth.signOut();

        if (!cancelled) {
          redirectToLogin();
        }
      }
    }

    void loadAdmin();

    return () => {
      cancelled = true;
    };
  }, [pathname, redirectToLogin, supabase]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#f6f4ef]">
        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-black/10 bg-white shadow-sm">
              <span className="text-lg font-semibold tracking-[-0.04em] text-neutral-950">
                M
              </span>
            </div>

            <div
              className="h-7 w-7 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-950"
              aria-hidden="true"
            />

            <p className="mt-4 text-sm font-medium text-neutral-600">
              Ouverture de l’espace administrateur
            </p>

            <p className="mt-1 text-xs text-neutral-400">
              Vérification de votre session…
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="admin-layout min-h-screen bg-[#f6f4ef] text-neutral-950">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="admin-main min-w-0">
        <AdminHeader
          email={profile?.email ?? ""}
          role={profile?.role ?? ""}
          onLogout={handleLogout}
          onMenuToggle={() =>
            setSidebarOpen((current) => !current)
          }
        />

        <main
          id="admin-main-content"
          className="admin-content relative min-w-0"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.9),transparent_62%)]"
          />

          <div className="relative mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
