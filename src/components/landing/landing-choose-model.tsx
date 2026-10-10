"use client";

import React from "react";
import { Sparkles, Layers, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function LandingChooseModel() {
  const models = [
    {
      name: "Vision",
      target: "Para imagens.",
      detail: "Fotografia realista, ilustrações, peças publicitárias e concept art.",
      color: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
    },
    {
      name: "Motion",
      target: "Para vídeos.",
      detail: "Tomadas cinematográficas, animação de imagens, Reels e Shorts com áudio nativo.",
      color: "border-[#FF5500]/40 text-[#FF5500] bg-[#FF5500]/10",
    },
    {
      name: "Voice",
      target: "Para áudio.",
      detail: "Locuções, dublagens expressivas e efeitos sonoros para seus conteúdos.",
      color: "border-cyan-500/30 text-cyan-400 bg-cyan-500/10",
    },
    {
      name: "Mind",
      target: "Para textos.",
      detail: "Roteiros, decupagem de cenas, copy de alta conversão e ideias criativas.",
      color: "border-purple-500/30 text-purple-400 bg-purple-500/10",
    },
  ];

  return (
    <section id="modelos" className="container mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-20 relative">
      <div className="rounded-3xl border border-white/10 bg-[#090A0E] p-6 sm:p-14 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FF5500]/10 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-10">
          
          {/* Header */}
          <div className="text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/5 font-mono text-xs uppercase tracking-wider text-neutral-300 font-bold">
              <Layers className="size-3.5 text-[#FF5500]" />
              Multi-Modelos Integrados
            </span>
            <h2 className="text-3xl sm:text-5xl font-heading font-black tracking-tight text-white uppercase leading-tight">
              Uma plataforma. Vários modelos.
            </h2>
            <p className="text-sm sm:text-base text-neutral-300 font-sans max-w-2xl mx-auto leading-relaxed">
              Não existe um único modelo perfeito para tudo. Por isso, a Kriativa reúne diferentes tecnologias em uma única interface.
            </p>
          </div>

          {/* Model Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {models.map((m, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/10 bg-[#0C0D12] p-5 space-y-3 flex flex-col justify-between hover:border-white/20 transition-all shadow-md"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-black text-xl text-white">
                      {m.name}
                    </span>
                    <Badge variant="outline" className={`text-[10px] font-mono font-bold ${m.color}`}>
                      Ativo
                    </Badge>
                  </div>
                  <p className="text-xs font-mono font-bold text-neutral-200">
                    {m.target}
                  </p>
                  <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">
                    {m.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Seção 10 do copy.md: Você não precisa entender de modelos de IA */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 space-y-4 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-2 max-w-2xl">
                <h3 className="text-lg sm:text-xl font-heading font-bold text-white">
                  Você não precisa entender de modelos de IA.
                </h3>
                <p className="text-xs sm:text-sm text-neutral-400 font-sans leading-relaxed">
                  Não precisa acompanhar lançamento toda semana. Não precisa saber qual modelo é melhor. Não precisa abrir 15 abas para descobrir onde fazer cada coisa.
                </p>
              </div>
              <div className="w-full sm:w-auto p-4 rounded-xl border border-[#FF5500]/30 bg-[#FF5500]/10 text-center shrink-0">
                <span className="text-xs font-mono font-bold text-[#FF5500] uppercase block">
                  A promessa da Kriativa:
                </span>
                <span className="text-sm font-heading font-black text-white">
                  Você escolhe o que quer criar.<br />Nós cuidamos da complexidade.
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
