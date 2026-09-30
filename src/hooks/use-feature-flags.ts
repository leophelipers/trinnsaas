"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

/**
 * Hook padronizado para consumo e verificação em tempo real de Feature Flags no frontend.
 * Garante reatividade instantânea via subscrição websocket do Convex sem recarregar a página.
 */
export function useFeatureFlags() {
  const flags = useQuery(api.featureFlags.getPublicFeatureFlags);
  const isLoading = flags === undefined;

  /**
   * Verifica se uma feature flag específica está ativa.
   * Se os dados ainda estiverem carregando, utiliza o fallback informado (padrão true).
   */
  const isEnabled = (key: string, fallback = true): boolean => {
    if (!flags) return fallback;
    if (flags.maintenance_mode && key !== "maintenance_mode") {
      return false;
    }
    return flags[key] !== undefined ? flags[key] : fallback;
  };

  const isMaintenanceMode = Boolean(flags?.maintenance_mode);

  return {
    flags: flags || {},
    isEnabled,
    isMaintenanceMode,
    isLoading,
  };
}

/**
 * Hook de conveniência para checar uma única feature flag
 */
export function useFeatureFlag(key: string, fallback = true): boolean {
  const { isEnabled } = useFeatureFlags();
  return isEnabled(key, fallback);
}
