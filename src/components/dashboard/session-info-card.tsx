"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck, UserCheck, Film, ArrowRight } from "lucide-react";

export function SessionInfoCard() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <Card className="bg-[#0C0D12]/90 border border-white/10">
        <CardHeader>
          <Skeleton className="h-5 w-40 bg-white/5" />
          <Skeleton className="h-4 w-60 bg-white/5" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-8 w-full bg-white/5" />
          <Skeleton className="h-8 w-full bg-white/5" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#0C0D12]/90 border border-white/10 shadow-2xl backdrop-blur-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="size-5 text-[#FF5500]" />
            <CardTitle className="font-heading text-base uppercase text-white">
              Ambiente de Criação
            </CardTitle>
          </div>
          <Badge
            variant="outline"
            className="text-[10px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10 font-mono"
          >
            PRONTO
          </Badge>
        </div>
        <CardDescription className="text-neutral-400 text-xs">
          Parâmetros do seu perfil ativo no estúdio de vídeo.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 text-xs">
        <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-neutral-400 font-medium flex items-center gap-1.5">
              <UserCheck className="size-3.5 text-[#FF5500]" />
              Diretor:
            </span>
            <span className="font-heading font-bold text-white">
              {user?.fullName || user?.firstName || "Criador"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-neutral-400 font-medium">E-mail:</span>
            <span className="font-mono text-[11px] text-neutral-300">
              {user?.primaryEmailAddress?.emailAddress}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-neutral-400 font-medium">Modo de Vídeo:</span>
            <span className="font-mono text-[11px] text-[#00E5FF]">
              1080p Cinema Widescreen
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-neutral-400 font-medium">Segurança:</span>
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <ShieldCheck className="size-3.5" />
              Sessão Protegida
            </span>
          </div>
        </div>

        <Link
          href="/dashboard/profile"
          className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-neutral-300 hover:text-white transition-all group cursor-pointer"
        >
          <span>Ajustar preferências de estúdio</span>
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1 text-[#FF5500]" />
        </Link>
      </CardContent>
    </Card>
  );
}
