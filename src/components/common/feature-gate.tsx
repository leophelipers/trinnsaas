"use client";

import React from "react";
import { useFeatureFlag, useFeatureFlags } from "@/hooks/use-feature-flags";
import { AlertCircle, Wrench } from "lucide-react";

interface FeatureGateProps {
  flag: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showNotice?: boolean;
  noticeTitle?: string;
  noticeMessage?: string;
}

/**
 * Componente padrão do kriativa.app para isolamento e proteção visual de features.
 * Quando a flag associada estiver desativada pelo administrador, renderiza o fallback
 * ou um banner amigável de manutenção.
 */
export function FeatureGate({
  flag,
  children,
  fallback,
  showNotice = false,
  noticeTitle,
  noticeMessage,
}: FeatureGateProps) {
  const { isEnabled, isMaintenanceMode, isLoading } = useFeatureFlags();
  const enabled = isEnabled(flag);

  if (isLoading) {
    // Durante o primeiro carregamento, renderiza os filhos sem causar flash
    return <>{children}</>;
  }

  if (enabled) {
    return <>{children}</>;
  }

  if (fallback !== undefined) {
    return <>{fallback}</>;
  }

  if (showNotice) {
    return (
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-start gap-3 backdrop-blur-xl">
        {isMaintenanceMode ? (
          <Wrench className="size-5 text-amber-400 shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="size-5 text-amber-400 shrink-0 mt-0.5" />
        )}
        <div className="space-y-1">
          <p className="text-xs font-heading font-bold uppercase tracking-wider text-white">
            {noticeTitle || (isMaintenanceMode ? "Estúdio em Manutenção" : "Recurso em Atualização")}
          </p>
          <p className="text-xs text-neutral-300">
            {noticeMessage ||
              (isMaintenanceMode
                ? "Esta área está temporariamente pausada para uma manutenção técnica preventiva."
                : "Este recurso está temporariamente desativado para melhorias pela administração.")}
          </p>
        </div>
      </div>
    );
  }

  return null;
}
