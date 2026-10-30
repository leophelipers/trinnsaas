"use client";

import { Suspense } from "react";
import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { PRE_LAUNCH_CLERK_APPEARANCE } from "@/lib/clerk/prelaunch-modal";

function SignUpContent() {
  const searchParams = useSearchParams();
  const flags = useQuery(api.featureFlags.getPublicFeatureFlags);

  // Se a flag pre_launch_mode estiver ativa (ou ainda carregando) ou o redirect_url for /pre-lancamento
  const isPreLaunchMode = flags ? flags.pre_launch_mode !== false : true;
  const isPreLaunch =
    searchParams.get("redirect_url") === "/pre-lancamento" || isPreLaunchMode;

  const targetSignUpUrl = isPreLaunch ? "/pre-lancamento" : "/onboarding";
  const targetSignInUrl = isPreLaunch ? "/pre-lancamento" : "/dashboard";

  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp
        fallbackRedirectUrl={targetSignUpUrl}
        forceRedirectUrl={targetSignUpUrl}
        signInFallbackRedirectUrl={targetSignInUrl}
        signInForceRedirectUrl={targetSignInUrl}
        appearance={isPreLaunch ? PRE_LAUNCH_CLERK_APPEARANCE : undefined}
      />
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpContent />
    </Suspense>
  );
}
