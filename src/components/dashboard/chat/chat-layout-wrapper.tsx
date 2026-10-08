"use client";

import { useState, ReactNode } from "react";
import { useParams } from "next/navigation";
import { ChatSidebar } from "./chat-sidebar";
import { FeatureGate } from "@/components/common/feature-gate";
import { Sparkles } from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";

interface ChatLayoutWrapperProps {
  children: ReactNode;
}

export function ChatLayoutWrapper({ children }: ChatLayoutWrapperProps) {
  const params = useParams();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const conversationId = params?.conversationId as Id<"aiConversations"> | undefined;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#050506] text-zinc-100">
      <ChatSidebar
        currentConversationId={conversationId}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />
      <main className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
        <FeatureGate
          flag="chat_enabled"
          showNotice
          noticeTitle="Kriativa Muse em Otimização"
          noticeMessage="O estúdio conversacional inteligente está em processo de otimização pela equipe técnica. Retorne em instantes."
          fallback={
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#050506]">
              <div className="max-w-md p-6 rounded-2xl bg-[#0E0F14] border border-zinc-800 text-zinc-300 space-y-3 shadow-2xl backdrop-blur-xl">
                <div className="w-12 h-12 rounded-xl bg-[#FF5500]/10 border border-[#FF5500]/20 text-[#FF5500] flex items-center justify-center mx-auto">
                  <Sparkles className="size-6 animate-pulse" />
                </div>
                <h2 className="text-base font-bold text-white font-heading">
                  Kriativa Muse em Otimização
                </h2>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  O estúdio de assistência conversacional está passando por calibração de motores de renderização e inteligência. O acesso será reestabelecido em breve.
                </p>
              </div>
            </div>
          }
        >
          {children}
        </FeatureGate>
      </main>
    </div>
  );
}
