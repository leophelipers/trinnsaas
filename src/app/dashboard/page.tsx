import { currentUser } from "@clerk/nextjs/server";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { AntiAbuseBanner } from "@/components/dashboard/anti-abuse-banner";

export const metadata = {
  title: "Visão Geral do Estúdio | kriativa.app",
  description: "Painel de controle com últimas gerações, modelos utilizados, consumo da recarga e ações rápidas.",
};

export default async function DashboardPage() {
  const user = await currentUser();
  const displayName = user?.firstName || user?.fullName || "Criador";

  return (
    <div className="space-y-6">
      <AntiAbuseBanner />
      <DashboardOverview displayName={displayName} />
    </div>
  );
}
