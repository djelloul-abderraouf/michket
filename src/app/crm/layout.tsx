"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "@/contexts/AuthContext";
import { CrmApp } from "@/components/crm/CrmApp";

export default function CrmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLogin = pathname === "/crm/login";

  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#f4f7f3]">
        {isLogin ? children : <CrmApp />}
      </div>
    </AuthProvider>
  );
}
