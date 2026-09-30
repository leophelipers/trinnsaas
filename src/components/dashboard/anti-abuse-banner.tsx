"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getDeviceFingerprint } from "@/lib/fingerprint";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShieldCheck,
  Coins,
  ArrowUpRight,
  Sparkles,
  Film,
  Zap,
} from "lucide-react";

export function AntiAbuseBanner() {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const planStatus = useQuery(api.antiAbuse.getPlanStatus);
  const claimFreePlan = useMutation(api.antiAbuse.claimFreePlan);

  const [isClaiming, setIsClaiming] = useState(false);
  const hasClaimedRef = useRef(false);

  // Ativação silenciosa da cota gratuita sem expor regras internas ao usuário
  useEffect(() => {
    if (!isAuthenticated || isAuthLoading || !planStatus || hasClaimedRef.current) {
      return;
    }

    if (planStatus.status === "not_claimed") {
      hasClaimedRef.current = true;
      setIsClaiming(true);

      getDeviceFingerprint()
        .then((deviceId) => claimFreePlan({ deviceId }))
        .catch((err) => {
          console.error("Falha ao registrar cota do plano gratuito:", err);
        })
        .finally(() => {
          setIsClaiming(false);
        });
    }
  }, [isAuthenticated, isAuthLoading, planStatus, claimFreePlan]);

  if (planStatus === undefined || planStatus === null || isClaiming) {
    return (
      <Card className="border-white/10 bg-[#0C0D12]/60">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="size-8 rounded-lg bg-white/5" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-44 bg-white/5" />
              <Skeleton className="h-3 w-64 bg-white/5" />
            </div>
          </div>
          <Skeleton className="h-8 w-24 rounded-md bg-white/5" />
        </CardContent>
      </Card>
    );
  }

  // CASO 1: COTA ESGOTADA OU AMBIENTE LIMITADO
  if (planStatus.status === "blocked") {
    return (
      <Card className="border-rose-500/30 bg-rose-500/10 shadow-lg">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-rose-500/20 text-rose-400 border border-rose-500/30 font-mono text-[10px] uppercase">
                COTA GRATUITA ATINGIDA
              </Badge>
            </div>
            <h4 className="text-sm font-heading font-bold text-white uppercase">
              Limite de Criações do Plano Demonstrativo
            </h4>
            <p className="text-xs text-neutral-400 max-w-xl">
              A cota de testes para este ambiente já foi resgatada. Faça upgrade para o plano Pro para gerar vídeos em 4K sem limites de renderização.
            </p>
          </div>

          <Button className="bg-[#FF5500] hover:bg-[#FF5500]/90 text-white font-heading font-bold text-xs uppercase px-5 h-9 rounded-xl shadow-[0_0_20px_rgba(255,85,0,0.3)] shrink-0 cursor-pointer">
            Fazer Upgrade para o Pro
            <ArrowUpRight className="size-3.5" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  // CASO 2: COTA ATIVA E DISPONÍVEL
  const creditsRemaining = planStatus.creditsRemaining ?? 50;
  const creditsTotal = planStatus.creditsTotal ?? 50;
  const percentage = Math.round((creditsRemaining / creditsTotal) * 100);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-[#0C0D12] via-[#090A0E] to-[#050506] p-4 sm:p-5 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side: Status */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-[#FF5500]/15 text-[#FF5500] border border-[#FF5500]/30 shrink-0">
            <Sparkles className="size-5" />
          </div>

          <div className="space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-heading font-bold text-sm text-white uppercase tracking-tight">
                Estúdio de Vídeo Liberado
              </span>
              <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono text-[9px] uppercase px-2 py-0">
                PLANO FREE CREATOR
              </Badge>
            </div>
            <p className="text-xs text-neutral-400 font-sans">
              Pronto para gerar cenas cinematográficas com controle de câmera e movimentos fluidos.
            </p>
          </div>
        </div>

        {/* Right Side: Credits HUD */}
        <div className="flex items-center gap-4 self-end md:self-auto shrink-0">
          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5">
              <Coins className="size-4 text-[#FF5500]" />
              <span className="text-sm font-heading font-black text-white">
                {creditsRemaining}
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                / {creditsTotal} créditos
              </span>
            </div>
            <div className="w-32 h-1.5 bg-white/10 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#FF5500] to-[#E04B00] rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          <div className="h-8 w-px bg-white/10 hidden sm:block" />

          <div className="hidden sm:flex flex-col text-[11px] font-mono text-neutral-400">
            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
              <Zap className="size-3" />
              Motor Ativo
            </span>
            <span>24fps Cinema</span>
          </div>
        </div>
      </div>
    </div>
  );
}
