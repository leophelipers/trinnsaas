"use client";

import React from "react";
import { Authenticated, Unauthenticated } from "convex/react";
import { SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import { Globe, Heart, ArrowRight, Sparkles, Code2, Users2 } from "lucide-react";

export function LandingOpenSourceManifesto() {
  return (
    <section id="sobre" className="container mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-20 relative">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#0C0D12] via-[#090A0E] to-[#050608] p-6 sm:p-14 relative overflow-hidden shadow-2xl">
        {/* Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FF5500]/10 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* Seção 11: Open Source */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-b border-white/10 pb-12">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/5 font-mono text-xs uppercase tracking-wider text-neutral-300 font-bold">
                <Code2 className="size-3.5 text-cyan-400" />
                Tecnologia Aberta
              </span>
              <h2 className="text-2xl sm:text-4xl font-heading font-black tracking-tight text-white uppercase leading-tight">
                Tecnologia aberta. Plataforma brasileira.
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 font-sans leading-relaxed">
                A Kriativa utiliza modelos open source e tecnologias desenvolvidas pela comunidade global de inteligência artificial. Isso permite experimentar novas tecnologias e evoluir rapidamente.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] space-y-3">
              <p className="text-xs sm:text-sm text-neutral-400 font-sans leading-relaxed">
                E você não precisa acompanhar nada disso.
              </p>
              <div className="space-y-1 text-base sm:text-lg font-heading font-bold text-white">
                <p className="text-[#FF5500]">Nós cuidamos da tecnologia.</p>
                <p className="text-emerald-400">Você cuida da criação.</p>
              </div>
            </div>
          </div>

          {/* Seção 12: O Diferencial Brasileiro / Manifesto */}
          <div className="space-y-6 text-center max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 font-mono text-xs uppercase tracking-wider text-emerald-400 font-bold">
              <Globe className="size-3.5" />
              Construído no Brasil
            </span>

            <h3 className="text-3xl sm:text-5xl font-heading font-black tracking-tight text-white uppercase leading-tight">
              Estamos construindo uma IA brasileira.
            </h3>

            <div className="space-y-3 text-xs sm:text-sm text-neutral-300 font-sans leading-relaxed">
              <p>A Kriativa está começando agora. E isso significa que você não é apenas mais um número.</p>
              <p className="font-bold text-white">Seu feedback pode mudar o produto:</p>
              <div className="flex flex-wrap justify-center gap-2 pt-1 font-mono text-xs text-[#FF5500]">
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">Os modelos que você quer</span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">As ferramentas que você precisa</span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">Os recursos que deveriam existir</span>
              </div>
              <p className="pt-2">Queremos construir a Kriativa junto com quem realmente usa.</p>
              <p className="text-lg font-heading font-bold text-white uppercase">
                Entre desde o começo.
              </p>
            </div>

            <div className="pt-4 flex justify-center w-full max-w-sm sm:max-w-none mx-auto">
              <Unauthenticated>
                <SignUpButton mode="modal">
                  <button
                    type="button"
                    className="w-full sm:w-auto min-h-[48px] px-8 py-4 rounded-2xl font-heading font-black text-xs uppercase tracking-wider bg-[#FF5500] hover:bg-[#ff681a] text-white transition-all flex items-center justify-center gap-2 group cursor-pointer shadow-[0_0_30px_rgba(255,85,0,0.45)] active:scale-[0.98]"
                  >
                    <span>COMEÇAR GRÁTIS</span>
                    <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </SignUpButton>
              </Unauthenticated>

              <Authenticated>
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto min-h-[48px] px-8 py-4 rounded-2xl font-heading font-black text-xs uppercase tracking-wider bg-[#FF5500] hover:bg-[#ff681a] text-white transition-all flex items-center justify-center gap-2 group shadow-[0_0_30px_rgba(255,85,0,0.45)] active:scale-[0.98]"
                >
                  <span>ACESSAR PLATAFORMA</span>
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Authenticated>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
