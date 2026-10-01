"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type DashboardStats = {
  totalOrders: number;
  pendingOrders: number;
  totalRevenueCents: number;
  totalProducts: number;
  activeCampaigns: number;
};

const ACTIONS = [
  {
    title: "Pixels",
    description: "Ajouter un pixel Meta ou TikTok et le relier aux campagnes.",
    href: "/admin/pixels",
  },
  {
    title: "Campagnes",
    description: "Créer une page de commande, choisir les produits et les pixels.",
    href: "/admin/campaigns",
  },
  {
    title: "Produits",
    description: "Ajouter un modèle, ses couleurs et son prix.",
    href: "/admin/products",
  },
  {
    title: "Catégories",
    description: "Organiser les familles et les sous-catégories.",
    href: "/admin/categories",
  },
  {
    title: "Commandes",
    description: "Suivre les commandes reçues depuis le site.",
    href: "/admin/orders",
  },
];

function formatDA(cents: number) {
  return (
    new Intl.NumberFormat("fr-DZ", { maximumFractionDigits: 0 }).format(
      cents / 100,
    ) + " DA"
  );
}

export default function AdminDashboardPage() {
  const [supabase] = useState(() => createClient());
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!apiUrl || !session?.access_token) return;

      const response = await fetch(`${apiUrl}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
        cache: "no-store",
      });

      if (!response.ok) {
        if (!cancelled) setError("Les indicateurs n'ont pas pu être chargés.");
        return;
      }

      const body = (await response.json()) as DashboardStats;
      if (!cancelled) setStats(body);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const cards = [
    { label: "Produits actifs", value: stats ? String(stats.totalProducts) : "…" },
    { label: "Commandes", value: stats ? String(stats.totalOrders) : "…" },
    { label: "En attente", value: stats ? String(stats.pendingOrders) : "…" },
    {
      label: "Campagnes actives",
      value: stats ? String(stats.activeCampaigns) : "…",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-3xl border border-black/[0.07] bg-[#171714] px-5 py-7 text-white sm:px-8 sm:py-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">
          Michket
        </p>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.04em]">
              Tableau de bord
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/60">
              Catalogue, campagnes et commandes au même endroit.
              {stats ? ` ${formatDA(stats.totalRevenueCents)} déjà livrés.` : ""}
            </p>
          </div>
          <Link
            href="/admin/campaigns"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#ECAB1C] px-4 text-sm font-bold text-[#251713]"
          >
            Nouvelle campagne
          </Link>
        </div>
      </section>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article
            key={card.label}
            className="rounded-2xl border border-[#E5E1D8] bg-white px-5 py-5 shadow-[0_1px_2px_rgba(23,23,20,0.04)]"
          >
            <p className="text-sm text-[#5F5C55]">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#171714]">
              {card.value}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex min-h-[140px] flex-col justify-between rounded-2xl border border-[#E5E1D8] bg-white p-5 shadow-[0_1px_2px_rgba(23,23,20,0.04)] transition hover:-translate-y-0.5 hover:border-[#171714]"
          >
            <span className="text-sm font-semibold text-[#171714]">{action.title}</span>
            <span className="text-xs leading-5 text-[#918C82]">{action.description}</span>
          </Link>
        ))}
      </section>
    </div>
  );
}
