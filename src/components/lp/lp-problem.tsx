"use client";

import React from "react";
import { LpCtaButton } from "./lp-cta-button";
import { X, Check, ArrowRight, ShieldAlert, Zap, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function LpProblem() {
  const benefits = [
    "Explore diferentes recursos em um só lugar.",
    "Escolha a ferramenta adequada para sua criação.",
    "Passe de uma ideia para diferentes formatos de conteúdo.",
    "Organize melhor seu fluxo de trabalho criativo.",
  ];

  return (
    <section className="container mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-20">
      <div className="rounded-3xl border border-white/10 bg-[#07080B] p-6 sm:p-14 space-y-10 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-xs font-mono font-bold text-red-400 uppercase tracking-wider">
            <ShieldAlert className="size-3.5" />
            O Problema da Fragmentação
          </div>

          <h2 className="text-3xl sm:text-5xl font-heading font-black tracking-tight text-white uppercase leading-tight">
            Chega de usar uma ferramenta diferente para cada tarefa.
          </h2>

          <p className="text-sm sm:text-base text-neutral-300 font-sans leading-relaxed">
            Uma plataforma para gerar imagens. Outra para criar vídeos. Outra para trabalhar com voz. Mais uma para escrever seus textos.
          </p>

          <p className="text-xs sm:text-sm text-neutral-400 font-sans leading-relaxed">
            No fim, você acaba alternando entre interfaces, aprendendo fluxos diferentes e administrando vários serviços.
          </p>
        </div>

        {/* Contrast Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Card: Como era antes */}
          <div className="rounded-2xl border border-red-500/20 bg-red-950/10 p-6 sm:p-8 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="font-mono text-xs text-red-400 font-bold uppercase tracking-wider block">
                ❌ A rotina cansativa de várias ferramentas
              </span>
              <ul className="space-y-3 text-xs sm:text-sm text-neutral-300">
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold shrink-0">✕</span>
                  <span>4 ou mais contas e senhas diferentes para gerenciar</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold shrink-0">✕</span>
                  <span>Alternar entre várias abas e interfaces desconexas</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold shrink-0">✕</span>
                  <span>Aprender fluxos, comandos e limitações isoladas de cada app</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold shrink-0">✕</span>
                  <span>Múltiplas cobranças mensais sem integração entre os formatos</span>
                </li>
              </ul>
            </div>
            <div className="pt-3 border-t border-white/5 text-[11px] text-neutral-400 font-mono">
              Tempo desperdiçado administrando ferramentas em vez de produzir.
            </div>
          </div>

          {/* Card: Com a Kriativa */}
          <div className="rounded-2xl border-2 border-[#FF5500]/50 bg-gradient-to-b from-[#FF5500]/15 to-[#0A0A0F] p-6 sm:p-8 space-y-4 flex flex-col justify-between shadow-lg">
            <div className="space-y-4">
              <span className="font-mono text-xs text-[#FF5500] font-bold uppercase tracking-wider block">
                ✓ Com a Kriativa
              </span>
              <p className="text-xs sm:text-sm text-neutral-200 font-sans">
                A Kriativa reúne ferramentas de inteligência artificial para simplificar esse processo:
              </p>
              <ul className="space-y-3 text-xs sm:text-sm text-white">
                {benefits.map((b, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <Check className="size-4 text-[#FF5500] shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-3 border-t border-white/10 text-[11px] text-neutral-300 font-mono">
              Uma conta, uma plataforma, várias possibilidades criativas.
            </div>
          </div>
        </div>

        {/* Punchline from copy2.md */}
        <div className="text-center pt-2 space-y-5">
          <div className="font-heading font-black text-lg sm:text-2xl text-white uppercase tracking-tight">
            Sua energia deve estar na criação,{" "}
            <span className="text-[#FF5500]">não na administração de ferramentas.</span>
          </div>

          <div className="flex justify-center">
            <LpCtaButton label="COMEÇAR GRÁTIS →" size="default" />
          </div>
        </div>
      </div>
    </section>
  );
}
