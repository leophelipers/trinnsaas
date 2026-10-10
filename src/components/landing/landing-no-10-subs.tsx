"use client";

import React from "react";
import { Authenticated, Unauthenticated } from "convex/react";
import { SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowRight, Layers, Sparkles, CheckCircle2, Split } from "lucide-react";

export function LandingNo10Subs() {
  return (
    <section className="container mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-20 relative">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#0C0D12] via-[#090A0E] to-[#060608] p-6 sm:p-14 relative overflow-hidden shadow-2xl">
        {/* Glow */}
        <div className="absolute top-0 right-1/3 w-96 h-48 bg-[#FF5500]/10 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Eyebrow & Headline */}
          <div className="text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/5 font-mono text-xs uppercase tracking-wider text-neutral-300 font-bold">
              <Split className="size-3.5 text-[#FF5500]" />
              Fim da Fragmentação
            </span>
            <h2 className="text-3xl sm:text-5xl font-heading font-black tracking-tight text-white uppercase leading-tight">
              Por que assinar 5 ferramentas diferentes?
            </h2>
          </div>

          {/* Friction Steps Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch pt-2">
            
            {/* The Old Way */}
            <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.02] p-6 space-y-4">
              <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                <span className="size-2 rounded-full bg-red-500" />
                Como você cria hoje (Caos & Custos)
              </span>
              <ul className="space-y-3 text-xs sm:text-sm text-neutral-400 font-sans">
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold">→</span>
                  <span>Você quer criar uma imagem. <strong>Abre uma plataforma.</strong></span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold">→</span>
                  <span>Quer transformar em vídeo. <strong>Abre outra.</strong></span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold">→</span>
                  <span>Precisa de uma voz. <strong>Outra assinatura.</strong></span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold">→</span>
                  <span>Quer escrever o roteiro. <strong>Mais uma ferramenta.</strong></span>
                </li>
              </ul>
              <div className="pt-2 text-xs font-mono text-red-400/80 border-t border-red-500/10">
                Resultado: 5 contas diferentes, 5 cobranças em dólar e créditos sobrando ou faltando.
              </div>
            </div>

            {/* The Kriativa Way */}
            <div className="rounded-2xl border-2 border-[#FF5500]/50 bg-gradient-to-b from-[#FF5500]/10 to-transparent p-6 space-y-4 flex flex-col justify-between shadow-[0_0_30px_rgba(255,85,0,0.15)]">
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold text-[#FF5500] uppercase tracking-wider flex items-center gap-2">
                  <span className="size-2 rounded-full bg-[#FF5500] animate-pulse" />
                  Com a Kriativa
                </span>
                <p className="text-base sm:text-lg font-heading font-bold text-white">
                  A Kriativa coloca tudo isso em um só lugar.
                </p>
                <div className="space-y-2 pt-1 text-sm font-sans text-neutral-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                    <span><strong>Uma conta.</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                    <span><strong>Uma plataforma.</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                    <span><strong>Várias possibilidades.</strong></span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-white/10">
                <Unauthenticated>
                  <SignUpButton mode="modal" fallbackRedirectUrl="/onboarding" signInFallbackRedirectUrl="/dashboard">
                    <button
                      type="button"
                      className="w-full py-3.5 px-6 rounded-xl font-heading font-black text-xs uppercase tracking-wider bg-[#FF5500] hover:bg-[#ff681a] text-white transition-all flex items-center justify-center gap-2 group cursor-pointer shadow-[0_0_20px_rgba(255,85,0,0.4)] active:scale-[0.98]"
                    >
                      <span>EXPERIMENTAR GRÁTIS</span>
                      <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </SignUpButton>
                </Unauthenticated>

                <Authenticated>
                  <Link
                    href="/dashboard"
                    className="w-full py-3.5 px-6 rounded-xl font-heading font-black text-xs uppercase tracking-wider bg-[#FF5500] hover:bg-[#ff681a] text-white transition-all flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(255,85,0,0.4)] active:scale-[0.98]"
                  >
                    <span>ACESSAR PLATAFORMA</span>
                    <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Authenticated>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
