"use client";

import { useState, createContext, useContext, ReactNode } from "react";
import { useParams } from "next/navigation";
import { ChatSidebar } from "./chat-sidebar";
import { FeatureGate } from "@/components/common/feature-gate";
import { Sparkles } from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";

interface ChatMobileSidebarContextType {
  isMobileSidebarOpen: boolean;
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  toggleMobileSidebar: () => void;
}

const ChatMobileSidebarContext = createContext<ChatMobileSidebarContextType>({
  isMobileSidebarOpen: false,
  openMobileSidebar: () => {},
  closeMobileSidebar: () => {},
  toggleMobileSidebar: () => {},
});

export function useChatMobileSidebar() {
  return useContext(ChatMobileSidebarContext);
}

interface ChatLayoutWrapperProps {
  children: ReactNode;
}

export function ChatLayoutWrapper({ children }: ChatLayoutWrapperProps) {
  const params = useParams();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const conversationId = params?.conversationId as Id<"aiConversations"> | undefined;

  const openMobileSidebar = () => setIsMobileSidebarOpen(true);
  const closeMobileSidebar = () => setIsMobileSidebarOpen(false);
  const toggleMobileSidebar = () => setIsMobileSidebarOpen((prev) => !prev);

  return (
    <ChatMobileSidebarContext.Provider
      value={{
        isMobileSidebarOpen,
        openMobileSidebar,
        closeMobileSidebar,
        toggleMobileSidebar,
      }}
    >
      <div className="flex h-[100dvh] max-h-[100dvh] w-full min-h-[100dvh] overflow-hidden bg-[#050506] text-zinc-100 relative">
        {/* Backdrop escuro no mobile quando o drawer da sidebar estiver aberto */}
        {isMobileSidebarOpen && (
          <div
            onClick={closeMobileSidebar}
            className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
          />
        )}

        {/* Sidebar com suporte a gaveta responsiva (Off-canvas no mobile, relativa no desktop) */}
        <div
          className={`fixed inset-y-0 left-0 z-50 h-full transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:z-30 shrink-0 ${
            isMobileSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <ChatSidebar
            currentConversationId={conversationId}
            isCollapsed={isCollapsed}
            onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
            onCloseMobile={closeMobileSidebar}
          />
        </div>

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
    </ChatMobileSidebarContext.Provider>
  );
}
