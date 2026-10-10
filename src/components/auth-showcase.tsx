"use client";

import Link from "next/link";
import { Authenticated, Unauthenticated, AuthLoading, useQuery } from "convex/react";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, ArrowRight, UserCheck, Lock, Sparkles } from "lucide-react";
import { api } from "../../convex/_generated/api";

export function AuthNavControls() {
  return (
    <>
      <AuthLoading>
        <Skeleton className="h-8 w-20 rounded-md" />
      </AuthLoading>
      <Unauthenticated>
        <SignInButton mode="modal">
          <Button variant="ghost" size="sm" className="text-xs text-white/80 hover:text-white">
            Entrar
          </Button>
        </SignInButton>
        <SignUpButton mode="modal" fallbackRedirectUrl="/onboarding" signInFallbackRedirectUrl="/dashboard">
          <Button
            size="sm"
            className="text-xs bg-[#FF5500] text-white font-bold hover:bg-[#ff681a] border-none shadow-[0_0_15px_rgba(255,85,0,0.35)]"
          >
            Cadastrar
          </Button>
        </SignUpButton>
      </Unauthenticated>
      <Authenticated>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className={buttonVariants({
              size: "sm",
              className:
                "gap-1.5 text-xs bg-[#FF5500] text-white font-bold hover:bg-[#ff681a] border-none shadow-[0_0_15px_rgba(255,85,0,0.35)] font-heading",
            })}
          >
            <span>Studio</span>
            <ArrowRight className="size-3.5" />
          </Link>
          <UserButton />
        </div>
      </Authenticated>
    </>
  );
}

export function CurrentUserProfile() {
  const user = useQuery(api.users.current);

  if (user === undefined) {
    return (
      <div className="mt-4 flex flex-col gap-2 p-4 rounded-lg border border-white/10 bg-[#0C0D12]/80">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-64" />
      </div>
    );
  }

  if (user === null) {
    return (
      <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-400">
        Sessão autenticada. Entre no <strong>Studio</strong> para resgatar sua cota gratuita de 50 créditos.
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-left text-xs max-w-md mx-auto">
      <div className="flex items-center gap-2 font-semibold text-emerald-400 mb-2">
        <UserCheck className="size-4" />
        Criador autenticado no Convex:
      </div>
      <div className="space-y-1.5 text-muted-foreground font-mono">
        <div><span className="text-white font-sans font-medium">Nome:</span> {user.name || "Criador"}</div>
        <div><span className="text-white font-sans font-medium">Email:</span> {user.email}</div>
        <div className="truncate"><span className="text-white font-sans font-medium">Convex ID:</span> {user._id}</div>
      </div>
    </div>
  );
}

export function AuthHeroActions() {
  return (
    <>
      <AuthLoading>
        <Skeleton className="h-11 w-44 rounded-xl" />
      </AuthLoading>
      <Unauthenticated>
        <div className="flex flex-wrap justify-center gap-3">
          <SignUpButton mode="modal" fallbackRedirectUrl="/onboarding" signInFallbackRedirectUrl="/dashboard">
            <button
              type="button"
              className="px-7 py-3 rounded-xl font-heading font-bold text-sm bg-[#FF5500] text-white hover:bg-[#ff681a] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_30px_rgba(255,85,0,0.45)]"
            >
              <Sparkles className="size-4 fill-white" />
              <span>Criar Conta & Ganhar 50 Créditos</span>
              <ArrowRight className="size-4" />
            </button>
          </SignUpButton>
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-xl font-medium text-sm border border-white/15 bg-white/5 hover:bg-white/10 text-white transition-colors flex items-center gap-2"
          >
            <span>Ver Studio Protegido</span>
            <Lock className="size-4 text-white/50" />
          </Link>
        </div>
      </Unauthenticated>
      <Authenticated>
        <div className="flex flex-col items-center gap-3">
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/dashboard"
              className="px-8 py-3 rounded-xl font-heading font-bold text-sm bg-[#FF5500] text-white hover:bg-[#ff681a] active:scale-[0.98] transition-all flex items-center gap-2 shadow-[0_0_30px_rgba(255,85,0,0.45)]"
            >
              <span>Abrir Studio de Criação (Dashboard)</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <CurrentUserProfile />
        </div>
      </Authenticated>
    </>
  );
}
