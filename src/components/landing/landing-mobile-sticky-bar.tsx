"use client";

import React, { useState, useEffect } from "react";
import { Authenticated, Unauthenticated } from "convex/react";
import { SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export function LandingMobileStickyBar() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Aparece após rolar 350px (após o hero inicial)
      if (window.scrollY > 350) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-[#050506]/95 backdrop-blur-xl border-t border-white/10 md:hidden animate-in slide-in-from-bottom-5 duration-300"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0.75rem))" }}
    >
      <div className="flex items-center justify-between gap-2.5 max-w-md mx-auto">
        <div className="flex flex-col min-w-0">
          <span className="text-[11px] font-mono text-white font-bold leading-tight flex items-center gap-1 truncate">
            <span className="size-1.5 rounded-full bg-[#FF5500] animate-pulse shrink-0" />
            <span>Todas as IAs em um só lugar</span>
          </span>
          <span className="text-[10px] text-neutral-400 font-sans leading-tight truncate">
            Cadastro gratuito • Sem cartão
          </span>
        </div>

        <div className="shrink-0">
          <Unauthenticated>
            <SignUpButton mode="modal">
              <button
                type="button"
                className="px-4 py-2.5 min-h-[44px] rounded-xl font-heading font-black text-xs uppercase tracking-wider bg-[#FF5500] hover:bg-[#ff6600] text-white transition-all shadow-[0_0_20px_rgba(255,85,0,0.5)] active:scale-95 flex items-center gap-1 cursor-pointer"
              >
                <span>COMEÇAR GRÁTIS</span>
                <ArrowRight className="size-3.5" />
              </button>
            </SignUpButton>
          </Unauthenticated>

          <Authenticated>
            <Link
              href="/dashboard"
              className="px-4 py-2.5 min-h-[44px] rounded-xl font-heading font-black text-xs uppercase tracking-wider bg-[#FF5500] hover:bg-[#ff6600] text-white transition-all shadow-[0_0_20px_rgba(255,85,0,0.5)] active:scale-95 flex items-center gap-1"
            >
              <span>ACESSAR</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </Authenticated>
        </div>
      </div>
    </div>
  );
}
