"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Sparkles,
  Plus,
  Film,
  Clapperboard,
  BookOpen,
  Code2,
  Palette,
  ArrowRight,
  Send,
  Zap,
  Activity,
  Sliders,
  Terminal,
  Loader2,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatMobileSidebar } from "@/components/dashboard/chat/chat-layout-wrapper";

export default function ChatIndexPage() {
  const router = useRouter();
  const { openMobileSidebar } = useChatMobileSidebar();
  const conversations = useQuery(api.chat.listConversations, {});
  const aiSettings = useQuery(api.chat.getAiSettings);
  const createConversation = useMutation(api.chat.createConversation);
  const saveUserMessage = useMutation(api.chat.saveUserMessage);

  const [isCreating, setIsCreating] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState("");

  // Redireciona automaticamente para a conversa mais recente se existir
  useEffect(() => {
    if (conversations && conversations.length > 0) {
      router.replace(`/chat/${conversations[0]._id}`);
    }
  }, [conversations, router]);

  const handleStartChatWithPreset = async (
    title: string,
    preset: "director" | "screenwriter" | "developer" | "art_director" | "general",
    promptText?: string
  ) => {
    setIsCreating(true);
    try {
      const defaultModel = (aiSettings as any)?.chatDefaultModel || (aiSettings as any)?.defaultModelText || "meta-llama/llama-3.3-70b-instruct:free";
      const defaultProvider = (aiSettings as any)?.chatProvider || (aiSettings as any)?.activeProvider || "openrouter";

      const newId = await createConversation({
        title,
        activeModel: defaultModel,
        provider: defaultProvider,
        systemPromptPreset: preset,
      });

      if (promptText?.trim()) {
        await saveUserMessage({
          conversationId: newId,
          content: promptText.trim(),
        });
      }

      router.push(`/chat/${newId}`);
    } catch (err) {
      console.error("Erro ao criar conversa:", err);
      setIsCreating(false);
    }
  };

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialPrompt.trim() || isCreating) return;
    handleStartChatWithPreset("Nova Sessão Criativa", "general", initialPrompt);
  };

  if (conversations === undefined) {
    return (
      <div className="flex h-full flex-1 items-center justify-center bg-[#050507]">
        <div className="flex items-center gap-2.5 text-neutral-400 text-xs font-mono">
          <Loader2 className="h-4 w-4 animate-spin text-[#FF5500]" />
          <span>Sincronizando Estúdio Convex em tempo real...</span>
        </div>
      </div>
    );
  }

  const QUICK_PRESETS = [
    {
      id: "developer",
      icon: Code2,
      title: "Software & Código",
      description: "TypeScript, Python, arquitetura de sistemas, depuração e shaders GLSL.",
      preset: "developer" as const,
      color: "from-blue-500/20 to-transparent",
      badge: "Engenharia",
    },
    {
      id: "screenwriter",
      icon: Clapperboard,
      title: "Roteiro & Escrita",
      description: "Estrutura Master Scene, redação técnica, ensaios profundos e artigos.",
      preset: "screenwriter" as const,
      color: "from-amber-500/20 to-transparent",
      badge: "Redação",
    },
    {
      id: "general",
      icon: Sparkles,
      title: "Raciocínio & Soluções",
      description: "Análise analítica, lógica, resolução de problemas complexos e pesquisas.",
      preset: "general" as const,
      color: "from-emerald-500/20 to-transparent",
      badge: "Geral",
    },
    {
      id: "director",
      icon: Film,
      title: "Estúdio Multimídia",
      description: "Geração e edição de imagens e vídeos a partir de texto, imagem ou referência.",
      preset: "director" as const,
      color: "from-[#FF5500]/20 to-transparent",
      badge: "Multimodal",
    },
  ];

  return (
    <div className="flex flex-col h-full flex-1 bg-[#050507] text-[#F8FAFC] relative overflow-hidden">
      {/* Mobile Top Header */}
      <div className="md:hidden flex h-14 items-center justify-between px-4 border-b border-white/10 bg-[#07080D]/90 backdrop-blur-xl shrink-0 z-20">
        <button
          onClick={openMobileSidebar}
          className="p-2 rounded-xl bg-white/[0.04] border border-white/10 text-neutral-300 hover:text-white"
          title="Abrir menu de conversas"
        >
          <Menu className="size-4" />
        </button>
        <span className="font-heading font-extrabold text-xs tracking-tight uppercase text-white">
          Kriativa<span className="text-[#FF5500]"> AI</span>
        </span>
        <div className="w-8" />
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative overflow-y-auto">
        {/* Background Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(255,85,0,0.10),transparent_70%)] pointer-events-none" />

        <div className="mx-auto max-w-2xl w-full text-center space-y-8 relative z-10">
        {/* Top Status Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-[11px] font-mono text-neutral-400 shadow-sm">
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white font-medium">Kriativa AI 2.0</span>
          <span className="text-white/20">•</span>
          <span className="text-neutral-400">Plataforma Generalista</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-3">
          <div className="size-16 rounded-2xl bg-gradient-to-br from-[#FF5500] via-[#FF4500] to-[#CC3700] text-white flex items-center justify-center font-heading font-black text-2xl shadow-[0_0_30px_rgba(255,85,0,0.35)] border border-white/20 mx-auto">
            <Sparkles className="size-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight text-white">
            Como posso ajudar você hoje?
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto leading-relaxed">
            Assistente multimodal completo para programação, raciocínio lógico, redação e geração de imagens e vídeos em alta fidelidade.
          </p>
        </div>

        {/* Caixa de Prompt Imediata */}
        <form onSubmit={handlePromptSubmit} className="relative max-w-xl mx-auto">
          <div className="relative rounded-2xl bg-[#0C0D15]/95 border border-white/10 hover:border-white/20 focus-within:border-[#FF5500]/60 transition-all p-3 shadow-2xl backdrop-blur-xl">
            <input
              type="text"
              value={initialPrompt}
              onChange={(e) => setInitialPrompt(e.target.value)}
              placeholder="Pergunte algo, solicite código ou descreva uma imagem/vídeo..."
              disabled={isCreating}
              className="w-full bg-transparent px-2 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none"
            />
            <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] mt-1 px-1">
              <span className="text-[10px] font-mono text-neutral-500">
                Pressione <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-400">Enter ↵</kbd> para enviar
              </span>
              <Button
                type="submit"
                disabled={!initialPrompt.trim() || isCreating}
                size="sm"
                className="h-8.5 px-3.5 bg-gradient-to-r from-[#FF5500] to-[#E64D00] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(255,85,0,0.3)] hover:brightness-110 gap-1.5 cursor-pointer"
              >
                {isCreating ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <>
                    <span>Iniciar</span>
                    <ArrowRight className="size-3.5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* Grade de 4 Presets de Início Rápido (1-Click) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto pt-2">
          {QUICK_PRESETS.map((preset) => {
            const Icon = preset.icon;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() =>
                  handleStartChatWithPreset(
                    preset.title,
                    preset.preset
                  )
                }
                disabled={isCreating}
                className="group relative flex flex-col text-left p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="size-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#FF5500] group-hover:bg-[#FF5500]/10 transition-colors">
                    <Icon className="size-4" />
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider px-2 py-0.5 rounded bg-white/5">
                    {preset.badge}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white uppercase tracking-tight group-hover:text-[#FF5500] transition-colors">
                  {preset.title}
                </h3>
                <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
      </div>
    </div>
  );
}
