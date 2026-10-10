"use client";

import React from "react";
import { LpCtaButton } from "./lp-cta-button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, ShieldCheck, Zap, Image, Video, Mic, FileText } from "lucide-react";

export function LpHero() {
  return (
    <section id="inicio" className="relative pt-8 pb-12 sm:pt-20 sm:pb-24 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] max-w-full h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(255,85,0,0.18),transparent_70%)] pointer-events-none" />

      <div className="container mx-auto max-w-5xl px-4 sm:px-6 text-center relative z-10 space-y-5 sm:space-y-8">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#FF5500]/30 bg-[#FF5500]/10 text-[11px] sm:text-xs font-mono font-bold text-[#FF5500] uppercase tracking-wider shadow-sm animate-in fade-in duration-300">
          <Sparkles className="size-3.5 fill-[#FF5500] shrink-0" />
          <span>Inteligência artificial para criar mais</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-black tracking-tight text-white uppercase leading-[1.04] max-w-4xl mx-auto break-words">
          Todas as IAs que você precisa.{" "}
          <span className="bg-gradient-to-r from-white via-[#FF5500] to-[#FF8800] bg-clip-text text-transparent block mt-1 sm:mt-2">
            Em um só lugar.
          </span>
        </h1>

        {/* Subtitles from copy2.md */}
        <div className="space-y-3 max-w-2xl mx-auto">
          <p className="text-base sm:text-xl font-heading font-semibold text-neutral-200 leading-snug">
            Crie imagens incríveis, vídeos cinematográficos, vozes com inteligência artificial e textos para seus projetos em uma única plataforma.
          </p>
          <p className="text-xs sm:text-sm text-neutral-400 font-sans leading-relaxed">
            Explore diferentes tecnologias, transforme suas ideias em conteúdo e simplifique seu processo criativo sem precisar administrar várias ferramentas separadas.
          </p>
        </div>

        {/* Primary CTA */}
        <div className="pt-2 max-w-md mx-auto">
          <LpCtaButton label="COMEÇAR GRÁTIS →" size="large" showMicrocopy={true} />
        </div>

        {/* Microcopy Pill from copy2.md: Imagem, vídeo, áudio e texto. Uma plataforma, novas possibilidades. */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-xs font-mono text-neutral-400">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/5">
            <Image className="size-3.5 text-amber-400" />
            <span>Imagem</span>
          </div>
          <span className="text-neutral-600 hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/5">
            <Video className="size-3.5 text-[#FF5500]" />
            <span>Vídeo</span>
          </div>
          <span className="text-neutral-600 hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/5">
            <Mic className="size-3.5 text-purple-400" />
            <span>Áudio</span>
          </div>
          <span className="text-neutral-600 hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/5">
            <FileText className="size-3.5 text-cyan-400" />
            <span>Texto</span>
          </div>
        </div>

        <p className="text-[11px] sm:text-xs text-neutral-400 italic font-sans">
          Uma plataforma, novas possibilidades.
        </p>
      </div>
    </section>
  );
}
