"use client";

import React from "react";
import { Image as ImageIcon, Video, Volume2, FileText, Sparkles, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function LandingProductSuite() {
  const products = [
    {
      emoji: "🖼️",
      category: "IMAGENS",
      name: "Kriativa Vision",
      headline: "Crie imagens para redes sociais, campanhas, produtos, personagens, anúncios e muito mais.",
      accent: "border-emerald-500/30 group-hover:border-emerald-500/60",
      tagColor: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
      glowColor: "from-emerald-500/10",
    },
    {
      emoji: "🎬",
      category: "VÍDEOS",
      name: "Kriativa Motion",
      headline: "Transforme ideias e imagens em vídeos para conteúdo, anúncios, Reels, Shorts e projetos criativos.",
      accent: "border-[#FF5500]/40 group-hover:border-[#FF5500]/70",
      tagColor: "border-[#FF5500]/40 text-[#FF5500] bg-[#FF5500]/10",
      glowColor: "from-[#FF5500]/10",
    },
    {
      emoji: "🔊",
      category: "ÁUDIOS",
      name: "Kriativa Voice",
      headline: "Crie vozes e áudios para seus conteúdos, vídeos e projetos com entonação natural.",
      accent: "border-cyan-500/30 group-hover:border-cyan-500/60",
      tagColor: "border-cyan-500/40 text-cyan-400 bg-cyan-500/10",
      glowColor: "from-cyan-500/10",
    },
    {
      emoji: "✍️",
      category: "TEXTOS",
      name: "Kriativa Mind",
      headline: "Crie ideias, roteiros, anúncios, textos e conteúdos com inteligência artificial integrada.",
      accent: "border-purple-500/30 group-hover:border-purple-500/60",
      tagColor: "border-purple-500/40 text-purple-400 bg-purple-500/10",
      glowColor: "from-purple-500/10",
    },
  ];

  return (
    <section id="produto" className="container mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-20">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-mono font-semibold text-neutral-300 uppercase tracking-wider">
          <Sparkles className="size-3.5 text-[#FF5500]" />
          Suíte Criativa 4 em 1
        </div>
        <h2 className="text-3xl sm:text-5xl font-heading font-black tracking-tight text-white uppercase leading-tight">
          Tudo o que você precisa para criar.
        </h2>
        <p className="text-sm sm:text-base text-neutral-400 font-sans max-w-xl mx-auto leading-relaxed">
          Quatro ferramentas essenciais em uma só interface unificada, sem atrito entre formatos.
        </p>
      </div>

      {/* 4 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {products.map((p, idx) => (
          <div
            key={idx}
            className={`rounded-3xl border bg-[#0C0D12] p-6 sm:p-8 space-y-5 flex flex-col justify-between transition-all duration-300 shadow-xl group hover:shadow-2xl relative overflow-hidden ${p.accent}`}
          >
            {/* Ambient Corner Glow */}
            <div className={`absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl ${p.glowColor} to-transparent blur-2xl pointer-events-none`} />

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between gap-3">
                <span className="text-3xl sm:text-4xl">{p.emoji}</span>
                <Badge variant="outline" className={`text-[10px] font-mono font-bold ${p.tagColor}`}>
                  {p.category}
                </Badge>
              </div>

              <div>
                <h3 className="text-2xl font-heading font-black text-white uppercase tracking-tight">
                  {p.name}
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-neutral-300 font-sans leading-relaxed">
                {p.headline}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
