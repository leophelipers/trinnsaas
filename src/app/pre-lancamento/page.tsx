import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PreLaunchVipView } from "@/components/pre-launch/pre-launch-vip-view";
import { PreLaunchErrorBoundary } from "@/components/pre-launch/pre-launch-error-boundary";
import { resolveServerPreLaunchStatus } from "@/lib/pre-launch-session";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sala VIP de Pré-Lançamento | Kriativa.app",
  description:
    "Área exclusiva para membros cadastrados com a tag de Pré-Lançamento. Confirme seu e-mail, acesse o grupo oficial do WhatsApp e garanta seu lugar na fila.",
};

export default async function PreLancamentoPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const initialStatus = await resolveServerPreLaunchStatus().catch(() => null);

  return (
    <PreLaunchErrorBoundary>
      <PreLaunchVipView initialStatus={initialStatus} />
    </PreLaunchErrorBoundary>
  );
}
