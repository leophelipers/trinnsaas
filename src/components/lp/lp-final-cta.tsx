"use client";

import React from "react";
import { LpCtaButton } from "./lp-cta-button";
import { Sparkles, ArrowRight } from "lucide-react";

export function LpFinalCta() {
  return (
    <section className="container mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-24">
      <div className="rounded-3xl border-2 border-[#FF5500]/50 bg-gradient-to-b from-[#18110D] via-[#0D0B0A] to-black p-6 sm:p-14 text-center space-y-6 relative overflow-hidden shadow-[0_0_60px_rgba(255,85,0,0.25)]">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(255,85,0,0.25),transparent_70%)] pointer-events-none" />

        <div className="max-w-2xl mx-auto space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider">
            <Sparkles className="size-3.5 text-[#FF5500]" />
            Pronto para Começar?
          </div>

          <h2 className="text-3xl sm:text-5xl font-heading font-black tracking-tight text-white uppercase leading-tight">
            Sua próxima criação começa aqui.
          </h2>

          <p className="text-sm sm:text-base text-neutral-200 font-sans leading-relaxed">
            Explore novas possibilidades, experimente diferentes ferramentas e transforme suas ideias em conteúdo com a Kriativa.
          </p>

          <p className="text-xs sm:text-sm text-neutral-400 font-sans">
            Você não precisa escolher todas as ferramentas agora. Comece conhecendo a plataforma.
          </p>
        </div>

        <div className="pt-2 max-w-sm mx-auto relative z-10">
          <LpCtaButton label="COMEÇAR GRÁTIS →" size="large" showMicrocopy={true} />
        </div>
      </div>
    </section>
  );
}
