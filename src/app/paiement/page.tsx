import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Paiement | Michket",
  description: "Finalisez votre commande en toute sécurité.",
};

export default function PaymentPage() {
  redirect("/checkout");
}
