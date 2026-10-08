"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Sparkles, Plus, Film, Clapperboard, BookOpen, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ChatIndexPage() {
  const router = useRouter();
  const conversations = useQuery(api.chat.listConversations, {});
  const createConversation = useMutation(api.chat.createConversation);
  const [isCreating, setIsCreating] = useState(false);

  // Redireciona automaticamente para a conversa mais recente se existir
  useEffect(() => {
    if (conversations && conversations.length > 0) {
      router.replace(`/chat/${conversations[0]._id}`);
    }
  }, [conversations, router]);

  const handleStartFirstChat = async () => {
    setIsCreating(true);
    try {
      const newId = await createConversation({
        title: "Nova Sessão Criativa",
        activeModel: "anthropic/claude-3.7-sonnet",
        provider: "openrouter",
        systemPromptPreset: "director",
      });
      router.push(`/chat/${newId}`);
    } catch (err) {
      console.error("Erro ao criar conversa:", err);
      setIsCreating(false);
    }
  };

  if (conversations === undefined) {
    return (
      <div className="flex h-full flex-1 items-center justify-center bg-[#050506]">
        <div className="flex items-center gap-2 text-zinc-500 text-xs">
          <Sparkles className="h-4 w-4 animate-spin text-[#FF5500]" />
          <span>Carregando estúdio de criação...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 items-center justify-center p-6 bg-[#050506]">
      <div className="mx-auto max-w-lg text-center space-y-6">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF5500] to-[#E04000] text-white shadow-xl shadow-[#FF5500]/20">
          <Sparkles className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Bem-vindo ao Kriativa Muse
          </h2>
          <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
            Seu copiloto de estúdio com raciocínio cinematográfico profundo, decupagem de cenas,
            redação de roteiros e integração direta com sua esteira de vídeo.
          </p>
        </div>

        <div className="pt-2">
          <Button
            onClick={handleStartFirstChat}
            disabled={isCreating}
            className="bg-gradient-to-r from-[#FF5500] to-[#E04000] text-white hover:opacity-95 shadow-lg shadow-[#FF5500]/25 px-6 py-2.5 font-medium text-sm gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>{isCreating ? "Iniciando Estúdio..." : "Iniciar Nova Sessão"}</span>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-6 text-left max-w-md mx-auto border-t border-zinc-800/80">
          <div className="rounded-lg border border-zinc-800 bg-[#0A0B10] p-3 text-xs text-zinc-400">
            <span className="font-semibold text-white block mb-1">🎬 Decupagem de Cena</span>
            Lentes anamórficas, paletas cromáticas e movimentos de câmera.
          </div>
          <div className="rounded-lg border border-zinc-800 bg-[#0A0B10] p-3 text-xs text-zinc-400">
            <span className="font-semibold text-white block mb-1">✍️ Roteiro Master Scene</span>
            Diálogos dinâmicos, conflito e formatação para cinema.
          </div>
        </div>
      </div>
    </div>
  );
}
