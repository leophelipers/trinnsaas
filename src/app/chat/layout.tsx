import { ReactNode } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserSyncTrigger } from "@/components/dashboard/user-sync-trigger";
import { ChatLayoutWrapper } from "@/components/dashboard/chat/chat-layout-wrapper";

export const metadata = {
  title: "Kriativa Muse • Estúdio de Chat IA Multimodal",
  description:
    "Copiloto cinematográfico inteligente para decupagem, roteiros, iluminação e direção de arte",
};

export default async function ChatRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <>
      <UserSyncTrigger />
      <ChatLayoutWrapper>{children}</ChatLayoutWrapper>
    </>
  );
}
