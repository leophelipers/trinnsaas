"use client";

import React from "react";
import { LpCtaButton } from "./lp-cta-button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Check, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";

export function LpPricing() {
  return (
    <section id="precos" className="container mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-20 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] max-w-full h-[350px] bg-[#FF5500]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 space-y-3 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider">
          <Sparkles className="size-3.5 text-[#FF5500]" />
          Preços Simples
        </div>

        <h2 className="text-2xl sm:text-4xl md:text-5xl font-heading font-black tracking-tight text-white uppercase leading-tight">
          Comece grátis. Escolha como continuar.
        </h2>

        <p className="text-sm sm:text-base text-neutral-300 font-sans leading-relaxed max-w-2xl mx-auto">
          Crie sua conta gratuitamente e conheça a plataforma. Quando quiser ampliar seu uso, escolha a opção mais adequada às suas necessidades.
        </p>
      </div>

      {/* Two Pricing Cards from copy2.md */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch relative z-10">
        {/* Card 1: CRÉDITOS */}
        <div className="rounded-3xl border border-sky-500/30 bg-gradient-to-b from-sky-950/20 via-[#0A0D14] to-[#06080C] p-6 sm:p-10 space-y-6 flex flex-col justify-between shadow-xl hover:border-sky-500/50 transition-all">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="border-sky-500/40 text-sky-400 bg-sky-500/10 text-xs font-mono font-bold">
                🟦 CRÉDITOS
              </Badge>
              <span className="text-xs font-mono text-neutral-400">
                Pague conforme usa
              </span>
            </div>

            <div>
              <span className="text-xs font-mono text-sky-400 uppercase tracking-wider block font-bold">
                A partir de
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl sm:text-5xl font-heading font-black text-white">
                  R$ 5
                </span>
              </div>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300 font-mono text-xs font-bold">
                <span>70 créditos por R$ 5</span>
              </div>
            </div>

            <p className="text-sm text-neutral-300 font-sans leading-relaxed">
              Para quem prefere comprar créditos conforme a necessidade.
            </p>

            <ul className="space-y-3 pt-4 border-t border-white/10 text-sm text-neutral-200">
              <li className="flex items-start gap-2.5">
                <Check className="size-4 text-sky-400 shrink-0 mt-0.5" />
                <span>Comece com um pacote acessível</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="size-4 text-sky-400 shrink-0 mt-0.5" />
                <span>Compre mais quando precisar</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="size-4 text-sky-400 shrink-0 mt-0.5" />
                <span><strong>Os créditos comprados não expiram</strong></span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="size-4 text-sky-400 shrink-0 mt-0.5" />
                <span>O consumo varia conforme a ferramenta e o tipo de geração</span>
              </li>
            </ul>
          </div>

          <div className="pt-6 border-t border-white/10 space-y-2">
            <LpCtaButton label="COMEÇAR GRÁTIS →" size="default" className="w-full" />
            <p className="text-[11px] text-center text-neutral-400 font-sans italic">
              O cadastro é gratuito. A compra de créditos é opcional.
            </p>
          </div>
        </div>

        {/* Card 2: PLANO MENSAL */}
        <div className="rounded-3xl border-2 border-emerald-500/60 bg-gradient-to-b from-emerald-950/25 via-[#0A140F] to-[#060C08] p-6 sm:p-10 space-y-6 flex flex-col justify-between shadow-[0_0_50px_rgba(16,185,129,0.2)] relative">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-heading font-black text-[11px] uppercase tracking-wider shadow-lg">
            CRIAÇÃO REGULAR
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 text-xs font-mono font-bold">
                🟩 PLANO MENSAL
              </Badge>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                Recorrente
              </span>
            </div>

            <div>
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider block font-bold">
                Assinatura Completa
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl sm:text-5xl font-heading font-black text-white">
                  R$ 200
                </span>
                <span className="text-sm font-mono text-neutral-400">/mês</span>
              </div>
            </div>

            <p className="text-sm text-neutral-200 font-sans leading-relaxed">
              Para quem deseja utilizar regularmente as ferramentas incluídas no plano.
            </p>

            <ul className="space-y-3 pt-4 border-t border-white/10 text-sm text-neutral-200">
              <li className="flex items-start gap-2.5">
                <Check className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Acesso aos recursos elegíveis à assinatura</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Uso recorrente conforme as condições do plano</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Limites específicos podem variar conforme o modelo</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Quando aplicável, ao atingir o limite de um modelo, a plataforma pode oferecer uma alternativa disponível</span>
              </li>
            </ul>
          </div>

          <div className="pt-6 border-t border-white/10 space-y-2">
            <LpCtaButton label="COMEÇAR GRÁTIS →" size="default" variant="secondary" className="w-full" />
            <p className="text-[10px] text-center text-neutral-400 font-sans leading-snug">
              O uso está sujeito às políticas de uso justo, aos limites técnicos, à disponibilidade e às condições de cada ferramenta. Consulte os detalhes do plano antes de assinar.
            </p>
          </div>
        </div>
      </div>

      {/* "Não sabe qual opção escolher?" Box from copy2.md */}
      <div className="mt-12 rounded-3xl border border-white/10 bg-[#0C0D12] p-8 text-center space-y-4 max-w-3xl mx-auto relative z-10">
        <h3 className="font-heading font-black text-xl sm:text-2xl text-white uppercase tracking-tight">
          Não sabe qual opção escolher?
        </h3>
        <p className="text-xs sm:text-sm text-neutral-300 font-sans max-w-xl mx-auto leading-relaxed">
          Comece gratuitamente. Conheça a plataforma e escolha a forma de pagamento quando fizer sentido para você.
        </p>
        <div className="pt-2 flex justify-center">
          <LpCtaButton label="COMEÇAR GRÁTIS →" size="default" />
        </div>
      </div>
    </section>
  );
}
