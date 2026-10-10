"use client";

import React from "react";
import { Video, Image as ImageIcon, FileText, Bot, Layers, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Flame, Camera } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function LandingCreativeSuite() {
  const capabilities = [
    {
      title: "Geração de Vídeos Cinemáticos",
      badge: "Vídeo & Áudio Nativo",
      badgeColor: "border-[#FF5500]/40 text-[#FF5500] bg-[#FF5500]/10",
      icon: Video,
      headline: "Text-to-Video e Image-to-Video em alta fidelidade com sonoplastia integrada.",
      features: [
        "Física de câmera 3D: Drone FPV, Órbita 360°, Dolly Zoom Vertigo e Pans",
        "Áudio e efeitos sonoros sincronizados nativamente",
        "Exportação em 16:9 Cinema, 9:16 Vertical (TikTok/Reels) e 2.39:1 Anamórfico",
      ],
      borderHover: "hover:border-[#FF5500]/50",
    },
    {
      title: "Geração de Imagens Fotorrealistas",
      badge: "Síntese em ~7s",
      badgeColor: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
      icon: ImageIcon,
      headline: "Fotografia de estúdio, retratos, concept arts e design de produto ultra-nítidos.",
      features: [
        "Motor Krea-2 Turbo de altíssima resolução gerando em apenas ~7 segundos",
        "Emulação de lentes 35mm e 85mm com abertura f/1.4 e bokeh dramático",
        "Texturas hiper-realistas de pele, tecidos e iluminação volumétrica",
      ],
      borderHover: "hover:border-emerald-500/50",
    },
    {
      title: "Roteiros & Textos com IA",
      badge: "Padrão Master Scene",
      badgeColor: "border-cyan-500/40 text-cyan-400 bg-cyan-500/10",
      icon: FileText,
      headline: "Formatação cinematográfica profissional, decupagem de cenas e copy para anúncios.",
      features: [
        "Transformação de ideias vagas em roteiros formatados cena a cena",
        "Decupagem automática de tomadas com sugestão de ângulos de câmera",
        "Geração de copy persuasivo de alta conversão para comerciais e vídeos sociais",
      ],
      borderHover: "hover:border-cyan-500/50",
    },
    {
      title: "Agentes de IA de Produção",
      badge: "Equipe Virtual Autônoma",
      badgeColor: "border-purple-500/40 text-purple-400 bg-purple-500/10",
      icon: Bot,
      headline: "Agentes especializados que atuam como diretor de cena, roteirista e decupador.",
      features: [
        "Kriativa Muse: assistente conversacional diretor integrado ao Split Canvas",
        "Bíblia de Produção e Lorebook com memória contínua do seu universo",
        "Cofre de Consistência com invocação de atores via @menções na cena",
      ],
      borderHover: "hover:border-purple-500/50",
    },
  ];

  return (
    <section id="suite" className="container mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-20 relative">
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(255,85,0,0.08),transparent_70%)] pointer-events-none" />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-mono font-semibold text-neutral-300 uppercase tracking-wider">
          <Sparkles className="size-3.5 text-[#FF5500]" />
          A Suíte Criativa Completa
        </div>
        <h2 className="text-3xl sm:text-5xl font-heading font-black tracking-tight text-white uppercase leading-tight">
          Vídeo, Imagem, Texto & Agentes.{" "}
          <span className="bg-gradient-to-r from-white via-[#FF5500] to-[#FF8800] bg-clip-text text-transparent">
            Tudo em Uma Só Plataforma.
          </span>
        </h2>
        <p className="text-sm sm:text-base text-neutral-300 max-w-2xl mx-auto leading-relaxed font-sans">
          Não pague por 4 assinaturas diferentes. O Kriativa unifica a criação de vídeo, geração de imagem, escrita de roteiros e inteligência de agentes autônomos no mesmo ecossistema integrado.
        </p>
      </div>

      {/* Grid of Capabilities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {capabilities.map((cap, idx) => {
          const Icon = cap.icon;
          return (
            <div
              key={idx}
              className={`rounded-3xl border border-white/10 bg-[#0C0D12] p-6 sm:p-8 space-y-5 flex flex-col justify-between transition-all duration-300 shadow-xl ${cap.borderHover} group`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-[#FF5500] group-hover:scale-105 transition-transform">
                    <Icon className="size-6" />
                  </div>
                  <Badge variant="outline" className={`text-[10px] font-mono font-bold ${cap.badgeColor}`}>
                    {cap.badge}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-xl font-heading font-bold text-white tracking-tight">
                    {cap.title}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-neutral-300 font-sans leading-relaxed">
                    {cap.headline}
                  </p>
                </div>

                <ul className="space-y-2.5 pt-3 border-t border-white/5 text-xs text-neutral-300 font-sans">
                  {cap.features.map((f, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mini Feature Banner */}
      <div className="mt-10 max-w-4xl mx-auto p-4 rounded-2xl border border-white/10 bg-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#FF5500]/10 text-[#FF5500] shrink-0">
            <Flame className="size-4" />
          </div>
          <p className="text-xs text-neutral-300 font-sans">
            Acesso a todas essas ferramentas a partir de <strong className="text-white">R$ 5,00</strong> no PIX ou <strong className="text-white">R$ 200/mês Ilimitado</strong> nos nossos modelos.
          </p>
        </div>
        <a
          href="#ofertas"
          className="px-5 py-2.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider bg-[#FF5500] hover:bg-[#ff6600] text-white transition-all shadow-[0_0_20px_rgba(255,85,0,0.35)] shrink-0 active:scale-95"
        >
          Ver Planos & Ofertas
        </a>
      </div>
    </section>
  );
}
