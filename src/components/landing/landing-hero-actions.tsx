"use client";

import React from "react";
import Link from "next/link";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { SignUpButton } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";

export function LandingHeroActions() {
  return (
    <div className="flex flex-col items-center gap-3.5 w-full">
      <AuthLoading>
        <div className="flex justify-center">
          <Skeleton className="h-14 w-56 rounded-2xl" />
        </div>
      </AuthLoading>

      <Unauthenticated>
        <div className="flex flex-col items-center gap-3 w-full max-w-sm sm:max-w-none">
          <SignUpButton mode="modal" fallbackRedirectUrl="/onboarding" signInFallbackRedirectUrl="/dashboard">
            <button
              type="button"
              className="w-full sm:w-auto min-h-[50px] px-8 py-4 sm:px-10 sm:py-4.5 rounded-2xl font-heading font-black text-sm sm:text-base uppercase tracking-wider bg-gradient-to-r from-[#FF5500] via-[#FF6600] to-[#FF7700] hover:from-[#ff6600] hover:to-[#ff8800] text-white transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-[0_0_40px_rgba(255,85,0,0.5)] active:scale-[0.98]"
            >
              <Sparkles className="size-4 fill-white" />
              <span>COMEÇAR GRÁTIS</span>
              <ArrowRight className="size-4" />
            </button>
          </SignUpButton>

          <span className="text-xs sm:text-sm text-neutral-400 font-sans">
            Cadastro gratuito. Sem cartão de crédito.
          </span>

          <div className="pt-2 flex items-center gap-3 text-xs text-neutral-400 font-mono">
            <a href="#planos" className="hover:text-white underline underline-offset-4 transition-colors">
              Ou conheça os planos (a partir de R$ 5 ou R$ 200/mês) →
            </a>
          </div>
        </div>
      </Unauthenticated>

      <Authenticated>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-lg mx-auto">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-heading font-black text-sm uppercase tracking-wider bg-[#FF5500] hover:bg-[#ff681a] text-white transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,85,0,0.45)] active:scale-[0.98]"
          >
            <Sparkles className="size-4 fill-white" />
            <span>ACESSAR PLATAFORMA</span>
            <ArrowRight className="size-4" />
          </Link>

          <Link
            href="/dashboard/credits"
            className="w-full sm:w-auto px-6 py-4 rounded-2xl font-heading font-bold text-sm uppercase tracking-wider bg-white/10 hover:bg-white/15 text-white border border-white/15 transition-all flex items-center justify-center gap-2"
          >
            <span>Ver Meus Créditos</span>
          </Link>
        </div>
      </Authenticated>
    </div>
  );
}
