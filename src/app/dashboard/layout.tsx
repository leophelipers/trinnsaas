import { ReactNode } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserSyncTrigger } from "@/components/dashboard/user-sync-trigger";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

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
    <>
      {/* Sincronizador reativo com Convex */}
      <UserSyncTrigger />

      {/* Shell inteligente que chaveia dinamicamente para o layout imersivo no Kriativa Studio */}
      <DashboardShell>{children}</DashboardShell>
    </>
  );
}
