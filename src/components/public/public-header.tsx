"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthNavControls } from "@/components/auth-showcase";
import { Badge } from "@/components/ui/badge";
import { Menu, X, Sparkles, ArrowRight, Film } from "lucide-react";

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#050506]/90 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="size-9 rounded-xl bg-gradient-to-br from-[#FF5500] via-[#FF4500] to-[#CC3700] text-white flex items-center justify-center font-heading font-black text-sm shadow-[0_0_20px_rgba(255,85,0,0.4)] border border-white/20 group-hover:scale-105 transition-transform">
              K
            </div>
            <div className="flex items-baseline">
              <span className="font-heading font-extrabold text-xl tracking-tight text-white uppercase">
                kriativa
              </span>
              <span className="font-mono text-sm text-[#FF5500] font-bold">
                .app
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-heading font-medium text-muted-foreground uppercase tracking-wider">
          <Link
            href="/recursos"
            className="hover:text-white transition-colors"
          >
            Recursos
          </Link>
          <Link
            href="/#ofertas"
            className="hover:text-white transition-colors flex items-center gap-1.5"
          >
            <span>Ofertas</span>
            <span className="px-1.5 py-0.5 rounded-full bg-[#FF5500]/20 text-[#FF5500] font-mono text-[9px] font-bold">
              R$ 5 • R$ 200
            </span>
          </Link>
          <Link
            href="/#roadmap"
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            <span>Roadmap</span>
          </Link>
          <Link
            href="/precos"
            className="hover:text-white transition-colors"
          >
            Planos
          </Link>
          <Link
            href="/comparativo"
            className="hover:text-white transition-colors flex items-center gap-1.5"
          >
            <span>Comparativo</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#FF5500]/20 text-[#FF5500] font-mono text-[9px] font-bold">
              GEO
            </span>
          </Link>
          <Link
            href="/sobre"
            className="hover:text-white transition-colors"
          >
            Manifesto
          </Link>
        </nav>

        {/* Auth Controls & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <AuthNavControls />
          
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Abrir menu de navegação"
          >
            {mobileMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-[#08090C] px-4 py-5 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-1 font-heading text-sm uppercase tracking-wider">
            <Link
              href="/recursos"
              onClick={() => setMobileMenuOpen(false)}
              className="text-muted-foreground hover:text-white py-2.5 px-3 rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors"
            >
              Recursos
            </Link>
            <Link
              href="/#ofertas"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#FF5500] font-bold py-2.5 px-3 rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors flex items-center justify-between"
            >
              <span>Ofertas Especiais</span>
              <span className="px-2 py-0.5 rounded-full bg-[#FF5500]/20 text-[#FF5500] font-mono text-[10px] font-bold">
                R$ 5 • R$ 200
              </span>
            </Link>
            <Link
              href="/#roadmap"
              onClick={() => setMobileMenuOpen(false)}
              className="text-muted-foreground hover:text-white py-2.5 px-3 rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors"
            >
              Roadmap
            </Link>
            <Link
              href="/precos"
              onClick={() => setMobileMenuOpen(false)}
              className="text-muted-foreground hover:text-white py-2.5 px-3 rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors"
            >
              Planos & Créditos
            </Link>
            <Link
              href="/comparativo"
              onClick={() => setMobileMenuOpen(false)}
              className="text-muted-foreground hover:text-white py-2.5 px-3 rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors flex items-center justify-between"
            >
              <span>Comparativo de IAs</span>
              <span className="px-2 py-0.5 rounded-full bg-[#FF5500]/20 text-[#FF5500] font-mono text-[10px] font-bold">
                2026
              </span>
            </Link>
            <Link
              href="/sobre"
              onClick={() => setMobileMenuOpen(false)}
              className="text-muted-foreground hover:text-white py-2.5 px-3 rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors"
            >
              Manifesto Brasileiro
            </Link>
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 min-h-[44px] rounded-xl font-heading font-bold text-xs bg-[#FF5500] text-white flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,85,0,0.35)] active:scale-95"
            >
              <span>Acessar Plataforma</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
