"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { DashboardSidebar, DashboardHeader } from "@/components/dashboard/dashboard-nav";

interface DashboardShellProps {
  children: ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const isStudioPage = pathname.startsWith("/dashboard/studio");

  if (isStudioPage) {
    // Para o Kriativa Studio, renderiza full-viewport sem a sidebar geral e sem o header padrão,
    // pois o Studio possui sua própria sidebar dedicada (StudioSidebar) com projetos e vault.
    return (
      <div className="h-screen w-full overflow-hidden bg-[#08090C] text-foreground flex">
        {children}
      </div>
    );
  }

  const isWidePage =
    pathname.startsWith("/dashboard/vault") ||
    pathname.startsWith("/dashboard/elements") ||
    pathname.startsWith("/dashboard/scripts");

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar de navegação desktop padrão */}
      <DashboardSidebar />

      {/* Área principal com header e conteúdo */}
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader />
        <main
          className={`flex-1 p-4 sm:p-6 md:p-8 ${
            isWidePage ? "max-w-7xl" : "max-w-6xl"
          } w-full mx-auto space-y-6`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
