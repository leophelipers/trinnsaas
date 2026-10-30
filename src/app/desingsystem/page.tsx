"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Layers,
  Shield,
  Copy,
  Check,
  Zap,
  ArrowRight,
  Terminal,
  Activity,
  Code2,
  Lock,
  ChevronRight,
  CheckCircle2,
  Key,
  Flame,
  Radio,
  Sliders,
  Eye,
  RefreshCw,
  Search,
  ExternalLink,
  Laptop,
  Film,
  Camera,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ChatArtifactsPreview } from "@/components/designsystem/chat-artifacts-preview";
import { ChatWorkspaceFull } from "@/components/designsystem/chat-workspace-full";

type ThemeMode = "convex" | "clerk" | "shadcn" | "solar";

export default function DesignSystemPage() {
  const [viewMode, setViewMode] = useState<"workspace" | "catalog">("workspace");
  const [theme, setTheme] = useState<ThemeMode>("convex");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "components" | "cards" | "tokens" | "code">("chat");
  const [switchState, setSwitchState] = useState(true);
  const [cinemaSwitch, setCinemaSwitch] = useState(true);
  const [searchVal, setSearchVal] = useState("");

  const copyText = (val: string, label: string) => {
    navigator.clipboard.writeText(val);
    setCopiedToken(label);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const themeConfig = {
    convex: {
      name: "Convex Reactive",
      tagline: "Precisão em tempo real, fundos obsidiana profundos e acentos coral / crimson refinados.",
      accent: "#EE342F",
      accentRgb: "238, 52, 47",
      accentGradient: "from-[#EE342F] to-[#FB7185]",
      badgeClass: "bg-[#EE342F]/10 text-[#FF5555] border-[#EE342F]/30",
      buttonClass: "bg-[#EE342F] hover:bg-[#EE342F]/90 text-white shadow-[0_0_20px_rgba(238,52,47,0.3)]",
      activeRing: "ring-[#EE342F]/50",
      dotGrid: true,
      cardBg: "bg-[#0A0B10]/90 border-white/[0.08]",
      glowColor: "rgba(238,52,47,0.12)",
    },
    clerk: {
      name: "Clerk Slate & Indigo",
      tagline: "Elegância corporativa de autenticação, camadas translúcidas e acentos índigo / violeta.",
      accent: "#6366F1",
      accentRgb: "99, 102, 241",
      accentGradient: "from-[#6366F1] to-[#8B5CF6]",
      badgeClass: "bg-[#6366F1]/10 text-[#818CF8] border-[#6366F1]/30",
      buttonClass: "bg-[#6366F1] hover:bg-[#6366F1]/90 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]",
      activeRing: "ring-[#6366F1]/50",
      dotGrid: false,
      cardBg: "bg-[#0D0F18]/90 border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]",
      glowColor: "rgba(99,102,241,0.12)",
    },
    shadcn: {
      name: "shadcn/ui Pure Zinc",
      tagline: "Monocromático cirúrgico, alto contraste, micro-bordas neutras e tipografia limpa.",
      accent: "#FAFAFA",
      accentRgb: "250, 250, 250",
      accentGradient: "from-white to-neutral-400",
      badgeClass: "bg-white/10 text-white border-white/20",
      buttonClass: "bg-white hover:bg-neutral-200 text-black font-semibold shadow-sm",
      activeRing: "ring-white/50",
      dotGrid: false,
      cardBg: "bg-[#09090B] border-neutral-800 shadow-sm",
      glowColor: "rgba(255,255,255,0.06)",
    },
    solar: {
      name: "Solar Cinema (Atual)",
      tagline: "O design atual do estúdio com laranja solar e elementos futuristas de alto impacto.",
      accent: "#FF5500",
      accentRgb: "255, 85, 0",
      accentGradient: "from-[#FF5500] to-[#FF8800]",
      badgeClass: "bg-[#FF5500]/10 text-[#FF5500] border-[#FF5500]/30",
      buttonClass: "bg-[#FF5500] hover:bg-[#FF5500]/90 text-white shadow-[0_0_20px_rgba(255,85,0,0.35)]",
      activeRing: "ring-[#FF5500]/50",
      dotGrid: true,
      cardBg: "bg-[#0C0D12] border-white/10",
      glowColor: "rgba(255,85,0,0.15)",
    },
  }[theme];

  const cssTokensCode = `/* Novos Tokens de Design System (Convex + Clerk + shadcn/ui) */
:root, .dark {
  --background: oklch(0.12 0.006 260);         /* Obsidiana Neutra Profunda */
  --foreground: oklch(0.985 0 0);               /* Branco Puro Alto Contraste */
  --card: oklch(0.15 0.008 260);                /* Superfície Elevação 1 */
  --card-foreground: oklch(0.985 0 0);
  
  /* Cores de Acento (Convex Coral ou Clerk Indigo) */
  --primary: ${theme === "clerk" ? "oklch(0.60 0.22 275)" : theme === "shadcn" ? "oklch(0.98 0 0)" : "oklch(0.62 0.24 25)"};
  --primary-foreground: ${theme === "shadcn" ? "#000000" : "#FFFFFF"};
  
  --secondary: oklch(0.20 0.012 260);           /* Zinco Intermediário */
  --secondary-foreground: oklch(0.90 0 0);
  --muted: oklch(0.18 0.008 260);               /* Textos e Fundos Neutros */
  --muted-foreground: oklch(0.65 0.015 250);   /* Slate Suave de Baixo Cansaço */
  
  --border: oklch(1 0 0 / 8%);                  /* Borda de Precisão 1px */
  --ring: ${theme === "clerk" ? "#6366F1" : theme === "shadcn" ? "#FFFFFF" : "#EE342F"};
  --radius: 0.5rem;                             /* Cantos Refinados shadcn (8px) */
}`;

  if (viewMode === "workspace") {
    return <ChatWorkspaceFull onSwitchToTokens={() => setViewMode("catalog")} />;
  }

  return (
    <div className="min-h-screen bg-[#07080B] text-white selection:bg-white/20 selection:text-white font-sans relative overflow-x-hidden">
      {/* Background radial glow dinâmico */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] pointer-events-none blur-[140px] opacity-40 transition-all duration-700 -z-10"
        style={{
          background: `radial-gradient(circle, ${themeConfig.accent} 0%, transparent 70%)`,
        }}
      />

      {/* Grid sutil de fundo estilo Convex */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none -z-10" />

      {/* HEADER DE NAVEGAÇÃO & SELETOR DE PRESETS */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#07080B]/80 border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <span
                className="size-8 rounded-lg flex items-center justify-center font-bold text-sm tracking-tight transition-all duration-300 shadow-sm"
                style={{
                  background: theme === "shadcn" ? "#FFFFFF" : themeConfig.accent,
                  color: theme === "shadcn" ? "#000000" : "#FFFFFF",
                }}
              >
                K
              </span>
              <div>
                <span className="font-semibold text-sm tracking-tight text-white flex items-center gap-1.5">
                  Kriativa Studio
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 font-normal">
                    DS v2.0
                  </span>
                </span>
              </div>
            </Link>

            <span className="text-white/20 hidden sm:inline">/</span>
            <span className="text-xs text-neutral-400 font-mono hidden sm:inline">
              Design System Showcase
            </span>
          </div>

          {/* SELETOR INTERATIVO DE TEMAS */}
          <div className="flex items-center gap-1 bg-[#12131A] p-1 rounded-xl border border-white/10">
            {(
              [
                { id: "convex", label: "Convex", icon: Zap },
                { id: "clerk", label: "Clerk", icon: Shield },
                { id: "shadcn", label: "shadcn/ui", icon: Laptop },
                { id: "solar", label: "Atual", icon: Flame },
              ] as const
            ).map((item) => {
              const Icon = item.icon;
              const isSelected = theme === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTheme(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    isSelected
                      ? "bg-white/15 text-white shadow-sm font-semibold border border-white/10"
                      : "text-neutral-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="size-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setViewMode("workspace")}
              variant="default"
              size="sm"
              className="bg-white hover:bg-neutral-200 text-black font-semibold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Terminal className="size-3.5" />
              <span>Studio Workspace (Tela Completa)</span>
            </Button>
            <Link href="/dashboard">
              <Button
                variant="outline"
                size="sm"
                className="border-white/10 hover:bg-white/5 text-xs text-neutral-300"
              >
                Ir ao Painel
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO PRINCIPAL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-8">
        <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent">
          <div className="max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-xs font-mono px-2.5 py-1 rounded-full border transition-colors duration-300 ${themeConfig.badgeClass}`}
              >
                {themeConfig.name}
              </span>
              <span className="text-xs font-mono text-neutral-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                Next.js 16 • Tailwind v4 • Base UI
              </span>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Zero Mocks • Realtime
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.1]">
              A nova experiência visual do{" "}
              <span
                className="bg-clip-text text-transparent bg-gradient-to-r transition-all duration-300"
                style={{
                  backgroundImage:
                    theme === "shadcn"
                      ? "linear-gradient(to right, #FFFFFF, #A3A3A3)"
                      : theme === "clerk"
                      ? "linear-gradient(to right, #818CF8, #C084FC)"
                      : theme === "solar"
                      ? "linear-gradient(to right, #FF5500, #FFAA00)"
                      : "linear-gradient(to right, #EE342F, #FB7185)",
                }}
              >
                Kriativa Studio
              </span>
            </h1>

            <p className="text-sm sm:text-base text-neutral-400 leading-relaxed max-w-2xl">
              {themeConfig.tagline} Um ecossistema de interface refinado, focado na produtividade de desenvolvedores e cineastas, unindo o rigor estético do <strong>shadcn/ui</strong>, o polimento de segurança do <strong>Clerk</strong> e o dinamismo reativo do <strong>Convex</strong>.
            </p>

            {/* TAB SELECTOR INTERNO */}
            <div className="pt-4 flex flex-wrap items-center gap-2 border-t border-white/[0.06]">
              {(
                [
                  { id: "chat", label: "Chat & Artefatos (Novo)", icon: Terminal },
                  { id: "components", label: "Biblioteca de Componentes", icon: Layers },
                  { id: "cards", label: "Paineis & Telas Reais", icon: Film },
                  { id: "tokens", label: "Cores & Tipografia", icon: Sliders },
                  { id: "code", label: "Tokens CSS & Código", icon: Code2 },
                ] as const
              ).map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                      active
                        ? "bg-white text-black font-semibold shadow-sm"
                        : "text-neutral-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className="size-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CONTEÚDO PRINCIPAL COM ABAS */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 space-y-12">
        {/* ABA: CHAT & ARTEFATOS INTERATIVO */}
        {activeTab === "chat" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <Terminal className="size-5 text-neutral-400" />
                  Experiência de Chat & Canvas de Artefatos
                </h3>
                <p className="text-xs text-neutral-400">
                  Modelo híbrido com cadeia de raciocínio, split-screen em tempo real e visualização de código / preview ótico de cinema.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Split-View Ativo
                </span>
              </div>
            </div>

            <ChatArtifactsPreview theme={theme} accentColor={themeConfig.accent} />
          </div>
        )}

        {/* ABA 1: BIBLIOTECA DE COMPONENTES */}
        {activeTab === "components" && (
          <div className="space-y-10 animate-in fade-in duration-300">
            {/* 1. BOTÕES */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold tracking-tight text-white flex items-center gap-2">
                    <Zap className="size-4 text-neutral-400" />
                    Botões & Ações Interativas (Button Primitives)
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Variações de botões do shadcn/ui estilizados com sutileza e feedback tátil.
                  </p>
                </div>
                <Badge variant="outline" className="font-mono text-[10px]">
                  shadcn/ui Button
                </Badge>
              </div>

              <div className={`p-6 rounded-2xl border ${themeConfig.cardBg} flex flex-wrap items-center gap-3`}>
                {/* Primary Button */}
                <button
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-2 ${themeConfig.buttonClass}`}
                >
                  <Sparkles className="size-3.5" />
                  Ação Primária
                </button>

                {/* Secondary Button */}
                <button className="px-4 py-2 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-all">
                  Ação Secundária
                </button>

                {/* Outline Button */}
                <button className="px-4 py-2 rounded-lg text-xs font-medium bg-transparent hover:bg-white/5 text-neutral-300 border border-white/15 transition-all">
                  Contorno Sutil
                </button>

                {/* Ghost Button */}
                <button className="px-4 py-2 rounded-lg text-xs font-medium hover:bg-white/5 text-neutral-400 hover:text-white transition-all">
                  Fantasma (Ghost)
                </button>

                {/* Loading State */}
                <button
                  disabled
                  className="px-4 py-2 rounded-lg text-xs font-medium bg-white/5 text-neutral-500 border border-white/5 flex items-center gap-2 cursor-not-allowed"
                >
                  <RefreshCw className="size-3.5 animate-spin" />
                  Processando Cena...
                </button>

                {/* Destructive */}
                <button className="px-4 py-2 rounded-lg text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all">
                  Revogar Chave
                </button>

                {/* Icon Action Button */}
                <button className="size-8 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white transition-all">
                  <Copy className="size-3.5" />
                </button>
              </div>
            </div>

            {/* 2. STATUS BADGES & PILLS */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-white flex items-center gap-2">
                  <Activity className="size-4 text-neutral-400" />
                  Badges de Estado & Indicadores Reativos (Convex & Clerk)
                </h3>
                <p className="text-xs text-neutral-400">
                  Micro-tags para indicar conectividade em tempo real, planos e proteção de dados.
                </p>
              </div>

              <div className={`p-6 rounded-2xl border ${themeConfig.cardBg} flex flex-wrap items-center gap-3`}>
                {/* Convex Live Pulse */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
                  <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  Convex Realtime (8ms)
                </div>

                {/* Clerk Verified */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#6366F1]/10 border border-[#6366F1]/20 text-[#818CF8] text-xs font-mono">
                  <Shield className="size-3.5" />
                  Clerk Passkey Ativo
                </div>

                {/* Model Engine Tag */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-200 text-xs font-mono">
                  <Terminal className="size-3" />
                  kriativa-code • SSE Stream
                </div>

                {/* Unlimited Plan */}
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border ${themeConfig.badgeClass}`}
                >
                  <Sparkles className="size-3" />
                  Estúdio Ilimitado
                </div>

                {/* Processing State */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono">
                  <Radio className="size-3 animate-ping" />
                  Motor em Renderização
                </div>
              </div>
            </div>

            {/* 3. FORMULÁRIOS & CAMPOS */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-white flex items-center gap-2">
                  <Sliders className="size-4 text-neutral-400" />
                  Controles de Formulário (Inputs, Switches & Search)
                </h3>
                <p className="text-xs text-neutral-400">
                  Campos com foco de alta definição, atalhos de teclado e ergonomia visual.
                </p>
              </div>

              <div className={`p-6 rounded-2xl border ${themeConfig.cardBg} grid grid-cols-1 md:grid-cols-2 gap-6`}>
                {/* Campo de Busca estilo shadcn com atalho ⌘K */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">
                    Busca Global no Acervo
                  </label>
                  <div className="relative">
                    <Search className="size-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Pesquisar roteiros, atores ou instâncias..."
                      value={searchVal}
                      onChange={(e) => setSearchVal(e.target.value)}
                      className="w-full bg-[#12131A] border border-white/10 focus:border-white/30 rounded-lg pl-9 pr-14 py-2 text-xs text-white placeholder:text-neutral-500 outline-none transition-all"
                    />
                    <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-neutral-400 border border-white/5">
                      ⌘K
                    </kbd>
                  </div>
                </div>

                {/* Input de Chave de API estilo Clerk */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">
                    Chave Secreta de Acesso (krt_live_...)
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Key className="size-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        readOnly
                        value="krt_live_99a8b7c6d5e4f3a2b1c0"
                        className="w-full bg-[#12131A] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-neutral-300 outline-none select-all"
                      />
                    </div>
                    <button
                      onClick={() => copyText("krt_live_99a8b7c6d5e4f3a2b1c0", "api_key")}
                      className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-white font-medium border border-white/10 flex items-center gap-1.5 transition-all"
                    >
                      {copiedToken === "api_key" ? (
                        <>
                          <Check className="size-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copiada</span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-3.5" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Switch estilo shadcn */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="space-y-0.5">
                    <span className="text-xs font-medium text-white block">
                      Roteamento em Tempo Real via Convex
                    </span>
                    <span className="text-[11px] text-neutral-400 block">
                      Alterna automaticamente entre instâncias de processamento disponíveis.
                    </span>
                  </div>
                  <Switch
                    checked={switchState}
                    onCheckedChange={setSwitchState}
                    className="data-[state=checked]:bg-emerald-500"
                  />
                </div>

                {/* Switch estilo Cinema Mode */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="space-y-0.5">
                    <span className="text-xs font-medium text-white block">
                      Modo Cinema Anamórfico 2.39:1
                    </span>
                    <span className="text-[11px] text-neutral-400 block">
                      Ajusta o viewport de pré-visualização para proporção de tela de cinema.
                    </span>
                  </div>
                  <Switch
                    checked={cinemaSwitch}
                    onCheckedChange={setCinemaSwitch}
                    className="data-[state=checked]:bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: TELAS & PAINEIS REAIS */}
        {activeTab === "cards" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-white">
                Como as telas do Kriativa ficarão com este design:
              </h3>
              <p className="text-xs text-neutral-400">
                Abaixo estão 3 composições reais do estúdio reimaginadas sob a tríade Convex + Clerk + shadcn.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* CARD 1: CONVEX REACTIVE MONITOR */}
              <div
                className={`rounded-2xl p-6 border ${themeConfig.cardBg} flex flex-col justify-between space-y-6 relative overflow-hidden`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-mono font-medium text-neutral-200">
                      Convex State Engine
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Live Sync • 12ms
                  </span>
                </div>

                <div className="space-y-3">
                  <span className="text-xs text-neutral-400 uppercase tracking-wider font-mono">
                    Motores de Renderização
                  </span>
                  <div className="text-2xl font-bold font-mono tracking-tight text-white flex items-center justify-between">
                    <span>4 Ativos</span>
                    <span className="text-xs font-normal text-neutral-400 font-sans">
                      100% Capacidade
                    </span>
                  </div>

                  {/* Barra de Progresso elegante */}
                  <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: "82%",
                        background:
                          theme === "shadcn" ? "#FFFFFF" : themeConfig.accent,
                      }}
                    />
                  </div>

                  <div className="pt-2 text-xs text-neutral-400 space-y-1.5">
                    <div className="flex justify-between">
                      <span>kriativa-code:</span>
                      <span className="font-mono text-white">Pronto</span>
                    </div>
                    <div className="flex justify-between">
                      <span>kriativa-mind:</span>
                      <span className="font-mono text-white">Pronto</span>
                    </div>
                    <div className="flex justify-between">
                      <span>kriativa-reasoning:</span>
                      <span className="font-mono text-emerald-400">Instância Ativa</span>
                    </div>
                  </div>
                </div>

                <button
                  className={`w-full py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${themeConfig.buttonClass}`}
                >
                  <Activity className="size-3.5" />
                  Ver Métricas em Tempo Real
                </button>
              </div>

              {/* CARD 2: CLERK AUTH & DEVELOPER IDENTITY */}
              <div
                className={`rounded-2xl p-6 border ${themeConfig.cardBg} flex flex-col justify-between space-y-6 relative overflow-hidden`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-400 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                      LP
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white leading-tight">
                        Leonardo Phelipe
                      </h4>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        Diretor de Cinema & Dev
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-white/10 text-[10px] font-mono">
                    PRO CREATOR
                  </Badge>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">Saldo no Estúdio</span>
                    <span className="font-mono text-white font-semibold">
                      Uso Ilimitado ✨
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">Chaves de API Ativas</span>
                    <span className="font-mono text-white">2 / 10</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">Autenticação Clerk</span>
                    <span className="text-emerald-400 font-mono flex items-center gap-1">
                      <CheckCircle2 className="size-3" />
                      Passkey 2FA
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button className="w-full py-2 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/15 text-white border border-white/10 flex items-center justify-center gap-2 transition-all">
                    <Key className="size-3.5" />
                    Gerenciar Acesso OpenCode
                  </button>
                </div>
              </div>

              {/* CARD 3: SHADCN CINEMA PROJECT CARD */}
              <div
                className={`rounded-2xl p-6 border ${themeConfig.cardBg} flex flex-col justify-between space-y-6 relative overflow-hidden`}
              >
                <div className="relative aspect-video rounded-xl bg-[#141620] border border-white/10 overflow-hidden flex items-center justify-center group">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                  <Film className="size-8 text-white/20 group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute bottom-2.5 left-3 right-3 z-20 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-white truncate">
                      Cena 04 • Odisseia Solar 4K
                    </span>
                    <span className="text-[10px] font-mono bg-black/60 backdrop-blur px-1.5 py-0.5 rounded text-neutral-300 border border-white/10">
                      00:08s
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">
                      Projeto: Cyber Horizon
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">
                      24 fps • Anamórfico
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                    Renderizado através de instâncias de processamento com consistência temporal de atores e controle de câmera 3D.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${themeConfig.buttonClass}`}
                  >
                    Abrir no Studio
                  </button>
                  <button className="size-8 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white transition-all">
                    <Eye className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 3: TOKENS DE DESIGN */}
        {activeTab === "tokens" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-white">
                Paleta de Cores & Escala Tipográfica
              </h3>
              <p className="text-xs text-neutral-400">
                Tokens em conformidade com OKLCH de alto contraste e legibilidade para longas sessões de criação.
              </p>
            </div>

            {/* Grid de Cores */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { name: "Background (Canvas)", hex: "#08090C", desc: "Fundo base obsidiana profundo" },
                { name: "Card Surface", hex: "#0F1117", desc: "Elevação de superfície para cartões" },
                { name: "Borders & Inset", hex: "rgba(255,255,255,0.08)", desc: "Bordas finas de 1px sem ruído" },
                { name: "Active Accent", hex: themeConfig.accent, desc: "Ponto focal de ação e estados ativos" },
                { name: "Text Primary", hex: "#F8FAFC", desc: "Branco puro alto contraste" },
                { name: "Text Muted", hex: "#94A3B8", desc: "Slate calmo para descrições" },
                { name: "Success Live", hex: "#10B981", desc: "Sincronização reativa ativa" },
                { name: "Warning Quota", hex: "#F59E0B", desc: "Alertas de créditos e fila" },
              ].map((c) => (
                <div
                  key={c.name}
                  onClick={() => copyText(c.hex, c.name)}
                  className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/20 transition-all cursor-pointer group"
                >
                  <div
                    className="w-full h-12 rounded-lg mb-3 border border-white/10 shadow-inner flex items-center justify-center"
                    style={{ background: c.hex }}
                  >
                    {copiedToken === c.name && (
                      <span className="text-[10px] font-mono bg-black/80 px-2 py-0.5 rounded text-white flex items-center gap-1">
                        <Check className="size-3 text-emerald-400" /> Copiado
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-white group-hover:text-neutral-200">
                    {c.name}
                  </div>
                  <div className="text-[10px] font-mono text-neutral-400 mt-0.5">
                    {c.hex}
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-1 leading-tight">
                    {c.desc}
                  </div>
                </div>
              ))}
            </div>

            {/* Tipografia */}
            <div className={`p-6 rounded-2xl border ${themeConfig.cardBg} space-y-4`}>
              <h4 className="text-sm font-semibold text-white tracking-tight">
                Escala Tipográfica (Geist Sans + Geist Mono)
              </h4>
              <div className="space-y-4 pt-2">
                <div className="border-b border-white/[0.06] pb-3">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">
                    Display Heading • Geist Sans Semibold • tracking-tight
                  </span>
                  <div className="text-3xl font-extrabold text-white">
                    Cinema Generativo com Controle Total de Câmera 3D
                  </div>
                </div>
                <div className="border-b border-white/[0.06] pb-3">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">
                    Body Regular • Geist Sans Regular • text-sm
                  </span>
                  <div className="text-sm text-neutral-300 leading-relaxed max-w-2xl">
                    As instâncias de processamento e os motores de renderização trabalham em uníssono para sintetizar quadros anamórficos com fidelidade de grão e iluminação de set real.
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">
                    Code & Metrics • Geist Mono • text-xs
                  </span>
                  <div className="text-xs font-mono text-neutral-400">
                    POST /api/v1/chat/completions • model: "kriativa-code" • latency: 14ms • tokens: 1,420
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 4: CÓDIGO CSS & GUIA DE MIGRAÇÃO */}
        {activeTab === "code" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-white">
                  Tokens CSS Prontos para Adoção no Projeto
                </h3>
                <p className="text-xs text-neutral-400">
                  Substitua as variáveis correspondentes no arquivo <code>src/app/globals.css</code> para ativar este visual globalmente.
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(cssTokensCode);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-white font-medium border border-white/10 flex items-center gap-1.5 transition-all"
              >
                {copiedCode ? (
                  <>
                    <Check className="size-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Código Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" />
                    <span>Copiar Tokens CSS</span>
                  </>
                )}
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0A0B10] p-6 font-mono text-xs text-neutral-300 overflow-x-auto relative">
              <pre>{cssTokensCode}</pre>
            </div>

            {/* Resumo do Comparativo */}
            <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] space-y-3">
              <h4 className="text-sm font-semibold text-white">
                O que muda do design atual para a proposta Convex + Clerk + shadcn:
              </h4>
              <ul className="text-xs text-neutral-400 space-y-2 list-disc list-inside leading-relaxed">
                <li>
                  <strong className="text-white">Fundos Neutros Cirúrgicos:</strong> Substituição dos fundos escuros avermelhados por tons obsidiana com micro-bordas neutras de 1px.
                </li>
                <li>
                  <strong className="text-white">Tipografia de Alta Leitura:</strong> Troca de títulos excessivamente estilizados por tipografia limpa (Geist / Inter) com tracking ajustado para ferramentas profissionais de software.
                </li>
                <li>
                  <strong className="text-white">Interações Táteis:</strong> Micro-sombras internas (inset shadows do Clerk), anéis de foco elegantes e feedback tátil em botões.
                </li>
                <li>
                  <strong className="text-white">Conectividade Reativa:</strong> Chips de pulso em tempo real informando o status de sincronização do banco Convex.
                </li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
