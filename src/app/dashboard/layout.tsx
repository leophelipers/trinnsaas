import { ReactNode } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardSidebar, DashboardHeader } from "@/components/dashboard/dashboard-nav";
import { UserSyncTrigger } from "@/components/dashboard/user-sync-trigger";

export const metadata = {
  title: "Studio de Criação | kriativa.app",
  description:
    "Estúdio de criação de vídeo cinematográfico com controle de movimento e renderização de alta fidelidade",
};

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Verificação Server-side com Clerk: Defesa em profundidade
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sincronizador reativo com Convex */}
      <UserSyncTrigger />

      {/* Sidebar de navegação desktop */}
      <DashboardSidebar />

      {/* Área principal com header e conteúdo */}
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader />
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-6xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
