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
    // Se o feature flag de onboarding estiver desativado pelo admin, não redireciona
    if (flags && flags.user_onboarding_wizard === false) {
      return;
    }

    // Se o usuário está autenticado e já foi retornado do Convex
    if (!isLoading && isAuthenticated && user !== undefined && user !== null) {
      if (user.onboardingCompleted !== true) {
        router.replace("/onboarding");
      }
    }
  }, [isLoading, isAuthenticated, user, flags, router]);

  return null;
}
