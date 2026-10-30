"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  Film,
  Sparkles,
  Clapperboard,
  Video,
  Image as ImageIcon,
  Play,
  Sliders,
  ExternalLink,
  Check,
  Copy,
  Loader2,
  ArrowRight,
  Camera,
  Wand2,
  Layers,
  Maximize2,
  AlertCircle,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface StudioDirectiveData {
  action: "generate_video" | "edit_video" | "generate_image" | "edit_image";
  mode?: "text_to_video" | "image_to_video" | "reference_to_video" | "text_to_image" | "image_edit" | "video_edit";
  prompt: string;
  negativePrompt?: string;
  aspectRatio?: "16:9" | "9:16" | "21:9" | "1:1" | "4:3";
  cameraMotion?: "pan" | "tilt" | "zoom_in" | "zoom_out" | "orbit" | "dolly" | "drone_fpv" | "static" | "handheld";
  sourceImageUrl?: string;
  referenceUrl?: string;
  referenceType?: "character" | "motion" | "style" | "actor";
  sourceVideoUrl?: string;
  durationSeconds?: number;
  lens?: string;
  lighting?: string;
  editInstruction?: string;
}

interface StudioDirectiveCardProps {
  data: StudioDirectiveData;
  onOpenImage?: (url: string) => void;
}

export function StudioDirectiveCard({ data, onOpenImage }: StudioDirectiveCardProps) {
  const router = useRouter();
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [activeGenerationId, setActiveGenerationId] = useState<string | null>(null);
  const [dispatchError, setDispatchError] = useState<string | null>(null);
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);

  const createGenerationMutation = useMutation(api.studioGenerations.createGeneration);

  // Consulta reativa do status quando disparado
  const activeGen = useQuery(
    api.studioGenerations.getGeneration,
    activeGenerationId ? { id: activeGenerationId as any } : "skip"
  );

  const isVideo = data.action === "generate_video" || data.action === "edit_video";
  const isImage = data.action === "generate_image" || data.action === "edit_image";

  // Identificação do título e ícone
  let actionTitle = "Diretiva Cinematográfica";
  let actionBadge = "Produção";
  let ActionIcon = Film;
  let gradientColor = "from-[#FF5500] to-[#E64D00]";

  if (data.action === "generate_video") {
    if (data.mode === "image_to_video") {
      actionTitle = "Geração de Vídeo (Imagem → Vídeo)";
      actionBadge = "Animação Cinemática";
      ActionIcon = Video;
      gradientColor = "from-amber-500 to-[#FF5500]";
    } else if (data.mode === "reference_to_video") {
      actionTitle = "Geração de Vídeo (Referência de Personagem/Estilo)";
      actionBadge = "Consistência Narrativa";
      ActionIcon = Clapperboard;
      gradientColor = "from-purple-500 to-[#FF5500]";
    } else {
      actionTitle = "Geração de Vídeo (Texto → Vídeo)";
      actionBadge = "Síntese Textual";
      ActionIcon = Film;
      gradientColor = "from-[#FF5500] to-orange-600";
    }
  } else if (data.action === "edit_video") {
    actionTitle = "Pós-Produção & Edição de Vídeo";
    actionBadge = "Remasterização / Reframe";
    ActionIcon = Sliders;
    gradientColor = "from-cyan-500 to-blue-600";
  } else if (data.action === "generate_image") {
    actionTitle = "Geração de Imagem Cinematográfica";
    actionBadge = "Renderização Estática";
    ActionIcon = ImageIcon;
    gradientColor = "from-emerald-500 to-teal-600";
  } else if (data.action === "edit_image") {
    actionTitle = "Edição & Estilização de Imagem";
    actionBadge = "Inpainting / Transfer";
    ActionIcon = Wand2;
    gradientColor = "from-fuchsia-500 to-pink-600";
  }

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(data.prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleOpenInStudioPro = () => {
    const params = new URLSearchParams();
    params.set("prompt", data.prompt);
    if (data.negativePrompt) params.set("negativePrompt", data.negativePrompt);
    if (data.aspectRatio) params.set("aspectRatio", data.aspectRatio);
    if (data.cameraMotion) params.set("cameraMotion", data.cameraMotion);
    if (data.durationSeconds) params.set("duration", String(data.durationSeconds));
    if (data.sourceImageUrl) params.set("imageUrl", data.sourceImageUrl);
    if (data.referenceUrl) params.set("referenceUrl", data.referenceUrl);
    if (data.mode) params.set("mode", data.mode);

    router.push(`/dashboard/studio?${params.toString()}`);
  };

  const handleDispatchDirectly = async () => {
    setIsDispatching(true);
    setDispatchError(null);
    setDispatchSuccess(null);

    try {
      // Determina motor e dimensões
      let engine: any = "fasth3_t2v_720p";
      let mode: any = "text_to_video";
      let targetProvider: "runpod" | "higgsfield" = "runpod";
      let width = 1280;
      let height = 720;

      if (data.aspectRatio === "9:16") {
        width = 720;
        height = 1280;
      } else if (data.aspectRatio === "1:1") {
        width = 1024;
        height = 1024;
      }

      if (isImage) {
        engine = "krea2_turbo";
        mode = "text_to_image";
      } else if (data.mode === "image_to_video" || data.sourceImageUrl) {
        engine = "fasth3_i2v";
        mode = "image_to_video";
      } else if (data.mode === "reference_to_video") {
        engine = "fasth3_t2v_720p";
        mode = "text_to_video";
      }

      const randomSeed = Math.floor(Math.random() * 2147483647);
      const endpointId = "default-endpoint";

      // 1. Criar registro no Convex
      const res = await createGenerationMutation({
        type: isImage ? "image" : "video",
        mode,
        uiModeUsed: "pro",
        engine,
        provider: targetProvider,
        endpointId,
        prompt: data.prompt,
        negativePrompt: data.negativePrompt,
        seed: randomSeed,
        aspectRatio: data.aspectRatio || "16:9",
        width,
        height,
        durationSeconds: data.durationSeconds || (isVideo ? 5 : undefined),
        inputImageUrl: data.sourceImageUrl || data.referenceUrl,
        cameraMotion: data.cameraMotion,
        lens: data.lens,
        lighting: data.lighting,
        creditsCharged: isImage ? 2 : 14,
      });

      const genId = res.generationId;
      setActiveGenerationId(genId);

      // 2. Disparar para a API do Estúdio
      const apiRes = await fetch("/api/studio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generationId: genId,
          engine,
          provider: targetProvider,
          prompt: data.prompt,
          negativePrompt: data.negativePrompt,
          seed: randomSeed,
          width,
          height,
          durationSeconds: data.durationSeconds || (isVideo ? 5 : undefined),
          imageUrl: data.sourceImageUrl || data.referenceUrl,
          aspectRatio: data.aspectRatio || "16:9",
        }),
      });

      if (!apiRes.ok) {
        const errJson = await apiRes.json().catch(() => ({}));
        throw new Error(errJson.error || "Falha ao enviar diretiva para o motor de estúdio.");
      }

      setDispatchSuccess("Instância de processamento ativada com sucesso! Renderizando...");
    } catch (err: any) {
      console.error("Erro ao disparar geração a partir do chat:", err);
      setDispatchError(err?.message || "Erro de conexão ao despachar para o motor de estúdio.");
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="my-3 overflow-hidden rounded-2xl border border-white/10 bg-[#0A0B12] shadow-2xl transition-all hover:border-white/20">
      {/* Header do Card */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-[#0F101A] p-3 sm:px-4 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`flex size-8 items-center justify-center rounded-xl bg-gradient-to-br ${gradientColor} text-white shadow-md shrink-0`}>
            <ActionIcon className="size-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-white text-xs sm:text-sm tracking-tight truncate">
              {actionTitle}
            </span>
            <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-mono">
              <span className="text-[#FF5500] font-semibold">{actionBadge}</span>
              <span className="text-white/20">•</span>
              <span>Motor Ativo</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopyPrompt}
            className="h-7 px-2.5 rounded-lg border-white/10 bg-white/[0.04] text-[10px] text-neutral-300 hover:text-white hover:bg-white/10 gap-1 cursor-pointer"
            title="Copiar prompt da diretiva"
          >
            {copiedPrompt ? (
              <>
                <Check className="size-3 text-emerald-400" />
                <span className="text-emerald-400">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="size-3" />
                <span>Copiar</span>
              </>
            )}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleOpenInStudioPro}
            className="h-7 px-2.5 rounded-lg border-white/10 bg-white/[0.04] text-[10px] text-neutral-300 hover:text-white hover:bg-white/10 gap-1 cursor-pointer"
            title="Abrir parâmetros no Estúdio Pro"
          >
            <ExternalLink className="size-3 text-[#FF5500]" />
            <span className="hidden sm:inline">Estúdio Pro</span>
          </Button>
        </div>
      </div>

      {/* Conteúdo Principal da Diretiva */}
      <div className="p-3 sm:p-4 space-y-3">
        {/* Mídias de Origem / Referência (quando houver) */}
        {(data.sourceImageUrl || data.referenceUrl || data.sourceVideoUrl) && (
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/10">
            {data.sourceImageUrl && (
              <div
                onClick={() => onOpenImage?.(data.sourceImageUrl!)}
                className="group relative size-16 rounded-lg overflow-hidden bg-black/40 border border-white/15 cursor-pointer shrink-0"
                title="Clique para ampliar imagem fonte"
              >
                <img
                  src={data.sourceImageUrl}
                  alt="Imagem de Entrada"
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                  <Eye className="size-3 text-[#FF5500]" />
                </div>
              </div>
            )}

            {data.referenceUrl && data.referenceUrl !== data.sourceImageUrl && (
              <div
                onClick={() => onOpenImage?.(data.referenceUrl!)}
                className="group relative size-16 rounded-lg overflow-hidden bg-black/40 border border-white/15 cursor-pointer shrink-0"
                title="Clique para ampliar referência"
              >
                <img
                  src={data.referenceUrl}
                  alt="Referência Consistente"
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                  <Eye className="size-3 text-[#FF5500]" />
                </div>
              </div>
            )}

            <div className="flex flex-col min-w-0 text-xs">
              <span className="font-semibold text-white">
                {data.mode === "image_to_video"
                  ? "Imagem Fonte para Animação"
                  : data.mode === "reference_to_video"
                  ? `Referência Visual (${data.referenceType || "Personagem / Estilo"})`
                  : "Mídia Vinculada"}
              </span>
              <span className="text-[11px] text-neutral-400 truncate font-mono">
                Preservando proporção, textura e consistência temporal no render.
              </span>
            </div>
          </div>
        )}

        {/* Prompt Formatado */}
        <div className="rounded-xl bg-black/40 border border-white/10 p-3 text-xs leading-relaxed text-neutral-200">
          <span className="text-[10px] font-mono text-[#FF5500] uppercase tracking-wider block mb-1 font-semibold">
            Prompt de Renderização:
          </span>
          <p className="selection:bg-[#FF5500]/30 selection:text-white font-sans text-white">
            {data.prompt}
          </p>
          {data.negativePrompt && (
            <div className="mt-2 pt-2 border-t border-white/10 text-[11px] text-neutral-400">
              <span className="font-semibold text-neutral-500">Negativo: </span>
              {data.negativePrompt}
            </div>
          )}
        </div>

        {/* Badges Técnicas de Direção de Fotografia */}
        <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
          {data.aspectRatio && (
            <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/10 text-neutral-300">
              📐 {data.aspectRatio}
            </span>
          )}
          {data.cameraMotion && (
            <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/10 text-neutral-300 uppercase">
              🎥 {data.cameraMotion}
            </span>
          )}
          {data.lens && (
            <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/10 text-neutral-300">
              🔍 {data.lens}
            </span>
          )}
          {data.durationSeconds && (
            <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/10 text-neutral-300">
              ⏱️ {data.durationSeconds}s
            </span>
          )}
          {data.lighting && (
            <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/10 text-neutral-300">
              💡 {data.lighting}
            </span>
          )}
        </div>

        {/* Feedback de Erro ou Sucesso */}
        {dispatchError && (
          <div className="flex items-center gap-2 p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
            <AlertCircle className="size-4 shrink-0" />
            <span className="leading-snug">{dispatchError}</span>
          </div>
        )}

        {dispatchSuccess && (
          <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
            <Check className="size-4 shrink-0" />
            <span className="leading-snug">{dispatchSuccess}</span>
          </div>
        )}

        {/* Status de Geração Ativa em Tempo Real */}
        {activeGen && (
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white flex items-center gap-1.5">
                {activeGen.status === "completed" ? (
                  <Check className="size-3.5 text-emerald-400" />
                ) : (
                  <Loader2 className="size-3.5 animate-spin text-[#FF5500]" />
                )}
                Status: {activeGen.status.toUpperCase()}
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">
                {activeGen.engine}
              </span>
            </div>

            {activeGen.outputUrl && (
              <div className="mt-2 rounded-xl overflow-hidden border border-white/10 bg-black">
                {activeGen.type === "video" ? (
                  <video
                    src={activeGen.outputUrl}
                    controls
                    autoPlay
                    loop
                    className="w-full max-h-64 object-contain"
                  />
                ) : (
                  <img
                    src={activeGen.outputUrl}
                    alt="Resultado da renderização"
                    className="w-full max-h-64 object-contain"
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Botão de Disparo Direto */}
        {!activeGen?.outputUrl && (
          <div className="pt-1 flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleDispatchDirectly}
              disabled={isDispatching}
              className="flex-1 h-10 rounded-xl bg-gradient-to-r from-[#FF5500] to-[#E64D00] hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider gap-2 shadow-[0_0_15px_rgba(255,85,0,0.3)] transition-all cursor-pointer disabled:opacity-50"
            >
              {isDispatching ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Conectando ao Motor...</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  <span>Renderizar Agora no Estúdio</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
