"use client";

import React from "react";
import { LpCtaButton } from "./lp-cta-button";
import { Sparkles, CheckCircle2, Lightbulb, Clock, Compass, Layers } from "lucide-react";

export function LpPresentation() {
  const points = [
    {
      title: "Redes Sociais & Conteúdo",
      desc: "Posts, criativos de alto engajamento, carrosséis e artes em segundos.",
    },
    {
      title: "Campanhas & Anúncios",
      desc: "Materiais publicitários de alta conversão para Meta e Google Ads.",
    },
    {
      title: "Criação de Personagens",
      desc: "Arquétipos visuais únicos e consistência fisionômica contínua.",
    },
    {
      title: "Vídeos & Cinema",
      desc: "Tomadas dinâmicas e narrativas em movimento com controle de direção.",
    },
  ];

  return (
    <section className="container mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-16">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#0D0E14] via-[#090A0E] to-[#050507] p-6 sm:p-14 text-center space-y-8 relative overflow-hidden shadow-2xl">
        {/* Glow */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#FF5500]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider">
            <Lightbulb className="size-3.5 text-[#FF5500]" />
            Apresentação
          </div>

          <h2 className="text-3xl sm:text-5xl font-heading font-black tracking-tight text-white uppercase leading-tight">
            Sua próxima grande ideia começa aqui.
          </h2>

          <p className="text-base sm:text-lg text-neutral-200 font-sans max-w-2xl mx-auto leading-relaxed">
            Você não precisa ser especialista em inteligência artificial para começar a criar.
          </p>

          <p className="text-xs sm:text-sm text-neutral-400 font-sans max-w-2xl mx-auto leading-relaxed">
            Seja para produzir conteúdo para as redes sociais, desenvolver campanhas, criar personagens, montar vídeos ou tirar um projeto do papel, a Kriativa reúne ferramentas para ajudar você em diferentes etapas do processo criativo.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 text-left">
          {points.map((p, idx) => (
            <div
              key={idx}
              className="p-4 sm:p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-[#FF5500]/30 transition-all space-y-1.5"
            >
              <div className="size-2 rounded-full bg-[#FF5500] mb-2" />
              <h3 className="font-heading font-bold text-sm text-white">
                {p.title}
              </h3>
              <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                {p.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Punchline from copy2.md */}
        <div className="pt-4 space-y-6 border-t border-white/10">
          <div className="font-heading font-black text-lg sm:text-2xl text-white uppercase tracking-tight">
            Menos tempo procurando ferramentas.{" "}
            <span className="text-[#FF5500]">Mais tempo criando.</span>
          </div>

          <div className="flex justify-center">
            <LpCtaButton label="COMEÇAR GRÁTIS →" size="default" />
          </div>
        </div>
      </div>
    </section>
  );
}
