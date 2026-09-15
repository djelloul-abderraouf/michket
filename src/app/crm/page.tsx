import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "CRM",
  description: "Espace operationnel Michket CRM.",
};

export default function CRMIndexPage() {
  redirect("/crm/dashboard");
}
