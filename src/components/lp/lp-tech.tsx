"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Cpu, Layers, Sparkles, Wand2, Compass } from "lucide-react";

export function LpTech() {
  return (
    <section className="container mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-16">
      <div className="rounded-3xl border border-white/10 bg-[#08090C] p-6 sm:p-12 text-center space-y-6 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider">
          <Layers className="size-3.5 text-[#FF5500]" />
          Tecnologias
        </div>

        <h2 className="text-2xl sm:text-4xl font-heading font-black tracking-tight text-white uppercase leading-tight max-w-2xl mx-auto">
          Diferentes tecnologias. Uma experiência integrada.
        </h2>

        <div className="space-y-4 max-w-3xl mx-auto text-xs sm:text-sm text-neutral-300 font-sans leading-relaxed">
          <p>
            A Kriativa combina modelos especializados em diferentes tarefas para oferecer ferramentas de criação de imagens, vídeos, áudio e texto.
          </p>
          <p className="text-neutral-400">
            Cada modelo tem suas próprias características, capacidades e requisitos. Por isso, a plataforma pode disponibilizar alternativas diferentes conforme o tipo de criação e as condições de uso.
          </p>
          <p>
            Você não precisa conhecer os detalhes técnicos para começar: escolha o que deseja produzir e explore as ferramentas disponíveis.
          </p>
        </div>

        <div className="pt-4 border-t border-white/10">
          <div className="font-heading font-black text-sm sm:text-lg text-white uppercase tracking-wider">
            Mais foco no resultado.{" "}
            <span className="text-[#FF5500]">Menos complexidade técnica.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
