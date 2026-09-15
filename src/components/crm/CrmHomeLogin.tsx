"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { CrmButton } from "./CrmUi";

export function CrmHomeLogin() {
  const router = useRouter();
  const [message] = useState("Connecte-toi avec ton compte equipe.");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push("/crm/login");
  }

  return (
    <section className="bg-black py-6 text-white">
      <div className="container-michket">
        <form
          onSubmit={submit}
          className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end"
        >
          <div>
            <p className="text-sm font-bold uppercase tracking-[0] text-michket-gold">
              Espace equipe
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-[0]">
              Connexion CRM
            </h2>
            <p className="mt-1 text-sm text-white/65">{message}</p>
          </div>

          <CrmButton type="submit">
            <span aria-hidden="true">{"->"}</span>
            Ouvrir CRM
          </CrmButton>
        </form>
      </div>
    </section>
  );
}
