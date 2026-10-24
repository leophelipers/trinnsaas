"use client";

import { Suspense } from "react";
import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { PRE_LAUNCH_CLERK_APPEARANCE } from "@/lib/clerk/prelaunch-modal";

function SignUpContent() {
  const searchParams = useSearchParams();
  const isPreLaunch = searchParams.get("redirect_url") === "/pre-lancamento";

  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp
        fallbackRedirectUrl="/onboarding"
        signInFallbackRedirectUrl="/dashboard"
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
