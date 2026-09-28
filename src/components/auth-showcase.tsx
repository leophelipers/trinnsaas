"use client";

import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, ArrowRight } from "lucide-react";

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
        <Button size="lg" className="gap-2">
          Sessão Conectada ao Convex
          <CheckCircle2 className="size-4" />
        </Button>
      </Authenticated>
    </>
  );
}
