"use client";

import React from "react";
import { Authenticated, Unauthenticated } from "convex/react";
import { SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export function LandingStartFree() {
  return (
    <section className="container mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-20 relative">
      <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-[#0A120E] via-[#070B09] to-[#040605] p-6 sm:p-14 text-center relative overflow-hidden shadow-2xl">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-emerald-500/15 blur-3xl pointer-events-none" />

        <div className="max-w-2xl mx-auto space-y-6 relative z-10">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
            <Sparkles className="size-3.5 fill-emerald-400" />
            Zero Fricção de Entrada
          </div>

          <h2 className="text-3xl sm:text-5xl font-heading font-black tracking-tight text-white uppercase leading-tight">
            Você não precisa comprar nada para começar.
          </h2>

          <div className="space-y-2 text-sm sm:text-base text-neutral-300 font-sans leading-relaxed">
            <p>Crie sua conta gratuitamente.</p>
            <p>Conheça a plataforma.</p>
            <p>Veja os recursos disponíveis.</p>
            <p className="font-bold text-white">E só depois escolha como quer usar.</p>
            <p className="text-[#FF5500] font-heading font-black text-lg pt-2 uppercase">
              Começar não custa nada.
            </p>
          </div>

          <div className="pt-4 flex flex-col items-center justify-center gap-3">
            <Unauthenticated>
              <SignUpButton mode="modal" fallbackRedirectUrl="/onboarding" signInFallbackRedirectUrl="/dashboard">
                <button
                  type="button"
                  className="w-full sm:w-auto min-h-[48px] px-8 py-4 rounded-2xl font-heading font-black text-sm uppercase tracking-wider bg-emerald-500 hover:bg-emerald-600 text-black transition-all flex items-center justify-center gap-2 group cursor-pointer shadow-[0_0_35px_rgba(16,185,129,0.35)] active:scale-[0.98]"
                >
                  <span>CRIAR MINHA CONTA GRÁTIS</span>
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </SignUpButton>
              <span className="text-xs text-neutral-400 font-mono">
                Sem cartão de crédito.
              </span>
            </Unauthenticated>

            <Authenticated>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto min-h-[48px] px-8 py-4 rounded-2xl font-heading font-black text-sm uppercase tracking-wider bg-emerald-500 hover:bg-emerald-600 text-black transition-all flex items-center justify-center gap-2 group shadow-[0_0_35px_rgba(16,185,129,0.35)] active:scale-[0.98]"
              >
                <span>ACESSAR MINHA CONTA</span>
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Authenticated>
          </div>

        </div>
      </div>
    </section>
  );
}
