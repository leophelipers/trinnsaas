"use client";

import React from "react";
import { Authenticated, Unauthenticated } from "convex/react";
import { SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import { CheckCircle2, ArrowRight, ShieldCheck, Sparkles, Flame, Infinity as InfinityIcon, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function LandingPlans() {
  return (
    <section id="planos" className="container mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-20 relative">
      <div id="ofertas" className="absolute -top-24 pointer-events-none" />
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[radial-gradient(ellipse_at_center,rgba(255,85,0,0.1),transparent_70%)] pointer-events-none" />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider">
          <Sparkles className="size-3.5 text-[#FF5500]" />
          Preços Simples & Transparentes
        </div>
        <h2 className="text-3xl sm:text-5xl font-heading font-black tracking-tight text-white uppercase leading-tight">
          Escolha como você quer criar.
        </h2>
        <p className="text-sm sm:text-base text-neutral-300 max-w-xl mx-auto leading-relaxed font-sans">
          Pague apenas pelo que utilizar ou assine o plano ilimitado para criar à vontade.
        </p>
      </div>

      {/* The 2 Core Offers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
        
        {/* ======================================================== */}
        {/* CARD 1: CRÉDITOS A PARTIR DE R$ 5 (🟦 CRÉDITOS) */}
        {/* ======================================================== */}
        <div className="rounded-3xl border border-white/10 bg-[#0C0D12] p-6 sm:p-9 flex flex-col justify-between hover:border-white/20 transition-all shadow-xl">
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
              <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5 font-mono text-[11px] font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-blue-400" />
                🟦 Créditos sob Demanda
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                Sem Mensalidade
              </span>
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-mono text-neutral-400 uppercase">A partir de</span>
                <span className="text-4xl sm:text-5xl font-heading font-black text-white tracking-tight">
                  R$ 5,00
                </span>
              </div>
              <div className="mt-2 inline-flex flex-wrap items-center gap-1.5 sm:gap-2 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono font-bold text-emerald-400">
                <span>⚡ 70 créditos totais para novos usuários</span>
                <span className="text-[10px] text-neutral-400 font-normal">(20 comprados + 50 grátis)</span>
              </div>
              <p className="mt-2 text-xs sm:text-sm text-neutral-400 font-sans">
                Para quem quer pagar conforme usa.
              </p>
            </div>

            <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-300 font-sans border-t border-white/5 pt-4">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                <span>Compra quando quiser</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                <span>Créditos não expiram</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                <span>Escolha quanto comprar</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                <span>Sem mensalidade</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                <span>Acesso aos recursos disponíveis (Imagem, Vídeo, Áudio, Texto)</span>
              </li>
            </ul>
          </div>

          <div className="pt-8 space-y-3">
            <Unauthenticated>
              <SignUpButton mode="modal" fallbackRedirectUrl="/onboarding" signInFallbackRedirectUrl="/dashboard">
                <button
                  type="button"
                  className="w-full py-4 px-6 rounded-2xl font-heading font-black text-xs uppercase tracking-wider bg-white/10 hover:bg-white/15 text-white border border-white/15 transition-all flex items-center justify-center gap-2 group cursor-pointer shadow-lg active:scale-[0.98]"
                >
                  <span>COMEÇAR GRÁTIS</span>
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </SignUpButton>
              <p className="text-[11px] text-center text-neutral-400 font-mono">
                Você poderá comprar créditos depois de criar sua conta.
              </p>
            </Unauthenticated>

            <Authenticated>
              <Link
                href="/dashboard/credits"
                className="w-full py-4 px-6 rounded-2xl font-heading font-black text-xs uppercase tracking-wider bg-white/10 hover:bg-white/15 text-white border border-white/15 transition-all flex items-center justify-center gap-2 group shadow-lg active:scale-[0.98]"
              >
                <span>RECARREGAR CRÉDITOS (A PARTIR DE R$ 5)</span>
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Authenticated>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CARD 2: KRIATIVA ILIMITADA - R$ 200/MÊS (🟩 KRIATIVA ILIMITADA) */}
        {/* ======================================================== */}
        <div className="rounded-3xl border-2 border-[#FF5500] bg-gradient-to-b from-[#141210] via-[#0D0E14] to-[#0A0B0E] p-6 sm:p-9 flex flex-col justify-between shadow-[0_0_50px_rgba(255,85,0,0.25)] hover:shadow-[0_0_70px_rgba(255,85,0,0.35)] transition-all relative overflow-hidden">
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
              <span className="px-3 py-1 rounded-full border border-[#FF5500]/40 bg-[#FF5500]/15 font-mono text-[11px] font-bold text-[#FF5500] uppercase tracking-wider flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                🟩 Kriativa Ilimitada
              </span>
              <span className="text-xs font-mono text-amber-400 font-bold">
                Melhor Custo-Benefício
              </span>
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-heading font-black text-white tracking-tight">
                  R$ 200
                </span>
                <span className="text-xs font-mono text-neutral-300 font-medium">/ mês</span>
              </div>
              <p className="mt-2 text-xs sm:text-sm text-neutral-300 font-sans">
                Crie sem ficar contando créditos.
              </p>
            </div>

            <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-200 font-sans border-t border-white/10 pt-4">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                <span><strong>Imagens</strong></span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                <span><strong>Vídeos</strong></span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                <span><strong>Áudios</strong></span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                <span><strong>Textos</strong></span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                <span>Acesso aos modelos incluídos</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                <span>Uso contínuo dentro dos limites da plataforma</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                <span>Cancele quando quiser</span>
              </li>
            </ul>
          </div>

          <div className="pt-8 space-y-3">
            <Unauthenticated>
              <SignUpButton mode="modal" fallbackRedirectUrl="/onboarding" signInFallbackRedirectUrl="/dashboard">
                <button
                  type="button"
                  className="w-full py-4 px-6 rounded-2xl font-heading font-black text-xs uppercase tracking-wider bg-gradient-to-r from-[#FF5500] via-[#FF6600] to-[#FF7700] hover:from-[#ff6600] hover:to-[#ff8800] text-white transition-all flex items-center justify-center gap-2 group cursor-pointer shadow-[0_0_35px_rgba(255,85,0,0.5)] active:scale-[0.98]"
                >
                  <span>COMEÇAR GRÁTIS</span>
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </SignUpButton>
              <p className="text-[11px] text-center text-neutral-400 font-mono">
                Crie sua conta gratuitamente e conheça a plataforma antes de assinar.
              </p>
            </Unauthenticated>

            <Authenticated>
              <Link
                href="/dashboard/credits?plan=unlimited"
                className="w-full py-4 px-6 rounded-2xl font-heading font-black text-xs uppercase tracking-wider bg-gradient-to-r from-[#FF5500] via-[#FF6600] to-[#FF7700] hover:from-[#ff6600] hover:to-[#ff8800] text-white transition-all flex items-center justify-center gap-2 group shadow-[0_0_35px_rgba(255,85,0,0.5)] active:scale-[0.98]"
              >
                <span>ATIVAR KRIATIVA ILIMITADA (R$ 200/MÊS)</span>
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Authenticated>
          </div>
        </div>

      </div>

      {/* Seção 9 do copy.md: A Parte do Ilimitado */}
      <div className="mt-12 max-w-4xl mx-auto rounded-3xl border border-white/10 bg-[#0C0D12] p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#FF5500] uppercase tracking-wider">
          <HelpCircle className="size-4" />
          <span>E se um modelo atingir o limite?</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-heading font-black text-white uppercase">
          Você não fica parado.
        </h3>
        <p className="text-xs sm:text-sm text-neutral-300 font-sans leading-relaxed">
          A Kriativa trabalha com diferentes modelos. Por isso, quando um modelo atingir seu limite de utilização, a plataforma poderá direcionar sua solicitação para uma alternativa disponível.
        </p>
        <p className="text-xs sm:text-sm font-bold text-white font-sans">
          Você continua criando.
        </p>
      </div>
    </section>
  );
}
