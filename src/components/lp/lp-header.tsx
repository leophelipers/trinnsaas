"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LpCtaButton } from "./lp-cta-button";
import { Menu, X, Sparkles } from "lucide-react";

export function LpHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#050506]/95 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/lp" className="flex items-center gap-2.5 group">
            <div className="size-9 rounded-xl bg-gradient-to-br from-[#FF5500] via-[#FF4500] to-[#CC3700] text-white flex items-center justify-center font-heading font-black text-sm shadow-[0_0_20px_rgba(255,85,0,0.4)] border border-white/20 group-hover:scale-105 transition-transform">
              K
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline">
                <span className="font-heading font-extrabold text-lg tracking-tight text-white uppercase">
                  kriativa
                </span>
                <span className="font-mono text-xs text-[#FF5500] font-bold">
                  .app
                </span>
              </div>
              <span className="text-[9px] text-neutral-400 font-sans tracking-wide -mt-1 hidden sm:block">
                Inteligência artificial para criar mais.
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation from copy2.md: Início · Ferramentas · Preços · FAQ */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-heading font-semibold text-neutral-300 uppercase tracking-wider">
          <a href="#inicio" className="hover:text-white transition-colors">
            Início
          </a>
          <a href="#ferramentas" className="hover:text-white transition-colors">
            Ferramentas
          </a>
          <a href="#precos" className="hover:text-white transition-colors flex items-center gap-1.5">
            <span>Preços</span>
            <span className="px-1.5 py-0.5 rounded-full bg-[#FF5500]/20 text-[#FF5500] font-mono text-[9px] font-bold">
              R$ 5 • R$ 200
            </span>
          </a>
          <a href="#faq" className="hover:text-white transition-colors">
            FAQ
          </a>
        </nav>

        {/* CTA Button */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <LpCtaButton label="Começar grátis" size="sm" />
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Abrir menu"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-b border-white/10 bg-[#08090C] px-5 py-5 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-1 font-heading text-sm uppercase tracking-wider">
            <a
              href="#inicio"
              onClick={() => setMobileOpen(false)}
              className="text-neutral-300 hover:text-white py-2.5 px-3 rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors"
            >
              Início
            </a>
            <a
              href="#ferramentas"
              onClick={() => setMobileOpen(false)}
              className="text-neutral-300 hover:text-white py-2.5 px-3 rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors"
            >
              Ferramentas
            </a>
            <a
              href="#precos"
              onClick={() => setMobileOpen(false)}
              className="text-[#FF5500] font-bold py-2.5 px-3 rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors flex items-center justify-between"
            >
              <span>Preços</span>
              <span className="px-2 py-0.5 rounded-full bg-[#FF5500]/20 text-[#FF5500] font-mono text-[10px]">
                R$ 5 • R$ 200
              </span>
            </a>
            <a
              href="#faq"
              onClick={() => setMobileOpen(false)}
              className="text-neutral-300 hover:text-white py-2.5 px-3 rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors"
            >
              FAQ (Dúvidas)
            </a>
          </div>

          <div className="pt-3 border-t border-white/10">
            <LpCtaButton label="Começar grátis" size="default" className="w-full" />
          </div>
        </div>
      )}
    </header>
  );
}
