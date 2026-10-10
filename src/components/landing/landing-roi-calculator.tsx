"use client";

import React, { useState } from "react";
import { Calculator, Sparkles, ArrowRight, TrendingUp } from "lucide-react";

export function LandingRoiCalculator() {
  const [videoCount, setVideoCount] = useState<number>(20);

  // Cálculos comparativos de mercado
  const traditionalCost = videoCount * 650; // Média R$ 650 por tomada em set real (câmera, equipe, iluminação)
  const gringoAiCost = videoCount > 30 ? 1200 : 650; // Runway/Pika planos pro em USD convertidos + IOF
  const kriativaCost = videoCount <= 5 ? 25 : 200; // No Kriativa, até 5 takes é R$ 25 no flexível ou R$ 200 fixo ilimitado!
  const savings = Math.max(0, traditionalCost - kriativaCost);
  const savingsPct = Math.round((savings / traditionalCost) * 100);

  return (
    <section className="container mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-20">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#0E1017] to-[#07080B] p-6 sm:p-12 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FF5500]/10 blur-3xl pointer-events-none" />

        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-mono font-semibold text-neutral-300 uppercase tracking-wider">
            <Calculator className="size-3.5 text-emerald-400" />
            Calculadora de Economia Real
          </div>
          <h2 className="text-2xl sm:text-4xl font-heading font-black tracking-tight text-white uppercase leading-tight">
            Veja Quanto Você Economiza por Mês
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 font-sans max-w-2xl mx-auto leading-relaxed">
            Seja para criar reels verticais, comerciais ou cenas cinematográficas completas, compare os custos reais de produção.
          </p>
        </div>

        {/* Interactive Selector */}
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs sm:text-sm font-mono text-neutral-300">
              <span>Quantos takes / vídeos você planeja gerar por mês?</span>
              <span className="font-heading font-bold text-lg sm:text-xl text-[#FF5500]">
                {videoCount} vídeos
              </span>
            </div>
            
            <input
              type="range"
              min="2"
              max="100"
              step="1"
              value={videoCount}
              onChange={(e) => setVideoCount(Number(e.target.value))}
              className="w-full h-2.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#FF5500]"
            />

            <div className="flex justify-between text-[11px] font-mono text-neutral-400">
              <span>2 (Testes pontuais)</span>
              <span>20 (Criador ativo)</span>
              <span>50 (Canal do YouTube)</span>
              <span>100+ (Agência/Produtora)</span>
            </div>
          </div>

          {/* Result Cards Comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            
            {/* Set Tradicional */}
            <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] space-y-2 text-center">
              <span className="text-[11px] font-mono text-neutral-400 uppercase">
                Produção Tradicional
              </span>
              <div className="text-xl sm:text-2xl font-heading font-black text-neutral-400">
                R$ {traditionalCost.toLocaleString("pt-BR")}
              </div>
              <p className="text-[11px] text-neutral-400">
                Locação, equipe, estúdio e diárias
              </p>
            </div>

            {/* IAs Gringas em Dólar */}
            <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] space-y-2 text-center">
              <span className="text-[11px] font-mono text-neutral-400 uppercase">
                IAs Gringas em Dólar
              </span>
              <div className="text-xl sm:text-2xl font-heading font-black text-amber-400/90">
                R$ {gringoAiCost.toLocaleString("pt-BR")}
              </div>
              <p className="text-[11px] text-neutral-400">
                Assinatura USD + IOF e limites
              </p>
            </div>

            {/* No Kriativa */}
            <div className="p-5 rounded-2xl border-2 border-[#FF5500] bg-[#FF5500]/10 space-y-2 text-center relative shadow-[0_0_25px_rgba(255,85,0,0.2)]">
              <span className="text-[11px] font-mono text-[#FF5500] font-black uppercase">
                No Kriativa.app
              </span>
              <div className="text-2xl sm:text-3xl font-heading font-black text-white">
                R$ {kriativaCost.toLocaleString("pt-BR")}
              </div>
              <p className="text-[11px] text-emerald-300 font-semibold font-mono">
                {videoCount <= 5 ? "Créditos avulsos flexíveis" : "Plano Ilimitado Pro (Fixo)"}
              </p>
            </div>

          </div>

          {/* Economy Highlight Banner */}
          <div className="p-4 sm:p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                <TrendingUp className="size-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-heading font-bold text-white">
                  Sua economia estimada: <span className="text-emerald-400">R$ {savings.toLocaleString("pt-BR")} / mês</span> ({savingsPct}%)
                </p>
                <p className="text-[11px] text-neutral-300">
                  Produza com qualidade de cinema sem comprometer seu fluxo de caixa.
                </p>
              </div>
            </div>

            <a
              href="#ofertas"
              className="px-5 py-2.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider bg-[#FF5500] hover:bg-[#ff6600] text-white transition-all shadow-[0_0_15px_rgba(255,85,0,0.4)] whitespace-nowrap"
            >
              Começar Agora
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
