"use client";

import React from "react";
import { Sparkles, Film, Image as ImageIcon, Clapperboard, Video, CheckCircle2, Zap, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function LandingModelsShowcase() {
  const models = [
    {
      title: "FastH3 Cinema (Video & Audio)",
      subtitle: "Image-to-Video e Text-to-Video Nativo",
      description:
        "Nosso motor de vídeo com áudio integrado sincronizado. Dá vida a imagens estáticas ou gera tomadas a partir de texto com movimentos fluidos de câmera e sonoplastia realista.",
      specs: [
        "Áudio e trilha sonora nativos",
        "Resolução 480p e 720p HD Master",
        "Compatível com Câmera 3D e Drone FPV",
      ],
      tag: "Ilimitado no Plano R$ 200/mês",
      badgeColor: "border-[#FF5500]/40 text-[#FF5500] bg-[#FF5500]/10",
      icon: Video,
      accentBorder: "hover:border-[#FF5500]/50",
    },
    {
      title: "Krea-2 Turbo (Hiper-Resolução)",
      subtitle: "Geração de Imagens em ~7 Segundos",
      description:
        "Síntese fotográfica de alta fidelidade para concept art, figurinos e quadros mestres. Texturas hiper-realistas de pele, iluminação dramática volumétrica e nitidez máxima.",
      specs: [
        "Geração ultrarrápida (~7s)",
        "Resolução fotorrealista 1024x1024+",
        "Lentes virtuais 35mm e 85mm f/1.4",
      ],
      tag: "Ilimitado no Plano R$ 200/mês",
      badgeColor: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
      icon: ImageIcon,
      accentBorder: "hover:border-emerald-500/50",
    },
    {
      title: "LTX-2.5 Distilled HD",
      subtitle: "Movimento Cinemático Refinado",
      description:
        "Arquitetura de renderização focada em cinemática pura. Simulação de física de tecidos, fluídos, sombras dinâmicas e movimentos de câmera ultra-estáveis.",
      specs: [
        "Cadência cinemática de 24fps",
        "Óptica anamórfica com flare solar",
        "Profundidade de campo cinematográfica",
      ],
      tag: "Incluso no Estúdio",
      badgeColor: "border-cyan-500/40 text-cyan-400 bg-cyan-500/10",
      icon: Film,
      accentBorder: "hover:border-cyan-500/50",
    },
    {
      title: "Kriativa Muse (Diretor de IA)",
      subtitle: "Assistente de Roteiro & Decupagem",
      description:
        "O diretor virtual integrado ao Split Canvas. Transforma ideias vagas em especificações técnicas de tomadas, ângulos de câmera, iluminação de estúdio e enquadramentos perfeitos.",
      specs: [
        "Decupagem de planos cinematográficos",
        "Criação automática de especificações de câmera",
        "Memória de personagens e bíblia visual",
      ],
      tag: "Ilimitado no Plano R$ 200/mês",
      badgeColor: "border-purple-500/40 text-purple-400 bg-purple-500/10",
      icon: Clapperboard,
      accentBorder: "hover:border-purple-500/50",
    },
  ];

  return (
    <section id="modelos" className="container mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-20">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-mono font-semibold text-neutral-300 uppercase tracking-wider">
          <Sparkles className="size-3.5 text-[#FF5500]" />
          Nossos Modelos Proprietários
        </div>
        <h2 className="text-3xl sm:text-5xl font-heading font-black tracking-tight text-white uppercase leading-tight">
          Motores de IA Criados para Cinema
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 font-sans max-w-2xl mx-auto leading-relaxed">
          Sem dependência exclusiva de APIs lentas de terceiros. Oferecemos nossos próprios modelos de geração para entregar velocidade recorde e custo acessível.
        </p>
      </div>

      {/* Grid of Models */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {models.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div
              key={idx}
              className={`rounded-3xl border border-white/10 bg-[#0C0D12] p-6 sm:p-8 space-y-5 flex flex-col justify-between transition-all duration-300 ${m.accentBorder} group shadow-lg`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white group-hover:scale-105 transition-transform">
                    <Icon className="size-5 text-[#FF5500]" />
                  </div>
                  <Badge variant="outline" className={`text-[10px] font-mono font-bold ${m.badgeColor}`}>
                    {m.tag}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-heading font-bold text-white tracking-tight">
                    {m.title}
                  </h3>
                  <span className="text-xs font-mono text-neutral-400">
                    {m.subtitle}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-sans">
                  {m.description}
                </p>

                <ul className="space-y-2 pt-2 border-t border-white/5">
                  {m.specs.map((spec, sIdx) => (
                    <li key={sIdx} className="flex items-center gap-2 text-xs text-neutral-300">
                      <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Direct Callout */}
      <div className="mt-10 text-center">
        <a
          href="#ofertas"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-mono text-[#FF5500] hover:text-[#ff7733] font-bold transition-colors uppercase tracking-wider"
        >
          <span>Garantir Acesso aos Modelos por R$ 5 ou R$ 200/mês Ilimitado</span>
          <ArrowRight className="size-4" />
        </a>
      </div>
    </section>
  );
}
