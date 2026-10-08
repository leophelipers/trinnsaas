"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import {
  BookOpen,
  Plus,
  Trash2,
  X,
  User,
  MapPin,
  Camera,
  Film,
  Scroll,
  Sparkles,
  Save,
  Search,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface LorebookDrawerProps {
  conversationId?: Id<"aiConversations">;
  projectId?: Id<"studioProjects">;
  isOpen: boolean;
  onClose: () => void;
  onInjectIntoPrompt?: (snippet: string) => void;
}

type CategoryType = "all" | "character" | "location" | "style_rules" | "lore";

export function LorebookDrawer({
  conversationId,
  projectId: initialProjectId,
  isOpen,
  onClose,
  onInjectIntoPrompt,
}: LorebookDrawerProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("all");
  const [selectedProjectId, setSelectedProjectId] = useState<Id<"studioProjects"> | null>(initialProjectId || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visualPromptAnchor, setVisualPromptAnchor] = useState("");
  const [addCategory, setAddCategory] = useState<"character" | "location" | "style_rules" | "lore">("character");

  const projects = useQuery(api.studioProjects.listProjects, {}) || [];
  const entries = useQuery(api.chat.listLorebookEntries, { 
    conversationId,
    projectId: selectedProjectId || undefined,
  }) || [];
  const upsertEntry = useMutation(api.chat.upsertLorebookEntry);
  const deleteEntry = useMutation(api.chat.deleteLorebookEntry);

  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      const matchesCategory = selectedCategory === "all" || e.category === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.visualPromptAnchor && e.visualPromptAnchor.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [entries, selectedCategory, searchQuery]);

  if (!isOpen) return null;

  const handleCreate = async () => {
    if (!name.trim() || !description.trim()) return;

    try {
      await upsertEntry({
        conversationId,
        projectId: selectedProjectId || undefined,
        category: addCategory,
        name: name.trim(),
        description: description.trim(),
        visualPromptAnchor: visualPromptAnchor.trim() || undefined,
      });

      setName("");
      setDescription("");
      setVisualPromptAnchor("");
      setIsAdding(false);
    } catch (err) {
      console.error("Erro ao salvar entidade no Lorebook:", err);
    }
  };

  const handleDelete = async (id: Id<"lorebookEntries">) => {
    try {
      await deleteEntry({ id });
    } catch (err) {
      console.error("Erro ao excluir do Lorebook:", err);
    }
  };

  const handleInject = (item: (typeof entries)[0]) => {
    const snippet = `[Referência de Produção: ${item.name} (${item.category})] ${item.description}${
      item.visualPromptAnchor ? ` | Âncora Óptica: ${item.visualPromptAnchor}` : ""
    }\n`;
    onInjectIntoPrompt?.(snippet);
  };

  const categoryMeta: Record<string, { label: string; icon: any }> = {
    all: { label: "Todos", icon: BookOpen },
    character: { label: "Personagens", icon: User },
    location: { label: "Cenários", icon: MapPin },
    style_rules: { label: "Lentes & Luz", icon: Camera },
    lore: { label: "Regras do Mundo", icon: Scroll },
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-zinc-800 bg-[#08090C] text-zinc-100 shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-zinc-800/80 px-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF5500]/15 text-[#FF5500]">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Bíblia de Produção</h3>
            <p className="text-[11px] text-zinc-400">Consistência e memória conectada ao projeto</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Conexão com Projetos do Estúdio */}
      <div className="p-3 border-b border-zinc-800/60 bg-[#06070A] space-y-2">
        <div className="flex items-center justify-between gap-2 p-1.5 px-2.5 rounded-xl bg-black/60 border border-white/10">
          <div className="flex items-center gap-2 text-xs text-zinc-400 shrink-0">
            <Film className="size-3.5 text-[#FF5500]" />
            <span className="text-[11px] font-mono">Projeto:</span>
          </div>
          <select
            value={selectedProjectId || ""}
            onChange={(e) => setSelectedProjectId(e.target.value ? (e.target.value as Id<"studioProjects">) : null)}
            className="bg-[#0C0D12] text-xs text-white border border-white/15 rounded-lg px-2 py-1 outline-none w-full max-w-[230px] truncate cursor-pointer hover:border-[#FF5500]"
          >
            <option value="">Todos os Projetos do Estúdio</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
          <Input
            type="text"
            placeholder="Filtrar por nome, lente ou traço..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 bg-black/60 border-zinc-800 pl-8 text-xs text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-[#FF5500]"
          />
        </div>

        {/* Pílulas de Categoria */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
          {(["all", "character", "location", "style_rules", "lore"] as CategoryType[]).map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-[#FF5500] text-white font-semibold"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                {categoryMeta[cat].label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-400">
            {filteredEntries.length} entidade(s) ativa(s)
          </span>

          {!isAdding && (
            <Button
              size="sm"
              onClick={() => setIsAdding(true)}
              className="h-7 text-xs bg-[#FF5500] hover:bg-[#E04000] text-white gap-1"
            >
              <Plus className="h-3 w-3" />
              Adicionar
            </Button>
          )}
        </div>

        {/* Formulário de Adição */}
        {isAdding && (
          <div className="rounded-xl border border-[#FF5500]/40 bg-[#12131A] p-3.5 space-y-2.5 shadow-xl">
            <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#FF5500]" />
              Nova Entrada na Bíblia
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <select
                value={addCategory}
                onChange={(e) => setAddCategory(e.target.value as any)}
                className="h-8 rounded-md bg-black/60 border border-zinc-700 px-2 text-xs text-white outline-none"
              >
                <option value="character">Personagem</option>
                <option value="location">Cenário</option>
                <option value="style_rules">Identidade Óptica / Lentes</option>
                <option value="lore">Regras do Mundo</option>
              </select>

              <Input
                placeholder="Nome da Entidade"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-8 text-xs bg-black/60 border-zinc-700"
              />
            </div>

            <textarea
              placeholder="Descrição contínua (ex: Cabelos ruivos, sobretudo escuro, cicatriz na têmpora esquerda...)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-zinc-700 bg-black/60 p-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#FF5500]"
            />

            <Input
              placeholder="Âncora Óptica / Semente Visual (ex: 85mm anamorphic lens, cyan neon lighting)"
              value={visualPromptAnchor}
              onChange={(e) => setVisualPromptAnchor(e.target.value)}
              className="h-8 text-xs bg-black/60 border-zinc-700"
            />

            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAdding(false)}
                className="h-7 text-xs text-zinc-400 hover:text-white"
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleCreate}
                className="h-7 text-xs bg-[#FF5500] hover:bg-[#E04000] text-white gap-1"
              >
                <Save className="h-3 w-3" />
                Salvar na Bíblia
              </Button>
            </div>
          </div>
        )}

        {/* Lista de Entidades */}
        {filteredEntries.length === 0 && !isAdding ? (
          <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center text-xs text-zinc-500 space-y-1">
            <p>Nenhuma entrada encontrada.</p>
            <p className="text-[11px] text-zinc-600">
              Cadastre atores, regras ópticas e cenários para que a IA mantenha continuidade total.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredEntries.map((item) => (
              <div
                key={item._id}
                className="group relative rounded-xl border border-zinc-800 bg-[#0D0E14] p-3 text-xs transition-colors hover:border-zinc-700 space-y-1.5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-white">{item.name}</span>
                    <Badge className="bg-zinc-800 text-zinc-400 text-[9px] uppercase border-none">
                      {item.category}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1">
                    {onInjectIntoPrompt && (
                      <button
                        onClick={() => handleInject(item)}
                        className="rounded bg-zinc-800/80 hover:bg-[#FF5500] hover:text-white px-1.5 py-0.5 text-[10px] text-zinc-300 transition-colors"
                        title="Citar esta referência no prompt"
                      >
                        + Citar
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(item._id)}
                      className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 transition-opacity p-1"
                      title="Excluir entidade"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-zinc-300 leading-relaxed text-[11px]">
                  {item.description}
                </p>

                {item.visualPromptAnchor && (
                  <div className="flex items-center gap-1.5 text-[10px] text-[#FF5500] bg-[#FF5500]/10 rounded px-2 py-1 border border-[#FF5500]/15">
                    <Camera className="h-2.5 w-2.5 shrink-0" />
                    <span className="truncate">{item.visualPromptAnchor}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dica de Rodapé */}
      <div className="border-t border-zinc-800/60 bg-[#050506] p-3 text-[11px] text-zinc-500 leading-relaxed">
        💡 As entidades da Bíblia de Produção são sincronizadas silenciosamente com o motor de inferência em cada interação.
      </div>
    </div>
  );
}
