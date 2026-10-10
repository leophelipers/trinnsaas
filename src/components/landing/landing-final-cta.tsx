"use client";

import React from "react";
import { Authenticated, Unauthenticated } from "convex/react";
import { SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

export function LandingFinalCta() {
  return (
    <section className="container mx-auto max-w-7xl px-4 sm:px-6 pb-12 sm:pb-20">
      <div className="rounded-3xl border border-[#FF5500]/40 bg-gradient-to-b from-[#12100E] via-[#08090C] to-black p-6 sm:p-14 text-center relative overflow-hidden shadow-2xl">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-44 bg-[#FF5500]/20 blur-3xl pointer-events-none" />

        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-black tracking-tight text-white uppercase leading-tight">
              Pare de procurar qual IA usar.
            </h2>
            <p className="text-2xl sm:text-4xl lg:text-5xl font-heading font-black bg-gradient-to-r from-white via-[#FF5500] to-[#FF8800] bg-clip-text text-transparent uppercase">
              Comece a criar.
            </p>
          </div>

          <p className="text-sm sm:text-lg text-neutral-300 font-sans max-w-xl mx-auto leading-relaxed">
            Imagens. Vídeos. Áudios. Textos. Tudo em um só lugar.
          </p>

          <div className="pt-4 flex flex-col items-center justify-center gap-3">
            <Unauthenticated>
              <SignUpButton mode="modal" fallbackRedirectUrl="/onboarding" signInFallbackRedirectUrl="/dashboard">
                <button
                  type="button"
                  className="w-full sm:w-auto min-h-[48px] px-8 sm:px-9 py-4 rounded-2xl font-heading font-black text-sm uppercase tracking-wider bg-gradient-to-r from-[#FF5500] via-[#FF6600] to-[#FF7700] hover:from-[#ff6600] hover:to-[#ff8800] text-white transition-all flex items-center justify-center gap-2 group cursor-pointer shadow-[0_0_35px_rgba(255,85,0,0.5)] active:scale-[0.98]"
                >
                  <Sparkles className="size-4 fill-white" />
                  <span>COMEÇAR GRÁTIS</span>
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </SignUpButton>
              <span className="text-xs text-neutral-400 font-mono">
                Cadastro gratuito · Sem cartão de crédito
              </span>
            </Unauthenticated>

            <Authenticated>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto min-h-[48px] px-8 sm:px-9 py-4 rounded-2xl font-heading font-black text-sm uppercase tracking-wider bg-[#FF5500] hover:bg-[#ff681a] text-white transition-all flex items-center justify-center gap-2 group shadow-[0_0_35px_rgba(255,85,0,0.45)] active:scale-[0.98]"
              >
                <Sparkles className="size-4 fill-white" />
                <span>ACESSAR PLATAFORMA</span>
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Authenticated>
          </div>
        </div>
      </div>
    </section>
  );
}
