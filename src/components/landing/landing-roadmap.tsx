"use client";

import React from "react";
import { CheckCircle2, Clock, Rocket, Sparkles, Bot, Video, Image as ImageIcon, FileText, Cpu, Users, Layers, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function LandingRoadmap() {
  const roadmapStages = [
    {
      phase: "Fase 1 — No Ar & Operacional",
      badge: "Entregue • 100% Ativo",
      badgeColor: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
      icon: CheckCircle2,
      accentBorder: "border-emerald-500/30",
      description: "Infraestrutura central de produção multimídia disponível para todos os criadores hoje.",
      items: [
        {
          title: "Geração de Vídeos Cinemáticos com Áudio Nativo",
          desc: "Motores FastH3 (T2V e I2V) gerando tomadas com sonoplastia integrada sincronizada.",
          icon: Video,
        },
        {
          title: "Geração de Imagens Fotorrealistas em ~7s",
          desc: "Síntese de imagens em altíssima resolução com texturas dramáticas e iluminação de estúdio (Krea-2 Turbo).",
          icon: ImageIcon,
        },
        {
          title: "Controle de Câmera 3D em Tempo Real",
          desc: "Drone FPV, Dolly Zoom Vertigo, Órbita 360° e Pans horizontais com inércia física real.",
          icon: Layers,
        },
        {
          title: "Cofre de Consistência de Atores",
          desc: "Preservação rigorosa da fisionomia, figurino e traços de personagens entre cortes sucessivos (@menções).",
          icon: Users,
        },
        {
          title: "Roteiro & Diretor de IA Integrado (Kriativa Muse)",
          desc: "Assistente conversacional para transformar sinopses em especificações técnicas de tomadas e decupagem.",
          icon: Bot,
        },
        {
          title: "Entrada Flexível de R$ 5 e PIX em 3 Segundos",
          desc: "Compensação instantânea sem mensalidade forçada, com créditos vitalícios que nunca expiram.",
          icon: Sparkles,
        },
      ],
    },
    {
      phase: "Fase 2 — Próximos Lançamentos",
      badge: "Q4 2026 • Em Desenvolvimento",
      badgeColor: "border-[#FF5500]/40 text-[#FF5500] bg-[#FF5500]/10",
      icon: Clock,
      accentBorder: "border-[#FF5500]/40",
      description: "Evolução dos agentes autônomos e ferramentas de sincronização labial e áudio avançado.",
      items: [
        {
          title: "Agentes Autônomos de Produção em Loop",
          desc: "Equipe virtual autônoma (Agente Roteirista + Agente Diretor + Agente de Decupagem) gerando tomadas completas a partir de uma ideia.",
          icon: Bot,
        },
        {
          title: "Lip-Sync Neural & Clonagem Vocal Multi-Idioma",
          desc: "Sincronização labial realista com dublagem em português e dezenas de idiomas com entonação dramática.",
          icon: Volume2,
        },
        {
          title: "Timeline Multi-Track no Navegador",
          desc: "Sequenciamento direto de clipes gerados, cortes e transições com renderização unificada de cenas.",
          icon: Layers,
        },
        {
          title: "Importação Direta de Roteiros (PDF/Final Draft)",
          desc: "Ingestão de arquivos de roteiro inteiros com quebra automática em tomadas e sugestão de planos de câmera.",
          icon: FileText,
        },
      ],
    },
    {
      phase: "Fase 3 — A Nova Fronteira",
      badge: "Q1 2027 • No Radar",
      badgeColor: "border-purple-500/40 text-purple-400 bg-purple-500/10",
      icon: Rocket,
      accentBorder: "border-purple-500/30",
      description: "Recursos de estúdio colaborativo para agências, produtoras e integração com o ecossistema profissional.",
      items: [
        {
          title: "Modelos Proprietários 4K Master Ultra-Fidelidade",
          desc: "Motores treinados internamente para fidelidade óptica de nível cinematográfico sem upscaling posterior.",
          icon: Cpu,
        },
        {
          title: "Workspaces Colaborativos em Tempo Real",
          desc: "Múltiplos editores e diretores trabalhando simultaneamente no mesmo projeto com controle de permissões.",
          icon: Users,
        },
        {
          title: "Plugins para Premiere Pro & DaVinci Resolve",
          desc: "Handoff e exportação em 1 clique direto para a timeline dos principais softwares de edição do mercado.",
          icon: Sparkles,
        },
        {
          title: "API Pública & Webhooks para Desenvolvedores",
          desc: "Automação programática para agências escalarem criação de vídeos, imagens e textos em massa.",
          icon: Bot,
        },
      ],
    },
  ];

  return (
    <section id="roadmap" className="container mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-20 relative">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#FF5500]/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-mono font-semibold text-neutral-300 uppercase tracking-wider">
          <Rocket className="size-3.5 text-[#FF5500]" />
          Visão de Futuro Transparente
        </div>
        <h2 className="text-3xl sm:text-5xl font-heading font-black tracking-tight text-white uppercase leading-tight">
          Nosso Roadmap de Evolução
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 font-sans max-w-2xl mx-auto leading-relaxed">
          O Kriativa não é apenas um gerador de mídia pontual: estamos construindo o estúdio multimídia definitivo com inteligência artificial, agentes autônomos e ferramentas integradas para cinema e publicidade.
        </p>
      </div>

      {/* Roadmap Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
        {roadmapStages.map((stage, idx) => {
          const StageIcon = stage.icon;
          return (
            <div
              key={idx}
              className={`rounded-3xl border bg-[#0C0D12] p-6 sm:p-8 space-y-6 flex flex-col justify-between transition-all duration-300 shadow-xl ${stage.accentBorder}`}
            >
              <div className="space-y-4">
                {/* Stage Header */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h3 className="font-heading font-bold text-base sm:text-lg text-white">
                    {stage.phase}
                  </h3>
                  <Badge variant="outline" className={`text-[10px] font-mono font-bold ${stage.badgeColor}`}>
                    {stage.badge}
                  </Badge>
                </div>

                <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                  {stage.description}
                </p>

                {/* Items List */}
                <ul className="space-y-4 pt-4 border-t border-white/5">
                  {stage.items.map((item, iIdx) => {
                    const ItemIcon = item.icon;
                    return (
                      <li key={iIdx} className="flex items-start gap-3">
                        <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-[#FF5500] shrink-0 mt-0.5">
                          <ItemIcon className="size-3.5" />
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="text-xs sm:text-sm font-heading font-bold text-white leading-tight">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Roadmap CTA */}
      <div className="mt-12 text-center">
        <p className="text-xs text-neutral-400 font-mono mb-3">
          Todos os assinantes e usuários têm acesso imediato aos novos lançamentos conforme são liberados.
        </p>
        <div className="flex justify-center max-w-md mx-auto">
          <a
            href="#ofertas"
            className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-heading font-black text-xs uppercase tracking-wider bg-white/10 hover:bg-white/15 text-white border border-white/15 transition-all shadow-md active:scale-95"
          >
            <span>Garantir Meu Acesso Hoje (R$ 5 ou R$ 200/mês)</span>
          </a>
        </div>
      </div>
    </section>
  );
}
