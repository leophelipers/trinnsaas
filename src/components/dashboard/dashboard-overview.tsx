"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Film,
  Sparkles,
  Coins,
  Video,
  ImageIcon,
  FolderPlus,
  Play,
  ArrowRight,
  TrendingUp,
  Percent,
  Sliders,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  Compass,
  BookOpen,
  Zap,
  Gift,
  X,
  Layers,
  Settings,
  Bot,
  LayoutGrid,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const SPEED_DIAL_OPTIONS = [
  { id: "new_video", label: "Novo Vídeo Cinemático", href: "/dashboard/studio", icon: Video, color: "text-[#FF5500]", bg: "bg-[#FF5500]/10 border-[#FF5500]/30" },
  { id: "new_image", label: "Gerar Imagem 8K", href: "/dashboard/studio", icon: ImageIcon, color: "text-[#00E5FF]", bg: "bg-[#00E5FF]/10 border-[#00E5FF]/30" },
  { id: "chat_muse", label: "Kriativa Muse (Chat IA)", href: "/chat", icon: Sparkles, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/30" },
  { id: "credits_topup", label: "Recarregar Créditos", href: "/dashboard/credits", icon: Coins, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30" },
  { id: "production_bible", label: "Bíblia da Produção", href: "/chat", icon: BookOpen, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" },
  { id: "studio_projects", label: "Projetos do Estúdio", href: "/dashboard/studio", icon: Film, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
];

export function DashboardOverview({ displayName }: { displayName: string }) {
  const data = useQuery(api.dashboard.getDashboardOverview);
  const updateSpeedDial = useMutation(api.dashboard.updateSpeedDialShortcuts);

  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [activeShortcuts, setActiveShortcuts] = useState<string[]>([]);
  const [isSavingShortcuts, setIsSavingShortcuts] = useState(false);

  // Sincroniza atalhos locais com dados remotos
  React.useEffect(() => {
    if (data?.speedDialShortcuts) {
      setActiveShortcuts(data.speedDialShortcuts);
    }
  }, [data?.speedDialShortcuts]);

  const handleToggleShortcut = (id: string) => {
    setActiveShortcuts((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSaveShortcuts = async () => {
    try {
      setIsSavingShortcuts(true);
      await updateSpeedDial({ shortcuts: activeShortcuts });
      setIsCustomizeModalOpen(false);
    } catch (err) {
      console.error("Erro ao salvar speed dial:", err);
    } finally {
      setIsSavingShortcuts(false);
    }
  };

  if (data === undefined) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-44 rounded-3xl bg-white/[0.03] border border-white/10" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="h-32 rounded-2xl bg-white/[0.03] border border-white/10" />
          <div className="h-32 rounded-2xl bg-white/[0.03] border border-white/10" />
          <div className="h-32 rounded-2xl bg-white/[0.03] border border-white/10" />
        </div>
      </div>
    );
  }

  const {
    tokenStats,
    recentGenerations,
    recentModels,
    activeProjectsCount,
    totalProjectsCount,
    banners,
    promotions,
  } = data || {
    tokenStats: { totalCredits: 0, paidCredits: 0, bonusCredits: 0, lastTopUpAmount: 50, spentSinceLastTopUp: 0, percentSpent: 0 },
    recentGenerations: [],
    recentModels: [],
    activeProjectsCount: 0,
    totalProjectsCount: 0,
    banners: [],
    promotions: [],
  };

  return (
    <div className="space-y-6">
      {/* 1. BANNERS DE DESTAQUE (Configuráveis no Admin) */}
      {banners.length > 0 && (
        <div className="space-y-3">
          {banners.map((b) => (
            <div
              key={b._id}
              className="relative overflow-hidden rounded-2xl border border-[#FF5500]/30 bg-gradient-to-r from-[#FF5500]/15 via-[#0C0D12] to-[#08090C] p-4 sm:p-5 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2">
                  {b.badgeText && (
                    <Badge className="bg-[#FF5500] text-white text-[10px] font-mono px-2 py-0.5 uppercase font-bold shadow-sm">
                      {b.badgeText}
                    </Badge>
                  )}
                  <h3 className="font-heading font-black text-white text-base tracking-tight uppercase">
                    {b.title}
                  </h3>
                </div>
                <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                  {b.description}
                </p>
              </div>

              {b.linkUrl && (
                <Link
                  href={b.linkUrl}
                  className="self-start sm:self-center shrink-0 bg-[#FF5500] hover:bg-[#FF5500]/90 text-white font-heading font-bold text-xs uppercase px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(255,85,0,0.4)] flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>{b.linkText || "Acessar Agora"}</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 2. HEADER DE BOAS-VINDAS & SPEED DIAL PERSONALIZÁVEL */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#0C0D12] via-[#090A0E] to-[#050506] p-6 sm:p-7 shadow-2xl backdrop-blur-xl">
        <div className="absolute -right-20 -top-20 size-64 rounded-full bg-[#FF5500]/10 blur-[80px] pointer-events-none" />
        
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase text-neutral-400">Estúdio Criativo Central</span>
              <Badge variant="outline" className="text-[10px] gap-1 border-emerald-500/30 text-emerald-400 bg-emerald-500/10 font-mono">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Estúdio Operacional
              </Badge>
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-white uppercase">
              Olá, {displayName}! 🎬
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 font-sans leading-relaxed">
              Painel integrado de direção de arte, inteligência cinematográfica e telemetria do seu estúdio.
            </p>
          </div>

          {/* Speed Dial Bar (Atalhos Rápidos) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                Ações Rápidas (Speed Dial)
              </span>
              <button
                type="button"
                onClick={() => setIsCustomizeModalOpen(true)}
                className="text-[10px] font-mono text-[#FF5500] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sliders className="size-2.5" />
                Personalizar
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {SPEED_DIAL_OPTIONS.filter((s) => activeShortcuts.includes(s.id)).map((opt) => {
                const Icon = opt.icon;
                return (
                  <Link
                    key={opt.id}
                    href={opt.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-heading font-medium transition-all hover:scale-105 ${opt.bg}`}
                  >
                    <Icon className={`size-3.5 ${opt.color}`} />
                    <span className="text-white text-xs">{opt.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. CARDS DE TELEMETRIA: CRÉDITOS, GASTOS & PROJETOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Quantidade Disponível */}
        <Card className="bg-[#0C0D12]/90 border border-white/10 shadow-xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF5500]/10 rounded-full blur-2xl pointer-events-none" />
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[10px] font-mono uppercase tracking-wider">Créditos Disponíveis</span>
              <Coins className="size-4 text-[#FF5500]" />
            </div>
            <CardTitle className="text-2xl font-mono font-black text-white flex items-baseline gap-1">
              {tokenStats.totalCredits}
              <span className="text-xs font-normal text-neutral-400">cr</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
              <span>Pagos: <strong className="text-white">{tokenStats.paidCredits}</strong></span>
              <span>Bônus: <strong className="text-amber-400">{tokenStats.bonusCredits}</strong></span>
            </div>
            <Link
              href="/dashboard/credits"
              className="text-[11px] text-[#FF5500] hover:underline font-mono flex items-center gap-1 font-bold pt-1"
            >
              Recarregar créditos
              <ArrowRight className="size-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Card 2: % Gasto do Último Top-Up */}
        <Card className="bg-[#0C0D12]/90 border border-white/10 shadow-xl backdrop-blur-xl">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[10px] font-mono uppercase tracking-wider">Consumo da Recarga</span>
              <Percent className="size-4 text-emerald-400" />
            </div>
            <CardTitle className="text-2xl font-mono font-black text-white flex items-baseline gap-1">
              {tokenStats.percentSpent}%
              <span className="text-xs font-normal text-neutral-400">consumido</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-2">
            {/* Barra de Progresso */}
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/10">
              <div
                className="bg-gradient-to-r from-emerald-500 via-[#FF5500] to-amber-400 h-full transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(100, Math.max(5, tokenStats.percentSpent))}%` }}
              />
            </div>
            <p className="text-[10px] text-neutral-400 font-mono">
              {tokenStats.spentSinceLastTopUp} cr gastos de ~{tokenStats.lastTopUpAmount} cr da última cota
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Projetos Ativos */}
        <Card className="bg-[#0C0D12]/90 border border-white/10 shadow-xl backdrop-blur-xl">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[10px] font-mono uppercase tracking-wider">Projetos Ativos</span>
              <Film className="size-4 text-[#00E5FF]" />
            </div>
            <CardTitle className="text-2xl font-mono font-black text-white flex items-baseline gap-1">
              {activeProjectsCount}
              <span className="text-xs font-normal text-neutral-400">
                de {totalProjectsCount} total
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <Link
              href="/dashboard/studio"
              className="text-[11px] text-[#00E5FF] hover:underline font-mono flex items-center gap-1 font-bold pt-3"
            >
              Abrir Kriativa Studio
              <ArrowRight className="size-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Card 4: Assistente Criativo Muse */}
        <Card className="bg-[#0C0D12]/90 border border-white/10 shadow-xl backdrop-blur-xl">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[10px] font-mono uppercase tracking-wider">Diretor IA Muse</span>
              <Sparkles className="size-4 text-purple-400" />
            </div>
            <CardTitle className="text-base font-heading font-black text-white">
              Kriativa Muse
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-[11px] text-neutral-400 line-clamp-2">
              Assistente multimodal para roteirização e direção de câmera.
            </p>
            <Link
              href="/chat"
              className="text-[11px] text-purple-400 hover:underline font-mono flex items-center gap-1 font-bold pt-2"
            >
              Conversar com o Diretor
              <ArrowRight className="size-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* 4. SEÇÃO PRINCIPAL EM 2 COLUNAS: ÚLTIMAS GERAÇÕES & MODELOS RECENTES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Esquerda (2 cols): Últimas 3 a 5 Gerações */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-[#0C0D12]/90 border border-white/10 shadow-2xl backdrop-blur-xl">
            <CardHeader className="p-5 pb-3 border-b border-white/10 flex flex-row items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Play className="size-4 text-[#FF5500]" />
                  <CardTitle className="text-base font-heading font-bold uppercase tracking-tight text-white">
                    Últimas Tomadas & Cenas Geradas
                  </CardTitle>
                </div>
                <CardDescription className="text-xs text-neutral-400 mt-0.5">
                  Suas renderizações recentes no Kriativa Studio
                </CardDescription>
              </div>

              <Link
                href="/dashboard/studio"
                className="text-xs text-[#FF5500] hover:underline flex items-center gap-1 font-heading font-bold uppercase tracking-wider"
              >
                Abrir Estúdio
                <ArrowRight className="size-3" />
              </Link>
            </CardHeader>

            <CardContent className="p-5">
              {recentGenerations.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-neutral-400">
                    <Video className="size-6" />
                  </div>
                  <p className="text-xs text-neutral-400">Você ainda não gerou nenhuma cena.</p>
                  <Link
                    href="/dashboard/studio"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF5500] text-white text-xs font-bold font-heading uppercase"
                  >
                    <Plus className="size-3.5" />
                    Criar Primeira Tomada
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {recentGenerations.map((gen) => (
                    <div
                      key={gen._id}
                      className="group relative rounded-2xl bg-black/60 border border-white/10 overflow-hidden hover:border-[#FF5500]/50 transition-all shadow-lg flex flex-col justify-between"
                    >
                      <div className="aspect-video w-full bg-neutral-900 relative overflow-hidden flex items-center justify-center">
                        {gen.outputUrl ? (
                          gen.type === "video" ? (
                            <video
                              src={gen.outputUrl}
                              className="w-full h-full object-cover"
                              muted
                              loop
                              onMouseEnter={(e) => e.currentTarget.play()}
                              onMouseLeave={(e) => e.currentTarget.pause()}
                            />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={gen.outputUrl}
                              alt={gen.prompt}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          )
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-neutral-500">
                            <Clock className="size-5 animate-spin" />
                            <span className="text-[10px] font-mono">Processando...</span>
                          </div>
                        )}

                        <Badge
                          variant="outline"
                          className="absolute top-2 left-2 bg-black/70 backdrop-blur-md text-[9px] font-mono border-white/20 text-white py-0.5 px-1.5"
                        >
                          {gen.type === "video" ? "🎬 VÍDEO" : "🖼️ IMAGEM"}
                        </Badge>
                      </div>

                      <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
                        <p className="text-[11px] text-neutral-300 line-clamp-2 leading-snug">
                          {gen.prompt}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono pt-1 border-t border-white/5">
                          <span className="truncate max-w-[100px]">{gen.engine}</span>
                          <span className="text-[#FF5500] font-bold">{gen.creditsCharged} cr</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita (1 col): Modelos Recentes & Promoções */}
        <div className="space-y-6">
          {/* Card: Últimos 5 Modelos Utilizados */}
          <Card className="bg-[#0C0D12]/90 border border-white/10 shadow-2xl backdrop-blur-xl">
            <CardHeader className="p-4 pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Compass className="size-4 text-[#00E5FF]" />
                <CardTitle className="text-sm font-heading font-bold uppercase tracking-tight text-white">
                  Últimos 5 Modelos Utilizados
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {recentModels.length === 0 ? (
                <p className="text-xs text-neutral-500 italic py-2">
                  Nenhum modelo registrado recentemente.
                </p>
              ) : (
                recentModels.map((m, idx) => (
                  <div
                    key={`${m.slug}-${idx}`}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/10 hover:border-white/20 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="size-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs shrink-0">
                        {m.type === "video" ? "🎬" : m.type === "image" ? "🖼️" : "💬"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{m.name}</p>
                        <p className="text-[10px] font-mono text-neutral-500 uppercase">{m.provider}</p>
                      </div>
                    </div>

                    <Link
                      href={m.type === "chat" ? "/chat" : "/dashboard/studio"}
                      className="text-[10px] font-mono text-[#FF5500] hover:underline shrink-0"
                    >
                      Usar
                    </Link>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Card: Promoções do Site */}
          <Card className="bg-[#0C0D12]/90 border border-white/10 shadow-2xl backdrop-blur-xl">
            <CardHeader className="p-4 pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Gift className="size-4 text-amber-400" />
                <CardTitle className="text-sm font-heading font-bold uppercase tracking-tight text-white">
                  Promoções & Vantagens
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5">
              {promotions.map((promo) => (
                <div
                  key={promo.id}
                  className={`p-3 rounded-xl border transition-all ${
                    promo.highlight
                      ? "bg-gradient-to-r from-amber-500/10 to-[#FF5500]/10 border-amber-500/30"
                      : "bg-black/40 border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <Badge className="bg-amber-400 text-black font-black text-[9px] px-1.5 py-0">
                      {promo.badge}
                    </Badge>
                    <Link
                      href={promo.linkUrl}
                      className="text-[10px] font-mono text-[#FF5500] hover:underline font-bold"
                    >
                      {promo.actionText} →
                    </Link>
                  </div>
                  <h4 className="text-xs font-bold text-white mt-1">{promo.title}</h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                    {promo.subtitle}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* MODAL: PERSONALIZAÇÃO DO SPEED DIAL */}
      {isCustomizeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#0C0D12] p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="size-4 text-[#FF5500]" />
                <h3 className="font-heading font-bold text-white uppercase text-sm">
                  Personalizar Speed Dial
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomizeModalOpen(false)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-400 font-sans leading-relaxed">
              Selecione as ações rápidas que deseja manter visíveis no topo do seu painel:
            </p>

            <div className="space-y-2">
              {SPEED_DIAL_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = activeShortcuts.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleToggleShortcut(opt.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "bg-[#FF5500]/15 border-[#FF5500] text-white"
                        : "bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`size-4 ${opt.color}`} />
                      <span className="text-xs font-heading font-medium">{opt.label}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="size-4 text-[#FF5500]" />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCustomizeModalOpen(false)}
                className="border-white/15 text-neutral-300 hover:text-white text-xs h-8"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSaveShortcuts}
                disabled={isSavingShortcuts}
                className="bg-[#FF5500] hover:bg-[#FF5500]/90 text-white text-xs font-bold h-8"
              >
                {isSavingShortcuts ? "Salvando..." : "Salvar Preferências"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
