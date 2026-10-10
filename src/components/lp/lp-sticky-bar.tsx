"use client";

import React, { useState, useEffect } from "react";
import { LpCtaButton } from "./lp-cta-button";

export function LpStickyBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-3 bg-[#050507]/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom duration-300"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0.75rem))" }}
    >
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        <div className="flex flex-col min-w-0">
          <span className="font-heading font-black text-xs text-white uppercase tracking-tight truncate">
            Kriativa.app
          </span>
          <span className="text-[10px] text-neutral-400 font-sans truncate">
            A partir de R$ 5 ou R$ 200/mês
          </span>
        </div>

        <div className="shrink-0">
          <LpCtaButton label="COMEÇAR GRÁTIS" size="sm" />
        </div>
      </div>
    </div>
  );
}
