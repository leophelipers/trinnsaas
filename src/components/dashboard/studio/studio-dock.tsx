"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { compressImageFile } from "@/lib/studio/image-utils";
import {
  Sparkles,
  Image as ImageIcon,
  Video,
  Plus,
  X,
  Upload,
  Layers,
  ChevronDown,
  ChevronUp,
  Camera,
  Aperture,
  Sun,
  Maximize2,
  Ratio,
  Sliders,
  Check,
  Loader2,
  Volume2,
  Users,
  Grid2X2,
  Film,
  FolderOpen,
  Clock,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CinemaPresetsModal,
  PresetCategory,
  CinemaPresetItem,
  CINEMA_PRESETS,
} from "./cinema-presets-modal";
import { VaultImagePickerModal } from "./vault-image-picker-modal";

export type StudioMode = "image" | "video";
export type StudioEngine =
  | "krea2_turbo"
  | "fasth3_i2v"
  | "fasth3_t2v_480p"
  | "fasth3_t2v_720p"
  | "ltx25_i2v"
  | "seedance25_t2v";

export interface DockGeneratePayload {
  prompt: string;
  negativePrompt?: string;
  audioPrompt?: string;
  mode: "text_to_image" | "image_to_video" | "text_to_video" | "image_to_video_morph";
  engine: StudioEngine;
  provider?: "runpod" | "higgsfield";
  width: number;
  height: number;
  aspectRatio: string;
  quality: string;
  cameraMotion?: string;
  lens?: string;
  lighting?: string;
  framing?: string;
  batchCount: number;
  durationSeconds?: number;
  inputImageStorageId?: Id<"_storage">;
  inputImageUrl?: string;
  lastFrameStorageId?: Id<"_storage">;
  lastFrameUrl?: string;
  creditsCost: number;
  elementTagsUsed: string[];
}

interface StudioDockProps {
  projectId?: string | null;
  isGenerating: boolean;
  onGenerate: (payload: DockGeneratePayload) => Promise<void>;
  generationProgress?: {
    status: string;
    message: string;
    progressPercent?: number;
  } | null;
  onCancelGeneration?: () => void;
  initialPrompt?: string;
  initialInputImageUrl?: string | null;
  initialMode?: StudioMode;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

const ASPECT_RATIOS = [
  { label: "16:9 Widescreen", value: "16:9", width: 1024, height: 576 },
  { label: "9:16 Vertical (Reels/TikTok)", value: "9:16", width: 576, height: 1024 },
  { label: "1:1 Quadrado (Feed)", value: "1:1", width: 1024, height: 1024 },
  { label: "2.39:1 CinemaScope", value: "2.39:1", width: 1024, height: 432 },
  { label: "4:3 TV Clássica", value: "4:3", width: 960, height: 720 },
];

const QUALITIES = [
  { label: "720p HD Cinemático", value: "720p" },
  { label: "1080p Full HD Master", value: "1080p" },
  { label: "4K Resolução Master", value: "4k" },
  { label: "480p Preview Rápido", value: "480p" },
];

const VIDEO_DURATIONS = [
  { label: "3s (Padrão)", value: 3.0, costAdd: 0 },
  { label: "5s (Cinemático)", value: 5.0, costAdd: 1 },
  { label: "10s (Expandido)", value: 10.0, costAdd: 3 },
  { label: "15s (Master Longo)", value: 15.0, costAdd: 5 },
];

export function StudioDock({
  projectId,
  isGenerating,
  onGenerate,
  generationProgress,
  onCancelGeneration,
  initialPrompt,
  initialInputImageUrl,
  initialMode,
  isMinimized = false,
  onToggleMinimize,
}: StudioDockProps) {
  // Core mode: Image vs Video
  const [mode, setMode] = useState<StudioMode>(initialMode || "video");

  // Prompts
  const [prompt, setPrompt] = useState(initialPrompt || "");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [audioPrompt, setAudioPrompt] = useState("");

  // Optical & Cinema settings
  const [selectedEngine, setSelectedEngine] = useState<"auto" | StudioEngine>("auto");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [quality, setQuality] = useState("720p");
  const [batchCount, setBatchCount] = useState<number>(1);
  const [durationSeconds, setDurationSeconds] = useState<number>(5.0);

  // Active Cinema Presets (Modal-driven)
  const [activePresets, setActivePresets] = useState<{
    motion: CinemaPresetItem | null;
    lens: CinemaPresetItem | null;
    lighting: CinemaPresetItem | null;
    camera: CinemaPresetItem | null;
    style: CinemaPresetItem | null;
  }>({
    motion: null,
    lens: null,
    lighting: null,
    camera: null,
    style: null,
  });

  // Modal states for presets
  const [activePresetModal, setActivePresetModal] = useState<PresetCategory | null>(null);

  // Image References
  const [inputImageStorageId, setInputImageStorageId] = useState<Id<"_storage"> | null>(null);
  const [inputImageUrl, setInputImageUrl] = useState<string | null>(initialInputImageUrl || null);
  const [lastFrameStorageId, setLastFrameStorageId] = useState<Id<"_storage"> | null>(null);
  const [lastFrameUrl, setLastFrameUrl] = useState<string | null>(null);
  const [isUploadingInput, setIsUploadingInput] = useState(false);

  // Modal state for Vault/Image Picker
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [imagePickerTarget, setImagePickerTarget] = useState<"input" | "lastFrame">("input");

  // Popovers & menus
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
  const [showMentionPopover, setShowMentionPopover] = useState(false);

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Queries & mutations
  const generateUploadUrl = useMutation(api.studioGenerations.generateUploadUrl);
  const studioPricingWorkflows = useQuery(api.studioGenerations.getStudioPricing);
  const elements = useQuery(api.studioElements.listElements, {
    projectId: projectId ? (projectId as Id<"studioProjects">) : undefined,
  }) || [];

  // Update prompt if initialPrompt changes externally
  useEffect(() => {
    if (initialPrompt && initialPrompt !== prompt) {
      setPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  // Update initialInputImageUrl if passed
  useEffect(() => {
    if (initialInputImageUrl) {
      setInputImageUrl(initialInputImageUrl);
      setMode("video");
    }
  }, [initialInputImageUrl]);

  // Resolve active engine based on Auto Mode or explicit selection
  const resolvedEngine: StudioEngine = (() => {
    if (selectedEngine !== "auto") return selectedEngine;
    if (mode === "image") return "krea2_turbo";
    // In video mode:
    if (inputImageStorageId || inputImageUrl) {
      return "fasth3_i2v";
    }
    // No modo Auto para vídeo a partir de texto, roteia para Seedance 2.5 (Higgsfield API)
    // para resoluções cinemáticas 720p/1080p, ou FastVideo H3 480p para preview rápido
    if (quality === "480p") {
      return "fasth3_t2v_480p";
    }
    return "seedance25_t2v";
  })();

  // Resolve generation mode
  const resolvedMode = (() => {
    if (mode === "image") return "text_to_image";
    if (lastFrameStorageId || lastFrameUrl) return "image_to_video_morph";
    if (inputImageStorageId || inputImageUrl) return "image_to_video";
    return "text_to_video";
  })();

  // Calculate dynamic credit cost based on configured workflow pricing, duration, batch and engine
  const creditCost = (() => {
    const targetWf = studioPricingWorkflows?.find(
      (w) => w.slug === resolvedEngine || w.slug === resolvedEngine.replace(/_/g, "-")
    );

    if (targetWf) {
      let base = targetWf.creditsCharged;
      if (mode === "video" && durationSeconds) {
        const baseSec = resolvedEngine === "ltx25_i2v" ? 5 : 3;
        if (durationSeconds > baseSec) {
          const mult = durationSeconds / baseSec;
          base = Math.ceil(base * mult);
        }
      }
      return base * batchCount;
    }

    // Fallback seguro caso a consulta reativa ainda esteja sincronizando
    let base = 2;
    if (mode === "image") {
      base = 2;
    } else {
      if (resolvedEngine === "ltx25_i2v") {
        base = durationSeconds <= 5 ? 30 : durationSeconds <= 10 ? 42 : 55;
      } else if (resolvedEngine === "fasth3_t2v_720p") {
        base =
          durationSeconds <= 3
            ? 14
            : durationSeconds <= 5
            ? 18
            : durationSeconds <= 10
            ? 26
            : 34;
      } else {
        if (durationSeconds <= 3) base = 6;
        else if (durationSeconds <= 5) base = 8;
        else if (durationSeconds <= 10) base = 14;
        else base = 20;
      }
    }
    return base * batchCount;
  })();

  // Detect used @mentions in prompt
  const usedTags = (prompt.match(/@([a-zA-Z0-9_\u00C0-\u017F]+)/g) || []).map((t) =>
    t.replace(/^@/, "")
  );

  // Apply or remove cinema preset, composing it directly into the prompt
  const handleSelectPreset = (category: PresetCategory, newPreset: CinemaPresetItem | null) => {
    const oldPreset = activePresets[category];
    let currentPrompt = prompt;

    // Remove old snippet if existed
    if (oldPreset) {
      currentPrompt = currentPrompt.replace(oldPreset.promptSnippet, "");
    }

    // Append new snippet if selected
    if (newPreset) {
      const trimmed = currentPrompt.trim().replace(/,\s*$/, "");
      currentPrompt = trimmed ? `${trimmed}, ${newPreset.promptSnippet}` : newPreset.promptSnippet;
    }

    // Clean up extra commas or leftover spaces
    currentPrompt = currentPrompt
      .replace(/\s*,\s*,\s*/g, ", ")
      .replace(/^\s*,\s*/, "")
      .replace(/\s*,\s*$/, "")
      .trim();

    setPrompt(currentPrompt);
    setActivePresets((prev) => ({ ...prev, [category]: newPreset }));
  };

  // Upload local file handler
  const handleLocalFileUpload = async (file: File, target: "input" | "lastFrame") => {
    try {
      setIsUploadingInput(true);
      const compressedBlob = await compressImageFile(file);
      const uploadUrl = await generateUploadUrl({});
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": "image/jpeg" },
        body: compressedBlob,
      });
      if (!res.ok) throw new Error("Falha no upload");
      const json = await res.json();

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (target === "input") {
          setInputImageStorageId(json.storageId);
          setInputImageUrl(dataUrl);
          setMode("video");
        } else {
          setLastFrameStorageId(json.storageId);
          setLastFrameUrl(dataUrl);
        }
      };
      reader.readAsDataURL(compressedBlob);
    } catch (err) {
      console.error("Erro no upload da imagem:", err);
      alert("Erro ao enviar imagem.");
    } finally {
      setIsUploadingInput(false);
    }
  };

  // Handle AI Prompt Enhancement
  const handleEnhancePrompt = async () => {
    if (!prompt.trim() || isEnhancingPrompt) return;

    try {
      setIsEnhancingPrompt(true);
      const res = await fetch("/api/studio/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          mode,
          engine: resolvedEngine,
          aspectRatio,
        }),
      });

      if (!res.ok) {
        throw new Error("Falha ao comunicar com o Diretor de Prompt IA.");
      }

      const data = await res.json();
      if (data.enhancedPrompt) {
        setPrompt(data.enhancedPrompt);
      }
    } catch (err: any) {
      console.error("Erro ao enriquecer prompt:", err);
      alert(err.message || "Não foi possível aprimorar o prompt no momento.");
    } finally {
      setIsEnhancingPrompt(false);
    }
  };

  // Insert @mention into prompt
  const insertMention = (tag: string) => {
    const mentionText = `@${tag} `;
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart || prompt.length;
      const end = textareaRef.current.selectionEnd || prompt.length;
      const newPrompt = prompt.substring(0, start) + mentionText + prompt.substring(end);
      setPrompt(newPrompt);
    } else {
      setPrompt((prev) => `${prev} ${mentionText}`);
    }
    setShowMentionPopover(false);
  };

  // Handle Trigger Generate
  const handleTriggerGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    const ratioConfig =
      ASPECT_RATIOS.find((r) => r.value === aspectRatio) || ASPECT_RATIOS[0];

    await onGenerate({
      prompt: prompt.trim(),
      negativePrompt: negativePrompt.trim() || undefined,
      audioPrompt: audioPrompt.trim() || undefined,
      mode: resolvedMode,
      engine: resolvedEngine,
      provider: resolvedEngine === "seedance25_t2v" ? "higgsfield" : "runpod",
      width: ratioConfig.width,
      height: ratioConfig.height,
      aspectRatio,
      quality,
      cameraMotion: activePresets.motion?.name,
      lens: activePresets.lens?.name,
      lighting: activePresets.lighting?.name,
      framing: activePresets.camera?.name,
      batchCount,
      durationSeconds: mode === "video" ? durationSeconds : undefined,
      inputImageStorageId: inputImageStorageId || undefined,
      inputImageUrl: inputImageUrl || undefined,
      lastFrameStorageId: lastFrameStorageId || undefined,
      lastFrameUrl: lastFrameUrl || undefined,
      creditsCost: creditCost,
      elementTagsUsed: usedTags,
    });
  };

  if (isMinimized) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 pb-4 pt-1 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
        <div className="rounded-2xl bg-[#0C0D11]/90 border border-white/15 backdrop-blur-2xl px-4 py-2.5 flex items-center justify-between gap-3 shadow-2xl">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <Badge
              variant="outline"
              className="bg-[#FF5500]/15 border-[#FF5500]/40 text-[#FF5500] font-mono text-[10px] shrink-0"
            >
              {mode === "video" ? "🎬 VÍDEO" : "🖼️ IMAGEM"}
            </Badge>

            <div
              onClick={onToggleMinimize}
              className="truncate text-xs text-zinc-300 font-medium cursor-pointer hover:text-white flex-1"
              title="Clique para expandir o console de criação"
            >
              {prompt.trim() ? (
                <span className="truncate">"{prompt}"</span>
              ) : (
                <span className="text-zinc-500 italic">Console minimizado. Clique para abrir e digitar prompt...</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              onClick={onToggleMinimize}
              variant="outline"
              size="sm"
              className="border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs h-8 gap-1.5 rounded-xl font-medium"
            >
              <ChevronUp className="size-4 text-[#FF5500]" />
              <span>Expandir Console</span>
            </Button>

            <Button
              type="button"
              onClick={handleTriggerGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="bg-[#FF5500] hover:bg-[#FF4500] text-white text-xs font-semibold h-8 px-3.5 rounded-xl shadow-md gap-1.5"
            >
              <Film className="size-3.5" />
              <span>Gerar ({creditCost} cr)</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 pb-6 pt-2">
      {/* Container Principal do Dock Estilo Higgsfield */}
      <div className="relative rounded-2xl bg-[#0C0D11]/95 border border-white/15 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-visible">
        {/* Glow Superior */}
        <div className="absolute -top-1 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-[#FF5500]/60 to-transparent pointer-events-none" />

        {/* 1. Header do Dock: Seletor de Modo (Vídeo / Imagem) + Ajustes Primários */}
        <div className="p-3 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-white/[0.02]">
          {/* Tabs Elegantes de Modo */}
          <div className="flex items-center bg-black/40 rounded-xl p-1 border border-white/10">
            <button
              type="button"
              onClick={() => {
                setMode("video");
                if (selectedEngine === "krea2_turbo") {
                  setSelectedEngine("auto");
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === "video"
                  ? "bg-[#FF5500] text-white shadow-[0_0_15px_rgba(255,85,0,0.4)]"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Video className="size-3.5" />
              <span>Vídeo Cinemático</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("image");
                if (selectedEngine !== "auto" && selectedEngine !== "krea2_turbo") {
                  setSelectedEngine("krea2_turbo");
                }
                if (activePresets.motion) {
                  handleSelectPreset("motion", null);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === "image"
                  ? "bg-[#FF5500] text-white shadow-[0_0_15px_rgba(255,85,0,0.4)]"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <ImageIcon className="size-3.5" />
              <span>Síntese de Imagem</span>
            </button>
          </div>

          {/* Controles de Formato: Proporção + Duração até 15s + Resolução */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Duração em Segundos (Até 15s) no Modo Vídeo */}
            {mode === "video" && (
              <div className="flex items-center gap-1 bg-black/40 rounded-xl px-2.5 py-1 border border-white/10 text-xs">
                <Clock className="size-3.5 text-[#FF5500] mr-1" />
                <span className="text-[11px] font-mono text-zinc-400 hidden sm:inline">Duração:</span>
                <div className="flex items-center gap-1">
                  {VIDEO_DURATIONS.map((dur) => (
                    <button
                      key={dur.value}
                      type="button"
                      onClick={() => setDurationSeconds(dur.value)}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-medium transition-all ${
                        durationSeconds === dur.value
                          ? "bg-[#FF5500] text-white shadow-sm"
                          : "text-zinc-400 hover:text-white hover:bg-white/5"
                      }`}
                      title={dur.label}
                    >
                      {dur.value}s
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Proporção de Tela (Aspect Ratio) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveMenu(activeMenu === "ratio" ? null : "ratio")}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-black/40 hover:bg-white/5 border border-white/10 text-xs text-zinc-300 hover:text-white transition-colors"
              >
                <Ratio className="size-3.5 text-zinc-400" />
                <span className="font-mono">{aspectRatio}</span>
                <ChevronDown className="size-3 text-zinc-500" />
              </button>

              {activeMenu === "ratio" && (
                <div className="absolute top-full right-0 mt-1.5 w-48 rounded-xl bg-[#0D0E12] border border-white/15 p-1.5 shadow-2xl z-50 animate-in fade-in duration-100">
                  {ASPECT_RATIOS.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => {
                        setAspectRatio(r.value);
                        setActiveMenu(null);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs ${
                        aspectRatio === r.value
                          ? "bg-[#FF5500]/15 text-white font-medium"
                          : "text-zinc-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span>{r.label}</span>
                      {aspectRatio === r.value && <Check className="size-3 text-[#FF5500]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Resolução / Qualidade */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveMenu(activeMenu === "quality" ? null : "quality")}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-black/40 hover:bg-white/5 border border-white/10 text-xs text-zinc-300 hover:text-white transition-colors"
              >
                <Maximize2 className="size-3.5 text-zinc-400" />
                <span className="font-mono">{quality}</span>
                <ChevronDown className="size-3 text-zinc-500" />
              </button>

              {activeMenu === "quality" && (
                <div className="absolute top-full right-0 mt-1.5 w-44 rounded-xl bg-[#0D0E12] border border-white/15 p-1.5 shadow-2xl z-50 animate-in fade-in duration-100">
                  {QUALITIES.map((q) => (
                    <button
                      key={q.value}
                      type="button"
                      onClick={() => {
                        setQuality(q.value);
                        setActiveMenu(null);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs ${
                        quality === q.value
                          ? "bg-[#FF5500]/15 text-white font-medium"
                          : "text-zinc-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span>{q.label}</span>
                      {quality === q.value && <Check className="size-3 text-[#FF5500]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Batch Count */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveMenu(activeMenu === "batch" ? null : "batch")}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-black/40 hover:bg-white/5 border border-white/10 text-xs text-zinc-300 hover:text-white transition-colors"
              >
                <Grid2X2 className="size-3.5 text-zinc-400" />
                <span className="font-mono">{batchCount}x</span>
                <ChevronDown className="size-3 text-zinc-500" />
              </button>

              {activeMenu === "batch" && (
                <div className="absolute top-full right-0 mt-1.5 w-32 rounded-xl bg-[#0D0E12] border border-white/15 p-1.5 shadow-2xl z-50 animate-in fade-in duration-100">
                  {[1, 2, 4].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => {
                        setBatchCount(count);
                        setActiveMenu(null);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs ${
                        batchCount === count
                          ? "bg-[#FF5500]/15 text-white font-medium"
                          : "text-zinc-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span>{count === 1 ? "1 cena (1x)" : `${count} cenas (${count}x)`}</span>
                      {batchCount === count && <Check className="size-3 text-[#FF5500]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Botão de Minimizar Console */}
            {onToggleMinimize && (
              <button
                type="button"
                onClick={onToggleMinimize}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-400 hover:text-white transition-colors ml-1"
                title="Minimizar console de criação para dar mais espaço à visualização das mídias"
              >
                <ChevronDown className="size-3.5 text-zinc-400" />
                <span className="hidden sm:inline text-[11px] font-medium">Minimizar</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. Área Ampla de Entrada de Imagens & Prompt */}
        <div className="p-4 space-y-3">
          {/* Barra de Mídias de Entrada (Usar Imagens Geradas ou Upload) */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Slot de Imagem Inicial / I2V */}
            {inputImageUrl ? (
              <div className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-white/[0.04] border border-[#FF5500]/40 group">
                <div className="size-12 rounded-lg overflow-hidden bg-black relative shrink-0">
                  <img src={inputImageUrl} alt="Input" className="w-full h-full object-cover" />
                </div>
                <div className="text-left">
                  <div className="text-[11px] font-semibold text-white">Quadro Inicial (I2V)</div>
                  <div className="text-[10px] text-zinc-400">Imagem ativa para render</div>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <button
                    type="button"
                    onClick={() => {
                      setImagePickerTarget("input");
                      setIsImagePickerOpen(true);
                    }}
                    className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 text-[10px]"
                    title="Trocar Imagem"
                  >
                    Trocar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInputImageUrl(null);
                      setInputImageStorageId(null);
                    }}
                    className="p-1 rounded-md text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
                    title="Remover Imagem"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setImagePickerTarget("input");
                  setIsImagePickerOpen(true);
                }}
                className="border-dashed border-white/20 hover:border-[#FF5500] bg-white/[0.02] hover:bg-white/[0.05] text-zinc-300 hover:text-white text-xs h-10 px-3.5 rounded-xl gap-2 font-medium"
              >
                <Plus className="size-3.5 text-[#FF5500]" />
                <span>
                  {mode === "video" ? "Adicionar Imagem para Animar (I2V)" : "Adicionar Imagem de Referência"}
                </span>
                <Badge variant="outline" className="text-[9px] font-mono border-white/15 bg-white/5 py-0">
                  Cofre ou PC
                </Badge>
              </Button>
            )}

            {/* Slot de Último Quadro (Morphing FLF2V no modo vídeo) */}
            {mode === "video" && (
              <>
                {lastFrameUrl ? (
                  <div className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-purple-500/10 border border-purple-500/40 group">
                    <div className="size-12 rounded-lg overflow-hidden bg-black relative shrink-0">
                      <img src={lastFrameUrl} alt="Last Frame" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-left">
                      <div className="text-[11px] font-semibold text-purple-300">Quadro Final (Morph)</div>
                      <div className="text-[10px] text-purple-400/80">Transição FLF2V</div>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        type="button"
                        onClick={() => {
                          setLastFrameUrl(null);
                          setLastFrameStorageId(null);
                        }}
                        className="p-1 rounded-md text-purple-400 hover:text-red-400 hover:bg-red-500/10"
                        title="Remover Quadro Final"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  inputImageUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setImagePickerTarget("lastFrame");
                        setIsImagePickerOpen(true);
                      }}
                      className="border-dashed border-purple-500/30 hover:border-purple-500 bg-purple-500/[0.03] hover:bg-purple-500/[0.08] text-purple-300 text-xs h-10 px-3 rounded-xl gap-1.5 font-medium"
                    >
                      <Plus className="size-3.5 text-purple-400" />
                      <span>Quadro Final (Morphing)</span>
                    </Button>
                  )
                )}
              </>
            )}
          </div>

          {/* Área de Texto do Prompt (Espaçosa e Limpa) */}
          <div className="relative rounded-xl bg-black/40 border border-white/15 focus-within:border-[#FF5500] focus-within:ring-1 focus-within:ring-[#FF5500]/30 transition-all p-3.5">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => {
                const val = e.target.value;
                setPrompt(val);
                if (val.endsWith("@")) {
                  setShowMentionPopover(true);
                }
              }}
              placeholder={
                mode === "video"
                  ? "Descreva a cena cinematográfica com riqueza de detalhes... Digite @ para incluir personagens, cenários ou veículos do projeto."
                  : "Descreva a imagem em alta definição... Use @ para ancorar rostos e elementos canônicos cadastrados."
              }
              rows={4}
              className="w-full bg-transparent text-sm sm:text-base text-white placeholder:text-zinc-600 focus:outline-none resize-none leading-relaxed"
            />

            {/* Tags Ativas & Barra de Ações Internas do Prompt */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10 gap-2 flex-wrap">
              {/* Chips de Presets e Menções Ativas */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Botão de Invocação de Menções @ */}
                <button
                  type="button"
                  onClick={() => setShowMentionPopover(!showMentionPopover)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 font-mono text-xs font-semibold transition-colors"
                >
                  <Users className="size-3.5" />
                  <span>@ Inserir Personagem</span>
                </button>

                {/* Chips de Presets Cinematográficos Selecionados (com botão X de remoção rápida) */}
                {activePresets.camera && (
                  <Badge
                    variant="outline"
                    className="border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-xs gap-1 py-1"
                  >
                    <span>Câmera: {activePresets.camera.tagLabel}</span>
                    <button
                      onClick={() => handleSelectPreset("camera", null)}
                      className="hover:text-white"
                      title="Remover do prompt"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                )}

                {activePresets.motion && (
                  <Badge
                    variant="outline"
                    className="border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs gap-1 py-1"
                  >
                    <span>Movimento: {activePresets.motion.tagLabel}</span>
                    <button
                      onClick={() => handleSelectPreset("motion", null)}
                      className="hover:text-white"
                      title="Remover do prompt"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                )}

                {activePresets.lens && (
                  <Badge
                    variant="outline"
                    className="border-blue-500/40 bg-blue-500/10 text-blue-300 text-xs gap-1 py-1"
                  >
                    <span>Lente: {activePresets.lens.tagLabel}</span>
                    <button
                      onClick={() => handleSelectPreset("lens", null)}
                      className="hover:text-white"
                      title="Remover do prompt"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                )}

                {activePresets.lighting && (
                  <Badge
                    variant="outline"
                    className="border-yellow-500/40 bg-yellow-500/10 text-yellow-300 text-xs gap-1 py-1"
                  >
                    <span>Luz: {activePresets.lighting.tagLabel}</span>
                    <button
                      onClick={() => handleSelectPreset("lighting", null)}
                      className="hover:text-white"
                      title="Remover do prompt"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                )}

                {activePresets.style && (
                  <Badge
                    variant="outline"
                    className="border-purple-500/40 bg-purple-500/10 text-purple-300 text-xs gap-1 py-1"
                  >
                    <span>Estilo: {activePresets.style.tagLabel}</span>
                    <button
                      onClick={() => handleSelectPreset("style", null)}
                      className="hover:text-white"
                      title="Remover do prompt"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                )}

                {/* Tags @ inseridas */}
                {usedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="border-purple-500/40 bg-purple-500/20 text-purple-200 text-xs font-mono py-1 px-2"
                  >
                    @{tag}
                  </Badge>
                ))}
              </div>

              {/* Botão de Enriquecer Prompt com IA */}
              <button
                type="button"
                onClick={handleEnhancePrompt}
                disabled={!prompt.trim() || isEnhancingPrompt}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FF5500]/20 to-amber-500/20 hover:from-[#FF5500]/30 hover:to-amber-500/30 border border-[#FF5500]/40 text-[#FF5500] hover:text-white text-xs font-semibold transition-all disabled:opacity-40"
              >
                {isEnhancingPrompt ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Sparkles className="size-3.5 text-[#FF5500]" />
                )}
                <span>{isEnhancingPrompt ? "Diretor IA Otimizando..." : "Melhorar Prompt ✨"}</span>
              </button>
            </div>

            {/* Popover de Autocomplete de @mentions */}
            {showMentionPopover && (
              <div className="absolute bottom-full left-4 mb-2 w-80 rounded-2xl bg-[#0D0E12] border border-white/20 p-2.5 shadow-2xl z-50 backdrop-blur-2xl animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-xs">
                  <span className="font-semibold text-white">Personagens & Elementos (@)</span>
                  <button
                    onClick={() => setShowMentionPopover(false)}
                    className="text-zinc-500 hover:text-white"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>

                {elements.length === 0 ? (
                  <div className="text-xs text-zinc-500 p-3 text-center">
                    Nenhum elemento cadastrado. Vá em "Atores & Elementos (@)" na barra lateral para criar um personagem com foto de referência.
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
                    {elements.map((el) => (
                      <button
                        key={el._id}
                        type="button"
                        onClick={() => insertMention(el.tag)}
                        className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 text-left text-xs text-zinc-300 hover:text-white transition-colors"
                      >
                        <div className="size-8 rounded-lg bg-purple-500/20 border border-purple-500/30 overflow-hidden shrink-0 flex items-center justify-center">
                          {el.referenceImageUrl ? (
                            <img src={el.referenceImageUrl} alt={el.name} className="w-full h-full object-cover" />
                          ) : (
                            <Users className="size-4 text-purple-400" />
                          )}
                        </div>
                        <div className="truncate">
                          <div className="font-mono text-purple-300 font-bold">@{el.tag}</div>
                          <div className="text-[10px] text-zinc-500 truncate">{el.name}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Campo Opcional de Sonoplastia Nativa (Para Motores com Áudio) */}
          {mode === "video" && (
            <div className="flex items-center gap-2 bg-black/20 rounded-xl px-3 py-2 border border-white/5">
              <Volume2 className="size-4 text-blue-400 shrink-0" />
              <input
                type="text"
                value={audioPrompt}
                onChange={(e) => setAudioPrompt(e.target.value)}
                placeholder="Pistas de áudio/sonoplastia nativa (ex: passos molhados no asfalto, foley de jaqueta, chuva suave, trilha sintetizador 80s)..."
                className="w-full bg-transparent text-xs text-zinc-300 placeholder:text-zinc-600 focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* 3. Barra de Ferramentas Cinematográficas (Botões de Modais com Exemplos) */}
        <div className="px-4 py-2.5 border-t border-white/10 flex items-center justify-between gap-2 flex-wrap bg-white/[0.01]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] uppercase font-mono text-zinc-500 font-semibold mr-1">
              Direção:
            </span>

            {/* Botão Modal 1: Câmera & Enquadramento */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setActivePresetModal("camera")}
              className={`text-xs h-8 gap-1.5 rounded-xl border transition-all ${
                activePresets.camera
                  ? "bg-emerald-500/15 border-emerald-500 text-white font-medium shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                  : "bg-white/5 border-white/10 text-zinc-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <Camera className="size-3.5 text-emerald-400" />
              <span>
                {activePresets.camera
                  ? activePresets.camera.tagLabel
                  : mode === "video"
                  ? "Enquadramento"
                  : "Composição"}
              </span>
              <ChevronDown className="size-3 text-zinc-500" />
            </Button>

            {/* Botão Modal 2: Movimento de Câmera (Exclusivo do Modo Vídeo) */}
            {mode === "video" && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setActivePresetModal("motion")}
                className={`text-xs h-8 gap-1.5 rounded-xl border transition-all ${
                  activePresets.motion
                    ? "bg-amber-500/15 border-amber-500 text-white font-medium shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                    : "bg-white/5 border-white/10 text-zinc-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <Film className="size-3.5 text-amber-400" />
                <span>{activePresets.motion ? activePresets.motion.tagLabel : "Movimento"}</span>
                <ChevronDown className="size-3 text-zinc-500" />
              </Button>
            )}

            {/* Botão Modal 3: Lente & Óptica */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setActivePresetModal("lens")}
              className={`text-xs h-8 gap-1.5 rounded-xl border transition-all ${
                activePresets.lens
                  ? "bg-blue-500/15 border-blue-500 text-white font-medium shadow-[0_0_12px_rgba(59,130,246,0.2)]"
                  : "bg-white/5 border-white/10 text-zinc-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <Aperture className="size-3.5 text-blue-400" />
              <span>{activePresets.lens ? activePresets.lens.tagLabel : "Lente"}</span>
              <ChevronDown className="size-3 text-zinc-500" />
            </Button>

            {/* Botão Modal 4: Iluminação */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setActivePresetModal("lighting")}
              className={`text-xs h-8 gap-1.5 rounded-xl border transition-all ${
                activePresets.lighting
                  ? "bg-yellow-500/15 border-yellow-500 text-white font-medium shadow-[0_0_12px_rgba(234,179,8,0.2)]"
                  : "bg-white/5 border-white/10 text-zinc-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <Sun className="size-3.5 text-yellow-400" />
              <span>{activePresets.lighting ? activePresets.lighting.tagLabel : "Iluminação"}</span>
              <ChevronDown className="size-3 text-zinc-500" />
            </Button>

            {/* Botão Modal 5: Estilo Fotográfico & Textura (Exclusivo do Modo Imagem) */}
            {mode === "image" && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setActivePresetModal("style")}
                className={`text-xs h-8 gap-1.5 rounded-xl border transition-all ${
                  activePresets.style
                    ? "bg-purple-500/15 border-purple-500 text-white font-medium shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                    : "bg-white/5 border-white/10 text-zinc-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <Palette className="size-3.5 text-purple-400" />
                <span>{activePresets.style ? activePresets.style.tagLabel : "Estilo Fotográfico"}</span>
                <ChevronDown className="size-3 text-zinc-500" />
              </Button>
            )}
          </div>

          {/* Motor de Renderização (Modo Auto / Seleção) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveMenu(activeMenu === "engine" ? null : "engine")}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-300 hover:text-white transition-colors"
            >
              <Sliders className="size-3 text-[#FF5500]" />
              <span className="font-mono text-[11px]">
                {selectedEngine === "auto" ? "Motor: Auto ✨" : selectedEngine}
              </span>
              <ChevronDown className="size-3 text-zinc-500" />
            </button>

            {activeMenu === "engine" && (
              <div className="absolute bottom-full right-0 mb-2 w-64 rounded-2xl bg-[#0D0E12] border border-white/15 p-2 shadow-2xl z-50 animate-in fade-in duration-100">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedEngine("auto");
                    setActiveMenu(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs ${
                    selectedEngine === "auto"
                      ? "bg-[#FF5500]/15 text-white font-medium"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="text-left">
                    <div className="font-semibold text-white">Modo Auto ✨</div>
                    <div className="text-[10px] text-zinc-500">Aloca o motor ideal automaticamente</div>
                  </div>
                  {selectedEngine === "auto" && <Check className="size-3.5 text-[#FF5500]" />}
                </button>

                <div className="my-1 border-t border-white/10" />

                <button
                  type="button"
                  onClick={() => {
                    setSelectedEngine("krea2_turbo");
                    setMode("image");
                    setActiveMenu(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs ${
                    selectedEngine === "krea2_turbo"
                      ? "bg-[#FF5500]/15 text-white font-medium"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="text-left">
                    <div className="font-semibold text-white">Krea-2 Turbo</div>
                    <div className="text-[10px] text-zinc-500">Imagens 8k ultra-rápidas</div>
                  </div>
                  {selectedEngine === "krea2_turbo" && <Check className="size-3.5 text-[#FF5500]" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedEngine("fasth3_i2v");
                    setMode("video");
                    setActiveMenu(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs ${
                    selectedEngine === "fasth3_i2v"
                      ? "bg-[#FF5500]/15 text-white font-medium"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="text-left">
                    <div className="font-semibold text-white">FastH3 com Áudio</div>
                    <div className="text-[10px] text-zinc-500">Vídeo fluido e sonoplastia sincronizada</div>
                  </div>
                  {selectedEngine === "fasth3_i2v" && <Check className="size-3.5 text-[#FF5500]" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedEngine("seedance25_t2v");
                    setMode("video");
                    setActiveMenu(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs ${
                    selectedEngine === "seedance25_t2v"
                      ? "bg-[#FF5500]/15 text-white font-medium"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="text-left">
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <span>Seedance 2.5 Cinema</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#00E5FF]/20 text-[#00E5FF] font-mono">Higgsfield API</span>
                    </div>
                    <div className="text-[10px] text-zinc-500">Multimodal até 30s com áudio nativo</div>
                  </div>
                  {selectedEngine === "seedance25_t2v" && <Check className="size-3.5 text-[#FF5500]" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedEngine("fasth3_t2v_720p");
                    setMode("video");
                    setActiveMenu(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs ${
                    selectedEngine === "fasth3_t2v_720p"
                      ? "bg-[#FF5500]/15 text-white font-medium"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="text-left">
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <span>FastVideo H3 720p</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-mono">RunPod</span>
                    </div>
                    <div className="text-[10px] text-zinc-500">Renderização ComfyUI com áudio</div>
                  </div>
                  {selectedEngine === "fasth3_t2v_720p" && <Check className="size-3.5 text-[#FF5500]" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedEngine("ltx25_i2v");
                    setMode("video");
                    setActiveMenu(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs ${
                    selectedEngine === "ltx25_i2v"
                      ? "bg-[#FF5500]/15 text-white font-medium"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="text-left">
                    <div className="font-semibold text-white">LTX-2.5 Distilled HD</div>
                    <div className="text-[10px] text-zinc-500">Cadência cinemática 24fps</div>
                  </div>
                  {selectedEngine === "ltx25_i2v" && <Check className="size-3.5 text-[#FF5500]" />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 4. Rodapé do Dock: Botão de Disparo & Custo em Créditos */}
        <div className="px-4 py-3 bg-black/50 border-t border-white/10 flex items-center justify-between gap-4 rounded-b-2xl">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span>Motor:</span>
            <Badge
              variant="outline"
              className="bg-white/5 border-white/15 text-zinc-300 font-mono text-[11px]"
            >
              {resolvedEngine}
            </Badge>
            {mode === "video" && (
              <span className="text-zinc-500 font-mono text-[11px] hidden sm:inline">
                • {durationSeconds}s • {aspectRatio}
              </span>
            )}
          </div>

          {/* Botão de Disparo */}
          <div className="flex items-center gap-3">
            {isGenerating && onCancelGeneration && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCancelGeneration}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs h-10 px-4 rounded-xl"
              >
                Cancelar
              </Button>
            )}

            <Button
              type="button"
              onClick={handleTriggerGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="bg-gradient-to-r from-[#FF5500] via-[#FF4500] to-[#E03D00] hover:brightness-110 text-white font-bold text-xs sm:text-sm px-7 h-11 rounded-xl shadow-[0_0_25px_rgba(255,85,0,0.4)] transition-all duration-300 disabled:opacity-50 disabled:shadow-none min-w-[210px]"
            >
              {isGenerating ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  <span>{generationProgress?.message || "Renderizando Cena..."}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <Film className="size-4" />
                  <span>GERAR CENA</span>
                  <span className="font-mono text-xs bg-black/40 px-2 py-0.5 rounded-full border border-white/20">
                    ✨ {creditCost} {creditCost === 1 ? "crédito" : "créditos"}
                  </span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Modais de Presets Cinematográficos */}
      {activePresetModal && (
        <CinemaPresetsModal
          isOpen={true}
          onClose={() => setActivePresetModal(null)}
          category={activePresetModal}
          selectedId={activePresets[activePresetModal]?.id || null}
          onSelect={(preset) => handleSelectPreset(activePresetModal, preset)}
        />
      )}

      {/* Modal de Escolha de Imagem (Cofre ou Upload Local) */}
      <VaultImagePickerModal
        isOpen={isImagePickerOpen}
        onClose={() => setIsImagePickerOpen(false)}
        title={
          imagePickerTarget === "input"
            ? "Selecionar Imagem para Animar (I2V) / Referência"
            : "Selecionar Quadro Final para Morphing (FLF2V)"
        }
        subtitle="Escolha uma das suas imagens geradas anteriormente ou faça upload do computador."
        isUploading={isUploadingInput}
        onSelectImage={(url, storageId) => {
          if (imagePickerTarget === "input") {
            setInputImageUrl(url);
            setInputImageStorageId(storageId || null);
            setMode("video");
          } else {
            setLastFrameUrl(url);
            setLastFrameStorageId(storageId || null);
          }
        }}
        onUploadLocalFile={(file) => handleLocalFileUpload(file, imagePickerTarget)}
      />
    </div>
  );
}
