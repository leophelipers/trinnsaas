"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import {
  Sparkles,
  Plus,
  Search,
  Pin,
  PinOff,
  MoreVertical,
  Trash2,
  Edit2,
  Copy,
  ChevronLeft,
  ChevronRight,
  Coins,
  ArrowLeft,
  Film,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ChatSidebarProps {
  currentConversationId?: Id<"aiConversations">;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function ChatSidebar({
  currentConversationId,
  isCollapsed,
  onToggleCollapse,
}: ChatSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingConvId, setEditingConvId] = useState<Id<"aiConversations"> | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<Id<"aiConversations"> | null>(null);
  const [convToDelete, setConvToDelete] = useState<Id<"aiConversations"> | null>(null);
  const [isDeletingConv, setIsDeletingConv] = useState(false);

  // Queries e Mutações reativas no Convex
  const conversations = useQuery(api.chat.listConversations, {}) || [];
  const currentUser = useQuery(api.users.current);
  const userCredits = useQuery(api.credits.getMyCredits);

  const createConversation = useMutation(api.chat.createConversation);
  const renameConversation = useMutation(api.chat.renameConversation);
  const togglePin = useMutation(api.chat.togglePinConversation);
  const duplicateConversation = useMutation(api.chat.duplicateConversation);
  const deleteConversation = useMutation(api.chat.deleteConversation);

  // Verifica se o usuário tem privilégio ilimitado
  const isUnlimited = Boolean(
    currentUser?.role === "admin" || (currentUser as any)?.unlimitedAiChat
  );

  const totalCredits = userCredits?.totalCredits ?? currentUser?.customCredits ?? 0;

  // Filtragem de pesquisa
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter((c) => c.title.toLowerCase().includes(q));
  }, [conversations, searchQuery]);

  // Agrupamento temporal e de pins
  const { pinned, today, yesterday, last7Days, older } = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
    const startOfLast7Days = startOfToday - 7 * 24 * 60 * 60 * 1000;

    const p: typeof conversations = [];
    const t: typeof conversations = [];
    const y: typeof conversations = [];
    const l7: typeof conversations = [];
    const o: typeof conversations = [];

    for (const c of filteredConversations) {
      if (c.isPinned) {
        p.push(c);
        continue;
      }

      const timestamp = c.lastMessageAt || c.createdAt;
      if (timestamp >= startOfToday) {
        t.push(c);
      } else if (timestamp >= startOfYesterday) {
        y.push(c);
      } else if (timestamp >= startOfLast7Days) {
        l7.push(c);
      } else {
        o.push(c);
      }
    }

    return { pinned: p, today: t, yesterday: y, last7Days: l7, older: o };
  }, [filteredConversations]);

  // Criar nova conversa
  const handleNewChat = async () => {
    try {
      const newId = await createConversation({
        title: "Nova Sessão Criativa",
        activeModel: "anthropic/claude-3.7-sonnet",
        provider: "openrouter",
        systemPromptPreset: "director",
      });
      router.push(`/chat/${newId}`);
    } catch (err) {
      console.error("Erro ao criar sessão de chat:", err);
    }
  };

  const handleStartRename = (id: Id<"aiConversations">, currentTitle: string) => {
    setEditingConvId(id);
    setEditTitle(currentTitle);
    setActiveMenuId(null);
  };

  const handleSaveRename = async (id: Id<"aiConversations">) => {
    if (!editTitle.trim()) {
      setEditingConvId(null);
      return;
    }
    try {
      await renameConversation({ conversationId: id, title: editTitle.trim() });
    } catch (err) {
      console.error("Erro ao renomear conversa:", err);
    } finally {
      setEditingConvId(null);
    }
  };

  const handleTogglePin = async (id: Id<"aiConversations">) => {
    try {
      await togglePin({ conversationId: id });
    } catch (err) {
      console.error("Erro ao alternar pin:", err);
    } finally {
      setActiveMenuId(null);
    }
  };

  const handleDuplicate = async (id: Id<"aiConversations">) => {
    try {
      const newId = await duplicateConversation({ conversationId: id });
      router.push(`/chat/${newId}`);
    } catch (err) {
      console.error("Erro ao bifurcar sessão:", err);
    } finally {
      setActiveMenuId(null);
    }
  };

  const handleDelete = (id: Id<"aiConversations">) => {
    setConvToDelete(id);
    setActiveMenuId(null);
  };

  const handleConfirmDeleteConv = async () => {
    if (!convToDelete) return;
    setIsDeletingConv(true);
    try {
      await deleteConversation({ conversationId: convToDelete });
      if (currentConversationId === convToDelete) {
        router.push("/chat");
      }
      setConvToDelete(null);
    } catch (err) {
      console.error("Erro ao excluir conversa:", err);
    } finally {
      setIsDeletingConv(false);
      setActiveMenuId(null);
    }
  };

  // Renderizador de item de conversa individual
  const renderItem = (c: (typeof conversations)[0]) => {
    const isActive = currentConversationId === c._id || pathname === `/chat/${c._id}`;
    const isEditing = editingConvId === c._id;

    return (
      <div
        key={c._id}
        className={`group relative flex items-center justify-between rounded-lg px-2.5 py-2 text-sm transition-all duration-200 cursor-pointer ${
          isActive
            ? "bg-[#14151B] border-l-2 border-[#FF5500] text-white shadow-sm"
            : "text-zinc-400 hover:bg-[#0E0F14] hover:text-zinc-200"
        }`}
        onClick={() => {
          if (!isEditing) router.push(`/chat/${c._id}`);
        }}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {c.isPinned ? (
            <Pin className="h-3.5 w-3.5 text-[#FF5500] shrink-0 fill-[#FF5500]" />
          ) : (
            <Film className="h-3.5 w-3.5 text-zinc-500 shrink-0 group-hover:text-zinc-400" />
          )}

          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={() => handleSaveRename(c._id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveRename(c._id);
                if (e.key === "Escape") setEditingConvId(null);
              }}
              autoFocus
              className="bg-black/80 border border-zinc-700 text-xs px-1.5 py-0.5 rounded text-white outline-none w-full"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="truncate text-xs font-medium tracking-tight">
              {c.title}
            </span>
          )}
        </div>

        {/* Menu de ações de 3 pontos */}
        {!isEditing && (
          <div
            className="relative shrink-0 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() =>
                setActiveMenuId(activeMenuId === c._id ? null : c._id)
              }
              className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
              title="Ações da sessão"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </button>

            {activeMenuId === c._id && (
              <div className="absolute right-0 top-6 z-50 w-44 rounded-md border border-zinc-800 bg-[#0E0F14] p-1 shadow-xl backdrop-blur-md">
                <button
                  onClick={() => handleTogglePin(c._id)}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white"
                >
                  {c.isPinned ? (
                    <>
                      <PinOff className="h-3 w-3 text-zinc-400" />
                      Desafixar do topo
                    </>
                  ) : (
                    <>
                      <Pin className="h-3 w-3 text-[#FF5500]" />
                      Fixar no topo
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleStartRename(c._id, c.title)}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white"
                >
                  <Edit2 className="h-3 w-3 text-zinc-400" />
                  Renomear sessão
                </button>

                <button
                  onClick={() => handleDuplicate(c._id)}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white"
                >
                  <Copy className="h-3 w-3 text-zinc-400" />
                  Bifurcar (Branching)
                </button>

                <div className="my-1 border-t border-zinc-800/80" />

                <button
                  onClick={() => handleDelete(c._id)}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300"
                >
                  <Trash2 className="h-3 w-3 text-red-400" />
                  Excluir histórico
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={`relative flex flex-col border-r border-zinc-800/80 bg-[#050506] transition-all duration-300 select-none ${
        isCollapsed ? "w-16" : "w-72"
      } h-screen z-30`}
    >
      {/* Cabeçalho da Sidebar */}
      <div className="flex h-16 items-center justify-between px-3 border-b border-zinc-800/60">
        {!isCollapsed ? (
          <Link
            href="/chat"
            className="flex items-center gap-2.5 group overflow-hidden"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#FF5500] to-[#E04000] text-white shadow-md shadow-[#FF5500]/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-wide text-white group-hover:text-[#FF5500] transition-colors">
                Kriativa Muse
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                Copiloto de Criação
              </span>
            </div>
          </Link>
        ) : (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#FF5500] to-[#E04000] text-white">
            <Sparkles className="h-4 w-4" />
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
          title={isCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Botão Nova Conversa & Campo de Busca */}
      <div className="p-3 space-y-2 border-b border-zinc-800/60">
        <Button
          onClick={handleNewChat}
          className={`w-full bg-gradient-to-r from-[#FF5500] to-[#E04000] text-white hover:opacity-95 shadow-md shadow-[#FF5500]/20 transition-all font-medium ${
            isCollapsed ? "px-0 justify-center" : "justify-start gap-2"
          }`}
          size="sm"
        >
          <Plus className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span>Nova Conversa</span>}
        </Button>

        {!isCollapsed && (
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
            <Input
              type="text"
              placeholder="Buscar conversas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 bg-[#0B0C10] border-zinc-800 pl-8 text-xs text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-[#FF5500]"
            />
          </div>
        )}
      </div>

      {/* Lista de Sessões Agrupadas por Tempo */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800">
        {filteredConversations.length === 0 ? (
          <div className="px-2 py-8 text-center text-xs text-zinc-500">
            {!isCollapsed && (searchQuery ? "Nenhuma sessão encontrada." : "Nenhuma conversa ainda.")}
          </div>
        ) : (
          <>
            {/* Sessões Fixadas */}
            {pinned.length > 0 && (
              <div className="space-y-1">
                {!isCollapsed && (
                  <div className="flex items-center gap-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-[#FF5500]">
                    <Pin className="h-2.5 w-2.5 fill-[#FF5500]" />
                    Fixados
                  </div>
                )}
                <div className="space-y-0.5">{pinned.map(renderItem)}</div>
              </div>
            )}

            {/* Hoje */}
            {today.length > 0 && (
              <div className="space-y-1">
                {!isCollapsed && (
                  <div className="px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                    Hoje
                  </div>
                )}
                <div className="space-y-0.5">{today.map(renderItem)}</div>
              </div>
            )}

            {/* Ontem */}
            {yesterday.length > 0 && (
              <div className="space-y-1">
                {!isCollapsed && (
                  <div className="px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                    Ontem
                  </div>
                )}
                <div className="space-y-0.5">{yesterday.map(renderItem)}</div>
              </div>
            )}

            {/* Últimos 7 dias */}
            {last7Days.length > 0 && (
              <div className="space-y-1">
                {!isCollapsed && (
                  <div className="px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                    Últimos 7 dias
                  </div>
                )}
                <div className="space-y-0.5">{last7Days.map(renderItem)}</div>
              </div>
            )}

            {/* Anteriores */}
            {older.length > 0 && (
              <div className="space-y-1">
                {!isCollapsed && (
                  <div className="px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                    Anteriores
                  </div>
                )}
                <div className="space-y-0.5">{older.map(renderItem)}</div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Rodapé da Sidebar: Saldo & Retorno ao Studio Geral */}
      <div className="border-t border-zinc-800/80 bg-[#07080A] p-3 space-y-2">
        {!isCollapsed ? (
          <div className="flex items-center justify-between rounded-lg bg-[#0E0F14] border border-zinc-800/80 px-2.5 py-2">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-[#FF5500]" />
              <div className="flex flex-col">
                <span className="text-[11px] font-medium text-zinc-300">
                  {isUnlimited ? "Uso Ilimitado" : "Saldo Criativo"}
                </span>
                <span className="text-xs font-semibold text-white">
                  {isUnlimited ? "∞ Sem Desconto" : `${totalCredits} créditos`}
                </span>
              </div>
            </div>

            {isUnlimited ? (
              <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px]">
                VIP
              </Badge>
            ) : (
              <Link
                href="/dashboard/credits"
                className="text-[11px] text-[#FF5500] hover:underline font-medium"
              >
                + Recarregar
              </Link>
            )}
          </div>
        ) : (
          <div className="flex justify-center">
            <Link href="/dashboard/credits" title="Ver saldo de créditos">
              <Coins className="h-4 w-4 text-[#FF5500]" />
            </Link>
          </div>
        )}

        <Link
          href="/dashboard"
          className={`flex items-center rounded-lg px-2.5 py-1.5 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors ${
            isCollapsed ? "justify-center" : "gap-2"
          }`}
          title="Voltar ao Studio Principal"
        >
          <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
          {!isCollapsed && <span>Voltar ao Studio Principal</span>}
        </Link>
      </div>

      {/* Modal de Confirmação de Exclusão da Sessão Criativa */}
      {convToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm bg-[#0C0D12] border border-red-500/30 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center gap-2.5 text-red-500">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
                <Trash2 className="h-4 w-4 text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Excluir Sessão Criativa?</h3>
                <p className="text-[11px] text-zinc-400">Esta ação é irreversível.</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed font-sans">
              Você está prestes a excluir permanentemente esta sessão e todo o histórico de mensagens, respostas e artefatos vinculados.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setConvToDelete(null)}
                disabled={isDeletingConv}
                className="border-zinc-800 bg-[#14151B] text-zinc-300 hover:text-white text-xs h-8"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleConfirmDeleteConv}
                disabled={isDeletingConv}
                className="bg-red-600 hover:bg-red-700 text-white text-xs h-8 px-3 cursor-pointer"
              >
                {isDeletingConv ? "Excluindo..." : "Confirmar Exclusão"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
