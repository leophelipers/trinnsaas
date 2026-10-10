"use client";

import React from "react";
import { LpCtaButton } from "./lp-cta-button";
import { Sparkles, UserPlus, Sliders, Wand2, Eye, ArrowRight } from "lucide-react";

export function LpHowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Crie sua conta",
      desc: "Cadastre-se gratuitamente, sem precisar informar um cartão de crédito.",
      icon: UserPlus,
    },
    {
      num: "02",
      title: "Escolha o que deseja criar",
      desc: "Explore as ferramentas de imagem, vídeo, voz e texto disponíveis na plataforma.",
      icon: Sliders,
    },
    {
      num: "03",
      title: "Dê vida à sua ideia",
      desc: "Descreva o que deseja produzir, forneça suas referências quando a ferramenta permitir e configure sua criação.",
      icon: Wand2,
    },
    {
      num: "04",
      title: "Explore o resultado",
      desc: "Gere seu conteúdo, avalie o resultado e ajuste sua abordagem conforme os recursos disponíveis.",
      icon: Eye,
    },
  ];

  return (
    <section className="container mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-20">
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider">
          <Sparkles className="size-3.5 text-[#FF5500]" />
          Como Funciona
        </div>

        <h2 className="text-3xl sm:text-5xl font-heading font-black tracking-tight text-white uppercase leading-tight">
          Comece a criar em poucos passos.
        </h2>

        <p className="text-sm sm:text-base text-neutral-300 font-sans leading-relaxed">
          Simples, direto e sem burocracia para colocar suas ideias em prática imediatamente.
        </p>
      </div>

      {/* 4 Steps Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={s.num}
              className="rounded-3xl border border-white/10 bg-[#0C0D12] p-6 sm:p-7 space-y-4 hover:border-[#FF5500]/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-2xl font-black text-[#FF5500]">
                    {s.num}
                  </span>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-neutral-300">
                    <Icon className="size-4 text-[#FF5500]" />
                  </div>
                </div>

                <h3 className="font-heading font-bold text-lg text-white">
                  {s.title}
                </h3>

                <p className="text-xs sm:text-sm text-neutral-400 font-sans leading-relaxed">
                  {s.desc}
                </p>
              </div>

              <div className="pt-2 text-[11px] font-mono text-neutral-400">
                Passo {idx + 1} de 4
              </div>
            </div>
          );
        })}
      </div>

      {/* Punchline from copy2.md */}
      <div className="mt-12 text-center space-y-5">
        <div className="font-heading font-black text-base sm:text-xl text-white uppercase tracking-tight max-w-xl mx-auto">
          Você não precisa montar sua própria infraestrutura de inteligência artificial para começar.
        </div>

        <div className="flex justify-center">
          <LpCtaButton label="COMEÇAR GRÁTIS →" size="default" />
        </div>
      </div>
    </section>
  );
}
