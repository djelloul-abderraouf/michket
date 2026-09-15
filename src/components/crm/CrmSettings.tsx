import { useState } from "react";
import { CrmPanel } from "./CrmUi";
import type { CrmUser } from "@/lib/crm/types";
import { Bell, Moon, Sun } from "lucide-react";

export function CrmSettings({ user }: { user: CrmUser }) {
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("fr");
  const [notifications, setNotifications] = useState(true);
  const initials = (user.name || user.email || "M").charAt(0).toUpperCase();

  return (
    <div className="space-y-6">
      <CrmPanel title="Profil">
        <div className="space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-black/10">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-michket-gold/20 text-2xl font-bold text-michket-gold">
              {initials}
            </div>
            <div>
              <h3 className="text-lg font-bold text-black">{user.name}</h3>
              <p className="text-sm text-black/60">{user.email}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
                Nom complet
              </label>
              <input
                type="text"
                value={user.name}
                readOnly
                className="h-10 w-full rounded-lg border border-black/15 bg-black/[0.02] px-3 text-sm outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
                Email
              </label>
              <input
                type="email"
                value={user.email}
                readOnly
                className="h-10 w-full rounded-lg border border-black/15 bg-black/[0.02] px-3 text-sm outline-none"
              />
            </div>
          </div>

          <p className="text-sm text-black/50">
            Le profil est synchronise depuis le compte equipe. Les modifications de role se font dans Utilisateurs.
          </p>
        </div>
      </CrmPanel>

      <CrmPanel title="Apparence">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/60">
              Theme
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
              <option value="fr">Francais</option>
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          </div>
        </div>
      </CrmPanel>

      <CrmPanel title="Notifications">
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-black/60" />
              <div>
                <p className="text-sm font-medium text-black">Notifications email</p>
                <p className="text-xs text-black/50">Recevoir les mises a jour par email</p>
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
