"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import {
  Sparkles,
  Play,
  Download,
  RotateCcw,
  Film,
  Video as VideoIcon,
  Image as ImageIcon,
  Clock,
  Coins,
  Check,
  Copy,
  ExternalLink,
  Volume2,
  Maximize2,
  Users,
  AlertTriangle,
  FolderKanban,
  X,
  Share2,
  PanelLeft,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StudioSidebar } from "./studio-sidebar";
import { StudioDock, DockGeneratePayload } from "./studio-dock";
import { CreateProjectModal } from "./create-project-modal";

export function StudioView() {
  const searchParams = useSearchParams();
  const paramProjectId = searchParams.get("projectId");
  const paramPrompt = searchParams.get("prompt");
  const paramInputImageUrl = searchParams.get("inputImageUrl");
  const paramCamera = searchParams.get("camera");

  // Navigation & Project selection
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(paramProjectId || null);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Active prompt prefill & image input (from vault, scripts or elements)
  const [dockInitialPrompt, setDockInitialPrompt] = useState<string>(
    paramPrompt ? (paramCamera ? `${paramPrompt} [Câmera: ${paramCamera}]` : paramPrompt) : ""
  );
  const [dockInputImageUrl, setDockInputImageUrl] = useState<string | null>(paramInputImageUrl || null);

  useEffect(() => {
    if (paramPrompt) {
      setDockInitialPrompt(paramCamera ? `${paramPrompt} [Câmera: ${paramCamera}]` : paramPrompt);
    }
    if (paramInputImageUrl) {
      setDockInputImageUrl(paramInputImageUrl);
    }
    if (paramProjectId) {
      setSelectedProjectId(paramProjectId);
    }
  }, [paramPrompt, paramCamera, paramInputImageUrl, paramProjectId]);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeGenerationIds, setActiveGenerationIds] = useState<Id<"studioGenerations">[]>([]);
  const [generationProgress, setGenerationProgress] = useState<{
    status: string;
    message: string;
  } | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // Dock minimized state
  const [isDockMinimized, setIsDockMinimized] = useState(false);
  const [selectedGenerationId, setSelectedGenerationId] =
    useState<Id<"studioGenerations"> | null>(null);

  // Selected item for expanded cinema theater modal
  const [theaterItem, setTheaterItem] = useState<any | null>(null);

  // Convex mutations & queries
  const createGenerationMutation = useMutation(api.studioGenerations.createGeneration);
  const cancelGenerationMutation = useMutation(api.studioGenerations.cancelGeneration);

  // Generations for the Studio Session Feed
  const myGenerations = useQuery(api.studioGenerations.listMyGenerations, {
    projectId: selectedProjectId || undefined,
    limit: 60,
  });

  // Filter tabs state & prompt copy feedback
  const [mediaFilter, setMediaFilter] = useState<"all" | "video" | "image">("all");
  const [copiedGenId, setCopiedGenId] = useState<string | null>(null);

  const videoCount = (myGenerations || []).filter((g: any) => g.type === "video").length;
  const imageCount = (myGenerations || []).filter((g: any) => g.type === "image").length;

  const filteredGenerations = (myGenerations || []).filter((g: any) => {
    if (mediaFilter === "video") return g.type === "video";
    if (mediaFilter === "image") return g.type === "image";
    return true;
  });

  const latestGeneration = myGenerations && myGenerations.length > 0 ? myGenerations[0] : null;
  const activeHeroGeneration =
    (myGenerations && myGenerations.find((g) => g._id === selectedGenerationId)) ||
    latestGeneration;

  // Selected Project Details
  const projects = useQuery(api.studioProjects.listProjects, { status: "active" }) || [];
  const currentProject = projects.find((p) => p._id === selectedProjectId);

  // Handle generation triggered from StudioDock (suporte real a Batch de N solicitações)
  const handleDockGenerate = async (payload: DockGeneratePayload) => {
    try {
      setIsGenerating(true);
      setFeedbackError(null);

      const batchCount = Math.max(1, payload.batchCount || 1);
      const baseCreditsPerItem = Math.max(1, Math.round(payload.creditsCost / batchCount));

      setGenerationProgress({
        status: "queued",
        message:
          batchCount > 1
            ? `Reservando créditos e despachando ${batchCount} solicitações em lote...`
            : "Reservando créditos e alocando instância no estúdio ativo...",
      });

      const endpointId =
        payload.engine === "seedance25_t2v"
          ? "bytedance/seedance-2.5/text-to-video"
          : payload.engine === "krea2_turbo"
          ? "9zxmy6gcet7j0g"
          : payload.engine === "fasth3_i2v"
          ? "5oveynpkl0scu3"
          : payload.engine === "ltx25_i2v"
          ? "zrhzl1ydzr50n8"
          : "4a2r6rg0c4ehky";

      const targetProvider = payload.provider || (payload.engine === "seedance25_t2v" ? "higgsfield" : "runpod");

      // Dispara as N solicitações devidamente em paralelo
      const generationPromises = Array.from({ length: batchCount }).map(async (_, index) => {
        const itemSeed = Math.floor(Math.random() * 2147483647);

        // 1. Criação no Convex DB com retenção de créditos em escrow para cada item do batch
        const res = await createGenerationMutation({
          projectId: selectedProjectId || undefined,
          type: payload.mode === "text_to_image" ? "image" : "video",
          mode: payload.mode,
          uiModeUsed: "pro",
          engine: payload.engine,
          provider: targetProvider,
          endpointId,
          prompt: payload.prompt,
          negativePrompt: payload.negativePrompt,
          audioPrompt: payload.audioPrompt,
          seed: itemSeed,
          aspectRatio: payload.aspectRatio,
          width: payload.width,
          height: payload.height,
          durationSeconds: payload.durationSeconds,
          fps: payload.engine === "ltx25_i2v" ? 24 : undefined,
          inputImageStorageId: payload.inputImageStorageId,
          inputImageUrl: payload.inputImageUrl,
          lastFrameStorageId: payload.lastFrameStorageId,
          lastFrameUrl: payload.lastFrameUrl,
          elementTagsUsed: payload.elementTagsUsed.length > 0 ? payload.elementTagsUsed : undefined,
          cameraMotion: payload.cameraMotion,
          lens: payload.lens,
          lighting: payload.lighting,
          framing: payload.framing,
          batchCount: 1, // Cada item é sua própria solicitação atômica
          quality: payload.quality,
          creditsCharged: baseCreditsPerItem,
        });

        const genId = res.generationId;
        setActiveGenerationIds((prev) => [...prev, genId]);

        // 2. Disparo para a API BFF
        const apiRes = await fetch("/api/studio/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            generationId: genId,
            engine: payload.engine,
            provider: targetProvider,
            prompt: payload.prompt,
            negativePrompt: payload.negativePrompt,
            seed: itemSeed,
            width: payload.width,
            height: payload.height,
            durationSeconds: payload.durationSeconds,
            fps: payload.engine === "ltx25_i2v" ? 24 : undefined,
            inputImageStorageId: payload.inputImageStorageId,
            imageUrl: payload.inputImageUrl,
            lastFrameStorageId: payload.lastFrameStorageId,
            lastFrameUrl: payload.lastFrameUrl,
          }),
        });

        if (!apiRes.ok) {
          const errorData = await apiRes.json();
          throw new Error(errorData.error || `Falha ao despachar solicitação #${index + 1} para o motor.`);
        }

        const apiData = await apiRes.json();
        const jobId = apiData.jobId;
        const currentEndpoint = apiData.endpointId || endpointId;
        const currentProvider = apiData.provider || targetProvider;

        // 3. Monitoramento individual de cada job no RunPod ou Higgsfield API
        let status = "IN_QUEUE";
        let pollCount = 0;
        while (status === "IN_QUEUE" || status === "IN_PROGRESS") {
          pollCount++;
          await new Promise((r) => setTimeout(r, 2500));
          const statusRes = await fetch(
            `/api/studio/status?endpointId=${encodeURIComponent(currentEndpoint)}&jobId=${encodeURIComponent(jobId)}&generationId=${genId}&provider=${currentProvider}`
          );
          const statusData = await statusRes.json();
          status = statusData.status;

          if (status === "COMPLETED") {
            return statusData;
          } else if (status === "FAILED") {
            throw new Error(statusData.error || `A solicitação #${index + 1} falhou.`);
          }

          setGenerationProgress({
            status: "processing",
            message:
              batchCount > 1
                ? `Processando ${batchCount} solicitações em lote (${pollCount * 2.5}s)...`
                : payload.mode === "text_to_image"
                ? `Renderizando imagem fotorrealista (${pollCount * 2.5}s)...`
                : `Sintetizando movimento e sonoplastia sincronizada (${pollCount * 2.5}s)...`,
          });
        }
      });

      await Promise.all(generationPromises);

      setGenerationProgress({
        status: "completed",
        message:
          batchCount > 1
            ? `${batchCount} cenas concluídas e salvas no estúdio!`
            : "Cena concluída e salva no cofre!",
      });
    } catch (err: any) {
      console.error("Erro na geração:", err);
      setFeedbackError(err.message || "Erro inesperado durante a renderização.");
    } finally {
      setIsGenerating(false);
      setActiveGenerationIds([]);
    }
  };

  // Cancel generation (cancela todas as gerações ativas do lote com estorno)
  const handleCancelGeneration = async () => {
    if (activeGenerationIds.length === 0) return;
    try {
      await Promise.all(
        activeGenerationIds.map((genId) => cancelGenerationMutation({ generationId: genId }))
      );
      setIsGenerating(false);
      setActiveGenerationIds([]);
      setGenerationProgress(null);
    } catch (err: any) {
      console.error("Erro ao cancelar:", err);
    }
  };

  // Download media
  const handleDownloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error("Falha ao baixar:", err);
      window.open(url, "_blank");
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#08090C] text-white">
      {/* 1. Dedicated Studio Sidebar */}
      <StudioSidebar
        selectedProjectId={selectedProjectId}
        onSelectProject={setSelectedProjectId}
        onOpenCreateProjectModal={() => setIsCreateProjectModalOpen(true)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* 2. Main Stage Workspace */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {/* Workspace Top Bar */}
        <header className="h-14 border-b border-white/10 px-6 flex items-center justify-between shrink-0 bg-[#0A0B0E]/80 backdrop-blur-xl z-20">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10 cursor-pointer"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              title={isSidebarCollapsed ? "Expandir barra lateral" : "Recolher barra lateral"}
            >
              <PanelLeft className="size-4" />
            </Button>

            <div className="flex items-center gap-2">
              <Film className="size-4 text-[#FF5500]" />
              <span className="text-xs font-bold tracking-tight text-white uppercase font-mono">
                Estúdio de Renderização
              </span>
            </div>

            {currentProject && (
              <>
                <span className="text-zinc-600 font-mono">/</span>
                <Badge
                  variant="outline"
                  className="bg-[#FF5500]/10 border-[#FF5500]/30 text-[#FF5500] font-mono text-[10px]"
                >
                  {currentProject.name}
                </Badge>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentProject?.description && (
              <span className="text-[11px] text-zinc-400 truncate max-w-xs hidden sm:inline mr-2">
                {currentProject.description}
              </span>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDockMinimized(!isDockMinimized)}
              className="text-xs text-zinc-400 hover:text-white hover:bg-white/10 gap-1.5 h-8 px-2.5 rounded-lg font-medium border border-white/10 cursor-pointer"
              title={isDockMinimized ? "Expandir console de criação" : "Minimizar console para ver as gerações em tela cheia"}
            >
              {isDockMinimized ? (
                <>
                  <ChevronUp className="size-3.5 text-[#FF5500]" />
                  <span className="text-[11px]">Expandir Criação</span>
                </>
              ) : (
                <>
                  <ChevronDown className="size-3.5 text-zinc-400" />
                  <span className="text-[11px]">Minimizar Criação</span>
                </>
              )}
            </Button>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto relative">
          {feedbackError && (
            <div className="mx-6 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between text-xs text-red-300">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-4 text-red-400 shrink-0" />
                <span>{feedbackError}</span>
              </div>
              <button
                onClick={() => setFeedbackError(null)}
                className="text-red-400 hover:text-white cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
          )}

          <div className="flex-1 flex flex-col justify-between overflow-y-auto">
            {/* Session Production Feed Header */}
              <div className="px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 bg-[#090A0E]/80 backdrop-blur-md sticky top-0 z-20">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Film className="size-4 text-[#FF5500]" />
                    <h2 className="text-sm font-bold text-white tracking-wide">
                      Produção da Sessão
                    </h2>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-white/10 bg-white/5 text-zinc-400 font-mono text-[10px]"
                  >
                    {(myGenerations || []).length}{" "}
                    {(myGenerations || []).length === 1 ? "cena" : "cenas"}
                  </Badge>
                </div>

                {/* Filter Tabs: Todas / Vídeos / Imagens */}
                <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10 text-xs">
                  <button
                    type="button"
                    onClick={() => setMediaFilter("all")}
                    className={`px-3 py-1 rounded-lg font-medium transition-all ${
                      mediaFilter === "all"
                        ? "bg-[#FF5500] text-white shadow-sm"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Todas ({(myGenerations || []).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaFilter("video")}
                    className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                      mediaFilter === "video"
                        ? "bg-[#FF5500] text-white shadow-sm"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <VideoIcon className="size-3" />
                    <span>Vídeos ({videoCount})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaFilter("image")}
                    className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                      mediaFilter === "image"
                        ? "bg-[#FF5500] text-white shadow-sm"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <ImageIcon className="size-3" />
                    <span>Imagens ({imageCount})</span>
                  </button>
                </div>
              </div>

              {/* Central Cinema Stage: Continuous Production Grid */}
              <div
                className={`flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar transition-all duration-300 ${
                  isDockMinimized ? "pb-24" : "pb-48"
                }`}
              >
                {/* Active Generations Grid */}
                {isGenerating || (filteredGenerations && filteredGenerations.length > 0) ? (
                  <div
                    className={`grid gap-5 transition-all duration-300 ${
                      isDockMinimized
                        ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
                        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4"
                    }`}
                  >
                    {/* Live Processing Card if Generating */}
                    {isGenerating && (
                      <div className="rounded-2xl bg-gradient-to-b from-[#FF5500]/15 to-black/80 border border-[#FF5500]/50 p-6 flex flex-col items-center justify-center text-center shadow-[0_0_25px_rgba(255,85,0,0.2)] relative overflow-hidden animate-pulse min-h-[280px]">
                        <div className="size-16 rounded-2xl bg-[#FF5500]/20 border border-[#FF5500]/40 flex items-center justify-center text-[#FF5500] mb-4">
                          <Film className="size-8 animate-spin" />
                        </div>
                        <Badge
                          variant="outline"
                          className="border-[#FF5500]/50 bg-[#FF5500]/20 text-[#FF5500] font-mono text-[10px] mb-2 uppercase tracking-wider"
                        >
                          Renderizando Agora
                        </Badge>
                        <h3 className="text-sm font-bold text-white mb-1">
                          Processando Cena Cinemática
                        </h3>
                        <p className="text-xs text-zinc-400 text-center max-w-xs font-mono mb-5">
                          {generationProgress?.message || "Alocando nós e processando tensores ComfyUI..."}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelGeneration}
                          className="border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs h-8 px-4"
                        >
                          Interromper Renderização
                        </Button>
                      </div>
                    )}

                    {/* All Recent Generations of the User Session */}
                    {filteredGenerations.map((gen: any) => {
                      return (
                        <div
                          key={gen._id}
                          className="rounded-2xl bg-[#0D0E12] border border-white/10 hover:border-white/25 transition-all duration-200 overflow-hidden flex flex-col group shadow-lg hover:shadow-2xl"
                        >
                          {/* Media Preview Stage */}
                          <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                            {gen.outputUrl ? (
                              gen.type === "video" ? (
                                <video
                                  src={gen.outputUrl}
                                  controls
                                  preload="metadata"
                                  playsInline
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <img
                                  src={gen.outputUrl}
                                  alt={gen.prompt}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              )
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 text-zinc-500">
                                <Clock className="size-6 animate-spin text-[#FF5500] mb-2" />
                                <span className="text-xs font-mono">Processando...</span>
                              </div>
                            )}

                            {/* Badges Flutuantes Superiores */}
                            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 pointer-events-none z-10">
                              <Badge
                                variant="outline"
                                className="bg-black/85 backdrop-blur-md border-white/20 text-white font-mono text-[9px] px-1.5 py-0.5"
                              >
                                {gen.type === "video" ? "VÍDEO" : "IMAGEM 8K"}
                              </Badge>
                              {gen.hasAudioTrack && (
                                <Badge
                                  variant="outline"
                                  className="bg-blue-500/30 border-blue-500/40 text-blue-300 font-mono text-[9px] px-1.5 py-0.5 flex items-center gap-1"
                                >
                                  <Volume2 className="size-2.5" />
                                  <span>Áudio</span>
                                </Badge>
                              )}
                              {gen.aspectRatio && (
                                <Badge
                                  variant="outline"
                                  className="bg-black/85 backdrop-blur-md border-white/20 text-zinc-300 font-mono text-[9px] px-1.5 py-0.5"
                                >
                                  {gen.aspectRatio}
                                </Badge>
                              )}
                              {gen.durationSeconds && (
                                <Badge
                                  variant="outline"
                                  className="bg-black/85 backdrop-blur-md border-white/20 text-zinc-300 font-mono text-[9px] px-1.5 py-0.5"
                                >
                                  {gen.durationSeconds}s
                                </Badge>
                              )}
                            </div>

                            {/* Botão de Expandir / Theater */}
                            {gen.outputUrl && (
                              <button
                                onClick={() => setTheaterItem(gen)}
                                className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/75 hover:bg-black text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                title="Expandir para tela cheia"
                              >
                                <Maximize2 className="size-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Card Content & Action Bar */}
                          <div className="p-3 bg-[#0A0B0E] border-t border-white/10 flex flex-col justify-between flex-1 gap-2.5">
                            <div>
                              <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1.5 font-mono">
                                <span className="text-[#FF5500] font-semibold uppercase">
                                  {gen.engine === "krea2_turbo"
                                    ? "Krea-2 Turbo"
                                    : gen.engine === "fasth3_i2v"
                                    ? "FastH3 I2V"
                                    : gen.engine === "fasth3_t2v_720p"
                                    ? "FastH3 720p HD"
                                    : gen.engine === "ltx25_i2v"
                                    ? "LTX-2.5 22B"
                                    : "FastH3 Studio"}
                                </span>
                                <span className="text-zinc-500">
                                  {new Date(gen._creationTime).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                              <p
                                className="text-xs text-zinc-300 line-clamp-2 leading-relaxed"
                                title={gen.prompt}
                              >
                                {gen.prompt}
                              </p>
                            </div>

                            {/* Barra de Ações Rápidas */}
                            <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-white/5">
                              <div className="flex items-center gap-1">
                                {gen.type === "image" && gen.outputUrl && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setDockInputImageUrl(gen.outputUrl);
                                      setDockInitialPrompt(gen.prompt || "");
                                      setIsDockMinimized(false);
                                    }}
                                    className="border-[#FF5500]/40 bg-[#FF5500]/10 hover:bg-[#FF5500]/20 text-[#FF5500] hover:text-white text-[11px] h-7 px-2 gap-1 font-medium"
                                    title="Animar imagem em vídeo cinemático"
                                  >
                                    <Sparkles className="size-3" />
                                    <span>Animar I2V</span>
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setDockInitialPrompt(gen.prompt || "");
                                    setIsDockMinimized(false);
                                  }}
                                  className="border-white/10 hover:bg-white/10 text-zinc-300 hover:text-white text-[11px] h-7 px-2 gap-1"
                                  title="Carregar este prompt no dock"
                                >
                                  <Copy className="size-3" />
                                  <span>Prompt</span>
                                </Button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(gen.prompt || "");
                                    setCopiedGenId(gen._id);
                                    setTimeout(() => setCopiedGenId(null), 2000);
                                  }}
                                  className="p-1.5 rounded-lg border border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                                  title="Copiar prompt para a área de transferência"
                                >
                                  {copiedGenId === gen._id ? (
                                    <Check className="size-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="size-3" />
                                  )}
                                </button>
                              </div>

                              <div className="flex items-center gap-1">
                                {gen.outputUrl && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const ext = gen.type === "video" ? "mp4" : "png";
                                      handleDownloadFile(
                                        gen.outputUrl,
                                        `kriativa_render_${gen._id}.${ext}`
                                      );
                                    }}
                                    className="border-white/10 hover:bg-white/10 text-zinc-300 hover:text-white text-[11px] h-7 px-2 gap-1"
                                    title="Baixar arquivo para o computador"
                                  >
                                    <Download className="size-3" />
                                    <span>Baixar</span>
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Empty state hero when there are no creations yet */
                  <div className="h-full flex items-center justify-center p-8">
                    <div className="text-center max-w-md space-y-4">
                      <div className="size-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-[#FF5500]">
                        <Film className="size-8" />
                      </div>
                      <h3 className="text-base font-bold text-white">
                        Seu Estúdio Cinematográfico está Pronto
                      </h3>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Use a barra de criação flutuante abaixo para iniciar sua primeira cena. Alterne entre imagem e vídeo, selecione lentes anamórficas e adicione atores virtuais com menções <code className="text-[#FF5500] font-mono">@</code>.
                      </p>
                      <div className="flex items-center justify-center gap-3 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setDockInitialPrompt("Cinematic shot of an explorer discovering a glowing crystal cave, anamorphic lens, 8k");
                            setIsDockMinimized(false);
                          }}
                          className="border-[#FF5500]/30 bg-[#FF5500]/10 hover:bg-[#FF5500]/20 text-[#FF5500] text-xs h-8"
                        >
                          <Sparkles className="size-3 mr-1.5" />
                          Testar Prompt de Exemplo
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Higgsfield-Style Floating Dock */}
              <StudioDock
                projectId={selectedProjectId}
                isGenerating={isGenerating}
                onGenerate={handleDockGenerate}
                generationProgress={generationProgress}
                onCancelGeneration={handleCancelGeneration}
                initialPrompt={dockInitialPrompt}
                initialInputImageUrl={dockInputImageUrl}
                isMinimized={isDockMinimized}
                onToggleMinimize={() => setIsDockMinimized(!isDockMinimized)}
              />
            </div>
        </div>
      </main>

      {/* 4. Modal de Novo Projeto */}
      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={() => setIsCreateProjectModalOpen(false)}
        onCreated={(projectId) => {
          setSelectedProjectId(projectId);
        }}
      />

      {/* 5. Expanded Theater Player Modal */}
      {theaterItem && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="relative max-w-6xl w-full max-h-[90vh] flex flex-col items-center justify-center">
            <button
              onClick={() => setTheaterItem(null)}
              className="absolute -top-12 right-0 p-2 text-zinc-400 hover:text-white"
            >
              <X className="size-6" />
            </button>
            {theaterItem.type === "video" ? (
              <video
                src={theaterItem.outputUrl}
                controls
                autoPlay
                loop
                playsInline
                className="max-h-[80vh] w-auto max-w-full rounded-2xl shadow-2xl object-contain"
              />
            ) : (
              <img
                src={theaterItem.outputUrl}
                alt={theaterItem.prompt}
                className="max-h-[80vh] w-auto max-w-full rounded-2xl shadow-2xl object-contain"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
