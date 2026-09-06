"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { demoUsers } from "@/lib/crm/demo-data";
import { CrmButton } from "./CrmUi";

export function CrmHomeLogin() {
  const router = useRouter();
  const [userId, setUserId] = useState("usr-admin");
  const [message, setMessage] = useState("Choisis un compte demo equipe.");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const user = demoUsers.find((item) => item.id === userId);

    if (!user?.active) {
      setMessage("Connexion refusee: utilisateur desactive.");
      return;
    }

    router.push(`/crm/dashboard?user=${encodeURIComponent(user.id)}`);
  }

  return (
    <section className="bg-black py-6 text-white">
      <div className="container-michket">
        <form
          onSubmit={submit}
          className="grid gap-3 md:grid-cols-[1fr_260px_auto] md:items-end"
        >
          <div>
            <p className="text-sm font-bold uppercase tracking-[0] text-michket-gold">
              Espace equipe
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-[0]">
              Connexion CRM depuis la page d&apos;accueil
            </h2>
            <p className="mt-1 text-sm text-white/65">{message}</p>
          </div>

          <label className="block text-sm font-semibold">
            Compte demo
            <select
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              className="mt-2 h-11 w-full rounded-md border border-white/20 bg-white px-3 text-sm text-black"
            >
              {demoUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.email} {user.active ? "" : "(desactive)"}
                </option>
              ))}
            </select>
          </label>

          <CrmButton type="submit">
            <span aria-hidden="true">{"->"}</span>
            Ouvrir CRM
          </CrmButton>
        </form>
      </div>
    </section>
  );
}
