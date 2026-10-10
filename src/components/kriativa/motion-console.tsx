"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Camera,
  RotateCw,
  ArrowRight,
  Maximize2,
  Cpu,
  Flame,
} from "lucide-react";

const PROMPT_PRESETS = [
  {
    title: "Cyberpunk Tokyo Rain",
    prompt:
      "Close cinematográfico em 8K, iluminação neon azul e âmbar, mulher cyberpunk sob chuva torrencial, lente anamórfica 35mm, reflexos volumétricos no asfalto molhado.",
    aspect: "2.39:1",
    camera: "Dolly In Lento",
    fps: "60 FPS",
    tag: "Sci-Fi",
  },
  {
    title: "Editorial de Alta Costura",
    prompt:
      "Modelo com vestido de seda esvoaçante no deserto de areia branca, luz de golden hour alaranjada, brisa suave, textura de tecido hiper-realista, profundidade f/1.4.",
    aspect: "9:16",
    camera: "Orbit 360°",
    fps: "120 FPS Slow-Mo",
    tag: "Fashion",
  },
  {
    title: "Perseguição Drone FPV",
    prompt:
      "Voo rasante de drone FPV entre arranha-céus futuristas de vidro em alta velocidade, pôr do sol alaranjado, lens flare solar sutil, névoa volumétrica.",
    aspect: "16:9",
    camera: "FPV Chase",
    fps: "60 FPS",
    tag: "Action",
  },
];

const ASPECT_RATIOS = [
  { label: "16:9", desc: "Cinema / YouTube" },
  { label: "9:16", desc: "TikTok / Reels" },
  { label: "2.39:1", desc: "Anamorphic Ultra" },
  { label: "1:1", desc: "Square Feed" },
];

const CAMERA_MOTIONS = [
  "Dolly Zoom (Vertigo)",
  "FPV Drone Chase",
  "Orbit 360°",
  "Pan Horizontal",
  "Crane Shot Up",
];

export function MotionConsole() {
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [promptText, setPromptText] = useState(PROMPT_PRESETS[0].prompt);
  const [selectedAspect, setSelectedAspect] = useState(PROMPT_PRESETS[0].aspect);
  const [selectedCamera, setSelectedCamera] = useState(PROMPT_PRESETS[0].camera);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string | null>(null);

  const handleSelectPreset = (idx: number) => {
    setSelectedPreset(idx);
    setPromptText(PROMPT_PRESETS[idx].prompt);
    setSelectedAspect(PROMPT_PRESETS[idx].aspect);
    setSelectedCamera(PROMPT_PRESETS[idx].camera);
    setGenerationStep(null);
  };

  const handleSimulateGenerate = () => {
    setIsGenerating(true);
    setGenerationStep("Calculando vetores de câmera 3D...");

    setTimeout(() => {
      setGenerationStep("Sintetizando iluminação solar volumétrica e física...");
    }, 900);

    setTimeout(() => {
      setGenerationStep("Renderizando 120 frames cinematográficos...");
    }, 1800);

    setTimeout(() => {
      setIsGenerating(false);
      setGenerationStep("Tomada gerada com sucesso! Faça login para salvar em 4K.");
    }, 2800);
  };

  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl border border-white/15 bg-[#0C0D12]/95 backdrop-blur-2xl p-5 sm:p-7 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
      {/* Top Console Glow Accent in Solar Flare */}
      <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-[#FF5500] to-transparent opacity-80" />

      {/* Console Header / Telemetry HUD */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-[#FF5500] animate-pulse" />
          <span className="font-heading font-bold uppercase tracking-wider text-white text-xs">
            Kriativa Studio Console
          </span>
          <Badge
            variant="outline"
            className="text-[10px] font-mono border-[#FF5500]/40 text-[#FF5500] bg-[#FF5500]/10"
          >
            Motor Ativo
          </Badge>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
          <span className="hidden sm:inline">LENS: 35mm ANAMORPHIC</span>
          <span className="hidden sm:inline text-white/20">•</span>
          <span>4K UHD 60FPS</span>
          <span className="text-white/20">•</span>
          <span className="text-[#FF5500] font-semibold">ESTÚDIO ATIVO</span>
        </div>
      </div>

      {/* Preset Chips */}
      <div className="pt-5 flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground font-medium mr-1 flex items-center gap-1.5 font-sans">
          <Flame className="size-3.5 text-[#FF5500]" />
          Exemplos cinematográficos:
        </span>
        {PROMPT_PRESETS.map((p, idx) => (
          <button
            key={p.title}
            type="button"
            onClick={() => handleSelectPreset(idx)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-heading font-medium transition-all cursor-pointer ${
              selectedPreset === idx
                ? "bg-[#FF5500] text-white font-bold shadow-[0_0_15px_rgba(255,85,0,0.4)]"
                : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white border border-white/10"
            }`}
          >
            {p.title}
          </button>
        ))}
      </div>

      {/* Prompt Textarea */}
      <div className="pt-3.5">
        <div className="relative">
          <textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            rows={3}
            className="w-full rounded-2xl bg-black/70 border border-white/15 p-4 text-sm sm:text-base text-foreground focus:outline-none focus:border-[#FF5500] focus:ring-2 focus:ring-[#FF5500]/30 resize-none font-sans placeholder:text-muted-foreground transition-all leading-relaxed"
            placeholder="Descreva a tomada cinematográfica, iluminação, lente e dinâmica de movimento..."
          />
          <div className="absolute right-3.5 bottom-3.5 flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground bg-black/80 px-2.5 py-1 rounded-md border border-white/10">
            <Cpu className="size-3 text-[#FF5500]" />
            <span>Kriativa Diffusion Engine</span>
          </div>
        </div>
      </div>

      {/* Controls Bar: Aspect Ratio + Camera Motions + Generate Button */}
      <div className="pt-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Aspect Ratio Selector */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground mr-1 flex items-center gap-1 font-mono">
            <Maximize2 className="size-3" />
            Aspect:
          </span>
          {ASPECT_RATIOS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => setSelectedAspect(item.label)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                selectedAspect === item.label
                  ? "bg-white/20 text-white border border-[#FF5500] font-bold"
                  : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white border border-white/5"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Camera Trajectory Select */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
            <Camera className="size-3 text-[#00E5FF]" />
            Câmera:
          </span>
          <select
            value={selectedCamera}
            onChange={(e) => setSelectedCamera(e.target.value)}
            className="bg-black/70 border border-white/15 rounded-lg px-3 py-1.5 text-xs font-mono text-foreground focus:outline-none focus:border-[#FF5500]"
          >
            {CAMERA_MOTIONS.map((m) => (
              <option key={m} value={m} className="bg-[#0C0D12] text-foreground">
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Generate Button in Solar Flare */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSimulateGenerate}
            disabled={isGenerating || !promptText.trim()}
            className="w-full md:w-auto px-7 py-3 rounded-xl font-heading font-bold text-sm bg-[#FF5500] text-white hover:bg-[#ff681a] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_30px_rgba(255,85,0,0.45)] disabled:opacity-60"
          >
            {isGenerating ? (
              <>
                <RotateCw className="size-4 animate-spin" />
                <span>Renderizando...</span>
              </>
            ) : (
              <>
                <Sparkles className="size-4 fill-white" />
                <span>Generate Motion</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Live Generation Feedback / Simulator Notice */}
      {generationStep && (
        <div className="mt-4 p-3.5 rounded-xl bg-black/90 border border-[#FF5500]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <div className="size-2 rounded-full bg-[#FF5500] animate-ping" />
            <span className="font-mono text-[#FF5500] font-semibold">{generationStep}</span>
          </div>

          <Link
            href="/dashboard"
            className="text-xs text-white hover:text-[#FF5500] flex items-center gap-1 font-semibold underline underline-offset-4"
          >
            Abrir Studio Protegido
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
