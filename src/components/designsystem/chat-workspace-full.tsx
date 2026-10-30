"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
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
  Plus,
  Compass,
  Cpu,
  Monitor,
  Volume2,
  Settings2,
  SplitSquareVertical,
  Palette,
  Sun,
  Moon,
  Zap,
  Shield,
  Laptop,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type ThemePreset = "convex" | "clerk" | "shadcn";

export interface ArtifactItem {
  id: string;
  title: string;
  filename: string;
  type: "react" | "markdown" | "glsl" | "widget";
  badge: string;
  lines: number;
  description: string;
  code: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  timestamp: string;
  content: string;
  thinkingSteps?: string[];
  artifactId?: string;
  suggestedActions?: string[];
}

export const ARTIFACT_CATALOG: Record<string, ArtifactItem> = {
  camera: {
    id: "camera",
    title: "Player de Câmera Anamórfica 3D",
    filename: "CameraAnamorphicPlayer.tsx",
    type: "react",
    badge: "React • HUD Cinemático",
    lines: 92,
    description: "Componente com viewport anamórfico 2.39:1, retículo de foco, leitura ótica de ISO/Obturador e controle de abertura de diafragma.",
    code: `import React, { useState } from "react";
import { Camera, Sliders, Film, Eye, Sparkles } from "lucide-react";

export function CameraAnamorphicPlayer() {
  const [focalLength, setFocalLength] = useState(50); // 35mm, 50mm, 85mm
  const [aspectRatio, setAspectRatio] = useState<"2.39" | "16:9" | "9:16">("2.39");
  const [aperture, setAperture] = useState("f/1.4");
  const [anamorphicFlare, setAnamorphicFlare] = useState(true);
  const [colorTemp, setColorTemp] = useState<"3200K" | "5600K">("5600K");

  return (
    <div className="relative w-full rounded-2xl bg-[#090A0F] border border-white/10 overflow-hidden shadow-2xl">
      {/* Viewport Cinemático */}
      <div className={\`relative w-full \${
        aspectRatio === "2.39" ? "aspect-[2.39/1]" : aspectRatio === "16:9" ? "aspect-video" : "aspect-[9/16] max-h-[480px]"
      } bg-[#040507] flex items-center justify-center overflow-hidden transition-all duration-300\`}>
        
        {/* Simulação de Temperatura de Cor */}
        <div className={\`absolute inset-0 pointer-events-none transition-colors duration-500 \${
          colorTemp === "3200K" ? "bg-amber-500/10 mix-blend-color" : "bg-cyan-500/10 mix-blend-color"
        }\`} />

        {/* HUD Cinemático */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-[10px] font-mono pointer-events-none z-10">
          <span className="flex items-center gap-1.5 bg-black/70 backdrop-blur px-2.5 py-1 rounded-md border border-emerald-500/30 text-emerald-400">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            REC • 24.000 FPS • 4K DCI CINEMA
          </span>
          <span className="bg-black/70 backdrop-blur px-2.5 py-1 rounded-md text-neutral-300 border border-white/10">
            ISO 800 • 1/48s • {aperture} • {colorTemp}
          </span>
        </div>

        {/* Retículo de Foco Central */}
        <div className="relative size-24 border border-white/20 rounded-full flex items-center justify-center pointer-events-none">
          <div className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34D399]" />
          <div className="absolute w-full h-[1px] bg-white/15" />
          <div className="absolute h-full w-[1px] bg-white/15" />
        </div>

        {/* Linhas de Flare Anamórfico */}
        {anamorphicFlare && (
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/15 via-transparent to-blue-500/15 pointer-events-none mix-blend-screen" />
        )}

        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[10px] font-mono text-neutral-400 pointer-events-none z-10">
          <span className="bg-black/70 backdrop-blur px-2.5 py-1 rounded-md border border-white/10">
            Lente Anamórfica Virtual {focalLength}mm T1.5
          </span>
          <span className="bg-black/70 backdrop-blur px-2.5 py-1 rounded-md border border-white/10 text-neutral-300">
            Estúdio Ativo • Motor Kriativa
          </span>
        </div>
      </div>
    </div>
  );
}`,
  },

  screenplay: {
    id: "screenplay",
    title: "Roteiro & Decupagem Técnica de Cena",
    filename: "Decupagem_Cena_04_NeoTokyo.md",
    type: "markdown",
    badge: "Markdown • Roteiro Técnico",
    lines: 65,
    description: "Decupagem de planos, lentes anamórficas recomendadas, enquadramento de câmera e iluminação de set cinematográfico.",
    code: `# DECUPAGEM TÉCNICA — CENA 04: O ENCONTRO NO TELHADO

**Projeto:** Odisseia Solar 2049  
**Resolução Cinemática:** 4K DCI (4096 × 1714) • 24.000 fps  
**Proporção de Lente:** 2.39:1 Anamórfico (CinemaScope)  
**Motor Responsável:** kriativa-mind (Direção & Raciocínio Híbrido)

---

### PLANO 01 — ESTABELECIMENTO (WIDE SHOT)
- **Câmera:** Lente Anamórfica 35mm T1.5, altura 1.80m.
- **Movimento:** Travelling lateral lento (Dolly Track) da esquerda para a direita.
- **Atores:** ELENA (personagem principal com consistência facial travada no Vault).
- **Ação:** Elena observa os arranha-céus sob a chuva de neon azul e magenta.
- **Iluminação:** Rim light frio com key light suave de néon difuso em 3200K.

---

### PLANO 02 — DETALHE MÉDIO (MEDIUM CLOSE-UP)
- **Câmera:** Lente 85mm T1.4 com foco cravado nos olhos.
- **Profundidade de Campo:** Rasa (DoF suave com bokeh oval clássico de anamórfica).
- **Soundscape:** Chuva contra o vidro, zumbido de sintetizador analógico grave em 40Hz.

---

### NOTAS DE PÓS-PRODUÇÃO & RENDERIZAÇÃO
1. Aplicar aberração cromática nas bordas de alto contraste com o shader ótico.
2. Manter consistência temporal de reflexos úmidos no casaco sintético.
3. Exportar dados de câmera para composição 3D.`,
  },

  shader: {
    id: "shader",
    title: "Shader GLSL de Reflexo Anamórfico",
    filename: "AnamorphicStreak.glsl",
    type: "glsl",
    badge: "GLSL • Pós-Processamento Ótico",
    lines: 54,
    description: "Fragment shader otimizado para reflexos horizontais azuis (blue streak) e aberração cromática em altas luzes.",
    code: `// Fragment Shader: Simulação Ótica Anamórfica 2.0x
precision highp float;

uniform sampler2D u_SceneTexture;
uniform vec2 u_Resolution;
uniform float u_StreakIntensity;   // 0.0 a 1.0
uniform float u_AberrationOffset;  // dispersão de cor

varying vec2 v_TexCoord;

// Função de aberração cromática de 3 canais
vec3 sampleChromatic(sampler2D tex, vec2 uv, float offset) {
    vec2 dir = uv - vec2(0.5);
    float r = texture2D(tex, uv - dir * offset * 0.015).r;
    float g = texture2D(tex, uv).g;
    float b = texture2D(tex, uv + dir * offset * 0.015).b;
    return vec3(r, g, b);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_Resolution.xy;

    // Distorção de compressão anamórfica sutil
    vec2 centered = uv - 0.5;
    float r2 = dot(centered, centered);
    vec2 distortedUV = uv + centered * (r2 * 0.03);

    // Amostragem de cor de base com dispersão cromática
    vec3 baseColor = sampleChromatic(u_SceneTexture, distortedUV, u_AberrationOffset);

    // Faixa horizontal de luz azul característica (anamorphic blue flare)
    float streak = exp(-pow(distortedUV.y - 0.5, 2.0) * 160.0) * u_StreakIntensity;
    vec3 blueFlare = vec3(0.05, 0.55, 1.0) * streak * 0.45;

    gl_FragColor = vec4(baseColor + blueFlare, 1.0);
}`,
  },

  metrics: {
    id: "metrics",
    title: "Telemetria do Estúdio & Motores",
    filename: "StudioTelemetryWidget.tsx",
    type: "widget",
    badge: "React • Métricas em Tempo Real",
    lines: 48,
    description: "Painel de observabilidade de instâncias ativas de processamento, vazão de tokens e status de sincronização Convex.",
    code: `import React from "react";
import { Activity, Zap, CheckCircle2 } from "lucide-react";

export function StudioTelemetryWidget() {
  return (
    <div className="p-6 rounded-2xl bg-[#0C0D15] border border-white/10 space-y-4 font-sans">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-mono font-medium text-white">Convex Realtime Bus</span>
        </div>
        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
          Latência: 11ms
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <span className="text-[11px] text-neutral-400 block font-mono">Motores Conectados</span>
          <span className="text-xl font-bold font-mono text-white">4 / 4 Ativos</span>
        </div>
        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <span className="text-[11px] text-neutral-400 block font-mono">Vazão de Tokens</span>
          <span className="text-xl font-bold font-mono text-emerald-400">128 t/s</span>
        </div>
      </div>
    </div>
  );
}`,
  },
};

export const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "msg-1",
    sender: "user",
    timestamp: "14:10",
    content: "Preciso de um componente React com Tailwind para o player de câmera anamórfica 3D do nosso estúdio, com controles de proporção 2.39:1, distância focal e temperatura de cor.",
  },
  {
    id: "msg-2",
    sender: "assistant",
    timestamp: "14:11",
    content: "Perfeito! Desenvolvi o componente de câmera com HUD ótico em tempo real, suporte à alternância de proporção (2.39:1 CinemaScope / 16:9 Digital) e simulação de flare anamórfico.",
    thinkingSteps: [
      "1. Analisando as regras óticas anamórficas (compressão horizontal 2.0x e aspecto 2.39:1).",
      "2. Modelando HUD cinemático com informações de obturador, ISO e 24.000 fps.",
      "3. Estruturando controles táteis em Tailwind v4 com estética limpa e sem atritos.",
    ],
    artifactId: "camera",
    suggestedActions: [
      "🎬 Ver roteiro de decupagem técnica",
      "✨ Adicionar Shader GLSL de aberração ótica",
      "📊 Consultar telemetria de motores ativos",
    ],
  },
];

export interface ChatWorkspaceFullProps {
  onSwitchToTokens?: () => void;
}

export function ChatWorkspaceFull({ onSwitchToTokens }: ChatWorkspaceFullProps = {}) {
  const [theme, setTheme] = useState<ThemePreset>("convex");
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [selectedArtifactId, setSelectedArtifactId] = useState<string>("camera");
  const [activeCanvasTab, setActiveCanvasTab] = useState<"preview" | "code" | "spec">("preview");
  const [chatInput, setChatInput] = useState("");
  const [isThinkingOpen, setIsThinkingOpen] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isFullScreenCanvas, setIsFullScreenCanvas] = useState(false);

  // Estados táteis do Preview de Câmera
  const [simAspect, setSimAspect] = useState<"2.39" | "16:9" | "9:16">("2.39");
  const [simFocal, setSimFocal] = useState(50);
  const [simAperture, setSimAperture] = useState("f/1.4");
  const [simFlare, setSimFlare] = useState(true);
  const [simColorTemp, setSimColorTemp] = useState<"3200K" | "5600K">("5600K");

  const chatScrollRef = useRef<HTMLDivElement>(null);

  const activeArtifact = ARTIFACT_CATALOG[selectedArtifactId] || ARTIFACT_CATALOG.camera;

  const themeStyles = {
    convex: {
      accent: "#EE342F",
      badge: "bg-[#EE342F]/10 text-[#FF5555] border-[#EE342F]/30",
      button: "bg-[#EE342F] hover:bg-[#EE342F]/90 text-white shadow-[0_0_20px_rgba(238,52,47,0.3)]",
      activeRing: "ring-[#EE342F]/40",
    },
    clerk: {
      accent: "#6366F1",
      badge: "bg-[#6366F1]/10 text-[#818CF8] border-[#6366F1]/30",
      button: "bg-[#6366F1] hover:bg-[#6366F1]/90 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]",
      activeRing: "ring-[#6366F1]/40",
    },
    shadcn: {
      accent: "#FFFFFF",
      badge: "bg-white/10 text-white border-white/20",
      button: "bg-white hover:bg-neutral-200 text-black font-semibold shadow-sm",
      activeRing: "ring-white/40",
    },
  }[theme];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeArtifact.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || chatInput).trim();
    if (!text) return;

    const newMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: newMsgId,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setChatInput("");

    // Resposta interativa da IA com artefato contextual
    setTimeout(() => {
      let targetArtifact = "camera";
      let replyContent = "Atualizei os parâmetros de renderização no estúdio.";
      let steps = ["Processando nova solicitação...", "Reajustando shaders e parâmetros no motor."];

      const lower = text.toLowerCase();
      if (lower.includes("roteiro") || lower.includes("decupagem")) {
        targetArtifact = "screenplay";
        replyContent = "Gerei o documento de decupagem técnica cinematográfica com movimentos de câmera e iluminação de set para a Cena 04.";
        steps = [
          "1. Carregando dados de continuidade do ator do Consistency Vault.",
          "2. Calculando trajetórias de travelling para lente anamórfica 35mm.",
          "3. Formatando documento de roteiro técnico em Markdown.",
        ];
      } else if (lower.includes("shader") || lower.includes("glsl") || lower.includes("aberração")) {
        targetArtifact = "shader";
        replyContent = "Aqui está o Fragment Shader GLSL calibrado para aberração cromática e reflexos horizontais de lente anamórfica.";
        steps = [
          "1. Definindo matriz de distorção anamórfica 2.0x.",
          "2. Criando dispersão de canais RGB via sampleChromatic.",
          "3. Otimizando função de streak exponencial para 60fps.",
        ];
      } else if (lower.includes("telemetria") || lower.includes("instâncias") || lower.includes("métrica")) {
        targetArtifact = "metrics";
        replyContent = "Abri o painel de telemetria das instâncias de processamento com latência e status do barramento reativo Convex.";
        steps = [
          "1. Conectando à subscrição reativa do Convex.",
          "2. Monitorando 4 motores de renderização ativos.",
          "3. Consolidando telemetria em tempo real.",
        ];
      }

      setSelectedArtifactId(targetArtifact);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: "assistant",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          content: replyContent,
          thinkingSteps: steps,
          artifactId: targetArtifact,
          suggestedActions: [
            "🎥 Testar proporção 2.39:1 Cinema",
            "🎬 Decupagem técnica de roteiro",
            "✨ Shader ótico anamórfico",
          ],
        },
      ]);
    }, 600);
  };

  useEffect(() => {
    chatScrollRef.current?.scrollTo({
      top: chatScrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen w-full bg-[#07080B] text-white font-sans overflow-hidden select-none">
      {/* ===================== TOPO ELEGANTE DO STUDIO (HEADER) ===================== */}
      <header className="h-14 px-5 bg-[#090A0F] border-b border-white/[0.06] flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3">
          <Link href="/desingsystem" className="flex items-center gap-2.5 group">
            <span
              className="size-7 rounded-lg flex items-center justify-center font-bold text-xs tracking-tight transition-all duration-300"
              style={{
                background: theme === "shadcn" ? "#FFFFFF" : themeStyles.accent,
                color: theme === "shadcn" ? "#000000" : "#FFFFFF",
              }}
            >
              K
            </span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-white tracking-tight">
                Kriativa Studio
              </span>
              <span className="text-white/20">/</span>
              <span className="text-xs text-neutral-400 font-mono">
                Chat & Artefatos (Clean Canvas)
              </span>
            </div>
          </Link>
        </div>

        {/* SELETOR DE PRESETS DO TEMA */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#10121A] p-1 rounded-xl border border-white/[0.08]">
            {(
              [
                { id: "convex", label: "Convex", icon: Zap },
                { id: "clerk", label: "Clerk", icon: Shield },
                { id: "shadcn", label: "shadcn", icon: Laptop },
              ] as const
            ).map((t) => {
              const Icon = t.icon;
              const isSelected = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-white/15 text-white font-semibold shadow-sm border border-white/10"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <Icon className="size-3" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {onSwitchToTokens && (
            <button
              onClick={onSwitchToTokens}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/15 border border-white/10 text-white transition-all flex items-center gap-1.5"
            >
              <Layers className="size-3.5" />
              <span>Ver Tokens & Componentes</span>
            </button>
          )}

          <Link href="/dashboard">
            <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white transition-all">
              Dashboard
            </button>
          </Link>
        </div>
      </header>

      {/* ===================== ÁREA PRINCIPAL SPLIT-SCREEN (100% ALTURA) ===================== */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-white/[0.06]">
        {/* ===================== COLUNA ESQUERDA: CHAT THREAD (5 COLS) ===================== */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-[#08090E] overflow-hidden">
          {/* Sub-header do Chat com Status do Modelo */}
          <div className="h-11 px-4 bg-[#0A0B12] border-b border-white/[0.06] flex items-center justify-between text-xs text-neutral-400">
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white font-medium">kriativa-code</span>
              <span className="text-neutral-500">•</span>
              <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded text-[10px]">
                SSE 11ms
              </span>
            </div>
            <button
              onClick={() => setMessages(INITIAL_MESSAGES)}
              className="text-[11px] text-neutral-500 hover:text-neutral-300 flex items-center gap-1 transition-colors"
              title="Reiniciar conversa de demonstração"
            >
              <RotateCcw className="size-3" />
              <span>Limpar</span>
            </button>
          </div>

          {/* Lista de Mensagens com Scroll Suave */}
          <div ref={chatScrollRef} className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "assistant" && (
                  <div
                    className="size-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-sm"
                    style={{
                      background: theme === "shadcn" ? "#FFFFFF" : themeStyles.accent,
                      color: theme === "shadcn" ? "#000000" : "#FFFFFF",
                    }}
                  >
                    <Sparkles className="size-3.5" />
                  </div>
                )}

                <div className={`space-y-3 ${msg.sender === "user" ? "max-w-[85%]" : "max-w-[92%]"}`}>
                  {/* Bloco de Raciocínio (se houver) */}
                  {msg.thinkingSteps && msg.thinkingSteps.length > 0 && (
                    <div className="rounded-xl border border-white/[0.06] bg-[#0C0E17] overflow-hidden text-xs">
                      <button
                        onClick={() => setIsThinkingOpen(!isThinkingOpen)}
                        className="w-full px-3 py-1.5 flex items-center justify-between text-neutral-400 hover:text-white transition-colors bg-white/[0.01]"
                      >
                        <span className="flex items-center gap-1.5 font-mono text-[10px] text-purple-400">
                          <Activity className="size-3" />
                          Raciocínio Lógico ({msg.thinkingSteps.length} etapas)
                        </span>
                        {isThinkingOpen ? (
                          <ChevronDown className="size-3 text-neutral-500" />
                        ) : (
                          <ChevronRight className="size-3 text-neutral-500" />
                        )}
                      </button>

                      {isThinkingOpen && (
                        <div className="px-3.5 py-2 border-t border-white/[0.04] text-[10px] text-neutral-400 font-mono space-y-1 bg-[#090A12]">
                          {msg.thinkingSteps.map((step, i) => (
                            <p key={i}>{step}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Conteúdo da Mensagem */}
                  <div
                    className={`rounded-2xl p-4 text-xs leading-relaxed shadow-sm ${
                      msg.sender === "user"
                        ? "bg-[#141622] border border-white/10 text-white"
                        : "bg-[#0E101A] border border-white/[0.08] text-neutral-300"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono mb-1">
                      <span>{msg.sender === "user" ? "Você (Diretor)" : "Kriativa Engine"}</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <p>{msg.content}</p>

                    {/* Cartão de Artefato Clicável (Se a mensagem gerou um artefato) */}
                    {msg.artifactId && ARTIFACT_CATALOG[msg.artifactId] && (
                      <div
                        onClick={() => setSelectedArtifactId(msg.artifactId!)}
                        className={`mt-3 p-3 rounded-xl border transition-all cursor-pointer group ${
                          selectedArtifactId === msg.artifactId
                            ? "bg-white/[0.08] border-white/30 ring-1 ring-white/20"
                            : "bg-[#131522] border-white/10 hover:border-white/25 hover:bg-white/[0.04]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-white/10 text-white">
                              {ARTIFACT_CATALOG[msg.artifactId].type === "markdown" ? (
                                <FileText className="size-3.5" />
                              ) : (
                                <FileCode className="size-3.5" />
                              )}
                            </span>
                            <div>
                              <span className="font-semibold text-white block text-xs group-hover:underline">
                                {ARTIFACT_CATALOG[msg.artifactId].filename}
                              </span>
                              <span className="text-[10px] text-neutral-400 font-mono">
                                {ARTIFACT_CATALOG[msg.artifactId].badge}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Abrir Canvas ➔
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 line-clamp-1">
                          {ARTIFACT_CATALOG[msg.artifactId].description}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Sugestões Rápidas (Chips de Continuação) */}
                  {msg.suggestedActions && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.suggestedActions.map((action, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(action)}
                          className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-white/[0.04] hover:bg-white/10 border border-white/[0.08] text-neutral-400 hover:text-white transition-all"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {msg.sender === "user" && (
                  <div className="size-7 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5">
                    LP
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Barra de Entrada de Chat Fixa no Rodapé */}
          <div className="p-4 bg-[#0A0B12] border-t border-white/[0.06]">
            <div className="relative rounded-2xl bg-[#11131E] border border-white/10 focus-within:border-white/30 p-2.5 transition-all shadow-inner">
              <textarea
                rows={2}
                placeholder="Solicite ajustes na lente, novo shader, decupagem ou componentes..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="w-full bg-transparent text-xs text-white placeholder:text-neutral-500 resize-none outline-none font-sans"
              />
              <div className="flex items-center justify-between pt-1 border-t border-white/[0.06]">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-400">
                  <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-neutral-300">
                    Enter ↵
                  </span>
                  <span>para enviar</span>
                </div>
                <button
                  onClick={() => handleSendMessage()}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                  style={{
                    background: theme === "shadcn" ? "#FFFFFF" : themeStyles.accent,
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

        {/* ===================== COLUNA DIREITA: CANVAS DE ARTEFATOS (7 COLS) ===================== */}
        <div className={`lg:col-span-7 flex flex-col bg-[#090A10] justify-between overflow-hidden ${isFullScreenCanvas ? "fixed inset-0 z-50 bg-[#08090E]" : "relative"}`}>
          {/* Header do Canvas com Abas & Ações */}
          <div className="h-11 px-4 bg-[#0B0C15] border-b border-white/[0.06] flex items-center justify-between gap-4 shrink-0">
            {/* Nome do Arquivo & Seletor Rápido */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="p-1 rounded-md bg-white/10 text-white shrink-0">
                {activeArtifact.type === "markdown" ? (
                  <FileText className="size-3.5" />
                ) : (
                  <FileCode className="size-3.5" />
                )}
              </span>
              <div className="truncate flex items-center gap-2">
                <span className="font-semibold text-white text-xs font-mono truncate">
                  {activeArtifact.filename}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono hidden sm:inline">
                  ({activeArtifact.lines} linhas)
                </span>
              </div>
            </div>

            {/* Abas do Canvas: Preview | Código | Especificação */}
            <div className="flex items-center gap-1 bg-[#131522] p-1 rounded-xl border border-white/10 shrink-0">
              <button
                onClick={() => setActiveCanvasTab("preview")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeCanvasTab === "preview"
                    ? "bg-white text-black font-semibold shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Eye className="size-3" />
                <span>Visualização</span>
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

            {/* Ações: Copiar & Alternar Tela Cheia */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-neutral-300 hover:text-white flex items-center gap-1.5 transition-all"
                title="Copiar código fonte"
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
              <button
                onClick={() => setIsFullScreenCanvas(!isFullScreenCanvas)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-white transition-all text-xs"
                title="Alternar tela cheia do artefato"
              >
                {isFullScreenCanvas ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
              </button>
            </div>
          </div>

          {/* Seletor Rápido de Artefatos no Topo do Canvas */}
          <div className="h-9 px-4 bg-[#090A12] border-b border-white/[0.04] flex items-center gap-2 overflow-x-auto text-[11px] font-mono shrink-0">
            <span className="text-neutral-500 text-[10px]">ARTEFATOS:</span>
            {Object.values(ARTIFACT_CATALOG).map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedArtifactId(item.id)}
                className={`px-2.5 py-0.5 rounded-md flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  selectedArtifactId === item.id
                    ? "bg-white/15 text-white font-semibold border border-white/15"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>{item.filename}</span>
              </button>
            ))}
          </div>

          {/* CORPO DO CANVAS COM SCROLL */}
          <div className="flex-1 p-5 overflow-y-auto">
            {activeCanvasTab === "preview" ? (
              /* ================== TAB 1: PREVIEW INTERATIVO ================== */
              <div className="space-y-4 max-w-4xl mx-auto">
                {selectedArtifactId === "camera" && (
                  /* Preview do Player de Câmera Anamórfica */
                  <div className="space-y-4">
                    <div className="relative w-full rounded-2xl bg-[#040507] border border-white/10 overflow-hidden shadow-2xl">
                      {/* Viewport Cinemático */}
                      <div
                        className={`relative w-full transition-all duration-300 ${
                          simAspect === "2.39"
                            ? "aspect-[2.39/1]"
                            : simAspect === "16:9"
                            ? "aspect-video"
                            : "aspect-[9/16] max-h-[460px]"
                        } bg-[#030406] flex items-center justify-center overflow-hidden`}
                      >
                        {/* Grade e Brilho de Set */}
                        <div
                          className={`absolute inset-0 pointer-events-none transition-colors duration-500 ${
                            simColorTemp === "3200K" ? "bg-amber-500/10" : "bg-cyan-500/10"
                          } mix-blend-color`}
                        />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)] pointer-events-none" />
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

                        {/* HUD Superior */}
                        <div className="absolute top-3 left-4 right-4 flex items-center justify-between text-[10px] font-mono pointer-events-none">
                          <span className="flex items-center gap-1.5 bg-black/75 backdrop-blur px-2.5 py-1 rounded-md border border-emerald-500/30 text-emerald-400">
                            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                            REC • 24.000 FPS • 4K DCI CINEMA
                          </span>
                          <span className="bg-black/75 backdrop-blur px-2.5 py-1 rounded-md text-neutral-300 border border-white/10">
                            ISO 800 • 1/48s • {simAperture} • {simColorTemp}
                          </span>
                        </div>

                        {/* Retículo de Foco */}
                        <div className="relative size-24 border border-white/20 rounded-full flex items-center justify-center pointer-events-none">
                          <div className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34D399]" />
                          <div className="absolute w-full h-[1px] bg-white/15" />
                          <div className="absolute h-full w-[1px] bg-white/15" />
                        </div>

                        {/* Flare Anamórfico */}
                        {simFlare && (
                          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/15 via-transparent to-blue-500/15 pointer-events-none mix-blend-screen" />
                        )}

                        {/* HUD Inferior */}
                        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[10px] font-mono text-neutral-400 pointer-events-none">
                          <span className="bg-black/75 backdrop-blur px-2.5 py-1 rounded-md border border-white/10">
                            Lente Virtual {simFocal}mm T1.5 Anamórfica
                          </span>
                          <span className="bg-black/75 backdrop-blur px-2.5 py-1 rounded-md border border-white/10 text-neutral-300">
                            Estúdio Ativo • Motor Kriativa
                          </span>
                        </div>
                      </div>

                      {/* Barra de Controles Táteis do Artefato */}
                      <div className="p-4 bg-[#0A0C14] border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                        {/* Aspect Ratio */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-neutral-400 font-mono">Aspecto:</span>
                          <button
                            onClick={() => setSimAspect("2.39")}
                            className={`px-2 py-1 rounded-lg text-xs font-mono transition-all ${
                              simAspect === "2.39" ? "bg-white text-black font-bold" : "bg-white/5 text-neutral-400"
                            }`}
                          >
                            2.39:1 Cinema
                          </button>
                          <button
                            onClick={() => setSimAspect("16:9")}
                            className={`px-2 py-1 rounded-lg text-xs font-mono transition-all ${
                              simAspect === "16:9" ? "bg-white text-black font-bold" : "bg-white/5 text-neutral-400"
                            }`}
                          >
                            16:9 Digital
                          </button>
                          <button
                            onClick={() => setSimAspect("9:16")}
                            className={`px-2 py-1 rounded-lg text-xs font-mono transition-all ${
                              simAspect === "9:16" ? "bg-white text-black font-bold" : "bg-white/5 text-neutral-400"
                            }`}
                          >
                            9:16 Vertical
                          </button>
                        </div>

                        {/* Focal Length Slider */}
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

                        {/* Temperatura & Flare */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSimColorTemp(simColorTemp === "3200K" ? "5600K" : "3200K")}
                            className="px-2.5 py-1 rounded-lg text-xs font-mono bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300"
                          >
                            Temp: {simColorTemp}
                          </button>
                          <button
                            onClick={() => setSimFlare(!simFlare)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-all ${
                              simFlare
                                ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 font-semibold"
                                : "bg-white/5 text-neutral-500 border-white/10"
                            }`}
                          >
                            {simFlare ? "✨ Flare Ativo" : "Flare Off"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedArtifactId === "screenplay" && (
                  /* Preview do Roteiro em Formatação Limpa */
                  <div className="p-8 rounded-2xl bg-[#0D0F18] border border-white/10 space-y-4 font-mono text-xs leading-relaxed text-neutral-300 shadow-xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <div>
                        <span className="text-sm font-bold text-white block">
                          ROTEIRO & DECUPAGEM TÉCNICA
                        </span>
                        <span className="text-[11px] text-neutral-500">
                          Cena 04: O Encontro no Telhado • 4K DCI CinemaScope
                        </span>
                      </div>
                      <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400">
                        HOMOLOGADO PELO DIRETOR
                      </Badge>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                        <span className="text-white font-bold block">PLAN 01 — WIDE ESTABLISHING SHOT</span>
                        <p className="text-neutral-400">
                          <strong>Câmera:</strong> Lente Anamórfica 35mm T1.5 em travelling lateral.
                        </p>
                        <p className="text-neutral-400">
                          <strong>Enquadramento:</strong> Elena em terço direito observando arranha-céus sob chuva de néon.
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                        <span className="text-white font-bold block">PLAN 02 — MEDIUM CLOSE-UP</span>
                        <p className="text-neutral-400">
                          <strong>Câmera:</strong> Lente 85mm T1.4 com foco cravado na expressão do olhar.
                        </p>
                        <p className="text-neutral-400">
                          <strong>Profundidade de Campo:</strong> DoF rasa com bokeh oval clássico de cinema anamórfico.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedArtifactId === "shader" && (
                  /* Preview do Shader GLSL */
                  <div className="p-6 rounded-2xl bg-[#0D0F18] border border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-white block">
                          Simulação em Tempo Real do Fragment Shader GLSL
                        </span>
                        <span className="text-[11px] text-neutral-400 block">
                          Compressão anamórfica 2.0x com reflexo horizontal azul e dispersão cromática.
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        GLSL 3.0 ES
                      </span>
                    </div>

                    <div className="relative aspect-video rounded-xl bg-[#030406] border border-white/10 overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-transparent to-cyan-500/20 mix-blend-screen" />
                      <div className="w-full h-[2px] bg-cyan-400/80 shadow-[0_0_20px_#22D3EE]" />
                      <span className="text-xs font-mono text-neutral-400 z-10 bg-black/70 px-3 py-1 rounded-md border border-white/10">
                        Horizontal Streak 160.0 • Aberration Offset 0.015
                      </span>
                    </div>
                  </div>
                )}

                {selectedArtifactId === "metrics" && (
                  /* Preview do Widget de Telemetria */
                  <div className="p-6 rounded-2xl bg-[#0D0F18] border border-white/10 space-y-6">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
                        <span className="text-xs font-mono font-medium text-white">
                          Barramento Reativo Convex • Conexão Ativa
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        11ms • Sincronizado
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                        <span className="text-[11px] text-neutral-400 block font-mono">
                          Motores Ativos
                        </span>
                        <span className="text-2xl font-bold font-mono text-white">4 / 4</span>
                        <span className="text-[10px] text-emerald-400 block">100% Disponibilidade</span>
                      </div>
                      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                        <span className="text-[11px] text-neutral-400 block font-mono">
                          Vazão Média
                        </span>
                        <span className="text-2xl font-bold font-mono text-white">128 t/s</span>
                        <span className="text-[10px] text-neutral-400 block">Streaming SSE Ativo</span>
                      </div>
                      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                        <span className="text-[11px] text-neutral-400 block font-mono">
                          Créditos & Quotas
                        </span>
                        <span className="text-2xl font-bold font-mono text-white">Ilimitado</span>
                        <span className="text-[10px] text-neutral-400 block">Plano Studio Ativo</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ================== TAB 2: CÓDIGO FONTE COM NUMERAÇÃO ================== */
              <div className="rounded-2xl border border-white/10 bg-[#06070B] overflow-hidden text-xs font-mono text-neutral-300 max-w-4xl mx-auto shadow-2xl">
                <div className="p-3 bg-[#0B0C14] border-b border-white/[0.06] flex items-center justify-between text-[11px] text-neutral-400">
                  <span>
                    {activeArtifact.filename} • {activeArtifact.lines} linhas
                  </span>
                  <span>UTF-8 • {activeArtifact.type.toUpperCase()}</span>
                </div>
                <pre className="p-5 overflow-x-auto leading-relaxed selection:bg-white/20">
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
