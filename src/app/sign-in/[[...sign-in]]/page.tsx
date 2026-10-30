"use client";

import { Suspense } from "react";
import { SignIn } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { PRE_LAUNCH_CLERK_APPEARANCE } from "@/lib/clerk/prelaunch-modal";

function SignInContent() {
  const searchParams = useSearchParams();
  const flags = useQuery(api.featureFlags.getPublicFeatureFlags);

  const isPreLaunchMode = flags ? flags.pre_launch_mode !== false : true;
  const isPreLaunch =
    searchParams.get("redirect_url") === "/pre-lancamento" || isPreLaunchMode;

  const targetSignInUrl = isPreLaunch ? "/pre-lancamento" : "/dashboard";
  const targetSignUpUrl = isPreLaunch ? "/pre-lancamento" : "/onboarding";

  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn
        fallbackRedirectUrl={targetSignInUrl}
        forceRedirectUrl={isPreLaunch ? "/pre-lancamento" : undefined}
        signUpFallbackRedirectUrl={targetSignUpUrl}
        signUpForceRedirectUrl={isPreLaunch ? "/pre-lancamento" : undefined}
        appearance={isPreLaunch ? PRE_LAUNCH_CLERK_APPEARANCE : undefined}
      />
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInContent />
    </Suspense>
  );
}
