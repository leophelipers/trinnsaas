"use client";

import React from "react";
import { Check, X, Sparkles, ArrowRight, Layers } from "lucide-react";

export function LandingComparison() {
  const separateTools = [
    "Vários cadastros",
    "Várias interfaces",
    "Várias cobranças",
    "Diferentes créditos",
    "Precisa descobrir qual ferramenta usar",
  ];

  const kriativaFeatures = [
    "Uma conta",
    "Uma interface",
    "Imagem",
    "Vídeo",
    "Áudio",
    "Texto",
    "Diferentes modelos",
    "Créditos que não expiram",
    "Opção de assinatura",
  ];

  return (
    <section id="comparativo" className="container mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-20 relative">
      <div className="rounded-3xl border border-white/10 bg-[#090A0E] p-6 sm:p-14 relative overflow-hidden shadow-2xl">
        {/* Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-48 bg-[#FF5500]/10 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-10">
          {/* Header */}
          <div className="text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/5 font-mono text-xs uppercase tracking-wider text-neutral-300 font-bold">
              <Layers className="size-3.5 text-[#FF5500]" />
              Comparativo Claro
            </span>
            <h2 className="text-3xl sm:text-5xl font-heading font-black tracking-tight text-white uppercase leading-tight">
              Kriativa ou várias ferramentas separadas?
            </h2>
            <p className="text-sm font-sans text-neutral-400">
              Veja a diferença prática entre ter que gerenciar múltiplas assinaturas ou concentrar tudo no mesmo estúdio.
            </p>
          </div>

          {/* Cards Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            
            {/* Várias Plataformas */}
            <div className="rounded-3xl border border-red-500/20 bg-red-500/[0.02] p-6 sm:p-8 space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-red-500/10">
                <span className="text-red-400 font-mono text-xs font-bold uppercase tracking-wider">
                  Várias plataformas
                </span>
              </div>
              <ul className="space-y-3.5 text-xs sm:text-sm text-neutral-300 font-sans">
                {separateTools.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <div className="size-5 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center shrink-0">
                      <X className="size-3.5 stroke-[3]" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Kriativa */}
            <div className="rounded-3xl border-2 border-[#FF5500] bg-gradient-to-b from-[#141210] to-[#0A0B0E] p-6 sm:p-8 space-y-5 shadow-[0_0_40px_rgba(255,85,0,0.15)] relative">
              <div className="flex items-center justify-between pb-3 border-b border-[#FF5500]/20">
                <span className="text-[#FF5500] font-mono text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-[#FF5500] animate-pulse" />
                  Kriativa
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Tudo Integrado
                </span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-neutral-200 font-sans">
                {kriativaFeatures.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <div className="size-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Check className="size-3.5 stroke-[3]" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Footer Callout */}
          <div className="pt-6 border-t border-white/10 text-center space-y-2">
            <h3 className="text-xl sm:text-2xl font-heading font-black text-white uppercase">
              Menos ferramentas. Mais criação.
            </h3>
            <p className="text-xs text-neutral-400 font-mono">
              Economize tempo, simplifique seu fluxo de trabalho e reduza seus custos mensais.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
