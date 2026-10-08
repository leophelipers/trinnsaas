import { ReactNode } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserSyncTrigger } from "@/components/dashboard/user-sync-trigger";

export const metadata = {
  title: "Kriativa Cinema Studio | kriativa.app",
  description:
    "Ambiente Integrado de Produção Cinematográfica com controle de atores virtuais, decupagem de câmeras e renderização de alta fidelidade.",
};

export default async function StudioRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#08090C] text-foreground flex flex-col">
      <UserSyncTrigger />
      {children}
    </div>
  );
}
