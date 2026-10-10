"use client";

import React from "react";
import Link from "next/link";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { SignUpButton } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Sparkles } from "lucide-react";

interface LpCtaButtonProps {
  label?: string;
  size?: "default" | "large" | "sm";
  variant?: "primary" | "secondary" | "outline";
  showMicrocopy?: boolean;
  className?: string;
}

export function LpCtaButton({
  label = "COMEÇAR GRÁTIS →",
  size = "default",
  variant = "primary",
  showMicrocopy = false,
  className = "",
}: LpCtaButtonProps) {
  const sizeClasses = {
    sm: "px-4 py-2.5 sm:px-5 sm:py-2.5 text-xs rounded-xl min-h-[44px]",
    default: "w-full sm:w-auto px-7 py-3.5 sm:px-8 sm:py-4 text-xs sm:text-sm rounded-2xl min-h-[48px]",
    large: "w-full sm:w-auto px-8 py-3.5 sm:px-10 sm:py-4 text-sm sm:text-base rounded-2xl min-h-[50px]",
  }[size];

  const variantClasses = {
    primary:
      "bg-gradient-to-r from-[#FF5500] via-[#FF6600] to-[#FF7700] hover:from-[#ff6600] hover:to-[#ff8800] text-white shadow-[0_0_35px_rgba(255,85,0,0.4)]",
    secondary:
      "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_30px_rgba(16,185,129,0.3)]",
    outline:
      "bg-white/5 hover:bg-white/10 text-white border border-white/15",
  }[variant];

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <AuthLoading>
        <Skeleton className="h-12 w-48 rounded-2xl" />
      </AuthLoading>

      <Unauthenticated>
        <SignUpButton mode="modal">
          <button
            type="button"
            className={`${sizeClasses} ${variantClasses} font-heading font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]`}
          >
            <Sparkles className="size-4 shrink-0 fill-current" />
            <span>{label}</span>
          </button>
        </SignUpButton>
        {showMicrocopy && (
          <span className="text-[11px] sm:text-xs text-neutral-400 font-sans mt-1">
            Cadastro gratuito. Sem cartão de crédito.
          </span>
        )}
      </Unauthenticated>

      <Authenticated>
        <Link
          href="/dashboard"
          className={`${sizeClasses} ${variantClasses} font-heading font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98]`}
        >
          <Sparkles className="size-4 shrink-0 fill-current" />
          <span>ACESSAR PLATAFORMA →</span>
        </Link>
      </Authenticated>
    </div>
  );
}
