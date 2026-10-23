"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function OnboardingGuard() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const user = useQuery(api.users.current);
  const flags = useQuery(api.featureFlags.getPublicFeatureFlags);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user !== undefined && user !== null) {
      const hasPreLaunchTag =
        user.isPreLaunch === true ||
        user.tags?.includes("pre_lancamento") ||
        user.tags?.includes("pré-lançamento");

      // Se o usuário tiver a tag pre_lancamento (e não for admin), só pode ver /pre-lancamento
      if (hasPreLaunchTag && user.role !== "admin" && flags?.pre_launch_mode !== false) {
        router.replace("/pre-lancamento");
        return;
      }

      // Se o feature flag de onboarding estiver desativado pelo admin, não redireciona
      if (flags && flags.user_onboarding_wizard === false) {
        return;
      }

      if (user.onboardingCompleted !== true) {
        router.replace("/onboarding");
      }
    }
  }, [isLoading, isAuthenticated, user, flags, router]);

  return null;
}
