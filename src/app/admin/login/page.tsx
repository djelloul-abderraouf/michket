"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type MeResponse = {
  id: string;
  email: string;
  role: "customer" | "admin" | "super_admin";
};

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error || !data.session?.access_token) {
        setErrorMessage("Email ou mot de passe incorrect.");
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        await supabase.auth.signOut();
        setErrorMessage("La configuration API du site est manquante.");
        return;
      }

      const response = await fetch(`${apiUrl}/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${data.session.access_token}`,
        },
        cache: "no-store",
      });

      if (!response.ok) {
        await supabase.auth.signOut();
        setErrorMessage(
          "Connexion réussie, mais le profil Michket est inaccessible.",
        );
        return;
      }

      const me = (await response.json()) as MeResponse;

      if (me.role !== "admin" && me.role !== "super_admin") {
        await supabase.auth.signOut();
        setErrorMessage(
          "Ce compte n'a pas accès à l'administration Michket.",
        );
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setErrorMessage(
        "Une erreur est survenue pendant la connexion.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10" style={{ background: "var(--admin-bg)" }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center mb-10">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl" style={{ background: "var(--admin-surface)", border: "1px solid var(--admin-border)" }}>
              <span className="text-base font-bold tracking-wider" style={{ color: "var(--admin-accent)" }}>
                M
              </span>
            </div>
            <div>
              <p className="text-base font-semibold" style={{ color: "var(--admin-text-primary)" }}>
                Michket
              </p>
              <p className="text-xs" style={{ color: "var(--admin-text-muted)" }}>
                Administration
              </p>
            </div>
          </div>
        </div>

        {/* Card */}
        <section
          className="w-full p-8 sm:p-10"
          style={{
            background: "var(--admin-surface)",
            border: "1px solid var(--admin-border)",
            borderRadius: "var(--admin-radius-lg)",
          }}
        >
          <div className="mb-8">
            <h1
              className="text-2xl font-semibold tracking-tight"
              style={{ color: "var(--admin-text-primary)" }}
            >
              Connexion
            </h1>
            <p
              className="mt-2 text-sm"
              style={{ color: "var(--admin-text-secondary)" }}
            >
              Connectez-vous avec un compte administrateur Michket.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium"
                style={{ color: "var(--admin-text-secondary)" }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full px-4 py-3 text-sm outline-none transition-colors"
                style={{
                  background: "var(--admin-bg)",
                  border: "1px solid var(--admin-border)",
                  borderRadius: "var(--admin-radius)",
                  color: "var(--admin-text-primary)",
                }}
                placeholder="admin@michket.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium"
                style={{ color: "var(--admin-text-secondary)" }}
              >
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full px-4 py-3 text-sm outline-none transition-colors"
                style={{
                  background: "var(--admin-bg)",
                  border: "1px solid var(--admin-border)",
                  borderRadius: "var(--admin-radius)",
                  color: "var(--admin-text-primary)",
                }}
                placeholder="Votre mot de passe"
              />
            </div>

            {errorMessage ? (
              <div
                role="alert"
                className="px-4 py-3 text-sm"
                style={{
                  background: "rgba(220, 53, 69, 0.1)",
                  border: "1px solid rgba(220, 53, 69, 0.2)",
                  borderRadius: "var(--admin-radius)",
                  color: "var(--admin-danger)",
                }}
              >
                {errorMessage}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                background: isLoading ? "var(--admin-surface-hover)" : "var(--admin-accent)",
                color: isLoading ? "var(--admin-text-secondary)" : "#0A0A0A",
                borderRadius: "var(--admin-radius)",
                minHeight: "44px",
              }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span
                    className="w-4 h-4 border-2 rounded-full animate-spin"
                    style={{
                      borderColor: "var(--admin-text-muted)",
                      borderTopColor: "transparent",
                    }}
                  />
                  Connexion...
                </span>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>
        </section>

        {/* Footer */}
        <p
          className="mt-8 text-center text-xs"
          style={{ color: "var(--admin-text-muted)" }}
        >
          Accès réservé aux administrateurs Michket.
        </p>
      </div>
    </main>
  );
}
