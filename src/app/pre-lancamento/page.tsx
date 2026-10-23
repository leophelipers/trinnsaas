import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserSyncTrigger } from "@/components/dashboard/user-sync-trigger";
import { PreLaunchVipView } from "@/components/pre-launch/pre-launch-vip-view";

export const metadata = {
  title: "Sala VIP de Pré-Lançamento | Kriativa.app",
  description:
    "Área exclusiva para membros cadastrados com a tag de Pré-Lançamento. Acesse o grupo oficial de WhatsApp e ative o Passaporte Fura-Fila.",
};

export default async function PreLancamentoPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <>
      <UserSyncTrigger />
      <PreLaunchVipView />
    </>
  );
}
