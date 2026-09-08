"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, Mail } from "lucide-react";
import { demoUsers } from "@/lib/crm/demo-data";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate authentication delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Find user by email (demo authentication)
    const user = demoUsers.find((u) => u.email === email);

    if (!user) {
      setError("Email ou mot de passe incorrect");
      setIsLoading(false);
      return;
    }

    if (!user.active) {
      setError("Ce compte est désactivé. Contactez l'administrateur.");
      setIsLoading(false);
      return;
    }

    // For demo, any password works for existing users
    // In production, this would verify the actual password
    if (!password) {
      setError("Veuillez entrer votre mot de passe");
      setIsLoading(false);
      return;
    }

    // Successful login - redirect to dashboard
    router.push(`/crm/dashboard?user=${encodeURIComponent(user.id)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/brand/michket-logo-black.png"
              alt="Michket"
              width={200}
              height={56}
              className="h-14 w-auto"
              priority
            />
          </div>
          <p className="text-michket-gold text-sm font-semibold uppercase tracking-wider">
            Espace Équipe
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-black/5 p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-black mb-2">Connexion</h2>
            <p className="text-sm text-black/60">
              Connectez-vous pour accéder au CRM
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg">
              <p className="text-sm text-rose-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full h-11 pl-10 pr-4 rounded-lg border border-black/15 text-sm outline-none focus:border-michket-gold focus:ring-2 focus:ring-michket-gold/20 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black/40" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-4 rounded-lg border border-black/15 text-sm outline-none focus:border-michket-gold focus:ring-2 focus:ring-michket-gold/20 transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-black text-white font-semibold rounded-lg hover:bg-black/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          {/* Demo Info */}
          <div className="mt-6 pt-6 border-t border-black/10">
            <p className="text-xs text-black/50 text-center mb-2">
              Comptes de démonstration disponibles :
            </p>
            <div className="space-y-1">
              {demoUsers.filter(u => u.active).map((user) => (
                <div key={user.id} className="text-xs text-black/60 flex justify-between">
                  <span>{user.email}</span>
                  <span className="text-michket-gold font-medium">
                    {user.roles.join(", ")}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-black/40 text-center mt-2">
              (Mot de passe : n'importe quoi pour la démo)
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-black/40 mt-6">
          © 2024 Michket. Tous droits réservés.
        </p>
      </div>
    </div>
  );
}
