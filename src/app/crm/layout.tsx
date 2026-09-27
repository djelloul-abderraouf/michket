"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
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
      <ThemeProvider>
        {isLogin ? children : <CrmApp />}
      </ThemeProvider>
    </AuthProvider>
  );
}
