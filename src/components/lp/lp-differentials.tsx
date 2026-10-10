"use client";

import React from "react";
import { LpCtaButton } from "./lp-cta-button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Layers, SlidersHorizontal, CreditCard, Clock, HeartHandshake, CheckCircle2 } from "lucide-react";

export function LpDifferentials() {
  const diffs = [
    {
      title: "Diferentes tecnologias em uma só plataforma",
      desc: "Acesse ferramentas especializadas em diferentes tarefas criativas sem precisar montar seu próprio conjunto de serviços.",
      icon: Layers,
    },
    {
      title: "Opções para diferentes necessidades",
      desc: "Explore alternativas voltadas à velocidade, à qualidade e a diferentes tipos de criação.",
      icon: SlidersHorizontal,
    },
    {
      title: "Liberdade para escolher como pagar",
      desc: "Compre créditos conforme sua necessidade ou escolha o plano mensal para utilizar os recursos incluídos.",
      icon: CreditCard,
    },
    {
      title: "Créditos que não expiram",
      desc: "Os créditos comprados permanecem disponíveis para você usar no seu ritmo, conforme as condições da plataforma.",
      icon: Clock,
    },
    {
      title: "Uma plataforma em evolução",
      desc: "A Kriativa é um projeto brasileiro que busca tornar as tecnologias de inteligência artificial mais acessíveis para quem quer criar. Seu feedback ajuda a orientar as melhorias da experiência.",
      icon: HeartHandshake,
      span: "sm:col-span-2",
    },
  ];

  return (
    <section className="container mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-20">
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider">
          <Sparkles className="size-3.5 text-[#FF5500]" />
          Diferenciais
        </div>

        <h2 className="text-3xl sm:text-5xl font-heading font-black tracking-tight text-white uppercase leading-tight">
          Mais possibilidades. Menos complicação.
        </h2>

        <p className="text-sm sm:text-base text-neutral-300 font-sans leading-relaxed">
          Projetada para dar autonomia e previsibilidade ao seu trabalho criativo.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {diffs.map((d, idx) => {
          const Icon = d.icon;
          return (
            <div
              key={idx}
              className={`rounded-3xl border border-white/10 bg-[#0C0D12] p-7 sm:p-8 space-y-3 hover:border-white/20 transition-all ${
                d.span || ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[#FF5500]">
                  <Icon className="size-5" />
                </div>
                <h3 className="font-heading font-bold text-base sm:text-lg text-white">
                  {d.title}
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-neutral-400 font-sans leading-relaxed pt-1">
                {d.desc}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-12 flex justify-center">
        <LpCtaButton label="COMEÇAR GRÁTIS →" size="default" />
      </div>
    </section>
  );
}
