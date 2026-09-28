"use client";

import { Authenticated, Unauthenticated, AuthLoading, useQuery } from "convex/react";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, ArrowRight, UserCheck } from "lucide-react";
import { api } from "../../convex/_generated/api";

export function AuthNavControls() {
  return (
    <>
      <AuthLoading>
        <Skeleton className="h-8 w-20 rounded-md" />
      </AuthLoading>
      <Unauthenticated>
        <SignInButton mode="modal">
          <Button variant="ghost" size="sm">
            Entrar
          </Button>
        </SignInButton>
        <SignUpButton mode="modal">
          <Button size="sm">Cadastrar</Button>
        </SignUpButton>
      </Unauthenticated>
      <Authenticated>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Autenticado no Convex
          </span>
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
      <div className="mt-4 flex flex-col gap-2 p-4 rounded-lg border border-border bg-muted/30">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-64" />
      </div>
    );
  }

  if (user === null) {
    return (
      <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
        Aguardando evento de sincronização do Webhook na tabela <code>users</code>...
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-left text-xs max-w-md mx-auto">
      <div className="flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
        <UserCheck className="size-4" />
        Sincronizado na tabela `users` do Convex:
      </div>
      <div className="space-y-1.5 text-muted-foreground font-mono">
        <div><span className="text-foreground font-sans font-medium">Nome:</span> {user.name || "Sem nome"}</div>
        <div><span className="text-foreground font-sans font-medium">Email:</span> {user.email}</div>
        <div className="truncate"><span className="text-foreground font-sans font-medium">Clerk ID:</span> {user.clerkId}</div>
        <div className="truncate"><span className="text-foreground font-sans font-medium">Convex ID:</span> {user._id}</div>
      </div>
    </div>
  );
}

export function AuthHeroActions() {
  return (
    <>
      <AuthLoading>
        <Skeleton className="h-10 w-36 rounded-md" />
      </AuthLoading>
      <Unauthenticated>
        <SignUpButton mode="modal">
          <Button size="lg" className="gap-2 cursor-pointer">
            Testar Autenticação
            <ArrowRight className="size-4" />
          </Button>
        </SignUpButton>
      </Unauthenticated>
      <Authenticated>
        <div className="flex flex-col items-center">
          <Button size="lg" className="gap-2">
            Sessão Ativa no Convex
            <CheckCircle2 className="size-4" />
          </Button>
          <CurrentUserProfile />
        </div>
      </Authenticated>
    </>
  );
}
