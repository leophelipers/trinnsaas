"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Loader2, Sparkles } from "lucide-react";

export function PreLaunchGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const user = useQuery(api.users.current);
  const flags = useQuery(api.featureFlags.getPublicFeatureFlags);
  const syncUser = useMutation(api.users.syncUser);
  const syncedRef = useRef(false);

  // Sincroniza automaticamente novos usuários autenticados (incluindo dados preenchidos na LP de pré-lançamento)
  useEffect(() => {
    if (
      !isLoading &&
      isAuthenticated &&
      user !== undefined &&
      (user === null || (!user.emailConfirmed && !user.emailVerificationCode)) &&
      !syncedRef.current
    ) {
      syncedRef.current = true;
      let storedLead: { name?: string; whatsapp?: string; tag?: string } = {};
      try {
        const raw = localStorage.getItem("kriativa_prelaunch_lead");
        if (raw) {
          storedLead = JSON.parse(raw);
        }
        const savedName = localStorage.getItem("kriativa_prelaunch_name");
        const savedWhatsapp = localStorage.getItem("kriativa_prelaunch_whatsapp");
        if (savedName && !storedLead.name) storedLead.name = savedName;
        if (savedWhatsapp && !storedLead.whatsapp) storedLead.whatsapp = savedWhatsapp;
      } catch {
        // ignore
      }

      syncUser({
        tag: storedLead.tag || "pre_lancamento",
        whatsapp: storedLead.whatsapp,
        nameOverride: storedLead.name,
      }).catch((err) => {
        console.error("Erro ao sincronizar usuário de pré-lançamento:", err);
      });
    }
  }, [isLoading, isAuthenticated, user, syncUser]);

  const isPreLaunchModeEnabled = flags ? flags.pre_launch_mode !== false : true;

  const hasPreLaunchTag = Boolean(
    user &&
      (user.isPreLaunch === true ||
        user.tags?.includes("pre_lancamento") ||
        user.tags?.includes("pré-lançamento"))
  );

  const isRestrictedUser = Boolean(
    !isLoading &&
      isAuthenticated &&
      user &&
      hasPreLaunchTag &&
      user.role !== "admin" &&
      isPreLaunchModeEnabled
  );

  useEffect(() => {
    if (isRestrictedUser && pathname !== "/pre-lancamento") {
      router.replace("/pre-lancamento");
    }
  }, [isRestrictedUser, pathname, router]);

  // Bloqueia visualmente qualquer outra rota enquanto redireciona para /pre-lancamento
  if (isRestrictedUser && pathname !== "/pre-lancamento") {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#050507] flex flex-col items-center justify-center p-6 text-center">
        <div className="size-12 rounded-2xl bg-white/[0.04] border border-white/[0.12] flex items-center justify-center text-zinc-200 mb-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.16)]">
          <Loader2 className="size-5 animate-spin" />
        </div>
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-200 font-medium flex items-center gap-1.5">
          <Sparkles className="size-3.5" />
          Pré-Lançamento Oficial
        </p>
        <p className="text-sm text-zinc-500 font-sans mt-1">
          Redirecionando para sua página do pré-lançamento...
        </p>
      </div>
    );
  }

  return null;
}
