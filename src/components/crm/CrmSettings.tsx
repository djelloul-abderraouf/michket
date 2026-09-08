import { useState } from "react";
import { CrmPanel, CrmButton } from "./CrmUi";
import { User, Lock, Globe, Moon, Sun, Bell, Shield } from "lucide-react";

export function CrmSettings() {
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("fr");
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="space-y-6">
      {/* Profile Settings */}
      <CrmPanel title="Profil">
        <div className="space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-black/10">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-michket-gold/20 text-2xl font-bold text-michket-gold">
              JD
            </div>
            <div>
              <h3 className="text-lg font-bold text-black">John Doe</h3>
              <p className="text-sm text-black/60">john@michket.com</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
                Nom complet
              </label>
              <input
                type="text"
                defaultValue="John Doe"
                className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold focus:ring-1 focus:ring-michket-gold"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
                Email
              </label>
              <input
                type="email"
                defaultValue="john@michket.com"
                className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold focus:ring-1 focus:ring-michket-gold"
              />
            </div>
          </div>

          <CrmButton className="w-full">
            Enregistrer les modifications
          </CrmButton>
        </div>
      </CrmPanel>

      {/* Security Settings */}
      <CrmPanel title="Sécurité">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              Mot de passe actuel
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold focus:ring-1 focus:ring-michket-gold"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold focus:ring-1 focus:ring-michket-gold"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold focus:ring-1 focus:ring-michket-gold"
            />
          </div>
          <CrmButton variant="ghost" className="w-full">
            Changer le mot de passe
          </CrmButton>
        </div>
      </CrmPanel>

      {/* Appearance Settings */}
      <CrmPanel title="Apparence">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              Thème
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => setDarkMode(false)}
                className={`flex items-center gap-3 p-4 rounded-lg border transition ${
                  !darkMode
                    ? "border-michket-gold bg-michket-gold/10"
                    : "border-black/15 hover:border-black/30"
                }`}
              >
                <Sun className="h-5 w-5" />
                <span className="text-sm font-medium">Mode clair</span>
              </button>
              <button
                onClick={() => setDarkMode(true)}
                className={`flex items-center gap-3 p-4 rounded-lg border transition ${
                  darkMode
                    ? "border-michket-gold bg-michket-gold/10"
                    : "border-black/15 hover:border-black/30"
                }`}
              >
                <Moon className="h-5 w-5" />
                <span className="text-sm font-medium">Mode sombre</span>
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              Langue
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="h-10 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-michket-gold focus:ring-1 focus:ring-michket-gold bg-white"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          </div>
        </div>
      </CrmPanel>

      {/* Notifications Settings */}
      <CrmPanel title="Notifications">
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-black/10">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-black/60" />
              <div>
                <p className="text-sm font-medium text-black">Notifications email</p>
                <p className="text-xs text-black/50">Recevoir les mises à jour par email</p>
              </div>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                notifications ? "bg-michket-gold" : "bg-black/20"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                  notifications ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-black/10">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-black/60" />
              <div>
                <p className="text-sm font-medium text-black">Alertes commandes</p>
                <p className="text-xs text-black/50">Notifications pour les nouvelles commandes</p>
              </div>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                notifications ? "bg-michket-gold" : "bg-black/20"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                  notifications ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-black/60" />
              <div>
                <p className="text-sm font-medium text-black">Rappels tâches</p>
                <p className="text-xs text-black/50">Notifications pour les tâches en retard</p>
              </div>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                notifications ? "bg-michket-gold" : "bg-black/20"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                  notifications ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </CrmPanel>
    </div>
  );
}
