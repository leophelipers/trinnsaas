"use client";

import { useState } from "react";
import {
  Sparkles,
  Terminal,
  Code2,
  Play,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Download,
  Eye,
  Film,
  Camera,
  Layers,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Sliders,
  Send,
  RotateCcw,
  Bot,
  User,
  ExternalLink,
  History,
  FileCode,
  FileText,
  Activity,
  CheckCircle2,
  Share2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ChatArtifactsPreviewProps {
  theme: "convex" | "clerk" | "shadcn" | "solar";
  accentColor: string;
}

interface Artifact {
  id: string;
  title: string;
  filename: string;
  type: "react" | "glsl" | "markdown";
  language: string;
  lines: number;
  description: string;
  code: string;
}

const SAMPLE_ARTIFACTS: Record<string, Artifact> = {
  camera: {
    id: "camera",
    title: "Player de Câmera Anamórfica 3D",
    filename: "CameraAnamorphicPlayer.tsx",
    type: "react",
    language: "typescript",
    lines: 74,
    description: "Componente React com HUD de direção, controle de lente 2.39:1, abertura de diafragma e profundidade de campo.",
    code: `import React, { useState } from "react";
import { Camera, Sliders, Film, Eye } from "lucide-react";

export function CameraAnamorphicPlayer() {
  const [focalLength, setFocalLength] = useState(50); // 35mm, 50mm, 85mm
  const [aspectRatio, setAspectRatio] = useState<"2.39" | "16:9">("2.39");
  const [aperture, setAperture] = useState("f/1.4");
  const [anamorphicFlare, setAnamorphicFlare] = useState(true);

  return (
    <div className="relative w-full rounded-2xl bg-[#08090C] border border-white/10 overflow-hidden shadow-2xl">
      {/* Viewport de Pré-visualização com Proporção Cinemática */}
      <div className={\`relative w-full \${aspectRatio === "2.39" ? "aspect-[2.39/1]" : "aspect-video"} bg-[#050608] flex items-center justify-center overflow-hidden\`}>
        {/* HUD de Câmera Overlay */}
        <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between border border-white/5">
          <div className="flex justify-between items-center text-[10px] font-mono text-emerald-400">
            <span className="flex items-center gap-1.5 bg-black/60 backdrop-blur px-2 py-0.5 rounded border border-emerald-500/30">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              REC • 24.000 FPS • 4K DCI
            </span>
            <span className="bg-black/60 backdrop-blur px-2 py-0.5 rounded text-neutral-400 border border-white/10">
              ISO 800 • 1/48s • {aperture}
            </span>
          </div>

          {/* Mira e Retículo Central */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-20 border border-white/20 rounded-full flex items-center justify-center">
            <div className="size-1 rounded-full bg-emerald-400" />
            <div className="absolute w-full h-[1px] bg-white/10" />
            <div className="absolute h-full w-[1px] bg-white/10" />
          </div>

          {/* Linhas Guia Anamórficas */}
          {anamorphicFlare && (
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-blue-500/10 pointer-events-none mix-blend-screen" />
          )}

          <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400">
            <span>Lente Anamórfica {focalLength}mm T1.5</span>
            <span>Estúdio Ativo • Motor Kriativa</span>
          </div>
        </div>
      </div>

      {/* Barra de Controles Táteis */}
      <div className="p-4 bg-[#0E1017] border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setAspectRatio("2.39")}
            className={\`px-2.5 py-1 rounded-lg font-mono text-[11px] \${aspectRatio === "2.39" ? "bg-white text-black font-bold" : "bg-white/5 text-neutral-400"}\`}
          >
            2.39:1 Cinema
          </button>
          <button 
            onClick={() => setAspectRatio("16:9")}
            className={\`px-2.5 py-1 rounded-lg font-mono text-[11px] \${aspectRatio === "16:9" ? "bg-white text-black font-bold" : "bg-white/5 text-neutral-400"}\`}
          >
            16:9 Digital
          </button>
        </div>
        <div className="flex items-center gap-2 text-neutral-300 font-mono text-[11px]">
          <span>Focal: {focalLength}mm</span>
          <input 
            type="range" min="24" max="135" step="10" 
            value={focalLength} 
            onChange={(e) => setFocalLength(Number(e.target.value))}
            className="accent-white cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}`,
  },
  shader: {
    id: "shader",
    title: "Shader GLSL de Flares Anamórficos",
    filename: "AnamorphicLens.glsl",
    type: "glsl",
    language: "glsl",
    lines: 48,
    description: "Fragment shader otimizado para simulação de aberração cromática e reflexos horizontais de lentes anamórficas.",
    code: `// Fragment Shader: Simulação de Lentes Anamórficas Virtuais
precision highp float;

uniform sampler2D u_SceneTexture;
uniform vec2 u_Resolution;
uniform float u_FlareIntensity;
uniform float u_Distortion;

varying vec2 v_TexCoord;

vec3 chromaticAberration(sampler2D tex, vec2 uv, float offset) {
    vec2 dir = uv - vec2(0.5);
    float r = texture2D(tex, uv - dir * offset * 0.02).r;
    float g = texture2D(tex, uv).g;
    float b = texture2D(tex, uv + dir * offset * 0.02).b;
    return vec3(r, g, b);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_Resolution.xy;
    
    // Deformação cilíndrica de lente anamórfica 2.0x
    vec2 centeredUV = uv - 0.5;
    float dist = dot(centeredUV, centeredUV);
    vec2 distortedUV = uv + centeredUV * (dist * u_Distortion * 0.05);

    // Aberração cromática sutil nas bordas
    vec3 color = chromaticAberration(u_SceneTexture, distortedUV, u_FlareIntensity);

    // Faixa de flare azul horizontal clássica de lente anamórfica
    float streak = exp(-pow(distortedUV.y - 0.5, 2.0) * 120.0) * u_FlareIntensity;
    vec3 flareColor = vec3(0.0, 0.6, 1.0) * streak * 0.35;

    gl_FragColor = vec4(color + flareColor, 1.0);
}`,
  },
};

export function ChatArtifactsPreview({ theme, accentColor }: ChatArtifactsPreviewProps) {
  const [selectedArtifactId, setSelectedArtifactId] = useState<string>("camera");
  const [activeCanvasTab, setActiveCanvasTab] = useState<"preview" | "code" | "diff">("preview");
  const [isThinkingOpen, setIsThinkingOpen] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [chatInput, setChatInput] = useState("");

  // Estado interativo do Preview do Artefato
  const [simAspect, setSimAspect] = useState<"2.39" | "16:9">("2.39");
  const [simFocal, setSimFocal] = useState(50);
  const [simAperture, setSimAperture] = useState("f/1.4");
  const [simFlare, setSimFlare] = useState(true);

  const activeArtifact = SAMPLE_ARTIFACTS[selectedArtifactId] || SAMPLE_ARTIFACTS.camera;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeArtifact.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className={`rounded-3xl border border-white/10 bg-[#07080B] overflow-hidden shadow-2xl transition-all duration-300 ${isFullScreen ? "fixed inset-4 z-50 rounded-2xl" : "relative"}`}>
      {/* BARRA SUPERIOR DO STUDIO (ESTILO CONVEX + CLERK) */}
      <div className="h-14 px-5 bg-[#0C0D14] border-b border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-white tracking-tight flex items-center gap-1.5">
              Kriativa Studio Chat
              <Badge variant="outline" className="border-white/10 text-[10px] font-mono bg-white/5 py-0">
                Artefatos v2
              </Badge>
            </span>
          </div>
          <span className="text-white/20">|</span>
          <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-400 font-mono">
            <Terminal className="size-3 text-neutral-500" />
            <span>Motor: kriativa-code (32B)</span>
            <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded text-[10px]">
              12ms Realtime
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border border-white/10 transition-all text-xs flex items-center gap-1.5"
            title="Alternar tela cheia"
          >
            {isFullScreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
            <span className="hidden sm:inline">{isFullScreen ? "Reduzir" : "Expandir"}</span>
          </button>
        </div>
      </div>

      {/* LAYOUT DIVIDIDO (SPLIT-VIEW: CHAT À ESQUERDA | ARTEFATO À DIREITA) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[640px] divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08]">
        {/* ===================== COLUNA ESQUERDA: CHAT THREAD ===================== */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-[#08090E] p-4 sm:p-5 space-y-4">
          <div className="space-y-4 overflow-y-auto max-h-[520px] pr-1">
            {/* Mensagem 1: Usuário (Estilo Clerk Account Bubble) */}
            <div className="flex items-start gap-3 justify-end">
              <div className="max-w-[85%] rounded-2xl p-4 bg-[#141620] border border-white/10 text-xs text-white shadow-sm space-y-1">
                <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono mb-1">
                  <span>Você • Diretor</span>
                  <span>14:02</span>
                </div>
                <p className="leading-relaxed">
                  Crie um componente React com Tailwind para o player de câmera anamórfica 3D do nosso estúdio, com controles de proporção 2.39:1, distância focal e profundidade de campo.
                </p>
              </div>
              <div className="size-7 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5">
                LP
              </div>
            </div>

            {/* Mensagem 2: Modelo IA (Estilo Convex Reactive com Thought Process e Artefato) */}
            <div className="flex items-start gap-3">
              <div
                className="size-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-sm"
                style={{
                  background: theme === "shadcn" ? "#FFFFFF" : accentColor,
                  color: theme === "shadcn" ? "#000000" : "#FFFFFF",
                }}
              >
                <Sparkles className="size-3.5" />
              </div>

              <div className="max-w-[92%] space-y-3">
                {/* Collapsible Reasoning Block (Cadeia de Pensamento) */}
                <div className="rounded-xl border border-white/[0.08] bg-[#0C0E16] overflow-hidden text-xs">
                  <button
                    onClick={() => setIsThinkingOpen(!isThinkingOpen)}
                    className="w-full px-3 py-2 flex items-center justify-between text-neutral-400 hover:text-white transition-colors bg-white/[0.02]"
                  >
                    <span className="flex items-center gap-2 font-mono text-[11px]">
                      <Activity className="size-3 text-purple-400" />
                      Cadeia de Raciocínio (1.4s)
                    </span>
                    {isThinkingOpen ? (
                      <ChevronDown className="size-3.5 text-neutral-500" />
                    ) : (
                      <ChevronRight className="size-3.5 text-neutral-500" />
                    )}
                  </button>

                  {isThinkingOpen && (
                    <div className="px-3.5 py-2.5 border-t border-white/[0.06] text-[11px] text-neutral-400 font-mono space-y-1 leading-relaxed bg-[#0A0B10]">
                      <p>1. Analisando especificações óticas anamórficas (proporção 2.39:1 CinemaScope).</p>
                      <p>2. Adicionando HUD com medições de ISO, obturador e taxa de 24fps.</p>
                      <p>3. Integrando acentos táteis com Tailwind v4 e controle de profundidade de campo.</p>
                    </div>
                  )}
                </div>

                {/* Resposta do Modelo */}
                <div className="rounded-2xl p-4 bg-[#0F1118] border border-white/[0.08] text-xs text-neutral-300 leading-relaxed space-y-3">
                  <p>
                    Desenvolvi o componente completo de câmera anamórfica em React e Tailwind, pronto para ser conectado ao motor do estúdio com controles de proporção cinemática em tempo real.
                  </p>

                  {/* CARTÃO DO ARTEFATO GERADO (CLIQUE PARA ABRIR NO CANVAS) */}
                  <div
                    onClick={() => setSelectedArtifactId("camera")}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer group ${
                      selectedArtifactId === "camera"
                        ? "bg-white/[0.06] border-white/30 ring-1 ring-white/20"
                        : "bg-[#141622] border-white/10 hover:border-white/20 hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded-md bg-white/10 text-white">
                          <FileCode className="size-4" />
                        </span>
                        <div>
                          <span className="font-semibold text-white block text-xs group-hover:underline">
                            CameraAnamorphicPlayer.tsx
                          </span>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            React • 74 linhas • HUD Anamórfico
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Artefato Pronto
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-400 line-clamp-1">
                      Visualizar preview interativo e código fonte no painel ao lado ➔
                    </div>
                  </div>

                  {/* Segundo Artefato Sugerido: Shader de Suporte */}
                  <div
                    onClick={() => setSelectedArtifactId("shader")}
                    className={`p-3 rounded-xl border transition-all cursor-pointer group text-xs ${
                      selectedArtifactId === "shader"
                        ? "bg-white/[0.06] border-white/30 ring-1 ring-white/20"
                        : "bg-[#141622]/60 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded-md bg-cyan-500/10 text-cyan-400">
                          <Code2 className="size-3.5" />
                        </span>
                        <span className="font-mono text-neutral-200 text-xs">
                          AnamorphicLens.glsl
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400">
                        Shader GLSL
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* INPUT BAR DO CHAT (ESTILO SHADCN / CLERK ELEVATED) */}
          <div className="pt-2">
            <div className="relative rounded-2xl bg-[#0F1118] border border-white/10 focus-within:border-white/30 p-2.5 transition-all shadow-inner">
              <textarea
                rows={2}
                placeholder="Solicite ajustes na câmera, novos shaders ou variações de cena..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="w-full bg-transparent text-xs text-white placeholder:text-neutral-500 resize-none outline-none font-sans"
              />
              <div className="flex items-center justify-between pt-1 border-t border-white/[0.06]">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-400">
                  <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5">
                    kriativa-code
                  </span>
                  <span>1,420 tokens livres</span>
                </div>
                <button
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                  style={{
                    background: theme === "shadcn" ? "#FFFFFF" : accentColor,
                    color: theme === "shadcn" ? "#000000" : "#FFFFFF",
                  }}
                >
                  <Send className="size-3" />
                  <span>Enviar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ===================== COLUNA DIREITA: CANVAS DE ARTEFATOS ===================== */}
        <div className="lg:col-span-7 flex flex-col bg-[#090A10] justify-between">
          {/* HEADER DO CANVAS DE ARTEFATOS */}
          <div className="h-14 px-5 bg-[#0D0E16] border-b border-white/[0.08] flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="p-1 rounded-md bg-white/10 text-white">
                <FileCode className="size-4" />
              </span>
              <div className="truncate">
                <span className="font-semibold text-white text-xs font-mono block truncate">
                  {activeArtifact.filename}
                </span>
                <span className="text-[10px] text-neutral-400 block truncate">
                  {activeArtifact.title}
                </span>
              </div>
            </div>

            {/* ABAS DO CANVAS: PREVIEW | CÓDIGO | HISTÓRICO */}
            <div className="flex items-center gap-1 bg-[#141622] p-1 rounded-xl border border-white/10 shrink-0">
              <button
                onClick={() => setActiveCanvasTab("preview")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeCanvasTab === "preview"
                    ? "bg-white text-black font-semibold shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Eye className="size-3" />
                <span>Preview</span>
              </button>
              <button
                onClick={() => setActiveCanvasTab("code")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeCanvasTab === "code"
                    ? "bg-white text-black font-semibold shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Code2 className="size-3" />
                <span>Código</span>
              </button>
            </div>

            {/* AÇÕES: COPIAR | DOWNLOAD */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleCopy}
                className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-neutral-300 hover:text-white flex items-center gap-1.5 transition-all"
                title="Copiar Código"
              >
                {copiedCode ? (
                  <>
                    <Check className="size-3 text-emerald-400" />
                    <span className="text-emerald-400 text-[11px]">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3" />
                    <span className="text-[11px]">Copiar</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* CORPO DO CANVAS */}
          <div className="flex-1 p-5 overflow-y-auto max-h-[580px]">
            {activeCanvasTab === "preview" ? (
              /* ================== PREVIEW INTERATIVO DO ARTEFATO ================== */
              <div className="space-y-4">
                <div className="relative w-full rounded-2xl bg-[#060709] border border-white/10 overflow-hidden shadow-2xl">
                  {/* Viewport 3D Simulado */}
                  <div
                    className={`relative w-full transition-all duration-300 ${
                      simAspect === "2.39" ? "aspect-[2.39/1]" : "aspect-video"
                    } bg-[#040507] flex items-center justify-center overflow-hidden`}
                  >
                    {/* Efeito de Lente e Grade Virtual */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15),transparent_70%)] pointer-events-none" />
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

                    {/* HUD Cinematográfico Superior */}
                    <div className="absolute top-3 left-4 right-4 flex items-center justify-between text-[10px] font-mono text-emerald-400 pointer-events-none">
                      <span className="flex items-center gap-1.5 bg-black/70 backdrop-blur px-2 py-0.5 rounded border border-emerald-500/30">
                        <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                        REC • 24.000 FPS • 4K DCI
                      </span>
                      <span className="bg-black/70 backdrop-blur px-2 py-0.5 rounded text-neutral-300 border border-white/10">
                        ISO 800 • 1/48s • {simAperture}
                      </span>
                    </div>

                    {/* Retículo Central */}
                    <div className="relative size-24 border border-white/20 rounded-full flex items-center justify-center pointer-events-none">
                      <div className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]" />
                      <div className="absolute w-full h-[1px] bg-white/15" />
                      <div className="absolute h-full w-[1px] bg-white/15" />
                    </div>

                    {/* Flare Anamórfico Simulado */}
                    {simFlare && (
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/15 via-transparent to-blue-500/15 pointer-events-none mix-blend-screen" />
                    )}

                    {/* HUD Cinematográfico Inferior */}
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[10px] font-mono text-neutral-400 pointer-events-none">
                      <span className="bg-black/70 backdrop-blur px-2 py-0.5 rounded border border-white/10">
                        Lente Anamórfica {simFocal}mm T1.5
                      </span>
                      <span className="bg-black/70 backdrop-blur px-2 py-0.5 rounded border border-white/10 text-neutral-300">
                        Estúdio Ativo • Motor Kriativa
                      </span>
                    </div>
                  </div>

                  {/* Barra de Controles Interativos do Artefato */}
                  <div className="p-4 bg-[#0D0F18] border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
                    {/* Seletor de Proporção */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-neutral-400 font-mono">Aspecto:</span>
                      <button
                        onClick={() => setSimAspect("2.39")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                          simAspect === "2.39"
                            ? "bg-white text-black font-bold shadow-sm"
                            : "bg-white/5 text-neutral-400 hover:text-white"
                        }`}
                      >
                        2.39:1 Cinema
                      </button>
                      <button
                        onClick={() => setSimAspect("16:9")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                          simAspect === "16:9"
                            ? "bg-white text-black font-bold shadow-sm"
                            : "bg-white/5 text-neutral-400 hover:text-white"
                        }`}
                      >
                        16:9 Digital
                      </button>
                    </div>

                    {/* Slider de Distância Focal */}
                    <div className="flex items-center gap-2 text-neutral-300 font-mono text-xs">
                      <span>Focal: {simFocal}mm</span>
                      <input
                        type="range"
                        min="24"
                        max="135"
                        step="5"
                        value={simFocal}
                        onChange={(e) => setSimFocal(Number(e.target.value))}
                        className="w-24 accent-white cursor-pointer"
                      />
                    </div>

                    {/* Flare Toggle */}
                    <button
                      onClick={() => setSimFlare(!simFlare)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-all ${
                        simFlare
                          ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                          : "bg-white/5 text-neutral-500 border-white/10"
                      }`}
                    >
                      {simFlare ? "✨ Flare Ativo" : "Flare Desativado"}
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs text-neutral-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-400" />
                    <span>Artefato compilado em memória sem erros de runtime.</span>
                  </div>
                  <span className="font-mono text-[11px] text-neutral-500">
                    TypeScript 5.x • Tailwind v4
                  </span>
                </div>
              </div>
            ) : (
              /* ================== CÓDIGO FONTE DO ARTEFATO ================== */
              <div className="rounded-2xl border border-white/10 bg-[#07080D] overflow-hidden text-xs font-mono text-neutral-300">
                <div className="p-3 bg-[#0B0C14] border-b border-white/[0.08] flex items-center justify-between text-[11px] text-neutral-400">
                  <span>{activeArtifact.filename} ({activeArtifact.lines} linhas)</span>
                  <span>UTF-8 • {activeArtifact.language}</span>
                </div>
                <pre className="p-4 overflow-x-auto leading-relaxed selection:bg-white/20">
                  <code>{activeArtifact.code}</code>
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
