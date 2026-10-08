"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import {
  Users,
  Box,
  MapPin,
  Palette,
  Plus,
  Trash2,
  Sparkles,
  Upload,
  Check,
  Copy,
  Info,
  Layers,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ElementsManagerViewProps {
  selectedProjectId?: string | null;
  onUseElementInPrompt?: (tag: string) => void;
}

const ELEMENT_TYPES = [
  { value: "character", label: "Personagem / Ator Virtual", icon: Users, desc: "Rosto, idade, figurino e consistência facial" },
  { value: "prop", label: "Objeto / Prop de Cena", icon: Box, desc: "Veículo, item mágico, arma, acessório ou tecnologia" },
  { value: "location", label: "Cenário / Localização", icon: MapPin, desc: "Ambiente, arquitetura de interiores ou paisagem" },
  { value: "style", label: "Estilo Visual / Lente", icon: Palette, desc: "Paleta cromática, tipo de película e estética" },
] as const;

/**
 * Utilitário de compressão de imagem no browser antes do envio para evitar estourar o limite de 1 MiB do Convex
 */
async function compressImageFile(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 1280;
        let width = img.width;
        let height = img.height;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        // Múltiplos de 16 para estabilidade de tensores
        width = Math.floor(width / 16) * 16;
        height = Math.floor(height / 16) * 16;

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return resolve(file);
        }
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
          0.85
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

export function ElementsManagerView({
  selectedProjectId,
  onUseElementInPrompt,
}: ElementsManagerViewProps) {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [copiedTag, setCopiedTag] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [type, setType] = useState<"character" | "prop" | "location" | "style">("character");
  const [anchorPrompt, setAnchorPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [referenceStorageId, setReferenceStorageId] = useState<Id<"_storage"> | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const elements =
    useQuery(api.studioElements.listElements, {
      projectId: selectedProjectId ? (selectedProjectId as Id<"studioProjects">) : undefined,
      type: activeFilter === "all" ? undefined : (activeFilter as any),
    }) || [];

  const createElementMutation = useMutation(api.studioElements.createElement);
  const deleteElementMutation = useMutation(api.studioElements.deleteElement);
  const generateUploadUrl = useMutation(api.studioGenerations.generateUploadUrl);

  const handleCopyTag = (elementTag: string) => {
    navigator.clipboard.writeText(`@${elementTag}`);
    setCopiedTag(elementTag);
    setTimeout(() => setCopiedTag(null), 2000);
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      setErrorMessage(null);

      // 1. Comprime a imagem no cliente (garante < 300KB)
      const compressedBlob = await compressImageFile(file);

      // 2. Solicita signed upload URL do Convex File Storage
      const uploadUrl = await generateUploadUrl({});

      // 3. Upload direto para o Convex File Storage (bypassa limite de 1MB de mutações)
      const uploadRes = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": "image/jpeg" },
        body: compressedBlob,
      });

      if (!uploadRes.ok) {
        throw new Error("Falha ao salvar imagem de referência no armazenamento.");
      }

      const uploadJson = await uploadRes.json();
      const storageId = uploadJson.storageId as Id<"_storage">;
      setReferenceStorageId(storageId);

      // Gera preview local
      const reader = new FileReader();
      reader.onload = (evt) => {
        setPreviewUrl(evt.target?.result as string);
      };
      reader.readAsDataURL(compressedBlob);
    } catch (err: any) {
      console.error("Erro no upload de referência:", err);
      setErrorMessage(err.message || "Erro no upload da imagem de referência.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage("O nome do elemento é obrigatório.");
      return;
    }
    if (!tag.trim()) {
      setErrorMessage("A tag (@menção) é obrigatória.");
      return;
    }
    if (!anchorPrompt.trim()) {
      setErrorMessage("A descrição canônica (Âncora de Consistência) é obrigatória.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      await createElementMutation({
        projectId: selectedProjectId ? (selectedProjectId as Id<"studioProjects">) : undefined,
        name: name.trim(),
        tag: tag.trim(),
        type,
        anchorPrompt: anchorPrompt.trim(),
        negativePrompt: negativePrompt.trim() || undefined,
        referenceImageStorageId: referenceStorageId ?? undefined,
      });

      // Reset form
      setName("");
      setTag("");
      setType("character");
      setAnchorPrompt("");
      setNegativePrompt("");
      setReferenceStorageId(null);
      setPreviewUrl(null);
      setIsCreateModalOpen(false);
    } catch (err: any) {
      console.error("Erro ao criar elemento:", err);
      setErrorMessage(err.message || "Falha ao registrar elemento de consistência.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: Id<"studioElements">) => {
    if (!confirm("Deseja realmente remover este elemento da biblioteca do estúdio?")) return;
    try {
      await deleteElementMutation({ id });
    } catch (err: any) {
      console.error("Erro ao deletar:", err);
      alert(err.message || "Erro ao deletar elemento.");
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* 1. Header com Explicação e Ação Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Atores & Elementos de Cena (@mentions)
            </h1>
            <Badge
              variant="outline"
              className="border-purple-500/30 bg-purple-500/10 text-purple-400 font-mono text-[10px]"
            >
              Consistência de Identidade
            </Badge>
          </div>
          <p className="text-xs text-zinc-400 max-w-2xl">
            Crie fichas canônicas de personagens, veículos, cenários e estilos. Ao digitar{" "}
            <code className="bg-white/10 text-purple-300 px-1 py-0.5 rounded text-[11px] font-mono">
              @Nome
            </code>{" "}
            no prompt do estúdio, a IA injeta automaticamente suas âncoras visuais e referências faciais.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#FF5500] hover:bg-[#FF4500] text-white gap-2 font-medium shrink-0 shadow-[0_0_20px_rgba(255,85,0,0.3)]"
        >
          <Plus className="size-4" />
          <span>Novo Elemento (@)</span>
        </Button>
      </div>

      {/* 2. Filtros por Categoria */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveFilter("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            activeFilter === "all"
              ? "bg-white text-black font-semibold"
              : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
          }`}
        >
          Todos ({elements.length})
        </button>
        {ELEMENT_TYPES.map((t) => {
          const count = elements.filter((el) => el.type === t.value).length;
          const Icon = t.icon;
          return (
            <button
              key={t.value}
              onClick={() => setActiveFilter(t.value)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeFilter === t.value
                  ? "bg-white text-black font-semibold"
                  : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <Icon className="size-3.5" />
              <span>{t.label.split("/")[0].trim()}</span>
              <span className="text-[10px] font-mono opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* 3. Grid de Elementos Salvos */}
      {elements.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] space-y-4">
          <div className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-zinc-500">
            <Users className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-white">
              Nenhum elemento consistente cadastrado
            </h3>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              Cadastre seu primeiro ator virtual, prop de cena ou local. Você poderá referenciá-los em qualquer geração usando a menção correspondente.
            </p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            variant="outline"
            className="border-white/10 text-white hover:bg-white/5 gap-2"
          >
            <Plus className="size-4" />
            <span>Criar Elemento</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {elements.map((el) => {
            const isCopied = copiedTag === el.tag;
            return (
              <div
                key={el._id}
                className="group relative rounded-2xl bg-[#0D0E12] border border-white/10 hover:border-white/20 transition-all overflow-hidden flex flex-col justify-between shadow-lg"
              >
                {/* Imagem de Referência ou Placeholder */}
                <div className="aspect-[4/3] w-full bg-black/50 relative overflow-hidden flex items-center justify-center border-b border-white/5">
                  {el.referenceImageUrl ? (
                    <img
                      src={el.referenceImageUrl}
                      alt={el.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-zinc-600 gap-1">
                      <Layers className="size-8" />
                      <span className="text-[10px] font-mono">Sem imagem âncora</span>
                    </div>
                  )}

                  {/* Badge de tipo */}
                  <div className="absolute top-2.5 left-2.5">
                    <Badge
                      variant="outline"
                      className="bg-black/80 backdrop-blur-md border-white/20 text-white text-[10px] font-mono capitalize"
                    >
                      {el.type === "character"
                        ? "Ator Virtual"
                        : el.type === "prop"
                        ? "Objeto/Prop"
                        : el.type === "location"
                        ? "Cenário"
                        : "Estilo"}
                    </Badge>
                  </div>

                  {/* Ação de Deletar */}
                  <button
                    onClick={() => handleDelete(el._id)}
                    className="absolute top-2.5 right-2.5 size-7 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-zinc-400 hover:text-red-400 hover:border-red-500/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Excluir elemento"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>

                {/* Conteúdo da Ficha Técnica */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-white truncate">{el.name}</h4>
                      <button
                        onClick={() => handleCopyTag(el.tag)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 font-mono text-[11px] font-semibold transition-colors shrink-0"
                        title="Copiar menção para o prompt"
                      >
                        {isCopied ? <Check className="size-3 text-green-400" /> : <Copy className="size-3" />}
                        <span>@{el.tag}</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-zinc-400 line-clamp-3 leading-relaxed">
                      {el.anchorPrompt}
                    </p>
                  </div>

                  {/* Botão de Inserir no Dock */}
                  {onUseElementInPrompt && (
                    <Button
                      onClick={() => onUseElementInPrompt(el.tag)}
                      variant="outline"
                      size="sm"
                      className="w-full h-7 text-[11px] font-medium border-white/10 hover:border-[#FF5500]/50 hover:bg-[#FF5500]/10 text-zinc-300 hover:text-white transition-all gap-1.5"
                    >
                      <Sparkles className="size-3 text-[#FF5500]" />
                      <span>Usar no Prompt</span>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Modal de Criação de Elemento (@) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-[#0D0E12] border border-white/15 rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Users className="size-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">
                    Cadastrar Elemento Consistente
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Defina atributos visuais estáveis para referenciar como @tag em suas cenas.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 pt-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                  {errorMessage}
                </div>
              )}

              {/* Seletor de Categoria */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-2">
                  Tipo de Elemento
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {ELEMENT_TYPES.map((t) => {
                    const Icon = t.icon;
                    const isSelected = type === t.value;
                    return (
                      <button
                        type="button"
                        key={t.value}
                        onClick={() => setType(t.value as any)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "bg-purple-500/15 border-purple-500 text-white"
                            : "bg-white/[0.03] border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        <Icon className="size-4 mb-1 text-purple-400" />
                        <div className="text-xs font-semibold text-white leading-tight">
                          {t.label.split("/")[0].trim()}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Nome e Tag */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Nome Completo do Elemento *
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!tag) {
                        setTag(
                          e.target.value
                            .replace(/[^a-zA-Z0-9]/g, "")
                            .slice(0, 16)
                        );
                      }
                    }}
                    placeholder="Ex: Elena Rostova"
                    className="bg-black/40 border-white/15 text-white placeholder:text-zinc-600 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Menção no Prompt (@tag) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-zinc-500 font-mono text-xs">
                      @
                    </span>
                    <Input
                      value={tag}
                      onChange={(e) =>
                        setTag(e.target.value.replace(/^@/, "").replace(/[^a-zA-Z0-9_]/g, ""))
                      }
                      placeholder="Elena"
                      className="bg-black/40 border-white/15 text-white pl-7 font-mono text-xs focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Upload de Imagem Âncora com Compressão Automática */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Foto de Referência Canônica (Opcional, mas Recomendada)
                </label>
                <div className="flex items-center gap-4">
                  {previewUrl ? (
                    <div className="size-20 rounded-xl overflow-hidden border border-white/20 shrink-0 relative group">
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewUrl(null);
                          setReferenceStorageId(null);
                        }}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 transition-opacity"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ) : null}

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    className="hidden"
                  />

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="border-dashed border-white/20 bg-white/[0.02] hover:bg-white/[0.05] text-xs text-zinc-300 h-16 flex-1 gap-2"
                  >
                    <Upload className="size-4 text-purple-400" />
                    <span>
                      {isUploadingImage
                        ? "Otimizando & enviando imagem..."
                        : previewUrl
                        ? "Substituir foto de referência"
                        : "Carregar foto de referência do rosto ou prop"}
                    </span>
                  </Button>
                </div>
              </div>

              {/* Âncora Descritiva do Prompt */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Descrição Canônica / Âncora de Consistência *
                </label>
                <textarea
                  value={anchorPrompt}
                  onChange={(e) => setAnchorPrompt(e.target.value)}
                  rows={3}
                  placeholder="Ex: 28-year-old woman with piercing emerald green eyes, sharp cheekbones, dark bob cut hair, wearing a sleek matte black cyberpunk leather jacket with subtle orange neon piping."
                  className="w-full bg-black/40 border border-white/15 text-xs text-white rounded-xl p-3 focus:outline-none focus:border-purple-500 placeholder:text-zinc-600 resize-none"
                />
                <span className="text-[10px] text-zinc-500">
                  Ao digitar @{tag || "tag"} no estúdio, este texto será inserido no pipeline de tensores.
                </span>
              </div>

              {/* Negative Prompt Específico */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Evitar para este elemento (Negative Prompt Opcional)
                </label>
                <Input
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder="Ex: blonde hair, glasses, smile, oversized clothing"
                  className="bg-black/40 border-white/15 text-white placeholder:text-zinc-600 text-xs focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="border-white/10 text-zinc-400 hover:text-white"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !name.trim() || !tag.trim() || !anchorPrompt.trim()}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-medium"
                >
                  {isSubmitting ? "Salvando Elemento..." : "Salvar na Biblioteca"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
