"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import {
  Film,
  Image as ImageIcon,
  Video as VideoIcon,
  Download,
  Trash2,
  Eye,
  Sparkles,
  Search,
  Filter,
  Clock,
  Coins,
  Check,
  Copy,
  ExternalLink,
  Play,
  RotateCcw,
  Sliders,
  Volume2,
  X,
  Layers,
  ArrowRight,
  HardDrive,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface MediaVaultProps {
  projectId?: string | null;
  onSelectForAnimation?: (imageUrl: string, prompt?: string) => void;
  onReuseParameters?: (generation: any) => void;
  onSwitchToStudio?: () => void;
  onSaveAsElement?: (item: any) => void;
}

export function MediaVault({
  projectId,
  onSelectForAnimation,
  onReuseParameters,
  onSwitchToStudio,
  onSaveAsElement,
}: MediaVaultProps) {
  // Estado de Filtros e Busca
  const [filterType, setFilterType] = useState<"all" | "image" | "video">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<Id<"studioGenerations"> | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Consultas e Mutações Convex
  const myGenerations = useQuery(api.studioGenerations.listMyGenerations, {
    projectId: projectId || undefined,
    limit: 100,
  });
  const deleteGenMutation = useMutation(api.studioGenerations.deleteGeneration);

  // Mídias filtradas
  const filteredGenerations = useMemo(() => {
    if (!myGenerations) return [];
    return myGenerations.filter((item: any) => {
      // Filtro por tipo
      if (filterType !== "all" && item.type !== filterType) {
        return false;
      }
      // Filtro por busca (prompt ou motor)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesPrompt = item.prompt?.toLowerCase().includes(query);
        const matchesEngine = item.engine?.toLowerCase().includes(query);
        if (!matchesPrompt && !matchesEngine) return false;
      }
      return true;
    });
  }, [myGenerations, filterType, searchQuery]);

  // Estatísticas do Cofre
  const stats = useMemo(() => {
    if (!myGenerations) return { total: 0, images: 0, videos: 0 };
    return {
      total: myGenerations.length,
      images: myGenerations.filter((g: any) => g.type === "image").length,
      videos: myGenerations.filter((g: any) => g.type === "video").length,
    };
  }, [myGenerations]);

  // Copiar texto para área de transferência
  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Download direto do arquivo
  const handleDownloadFile = async (url: string, filename: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename || "kriativa_media";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error("Erro ao baixar arquivo:", err);
      // Fallback: abrir em nova aba
      window.open(url, "_blank");
    }
  };

  // Exclusão permanente
  const handleDeleteGeneration = async (id: Id<"studioGenerations">, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm("Tem certeza que deseja excluir esta mídia permanentemente do seu cofre? O arquivo será removido do armazenamento.")) {
      return;
    }
    try {
      setIsDeletingId(id);
      await deleteGenMutation({ generationId: id });
      if (selectedItem?._id === id) {
        setSelectedItem(null);
      }
    } catch (err) {
      console.error("Erro ao excluir geração:", err);
    } finally {
      setIsDeletingId(null);
    }
  };

  // Rótulo amigável para motores de renderização
  const getEngineBadge = (engine: string) => {
    switch (engine) {
      case "krea2_turbo":
        return <Badge className="bg-[#FF5500]/15 text-[#FF5500] border-[#FF5500]/30 font-mono text-[10px]">Krea-2 Turbo</Badge>;
      case "fasth3_i2v":
        return <Badge className="bg-[#00E5FF]/15 text-[#00E5FF] border-[#00E5FF]/30 font-mono text-[10px]">FastH3 (I2V)</Badge>;
      case "fasth3_t2v_480p":
        return <Badge className="bg-[#00E5FF]/15 text-[#00E5FF] border-[#00E5FF]/30 font-mono text-[10px]">FastH3 (T2V 480p)</Badge>;
      case "fasth3_t2v_720p":
        return <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 font-mono text-[10px]">FastH3 (T2V HD)</Badge>;
      case "ltx25_i2v":
        return <Badge className="bg-purple-500/15 text-purple-300 border-purple-500/30 font-mono text-[10px]">LTX-2.5 Cinema</Badge>;
      default:
        return <Badge variant="outline" className="font-mono text-[10px]">{engine}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6 text-neutral-100 min-h-[calc(100vh-6rem)]">
      {/* BARRA SUPERIOR: RESUMO DO COFRE E ESTATÍSTICAS */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-[#00E5FF]" />
            Cofre de Mídias Salvas
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Seus arquivos renderizados são armazenados de forma permanente e criptografada em nuvem, prontos para download e reprodução.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Card de contagem */}
          <div className="flex items-center gap-4 bg-[#08090C] border border-white/10 px-4 py-2 rounded-xl text-xs">
            <div className="flex items-center gap-1.5">
              <Film className="h-4 w-4 text-[#FF5500]" />
              <span className="text-white font-bold">{stats.total}</span>
              <span className="text-neutral-500">totais</span>
            </div>
            <div className="w-[1px] h-4 bg-white/10" />
            <div className="flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5 text-neutral-400" />
              <span className="text-white font-bold">{stats.images}</span>
            </div>
            <div className="w-[1px] h-4 bg-white/10" />
            <div className="flex items-center gap-1.5">
              <VideoIcon className="h-3.5 w-3.5 text-[#00E5FF]" />
              <span className="text-white font-bold">{stats.videos}</span>
            </div>
          </div>

          {onSwitchToStudio && (
            <Button
              onClick={onSwitchToStudio}
              className="bg-[#FF5500] hover:bg-[#ff6611] text-white font-bold text-xs h-9 px-4 rounded-xl shadow-lg shadow-[#FF5500]/20 flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Novo Render no Estúdio
            </Button>
          )}
        </div>
      </div>

      {/* BARRA DE FILTROS E BUSCA */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#08090C] border border-white/10 p-3 rounded-2xl">
        {/* Abas de Categoria */}
        <div className="flex items-center gap-1.5 bg-[#050506] p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterType === "all"
                ? "bg-white/15 text-white shadow"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Todas as Mídias ({stats.total})
          </button>
          <button
            onClick={() => setFilterType("video")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterType === "video"
                ? "bg-[#00E5FF]/20 text-[#00E5FF] shadow"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <VideoIcon className="h-3.5 w-3.5" />
            Vídeos com Áudio ({stats.videos})
          </button>
          <button
            onClick={() => setFilterType("image")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterType === "image"
                ? "bg-[#FF5500]/20 text-[#FF5500] shadow"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5" />
            Imagens HD ({stats.images})
          </button>
        </div>

        {/* Input de Busca */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por prompt ou motor..."
            className="pl-9 h-9 text-xs bg-[#050506] border-white/10 text-white rounded-xl placeholder:text-neutral-500 focus-visible:ring-1 focus-visible:ring-[#FF5500]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* GRADE DE MÍDIAS DO COFRE */}
      {filteredGenerations.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-[#08090C] border border-white/10 rounded-2xl min-h-[350px]">
          <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center text-neutral-400 border border-white/10 mb-4">
            <HardDrive className="h-8 w-8 text-neutral-500" />
          </div>
          <h3 className="text-base font-bold text-neutral-200">
            {searchQuery || filterType !== "all"
              ? "Nenhuma mídia encontrada com estes filtros"
              : "Seu Cofre de Mídias está vazio"}
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mt-1 mb-6">
            {searchQuery || filterType !== "all"
              ? "Tente buscar por outros termos ou redefinir os filtros acima."
              : "As imagens e vídeos que você renderizar no estúdio serão automaticamente armazenados aqui para download e reprodução futura."}
          </p>
          {onSwitchToStudio && (
            <Button
              onClick={onSwitchToStudio}
              className="bg-[#FF5500] hover:bg-[#ff6611] text-white text-xs font-bold px-5 h-10 rounded-xl"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Renderizar Minha Primeira Cena
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredGenerations.map((gen: any) => {
            const isVideo = gen.type === "video";
            const fileExt = isVideo ? "mp4" : "png";
            const filename = gen.outputFilename
              ? `${gen.outputFilename}.${fileExt}`
              : `kriativa_${gen.engine}_${gen._id.slice(-6)}.${fileExt}`;

            return (
              <Card
                key={gen._id}
                onClick={() => setSelectedItem(gen)}
                className="bg-[#08090C] border-white/10 hover:border-white/30 rounded-2xl overflow-hidden shadow-xl transition-all duration-200 group flex flex-col cursor-pointer"
              >
                {/* PREVIEW VISUAL */}
                <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                  {gen.outputUrl ? (
                    isVideo ? (
                      <video
                        src={gen.outputUrl}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        muted
                        loop
                        onMouseEnter={(e) => (e.target as HTMLVideoElement).play().catch(() => {})}
                        onMouseLeave={(e) => {
                          const v = e.target as HTMLVideoElement;
                          v.pause();
                          v.currentTime = 0;
                        }}
                      />
                    ) : (
                      <img
                        src={gen.outputUrl}
                        alt="Render"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    )
                  ) : (
                    <div className="flex flex-col items-center justify-center text-neutral-500 gap-1 text-xs font-mono">
                      <Clock className="h-5 w-5 animate-pulse text-[#FF5500]" />
                      <span>{gen.status}</span>
                    </div>
                  )}

                  {/* Badges Flutuantes Superiores */}
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
                    {getEngineBadge(gen.engine)}
                    {isVideo && (
                      <Badge className="bg-black/60 backdrop-blur-md text-white border-white/10 font-mono text-[9px] px-1.5 py-0 flex items-center gap-1">
                        <Volume2 className="h-2.5 w-2.5 text-[#00E5FF]" />
                        {gen.durationSeconds ? `${gen.durationSeconds.toFixed(1)}s` : "Vídeo"}
                      </Badge>
                    )}
                  </div>

                  {/* Botão Hover de Play / Abrir */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200 z-10">
                    <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-lg">
                      {isVideo ? <Play className="h-5 w-5 fill-white" /> : <Eye className="h-5 w-5" />}
                    </div>
                  </div>

                  {/* Resolução no canto inferior direito */}
                  {gen.width && gen.height && (
                    <div className="absolute bottom-2 right-2 z-10">
                      <span className="bg-black/70 backdrop-blur-md text-neutral-300 font-mono text-[9px] px-1.5 py-0.5 rounded border border-white/10">
                        {gen.width}x{gen.height}
                      </span>
                    </div>
                  )}
                </div>

                {/* CONTEÚDO E METADADOS */}
                <CardContent className="p-3 flex-1 flex flex-col justify-between gap-2.5 bg-[#08090C]">
                  <div>
                    {/* Prompt Preview */}
                    <p className="text-xs text-neutral-300 line-clamp-2 font-medium" title={gen.prompt}>
                      {gen.prompt}
                    </p>

                    {/* Data e Detalhes */}
                    <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono mt-2">
                      <span>
                        {new Date(gen.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span>{gen.creditsCharged} Cr</span>
                    </div>
                  </div>

                  {/* BARRA DE AÇÕES DO CARD */}
                  <div className="flex items-center justify-between border-t border-white/10 pt-2 gap-1" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      {/* Baixar */}
                      {gen.outputUrl && (
                        <button
                          onClick={(e) => handleDownloadFile(gen.outputUrl, filename, e)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition"
                          title="Baixar arquivo em alta qualidade"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {/* Animar com I2V (se for imagem) */}
                      {!isVideo && gen.outputUrl && onSelectForAnimation && (
                        <button
                          onClick={() => onSelectForAnimation(gen.outputUrl, gen.prompt)}
                          className="p-1.5 rounded-lg text-[#00E5FF] hover:bg-[#00E5FF]/10 transition flex items-center gap-1 text-[11px]"
                          title="Animar esta imagem no Kriativa Studio (I2V)"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {/* Reutilizar Parâmetros */}
                      {onReuseParameters && (
                        <button
                          onClick={() => onReuseParameters(gen)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition"
                          title="Carregar parâmetros no estúdio de criação"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {/* Copiar Prompt */}
                      <button
                        onClick={() => handleCopyText(gen.prompt, gen._id)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition"
                        title="Copiar prompt"
                      >
                        {copiedId === gen._id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>

                    {/* Excluir do Cofre */}
                    <button
                      onClick={(e) => handleDeleteGeneration(gen._id, e)}
                      disabled={isDeletingId === gen._id}
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition"
                      title="Excluir permanentemente"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* MODAL THEATER CINEMA / PLAYER EXPANDIDO */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#08090C] border border-white/15 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden shadow-2xl">
            {/* ÁREA DE EXIBIÇÃO DE MÍDIA (ESQUERDA) */}
            <div className="flex-1 bg-black flex items-center justify-center p-6 relative min-h-[300px]">
              {selectedItem.outputUrl ? (
                selectedItem.type === "video" ? (
                  <video
                    src={selectedItem.outputUrl}
                    controls
                    autoPlay
                    loop
                    playsInline
                    className="max-h-[75vh] w-auto max-w-full rounded-xl shadow-2xl object-contain"
                  />
                ) : (
                  <img
                    src={selectedItem.outputUrl}
                    alt={selectedItem.prompt}
                    className="max-h-[75vh] w-auto max-w-full rounded-xl shadow-2xl object-contain"
                  />
                )
              ) : (
                <div className="text-neutral-500 font-mono text-sm">Mídia em processamento...</div>
              )}

              {/* Botão Fechar Flutuante */}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 left-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 border border-white/10 md:hidden"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* PAINEL LATERAL DE INFORMAÇÕES E AÇÕES (DIREITA) */}
            <div className="w-full md:w-96 border-t md:border-t-0 md:border-l border-white/10 bg-[#050506] p-6 flex flex-col justify-between gap-5 overflow-y-auto max-h-[85vh]">
              <div className="flex flex-col gap-4">
                {/* Cabeçalho do Modal */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getEngineBadge(selectedItem.engine)}
                    <Badge variant="outline" className="font-mono text-[10px] text-neutral-400">
                      {selectedItem.aspectRatio || "16:9"}
                    </Badge>
                  </div>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Prompt Completo */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                      Prompt de Renderização
                    </span>
                    <button
                      onClick={() => handleCopyText(selectedItem.prompt, "modal_prompt")}
                      className="text-[11px] text-[#FF5500] hover:text-[#ff7733] flex items-center gap-1 font-semibold"
                    >
                      {copiedId === "modal_prompt" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      Copiar
                    </button>
                  </div>
                  <div className="bg-[#08090C] border border-white/10 p-3 rounded-xl text-xs text-neutral-200 max-h-32 overflow-y-auto leading-relaxed">
                    {selectedItem.prompt}
                  </div>
                </div>

                {/* Prompt Negativo se existir */}
                {selectedItem.negativePrompt && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                      Prompt Negativo
                    </span>
                    <div className="bg-[#08090C] border border-white/5 p-2 rounded-lg text-[11px] text-neutral-400 font-mono">
                      {selectedItem.negativePrompt}
                    </div>
                  </div>
                )}

                {/* Tabela de Especificações Técnicas */}
                <div className="flex flex-col gap-2 bg-[#08090C] border border-white/10 p-3.5 rounded-xl text-xs font-mono">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider font-sans mb-1">
                    Ficha Técnica de Renderização
                  </span>
                  <div className="flex justify-between text-neutral-400">
                    <span>Semente (Seed):</span>
                    <span className="text-white flex items-center gap-1">
                      {selectedItem.seed}
                      <button
                        onClick={() => handleCopyText(String(selectedItem.seed), "modal_seed")}
                        className="text-neutral-500 hover:text-white"
                        title="Copiar semente"
                      >
                        {copiedId === "modal_seed" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Dimensões:</span>
                    <span className="text-white">{selectedItem.width} x {selectedItem.height}</span>
                  </div>
                  {selectedItem.type === "video" && selectedItem.durationSeconds && (
                    <div className="flex justify-between text-neutral-400">
                      <span>Duração da Cena:</span>
                      <span className="text-[#00E5FF] font-bold">{selectedItem.durationSeconds.toFixed(1)} segundos</span>
                    </div>
                  )}
                  {selectedItem.executionTimeMs && (
                    <div className="flex justify-between text-neutral-400">
                      <span>Tempo de Síntese:</span>
                      <span className="text-emerald-400">{(selectedItem.executionTimeMs / 1000).toFixed(1)}s</span>
                    </div>
                  )}
                  <div className="flex justify-between text-neutral-400">
                    <span>Créditos Gastos:</span>
                    <span className="text-amber-400 font-bold">{selectedItem.creditsCharged} Cr</span>
                  </div>
                  <div className="flex justify-between text-neutral-400 pt-1 border-t border-white/5 text-[10px]">
                    <span>Armazenamento:</span>
                    <span className="text-neutral-300">Convex Cloud Vault</span>
                  </div>
                </div>
              </div>

              {/* BOTÕES DE AÇÃO DO MODAL */}
              <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                {selectedItem.outputUrl && (
                  <Button
                    onClick={() => {
                      const ext = selectedItem.type === "video" ? "mp4" : "png";
                      handleDownloadFile(selectedItem.outputUrl, `${selectedItem.outputFilename || "kriativa_render"}.${ext}`);
                    }}
                    className="w-full h-11 bg-white hover:bg-neutral-200 text-black font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Download className="h-4 w-4" />
                    Baixar {selectedItem.type === "video" ? "Vídeo MP4 com Áudio" : "Imagem PNG HD"}
                  </Button>
                )}

                {selectedItem.type === "image" && selectedItem.outputUrl && onSelectForAnimation && (
                  <Button
                    onClick={() => {
                      onSelectForAnimation(selectedItem.outputUrl, selectedItem.prompt);
                      setSelectedItem(null);
                    }}
                    className="w-full h-11 bg-gradient-to-r from-[#00E5FF] to-[#00b8cc] text-black font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#00E5FF]/20"
                  >
                    <Sparkles className="h-4 w-4" />
                    Animar esta Imagem no Estúdio (I2V)
                  </Button>
                )}

                {onReuseParameters && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      onReuseParameters(selectedItem);
                      setSelectedItem(null);
                    }}
                    className="w-full h-10 border-white/10 hover:bg-white/5 text-neutral-300 text-xs rounded-xl flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Carregar Parâmetros no Estúdio
                  </Button>
                )}

                {onSaveAsElement && selectedItem.outputUrl && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      onSaveAsElement(selectedItem);
                      setSelectedItem(null);
                    }}
                    className="w-full h-10 border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 font-medium text-xs rounded-xl flex items-center justify-center gap-2"
                  >
                    <Users className="h-3.5 w-3.5 text-purple-400" />
                    Salvar como Ator/Elemento (@)
                  </Button>
                )}

                <Button
                  variant="ghost"
                  onClick={() => handleDeleteGeneration(selectedItem._id)}
                  className="w-full h-9 text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs rounded-xl flex items-center justify-center gap-2"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Excluir Mídia do Cofre
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
